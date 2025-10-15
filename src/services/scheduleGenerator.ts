import { OutreachSchedule, ScheduleConfig, UrgencyTiming } from '@/types/backend';

// Urgency-based timing configurations
const URGENCY_CONFIG: Record<string, UrgencyTiming> = {
  'Low': { 
    initialDelay: 3, 
    intervals: [7, 14, 30] 
  },
  'Medium': { 
    initialDelay: 1, 
    intervals: [3, 7, 14] 
  },
  'High': { 
    initialDelay: 0.25, // 6 hours
    intervals: [1, 2, 4, 7] 
  },
  'Urgent': { 
    initialDelay: 0, // immediate
    intervals: [0.5, 1, 2, 3] // 12 hours, 1 day, 2 days, 3 days
  }
};

// Medium escalation strategies
const MEDIUM_STRATEGY: Record<string, string[]> = {
  'Email': ['email', 'email', 'email', 'call'],
  'Whatsapp': ['whatsapp', 'whatsapp', 'email'],
  'Call': ['call', 'email', 'call'],
  'Hybrid': ['email', 'whatsapp', 'call', 'email']
};

/**
 * Generates an outreach schedule based on urgency and medium preference
 */
export function generateOutreachSchedule(
  chaserId: string,
  config: ScheduleConfig
): OutreachSchedule[] {
  const schedule: OutreachSchedule[] = [];
  const baseDate = new Date();
  
  // Get timing configuration based on urgency
  const timing = URGENCY_CONFIG[config.urgency] || URGENCY_CONFIG['Medium'];
  
  // Get medium strategy
  const mediums = MEDIUM_STRATEGY[config.medium] || ['email'];
  
  // Generate schedule items
  let cumulativeDays = 0;
  const delays = [timing.initialDelay, ...timing.intervals];
  
  delays.forEach((delay, index) => {
    if (index > 0) {
      cumulativeDays += delay;
    } else {
      cumulativeDays = delay;
    }
    
    const scheduledDate = new Date(baseDate);
    scheduledDate.setTime(baseDate.getTime() + (cumulativeDays * 24 * 60 * 60 * 1000));
    
    const medium = mediums[index % mediums.length] as 'email' | 'whatsapp' | 'call' | 'sms';
    
    schedule.push({
      id: `${chaserId}_attempt_${index + 1}`,
      chaserId,
      attemptNumber: index + 1,
      medium,
      scheduledFor: scheduledDate,
      status: 'pending',
      content: '', // Will be populated by content generator
      template: `attempt_${index + 1}_${medium}`,
      sentAt: null,
      deliveredAt: null,
      responseReceived: false,
      metadata: {}
    });
  });
  
  return schedule;
}

/**
 * Calculate next outreach date from schedule
 */
export function getNextOutreachDate(schedule: OutreachSchedule[]): Date | null {
  const pendingItems = schedule
    .filter(item => item.status === 'pending')
    .sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
  
  return pendingItems.length > 0 ? pendingItems[0].scheduledFor : null;
}

/**
 * Check if a chaser should be marked as completed
 */
export function shouldMarkAsCompleted(schedule: OutreachSchedule[]): boolean {
  return schedule.some(item => item.responseReceived);
}

/**
 * Get current attempt number
 */
export function getCurrentAttempt(schedule: OutreachSchedule[]): number {
  const sentItems = schedule.filter(item => 
    item.status === 'sent' || item.status === 'delivered'
  );
  return sentItems.length;
}

