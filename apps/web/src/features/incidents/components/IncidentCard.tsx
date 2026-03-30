'use client';

import React from 'react';
import { AlertTriangle, Clock, CheckCircle, Info, ShieldAlert } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { Incident } from '../types';
import { formatDateTime } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';

interface IncidentCardProps {
    incident: Incident;
    onResolve?: (id: string) => void;
    isReadOnly?: boolean;
    showVoyageInfo?: boolean;
}

export default function IncidentCard({
    incident: i,
    onResolve,
    isReadOnly,
    showVoyageInfo = false
}: IncidentCardProps) {
    const isResolved = !!i.endTime;

    const typeMapping: Record<string, string> = {
        'TECHNICAL': 'Kỹ thuật',
        'WEATHER': 'Thời tiết',
        'PLANNING': 'Kế hoạch',
        'OPERATIONAL': 'Vận hành',
        'EQUIPMENT': 'Thiết bị',
        'OTHER': 'Khác'
    };

    const severityLabels: Record<string, string> = {
        'RED': 'Nghiêm trọng',
        'YELLOW': 'Trung bình',
        'GREEN': 'Thông tin'
    };

    const severityColors = {
        RED: "text-red-600",
        YELLOW: "text-amber-600",
        GREEN: "text-emerald-600"
    }[i.severity as 'RED' | 'YELLOW' | 'GREEN'] || "text-slate-600";

    const statusLabel = isResolved ? "Đã xử lý" : "Đang xử lý";

    const statusStyles = isResolved
        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
        : {
            RED: "bg-red-50 text-red-600 border-red-100",
            YELLOW: "bg-amber-50 text-amber-600 border-amber-100",
            GREEN: "bg-emerald-50 text-emerald-600 border-emerald-100"
        }[i.severity as 'RED' | 'YELLOW' | 'GREEN'] || "bg-slate-50 text-slate-600 border-slate-100";

    return (
        <div className={cn(
            "relative overflow-hidden rounded-2xl border transition-all duration-300 bg-white",
            isResolved
                ? "border-slate-100 opacity-80"
                : "border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200"
        )}>
            {/* Status Accent Bar */}
            {!isResolved && (
                <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-1",
                    i.severity === 'RED' ? "bg-red-500" : i.severity === 'YELLOW' ? "bg-amber-500" : "bg-emerald-500"
                )} />
            )}

            <div className="p-4 space-y-2">
                {/* Line 1: Type - Severity - Status */}
                <div className="flex items-center gap-2 font-semibold">
                    <span className="text-slate-900">{typeMapping[i.type] || i.type}</span>
                    <span className="text-slate-300">•</span>
                    <span className={severityColors}>{severityLabels[i.severity] || i.severity}</span>
                    <span className="text-slate-300">•</span>
                    <span className={cn("px-1.5 py-0.5 rounded border font-medium", statusStyles)}>
                        {statusLabel}
                    </span>

                    {!isResolved && !isReadOnly && onResolve && (
                        <button
                            onClick={() => onResolve(i.id)}
                            className="ml-auto font-semibold text-emerald-600 hover:text-emerald-700 underline underline-offset-4 decoration-emerald-200"
                        >
                            Kết thúc
                        </button>
                    )}
                </div>

                {/* Line 2: Description (Direct) */}
                <div className="font-semibold leading-relaxed text-slate-700">
                    {i.description}
                </div>

                {/* Line 3: Time Range */}
                <div className="flex items-center gap-2 font-medium text-slate-400">
                    <Clock size={11} className="shrink-0" />
                    <span>{formatDateTime(i.startTime)}</span>
                    <span className="text-slate-300">→</span>
                    <span>{i.endTime ? formatDateTime(i.endTime) : '--:--'}</span>

                    {showVoyageInfo && i.voyage && (
                        <div className="ml-auto flex items-center gap-2">
                            <span className="font-semibold text-brand bg-brand-soft px-1.5 py-0.5 rounded tracking-tight">
                                Tàu: {i.voyage.vessel?.name || i.voyage.vessel?.code}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
