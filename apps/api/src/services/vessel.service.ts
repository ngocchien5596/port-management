import prisma from '../lib/prisma';

export class VesselService {
    static async getAll() {
        return prisma.vessel.findMany({
            orderBy: { customerName: 'asc' }
        });
    }

    static async getById(id: string) {
        return prisma.vessel.findUnique({
            where: { id }
        });
    }

    static async create(data: { code: string; name?: string; customerName: string; capacity?: number; customerPhone?: string }) {
        return prisma.vessel.create({
            data
        });
    }

    static async update(id: string, data: Partial<{ name: string; customerName: string; capacity: number; customerPhone: string }>) {
        return prisma.vessel.update({
            where: { id },
            data
        });
    }

    static async delete(id: string) {
        return prisma.vessel.delete({
            where: { id }
        });
    }
}
