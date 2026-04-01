const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkActiveVoyages() {
  try {
    const voyages = await prisma.voyage.findMany({
        where: {
            status: { notIn: ['HOAN_THANH', 'HUY_BO'] }
        },
        include: {
            lane: true,
            equipment: true
        }
    });

    console.log(`Found ${voyages.length} active voyages.\n`);

    voyages.forEach(v => {
      console.log(`--- Voyage: ${v.voyageCode || v.id} ---`);
      console.log(`Status: ${v.status}`);
      console.log(`Lane: ${v.lane?.name || 'N/A'}`);
      console.log(`Equipment: ${v.equipment?.name || 'NONE'}`);
      console.log(`Capacity: ${v.equipment?.capacity || 'N/A'}`);
      console.log(`Total Volume: ${v.totalVolume}`);
      console.log(`ETA: ${v.eta}`);
      console.log(`ETD: ${v.etd}`);
      console.log('---------------------------\n');
    });

  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkActiveVoyages();
