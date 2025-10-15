import { TemplateContext } from '@/types/backend';

type TemplateFn = (ctx: TemplateContext) => string;

// Email templates
const EMAIL_TEMPLATES: Record<string, TemplateFn> = {
  attempt_1_email: (ctx) => `Subject: Request for ${ctx.documents} - Action Required

Hi ${ctx.contactName},

I hope this email finds you well. I'm reaching out regarding ${ctx.task}.

We need the following documents from you:
📄 ${ctx.documents}

Could you please provide these at your earliest convenience? This will help us move forward with the process.

If you have any questions or need clarification, please don't hesitate to reach out.

Best regards`,

  attempt_2_email: (ctx) => `Subject: Follow-up: ${ctx.documents} Still Needed

Hi ${ctx.contactName},

This is a friendly reminder about the ${ctx.documents} we requested for ${ctx.task}.

We haven't received these yet, and they're important for us to proceed. 

Please let me know if you have any questions or if there's anything blocking you from submitting these documents.

Looking forward to hearing from you soon.

Thanks!`,

  attempt_3_email: (ctx) => `Subject: ${ctx.urgency} Priority - ${ctx.documents} Required

Hi ${ctx.contactName},

I wanted to follow up once more regarding the ${ctx.documents} needed for ${ctx.task}.

This request has been marked as ${ctx.urgency} priority, and we really need these documents to move forward.

Could you please respond by end of day? If there are any blockers or issues, please let me know immediately so we can help resolve them.

I appreciate your prompt attention to this matter.

Best regards`,

  attempt_4_email: (ctx) => `Subject: FINAL REMINDER - ${ctx.documents} Required

Hi ${ctx.contactName},

This is our final reminder about the ${ctx.documents} for ${ctx.task}.

We've reached out multiple times and haven't received a response. This is marked as ${ctx.urgency} priority.

Please respond within 24 hours or we may need to escalate this matter.

If you're experiencing any difficulties, please reach out immediately.

Regards`
};

// WhatsApp templates
const WHATSAPP_TEMPLATES: Record<string, TemplateFn> = {
  attempt_1_whatsapp: (ctx) => 
    `Hi ${ctx.contactName}! 👋\n\nQuick request: We need your ${ctx.documents} for ${ctx.task}.\n\nCan you send them over when you get a chance? Thanks! 🙏`,
  
  attempt_2_whatsapp: (ctx) =>
    `Hey ${ctx.contactName}, just following up on the ${ctx.documents} we need for ${ctx.task}. Any update? 📄`,
  
  attempt_3_whatsapp: (ctx) =>
    `Hi ${ctx.contactName}, this is ${ctx.urgency} priority - we really need those ${ctx.documents}. Can you help us out today? 🙏`
};

// Call scripts
const CALL_TEMPLATES: Record<string, TemplateFn> = {
  attempt_1_call: (ctx) => 
    `CALL SCRIPT:\n\nHi ${ctx.contactName}, this is [Your Name] calling about ${ctx.task}.\n\nWe need your ${ctx.documents} to proceed. Can we discuss how to get these to us?\n\n[Listen and note response]\n\nThank you for your time.`,
  
  attempt_2_call: (ctx) =>
    `CALL SCRIPT:\n\nHi ${ctx.contactName}, I'm following up on our previous request for ${ctx.documents}.\n\nThis is marked as ${ctx.urgency} priority. Is there anything blocking you from providing these?\n\n[Listen and assist]\n\nI appreciate your help with this.`,
  
  attempt_3_call: (ctx) =>
    `CALL SCRIPT:\n\nHi ${ctx.contactName}, this is an urgent follow-up regarding ${ctx.documents} for ${ctx.task}.\n\nWe've made several attempts to reach you. This is critical for us to proceed.\n\n[Discuss urgency and next steps]\n\nLet's resolve this today if possible.`
};

// Combine all templates
const ALL_TEMPLATES: Record<string, TemplateFn> = {
  ...EMAIL_TEMPLATES,
  ...WHATSAPP_TEMPLATES,
  ...CALL_TEMPLATES
};

/**
 * Generate content based on template and context
 */
export function generateContent(
  template: string,
  context: TemplateContext
): string {
  const templateFn = ALL_TEMPLATES[template];
  
  if (!templateFn) {
    console.warn(`Template ${template} not found, using default`);
    return generateDefaultContent(context);
  }
  
  return templateFn(context);
}

/**
 * Generate default content if template not found
 */
function generateDefaultContent(context: TemplateContext): string {
  return `Hi ${context.contactName},

We need your ${context.documents} for ${context.task}.

This is attempt ${context.attemptNumber} to reach you. Please respond at your earliest convenience.

Urgency: ${context.urgency}

Thank you.`;
}

/**
 * Generate subject line for email
 */
export function generateSubject(context: TemplateContext): string {
  if (context.attemptNumber === 1) {
    return `Request for ${context.documents}`;
  } else if (context.attemptNumber === 2) {
    return `Follow-up: ${context.documents} Needed`;
  } else {
    return `${context.urgency} Priority - ${context.documents} Required`;
  }
}

/**
 * Validate template exists
 */
export function templateExists(templateName: string): boolean {
  return templateName in ALL_TEMPLATES;
}

