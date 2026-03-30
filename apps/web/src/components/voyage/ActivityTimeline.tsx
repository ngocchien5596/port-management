'use client';

import React from 'react';
import { Circle, User, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { formatDateTime } from '@/lib/utils/date';

interface VoyageEvent {
    id: string;
    type: string;
    title: string;
    description?: string;
    userId?: string;
    createdAt: string;
}

export default function ActivityTimeline({ events }: { events: VoyageEvent[] }) {
    if (!events || events.length === 0) {
        return <div className="text-center py-8 text-slate-400 italic">Chưa có lịch sử hoạt động</div>;
    }

    return (
        <div className="space-y-6 pl-2">
            {events.map((event, index) => {
                const isLast = index === events.length - 1;

                // Determine icon based on type
                let Icon = Circle;
                let colorClass = 'text-slate-400 border-slate-200';

                if (event.type === 'STATUS_CHANGE') {
                    Icon = Clock;
                    colorClass = 'text-brand border-brand/20 bg-brand-soft';
                } else if (event.type === 'INCIDENT') {
                    Icon = AlertCircle;
                    colorClass = 'text-red-600 border-red-200 bg-red-50';
                } else if (event.type === 'READINESS') {
                    Icon = CheckCircle2;
                    colorClass = 'text-emerald-600 border-emerald-200 bg-emerald-50';
                }

                return (
                    <div key={event.id} className="relative flex gap-4">
                        {/* Connecting Line */}
                        {!isLast && (
                            <div className="absolute left-[19px] top-8 bottom-[-24px] w-0.5 bg-slate-100"></div>
                        )}

                        {/* Icon */}
                        <div className={`
                            relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0
                            ${colorClass}
                        `}>
                            <Icon size={18} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 pt-1 pb-2">
                            <div className="flex justify-between items-start">
                                <h4 className="text-sm font-semibold text-slate-800">
                                    {event.title}
                                </h4>
                                <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg border border-slate-100 italic">
                                    <Clock size={12} className="text-slate-400" />
                                    {formatDateTime(event.createdAt)}
                                </span>
                            </div>

                            {event.description && (
                                <p className="text-sm text-slate-600 mt-1 bg-slate-50 p-2 rounded border border-slate-100 inline-block">
                                    {event.description}
                                </p>
                            )}

                            <div className="flex items-center mt-2 text-xs text-slate-400">
                                <User size={12} className="mr-1" />
                                {event.userId || 'System Action'}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
