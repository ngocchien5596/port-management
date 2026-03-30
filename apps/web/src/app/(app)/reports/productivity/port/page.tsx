'use client';

import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { Download, FileText, Activity, Zap, Layers, TrendingUp, Ship } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, DatePicker } from '@/components/ui';
import { usePortAnalytics } from '@/features/reports/hooks';
import { formatDate, formatDateTime } from '@/lib/utils/date';
import * as XLSX from 'xlsx';
import {
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    ComposedChart, Line, Area
} from 'recharts';

export default function PortProductivityPage() {
    const [dateRange, setDateRange] = useState({
        start: new Date(),
        end: new Date()
    });

    const startStr = formatDate(dateRange.start, 'yyyy-MM-dd');
    const endStr = formatDate(dateRange.end, 'yyyy-MM-dd');

    const { data: portData, isLoading: isLoadingPort } = usePortAnalytics(startStr, endStr);

    // Chart Data for Port Tab
    const portChartData = useMemo(() => {
        if (!portData || !portData.logs) return [];
        const grouped: Record<string, any> = {};

        portData.logs.forEach((log: any) => {
            if (!log.endTime) return;

            // Use date part for grouping to ensure data from same day is collapsed
            try {
                const dayKey = log.endTime ? format(new Date(log.endTime), 'yyyy-MM-dd') : 'unknown';

                if (!grouped[dayKey]) {
                    grouped[dayKey] = {
                        date: dayKey,
                        amount: 0,
                        hours: 0,
                        rated: Number(log.ratedCapacity || 0)
                    };
                }
                grouped[dayKey].amount += Number(log.amount);
                grouped[dayKey].hours += Number(log.hours || 0);
            } catch (e) {
                console.error('Error parsing log date:', log.endTime);
            }
        });

        return Object.values(grouped)
            .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((g: any) => ({
                date: g.date,
                actual: g.hours > 0 ? Math.round(g.amount / g.hours) : 0,
                rated: g.rated
            }));
    }, [portData]);

    const handleExport = () => {
        if (!portData || !portData.logs) return;
        const wb = XLSX.utils.book_new();
        const exportData = portData.logs.map((l: any) => ({
            'Ngày': formatDateTime(l.endTime),
            'Sản lượng': l.amount,
            'Giờ làm': l.hours,
            'Định mức': l.ratedCapacity,
            'NMPH': l.hours > 0 ? Math.round(l.amount / l.hours) : 0
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        XLSX.utils.book_append_sheet(wb, ws, 'Productivity');
        XLSX.writeFile(wb, `Bao_Cao_Nang_Suat_Toan_Cang_${startStr}_${endStr}.xlsx`);
    };

    const KPICard = ({ title, value, unit, icon: Icon, color }: any) => (
        <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all duration-300">
            <CardContent className="p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
                        <div className="flex items-baseline gap-1">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
                            <span className="text-xs font-bold text-slate-500">{unit}</span>
                        </div>
                    </div>
                    <div className={`p-3 rounded-2xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="flex flex-col w-full min-h-screen bg-slate-50/50 p-6 space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 bg-brand/10 border border-brand/20 rounded-lg">
                            <Activity className="w-5 h-5 text-brand" />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Năng suất Toàn Cảng</h1>
                    </div>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Hiệu suất vận hành hạ tầng cảng tổng thể</p>
                </div>

                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 px-2 border-r border-slate-100">
                        <DatePicker
                            selected={dateRange.start}
                            onChange={(date) => setDateRange(prev => ({ ...prev, start: date || new Date() }))}
                            className="border-none bg-transparent focus-visible:ring-0 w-28 h-8 text-xs font-bold"
                        />
                        <span className="text-slate-300 mx-1">—</span>
                        <DatePicker
                            selected={dateRange.end}
                            onChange={(date) => setDateRange(prev => ({ ...prev, end: date || new Date() }))}
                            className="border-none bg-transparent focus-visible:ring-0 w-28 h-8 text-xs font-bold"
                        />
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleExport}
                        className="bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-[11px] uppercase tracking-wider"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Xuất Excel
                    </Button>
                </div>
            </div>

            {/* Port KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Năng suất TB" value={parseFloat((portData?.summary?.avgNmph || 0).toFixed(1))} unit="tấn/h" icon={Zap} color="bg-blue-500" />
                <KPICard title="Sản lượng" value={parseFloat((portData?.summary?.totalAmount || 0).toFixed(1))} unit="tấn" icon={Layers} color="bg-emerald-500" />
                <KPICard title="Hiệu suất" value={parseFloat((portData?.summary?.efficiency || 0).toFixed(1))} unit="%" icon={TrendingUp} color="bg-orange-400" />
                <KPICard title="Thời gian TB tàu trong cảng" value={parseFloat((portData?.summary?.avgTurnaroundTime || 0).toFixed(1))} unit="giờ" icon={Ship} color="bg-indigo-500" />
            </div>

            <Card className="border-slate-200/60 shadow-sm overflow-hidden">
                <CardHeader className="border-b border-slate-50 bg-slate-50/30 flex flex-row items-center justify-between py-4">
                    <div>
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-900">Chu kỳ Năng suất Toàn Cảng</CardTitle>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Thực tế vs Tổng định mức thiết bị toàn cảng</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                            <span className="text-[10px] font-black text-slate-500 uppercase">Định mức</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
                            <span className="text-[10px] font-black text-slate-500 uppercase">Thực tế</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="h-[400px] w-full">
                        {isLoadingPort ? (
                            <div className="h-full flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">Đang tải dữ liệu...</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={portChartData}>
                                    <defs>
                                        <linearGradient id="colorProd" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="date"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                                        dy={10}
                                        tickFormatter={(str) => {
                                            try {
                                                return format(new Date(str), 'dd/MM');
                                            } catch (e) {
                                                return str;
                                            }
                                        }}
                                    />
                                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} dx={-10} />
                                    <RechartsTooltip
                                        cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                                        contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)' }}
                                        labelFormatter={(label) => {
                                            try {
                                                return format(new Date(label), 'dd/MM/yyyy');
                                            } catch (e) {
                                                return label;
                                            }
                                        }}
                                    />
                                    <Area type="monotone" dataKey="actual" stroke="none" fillOpacity={1} fill="url(#colorProd)" tooltipType="none" legendType="none" />
                                    <Line type="monotone" dataKey="rated" name="Định mức (tấn/h)" stroke="#fb923c" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                    <Line type="monotone" dataKey="actual" name="Thực tế (tấn/h)" stroke="#3b82f6" strokeWidth={4} dot={{ stroke: '#3b82f6', strokeWidth: 3, r: 4, fill: '#fff' }} activeDot={{ r: 6 }} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
