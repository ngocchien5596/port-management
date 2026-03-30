
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    try {
        const voyage = await prisma.voyage.findFirst({
            include: { vessel: true }
        })
        console.log('Result:', JSON.stringify(voyage, null, 2))
    } catch (e) {
        console.error('ERROR:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
