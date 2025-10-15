import OpenAI from 'openai';
import { generateContent } from './contentGenerator';
import { TemplateContext } from '@/types/backend';

// Lazy-load OpenAI client to ensure env vars are loaded first
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  return openaiClient;
}

interface EmailGenerationParams {
  contactName: string;
  documents: string;
  task: string;
  urgency: string;
  attemptNumber: number;
  company?: string;
}

/**
 * Generate email content using OpenAI
 */
export async function generateEmailWithAI(params: EmailGenerationParams): Promise<string> {
  try {
    // Determine tone based on attempt number
    const tone = params.attemptNumber === 1 
      ? 'friendly and welcoming' 
      : params.attemptNumber === 2 
      ? 'polite but firm' 
      : 'urgent and direct';
    
    const prompt = `Generate ONLY the email body text for a document request.

RECIPIENT NAME: ${params.contactName}
TASK: ${params.task}
DOCUMENTS NEEDED (preserve EXACTLY as written):
${params.documents}

Instructions:
1. Start with a greeting using the ACTUAL recipient name: "Hi ${params.contactName},"
2. Brief opening line (hope this finds you well, etc)
3. State: "In reference to ${params.task}, we will require the following documents from you:"
4. List the documents EXACTLY as provided above - DO NOT change, summarize, or paraphrase ANY document text
5. Add a ${tone} call-to-action asking them to send the documents
6. Close professionally (Best regards, Thank you, etc)

CRITICAL: Use "${params.contactName}" NOT "[Recipient's Name]" or placeholders!
CRITICAL: Copy the documents section VERBATIM - every word, number, and detail!

Tone: ${tone}
Length: Keep concise but include all document details

Format your response EXACTLY like this:
'''
[Your email body here]
'''

DO NOT include subject line, sender name, or signature outside the ''' markers.`;

    console.log(`🤖 Generating AI email for attempt ${params.attemptNumber}...`);

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Fast and cost-effective
      messages: [
        { 
          role: 'system', 
          content: 'You are a professional email writer. Generate ONLY the email body content between \'\'\' markers. Be concise and preserve document names exactly as provided.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0, // Lower for more consistency
      max_tokens: 300
    });

    let generatedContent = completion.choices[0].message.content || '';
    
    // Parse the content between ''' markers
    const match = generatedContent.match(/'''([\s\S]*?)'''/);
    if (match && match[1]) {
      generatedContent = match[1].trim();
    }
    
    console.log(`✅ AI email generated (${generatedContent.length} chars)`);
    
    return generatedContent;

  } catch (error) {
    console.error('❌ OpenAI generation failed:', error);
    // Fallback to template if AI fails
    console.log('📝 Falling back to template...');
    return getFallbackContent(params);
  }
}

/**
 * Generate subject line using AI
 */
export async function generateSubjectWithAI(params: EmailGenerationParams): Promise<string> {
  try {
    const prompt = `Create a concise, professional email subject line for requesting ${params.documents}.
    
Attempt: ${params.attemptNumber}
Urgency: ${params.urgency}

Make it attention-grabbing but professional. Return ONLY the subject line, no quotes.`;

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Generate clear, action-oriented email subject lines.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 50
    });

    return completion.choices[0].message.content?.trim() || getFallbackSubject(params);

  } catch (error) {
    console.error('❌ AI subject generation failed:', error);
    return getFallbackSubject(params);
  }
}

/**
 * Tone guidance based on attempt number
 */
function getToneGuidance(attemptNumber: number, urgency: string): string {
  if (attemptNumber === 1) {
    return '- First contact: Be friendly and helpful\n- Offer assistance if they have questions';
  } else if (attemptNumber === 2) {
    return '- Follow-up: Be polite but add a sense of importance\n- Mention you\'ve reached out before';
  } else if (attemptNumber === 3) {
    return `- Third attempt: Be firm but professional\n- Emphasize the ${urgency} urgency\n- Ask if there are any blockers`;
  } else {
    return '- Final attempt: Be direct and set clear deadline\n- Mention this is the final reminder\n- Offer to help resolve any issues';
  }
}

/**
 * Fallback to template-based content if AI fails
 */
function getFallbackContent(params: EmailGenerationParams): string {
  const templateContext: TemplateContext = {
    contactName: params.contactName,
    documents: params.documents,
    task: params.task,
    attemptNumber: params.attemptNumber,
    urgency: params.urgency
  };
  
  return generateContent(`attempt_${params.attemptNumber}_email`, templateContext);
}

/**
 * Fallback subject line
 */
function getFallbackSubject(params: EmailGenerationParams): string {
  if (params.attemptNumber === 1) {
    return `Request for ${params.documents}`;
  } else if (params.attemptNumber === 2) {
    return `Follow-up: ${params.documents} Needed`;
  } else {
    return `${params.urgency} Priority - ${params.documents} Required`;
  }
}

/**
 * Check if OpenAI is configured
 */
export function isAIEnabled(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

/**
 * Get AI usage stats (for monitoring costs)
 */
export async function getAIUsageStats() {
  // This would track tokens used, costs, etc.
  // For now, just return enabled status
  return {
    enabled: isAIEnabled(),
    model: 'gpt-4o-mini',
    estimatedCostPerEmail: 0.0001 // ~$0.0001 per email
  };
}

