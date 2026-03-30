const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const nodeTime = new Date().toISOString();
    const dbTimeResult = await prisma.$queryRaw`SELECT NOW() as now, CURRENT_TIMESTAMP as ct`;
    const dbTime = dbTimeResult[0].now;

    console.log('Node Time (ISO):', nodeTime);
    console.log('DB Time (Raw):  ', dbTime);
    console.log('DB Time (ISO):  ', new Date(dbTime).toISOString());
}

main().catch(console.error).finally(() => prisma.$disconnect());
