import prisma from './src/lib/prisma';

async function main() {
    const incidents = await prisma.incident.findMany({
        where: { scope: 'EQUIPMENT' },
        orderBy: { startTime: 'desc' },
        take: 5
    });
    console.log("RECENT EQUIPMENT INCIDENTS:");
    console.log(JSON.stringify(incidents, null, 2));
}

main().finally(() => prisma.$disconnect());
