import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Fetching system shift configurations...');
    const configs = await prisma.systemConfig.findMany({
        where: {
            key: {
                in: ['SHIFT_1_START', 'SHIFT_2_START', 'SHIFT_3_START']
            }
        }
    });

    const s1 = configs.find(c => c.key === 'SHIFT_1_START')?.value || '06:00';
    const s2 = configs.find(c => c.key === 'SHIFT_2_START')?.value || '14:00';
    const s3 = configs.find(c => c.key === 'SHIFT_3_START')?.value || '22:00';

    const parseTime = (t: string) => {
        const [h, m] = t.split(':').map(Number);
        return h + (m || 0) / 60;
    };

    const t1 = parseTime(s1);
    const t2 = parseTime(s2);
    const t3 = parseTime(s3);

    console.log(`Shift settings: CA_1 (${s1}), CA_2 (${s2}), CA_3 (${s3})`);

    console.log('Finding VoyageProgress records with missing shiftCode...');
    const progressRecords = await prisma.voyageProgress.findMany({
        where: {
            shiftCode: null
        }
    });

    console.log(`Found ${progressRecords.length} records to update.`);

    if (progressRecords.length === 0) {
        console.log('Nothing to do!');
        return;
    }

    let updatedCount = 0;

    for (const record of progressRecords) {
        // Use endTime if available; else fallback to startTime or createdAt
        const referenceDate = record.endTime || record.startTime || record.createdAt;
        const currentHour = referenceDate.getHours();
        const currentMinute = referenceDate.getMinutes();
        const currentTimeDecimal = currentHour + currentMinute / 60;

        let shiftToAssign = 'CA_3';
        if (currentTimeDecimal >= t1 && currentTimeDecimal < t2) shiftToAssign = 'CA_1';
        else if (currentTimeDecimal >= t2 && currentTimeDecimal < t3) shiftToAssign = 'CA_2';

        await prisma.voyageProgress.update({
            where: { id: record.id },
            data: { shiftCode: shiftToAssign }
        });

        updatedCount++;
        process.stdout.write(`\rProgress: ${updatedCount} / ${progressRecords.length}`);
    }

    console.log('\n✅ Script completed successfully!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
