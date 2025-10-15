import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/customers - Create a new customer
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }
    
    // Check if customer already exists
    const existing = await prisma.customer.findUnique({
      where: { email: body.email }
    });
    
    if (existing) {
      return NextResponse.json(
        { error: 'Customer with this email already exists', customer: existing },
        { status: 409 }
      );
    }
    
    // Create customer
    const customer = await prisma.customer.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        company: body.company,
        notes: body.notes
      }
    });
    
    console.log(`✅ Created customer: ${customer.email}`);
    
    return NextResponse.json(customer, { status: 201 });
    
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/customers - Get all customers
 */
export async function GET(request: NextRequest) {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        _count: {
          select: { chasers: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json({
      customers,
      total: customers.length
    });
    
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

