import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/customers/[id] - Get a specific customer
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        chasers: {
          include: {
            schedule: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
    
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(customer);
    
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/customers/[id] - Update a customer
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const customer = await prisma.customer.update({
      where: { id: params.id },
      data: body
    });
    
    return NextResponse.json(customer);
    
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/customers/[id] - Delete a customer
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if customer has active chasers
    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { chasers: true }
        }
      }
    });
    
    if (customer && customer._count.chasers > 0) {
      return NextResponse.json(
        { error: `Cannot delete customer with ${customer._count.chasers} active chasers` },
        { status: 400 }
      );
    }
    
    await prisma.customer.delete({
      where: { id: params.id }
    });
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}

