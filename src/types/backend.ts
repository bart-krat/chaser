// Extended backend types for the Chaser system

export interface DocumentItem {
  id: string;
  chaserId: string;
  name: string;
  status: 'pending' | 'received' | 'altered';
  order: number;
  createdAt: Date;
  updatedAt: Date;
  receivedAt: Date | null;
  notes: string | null;
}

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
  name: string;
  documents: string;  // Full text description
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
  
  // Schedule & Documents
  schedule: OutreachSchedule[];
  documentItems?: DocumentItem[];  // Individual tracked documents
  
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
  name: string;
  attemptNumber: number;
  urgency: string;
}

export interface UrgencyTiming {
  initialDelay: number; // in days (can be fractional)
  intervals: number[];  // subsequent delays in days
}

export interface CreateChaserRequest {
  name: string;
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

