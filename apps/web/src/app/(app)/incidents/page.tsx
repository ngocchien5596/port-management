'use client';

import { startOfDay, endOfDay, isBefore, isAfter } from 'date-fns';

import React, { useState } from 'react';
import { useIncidents, useResolveIncident, useDeleteIncident } from '@/features/incidents/hooks';
import { Incident } from '@/features/incidents/types';
import { Search, AlertTriangle, Clock, CheckCircle, Filter, ChevronDown, Trash2, Ship, Anchor, Layout, MessageSquare } from 'lucide-react';
import { Button, CreateButton, ConfirmDialog, Badge, DatePicker } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import { formatDateTime } from '@/lib/utils/date';
import AddIncidentModal from '@/features/incidents/components/AddIncidentModal';
import IncidentCard from '@/features/incidents/components/IncidentCard';
import Link from 'next/link';

const SEVERITY_MAP: Record<string, string> = {
    'RED': 'Nghiêm trọng / Dừng làm việc',
    'YELLOW': 'Gây chậm trễ',
    'GREEN': 'Nhẹ / Cần theo dõi'
};

const TYPE_MAP: Record<string, string> = {
    'TECHNICAL': 'Lỗi kỹ thuật',
    'WEATHER': 'Thời tiết xấu',
    'OPERATIONAL': 'Lỗi vận hành',
    'EXTERNAL': 'Nguyên nhân khách quan',
    'OTHER': 'Nguyên nhân khác'
};

export default function IncidentLogPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterScope, setFilterScope] = useState('all');
    const [filterSeverity, setFilterSeverity] = useState('all');
    const [filterDate, setFilterDate] = useState<Date | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const { data: incidents, isLoading } = useIncidents({
        scope: filterScope !== 'all' ? filterScope : undefined,
        severity: filterSeverity !== 'all' ? filterSeverity : undefined,
        parentId: 'null'
    });

    const resolveMutation = useResolveIncident();
    const deleteMutation = useDeleteIncident();

    const handleResolve = async (id: string) => {
        await resolveMutation.mutateAsync({ id, endTime: undefined });
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        await deleteMutation.mutateAsync(deletingId);
        setDeletingId(null);
    };

    const filteredIncidents = incidents?.filter((i: Incident) => {
        // 1. Text Search
        const matchesSearch = i.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            i.type.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;

        // 2. Date Filter
        if (filterDate) {
            const selectedDate = new Date(filterDate);
            const dayStart = startOfDay(selectedDate);
            const dayEnd = endOfDay(selectedDate);

            const incidentStart = new Date(i.startTime);
            const incidentEnd = i.endTime ? new Date(i.endTime) : null;

            // Incident active if: Start <= DayEnd AND (No End OR End >= DayStart)
            const isBeforeOrOnDayEnd = incidentStart <= dayEnd;
            const isAfterOrOnDayStart = !incidentEnd || incidentEnd >= dayStart;

            if (!isBeforeOrOnDayEnd || !isAfterOrOnDayStart) return false;
        }

        return true;
    }) || [];

    if (isLoading) return <div className="py-20 text-center text-slate-400 font-bold">Đang tải nhật ký sự cố...</div>;

    // --- KPI Calculations (Active Incidents Only) ---
    const activeIncidents = incidents?.filter((i: Incident) => !i.endTime) || [];
    const totalActive = activeIncidents.length;
    const redActive = activeIncidents.filter((i: Incident) => i.severity === 'RED').length;
    const equipmentActive = activeIncidents.filter((i: Incident) => i.scope === 'EQUIPMENT').length;
    const globalActive = activeIncidents.filter((i: Incident) => i.scope === 'GLOBAL' || i.scope === 'LANE').length;
    // ------------------------------------------------

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-xl font-bold text-slate-700 tracking-tight flex items-center gap-3">
                        Nhật ký sự cố
                    </h3>
                    <p className="text-slate-500 font-medium text-sm mt-1">Theo dõi và quản lý các gián đoạn vận hành tại cảng</p>
                </div>
                <CreateButton onClick={() => setIsAddModalOpen(true)}>
                    Báo cáo sự cố
                </CreateButton>
            </div>

            {/* OVERVIEW KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-2xl border border-vtborder shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start text-slate-500">
                        <span className="font-medium text-slate-500">Đang diễn ra</span>
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-3xl font-black text-slate-900 tracking-tight">{totalActive}</span>
                        <span className="text-xs font-semibold text-slate-400">sự cố</span>
                    </div>
                </div>

                <div className={`p-4 rounded-2xl border flex flex-col justify-between transition-shadow ${redActive > 0 ? 'bg-red-50/50 border-red-200 shadow-sm hover:shadow-md' : 'bg-white border-vtborder shadow-sm'}`}>
                    <div className={`flex justify-between items-start ${redActive > 0 ? 'text-red-600' : 'text-slate-500'}`}>
                        <span className="font-medium flex items-center gap-1">
                            {redActive > 0 && <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>}
                            Nghiêm trọng
                        </span>
                        {redActive === 0 && <CheckCircle className="w-4 h-4 text-emerald-500/50" />}
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className={`text-3xl font-black tracking-tight ${redActive > 0 ? 'text-red-700' : 'text-slate-900'}`}>{redActive}</span>
                        <span className={`text-xs font-semibold ${redActive > 0 ? 'text-red-500 bg-red-100/50 px-1.5 py-0.5 rounded' : 'text-slate-400'}`}>
                            {redActive > 0 ? 'Cần xử lý' : 'sự cố'}
                        </span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-vtborder shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start text-slate-500">
                        <span className="font-medium text-slate-500">Thiết bị lỗi</span>
                        <Anchor className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-3xl font-black text-slate-900 tracking-tight">{equipmentActive}</span>
                        <span className="text-xs font-semibold text-slate-400">thiết bị</span>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-vtborder shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start text-slate-500">
                        <span className="font-medium text-slate-500">Toàn cảng/Luồng</span>
                        <Layout className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-3xl font-black text-slate-900 tracking-tight">{globalActive}</span>
                        <span className="text-xs font-semibold text-slate-400">cảnh báo</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[24px] border border-vtborder shadow-xl shadow-slate-200/50 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-surface-2 flex flex-col lg:flex-row gap-4 items-center justify-between bg-white">
                    <div className="relative flex-1 w-full lg:max-w-md">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-vttext-muted">
                            <Search className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            placeholder="Tìm theo nội dung sự cố..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 bg-surface-2 border border-vtborder rounded-xl text-sm font-medium text-vttext-primary focus:outline-none focus:ring-2 focus:ring-focus focus:border-brand transition-all"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <div className="relative min-w-[140px] flex-1 lg:flex-none">
                            <DatePicker
                                selected={filterDate}
                                onChange={(date) => setFilterDate(date)}
                                className="w-full h-10 px-4 bg-white border border-vtborder rounded-xl text-sm font-bold text-vttext-secondary focus:outline-none transition-all placeholder:text-slate-400"
                                placeholderText="Tất cả thời gian"
                            />
                        </div>

                        <div className="relative min-w-[140px] flex-1 lg:flex-none">
                            <select
                                value={filterScope}
                                onChange={(e) => setFilterScope(e.target.value)}
                                className="w-full h-10 pl-4 pr-8 bg-white border border-vtborder rounded-xl text-sm font-bold text-vttext-secondary focus:outline-none appearance-none cursor-pointer"
                            >
                                <option value="all">Mọi phạm vi</option>
                                <option value="GLOBAL">Toàn cảng</option>
                                <option value="VOYAGE">Chuyến tàu</option>
                                <option value="EQUIPMENT">Thiết bị, máy móc</option>
                                <option value="LANE">Luồng</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-vttext-muted pointer-events-none" />
                        </div>

                        <div className="relative min-w-[140px] flex-1 lg:flex-none">
                            <select
                                value={filterSeverity}
                                onChange={(e) => setFilterSeverity(e.target.value)}
                                className="w-full h-10 pl-4 pr-8 bg-white border border-vtborder rounded-xl text-sm font-bold text-vttext-secondary focus:outline-none appearance-none cursor-pointer"
                            >
                                <option value="all">Mọi mức độ</option>
                                <option value="RED">Nghiêm trọng (RED)</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-vttext-muted pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 border-b border-slate-100 italic uppercase tracking-wider">
                                <th className="px-6 py-4 w-16">STT</th>
                                <th className="px-6 py-4">Thời gian bắt đầu</th>
                                <th className="px-6 py-4">Thời gian kết thúc</th>
                                <th className="px-6 py-4">Đối tượng</th>
                                <th className="px-6 py-4">Loại & Mức độ</th>
                                <th className="px-6 py-4">Nội dung</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredIncidents.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-30">
                                            <CheckCircle size={40} className="text-emerald-500" />
                                            <p className="text-sm font-medium text-slate-400">Không có sự cố nào được ghi nhận</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredIncidents.map((i: Incident, index: number) => {
                                    const isResolved = !!i.endTime;
                                    const targetName = i.scope === 'VOYAGE' ? (i.voyage?.vessel?.name || i.voyage?.vessel?.code) :
                                        i.scope === 'EQUIPMENT' ? i.equipment?.name :
                                            i.scope === 'LANE' ? i.lane?.name : 'Toàn cảng';
                                    const Icon = i.scope === 'VOYAGE' ? Ship :
                                        i.scope === 'EQUIPMENT' ? Anchor :
                                            i.scope === 'LANE' ? Layout : AlertTriangle;

                                    return (
                                        <tr key={i.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-[10px] text-slate-400">
                                                #{filteredIncidents.length - index}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-xs font-bold text-slate-700 tracking-tight">
                                                    {formatDateTime(i.startTime)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {i.endTime ? (
                                                    <div className="text-xs font-bold text-slate-700 tracking-tight flex items-center gap-1.5">
                                                        {formatDateTime(i.endTime)}
                                                    </div>
                                                ) : (
                                                    <div className="text-xs font-bold text-slate-400 italic">
                                                        -
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-white transition-colors">
                                                        <Icon size={12} />
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-black text-slate-900 uppercase tracking-tight line-clamp-1">
                                                            {targetName}
                                                        </div>
                                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                            {i.scope === 'VOYAGE' ? 'Chuyến tàu' :
                                                                i.scope === 'EQUIPMENT' ? 'Thiết bị, máy móc' :
                                                                    i.scope === 'LANE' ? 'Luồng' : 'Toàn cảng'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1.5">
                                                    <div className="text-[10px] font-bold text-slate-600 truncate max-w-[120px]" title={i.type}>
                                                        {TYPE_MAP[i.type.toUpperCase()] || i.type}
                                                    </div>
                                                    <Badge
                                                        variant={i.severity === 'RED' ? 'destructive' : i.severity === 'YELLOW' ? 'warning' : 'success'}
                                                        className="text-[8px] font-black h-4 px-1.5 leading-none"
                                                    >
                                                        {SEVERITY_MAP[i.severity] || i.severity}
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs font-medium text-slate-600 line-clamp-2 leading-relaxed max-w-sm">
                                                    {i.description}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                {isResolved ? (
                                                    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full">
                                                        <CheckCircle size={10} />
                                                        <span className="text-[9px] font-black uppercase tracking-tighter">Đã xử lý</span>
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-amber-50 text-amber-600 rounded-full animate-pulse">
                                                        <Clock size={10} />
                                                        <span className="text-[9px] font-black uppercase tracking-tighter">Đang diễn ra</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    {!isResolved && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                                                            onClick={() => handleResolve(i.id)}
                                                            title="Đánh dấu đã xử lý"
                                                        >
                                                            <CheckCircle size={14} />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-7 w-7 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                                        onClick={() => setDeletingId(i.id)}
                                                        title="Xóa báo cáo"
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddIncidentModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />

            <ConfirmDialog
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={handleDelete}
                title="Xóa báo cáo sự cố?"
                description="Hành động này sẽ xóa vĩnh viễn dữ liệu về sự cố này khỏi hệ thống."
                type="danger"
            />
        </div>
    );
}
