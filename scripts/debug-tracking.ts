import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Checking Voyage ---');
    const voyage = await prisma.voyage.findFirst({
        where: {
            voyageCode: 17
        },
        include: {
            vessel: true
        }
    });

    if (voyage) {
        console.log('Found voyage:', JSON.stringify(voyage, null, 2));
        console.log('Vessel customerPhone:', voyage.vessel.customerPhone);
    } else {
        console.log('No voyage found with voyageCode 17');
    }

    console.log('\n--- Checking Vessel by Phone ---');
    const vessels = await prisma.vessel.findMany({
        where: {
            customerPhone: '0945678901'
        }
    });
    console.log('Vessels found with phone 0945678901:', vessels.length);
    if (vessels.length > 0) {
        vessels.forEach(v => console.log(`- ${v.name} (${v.code})`));
    }

    await prisma.$disconnect();
}

main();
