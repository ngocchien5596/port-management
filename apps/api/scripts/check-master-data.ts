import prisma from '../src/lib/prisma';

async function checkData() {
    const equipments = await prisma.equipment.findMany();
    const vessels = await prisma.vessel.findMany();
    const products = await prisma.product.findMany();
    const lanes = await prisma.lane.findMany();

    console.log('--- EQUIPMENTS ---');
    console.log(JSON.stringify(equipments, null, 2));
    console.log('--- VESSELS ---');
    console.log(JSON.stringify(vessels, null, 2));
    console.log('--- PRODUCTS ---');
    console.log(JSON.stringify(products, null, 2));
    console.log('--- LANES ---');
    console.log(JSON.stringify(lanes, null, 2));
}

checkData();
