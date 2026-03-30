import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';

export class ProductController {
    static async getAll(req: Request, res: Response) {
        try {
            const { type } = req.query;
            const products = type
                ? await ProductService.getByType(type as string)
                : await ProductService.getAll();
            res.json(products);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const product = await ProductService.create(req.body);
            res.status(201).json(product);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const product = await ProductService.update(req.params.id, req.body);
            res.json(product);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            await ProductService.delete(req.params.id);
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

}
