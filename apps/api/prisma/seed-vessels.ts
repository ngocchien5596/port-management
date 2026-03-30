import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🚢 Creating sample vessel data...');

    const vessels = [
        {
            code: 'VS-OOCL1',
            name: 'OOCL Hong Kong',
            customerName: 'OOCL',
            capacity: 21413,
            imoCode: '9776171',
            vesselType: 'CONTAINER',
            customerPhone: '0901234567'
        },
        {
            code: 'VS-MSAE1',
            name: 'MSC Oscar',
            customerName: 'MSC',
            capacity: 19224,
            imoCode: '9703291',
            vesselType: 'CONTAINER',
            customerPhone: '0912345678'
        },
        {
            code: 'VS-CMA1',
            name: 'CMA CGM Jacques',
            customerName: 'CMA CGM',
            capacity: 23000,
            imoCode: '9839131',
            vesselType: 'CONTAINER',
            customerPhone: '0987654321'
        },
        {
            code: 'VS-BLK1',
            name: 'Berge Stahl',
            customerName: 'Berge Bulk',
            capacity: 364767,
            imoCode: '8420804',
            vesselType: 'BULKER',
            customerPhone: '0934567890'
        },
        {
            code: 'VS-BLK2',
            name: 'Valemax Brasil',
            customerName: 'Vale',
            capacity: 402347,
            imoCode: '9488918',
            vesselType: 'BULKER',
            customerPhone: '0976543210'
        },
        {
            code: 'VS-GEN1',
            name: 'Symphony Star',
            customerName: 'Symphony Shipping',
            capacity: 10500,
            imoCode: '9726669',
            vesselType: 'GENERAL_CARGO',
            customerPhone: '0961234567'
        },
        {
            code: 'VS-TNK1',
            name: 'Seawise Giant',
            customerName: 'Frontline',
            capacity: 564763,
            imoCode: '7381154',
            vesselType: 'TANKER',
            customerPhone: '0923456789'
        },
        {
            code: 'VS-RORO1',
            name: 'Hoegh Target',
            customerName: 'Höegh Autoliners',
            capacity: 8500,
            imoCode: '9684976',
            vesselType: 'RORO',
            customerPhone: '0945678901'
        }
    ];

    console.log(`Adding ${vessels.length} vessels...`);

    let createdCount = 0;
    for (const vessel of vessels) {
        try {
            await prisma.vessel.upsert({
                where: { code: vessel.code },
                update: vessel,
                create: vessel,
            });
            console.log(`✅ Upserted vessel: ${vessel.name} (${vessel.code})`);
            createdCount++;
        } catch (error) {
            console.error(`❌ Failed to upsert vessel ${vessel.code}:`, error);
        }
    }

    console.log(`\n🎉 Successfully completed! Upserted ${createdCount}/${vessels.length} vessels.`);
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
