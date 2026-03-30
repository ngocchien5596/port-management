import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Cleaning up old voyage data...');
    // Clean up current dummy data we created earlier if any
    await prisma.voyageProgress.deleteMany({});
    await prisma.voyageEvent.deleteMany({});
    await prisma.incident.deleteMany({ where: { scope: 'VOYAGE' } });
    await prisma.voyage.deleteMany({});

    // Also try to clean up the dummy equipment and product if they aren't used elsewhere
    try {
        await prisma.equipment.deleteMany({ where: { name: { in: ['CẨU SIÊU TRỌNG QC-01', '115GC01', 'CẨU BÁNH XÍCH'] } } });
        await prisma.product.deleteMany({ where: { code: { in: ['IRON_ORE_01', 'COAL_IMPORT_01'] } } });
        await prisma.lane.deleteMany({ where: { name: { in: ['A1-LUỒNG_XUẤT', 'Luồng 1'] } } });
        await prisma.vessel.deleteMany({ where: { code: 'MSC-OSCAR' } });
    } catch (e) {
        console.log('Skipped deleting some dummy configs because they might be in use or already deleted.');
    }

    console.log('🌱 Generating Voyage using specific IDs...');

    const productId = '419cd9b4-d27c-44ea-9423-2a6a56f7b250'; // Than
    const laneId = 'cmlny3nhw0009baxwkwcwplc0'; // Luong 1
    const equipmentId = 'cmlny6eyz000ebaxwoqh79gb7'; // 115GC01

    // Verify existing entities
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error(`Product ${productId} not found!`);

    const lane = await prisma.lane.findUnique({ where: { id: laneId } });
    if (!lane) throw new Error(`Lane ${laneId} not found!`);

    const equipment = await prisma.equipment.findUnique({ where: { id: equipmentId } });
    if (!equipment) throw new Error(`Equipment ${equipmentId} not found!`);

    // Ensure the equipment is connected to the product so capacity isn't zero
    await prisma.equipment.update({
        where: { id: equipmentId },
        data: {
            laneId: lane.id, // Ensure it's in Luong 1
            products: {
                connect: { id: productId }
            }
        }
    });

    // We need a vessel to create a voyage. 
    // Usually these come from real DB or seed, here we create dummy.
    let vessel = await prisma.vessel.findFirst();
    if (!vessel) {
        vessel = await prisma.vessel.create({
            data: {
                code: 'V_TEST_01',
                customerName: 'Customer A'
            }
        })
    }

    const testProduct = await prisma.product.findFirst();
    const testLane = await prisma.lane.findFirst();

    // 3. Create Voyage (Volume: 200 Tons)
    const now = new Date();
    const startTime = new Date(now.getTime() - 3.5 * 60 * 60 * 1000); // 3.5 hours ago

    const voyage = await prisma.voyage.create({
        data: {
            voyageCode: Math.floor(1000 + Math.random() * 9000),
            vesselId: vessel.id,
            laneId: testLane?.id || lane.id, // Use testLane if available, otherwise original lane
            equipmentId: equipment.id,
            productId: testProduct?.id || product.id, // Use testProduct if available, otherwise original product
            type: 'IMPORT',
            status: 'LAM_HANG',
            priority: 'HIGH',
            totalVolume: 200, // Volume as requested
            actualArrival: startTime,
            eta: startTime,
        },
    });

    // 4. Generate Progress Logs
    // Total 135 tons over 3 hours to simulate an ongoing voyage.
    const progressData = [
        { hours: 1, amount: 40, cumulative: 40, note: 'Khởi động chậm do kiểm tra an toàn hầm hàng' }, // 1st Hour
        { hours: 1, amount: 55, cumulative: 95, note: 'Vận hành ổn định, tốc độ bốc tốt' },          // 2nd Hour
        { hours: 1, amount: 40, cumulative: 135, note: 'Giảm tốc chờ xe tải' },                      // 3rd Hour
    ];

    let currentLogTime = new Date(startTime.getTime());
    const account = await prisma.account.findFirst();

    for (const log of progressData) {
        currentLogTime = new Date(currentLogTime.getTime() + log.hours * 60 * 60 * 1000);
        await prisma.voyageProgress.create({
            data: {
                voyageId: voyage.id,
                amount: log.amount,
                hours: log.hours,
                productivity: log.amount / log.hours,
                cumulative: log.cumulative,
                notes: log.note,
                userId: account?.employeeId || null,
                createdAt: currentLogTime,
            }
        });
    }

    console.log('\n✅ CHUYẾN TÀU MẪU ĐÃ ĐƯỢC TẠO THÀNH CÔNG!');
    console.log('--------------------------------------');
    console.log(`📦 Hàng hóa:   ${product.name} (Tải trọng: 200 Tấn)`);
    console.log(`📍 Luồng:      ${lane.name}`);
    console.log(`🏗️ Thiết bị:   ${equipment.name} (Công suất: ${equipment.capacity} tấn/giờ)`);
    console.log(`🕒 Bắt đầu:    ${startTime.toLocaleTimeString('vi-VN')} (${Math.round((now.getTime() - startTime.getTime()) / 36000) / 100} giờ trước)`);
    console.log(`⏳ Đã làm:     135 Tấn`);
    console.log(`🆔 ID Chuyến:  ${voyage.id}`);
    console.log('--------------------------------------\n');
}

main()
    .catch((e) => {
        console.error('❌ Thất bại:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
