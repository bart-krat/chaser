import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000'
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

export interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendGmailEmail({
  to,
  subject,
  text,
  html
}: SendEmailParams) {
  try {
    // Create email content
    const message = [
      `From: ${process.env.GMAIL_FROM_EMAIL}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      html || text
    ].join('\n');

    // Encode message to base64
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send email
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });

    console.log('✅ Email sent successfully:', response.data.id);
    return {
      success: true,
      messageId: response.data.id
    };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
}

// Helper to get email quota/profile info
export async function getGmailProfile() {
  try {
    const response = await gmail.users.getProfile({
      userId: 'me'
    });
    return response.data;
  } catch (error) {
    console.error('Error getting Gmail profile:', error);
    throw error;
  }
}

// Track daily email count (simple in-memory counter)
let dailyEmailCount = 0;
let lastResetDate = new Date().toDateString();

export function trackEmailSent() {
  const today = new Date().toDateString();
  
  // Reset counter if new day
  if (today !== lastResetDate) {
    dailyEmailCount = 0;
    lastResetDate = today;
  }
  
  dailyEmailCount++;
  console.log(`📧 Emails sent today: ${dailyEmailCount}/2000`);
  
  if (dailyEmailCount > 1600) {
    console.warn('⚠️ Approaching daily Gmail limit (80% used)');
  }
  
  return dailyEmailCount;
}

