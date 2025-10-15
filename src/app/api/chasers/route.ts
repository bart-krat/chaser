import { NextRequest, NextResponse } from 'next/server';
import { CreateChaserRequest, CreateChaserResponse, ChaserBackend } from '@/types/backend';
import { generateOutreachSchedule, getNextOutreachDate } from '@/services/scheduleGenerator';
import { generateContent, generateSubject } from '@/services/contentGenerator';
import { generateEmailWithAI, generateSubjectWithAI, isAIEnabled } from '@/services/aiContentGenerator';
import { sendGmailEmail, trackEmailSent } from '@/lib/gmail';
import { prisma } from '@/lib/prisma';
import { findOrCreateCustomer } from '@/lib/db';

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
    
    // Generate content for each schedule item (all emails now)
    const aiEnabled = isAIEnabled();
    console.log(`🤖 AI Content Generation: ${aiEnabled ? 'Enabled' : 'Disabled (using templates)'}`);
    
    for (const item of schedule) {
      // All items are emails now - use AI if available, templates as fallback
      if (aiEnabled) {
        try {
          item.content = await generateEmailWithAI({
            contactName: body.who,
            documents: body.documents,
            task: body.task,
            urgency: body.urgency,
            attemptNumber: item.attemptNumber,
            company: undefined
          });
          console.log(`✅ AI content generated for attempt ${item.attemptNumber}`);
        } catch (error) {
          console.error(`Failed to generate AI content for attempt ${item.attemptNumber}, using template`);
          item.content = generateContent(item.template, {
            contactName: body.who,
            documents: body.documents,
            task: body.task,
            attemptNumber: item.attemptNumber,
            urgency: body.urgency
          });
        }
      } else {
        // AI disabled - use email templates
        item.content = generateContent(item.template, {
          contactName: body.who,
          documents: body.documents,
          task: body.task,
          attemptNumber: item.attemptNumber,
          urgency: body.urgency
        });
      }
    }
    
    // Find or create customer if email is provided in 'who' field
    let customerId: string | undefined = undefined;
    
    // Check if 'who' is an email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(body.who)) {
      const customer = await findOrCreateCustomer(body.who, {
        name: body.who,
        phone: body.contactPhone,
        company: undefined
      });
      customerId = customer.id;
    }
    
    // Create chaser object
    const chaser: ChaserBackend = {
      id: chaserId,
      task: body.task,
      documents: body.documents,
      who: body.who,
      urgency: body.urgency,
      contactName: body.who,
      contactEmail: body.contactEmail || body.who,
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
    
    // Save to database
    await prisma.chaser.create({
      data: {
        id: chaser.id,
        task: chaser.task,
        documents: chaser.documents,
        who: chaser.who,
        urgency: chaser.urgency,
        customerId: customerId,
        contactName: chaser.contactName,
        contactEmail: chaser.contactEmail,
        contactPhone: chaser.contactPhone,
        status: chaser.status,
        currentAttempt: chaser.currentAttempt,
        maxAttempts: chaser.maxAttempts,
        nextOutreachAt: chaser.nextOutreachAt,
        completedAt: chaser.completedAt,
        schedule: {
          create: chaser.schedule.map(item => ({
            id: item.id,
            attemptNumber: item.attemptNumber,
            medium: item.medium,
            scheduledFor: item.scheduledFor,
            status: item.status,
            content: item.content,
            template: item.template,
            sentAt: item.sentAt,
            deliveredAt: item.deliveredAt,
            responseReceived: item.responseReceived,
            metadata: item.metadata ? JSON.stringify(item.metadata) : null
          }))
        }
      }
    });
    
    console.log(`💾 Saved chaser ${chaser.id} to database`);
    
    // Send first email immediately if it's an email
    const firstSchedule = schedule[0];
    if (firstSchedule && firstSchedule.medium === 'email') {
      try {
        console.log('📧 Sending first email immediately...');
        
        // Generate subject line (use AI if available)
        let subject: string;
        if (isAIEnabled()) {
          subject = await generateSubjectWithAI({
            contactName: body.who,
            documents: body.documents,
            task: body.task,
            urgency: body.urgency,
            attemptNumber: 1
          });
          console.log(`🤖 AI Subject: ${subject}`);
        } else {
          subject = generateSubject({
            contactName: body.who,
            documents: body.documents,
            task: body.task,
            attemptNumber: 1,
            urgency: body.urgency
          });
        }
        
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
        
        // Update schedule status in database
        await prisma.outreachSchedule.update({
          where: { id: firstSchedule.id },
          data: {
            status: 'sent',
            sentAt: new Date()
          }
        });
        
        await prisma.chaser.update({
          where: { id: chaser.id },
          data: {
            currentAttempt: 1,
            updatedAt: new Date()
          }
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
    const chasers = await prisma.chaser.findMany({
      include: {
        schedule: {
          orderBy: {
            attemptNumber: 'asc'
          }
        },
        customer: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Convert to backend format with parsed metadata
    const formattedChasers = chasers.map(chaser => ({
      ...chaser,
      schedule: chaser.schedule.map(item => ({
        ...item,
        metadata: item.metadata ? JSON.parse(item.metadata) : {}
      }))
    }));
    
    return NextResponse.json({
      chasers: formattedChasers,
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

