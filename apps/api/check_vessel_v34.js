
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkVoyage34Vessel() {
  try {
    const voyage = await prisma.voyage.findFirst({
        where: { voyageCode: 34 },
        include: { vessel: true }
    });

    if (voyage) {
        console.log(`Voyage 34 Vessel Code: ${voyage.vessel.code}, Name: ${voyage.vessel.name}, ID: ${voyage.vessel.id}`);
    } else {
        console.log('Voyage 34 not found');
    }
    
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVoyage34Vessel();
