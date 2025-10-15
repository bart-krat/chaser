import { NextResponse } from 'next/server';

// Import the same store (they share the same reference)
// Note: This only works because they're in the same process
export async function GET() {
  // We can't directly import the store from route.ts, 
  // so let's make a new endpoint to check
  
  return NextResponse.json({
    message: "To see your chasers, visit /api/chasers",
    note: "Current storage is in-memory and will be lost on restart"
  });
}

