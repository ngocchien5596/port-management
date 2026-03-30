const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Inspecting Voyage Dates ---');
    const voyages = await prisma.voyage.findMany({
        take: 3,
        select: {
            id: true,
            voyageCode: true,
            eta: true,
            etd: true,
            createdAt: true
        }
    });
    console.log(JSON.stringify(voyages, null, 2));

    console.log('\n--- Current Server Time ---');
    console.log('new Date():', new Date().toISOString());
    console.log('Date.now():', Date.now());
}

main().catch(console.error).finally(() => prisma.$disconnect());
