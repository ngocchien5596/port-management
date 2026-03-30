import React from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui';

interface VoyageProgress {
    id: string;
    amount: number;
    hours: number;
    productivity: number;
    notes?: string;
    userId: string;
    createdAt: string;
}

export default function ProductivityTable({ logs }: { logs: VoyageProgress[] }) {
    if (!logs || logs.length === 0) {
        return <div className="text-center py-8 text-slate-400 italic">Chưa có dữ liệu sản lượng</div>;
    }

    // Calculate totals
    const totalAmount = logs.reduce((sum, log) => sum + Number(log.amount), 0);
    const totalHours = logs.reduce((sum, log) => sum + Number(log.hours || 0), 0);
    const avgProductivity = totalHours > 0 ? Math.round(totalAmount / totalHours) : 0;

    return (
        <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                        <th className="px-4 py-3">Thời gian</th>
                        <th className="px-4 py-3 text-right">Sản lượng (tấn)</th>
                        <th className="px-4 py-3 text-right">Thời gian (Giờ)</th>
                        <th className="px-4 py-3 text-right">Công suất (tấn/giờ)</th>
                        <th className="px-4 py-3">Ghi chú</th>
                        <th className="px-4 py-3">Người nhập</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {logs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 text-slate-600">
                                {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm')}
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-slate-900">
                                {Number(log.amount).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-right text-slate-600">
                                {Number(log.hours || 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-brand">
                                {Math.round(Number(log.productivity || 0)).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-slate-500 italic max-w-[200px] truncate">
                                {log.notes || '-'}
                            </td>
                            <td className="px-4 py-3 text-slate-500 text-xs">
                                {log.userId || 'System'}
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot className="bg-slate-50 font-bold text-slate-700">
                    <tr>
                        <td className="px-4 py-3">TỔNG CỘNG</td>
                        <td className="px-4 py-3 text-right text-emerald-600">
                            {totalAmount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                            {totalHours.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right text-brand">
                            {avgProductivity.toLocaleString()} (TB)
                        </td>
                        <td colSpan={2}></td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}
