import { NextRequest, NextResponse } from 'next/server';
import { CreateChaserRequest, CreateChaserResponse, ChaserBackend } from '@/types/backend';
import { generateOutreachSchedule, getNextOutreachDate } from '@/services/scheduleGenerator';
import { generateContent, generateSubject } from '@/services/contentGenerator';
import { generateEmailWithAI, generateEscalatedEmailWithAI, generateSubjectWithAI, isAIEnabled } from '@/services/aiContentGenerator';
import { parseDocumentsWithAI, isDocumentParsingEnabled } from '@/services/aiDocumentParser';
import { extractFirstName } from '@/services/emailSubjects';
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
    if (!body.name || !body.documents || !body.who || !body.urgency) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create chaser ID
    const chaserId = `chaser_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Parse documents into individual items using AI
    console.log('📄 Parsing documents into individual items...');
    const parsedDocuments = await parseDocumentsWithAI(body.documents);
    console.log(`✅ Parsed ${parsedDocuments.length} document items`);
    
    // Generate outreach schedule
    const schedule = generateOutreachSchedule(chaserId, {
      urgency: body.urgency,
      medium: 'Hybrid', // Default to hybrid for now
      documents: body.documents
    });
    
    // Generate content for each schedule item (all emails now)
    const aiEnabled = isAIEnabled();
    console.log(`🤖 AI Content Generation: ${aiEnabled ? 'Enabled' : 'Disabled (using templates)'}`);
    
    // Generate content for emails 1 & 3 with AI (or templates as fallback)
    // Emails 2 & 4 will be simple follow-ups quoting the previous email
    
    for (const item of schedule) {
      const isInitialEmail = item.attemptNumber === 1 || item.attemptNumber === 3;
      
      if (isInitialEmail) {
        // Generate new email content with AI (or template fallback)
        if (aiEnabled) {
          try {
            // Email 1: Friendly initial contact
            // Email 3: Escalated/urgent (different function)
            if (item.attemptNumber === 1) {
              item.content = await generateEmailWithAI({
                contactName: body.who,
                documents: body.documents,
                name: body.name,
                urgency: body.urgency,
                attemptNumber: item.attemptNumber,
                company: undefined
              });
              console.log(`✅ AI friendly email generated for attempt 1`);
            } else if (item.attemptNumber === 3) {
              item.content = await generateEscalatedEmailWithAI({
                contactName: body.who,
                documents: body.documents,
                name: body.name,
                urgency: body.urgency,
                attemptNumber: item.attemptNumber,
                company: undefined
              });
              console.log(`✅ AI escalated email generated for attempt 3`);
            }
          } catch (error) {
            console.error(`Failed to generate AI content for attempt ${item.attemptNumber}, using template`);
            item.content = generateContent(item.template, {
              contactName: body.who,
              documents: body.documents,
              name: body.name,
              attemptNumber: item.attemptNumber,
              urgency: body.urgency
            });
          }
        } else {
          // AI disabled - use templates
          item.content = generateContent(item.template, {
            contactName: body.who,
            documents: body.documents,
            name: body.name,
            attemptNumber: item.attemptNumber,
            urgency: body.urgency
          });
        }
      } else {
        // Email 2 & 4: Simple follow-up template (no AI needed)
        // Will be populated after initial emails are generated
        item.content = '[FOLLOW_UP_PLACEHOLDER]'; // Temporary, will be replaced below
      }
    }
    
    // Now generate follow-up emails that quote the previous email
    for (const item of schedule) {
      if (item.content === '[FOLLOW_UP_PLACEHOLDER]') {
        const previousEmail = schedule.find(s => s.attemptNumber === item.attemptNumber - 1);
        
        if (previousEmail) {
          const firstName = extractFirstName(body.who);
          
          item.content = `Hi ${firstName},

Just following up to see if you got my last email regarding the document requirements.

──────────────────────────────
Previous Email:
──────────────────────────────

${previousEmail.content}

──────────────────────────────

Could you please send these over when you get a chance?

Thank you!`;
          
          console.log(`✅ Follow-up template created for attempt ${item.attemptNumber} (quotes previous email)`);
        }
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
      name: body.name,
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
    
    // Save to database with document items
    await prisma.chaser.create({
      data: {
        id: chaser.id,
        name: chaser.name,
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
        },
        documentItems: {
          create: parsedDocuments.map(doc => ({
            name: doc.name,
            status: 'pending',
            order: doc.order,
            notes: doc.description || null
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
            name: body.name,
            urgency: body.urgency,
            attemptNumber: 1
          });
          console.log(`🤖 AI Subject: ${subject}`);
        } else {
          subject = generateSubject({
            contactName: body.who,
            documents: body.documents,
            name: body.name,
            attemptNumber: 1,
            urgency: body.urgency
          });
        }
        
        // Use contactEmail if provided, otherwise use 'who' field (which could be an email)
        const recipientEmail = body.contactEmail || body.who;
        
        console.log(`📬 Sending to: ${recipientEmail}`);
        
        const emailResult = await sendGmailEmail({
          to: recipientEmail,
          subject,
          text: firstSchedule.content,
          html: `<div style="font-family: Arial, sans-serif; white-space: pre-wrap;">${firstSchedule.content}</div>`
        });
        
        trackEmailSent();
        
        // Update schedule status in database WITH message ID for threading
        await prisma.outreachSchedule.update({
          where: { id: firstSchedule.id },
          data: {
            status: 'sent',
            sentAt: new Date(),
            messageId: emailResult.messageId,
            threadId: emailResult.threadId
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
    console.log('📡 GET /api/chasers - Fetching all chasers...');
    
    const chasers = await prisma.chaser.findMany({
      include: {
        schedule: {
          orderBy: {
            attemptNumber: 'asc'
          }
        },
        customer: true,
        documentItems: {
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`✅ Found ${chasers.length} chasers in database`);
    
    // Convert to backend format with parsed metadata
    const formattedChasers = chasers.map((chaser: any) => ({
      ...chaser,
      schedule: chaser.schedule ? chaser.schedule.map((item: any) => ({
        ...item,
        metadata: item.metadata ? JSON.parse(item.metadata) : {}
      })) : [],
      documentItems: chaser.documentItems || []
    }));
    
    console.log(`✅ Returning ${formattedChasers.length} formatted chasers`);
    
    return NextResponse.json({
      chasers: formattedChasers,
      total: chasers.length
    });
  } catch (error) {
    console.error('❌ Error fetching chasers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chasers', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

