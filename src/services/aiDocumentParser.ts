import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

export interface ParsedDocument {
  name: string;
  description?: string;
  order: number;
}

/**
 * Parse free-form document text into structured document items using AI
 * 
 * @param documentsText - The raw text describing documents needed
 * @returns Array of parsed document items
 */
export async function parseDocumentsWithAI(documentsText: string): Promise<ParsedDocument[]> {
  try {
    console.log('🤖 Parsing documents with AI...');
    console.log('📝 Input text:', documentsText.substring(0, 100) + '...');

    const prompt = `You are a document parsing assistant. Parse the following text into individual document items.

DOCUMENT TEXT:
${documentsText}

Your task:
1. Identify each distinct document mentioned in the text
2. Extract a clear, concise name for each document (2-8 words)
3. Preserve any important details/context as description
4. Order them logically (usually the order they appear)

Return ONLY a valid JSON array in this exact format:
[
  {
    "name": "Bank Statements PDF",
    "description": "PDF format confirming bank balances at 30.09.2025",
    "order": 0
  },
  {
    "name": "Sale Invoices after Inv-5",
    "description": "Any invoices issued after Inv-5 from 12.06.2025",
    "order": 1
  }
]

Rules:
- Keep names short and descriptive
- Put detailed requirements in description
- Start order at 0
- Return valid JSON only, no markdown, no comments
- If text mentions multiple items of same type, create separate entries
- Preserve numbers, dates, and amounts exactly as written`;

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a precise document parsing assistant. Return only valid JSON arrays, no markdown formatting.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,  // Lower temperature for more consistent parsing
      max_tokens: 1000
    });

    const responseText = completion.choices[0]?.message?.content?.trim();
    
    if (!responseText) {
      throw new Error('Empty response from OpenAI');
    }

    console.log('🤖 AI Response:', responseText.substring(0, 200) + '...');

    // Clean up response - remove markdown code blocks if present
    let cleanedResponse = responseText;
    if (cleanedResponse.includes('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedResponse.includes('```')) {
      cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
    }
    cleanedResponse = cleanedResponse.trim();

    // Parse JSON
    const parsedDocs: ParsedDocument[] = JSON.parse(cleanedResponse);

    // Validate structure
    if (!Array.isArray(parsedDocs)) {
      throw new Error('AI response is not an array');
    }

    if (parsedDocs.length === 0) {
      // Fallback: create single document from entire text
      console.log('⚠️ No documents parsed, creating single item');
      return [{
        name: 'Documents Required',
        description: documentsText.substring(0, 200),
        order: 0
      }];
    }

    // Validate each document has required fields
    const validatedDocs = parsedDocs.map((doc, index) => ({
      name: doc.name || `Document ${index + 1}`,
      description: doc.description || undefined,
      order: typeof doc.order === 'number' ? doc.order : index
    }));

    console.log(`✅ Parsed ${validatedDocs.length} documents successfully`);
    validatedDocs.forEach(doc => {
      console.log(`  📄 ${doc.order}: ${doc.name}`);
    });

    return validatedDocs;

  } catch (error) {
    console.error('❌ Error parsing documents with AI:', error);
    console.log('🔄 Falling back to simple parsing...');
    
    // Fallback: Create a single document item from the entire text
    return [{
      name: 'Documents Required',
      description: documentsText.substring(0, 500),
      order: 0
    }];
  }
}

/**
 * Check if AI document parsing is available
 */
export function isDocumentParsingEnabled(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

/**
 * Simple fallback parser that splits by newlines or bullet points
 * Used when AI is not available
 */
export function parseDocumentsSimple(documentsText: string): ParsedDocument[] {
  console.log('📝 Using simple document parsing (no AI)');
  
  // Split by newlines and filter empty lines
  const lines = documentsText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length === 0) {
    return [{
      name: 'Documents Required',
      description: documentsText,
      order: 0
    }];
  }

  // If only one line, return it as single document
  if (lines.length === 1) {
    return [{
      name: documentsText.substring(0, 100),
      description: documentsText.length > 100 ? documentsText : undefined,
      order: 0
    }];
  }

  // Multiple lines - treat each as a separate document
  return lines.map((line, index) => {
    // Extract name (first 50 chars or until a colon/dash)
    const nameMatch = line.match(/^([^:–-]+)/);
    const name = nameMatch 
      ? nameMatch[1].trim().substring(0, 80) 
      : line.substring(0, 80);
    
    return {
      name,
      description: line.length > name.length ? line : undefined,
      order: index
    };
  });
}

