
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkVoyage34Detail() {
  try {
    const voyage = await prisma.voyage.findFirst({
        where: { voyageCode: 34 },
        include: { progress: true }
    });

    if (!voyage) {
        console.log('Voyage 34 not found');
        return;
    }

    const targetVolume = voyage.totalVolume;
    const progressAmounts = voyage.progress.map(p => p.amount);
    
    console.log('Voyage 34 Target Volume Type:', typeof targetVolume, targetVolume.constructor.name);
    console.log('Voyage 34 Target Volume Value:', targetVolume.toString());
    
    let sum = 0;
    voyage.progress.forEach(p => {
        console.log(`Progress ID: ${p.id}, Amount Type: ${typeof p.amount}, Value: ${p.amount.toString()}`);
        sum += Number(p.amount);
    });
    
    console.log('Sum as Number:', sum);
    console.log('Target as Number:', Number(targetVolume));
    console.log('Diff:', Number(targetVolume) - sum);
    console.log('Is Sum < Target:', sum < Number(targetVolume));
    
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVoyage34Detail();
