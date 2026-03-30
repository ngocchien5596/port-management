
import { VoyageService } from './apps/api/src/services/voyage.service';

async function test() {
    const id = 'c2d5255c-3aa5-4ec4-b10e-d70d86d349b3';
    console.log(`Testing VoyageService.getById for ID: ${id}`);
    try {
        const voyage = await VoyageService.getById(id);
        console.log('Success:', JSON.stringify(voyage, null, 2));
    } catch (error) {
        console.error('Error caught in service call:');
        console.error(error);
    }
}

test();
