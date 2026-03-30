'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/features/auth';
import { apiClient } from '@/lib/api/client';

type Notification = {
    id: string;
    type: string;
    title: string;
    message: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    isRead: boolean;
};

export function VoyageAlertBanner({ voyageId }: { voyageId: string }) {
    const { token } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const fetchVoyageAlerts = async () => {
        if (!token) return;
        try {
            const res = await apiClient.get<Notification[]>('/notifications');
            if (res) {
                const data = res as unknown as Notification[];
                // Filter client side for now, or you could add a query param to API
                const voyageAlerts = data.filter((n: any) => n.voyageId === voyageId && !n.isRead);
                setNotifications(voyageAlerts);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchVoyageAlerts();
        const id = setInterval(fetchVoyageAlerts, 30000);
        return () => clearInterval(id);
    }, [voyageId, token]);

    const dismissAlert = async (id: string) => {
        if (!token) return;
        try {
            await apiClient.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    if (notifications.length === 0) return null;

    const getIcon = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return <AlertCircle className="text-red-600 shrink-0" size={24} />;
            case 'WARNING': return <AlertTriangle className="text-amber-600 shrink-0" size={24} />;
            default: return <Info className="text-blue-600 shrink-0" size={24} />;
        }
    };

    const getColors = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return "bg-red-50 border-red-200 text-red-900";
            case 'WARNING': return "bg-amber-50 border-amber-200 text-amber-900";
            default: return "bg-blue-50 border-blue-200 text-blue-900";
        }
    };

    return (
        <div className="space-y-3 mb-6">
            {notifications.map((n) => (
                <div
                    key={n.id}
                    className={cn(
                        "relative flex items-start gap-4 p-4 rounded-2xl border shadow-sm animate-in fade-in duration-300",
                        getColors(n.severity)
                    )}
                >
                    {getIcon(n.severity)}
                    <div className="flex-1 min-w-0 pr-8">
                        <h4 className="font-bold text-sm uppercase tracking-wider mb-1 opacity-90">{n.title}</h4>
                        <p className="font-medium text-sm leading-relaxed opacity-80">{n.message}</p>
                    </div>
                    <button
                        onClick={() => dismissAlert(n.id)}
                        className="absolute right-4 top-4 p-1.5 hover:bg-black/5 rounded-full transition-colors opacity-60 hover:opacity-100"
                        title="Đóng cảnh báo"
                    >
                        <X size={18} />
                    </button>
                </div>
            ))}
        </div>
    );
}
