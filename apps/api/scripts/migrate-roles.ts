import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Bắt đầu di chuyển Vai trò (Role Migration - Raw SQL) ---');

  // 1. Cập nhật các Role quản trị hiện có sang MANAGER
  // Sử dụng Raw SQL để tránh lỗi Enum validation của Prisma Client
  const managersCount = await prisma.$executeRaw`
    UPDATE "Account" 
    SET "role" = 'MANAGER' 
    WHERE "role"::text IN ('ADMIN_SYSTEM', 'HR', 'PORT_OPERATOR')
  `;
  console.log(`✅ Đã cập nhật ${managersCount} tài khoản sang MANAGER.`);

  // 2. Cập nhật các Role còn lại sang STAFF
  const staffCount = await prisma.$executeRaw`
    UPDATE "Account" 
    SET "role" = 'STAFF' 
    WHERE "role"::text IN ('EMPLOYEE', 'ADMIN_KITCHEN')
  `;
  console.log(`✅ Đã cập nhật ${staffCount} tài khoản sang STAFF.`);

  console.log('--- Hoàn tất di chuyển Vai trò ---');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi thực thi script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
