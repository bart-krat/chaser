import { NextResponse } from 'next/server';
import { startScheduler } from '@/lib/scheduler';

let schedulerStarted = false;

export async function POST() {
  if (schedulerStarted) {
    return NextResponse.json({
      message: 'Scheduler is already running'
    });
  }

  startScheduler();
  schedulerStarted = true;

  return NextResponse.json({
    success: true,
    message: 'Outreach scheduler started! Will check for pending emails every 30 minutes.'
  });
}

export async function GET() {
  return NextResponse.json({
    running: schedulerStarted,
    message: schedulerStarted 
      ? 'Scheduler is running'
      : 'Scheduler is not running. POST to this endpoint to start it.'
  });
}

