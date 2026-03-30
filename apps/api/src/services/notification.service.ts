import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { emitEvent } from '../lib/socket';

export class NotificationService {
    /**
     * Create a new notification and push it to connected clients via Socket.IO
     */
    static async createNotification(data: {
        type: string;
        title: string;
        message: string;
        severity: string;
        voyageId?: string;
        userId?: string;
    }) {
        // Check if a similar unread notification already exists to prevent spam
        if (data.voyageId && data.type) {
            const existing = await prisma.notification.findFirst({
                where: {
                    voyageId: data.voyageId,
                    type: data.type,
                    isRead: false
                }
            });

            if (existing) {
                // To prevent user confusion, we "bump" the createdAt timestamp to current time 
                // so the user knows the same issue was just re-detected right now instead of looking old.
                const updatedExisting = await prisma.notification.update({
                    where: { id: existing.id },
                    data: {
                        createdAt: new Date(),
                        message: data.message
                    }
                });

                // Still emit it so UI gets the bumped time immediately
                emitEvent('new-notification', updatedExisting);
                return updatedExisting;
            }
        }

        const notification = await prisma.notification.create({
            data: {
                type: data.type,
                title: data.title,
                message: data.message,
                severity: data.severity,
                voyageId: data.voyageId || null,
                userId: data.userId || null,
                isRead: false
            },
            include: {
                voyage: {
                    select: {
                        voyageCode: true,
                        vessel: { select: { name: true, code: true } }
                    }
                }
            }
        });

        // Push real-time to all connected clients
        emitEvent('new-notification', notification);

        return notification;
    }

    /**
     * Get all recent notifications for a user (or global)
     */
    static async getNotifications(userId?: string, dateStr?: string) {
        const whereClause: Prisma.NotificationWhereInput = {};

        if (userId) {
            whereClause.OR = [
                { userId: userId },
                { userId: null } // Global notifications
            ];
        } else {
            whereClause.userId = null;
        }

        if (dateStr) {
            // Prisma will shift these dates forward by 7h on write and backward on read, so passing standard UTC dates corresponding to midnight Local time
            // since dateStr is like '2026-03-24'
            const start = new Date(`${dateStr}T00:00:00.000+07:00`);
            const end = new Date(`${dateStr}T23:59:59.999+07:00`);

            console.log('Notification Date Filter Start:', start.toISOString());
            console.log('Notification Date Filter End:', end.toISOString());

            whereClause.createdAt = {
                gte: start,
                lte: end
            };
        }

        return prisma.notification.findMany({
            where: whereClause,
            orderBy: [
                { isRead: 'asc' },
                { createdAt: 'desc' }
            ],
            include: {
                voyage: {
                    select: {
                        voyageCode: true,
                        vessel: { select: { name: true, code: true } }
                    }
                }
            },
            take: 100
        });
    }

    /**
     * Mark a notification as read
     */
    static async markAsRead(id: string) {
        return prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });
    }

    /**
     * Mark all notifications as read
     */
    static async markAllAsRead(userId?: string) {
        const whereClause: Prisma.NotificationWhereInput = {
            isRead: false
        };

        if (userId) {
            whereClause.OR = [
                { userId: userId },
                { userId: null }
            ];
        } else {
            whereClause.userId = null;
        }

        return prisma.notification.updateMany({
            where: whereClause,
            data: { isRead: true }
        });
    }

    /**
     * Auto-resolve specific notifications (e.g., when progress recovers)
     */
    static async resolveNotification(voyageId: string, type: string) {
        return prisma.notification.updateMany({
            where: {
                voyageId,
                type,
                isRead: false
            },
            data: {
                isRead: true
            }
        });
    }
}
