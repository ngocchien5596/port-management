'use client';

import React from 'react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ReferenceArea,
    Area
} from 'recharts';
import { Voyage } from '@/features/qltau/types';
import { cn } from '@/lib/utils/cn';
import { LineChart as ChartIcon, Zap, Info, TrendingUp, TrendingDown, Clock, Target, Timer } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VoyagePerformanceChartProps {
    voyage: Voyage;
}

export function VoyagePerformanceChart({ voyage }: VoyagePerformanceChartProps) {
    const data = (voyage.performanceTrendData || []).map(p => ({
        ...p,
        timeMs: new Date(p.timestamp).getTime()
    }));
    const totalVolume = Number(voyage.totalVolume || 0);

    const lastPoint = data.length > 0 ? data[data.length - 1] : null;
    const actualCumulative = lastPoint ? lastPoint.actualCumulative : 0;
    const theoreticalCumulative = lastPoint ? lastPoint.theoreticalCumulative : 0;
    const capacity = Number((voyage as any).equipmentCapacity || 0);

    const hasActualData = actualCumulative > 0;

    if (totalVolume <= 0) return null;

    // Deviation in volume
    const volumeGap = actualCumulative - theoreticalCumulative;
    const isBehind = volumeGap < 0;

    // Efficiency calculation
    const efficiency = theoreticalCumulative > 0
        ? (actualCumulative / theoreticalCumulative) * 100
        : 100;

    // Time Delta (Theoretical ETD vs Dynamic ETD)
    let timeDeltaHours = 0;
    if (voyage.etd && voyage.theoreticalEtd) {
        const actualEtd = new Date(voyage.etd).getTime();
        const theoreticalEtd = new Date(voyage.theoreticalEtd).getTime();
        timeDeltaHours = (actualEtd - theoreticalEtd) / (1000 * 60 * 60);
    }

    // Custom Tooltip component
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const actual = payload.find((p: any) => p.dataKey === 'actualCumulative')?.value || 0;
            const theory = payload.find((p: any) => p.dataKey === 'theoreticalCumulative')?.value || 0;
            const gap = actual - theory;
            const isBehind = gap < 0;

            return (
                <div className="bg-white/95 backdrop-blur-md border border-slate-200 p-4 rounded-2xl shadow-2xl flex flex-col gap-2 min-w-[200px]">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{payload[0].payload.label}</span>
                        <span className={cn(
                            "text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter",
                            isBehind ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                        )}>
                            {isBehind ? `Chậm ${Math.abs(gap).toLocaleString()} T` : `Vượt ${gap.toLocaleString()} T`}
                        </span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-xs font-bold text-slate-500">Thực tế:</span>
                            </div>
                            <span className="text-sm font-black text-slate-900">{actual.toLocaleString()} T</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                                <span className="text-xs font-bold text-slate-500">Lý thuyết:</span>
                            </div>
                            <span className="text-sm font-black text-slate-400">{theory.toLocaleString()} T</span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <TooltipProvider>
            <div className="bg-white rounded-[32px] border border-vtborder shadow-xl shadow-slate-200/40 p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-soft text-brand rounded-xl shadow-sm">
                            <ChartIcon size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider font-heading">
                                Biểu đồ diễn biến sản lượng & Hiệu suất
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                                So sánh tích lũy Thực tế vs. Công suất thiết bị ({capacity} tấn/giờ)
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {hasActualData ? (
                            <div className={cn(
                                "px-3 py-1.5 rounded-2xl flex items-center gap-2 border shadow-sm transition-colors",
                                isBehind ? "bg-red-50 border-red-100 text-red-600" : "bg-emerald-50 border-emerald-100 text-emerald-600"
                            )}>
                                {isBehind ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                                <span className="text-[10px] font-black uppercase tracking-tighter">
                                    {isBehind ? 'Chậm tiến độ' : 'Vượt tiến độ'}
                                </span>
                            </div>
                        ) : null}

                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm"></div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Thực tế</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-slate-200 border border-slate-400 border-dashed"></div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lý thuyết</span>
                        </div>
                    </div>
                </div>

                {/* Dual Progress Bar Removed */}

                <div className="h-[300px] w-full pt-2">
                    {data.length > 1 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="timeMs"
                                    type="number"
                                    scale="time"
                                    domain={['dataMin', 'dataMax']}
                                    tickFormatter={(unixTime) => new Date(unixTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                                    tickFormatter={(value) => `${value.toLocaleString()}`}
                                    domain={[0, totalVolume]}
                                />
                                <RechartsTooltip content={<CustomTooltip />} />

                                {/* Theoretical Line (Standard) */}
                                <Line
                                    type="monotone"
                                    dataKey="theoreticalCumulative"
                                    stroke="#94a3b8"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    dot={false}
                                    activeDot={false}
                                    name="Lý thuyết"
                                />

                                {/* Actual Line (Primary) */}
                                <Line
                                    type="monotone"
                                    dataKey="actualCumulative"
                                    stroke="#10b981"
                                    strokeWidth={4}
                                    dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6, fill: '#10b981', strokeWidth: 3, stroke: '#fff' }}
                                    name="Thực tế"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                            <ChartIcon size={32} className="text-slate-300 mb-2" />
                            <p className="text-xs font-bold text-slate-400">Chưa có dữ liệu sản lượng</p>
                        </div>
                    )}
                </div>

                {/* KPI Metrics Footer */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-2">
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                        <div className={cn(
                            "p-2 rounded-xl shadow-sm shrink-0",
                            !hasActualData ? "bg-slate-100 text-slate-400" : ((voyage.equipmentEfficiency || 0) < 100 ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600")
                        )}>
                            <Zap size={20} />
                        </div>
                        <div>
                            <div className="text-sm font-black text-slate-900 leading-none flex items-center gap-1.5">
                                {hasActualData ? `${(voyage.equipmentEfficiency || 0).toFixed(1)}%` : 'N/A'}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info size={12} className="text-slate-400 hover:text-slate-600 cursor-help transition-colors" />
                                    </TooltipTrigger>
                                    <TooltipContent align="start" className="max-w-[280px] p-3 shadow-xl border-slate-100">
                                        <div className="space-y-1">
                                            <p className="font-bold text-xs text-slate-800">Hiệu suất thiết bị</p>
                                            <p className="text-[10px] text-slate-500 leading-relaxed">Đo lường mức độ khai thác hiệu quả của thiết bị so với công suất thiết kế:</p>
                                            <div className="bg-slate-50 p-2 rounded text-[10px] font-mono text-slate-600 mt-2 border border-slate-100">
                                                Công suất trung bình / Công suất định mức thiết bị
                                            </div>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Hiệu suất thiết bị</div>
                        </div>
                    </div>

                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                        <div className={cn(
                            "p-2 rounded-xl shadow-sm shrink-0",
                            !hasActualData ? "bg-slate-100 text-slate-400" : "bg-blue-100 text-blue-600"
                        )}>
                            <Target size={20} />
                        </div>
                        <div>
                            <div className="text-sm font-black text-slate-900 leading-none flex items-center gap-1.5">
                                {hasActualData ? `${(voyage.netProductivity || 0).toFixed(1)} tấn/giờ` : 'N/A'}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info size={12} className="text-slate-400 hover:text-slate-600 cursor-help transition-colors" />
                                    </TooltipTrigger>
                                    <TooltipContent align="start" className="max-w-[280px] p-3 shadow-xl border-slate-100">
                                        <div className="space-y-1">
                                            <p className="font-bold text-xs text-slate-800">Công suất trung bình</p>
                                            <p className="text-[10px] text-slate-500 leading-relaxed">Công suất làm hàng thực tế trên toàn bộ thời gian vận hành:</p>
                                            <div className="bg-slate-50 p-2 rounded text-[10px] font-mono text-slate-600 mt-2 border border-slate-100">
                                                Tổng sản lượng / (Tổng thời gian làm hàng - Thời gian tạm ngừng)
                                            </div>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Công suất trung bình</div>
                        </div>
                    </div>

                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                        <div className={cn(
                            "p-2 rounded-xl shadow-sm shrink-0",
                            !hasActualData ? "bg-slate-100 text-slate-400" : (timeDeltaHours > 0 ? "bg-red-100 text-red-600" : (timeDeltaHours < 0 ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-600"))
                        )}>
                            <Timer size={20} />
                        </div>
                        <div>
                            <div className={cn(
                                "text-sm font-black leading-none flex items-center gap-1.5",
                                !hasActualData ? "text-slate-400" : (timeDeltaHours > 0 ? "text-red-600" : (timeDeltaHours < 0 ? "text-emerald-600" : "text-slate-900"))
                            )}>
                                {hasActualData ? (
                                    <>{Math.abs(timeDeltaHours).toFixed(1)}h {timeDeltaHours > 0 ? 'muộn hơn' : (timeDeltaHours < 0 ? 'sớm hơn' : '')}</>
                                ) : 'N/A'}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Info size={12} className="text-slate-400 hover:text-slate-600 cursor-help transition-colors" />
                                    </TooltipTrigger>
                                    <TooltipContent align="start" className="max-w-[280px] p-3 shadow-xl border-slate-100">
                                        <div className="space-y-1">
                                            <p className="font-bold text-xs text-slate-800">Lệch thời gian rời bến</p>
                                            <p className="text-[10px] text-slate-500 leading-relaxed">So sánh tình trạng trễ/sớm tiến độ chuyến:</p>
                                            <div className="bg-slate-50 p-2 rounded text-[10px] font-mono text-slate-600 mt-2 border border-slate-100">
                                                ETD Thực tế - ETD Lý thuyết<br />
                                                <span className="text-slate-400 italic mt-1 block">(+ Trễ tiến độ | - Sớm trước hạn)</span>
                                            </div>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Lệch thời gian rời bến</div>
                        </div>
                    </div>
                </div>

                {/* <div className="bg-brand-soft/50 rounded-2xl p-4 flex items-start gap-4 border border-brand/10">
                    <Info size={16} className="text-brand shrink-0 mt-0.5" />
                    <p className="text-[11px] font-bold text-slate-600 leading-relaxed italic">
                        Biểu đồ biểu diễn tổng sản lượng lũy kế tại tâm các thời điểm nhập phiếu làm hàng. Đường đứt nét màu xám thể hiện sản lượng lý thuyết cần đạt được ứng với hiệu suất cẩu thực tế đang vận hành.
                    </p>
                </div> */}
            </div>
        </TooltipProvider>
    );
}
