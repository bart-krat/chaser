import fs from 'fs';
import path from 'path';
import { ChaserBackend } from '@/types/backend';

const STORAGE_DIR = path.join(process.cwd(), 'data');
const CHASERS_FILE = path.join(STORAGE_DIR, 'chasers.json');

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
    console.log('📁 Created data directory');
  }
}

// Initialize storage file if it doesn't exist
function initializeStorage() {
  ensureDataDir();
  
  if (!fs.existsSync(CHASERS_FILE)) {
    fs.writeFileSync(CHASERS_FILE, JSON.stringify([], null, 2));
    console.log('📝 Initialized chasers.json');
  }
}

// Read all chasers from file
export function readChasers(): ChaserBackend[] {
  try {
    initializeStorage();
    
    const data = fs.readFileSync(CHASERS_FILE, 'utf-8');
    const chasers = JSON.parse(data);
    
    // Convert date strings back to Date objects
    return chasers.map((chaser: any) => ({
      ...chaser,
      createdAt: new Date(chaser.createdAt),
      updatedAt: new Date(chaser.updatedAt),
      nextOutreachAt: chaser.nextOutreachAt ? new Date(chaser.nextOutreachAt) : null,
      completedAt: chaser.completedAt ? new Date(chaser.completedAt) : null,
      schedule: chaser.schedule.map((item: any) => ({
        ...item,
        scheduledFor: new Date(item.scheduledFor),
        sentAt: item.sentAt ? new Date(item.sentAt) : null,
        deliveredAt: item.deliveredAt ? new Date(item.deliveredAt) : null
      }))
    }));
  } catch (error) {
    console.error('Error reading chasers:', error);
    return [];
  }
}

// Write chasers to file
export function writeChasers(chasers: ChaserBackend[]): void {
  try {
    ensureDataDir();
    fs.writeFileSync(CHASERS_FILE, JSON.stringify(chasers, null, 2));
    console.log(`💾 Saved ${chasers.length} chasers to file`);
  } catch (error) {
    console.error('Error writing chasers:', error);
    throw error;
  }
}

// Add a new chaser
export function addChaser(chaser: ChaserBackend): void {
  const chasers = readChasers();
  chasers.push(chaser);
  writeChasers(chasers);
  console.log(`✅ Added chaser: ${chaser.id}`);
}

// Update a chaser
export function updateChaser(id: string, updates: Partial<ChaserBackend>): void {
  const chasers = readChasers();
  const index = chasers.findIndex(c => c.id === id);
  
  if (index === -1) {
    throw new Error(`Chaser ${id} not found`);
  }
  
  chasers[index] = { ...chasers[index], ...updates, updatedAt: new Date() };
  writeChasers(chasers);
  console.log(`📝 Updated chaser: ${id}`);
}

// Delete a chaser
export function deleteChaser(id: string): void {
  const chasers = readChasers();
  const filtered = chasers.filter(c => c.id !== id);
  writeChasers(filtered);
  console.log(`🗑️ Deleted chaser: ${id}`);
}

// Get a single chaser by ID
export function getChaserById(id: string): ChaserBackend | null {
  const chasers = readChasers();
  return chasers.find(c => c.id === id) || null;
}

// Get chasers that need outreach now
export function getChasersPendingOutreach(): Array<{
  chaser: ChaserBackend;
  scheduleItem: any;
}> {
  const chasers = readChasers();
  const now = new Date();
  const pending: Array<{ chaser: ChaserBackend; scheduleItem: any }> = [];
  
  for (const chaser of chasers) {
    if (chaser.status === 'completed' || chaser.status === 'failed') {
      continue;
    }
    
    for (const item of chaser.schedule) {
      if (item.status === 'pending' && new Date(item.scheduledFor) <= now) {
        pending.push({ chaser, scheduleItem: item });
      }
    }
  }
  
  return pending;
}

