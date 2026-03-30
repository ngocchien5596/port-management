import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Finding voyages with null equipmentId...');
    const voyages = await prisma.voyage.findMany({
        where: { equipmentId: null },
        include: { lane: true }
    });

    console.log(`Found ${voyages.length} voyages with null equipment.`);

    for (const voyage of voyages) {
        if (!voyage.laneId) continue;

        const equipment = await prisma.equipment.findFirst({
            where: {
                laneId: voyage.laneId,
                manualStatus: { not: 'REPAIR' }
            }
        });

        if (equipment) {
            console.log(`Updating voyage ${voyage.voyageCode} with equipment ${equipment.name}`);
            await prisma.voyage.update({
                where: { id: voyage.id },
                data: { equipmentId: equipment.id }
            });
        }
    }

    console.log('Update complete.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
