import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('📦 Bắt đầu xuất dữ liệu mẫu từ DB hiện tại...');

    const employees = await prisma.employee.findMany();
    const accounts = await prisma.account.findMany();
    const vessels = await prisma.vessel.findMany();
    const products = await prisma.product.findMany();

    // Đối với Equipment, chúng ta cần cẩn thận quan hệ many-to-many với Product
    const lanes = await prisma.lane.findMany();
    const equipments = await prisma.equipment.findMany({
        include: {
            products: true
        }
    });

    const seedData = {
        employees,
        accounts,
        vessels,
        products,
        lanes,
        equipments
    };

    const outputPath = path.resolve(__dirname, '../prisma/seed-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(seedData, null, 2), 'utf-8');

    console.log(`✅ Xuất dữ liệu thành công ra file: ${outputPath}`);
}

main()
    .catch((e) => {
        console.error('❌ Có lỗi xảy ra khi export data:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
