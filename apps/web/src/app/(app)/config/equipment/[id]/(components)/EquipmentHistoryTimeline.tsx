'use client';

import React, { useState } from 'react';

import { EquipmentEvent } from '@/features/config/types';
import { formatDateTime } from '@/lib/utils/date';
import { Clock, CheckCircle2, AlertCircle, Wrench, Settings2, User, Package } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { format } from 'date-fns';

interface EquipmentHistoryTimelineProps {
    history: EquipmentEvent[] | undefined;
    isLoading: boolean;
}

export function EquipmentHistoryTimeline({ history, isLoading }: EquipmentHistoryTimelineProps) {
    const [filterDate, setFilterDate] = useState<string>(() => format(new Date(), 'yyyy-MM-dd'));

    const filteredHistory = history?.filter(event => {
        if (!filterDate) return true;
        const offsetMs = event.type === 'STATUS_CHANGE' ? 7 * 60 * 60 * 1000 : 0;
        const eDate = new Date(new Date(event.createdAt).getTime() + offsetMs);
        const fDate = new Date(filterDate);
        return eDate.getFullYear() === fDate.getFullYear() &&
            eDate.getMonth() === fDate.getMonth() &&
            eDate.getDate() === fDate.getDate();
    });

    const displayHistory = [...(filteredHistory || [])].sort((a, b) => {
        const timeA = a.type === 'STATUS_CHANGE'
            ? new Date(a.createdAt).getTime() + 7 * 60 * 60 * 1000
            : new Date(a.createdAt).getTime();
        const timeB = b.type === 'STATUS_CHANGE'
            ? new Date(b.createdAt).getTime() + 7 * 60 * 60 * 1000
            : new Date(b.createdAt).getTime();
        return timeB - timeA;
    });

    const getEventIcon = (type: string, title?: string) => {
        if (type === 'CARGO_PROGRESS') {
            return <Package size={12} className="text-indigo-500" />;
        }
        if (type === 'STATUS_CHANGE') {
            if (title?.includes('SỬA CHỮA') || title?.includes('BẢO TRÌ') || title?.includes('REPAIR')) return <Wrench size={12} className="text-amber-500" />;
            if (title?.includes('LÀM HÀNG') || title?.includes('BUSY')) return <AlertCircle size={12} className="text-brand" />;
            return <CheckCircle2 size={12} className="text-emerald-500" />;
        }
        return <Settings2 size={12} className="text-slate-400" />;
    };

    let content;
    if (isLoading) {
        content = (
            <div className="animate-pulse flex space-x-4 h-full min-h-[400px]">
                <div className="flex-1 space-y-6 py-1">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="space-y-3">
                        <div className="h-8 bg-slate-200 rounded"></div>
                        <div className="h-8 bg-slate-200 rounded"></div>
                        <div className="h-8 bg-slate-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    } else if (!displayHistory || displayHistory.length === 0) {
        content = (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
                <Clock className="w-10 h-10 text-slate-200 mb-3" />
                <p className="text-sm font-medium text-slate-500 text-center">Chưa có lịch sử hoạt động</p>
            </div>
        );
    } else {
        content = (
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="relative border-l-2 border-slate-100/50 space-y-6 pb-4 ml-3">
                    {displayHistory.map((event, index) => (
                        <div key={event.id} className="relative pl-6 group">
                            <div className="absolute -left-[13px] top-1 p-1 bg-white rounded-full border-2 border-slate-100 shadow-sm group-hover:border-brand/30 transition-colors">
                                {getEventIcon(event.type, event.title)}
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-start justify-between gap-2">
                                    <h4 className="text-xs font-bold text-slate-800 leading-tight">
                                        {event.title}
                                    </h4>
                                    <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap bg-slate-50 px-2 py-0.5 rounded">
                                        {formatDateTime(
                                            event.type === 'STATUS_CHANGE'
                                                ? new Date(new Date(event.createdAt).getTime() + 7 * 60 * 60 * 1000)
                                                : event.createdAt
                                        )}
                                    </span>
                                </div>

                                {event.description && (
                                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                                        {event.description}
                                    </p>
                                )}

                                <div className="flex items-center gap-1.5 pt-2">
                                    <User size={10} className="text-slate-300" />
                                    <span className="text-[10px] font-bold text-slate-400">
                                        {event.employee?.fullName || 'Hệ thống'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 flex flex-col h-full max-h-[800px]">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-50 text-slate-500 rounded-lg">
                        <Clock size={16} />
                    </div>
                    <h3 className="font-heading font-black text-sm uppercase tracking-widest text-slate-800">
                        Lịch sử Vận hành
                    </h3>
                </div>
                <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="h-8 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 focus:outline-none focus:border-brand shadow-sm appearance-none cursor-pointer transition-all w-[120px]"
                />
            </div>

            {content}
        </div>
    );
}
