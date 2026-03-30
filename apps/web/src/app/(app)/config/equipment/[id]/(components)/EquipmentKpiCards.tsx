'use client';

import { Package, Clock, TrendingUp, Zap, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface EquipmentKpiCardsProps {
    data: {
        totalVolume: number;
        totalHours: number;
        avgProductivity: number;
        efficiency: number;
        downtimeHours: number;
    } | undefined;
    isLoading: boolean;
}

export function EquipmentKpiCards({ data, isLoading }: EquipmentKpiCardsProps) {
    const formatNumber = (num: number, maxDecimals = 1) =>
        new Intl.NumberFormat('vi-VN', { maximumFractionDigits: maxDecimals }).format(num || 0);

    const cards = [
        {
            title: 'TỔNG SẢN LƯỢNG',
            value: formatNumber(data?.totalVolume || 0),
            unit: 'tấn',
            icon: Package,
            color: 'text-indigo-500',
            bg: 'bg-indigo-50'
        },
        {
            title: 'TỔNG GIỜ HOẠT ĐỘNG',
            value: formatNumber(data?.totalHours || 0),
            unit: 'Giờ',
            icon: Clock,
            color: 'text-amber-500',
            bg: 'bg-amber-50'
        },
        {
            title: 'Công suất TB',
            value: formatNumber(data?.avgProductivity || 0),
            unit: 'tấn/giờ',
            icon: TrendingUp,
            color: 'text-brand',
            bg: 'bg-brand/10'
        },
        {
            title: 'HIỆU SUẤT TRUNG BÌNH',
            value: formatNumber(data?.efficiency || 0),
            unit: '%',
            icon: Zap,
            color: 'text-emerald-500',
            bg: 'bg-emerald-50'
        },
        {
            title: 'DOWNTIME ĐỘT XUẤT',
            value: formatNumber(data?.downtimeHours || 0),
            unit: 'Giờ',
            icon: AlertTriangle,
            color: 'text-red-500',
            bg: 'bg-red-50'
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {cards.map((card, index) => (
                <div key={index} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-3 relative z-10">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-heading">
                            {card.title}
                        </span>
                        <div className={cn("p-1.5 rounded-lg", card.bg, card.color)}>
                            <card.icon size={14} strokeWidth={2.5} />
                        </div>
                    </div>
                    <div className="relative z-10 flex items-baseline gap-1.5">
                        {isLoading ? (
                            <div className="h-8 w-16 bg-slate-100 animate-pulse rounded"></div>
                        ) : (
                            <>
                                <span className="text-2xl font-bold font-heading text-slate-800 tracking-tight">
                                    {card.value}
                                </span>
                                <span className="text-xs font-bold text-slate-400">
                                    {card.unit}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
