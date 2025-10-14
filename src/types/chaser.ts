export type DocType = 'VAT Receipt' | 'Income Statement' | 'Tax Return';
export type Urgency = 'Low' | 'Medium' | 'High';
export type Medium = 'Email' | 'Whatsapp' | 'Call' | 'Hybrid';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
}

export interface Chaser {
  id: string;
  docType: DocType;
  urgency: Urgency;
  medium: Medium;
  user: User;
  createdAt: Date;
  status: 'pending' | 'sent' | 'completed';
}

export interface ChaserFormData {
  docType: DocType;
  urgency: Urgency;
  medium: Medium;
  userId: string;
}

