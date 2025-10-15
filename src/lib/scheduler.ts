import cron from 'node-cron';
import { sendGmailEmail, trackEmailSent } from './gmail';
import { getChasersPendingOutreach, updateScheduleItem, updateChaserInDb } from './db';
import { generateSubject } from '@/services/contentGenerator';
import { generateSubjectWithAI, isAIEnabled } from '@/services/aiContentGenerator';

let isSchedulerRunning = false;

/**
 * Process pending outreach items
 */
async function processOutreach() {
  if (isSchedulerRunning) {
    console.log('⏭️ Scheduler already running, skipping...');
    return;
  }

  isSchedulerRunning = true;
  
  try {
    const pending = getChasersPendingOutreach();
    
    if (pending.length === 0) {
      console.log('✨ No pending outreach at this time');
      return;
    }
    
    console.log(`📬 Processing ${pending.length} pending outreach items...`);
    
    for (const { chaser, scheduleItem } of pending) {
      try {
        console.log(`\n📧 Sending email for chaser ${chaser.id}`);
        console.log(`   Attempt: ${scheduleItem.attemptNumber}`);
        console.log(`   To: ${chaser.contactEmail || chaser.contactName}`);
        
        // Check if this is a follow-up email (2 or 4) that should be threaded
        const isFollowUp = scheduleItem.attemptNumber === 2 || scheduleItem.attemptNumber === 4;
        let inReplyTo: string | undefined;
        let references: string | undefined;
        let subject: string;
        
        if (isFollowUp) {
          // Get the previous email's message ID for threading
          const { prisma } = await import('@/lib/prisma');
          const previousAttempt = scheduleItem.attemptNumber - 1;
          const previousSchedule = await prisma.outreachSchedule.findFirst({
            where: {
              chaserId: chaser.id,
              attemptNumber: previousAttempt
            }
          });
          
          if (previousSchedule?.messageId) {
            inReplyTo = previousSchedule.messageId;
            references = previousSchedule.messageId;
            console.log(`🔗 This is a reply to attempt ${previousAttempt}`);
            
            // Get original subject and add "Re:"
            // For Email 2, reply to Email 1's subject
            // For Email 4, reply to Email 3's subject  
            const docPreview = chaser.documents.split('\n')[0].substring(0, 50);
            const originalSubject = previousAttempt === 1 
              ? `Document Requirements - ${docPreview}`
              : `URGENT: Document Requirements - ${docPreview}`;
            
            subject = `Re: ${originalSubject}`;
          } else {
            console.warn(`⚠️ No message ID found for previous attempt ${previousAttempt}, sending as new thread`);
            subject = generateSubject({
              contactName: chaser.contactName,
              documents: chaser.documents,
              task: chaser.task,
              attemptNumber: scheduleItem.attemptNumber,
              urgency: chaser.urgency
            });
          }
        } else {
          // Email 1 or 3 - new thread, generate subject with AI
          if (isAIEnabled()) {
            try {
              subject = await generateSubjectWithAI({
                contactName: chaser.contactName,
                documents: chaser.documents,
                task: chaser.task,
                urgency: chaser.urgency,
                attemptNumber: scheduleItem.attemptNumber
              });
            } catch (error) {
              subject = generateSubject({
                contactName: chaser.contactName,
                documents: chaser.documents,
                task: chaser.task,
                attemptNumber: scheduleItem.attemptNumber,
                urgency: chaser.urgency
              });
            }
          } else {
            subject = generateSubject({
              contactName: chaser.contactName,
              documents: chaser.documents,
              task: chaser.task,
              attemptNumber: scheduleItem.attemptNumber,
              urgency: chaser.urgency
            });
          }
        }
        
        // Send email with threading headers
        const emailResult = await sendGmailEmail({
          to: chaser.contactEmail || chaser.contactName,
          subject,
          text: scheduleItem.content,
          html: `<div style="font-family: Arial, sans-serif; white-space: pre-wrap;">${scheduleItem.content}</div>`,
          inReplyTo,
          references
        });
        
        trackEmailSent();
        
        // Update schedule item status in database with message ID
        await updateScheduleItem(scheduleItem.id, {
          status: 'sent',
          sentAt: new Date(),
          messageId: emailResult.messageId,
          threadId: emailResult.threadId
        });
        
        // Update chaser
        await updateChaserInDb(chaser.id, {
          currentAttempt: scheduleItem.attemptNumber,
          updatedAt: new Date()
        });
        
        console.log(`✅ Email sent and status updated for ${chaser.id}`);
        
      } catch (error) {
        console.error(`❌ Error processing outreach for ${chaser.id}:`, error);
        // Continue with next item even if this one fails
      }
    }
    
    console.log('\n✨ Outreach processing complete!\n');
    
  } catch (error) {
    console.error('Error in processOutreach:', error);
  } finally {
    isSchedulerRunning = false;
  }
}

/**
 * Start the cron job scheduler
 * Runs every 30 minutes to check for pending outreach
 */
export function startScheduler() {
  console.log('🚀 Starting outreach scheduler...');
  console.log('⏰ Will check for pending outreach every 30 minutes');
  
  // Run every 30 minutes
  cron.schedule('*/30 * * * *', () => {
    console.log(`\n🔔 [${new Date().toLocaleString()}] Checking for pending outreach...`);
    processOutreach();
  });
  
  // Also run immediately on startup
  console.log('🔍 Running initial outreach check...');
  processOutreach();
  
  console.log('✅ Scheduler started successfully!\n');
}

/**
 * Manually trigger outreach processing (useful for testing)
 */
export async function triggerOutreachNow() {
  console.log('🔧 Manually triggering outreach...');
  await processOutreach();
}

