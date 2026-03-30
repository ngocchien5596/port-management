import { Request, Response } from 'express';
import { VesselService } from '../services/vessel.service';

export class VesselController {
    static async getAll(req: Request, res: Response) {
        try {
            const vessels = await VesselService.getAll();
            res.json(vessels);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const vessel = await VesselService.create(req.body);
            res.status(201).json(vessel);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const vessel = await VesselService.update(req.params.id, req.body);
            res.json(vessel);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            await VesselService.delete(req.params.id);
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}
