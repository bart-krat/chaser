import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with customer data...\n');

  // Real customer
  const bart = await prisma.customer.upsert({
    where: { email: 'bart.kratochvil@hotmail.com' },
    update: {},
    create: {
      email: 'bart.kratochvil@hotmail.com',
      name: 'Bart Kratochvil',
      phone: '+1 (555) 100-0001',
      company: 'Synativ',
      notes: 'Primary contact'
    }
  });
  console.log(`✅ Created/Updated: ${bart.name}`);

  // Dummy customers
  const dummyCustomers = [
    {
      email: 'john.smith@techcorp.com',
      name: 'John Smith',
      phone: '+1 (555) 200-0001',
      company: 'TechCorp Industries',
      notes: 'Finance team lead'
    },
    {
      email: 'sarah.johnson@innovate.io',
      name: 'Sarah Johnson',
      phone: '+1 (555) 200-0002',
      company: 'Innovate Solutions',
      notes: 'CEO'
    },
    {
      email: 'michael.chen@greenfield.com',
      name: 'Michael Chen',
      phone: '+1 (555) 200-0003',
      company: 'Greenfield Enterprises',
      notes: 'Accounting manager'
    },
    {
      email: 'emma.williams@nexus.co',
      name: 'Emma Williams',
      phone: '+1 (555) 200-0004',
      company: 'Nexus Partners',
      notes: 'CFO'
    },
    {
      email: 'james.rodriguez@summit.com',
      name: 'James Rodriguez',
      phone: '+1 (555) 200-0005',
      company: 'Summit Financial',
      notes: 'Tax department'
    },
    {
      email: 'olivia.taylor@brightside.io',
      name: 'Olivia Taylor',
      phone: '+1 (555) 200-0006',
      company: 'Brightside Consulting',
      notes: 'Operations director'
    },
    {
      email: 'david.lee@quantum.tech',
      name: 'David Lee',
      phone: '+1 (555) 200-0007',
      company: 'Quantum Technologies',
      notes: 'Compliance officer'
    },
    {
      email: 'sophia.martinez@apex.com',
      name: 'Sophia Martinez',
      phone: '+1 (555) 200-0008',
      company: 'Apex Corporation',
      notes: 'Finance assistant'
    },
    {
      email: 'robert.brown@velocity.co',
      name: 'Robert Brown',
      phone: '+1 (555) 200-0009',
      company: 'Velocity Ventures',
      notes: 'Business owner'
    },
    {
      email: 'lisa.anderson@zenith.com',
      name: 'Lisa Anderson',
      phone: '+1 (555) 200-0010',
      company: 'Zenith Group',
      notes: 'Controller'
    }
  ];

  for (const customerData of dummyCustomers) {
    const customer = await prisma.customer.upsert({
      where: { email: customerData.email },
      update: {},
      create: customerData
    });
    console.log(`✅ Created/Updated: ${customer.name} (${customer.company})`);
  }

  const totalCustomers = await prisma.customer.count();
  console.log(`\n🎉 Seeding complete! Total customers: ${totalCustomers}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

