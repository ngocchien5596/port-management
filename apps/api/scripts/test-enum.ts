import { PrismaClient, Role } from '@prisma/client';

async function main() {
  console.log('Available Roles in Client:', Object.values(Role));
  const prisma = new PrismaClient();
  try {
    const accounts = await prisma.account.findMany({ take: 1 });
    console.log('Successfully queried accounts.');
  } catch (error) {
    console.error('Query Failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
