'use client';

import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { Download, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useVolumeReport } from '@/features/reports/hooks';
import { DatePicker } from '@/components/ui';
import { formatDate, formatDateTime } from '@/lib/utils/date';
import * as XLSX from 'xlsx';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function VolumeReportPage() {
    const [dateRange, setDateRange] = useState({
        start: new Date(),
        end: new Date()
    });

    const startStr = formatDate(dateRange.start, 'yyyy-MM-dd');
    const endStr = formatDate(dateRange.end, 'yyyy-MM-dd');

    const { data: volumeData, isLoading: isLoadingVolume } = useVolumeReport(startStr, endStr);

    const chartData = useMemo(() => {
        if (!volumeData || volumeData.length === 0) return [];
        const grouped: Record<string, any> = {};
        const volumeByDate = (volumeData || []).reduce((acc: any, log: any) => {
            const dateKey = log.endTime ? format(new Date(log.endTime), 'yyyy-MM-dd') : 'unknown';
            if (!acc[dateKey]) acc[dateKey] = { date: dateKey };
            const prodKey = log.productName || 'Khác';
            acc[dateKey][prodKey] = (acc[dateKey][prodKey] || 0) + Number(log.amount || 0);
            return acc;
        }, {});

        return Object.values(volumeByDate).sort((a: any, b: any) => a.date.localeCompare(b.date));
    }, [volumeData]);

    const handleExport = () => {
        if (!volumeData || volumeData.length === 0) return;
        const wb = XLSX.utils.book_new();

        const volData: any[][] = [['Mã Tàu', 'Tàu', 'Mã Hàng', 'Hàng Hóa', 'Sản Lượng (tấn)', 'Số Giờ', 'Ca', 'Bắt đầu', 'Kết thúc']];
        volumeData.forEach((v: any) => volData.push([v.vesselCode, v.vesselName, v.productCode, v.productName, v.amount, v.hours, v.shiftCode, formatDateTime(v.startTime), formatDateTime(v.endTime)]));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(volData), 'Sản Lượng (Chi tiết)');

        XLSX.writeFile(wb, `Bao_Cao_San_Luong_${startStr}_${endStr}.xlsx`);
    };

    return (
        <div className="flex flex-col w-full min-h-screen bg-slate-50/50 p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 bg-brand/10 border border-brand/20 rounded-lg">
                            <FileText className="w-5 h-5 text-brand" />
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Báo Cáo Sản Lượng</h1>
                    </div>
                    <p className="text-sm font-medium text-slate-500">Phân tích sản lượng làm hàng theo các ca làm việc</p>
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

            <Card className="border-slate-200/60 shadow-sm mt-6">
                <CardHeader className="border-b border-slate-50 bg-slate-50/30">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-900">Sản Lượng Theo Ca Làm Việc</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {isLoadingVolume ? (
                        <div className="h-[400px] flex items-center justify-center text-slate-400 font-medium">Đang tải dữ liệu...</div>
                    ) : chartData.length === 0 ? (
                        <div className="h-[400px] flex items-center justify-center text-slate-400 font-medium">Không có dữ liệu sản lượng trong kỳ</div>
                    ) : (
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
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
                                    <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dx={-10} />
                                    <RechartsTooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        labelFormatter={(label) => {
                                            try {
                                                return format(new Date(label), 'dd/MM/yyyy');
                                            } catch (e) {
                                                return label;
                                            }
                                        }}
                                    />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                                    <Bar dataKey="CA_1" stackId="a" name="Ca 1 (Sáng)" fill="#3b82f6" radius={[0, 0, 4, 4]} maxBarSize={50} />
                                    <Bar dataKey="CA_2" stackId="a" name="Ca 2 (Chiều)" fill="#10b981" maxBarSize={50} />
                                    <Bar dataKey="CA_3" stackId="a" name="Ca 3 (Đêm)" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
