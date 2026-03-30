import { Request, Response } from 'express';
import { EquipmentService } from '../services/equipment.service';

export class EquipmentController {
    static async getAll(req: Request, res: Response) {
        try {
            const equipment = await EquipmentService.getAll();
            res.json(equipment);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getById(req: Request, res: Response) {
        try {
            const equipment = await EquipmentService.getById(req.params.id);
            if (!equipment) {
                return res.status(404).json({ message: 'Equipment not found' });
            }
            res.json(equipment);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const equipment = await EquipmentService.create(req.body);
            res.status(201).json(equipment);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const equipment = await EquipmentService.update(req.params.id, req.body);
            res.json(equipment);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    static async updateStatus(req: Request, res: Response) {
        try {
            const equipment = await EquipmentService.updateStatus(req.params.id, {
                ...req.body,
                userId: (req as any).user?.employeeId // Must use employeeId to link to Employee table
            });
            res.json(equipment);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    static async getHistory(req: Request, res: Response) {
        try {
            const history = await EquipmentService.getHistory(req.params.id);
            res.json(history);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    static async getKpi(req: Request, res: Response) {
        try {
            const kpi = await EquipmentService.getKpi(req.params.id);
            res.json(kpi);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            await EquipmentService.delete(req.params.id);
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}
