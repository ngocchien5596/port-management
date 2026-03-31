'use client';

import { safeDate, formatDateTime, formatTime } from '@/lib/utils/date';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, CheckCircle2, Circle, Clock, AlertCircle, User as UserIcon, Info } from 'lucide-react';
import { VoyageEvent } from '@/features/qltau/types';
import { getStatusConfig } from '@/constants/voyage';

// StatusEvent is now imported from types


interface StatusHistoryTimelineProps {
    events: VoyageEvent[];
}

// Removed local statusMap in favor of centralized getStatusConfig

export function StatusHistoryTimeline({ events }: StatusHistoryTimelineProps) {
    // Sort events by date descending (newest first)
    const sortedEvents = [...events].sort((a, b) =>
        safeDate(b.createdAt).getTime() - safeDate(a.createdAt).getTime()
    );

    return (
        <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
                <CardTitle className="text-sm font-bold text-slate-700 flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                        <History size={16} className="text-brand" />
                        Lịch sử vận hành
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        GMT+7
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
                {sortedEvents.length === 0 ? (
                    <div className="py-8 text-center space-y-2">
                        <History size={32} className="mx-auto text-slate-200" />
                        <p className="text-xs text-slate-400">Chưa có lịch sử thay đổi trạng thái</p>
                    </div>
                ) : (
                    <div className="relative space-y-6 before:absolute before:inset-0 before:ml-2.5 before:h-full before:w-0.5 before:-translate-x-px before:bg-slate-100">
                        {sortedEvents.map((event) => {
                            // Extract status key from metadata or title (fallback for old events)
                            let statusKey = event.metadata?.status;
                            
                            // If title is "NHAP" or matches a known status code, use it
                            if (!statusKey && event.type === 'STATUS_CHANGE') {
                                const title = event.title?.toUpperCase();
                                if (['NHAP', 'THU_TUC', 'DO_MON_DAU_VAO', 'LAY_MAU', 'LAM_HANG', 'DO_MON_DAU_RA', 'HOAN_THANH', 'TAM_DUNG', 'HUY_BO'].includes(title)) {
                                    statusKey = title;
                                }
                            }

                            const config = statusKey ? getStatusConfig(statusKey) : null;
                            const label = config?.label || event.title;
                            const colorClass = config?.color || 'text-slate-500';
                            const Icon = config?.icon || Circle;

                            return (
                                <div key={event.id} className="relative flex items-start pl-8 group">
                                    <div className={`absolute left-0 flex h-5 w-5 items-center justify-center rounded-full bg-white ring-2 ${colorClass.replace('text', 'ring')} ring-offset-2 z-10 transition-transform group-hover:scale-110`}>
                                        <Icon size={10} className={colorClass} />
                                    </div>
                                    <div className="flex flex-col gap-1 group/item">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-bold ${colorClass}`}>
                                                {label}
                                            </span>
                                            <div className="flex items-center gap-1.5 opacity-0 group-hover/item:opacity-100 transition-opacity bg-slate-900 text-white px-2 py-1 rounded text-[10px] absolute left-[140px] z-50 whitespace-nowrap shadow-xl">
                                                <UserIcon size={10} />
                                                <span>{event.employee?.fullName || 'Hệ thống'}</span>
                                                <span className="mx-1 opacity-40">|</span>
                                                <span>{formatDateTime(event.createdAt)}</span>
                                            </div>
                                            <span className="text-[10px] text-slate-400">
                                                {formatDateTime(event.createdAt)}
                                            </span>
                                        </div>
                                        {event.description && event.description !== label && (
                                            <p className="text-[10px] text-slate-500">
                                                {event.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
