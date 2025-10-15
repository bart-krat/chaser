// Simple subject line generator for follow-up emails

/**
 * Generate subject for initial emails (1 & 3)
 */
export function getInitialSubject(documents: string, attemptNumber: number): string {
  // Extract first few words of documents for subject
  const docPreview = documents.split('\n')[0].substring(0, 50);
  
  if (attemptNumber === 1) {
    return `Document Requirements - ${docPreview}`;
  } else {
    // Email 3 - more urgent
    return `URGENT: Document Requirements - ${docPreview}`;
  }
}

/**
 * Generate subject for follow-up emails (2 & 4)
 * These use "Re:" to stay in the same thread
 */
export function getFollowUpSubject(originalSubject: string, firstName: string): string {
  return `Re: ${originalSubject}`;
}

/**
 * Extract first name from full name or email
 */
export function extractFirstName(nameOrEmail: string): string {
  // If it's an email, get the part before @
  if (nameOrEmail.includes('@')) {
    return nameOrEmail.split('@')[0].split('.')[0];
  }
  // If it's a name, get the first word
  return nameOrEmail.split(' ')[0];
}

