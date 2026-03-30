import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🗑️  Clearing all voyage-related data...');

    try {
        const progressCount = await prisma.voyageProgress.deleteMany({});
        const eventCount = await prisma.voyageEvent.deleteMany({});
        const incidentCount = await prisma.incident.deleteMany({
            where: { scope: 'VOYAGE' }
        });
        const voyageCount = await prisma.voyage.deleteMany({});

        console.log(`✅ Success!`);
        console.log(`- Deleted ${progressCount.count} progress logs`);
        console.log(`- Deleted ${eventCount.count} voyage events`);
        console.log(`- Deleted ${incidentCount.count} voyage incidents`);
        console.log(`- Deleted ${voyageCount.count} voyages`);
    } catch (error) {
        console.error('❌ Error clearing data:', error);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
