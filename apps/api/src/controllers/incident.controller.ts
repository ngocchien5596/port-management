import { Request, Response } from 'express';
import { IncidentService } from '../services/incident.service';
import { AuthRequest } from '../middleware/auth';

export class IncidentController {
    static async getAll(req: Request, res: Response) {
        try {
            const { scope, type, severity, activeOnly, voyageId, laneId, equipmentId, parentId } = req.query;
            const parsedParentId = parentId === 'null' ? null : (parentId as string | undefined);

            const incidents = await IncidentService.getAll({
                scope: scope as any,
                type: type as string,
                severity: severity as string,
                activeOnly: activeOnly === 'true',
                voyageId: voyageId as string,
                laneId: laneId as string,
                equipmentId: equipmentId as string,
                parentId: parsedParentId
            });
            res.json(incidents);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async create(req: AuthRequest, res: Response) {
        try {
            const incident = await IncidentService.create({
                ...req.body,
                userId: req.user?.id
            });
            res.status(201).json(incident);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    static async resolve(req: Request, res: Response) {
        try {
            const { endTime } = req.body;
            const incident = await IncidentService.resolve(req.params.id, endTime ? new Date(endTime) : undefined);
            res.json(incident);
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    static async delete(req: AuthRequest, res: Response) {
        try {
            await IncidentService.delete(req.params.id, req.user);
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ message: error.message });
        }
    }

    static async getActiveForVoyage(req: Request, res: Response) {
        try {
            const { activeOnly } = req.query;
            console.log(`[API] Fetching incidents for voyage: ${req.params.voyageId}, activeOnly: ${activeOnly}`);
            const incidents = await IncidentService.getActiveIncidentsForVoyage(
                req.params.voyageId,
                activeOnly === undefined ? true : activeOnly === 'true'
            );
            res.json(incidents);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}
