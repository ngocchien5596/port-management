import cron from 'node-cron';
import prisma from '../lib/prisma';
import { NotificationService } from '../services/notification.service';

export function startNotificationCronJob() {
    // Run every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
        console.log('⏳ Running Notification Cron Job...');
        try {
            const now = new Date();

            // 1. Check Overdue ETA
            // Tàu đang sắp đến (CHUA_CAP_CANG) nhưng đã quá ETA
            const overdueEtaVoyages = await prisma.voyage.findMany({
                where: {
                    status: { in: ['NHAP', 'THU_TUC'] },
                    eta: { lt: now }
                },
                include: { vessel: true }
            });

            for (const voyage of overdueEtaVoyages) {
                const v = voyage as any;
                await NotificationService.createNotification({
                    type: 'OVERDUE_ETA',
                    title: 'Cảnh báo Trễ giờ cập cảng (ETA)',
                    message: `Đã quá giờ dự kiến cập cảng (${v.eta?.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}).`,
                    severity: 'WARNING',
                    voyageId: voyage.id,
                });
            }

            // 2. Check Overdue ETD
            // Tàu đang làm hàng (LAM_HANG) nhưng ETD hệ thống tính toán đã bị quá
            const overdueEtdVoyages = await prisma.voyage.findMany({
                where: {
                    status: 'LAM_HANG',
                    etd: { lt: now }
                },
                include: { vessel: true }
            });

            for (const voyage of overdueEtdVoyages) {
                const v = voyage as any;
                await NotificationService.createNotification({
                    type: 'OVERDUE_ETD',
                    title: 'Cảnh báo Trễ giờ rời cảng dự kiến (ETD)',
                    message: `Dự kiến rời cảng lúc ${v.etd?.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })} nhưng hiện tại vẫn đang làm hàng.`,
                    severity: 'CRITICAL',
                    voyageId: voyage.id,
                });
            }

            console.log(`✅ Notification Cron Job Completed. Checked ${overdueEtaVoyages.length} ETA, ${overdueEtdVoyages.length} ETD.`);
        } catch (error) {
            console.error('❌ Error in Notification Cron Job:', error);
        }
    });

    console.log('🕒 Notification Cron Job scheduled (Every 5 minutes)');
}
