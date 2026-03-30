'use client';

import { safeDate, formatDateTime, formatTime } from '@/lib/utils/date';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, CheckCircle2, Circle, Clock, AlertCircle, User as UserIcon, Info } from 'lucide-react';
import { VoyageEvent } from '@/features/qltau/types';

// StatusEvent is now imported from types


interface StatusHistoryTimelineProps {
    events: VoyageEvent[];
}

// Shared configuration for status appearance
const statusMap: Record<string, { label: string; color: string; icon: any }> = {
    'NHAP': { label: 'Nháp chuyến tàu', color: 'text-slate-500', icon: Circle },
    'THU_TUC': { label: 'Làm thủ tục', color: 'text-blue-500', icon: Clock },
    'DO_MON_DAU_VAO': { label: 'Đo mớn đầu vào', color: 'text-brand', icon: Info },
    'LAY_MAU': { label: 'Lấy mẫu hàng', color: 'text-purple-500', icon: Info },
    'LAM_HANG': { label: 'Bắt đầu làm hàng', color: 'text-emerald-500', icon: History },
    'DO_MON_DAU_RA': { label: 'Đo mớn đầu ra', color: 'text-orange-500', icon: Info },
    'HOAN_THANH': { label: 'Hoàn thành chuyến', color: 'text-slate-900', icon: CheckCircle2 },
    'HUY_BO': { label: 'Đã hủy bỏ', color: 'text-red-500', icon: AlertCircle },
    'TAM_DUNG': { label: 'Tạm dừng', color: 'text-slate-400', icon: Clock },
};

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
                            const statusKey = event.metadata?.status || (event.type === 'STATUS_CHANGE' ? event.description?.split(':').pop()?.trim() : null);
                            const statusInfo = statusMap[statusKey as string] || { label: event.title, color: 'text-slate-500', icon: Circle };
                            const Icon = statusInfo.icon;

                            return (
                                <div key={event.id} className="relative flex items-start pl-8 group">
                                    <div className={`absolute left-0 flex h-5 w-5 items-center justify-center rounded-full bg-white ring-2 ${statusInfo.color.replace('text', 'ring')} ring-offset-2 z-10 transition-transform group-hover:scale-110`}>
                                        <Icon size={10} className={statusInfo.color} />
                                    </div>
                                    <div className="flex flex-col gap-1 group/item">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-bold ${statusInfo.color}`}>
                                                {statusInfo.label}
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
                                        {event.description && event.description !== statusInfo.label && (
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
