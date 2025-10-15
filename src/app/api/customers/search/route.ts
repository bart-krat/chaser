import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/customers/search?q=search_term
 * Search customers by name or email
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    
    if (!query || query.length < 2) {
      return NextResponse.json({
        customers: [],
        message: 'Query must be at least 2 characters'
      });
    }
    
    // Search customers by name or email
    // Note: SQLite doesn't support 'mode: insensitive', so we'll search as-is
    // For case-insensitive search with SQLite, we need to handle it differently
    const lowerQuery = query.toLowerCase();
    
    const allCustomers = await prisma.customer.findMany();
    
    // Filter in JavaScript for case-insensitive search (SQLite limitation)
    const customers = allCustomers
      .filter(customer => 
        customer.name.toLowerCase().includes(lowerQuery) ||
        customer.email.toLowerCase().includes(lowerQuery) ||
        (customer.company && customer.company.toLowerCase().includes(lowerQuery))
      )
      .slice(0, 10) // Limit to 10 results
      .sort((a, b) => a.name.localeCompare(b.name));
    
    return NextResponse.json({
      customers,
      total: customers.length
    });
    
  } catch (error) {
    console.error('Error searching customers:', error);
    return NextResponse.json(
      { error: 'Failed to search customers' },
      { status: 500 }
    );
  }
}

