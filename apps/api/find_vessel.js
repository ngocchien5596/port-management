
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findVessel34() {
  try {
    const vessels = await prisma.vessel.findMany({
        where: {
            OR: [
                { code: { contains: '34' } },
                { name: { contains: '34' } }
            ]
        },
        include: { voyages: { include: { progress: true } } }
    });

    console.log(`Found ${vessels.length} vessels matching "34"`);
    vessels.forEach(v => {
        console.log(`\n--- Vessel: ${v.code} (${v.name}) ---`);
        v.voyages.forEach(voyage => {
            const totalProgress = voyage.progress.reduce((sum, p) => sum + Number(p.amount), 0);
            console.log(`  Voyage Code: ${voyage.voyageCode}, Status: ${voyage.status}, Total Volume: ${voyage.totalVolume}, Progress Sum: ${totalProgress}`);
        });
    });
    
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

findVessel34();
