import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const testTimeController = async (req: Request, res: Response) => {
    const rawDB = await prisma.$queryRaw`SELECT CURRENT_TIMESTAMP as pg_now`;
    const start = new Date(`2026-03-24T00:00:00.000+07:00`);
    const end = new Date(`2026-03-24T23:59:59.999+07:00`);
    const todayNotifs = await prisma.notification.findMany({
        where: { createdAt: { gte: start, lte: end } }
    });

    res.json({
        serverDateLocal: new Date().toString(),
        serverDateUTC: new Date().toISOString(),
        pgNow: rawDB,
        todayNotifsCount: todayNotifs.length,
        todayNotifs: todayNotifs
    });
};
