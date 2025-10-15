import { NextRequest, NextResponse } from 'next/server';
import { CreateChaserRequest, CreateChaserResponse, ChaserBackend } from '@/types/backend';
import { generateOutreachSchedule, getNextOutreachDate } from '@/services/scheduleGenerator';
import { generateContent, generateSubject } from '@/services/contentGenerator';
import { addChaser, readChasers } from '@/lib/storage';
import { sendGmailEmail, trackEmailSent } from '@/lib/gmail';

/**
 * POST /api/chasers - Create a new chaser
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateChaserRequest = await request.json();
    
    // Validate required fields
    if (!body.task || !body.documents || !body.who || !body.urgency) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create chaser ID
    const chaserId = `chaser_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate outreach schedule
    const schedule = generateOutreachSchedule(chaserId, {
      urgency: body.urgency,
      medium: 'Hybrid', // Default to hybrid for now
      documents: body.documents
    });
    
    // Generate content for each schedule item
    for (const item of schedule) {
      item.content = generateContent(item.template, {
        contactName: body.who,
        documents: body.documents,
        task: body.task,
        attemptNumber: item.attemptNumber,
        urgency: body.urgency
      });
    }
    
    // Create chaser object
    const chaser: ChaserBackend = {
      id: chaserId,
      task: body.task,
      documents: body.documents,
      who: body.who,
      urgency: body.urgency,
      contactName: body.who,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      status: 'scheduled',
      currentAttempt: 0,
      maxAttempts: schedule.length,
      schedule: schedule,
      createdAt: new Date(),
      updatedAt: new Date(),
      nextOutreachAt: getNextOutreachDate(schedule),
      completedAt: null
    };
    
    // Save to file storage
    addChaser(chaser);
    
    // Send first email immediately if it's an email
    const firstSchedule = schedule[0];
    if (firstSchedule && firstSchedule.medium === 'email') {
      try {
        console.log('📧 Sending first email immediately...');
        
        const subject = generateSubject({
          contactName: body.who,
          documents: body.documents,
          task: body.task,
          attemptNumber: 1,
          urgency: body.urgency
        });
        
        // Use contactEmail if provided, otherwise use 'who' field (which could be an email)
        const recipientEmail = body.contactEmail || body.who;
        
        console.log(`📬 Sending to: ${recipientEmail}`);
        
        await sendGmailEmail({
          to: recipientEmail,
          subject,
          text: firstSchedule.content,
          html: `<div style="font-family: Arial, sans-serif; white-space: pre-wrap;">${firstSchedule.content}</div>`
        });
        
        trackEmailSent();
        
        // Update schedule status
        firstSchedule.status = 'sent';
        firstSchedule.sentAt = new Date();
        chaser.currentAttempt = 1;
        chaser.updatedAt = new Date();
        
        // Re-save with updated status
        const { updateChaser } = await import('@/lib/storage');
        updateChaser(chaser.id, {
          schedule: chaser.schedule,
          currentAttempt: chaser.currentAttempt,
          updatedAt: chaser.updatedAt
        });
        
        console.log('✅ First email sent successfully!');
      } catch (error) {
        console.error('❌ Failed to send first email:', error);
        // Don't fail the whole request, just log it
      }
    }
    
    // The cron scheduler will handle the rest of the emails
    
    const response: CreateChaserResponse = {
      chaser,
      schedule,
      message: `Chaser created successfully with ${schedule.length} scheduled outreach attempts`
    };
    
    return NextResponse.json(response, { status: 201 });
    
  } catch (error) {
    console.error('Error creating chaser:', error);
    return NextResponse.json(
      { error: 'Failed to create chaser' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/chasers - Get all chasers
 */
export async function GET(request: NextRequest) {
  try {
    const chasers = readChasers();
    return NextResponse.json({
      chasers,
      total: chasers.length
    });
  } catch (error) {
    console.error('Error fetching chasers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chasers' },
      { status: 500 }
    );
  }
}

