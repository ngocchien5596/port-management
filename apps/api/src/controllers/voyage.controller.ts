import { Request, Response } from 'express';
import { VoyageService } from '../services/voyage.service';

export class VoyageController {
    static async getAll(req: Request, res: Response) {
        try {
            const voyages = await VoyageService.getAll();
            res.json(voyages);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getById(req: Request, res: Response) {
        try {
            const voyage = await VoyageService.getById(req.params.id);
            if (!voyage) {
                return res.status(404).json({ message: 'Voyage not found' });
            }
            res.json(voyage);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async create(req: any, res: Response) {
        try {
            const userId = req.user?.employeeId;
            if (!userId) {
                return res.status(401).json({ message: 'User ID (Employee ID) is required to create a voyage' });
            }
            const voyage = await VoyageService.create(req.body, userId);
            res.status(201).json(voyage);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const voyage = await VoyageService.update(req.params.id, req.body);
            res.json(voyage);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            await VoyageService.delete(req.params.id);
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    static async updateStatus(req: Request, res: Response) {
        try {
            const { status, reason, userId } = req.body;
            const voyage = await VoyageService.updateStatus(req.params.id, status, reason, userId);
            res.json(voyage);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    static async addProgress(req: Request, res: Response) {
        try {
            const { amount, hours, startTime, endTime, userId, notes, shiftCode } = req.body;
            const result = await VoyageService.addProgress(req.params.id, {
                amount: Number(amount),
                hours: hours !== undefined ? Number(hours) : undefined,
                startTime,
                endTime,
                userId,
                notes,
                shiftCode
            });
            res.status(201).json(result);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    static async updateProgress(req: any, res: Response) {
        try {
            const { id, progressId } = req.params;
            const { amount, hours, startTime, endTime, notes, shiftCode } = req.body;
            const userId = req.user?.employeeId;

            const result = await VoyageService.updateProgress(id, progressId, {
                amount: amount !== undefined ? Number(amount) : undefined,
                hours: hours !== undefined ? Number(hours) : undefined,
                startTime,
                endTime,
                notes,
                shiftCode,
                updatedById: userId
            });
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    static async deleteProgress(req: any, res: Response) {
        try {
            const { id, progressId } = req.params;
            const userId = req.user?.employeeId;
            await VoyageService.deleteProgress(id, progressId, userId);
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    static async updateReadiness(req: Request, res: Response) {
        try {
            const voyage = await VoyageService.updateReadiness(req.params.id, req.body);
            res.json(voyage);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    static async addIncident(req: Request, res: Response) {
        try {
            const incident = await VoyageService.addIncident(req.params.id, req.body);
            res.status(201).json(incident);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    static async reorderQueue(req: Request, res: Response) {
        try {
            const updates = req.body;
            if (!Array.isArray(updates)) {
                return res.status(400).json({ message: 'Payload must be an array of updates' });
            }
            const voyages = await VoyageService.reorderQueue(updates);
            res.json(voyages);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    static async overrideEquipment(req: Request, res: Response) {
        try {
            const { currentVoyageId, emergencyVoyageId, progressData, reason, userId } = req.body;

            if (!currentVoyageId || !emergencyVoyageId || !progressData || progressData.amount === undefined) {
                return res.status(400).json({ message: 'Missing required parameters: currentVoyageId, emergencyVoyageId, progressData' });
            }

            const updatedEmergencyVoyage = await VoyageService.overrideEquipment({
                currentVoyageId,
                emergencyVoyageId,
                progressData: {
                    amount: Number(progressData.amount),
                    startTime: progressData.startTime,
                    endTime: progressData.endTime
                },
                reason,
                userId
            });

            res.json(updatedEmergencyVoyage);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }
}
