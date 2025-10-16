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
  name: string;
  urgency: string;
  attemptNumber: number;
  company?: string;
}

/**
 * Generate INITIAL email content (for attempts 1 and 3)
 * These start new email threads
 */
export async function generateEmailWithAI(params: EmailGenerationParams): Promise<string> {
  try {
    const prompt = `Generate ONLY the email body text for a document request.

RECIPIENT NAME: ${params.contactName}
NAME: ${params.name}
DOCUMENTS NEEDED (preserve EXACTLY as written):
${params.documents}

Instructions:
1. Start with a greeting using the ACTUAL recipient name: "Hi ${params.contactName},"
2. Brief opening line (hope this finds you well, etc)
3. State: "In reference to ${params.name}, we will require the following documents from you:"
4. List the documents EXACTLY as provided above - DO NOT change, summarize, or paraphrase ANY document text
5. Add a polite call-to-action asking them to send the documents
6. Close professionally (Best regards, Thank you, etc)

CRITICAL: Use "${params.contactName}" NOT "[Recipient's Name]" or placeholders!
CRITICAL: Copy the documents section VERBATIM - every word, number, and detail!

Tone: Professional and friendly
Length: Keep concise but include all document details

Format your response EXACTLY like this:
'''
[Your email body here]
'''

DO NOT include subject line, sender name, or signature outside the ''' markers.`;

    console.log(`🤖 Generating initial email for attempt ${params.attemptNumber}...`);

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'You are a professional email writer. Generate ONLY the email body content between \'\'\' markers. Be concise and preserve document names exactly as provided.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0,
      max_tokens: 300
    });

    let generatedContent = completion.choices[0].message.content || '';
    
    // Parse the content between ''' markers
    const match = generatedContent.match(/'''([\s\S]*?)'''/);
    if (match && match[1]) {
      generatedContent = match[1].trim();
    }
    
    console.log(`✅ Initial email generated (${generatedContent.length} chars)`);
    
    return generatedContent;

  } catch (error) {
    console.error('❌ OpenAI generation failed:', error);
    console.log('📝 Falling back to template...');
    return getFallbackContent(params);
  }
}

/**
 * Generate ESCALATED/URGENT email content (for attempt 3 only)
 * This is a new thread with more urgency after no response
 */
export async function generateEscalatedEmailWithAI(params: EmailGenerationParams): Promise<string> {
  try {
    const prompt = `Generate ONLY the email body text for an ESCALATED document request.

RECIPIENT NAME: ${params.contactName}
NAME: ${params.name}
DOCUMENTS NEEDED (preserve EXACTLY as written):
${params.documents}

CONTEXT: This is an escalated request. We have reached out before without receiving a response. This needs to be more urgent and direct while remaining professional and polite.

Instructions:
1. Start with a greeting: "Hi ${params.contactName},"
2. Opening should be more direct (not "hope this finds you well" - something more urgent)
3. State: "In reference to ${params.name}, we urgently require the following documents from you:"
4. List the documents EXACTLY as provided - DO NOT change ANY text
5. Emphasize urgency: "This is time-sensitive and we need these documents as soon as possible to proceed."
6. Offer help but be firm: "If there are any issues preventing you from providing these, please let me know immediately."
7. Close professionally

CRITICAL: Use "${params.contactName}" NOT placeholders!
CRITICAL: Copy documents VERBATIM!

Tone: Urgent and direct, but still professional and polite
Length: Keep concise but include all document details

Format your response EXACTLY like this:
'''
[Your email body here]
'''

DO NOT include subject line, sender name, or signature outside the ''' markers.`;

    console.log(`🤖 Generating escalated/urgent email for attempt ${params.attemptNumber}...`);

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'You are a professional email writer creating an escalated request. Previous attempts were ignored. Be more urgent and direct but remain professional and polite. Generate ONLY the email body between \'\'\' markers. Preserve all document details exactly.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0,
      max_tokens: 300
    });

    let generatedContent = completion.choices[0].message.content || '';
    
    // Parse the content between ''' markers
    const match = generatedContent.match(/'''([\s\S]*?)'''/);
    if (match && match[1]) {
      generatedContent = match[1].trim();
    }
    
    console.log(`✅ Escalated email generated (${generatedContent.length} chars)`);
    
    return generatedContent;

  } catch (error) {
    console.error('❌ OpenAI escalated generation failed:', error);
    console.log('📝 Falling back to template...');
    return getFallbackContent(params);
  }
}

/**
 * Generate FOLLOW-UP email content (for attempts 2 and 4) - NOT USED ANYMORE
 * Kept for backwards compatibility
 */
export async function generateFollowUpEmailWithAI(params: EmailGenerationParams): Promise<string> {
  try {
    // More urgent tone for follow-ups
    const isSecondThread = params.attemptNumber >= 3;
    const urgencyLevel = isSecondThread 
      ? 'This is urgent - we\'ve reached out before without response'
      : 'This is a gentle reminder';
    
    const prompt = `Generate ONLY a follow-up email body text. This is a REPLY to a previous email in the same thread.

RECIPIENT NAME: ${params.contactName}
ORIGINAL NAME: ${params.name}
DOCUMENTS STILL NEEDED (preserve EXACTLY as written):
${params.documents}

Context:
- This is attempt #${params.attemptNumber}
- ${urgencyLevel}
- They haven't responded to our previous email

Instructions:
1. Start with: "Hi ${params.contactName},"
2. Mention this is a follow-up: "I'm following up on my previous email regarding ${params.name}"
3. State: "We still need the following documents from you:"
4. List the documents EXACTLY as provided - DO NOT change ANY text
5. ${isSecondThread ? 'Express urgency professionally: "This is marked as high priority and we need these urgently to proceed."' : 'Politely ask: "Could you please send these when you have a moment?"'}
6. Offer help: "If there are any issues or questions, please let me know."
7. Close professionally

CRITICAL: Use "${params.contactName}" NOT placeholders!
CRITICAL: Copy documents VERBATIM!

Tone: ${isSecondThread ? 'Urgent but professional and polite' : 'Gentle reminder, still friendly'}
Length: Shorter than initial email (60-100 words)

Format your response EXACTLY like this:
'''
[Your follow-up email body here]
'''

DO NOT include subject line, "Re:", sender name, or signature outside the ''' markers.`;

    console.log(`🤖 Generating follow-up email for attempt ${params.attemptNumber}...`);

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'You are a professional email writer creating follow-up messages. Be more direct than initial emails but remain polite. Generate ONLY the email body between \'\'\' markers.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0,
      max_tokens: 250
    });

    let generatedContent = completion.choices[0].message.content || '';
    
    // Parse the content between ''' markers
    const match = generatedContent.match(/'''([\s\S]*?)'''/);
    if (match && match[1]) {
      generatedContent = match[1].trim();
    }
    
    console.log(`✅ Follow-up email generated (${generatedContent.length} chars)`);
    
    return generatedContent;

  } catch (error) {
    console.error('❌ OpenAI follow-up generation failed:', error);
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
    name: params.name,
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

