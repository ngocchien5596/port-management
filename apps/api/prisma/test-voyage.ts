import { PrismaClient } from '@prisma/client';
import { VoyageService } from './src/services/voyage.service';

const prisma = new PrismaClient();

async function main() {
    // 1. Find voyage 12
    const voyage12 = await prisma.voyage.findFirst({
        where: { voyageCode: 12 }
    });
    if (!voyage12) {
        console.log("Cannot find voyage 12");
        return;
    }

    console.log(`Found Voyage 12: id = ${voyage12.id}`);

    // 2. Call recalculate
    try {
        console.log("Calling recalculate...");
        await VoyageService.recalculateProgressAndEtd(voyage12.id);
        console.log("Recalculate done.");
    } catch (e) {
        console.log("Error:", e);
    }
}

main().finally(() => prisma.$disconnect());
