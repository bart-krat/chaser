import { NextResponse } from 'next/server';
import { triggerOutreachNow } from '@/lib/scheduler';

/**
 * Manually trigger outreach processing
 * Useful for testing without waiting for cron
 */
export async function POST() {
  try {
    await triggerOutreachNow();
    
    return NextResponse.json({
      success: true,
      message: 'Outreach processing triggered successfully'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 });
  }
}

