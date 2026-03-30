import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- RECENT PROGRESS ---');
    const progs = await prisma.voyageProgress.findMany({
        orderBy: { createdAt: 'desc' },
        include: { voyage: { include: { equipment: true, lane: true } } },
        take: 5
    });

    for (const p of progs) {
        const voyage = p.voyage;
        const capacity = voyage.equipment?.capacity ? Number(voyage.equipment.capacity) : 100;

        let totalAmt = 0;
        let totalHrs = 0;
        const allP = await prisma.voyageProgress.findMany({ where: { voyageId: voyage.id } });
        for (const ap of allP) {
            totalAmt += Number(ap.amount);
            totalHrs += Number(ap.hours) || 1;
        }

        const actualNmph = totalAmt / totalHrs;

        console.log(`Voyage: ${voyage.voyageCode}, Status: ${voyage.status}`);
        console.log(`- Progress: amt=${p.amount}, hrs=${p.hours}`);
        console.log(`- Cumulative: amt=${totalAmt}, hrs=${totalHrs}, NMPH=${actualNmph}`);
        console.log(`- Capacity: ${capacity}`);
        console.log(`- Trigger Alert: ${actualNmph < capacity * 0.8 && voyage.status === 'LAM_HANG' ? 'YES' : 'NO'}`);
        console.log('---');
    }
}

main().finally(() => prisma.$disconnect());
