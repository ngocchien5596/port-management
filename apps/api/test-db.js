
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        const targetId = 'c2d5255c-3aa5-4ec4-b10e-d70d86d349b3'
        console.log(`Attempting to fetch Voyage ID: ${targetId}...`)
        const voyage = await prisma.voyage.findUnique({
            where: { id: targetId },
            include: {
                vessel: true,
                berth: true,
                product: true,
                events: {
                    include: { employee: true }
                },
                progress: {
                    include: { employee: true }
                }
            }
        })
        console.log('Result Success (Voyage ID):', voyage ? voyage.id : 'None found')
        if (voyage) {
            console.log('Full Voyage Data Keys:', Object.keys(voyage))
        }
    } catch (e) {
        console.error('PRISMA ERROR CAUGHT:')
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
