'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Check, Info, AlertTriangle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatDateTime } from '@/lib/utils/date';
import { useAuth } from '@/features/auth';
import { apiClient } from '@/lib/api/client';
import { useSocket } from '@/lib/hooks/useSocket';

type Notification = {
    id: string;
    type: string;
    title: string;
    message: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    isRead: boolean;
    createdAt: string;
    voyage?: {
        voyageCode: number;
        vessel: { name: string; code: string; };
    };
};

export function NotificationCenter() {
    const { token } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [selectedDate, setSelectedDate] = useState<string>(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const queryParam = selectedDate ? `?date=${selectedDate}` : '';
            const res = await apiClient.get<Notification[]>(`/notifications${queryParam}`);
            if (res) {
                const data = res as unknown as Notification[];
                // Sort frontend just in case: Unread first, then by createdAt desc
                const sortedData = [...data].sort((a, b) => {
                    if (a.isRead === b.isRead) {
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    }
                    return a.isRead ? 1 : -1;
                });
                setNotifications(sortedData);
                setUnreadCount(sortedData.filter((n: Notification) => !n.isRead).length);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch existing notifications on mount and when selectedDate changes
    useEffect(() => {
        fetchNotifications();
    }, [token, selectedDate]);

    // Real-time: listen for new notifications via Socket.IO
    useSocket<Notification>('new-notification', useCallback((notification: Notification) => {
        setNotifications(prev => {
            // Dedup/Update: if exists, replace it to get latest timestamp, else append
            const existingIndex = prev.findIndex(n => n.id === notification.id);
            if (existingIndex >= 0) {
                const next = [...prev];
                next[existingIndex] = notification;

                // Move bumped notification to the top
                const [bumped] = next.splice(existingIndex, 1);
                return [bumped, ...next];
            }
            return [notification, ...prev];
        });

        setUnreadCount(prev => {
            // Only increment if it's genuinely new
            const exists = notifications.some(n => n.id === notification.id);
            return exists ? prev : prev + 1;
        });

        // Ensure newly arrived notifications stay sorted correctly
        setNotifications(prev => {
            return [...prev].sort((a, b) => {
                if (a.isRead === b.isRead) {
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                }
                return a.isRead ? 1 : -1;
            });
        });
    }, [notifications]));

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!token) return;

        try {
            await apiClient.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        if (!token || unreadCount === 0) return;
        try {
            await apiClient.put('/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const getIcon = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return <AlertCircle className="text-red-500 shrink-0" size={18} />;
            case 'WARNING': return <AlertTriangle className="text-amber-500 shrink-0" size={18} />;
            default: return <Info className="text-blue-500 shrink-0" size={18} />;
        }
    };



    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "relative p-2 rounded-full transition-colors flex items-center justify-center",
                    isOpen ? "bg-brand-soft text-brand" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                )}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-white"></span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-3 border-b border-slate-100 bg-slate-50/80 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-slate-800 text-sm">Thông báo</h3>
                                {unreadCount > 0 && (
                                    <span className="bg-brand text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="text-xs px-2 py-1 border border-slate-200 rounded text-slate-600 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand cursor-pointer"
                                />
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-xs text-brand hover:text-brand-dark flex items-center gap-1 font-medium transition-colors"
                                    >
                                        <Check size={14} />
                                        Đọc tất cả
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto">
                        {isLoading ? (
                            <div className="p-8 flex justify-center items-center text-slate-400">
                                <Loader2 className="animate-spin w-6 h-6" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-sm text-slate-500 flex flex-col items-center gap-2">
                                <Check className="w-8 h-8 text-green-500 opacity-50" />
                                <p>Không có thông báo nào trong ngày này</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        className={cn(
                                            "p-3 transition-colors flex gap-3 group relative",
                                            !n.isRead
                                                ? "bg-blue-50/40 hover:bg-slate-50 cursor-pointer"
                                                : "opacity-60 hover:opacity-80"
                                        )}
                                        onClick={() => !n.isRead && markAsRead(n.id)}
                                    >
                                        {getIcon(n.severity)}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <p className={cn("text-sm text-slate-800", !n.isRead ? "font-semibold" : "font-normal")}>
                                                    {n.title}
                                                </p>
                                                {!n.isRead && (
                                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full shadow-sm shrink-0" />
                                                )}
                                            </div>
                                            {n.voyage && (
                                                <p className="text-xs font-medium text-brand mb-0.5">
                                                    [Chuyến {n.voyage.voyageCode}] Mã hiệu tàu: {n.voyage.vessel.code || n.voyage.vessel.name}
                                                </p>
                                            )}
                                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                                {n.message}
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-1 font-medium">
                                                {formatDateTime(n.createdAt)}
                                            </p>
                                        </div>
                                        {!n.isRead && (
                                            <button
                                                onClick={(e) => markAsRead(n.id, e)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-200 text-slate-400 hover:text-green-600 rounded-md transition-all self-center shrink-0"
                                                title="Đánh dấu đã đọc"
                                            >
                                                <Check size={16} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div >
            )
            }
        </div >
    );
}
