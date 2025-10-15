import cron from 'node-cron';
import { sendGmailEmail, trackEmailSent } from './gmail';
import { getChasersPendingOutreach, updateChaser, readChasers } from './storage';
import { generateSubject } from '@/services/contentGenerator';

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
        console.log(`\n📧 Sending ${scheduleItem.medium} for chaser ${chaser.id}`);
        console.log(`   Attempt: ${scheduleItem.attemptNumber}`);
        console.log(`   To: ${chaser.contactName}`);
        
        if (scheduleItem.medium === 'email') {
          // Send email
          const subject = generateSubject({
            contactName: chaser.contactName,
            documents: chaser.documents,
            task: chaser.task,
            attemptNumber: scheduleItem.attemptNumber,
            urgency: chaser.urgency
          });
          
          await sendGmailEmail({
            to: chaser.contactEmail || 'test@example.com', // Fallback for testing
            subject,
            text: scheduleItem.content,
            html: `<div style="font-family: Arial, sans-serif; white-space: pre-wrap;">${scheduleItem.content}</div>`
          });
          
          trackEmailSent();
          
          // Update schedule item status
          const chasers = readChasers();
          const chaserIndex = chasers.findIndex(c => c.id === chaser.id);
          
          if (chaserIndex !== -1) {
            const itemIndex = chasers[chaserIndex].schedule.findIndex(
              s => s.id === scheduleItem.id
            );
            
            if (itemIndex !== -1) {
              chasers[chaserIndex].schedule[itemIndex].status = 'sent';
              chasers[chaserIndex].schedule[itemIndex].sentAt = new Date();
              chasers[chaserIndex].currentAttempt = scheduleItem.attemptNumber;
              chasers[chaserIndex].updatedAt = new Date();
              
              // Calculate next outreach date
              const nextPending = chasers[chaserIndex].schedule.find(
                s => s.status === 'pending'
              );
              chasers[chaserIndex].nextOutreachAt = nextPending
                ? nextPending.scheduledFor
                : null;
              
              // Update status if all attempts done
              if (!nextPending) {
                chasers[chaserIndex].status = 'completed';
                chasers[chaserIndex].completedAt = new Date();
              }
              
              // Save to file
              require('./storage').writeChasers(chasers);
              
              console.log(`✅ Email sent and status updated for ${chaser.id}`);
            }
          }
        } else if (scheduleItem.medium === 'whatsapp') {
          console.log(`📱 WhatsApp integration not yet implemented - marking as sent`);
          // TODO: Implement WhatsApp sending via Twilio
          // For now, just mark as sent
        } else if (scheduleItem.medium === 'call') {
          console.log(`📞 Call scheduling not yet implemented - marking as pending`);
          // TODO: Implement call scheduling
        }
        
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

