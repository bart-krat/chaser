// Extended backend types for the Chaser system

export interface OutreachSchedule {
  id: string;
  chaserId: string;
  attemptNumber: number;
  medium: 'email' | 'whatsapp' | 'call' | 'sms';
  scheduledFor: Date;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'responded';
  content: string;
  template: string;
  sentAt: Date | null;
  deliveredAt: Date | null;
  responseReceived: boolean;
  metadata: {
    messageId?: string;
    errorMessage?: string;
    openedAt?: Date;
    clickedAt?: Date;
  };
}

export interface ChaserBackend {
  id: string;
  
  // Basic Info (from form)
  task: string;
  documents: string;
  who: string;
  urgency: string;
  
  // User/Contact Info
  contactEmail?: string;
  contactPhone?: string;
  contactName: string;
  
  // Status & Tracking
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'failed';
  currentAttempt: number;
  maxAttempts: number;
  
  // Schedule
  schedule: OutreachSchedule[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  nextOutreachAt: Date | null;
  completedAt: Date | null;
}

export interface ScheduleConfig {
  urgency: string;
  medium: string;
  documents: string;
}

export interface TemplateContext {
  contactName: string;
  documents: string;
  task: string;
  attemptNumber: number;
  urgency: string;
}

export interface UrgencyTiming {
  initialDelay: number; // in days (can be fractional)
  intervals: number[];  // subsequent delays in days
}

export interface CreateChaserRequest {
  task: string;
  documents: string;
  who: string;
  urgency: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface CreateChaserResponse {
  chaser: ChaserBackend;
  schedule: OutreachSchedule[];
  message: string;
}

