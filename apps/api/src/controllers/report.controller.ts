import { Request, Response } from 'express';
import { ReportService } from '../services/report.service';

function normalizeDateRange(start: any, end: any) {
    const s = new Date(start as string);
    const e = new Date(end as string);

    // Start of day: 00:00:00.000
    s.setHours(0, 0, 0, 0);

    // End of day: 23:59:59.999
    // Note: We use local time for the "day" logic since the frontend sends local dates
    e.setHours(23, 59, 59, 999);

    return { startDate: s, endDate: e };
}

export class ReportController {

    static async getSummary(req: Request, res: Response) {
        try {
            const stats = await ReportService.getOperationalStats();
            res.json({ success: true, data: stats });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getSlog(req: Request, res: Response) {
        try {
            const slog = await ReportService.generateSlog(req.params.id);
            res.json({ success: true, data: slog });
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }

    static async getAggregatedStats(req: Request, res: Response) {
        try {
            const { start, end } = req.query;
            if (!start || !end) {
                return res.status(400).json({ message: 'Start and end dates are required' });
            }
            const { startDate, endDate } = normalizeDateRange(start, end);
            const stats = await ReportService.getAggregatedStats(startDate, endDate);
            res.json({ success: true, data: stats });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getEquipmentUtilization(req: Request, res: Response) {
        try {
            const { start, end } = req.query;
            if (!start || !end) {
                return res.status(400).json({ message: 'Start and end dates are required' });
            }
            const { startDate, endDate } = normalizeDateRange(start, end);
            const stats = await ReportService.getEquipmentUtilization(startDate, endDate);
            res.json({ success: true, data: stats });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getVolumeReport(req: Request, res: Response) {
        try {
            const { start, end } = req.query;
            if (!start || !end) {
                return res.status(400).json({ message: 'Start and end dates are required' });
            }
            const { startDate, endDate } = normalizeDateRange(start, end);
            const stats = await ReportService.getVolumeReport(startDate, endDate);
            res.json({ success: true, data: stats });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getProductivityReport(req: Request, res: Response) {
        try {
            const { start, end } = req.query;
            if (!start || !end) {
                return res.status(400).json({ message: 'Start and end dates are required' });
            }
            const { startDate, endDate } = normalizeDateRange(start, end);
            const stats = await ReportService.getProductivityReport(startDate, endDate);
            res.json({ success: true, data: stats });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getEquipmentAnalytics(req: Request, res: Response) {
        try {
            const { start, end } = req.query;
            if (!start || !end) {
                return res.status(400).json({ message: 'Start and end dates are required' });
            }
            const { startDate, endDate } = normalizeDateRange(start, end);
            const stats = await ReportService.getEquipmentAnalytics(startDate, endDate);
            res.json({ success: true, data: stats });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async getPortAnalytics(req: Request, res: Response) {
        try {
            const { start, end } = req.query;
            if (!start || !end) {
                return res.status(400).json({ message: 'Start and end dates are required' });
            }
            const { startDate, endDate } = normalizeDateRange(start, end);
            const stats = await ReportService.getPortAnalytics(startDate, endDate);
            res.json({ success: true, data: stats });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    static async exportExcel(req: Request, res: Response) {
        try {
            // Placeholder: Implementing actual Excel generation using xlsx in service next
            res.status(501).json({ message: 'Tính năng xuất Excel đang được nâng cấp' });
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}
