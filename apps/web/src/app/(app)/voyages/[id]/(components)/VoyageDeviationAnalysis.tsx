'use client';

import React from 'react';
import { Voyage } from '@/features/qltau/types';
import { cn } from '@/lib/utils/cn';
import { TrendingUp, TrendingDown, Clock, Zap, Target } from 'lucide-react';

interface VoyageDeviationAnalysisProps {
    voyage: Voyage & {
        theoreticalProgress?: number;
        equipmentCapacity?: number;
    };
}

export function VoyageDeviationAnalysis({ voyage }: VoyageDeviationAnalysisProps) {
    const totalVolume = Number(voyage.totalVolume || 0);
    const actualCumulative = Number(voyage.progress?.[0]?.cumulative || 0);
    const theoreticalCumulative = Number((voyage as any).theoreticalProgress || 0);
    const capacity = Number((voyage as any).equipmentCapacity || 0);

    if (totalVolume <= 0 || capacity <= 0) return null;

    const actualPercent = Math.min(100, (actualCumulative / totalVolume) * 100);
    const theoreticalPercent = Math.min(100, (theoreticalCumulative / totalVolume) * 100);

    // Deviation in volume
    const volumeGap = actualCumulative - theoreticalCumulative;
    const isBehind = volumeGap < 0;

    // Efficiency calculation
    // We calculate a real-time efficiency based on progress made vs time passed
    const efficiency = theoreticalCumulative > 0
        ? (actualCumulative / theoreticalCumulative) * 100
        : 100;

    // Time Delta (Theoretical ETD vs Dynamic ETD)
    // Dynamic ETD is voyage.etd, Theoretical is voyage.theoreticalEtd
    let timeDeltaHours = 0;
    if (voyage.etd && voyage.theoreticalEtd) {
        const actualEtd = new Date(voyage.etd).getTime();
        const theoreticalEtd = new Date(voyage.theoreticalEtd).getTime();
        timeDeltaHours = (actualEtd - theoreticalEtd) / (1000 * 60 * 60);
    }

    return (
        <div className="bg-white rounded-[32px] border border-vtborder shadow-xl shadow-slate-200/40 p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-900 text-white rounded-xl">
                        <Zap size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider font-heading">
                            Phân tích hiệu suất vận hành
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                            Thực tế vs. Công suất thiết bị ({capacity} tấn/giờ)
                        </p>
                    </div>
                </div>

                <div className={cn(
                    "px-4 py-2 rounded-2xl flex items-center gap-2 border shadow-sm transition-colors",
                    isBehind ? "bg-red-50 border-red-100 text-red-600" : "bg-emerald-50 border-emerald-100 text-emerald-600"
                )}>
                    {isBehind ? <TrendingDown size={18} /> : <TrendingUp size={18} />}
                    <span className="text-sm font-black uppercase tracking-tighter">
                        {isBehind ? 'Chậm tiến độ' : 'Vượt tiến độ'}
                    </span>
                </div>
            </div>

            {/* Dual Progress Bar */}
            <div className="space-y-4 pt-2">
                <div className="relative h-12 w-full bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden px-1 flex flex-col justify-center">
                    {/* Theoretical Line (The ghost progress) */}
                    <div
                        className="absolute inset-y-0 left-0 bg-slate-200/50 border-r-2 border-slate-300 border-dashed transition-all duration-1000 ease-in-out"
                        style={{ width: `${theoreticalPercent}%` }}
                    />

                    {/* Actual Progress Bar */}
                    <div
                        className={cn(
                            "h-6 rounded-xl transition-all duration-1000 ease-in-out shadow-sm relative z-10",
                            isBehind ? "bg-red-500 shadow-red-200" : "bg-emerald-500 shadow-emerald-200"
                        )}
                        style={{ width: `${actualPercent}%` }}
                    />
                </div>

                <div className="flex justify-between items-start px-1">
                    <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            <Target size={12} className="text-emerald-500" /> Thực tế: {actualCumulative.toLocaleString()} T ({actualPercent.toFixed(1)}%)
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                            <div className="w-2 h-0.5 bg-slate-300 border border-dashed border-slate-400"></div> Lý thuyết: {theoreticalCumulative.toLocaleString()} T ({theoreticalPercent.toFixed(1)}%)
                        </div>
                    </div>

                    <div className="text-right">
                        <div className={cn(
                            "text-xl font-black font-heading leading-tight tracking-tighter",
                            isBehind ? "text-red-600" : "text-emerald-600"
                        )}>
                            {isBehind ? '+' : ''}{timeDeltaHours.toFixed(1)}h
                        </div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            Lệch thời gian rời bến
                        </p>
                    </div>
                </div>
            </div>

            {/* KPI Metrics Footer */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                    <div className={cn(
                        "p-2 rounded-xl shadow-sm",
                        efficiency < 100 ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
                    )}>
                        <Zap size={20} />
                    </div>
                    <div>
                        <div className="text-sm font-black text-slate-900 leading-none">{efficiency.toFixed(1)}%</div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Hiệu suất vận hành</div>
                    </div>
                </div>

                <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-xl shadow-sm">
                        <Clock size={20} />
                    </div>
                    <div>
                        <div className="text-sm font-black text-slate-900 leading-none">{Math.abs(volumeGap).toLocaleString()} T</div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Lệch sản lượng</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
