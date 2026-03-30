import prisma from '../src/lib/prisma';

async function purgeData() {
    console.log('🚀 Starting Operational Data Purge...');

    try {
        // 1. Delete VoyageProgress
        const progressCount = await prisma.voyageProgress.deleteMany({});
        console.log(`✅ Deleted ${progressCount.count} VoyageProgress records.`);

        // 2. Delete VoyageEvents
        const eventCount = await prisma.voyageEvent.deleteMany({});
        console.log(`✅ Deleted ${eventCount.count} VoyageEvent records.`);

        // 3. Delete Notifications
        const notifCount = await prisma.notification.deleteMany({});
        console.log(`✅ Deleted ${notifCount.count} Notification records.`);

        // 4. Handle Incident Hierarchy and Delete
        // Break self-referential links first to avoid NoAction constraints
        await prisma.incident.updateMany({
            data: { parentId: null }
        });
        const incidentCount = await prisma.incident.deleteMany({});
        console.log(`✅ Deleted ${incidentCount.count} Incident records.`);

        // 5. Delete Voyages
        const voyageCount = await prisma.voyage.deleteMany({});
        console.log(`✅ Deleted ${voyageCount.count} Voyage records.`);

        console.log('\n✨ Data purge completed successfully.');
        console.log('Environment is now reset for operational data.');

    } catch (error) {
        console.error('❌ Error during data purge:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

purgeData();
