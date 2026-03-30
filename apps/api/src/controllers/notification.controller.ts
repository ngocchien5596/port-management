import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';

export class NotificationController {

    static async getNotifications(req: Request, res: Response) {
        try {
            // Assuming req.user is populated by some auth middleware.
            // E.g., const userId = req.user?.id;
            // We will just pass nothing to get global unread for now, or you can extract userId.
            const userId = (req as any).user?.id || undefined;
            const date = req.query.date as string | undefined;

            const notifications = await NotificationService.getNotifications(userId, date);
            res.json(notifications);
        } catch (error: any) {
            console.error('Error fetching notifications:', error);
            res.status(500).json({ error: error.message || 'Failed to fetch notifications' });
        }
    }

    static async markAsRead(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const notification = await NotificationService.markAsRead(id);
            res.json(notification);
        } catch (error: any) {
            console.error('Error marking notification as read:', error);
            res.status(500).json({ error: error.message || 'Failed to mark notification as read' });
        }
    }

    static async markAllAsRead(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id || undefined;
            const result = await NotificationService.markAllAsRead(userId);
            res.json(result);
        } catch (error: any) {
            console.error('Error marking all notifications as read:', error);
            res.status(500).json({ error: error.message || 'Failed to mark all notifications as read' });
        }
    }
}
