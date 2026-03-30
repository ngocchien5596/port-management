import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Creating admin account 480190...');

    const passwordHash = await bcrypt.hash('123456', 10);

    const adminEmployee = await prisma.employee.upsert({
        where: { employeeCode: '480190' },
        update: {},
        create: {
            employeeCode: '480190',
            fullName: 'Admin 480190',
            email: 'admin480190@company.com',
        },
    });

    await prisma.account.upsert({
        where: { employeeId: adminEmployee.id },
        update: {
            passwordHash,
            role: Role.ADMIN_SYSTEM,
        },
        create: {
            employeeId: adminEmployee.id,
            passwordHash,
            secretCode: '123456',
            role: Role.ADMIN_SYSTEM,
        },
    });

    console.log('✅ Admin account 480190 created successfully!');
    console.log('Account: 480190');
    console.log('Password: 123456');
}

main()
    .catch((e) => {
        console.error('❌ Failed to create admin account:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
