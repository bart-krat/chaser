// Test script to see AI email generation in action
// Load environment variables from .env.local
import { config } from 'dotenv';
import path from 'path';

// Load .env.local file
config({ path: path.join(process.cwd(), '.env.local') });

import { generateEmailWithAI, generateSubjectWithAI } from '../services/aiContentGenerator';

async function test() {
  console.log('🧪 Testing AI Email Generation\n');
  console.log('=' .repeat(60));
  
  const testParams = {
    contactName: 'Bart Kratochvil',
    documents: `Bank statements in PDF format confirming bank balances at 30.09.2025.
The last sale invoice in Xero is Inv-5 from 12.06.2025. If you issued any invoices after that, please send these to me.
Purchase invoices:
- Payment to Lawdepot on 20.09.25 on £47.00 - I can see an order confirmation in DEXT, but it doesn't mention VAT. Could you check if you have an invoice for this payment?
- Payment to Adyen on 17.09.2025 £80.00 - please send an invoice for this payment.`,
    task: 'Prepare VAT for Q3/2025',
    urgency: 'High',
    attemptNumber: 1
  };
  
  console.log('\n📋 Test Parameters:');
  console.log(JSON.stringify(testParams, null, 2));
  console.log('\n' + '='.repeat(60));
  
  // Test email body generation
  console.log('\n🤖 Generating email body...\n');
  const emailBody = await generateEmailWithAI(testParams);
  
  console.log('📧 Generated Email Body:');
  console.log('─'.repeat(60));
  console.log(emailBody);
  console.log('─'.repeat(60));
  
  // Test subject line generation
  console.log('\n🤖 Generating subject line...\n');
  const subject = await generateSubjectWithAI(testParams);
  
  console.log('📬 Generated Subject:');
  console.log('─'.repeat(60));
  console.log(subject);
  console.log('─'.repeat(60));
  
  // Show complete email
  console.log('\n✉️  COMPLETE EMAIL:');
  console.log('='.repeat(60));
  console.log(`To: ${testParams.contactName}`);
  console.log(`Subject: ${subject}`);
  console.log('');
  console.log(emailBody);
  console.log('='.repeat(60));
  
  console.log('\n✅ Test complete!\n');
}

test()
  .catch((error) => {
    console.error('❌ Test failed:', error);
    console.log('\n💡 Make sure you have OPENAI_API_KEY in your .env.local file!');
    process.exit(1);
  });

