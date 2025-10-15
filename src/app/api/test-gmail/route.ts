import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET() {
  try {
    // Check if env vars are loaded
    const envCheck = {
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasRefreshToken: !!process.env.GOOGLE_REFRESH_TOKEN,
      hasFromEmail: !!process.env.GMAIL_FROM_EMAIL,
      clientIdLength: process.env.GOOGLE_CLIENT_ID?.length || 0,
      clientSecretLength: process.env.GOOGLE_CLIENT_SECRET?.length || 0,
      refreshTokenLength: process.env.GOOGLE_REFRESH_TOKEN?.length || 0,
    };

    // Try to authenticate
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3000'
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Try to get user profile (this tests the auth)
    const profile = await gmail.users.getProfile({ userId: 'me' });

    return NextResponse.json({
      success: true,
      message: 'Gmail API connection successful! ✅',
      envCheck,
      profile: {
        emailAddress: profile.data.emailAddress,
        messagesTotal: profile.data.messagesTotal
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      errorCode: error.code,
      errorDetails: error.errors,
      envCheck: {
        hasClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        hasRefreshToken: !!process.env.GOOGLE_REFRESH_TOKEN,
        hasFromEmail: !!process.env.GMAIL_FROM_EMAIL,
        clientIdFirst10: process.env.GOOGLE_CLIENT_ID?.substring(0, 10) || 'missing',
        refreshTokenFirst10: process.env.GOOGLE_REFRESH_TOKEN?.substring(0, 10) || 'missing',
      },
      hint: 'Check if refresh token matches your Client ID/Secret. Generate a new one at OAuth Playground.'
    }, { status: 500 });
  }
}

