import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Bắt đầu Seeding database từ dữ liệu mẫu...');

    const dataPath = path.resolve(__dirname, 'seed-data.json');
    if (!fs.existsSync(dataPath)) {
        console.warn('⚠️ Không tìm thấy file seed-data.json. Bỏ qua seeding.');
        return;
    }

    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const db = JSON.parse(rawData);

    // 1. Khôi phục Employees
    if (db.employees && db.employees.length > 0) {
        for (const emp of db.employees) {
            await prisma.employee.upsert({
                where: { id: emp.id },
                update: {
                    employeeCode: emp.employeeCode,
                    fullName: emp.fullName,
                    email: emp.email,
                },
                create: {
                    id: emp.id,
                    employeeCode: emp.employeeCode,
                    fullName: emp.fullName,
                    email: emp.email,
                }
            });
        }
        console.log(`✅ Khôi phục ${db.employees.length} nhân viên (Employees)`);
    }

    // 2. Khôi phục Accounts
    if (db.accounts && db.accounts.length > 0) {
        for (const acc of db.accounts) {
            await prisma.account.upsert({
                where: { id: acc.id },
                update: {
                    passwordHash: acc.passwordHash,
                    secretCode: acc.secretCode,
                    role: acc.role,
                    isActive: acc.isActive,
                },
                create: {
                    id: acc.id,
                    employeeId: acc.employeeId,
                    passwordHash: acc.passwordHash,
                    secretCode: acc.secretCode,
                    role: acc.role,
                    isActive: acc.isActive,
                }
            });
        }
        console.log(`✅ Khôi phục ${db.accounts.length} tài khoản (Accounts)`);
    }

    // 3. Khôi phục Lanes
    if (db.lanes && db.lanes.length > 0) {
        for (const lane of db.lanes) {
            await prisma.lane.upsert({
                where: { id: lane.id },
                update: { name: lane.name },
                create: {
                    id: lane.id,
                    name: lane.name
                }
            });
        }
        console.log(`✅ Khôi phục ${db.lanes.length} bến lệnh (Lanes)`);
    }

    // 4. Khôi phục Products
    if (db.products && db.products.length > 0) {
        for (const prod of db.products) {
            await prisma.product.upsert({
                where: { id: prod.id },
                update: {
                    code: prod.code,
                    name: prod.name,
                    unit: prod.unit,
                    type: prod.type
                },
                create: {
                    id: prod.id,
                    code: prod.code,
                    name: prod.name,
                    unit: prod.unit,
                    type: prod.type
                }
            });
        }
        console.log(`✅ Khôi phục ${db.products.length} loại hàng (Products)`);
    }

    // 5. Khôi phục Equipments
    if (db.equipments && db.equipments.length > 0) {
        for (const eq of db.equipments) {
            const productConnections = (eq.products || []).map((p: any) => ({ id: p.id }));

            await prisma.equipment.upsert({
                where: { id: eq.id },
                update: {
                    name: eq.name,
                    capacity: eq.capacity,
                    laneId: eq.laneId,
                    manualStatus: eq.manualStatus,
                    products: {
                        set: productConnections
                    }
                },
                create: {
                    id: eq.id,
                    name: eq.name,
                    capacity: eq.capacity,
                    laneId: eq.laneId,
                    manualStatus: eq.manualStatus,
                    products: {
                        connect: productConnections
                    }
                }
            });
        }
        console.log(`✅ Khôi phục ${db.equipments.length} cẩu/thiết bị (Equipments)`);
    }

    // 6. Khôi phục Vessels
    if (db.vessels && db.vessels.length > 0) {
        for (const vessel of db.vessels) {
            await prisma.vessel.upsert({
                where: { id: vessel.id },
                update: {
                    code: vessel.code,
                    name: vessel.name,
                    customerName: vessel.customerName,
                    capacity: vessel.capacity,
                    customerPhone: vessel.customerPhone,
                    imoCode: vessel.imoCode,
                    vesselType: vessel.vesselType
                },
                create: {
                    id: vessel.id,
                    code: vessel.code,
                    name: vessel.name,
                    customerName: vessel.customerName,
                    capacity: vessel.capacity,
                    customerPhone: vessel.customerPhone,
                    imoCode: vessel.imoCode,
                    vesselType: vessel.vesselType
                }
            });
        }
        console.log(`✅ Khôi phục ${db.vessels.length} tàu (Vessels)`);
    }

    console.log('🎉 Quá trình Seed thành công! Dữ liệu mẫu đã được đồng bộ.');
}

main()
    .catch((e) => {
        console.error('❌ Lỗi khi chạy Seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
