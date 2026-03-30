import prisma from './src/lib/prisma';

async function main() {
    const voyages = await prisma.voyage.findMany({
        where: { voyageCode: 6 },
        include: { equipment: true }
    });
    const v = voyages[0];
    if (!v) {
        console.log('Voyage not found');
        return;
    }
    const startTimeStr = v.actualArrival || v.eta || v.createdAt;
    const startTime = startTimeStr ? new Date(startTimeStr).getTime() : Date.now();
    const procedureHours = Number(v.procedureTimeHours || 0);
    const capacityRaw = (v as any).equipment?.capacity;
    const capacity = Number(capacityRaw || 0);
    const totalVolume = Number(v.totalVolume || 0);
    const durationHours = (totalVolume / capacity) + procedureHours;
    const theoTime = startTime + (durationHours * 60 * 60 * 1000);

    console.log('startTime:', new Date(startTime));
    console.log('procedureHours:', procedureHours);
    console.log('capacity:', capacity);
    console.log('totalVolume:', totalVolume);
    console.log('durationHours:', durationHours);
    console.log('theoTime:', new Date(theoTime));
    console.log('v.etd:', v.etd);
    console.log('Date.now():', new Date());

    const voyageMaxTime = Math.max(v.etd ? v.etd.getTime() : 0, theoTime, Date.now());
    console.log('voyageMaxTime:', new Date(voyageMaxTime));
    console.log('WaitTime ms:', voyageMaxTime - Date.now());
    console.log('WaitTime hours:', (voyageMaxTime - Date.now()) / 3600000);
}
main().catch(console.error).finally(() => prisma.$disconnect());
