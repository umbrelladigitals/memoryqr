import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔍 Checking customers...');
    const customers = await prisma.customer.findMany();
    console.log('Customers found:', customers.length);
    customers.forEach(customer => {
      console.log(`- ID: ${customer.id}, Email: ${customer.email}, Name: ${customer.name}`);
    });
    
    console.log('\n🔍 Checking admin users...');
    const admins = await prisma.admin.findMany();
    console.log('Admins found:', admins.length);
    admins.forEach(admin => {
      console.log(`- ID: ${admin.id}, Email: ${admin.email}, Name: ${admin.name}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
