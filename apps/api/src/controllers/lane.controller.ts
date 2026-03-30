import { Request, Response } from 'express';
import { LaneService } from '../services/lane.service';

export class LaneController {
    static async getAll(req: Request, res: Response) {
        try {
            const lanes = await LaneService.getAll();
            res.json(lanes);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const lane = await LaneService.create(req.body);
            res.status(201).json(lane);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const lane = await LaneService.update(req.params.id, req.body);
            res.json(lane);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            await LaneService.delete(req.params.id);
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    static async suggest(req: Request, res: Response) {
        try {
            console.log("Lane Suggest Payload:", req.body);
            const { productId, eta } = req.body;
            const suggestion = await LaneService.suggest(productId, eta ? new Date(eta) : new Date());
            res.json(suggestion);
        } catch (error: any) {
            console.error("Lane Suggest Error:", error);
            res.status(400).json({ message: error.message });
        }
    }
}
