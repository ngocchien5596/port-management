import prisma from '../lib/prisma';

export class ProductService {
    static async getAll() {
        return prisma.product.findMany({
            orderBy: { name: 'asc' }
        });
    }

    static async getByType(type: string) {
        return prisma.product.findMany({
            where: { type },
            orderBy: { name: 'asc' }
        });
    }

    static async create(data: { code: string; name: string; unit?: string; type: string }) {
        return prisma.product.create({
            data
        });
    }

    static async update(id: string, data: Partial<{ name: string; unit: string; type: string }>) {
        return prisma.product.update({
            where: { id },
            data
        });
    }

    static async delete(id: string) {
        // Check if product is used in any Voyage
        const voyageCount = await prisma.voyage.count({
            where: { productId: id }
        });

        if (voyageCount > 0) {
            throw new Error(`Không thể xóa hàng hóa này vì đang được sử dụng trong ${voyageCount} chuyến tàu.`);
        }

        return prisma.product.delete({
            where: { id }
        });
    }
}
