import prisma from '../src/lib/prisma';
import { subDays, setHours, setMinutes } from 'date-fns';

async function seed() {
    console.log('🌱 Seeding Sample Operational Data...');

    try {
        const now = new Date();
        const dMinus2 = subDays(now, 2); // Mar 23 (if today is 25)
        const dMinus3 = subDays(now, 3); // Mar 22
        const dMinus1 = subDays(now, 1); // Mar 24

        // Scenario 1: Mar 22 - Cẩu điện (35 t/h)
        const v1 = await prisma.voyage.create({
            data: {
                vesselId: "ba8846ad-fc89-4989-82a2-5714f1c4c0fb", // VS-OOCL1
                productId: "092fe04d-5c75-4974-b68a-7849da10f2f3", // Than
                equipmentId: "cmmt1ah1o0009v2a3v2qlqg3c", // Cẩu điện
                laneId: "cmmt191i20002v2a3iyqx6ox8", // Luồng 3
                type: "IMPORT",
                status: "HOAN_THANH",
                totalVolume: 70,
                actualArrival: setHours(dMinus3, 8),
                actualDeparture: setHours(dMinus3, 18),
            }
        });

        await prisma.voyageProgress.createMany({
            data: [
                {
                    voyageId: v1.id,
                    amount: 30,
                    hours: 1,
                    startTime: setHours(dMinus3, 9),
                    endTime: setHours(dMinus3, 10),
                    shiftCode: "CA_1",
                    cumulative: 30
                },
                {
                    voyageId: v1.id,
                    amount: 40,
                    hours: 1.2,
                    startTime: setHours(dMinus3, 14),
                    endTime: setMinutes(setHours(dMinus3, 15), 12),
                    shiftCode: "CA_2",
                    cumulative: 70
                }
            ]
        });

        // Scenario 2: Mar 23 - Cẩu 173BS (45 t/h)
        const v2 = await prisma.voyage.create({
            data: {
                vesselId: "b0637692-afc1-48d3-8ae5-3afaf82c25c3", // VS-MSAE1
                productId: "f4a5896a-fcbc-49ec-b49c-676a74df240e", // Clinker
                equipmentId: "cmmt1bi18000dv2a336ritbs7", // Cẩu 173BS
                laneId: "cmmt195720003v2a33tx27b5p", // Luồng 4
                type: "EXPORT",
                status: "HOAN_THANH",
                totalVolume: 90,
                actualArrival: setHours(dMinus2, 7),
                actualDeparture: setHours(dMinus2, 20),
            }
        });

        await prisma.voyageProgress.createMany({
            data: [
                {
                    voyageId: v2.id,
                    amount: 50,
                    hours: 1,
                    startTime: setHours(dMinus2, 8),
                    endTime: setHours(dMinus2, 9),
                    shiftCode: "CA_1",
                    cumulative: 50
                },
                {
                    voyageId: v2.id,
                    amount: 40,
                    hours: 1,
                    startTime: setHours(dMinus2, 13),
                    endTime: setHours(dMinus2, 14),
                    shiftCode: "CA_2",
                    cumulative: 90
                }
            ]
        });

        // Scenario 3: Mar 24 - Cẩu 115GC01 (25 t/h)
        const v3 = await prisma.voyage.create({
            data: {
                vesselId: "17135c6d-b802-4da0-84fa-14273951c156", // VS-BLK2
                productId: "092fe04d-5c75-4974-b68a-7849da10f2f3", // Than
                equipmentId: "cmmt19pl40005v2a3295pkqlp", // Cẩu 115GC01
                laneId: "cmmt18tda0000v2a30h8gh71d", // Luồng 1
                type: "IMPORT",
                status: "HOAN_THANH",
                totalVolume: 60,
                actualArrival: setHours(dMinus1, 10),
                actualDeparture: setHours(dMinus1, 23),
            }
        });

        await prisma.voyageProgress.createMany({
            data: [
                {
                    voyageId: v3.id,
                    amount: 60,
                    hours: 3,
                    startTime: setHours(dMinus1, 11),
                    endTime: setHours(dMinus1, 14),
                    shiftCode: "CA_1",
                    cumulative: 60
                }
            ]
        });

        console.log('✅ Sample data seeded successfully!');
        console.log('- 3 Voyages created');
        console.log('- 5 Progress logs created');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
