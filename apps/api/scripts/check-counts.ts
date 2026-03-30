import prisma from '../src/lib/prisma';
async function check() {
    console.log('Voyages:', await prisma.voyage.count());
    console.log('Progress:', await prisma.voyageProgress.count());
}
check();
