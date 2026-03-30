'use client';

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ReferenceLine } from 'recharts';
import { TrendingUp, Calendar, AlertCircle } from 'lucide-react';

interface EquipmentPerformanceChartProps {
    dailyHistory: Array<{
        date: string;
        volume: number;
        hours: number;
        productivity: number;
        expectedCapacity: number;
    }> | undefined;
    isLoading: boolean;
}

export function EquipmentPerformanceChart({ dailyHistory, isLoading }: EquipmentPerformanceChartProps) {
    if (isLoading) {
        return (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-6 h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-brand border-t-transparent animate-spin"></div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Đang nạp dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (!dailyHistory || dailyHistory.length === 0) {
        return (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-6 h-[300px] flex items-center justify-center flex-col gap-2">
                <AlertCircle className="w-8 h-8 text-slate-300" />
                <p className="text-sm font-medium text-slate-400">Chưa có dữ liệu làm hàng</p>
            </div>
        );
    }

    // Reference capacity comes from the first item since it's the equipment's capacity
    const expectedCapacity = dailyHistory[0]?.expectedCapacity || 0;

    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <TrendingUp size={16} className="text-brand" />
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 font-heading">
                            Biểu đồ Công suất cẩu
                        </h2>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">Theo dõi Công suất khai thác bình quân theo ngày (tấn/giờ)</p>
                </div>
                <div className="flex items-center gap-4 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-0.5 bg-brand"></div>
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">Thực tế</span>
                    </div>
                    <div className="w-px h-3 bg-slate-200"></div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-0.5 border-t border-dashed border-red-400"></div>
                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">Lý thuyết ({expectedCapacity})</span>
                    </div>
                </div>
            </div>

            <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="prodGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                            dy={10}
                            tickFormatter={(val) => {
                                const d = new Date(val);
                                return `${d.getDate()}/${d.getMonth() + 1}`;
                            }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                            dx={-10}
                        />
                        <RechartsTooltip
                            contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                                padding: '12px'
                            }}
                            cursor={{ stroke: '#e2e8f0', strokeWidth: 1, strokeDasharray: '4 4' }}
                            formatter={(value: any) => [`${Number(value).toFixed(1)} tấn/giờ`, 'Công suất']}
                            labelFormatter={(label) => `Ngày ${label}`}
                        />

                        {expectedCapacity > 0 && (
                            <ReferenceLine
                                y={expectedCapacity}
                                stroke="#f87171"
                                strokeDasharray="4 4"
                                strokeWidth={1.5}
                            />
                        )}

                        <Line
                            type="monotone"
                            dataKey="productivity"
                            stroke="#0ea5e9"
                            strokeWidth={3}
                            dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4, stroke: '#fff' }}
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#0ea5e9' }}
                            animationDuration={1500}
                            animationEasing="ease-in-out"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
