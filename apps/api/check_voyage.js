
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkVoyage34() {
  try {
    const voyage = await prisma.voyage.findFirst({
        where: { voyageCode: 34 },
        include: { progress: true }
    });

    if (!voyage) {
        console.log('Voyage 34 not found');
        return;
    }

    console.log('--- Voyage #34 Info ---');
    console.log(`ID: ${voyage.id}`);
    console.log(`Status: ${voyage.status}`);
    console.log(`Total Volume: ${voyage.totalVolume}`);
    
    let totalProgress = 0;
    console.log('\n--- Progress Entries ---');
    voyage.progress.forEach(p => {
        console.log(`- Amount: ${p.amount}, Cumulative: ${p.cumulative}, Created: ${p.createdAt}`);
        totalProgress += Number(p.amount);
    });
    
    console.log(`\nComputed Total Progress: ${totalProgress}`);
    console.log(`Target Volume: ${Number(voyage.totalVolume)}`);
    console.log(`Condition (totalProgress < target): ${totalProgress < Number(voyage.totalVolume)}`);
    
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVoyage34();
