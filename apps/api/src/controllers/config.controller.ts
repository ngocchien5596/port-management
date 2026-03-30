import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export class ConfigController {
    static getServerTime(req: Request, res: Response) {
        try {
            res.json({
                success: true,
                data: {
                    serverTime: new Date().toISOString(),
                    timezone: 'Asia/Ho_Chi_Minh'
                }
            });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getGlobalConfigs(req: Request, res: Response) {
        try {
            const configs = await prisma.systemConfig.findMany();
            res.json({ success: true, data: configs });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async updateGlobalConfig(req: Request, res: Response) {
        try {
            const { key } = req.params;
            const { value } = req.body;
            const config = await prisma.systemConfig.upsert({
                where: { key: String(key) },
                update: { value: String(value) },
                create: { key: String(key), value: String(value) }
            });
            res.json({ success: true, data: config });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async getShiftConfigs(req: Request, res: Response) {
        try {
            const configs = await prisma.systemConfig.findMany({
                where: {
                    key: {
                        in: ['SHIFT_1_START', 'SHIFT_2_START', 'SHIFT_3_START']
                    }
                }
            });
            res.json({ success: true, data: configs });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async updateShiftConfigs(req: Request, res: Response) {
        try {
            const { shift1, shift2, shift3 } = req.body;

            const updates = [];
            if (shift1) updates.push(prisma.systemConfig.upsert({ where: { key: 'SHIFT_1_START' }, update: { value: String(shift1) }, create: { key: 'SHIFT_1_START', value: String(shift1) } }));
            if (shift2) updates.push(prisma.systemConfig.upsert({ where: { key: 'SHIFT_2_START' }, update: { value: String(shift2) }, create: { key: 'SHIFT_2_START', value: String(shift2) } }));
            if (shift3) updates.push(prisma.systemConfig.upsert({ where: { key: 'SHIFT_3_START' }, update: { value: String(shift3) }, create: { key: 'SHIFT_3_START', value: String(shift3) } }));

            const results = await prisma.$transaction(updates);

            res.json({ success: true, data: results });
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}
