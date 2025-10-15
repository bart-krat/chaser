// Database helper functions using Prisma
import { prisma } from './prisma';
import { ChaserBackend, OutreachSchedule } from '@/types/backend';

/**
 * Get all chasers from database
 */
export async function getAllChasers(): Promise<ChaserBackend[]> {
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
  return chasers.map(chaser => ({
    ...chaser,
    schedule: chaser.schedule.map(item => ({
      ...item,
      metadata: item.metadata ? JSON.parse(item.metadata) : {}
    }))
  })) as ChaserBackend[];
}

/**
 * Get chasers with pending outreach
 */
export async function getChasersPendingOutreach() {
  const now = new Date();
  
  const schedules = await prisma.outreachSchedule.findMany({
    where: {
      status: 'pending',
      scheduledFor: {
        lte: now
      }
    },
    include: {
      chaser: {
        include: {
          customer: true
        }
      }
    }
  });
  
  return schedules.map(item => ({
    chaser: item.chaser as any,
    scheduleItem: {
      ...item,
      metadata: item.metadata ? JSON.parse(item.metadata) : {}
    }
  }));
}

/**
 * Update a chaser
 */
export async function updateChaserInDb(id: string, data: Partial<ChaserBackend>) {
  return await prisma.chaser.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date()
    }
  });
}

/**
 * Update schedule item
 */
export async function updateScheduleItem(id: string, data: any) {
  return await prisma.outreachSchedule.update({
    where: { id },
    data: {
      ...data,
      metadata: data.metadata ? JSON.stringify(data.metadata) : undefined
    }
  });
}

/**
 * Get all customers
 */
export async function getAllCustomers() {
  return await prisma.customer.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });
}

/**
 * Create or get customer by email
 */
export async function findOrCreateCustomer(email: string, data: {
  name: string;
  phone?: string;
  company?: string;
}) {
  // Try to find existing customer
  let customer = await prisma.customer.findUnique({
    where: { email }
  });

  if (!customer) {
    // Create new customer
    customer = await prisma.customer.create({
      data: {
        email,
        name: data.name,
        phone: data.phone,
        company: data.company
      }
    });
    console.log(`✅ Created new customer: ${email}`);
  } else {
    console.log(`📋 Found existing customer: ${email}`);
  }

  return customer;
}

