'use client';

import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Modal, Input, Button, CreateButton, ConfirmDialog } from '@/components/ui';
import { useRouter } from 'next/navigation';
import { useVoyages, useDeleteVoyage } from '@/features/qltau/hooks';
import { formatDateTime, formatDate } from '@/lib/utils/date';
import { DatePicker } from '@/components/ui';
import { Voyage } from '@/features/qltau/types';
import { Plus, Search, Edit2, Trash2, Ship, Anchor, MapPin, Activity, ChevronDown, Filter, ShieldCheck, CalendarDays, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';


import { VOYAGE_STATUS_CONFIG, getStatusConfig } from '@/constants/voyage';


import CreateVoyageModal from './CreateVoyageModal';
import StatusTransitionModal from './StatusTransitionModal';
import AddShiftProgressModal from './AddShiftProgressModal';

export default function VoyagesPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [filterEtaDate, setFilterEtaDate] = useState<Date | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [statusModalVoyage, setStatusModalVoyage] = useState<Voyage | null>(null);
    const [progressModalVoyage, setProgressModalVoyage] = useState<Voyage | null>(null);
    const [editModalVoyage, setEditModalVoyage] = useState<Voyage | undefined>(undefined);
    const [deleteModalVoyage, setDeleteModalVoyage] = useState<Voyage | null>(null);

    const { data: voyages, isLoading, refetch } = useVoyages();
    const deleteMutation = useDeleteVoyage();

    const handleDelete = async () => {
        if (!deleteModalVoyage) return;
        try {
            console.log('VoyagesPage: Deleting voyage...', deleteModalVoyage.id);
            await deleteMutation.mutateAsync(deleteModalVoyage.id);
            console.log('VoyagesPage: Mutation successful. Resetting queries...');

            // Aggressive refresh: reset clears data and triggers refetch
            await queryClient.resetQueries({ queryKey: ['qltau', 'voyages'] });

            // Extra insurance: explicitly refetch active queries
            await queryClient.refetchQueries({ queryKey: ['qltau', 'voyages'], type: 'active' });

            console.log('VoyagesPage: Refetch initiated.');
            await refetch();
        } catch (error) {
            console.error('Error deleting voyage:', error);
        } finally {
            setDeleteModalVoyage(null);
        }
    };

    const filteredVoyages = voyages?.filter((voyage: Voyage) => {
        const matchesSearch = voyage.vessel?.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            voyage.vessel?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            voyage.voyageCode?.toString().includes(searchTerm);

        const matchesStatus = filterStatus === 'all' || voyage.status === filterStatus;
        const matchesType = filterType === 'all' || voyage.type === filterType;
        const matchesEta = !filterEtaDate || (
            voyage.eta &&
            formatDate(new Date(voyage.eta), 'yyyy-MM-dd') === formatDate(filterEtaDate, 'yyyy-MM-dd')
        );

        return matchesSearch && matchesStatus && matchesType && matchesEta;
    }) || [];

    const getStatusBadge = (status: string, voyage: Voyage) => {
        const config = getStatusConfig(status);
        const badgeClasses = cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider transition-all shadow-sm",
            config.bg,
            config.color,
            config.border
        );

        if (status === 'HOAN_THANH') {
            return (
                <div className={badgeClasses} title="Chuyến tàu đã hoàn thành">
                    {config.label}
                </div>
            );
        }

        return (
            <button
                onClick={() => setStatusModalVoyage(voyage)}
                className={cn(badgeClasses, "hover:opacity-80 active:scale-95")}
                title="Cập nhật trạng thái"
            >
                {config.label}
            </button>
        );
    };

    if (isLoading) return <div className="py-20 text-center text-slate-400 font-bold">Đang tải biểu mẫu...</div>;

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Ship className="w-8 h-8 text-brand" />
                        Quản lý chuyến tàu
                    </h3>
                    <p className="text-[15px] text-slate-500 mt-1 font-medium italic">Theo dõi và điều phối các chuyến tàu cập bến</p>
                </div>
                <CreateButton onClick={() => setIsCreateModalOpen(true)}>
                    Thêm chuyến mới
                </CreateButton>
            </div>

            {/* Content Card Container */}
            <div className="bg-white rounded-[24px] border border-vtborder shadow-xl shadow-slate-200/50 overflow-hidden">
                {/* Integrated Toolbar */}
                <div className="p-4 border-b border-surface-2 flex flex-col lg:flex-row gap-4 items-center justify-between bg-white">
                    <div className="relative flex-1 w-full lg:max-w-md">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-vttext-muted">
                            <Search className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            placeholder="Tìm kiếm tàu, mã chuyến..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 bg-surface-2 border border-vtborder rounded-xl text-sm font-medium text-vttext-primary focus:outline-none focus:ring-2 focus:ring-focus focus:border-brand transition-all"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <div className="relative min-w-[140px] flex-1 lg:flex-none">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-vttext-muted">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full h-10 pl-9 pr-8 bg-white border border-vtborder rounded-xl text-sm font-bold text-vttext-secondary focus:outline-none focus:ring-2 focus:ring-focus focus:border-brand appearance-none cursor-pointer transition-all"
                            >
                                <option value="all">Tất cả trạng thái</option>
                                {Object.entries(VOYAGE_STATUS_CONFIG).map(([value, config]) => (
                                    <option key={value} value={value}>{config.label}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-vttext-muted pointer-events-none" />
                        </div>

                        <div className="relative min-w-[140px] flex-1 lg:flex-none">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-vttext-muted">
                                <Filter className="w-4 h-4" />
                            </div>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full h-10 pl-9 pr-8 bg-white border border-vtborder rounded-xl text-sm font-bold text-vttext-secondary focus:outline-none focus:ring-2 focus:ring-focus focus:border-brand appearance-none cursor-pointer transition-all"
                            >
                                <option value="all">Loại chuyến</option>
                                <option value="NHAP">Nhập hàng</option>
                                <option value="XUAT">Xuất hàng</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-vttext-muted pointer-events-none" />
                        </div>

                        <div className="relative min-w-[140px] flex-1 lg:flex-none">
                            <DatePicker
                                selected={filterEtaDate}
                                onChange={(date) => setFilterEtaDate(date)}
                                className="w-full h-10 px-4 bg-white border border-vtborder rounded-xl text-sm font-bold text-vttext-secondary focus:outline-none transition-all placeholder:text-slate-400"
                                placeholderText="Ngày dự kiến (ETA)"
                            />
                        </div>

                        <div className="h-10 px-4 bg-surface-2 border border-vtborder rounded-xl flex items-center gap-2.5 shrink-0 hidden sm:flex">
                            <span className="text-[10px] font-black text-vttext-muted uppercase tracking-widest">Tổng cộng</span>
                            <span className="text-sm font-black text-brand">{filteredVoyages.length}</span>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="py-5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Mã chuyến</th>
                                <th className="py-5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Mã tàu</th>
                                <th className="py-5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Dự kiến (ETA)</th>
                                <th className="py-5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Trọng tải</th>
                                <th className="py-5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Mục đích</th>
                                <th className="py-5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Trạng thái</th>
                                <th className="py-5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Sản lượng</th>
                                <th className="py-5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] w-32 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {filteredVoyages.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="py-20 text-center text-slate-400 italic text-[15px]">
                                        Không tìm thấy chuyến tàu nào
                                    </td>
                                </tr>
                            ) : (
                                filteredVoyages.map((voyage: Voyage, idx: number) => (
                                    <tr key={voyage.id} className={cn(
                                        "transition-colors group relative",
                                        voyage.priority === 'EMERGENCY'
                                            ? "bg-rose-50/50 hover:bg-rose-100/60"
                                            : "hover:bg-brand-soft/30"
                                    )}>
                                        <td className="py-5 px-6 relative">
                                            {voyage.priority === 'EMERGENCY' && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 rounded-r-md" />
                                            )}
                                            <div className="flex items-center gap-2.5">
                                                <span className={cn(
                                                    "text-sm font-bold",
                                                    voyage.priority === 'EMERGENCY' ? "text-rose-700 font-black" : "text-slate-900"
                                                )}>{voyage.voyageCode}</span>
                                                {voyage.priority === 'EMERGENCY' && (
                                                    <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center shrink-0" title="Chuyến tàu Khẩn Cấp">
                                                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-5 px-6">
                                            <div className="flex flex-col">
                                                <button
                                                    onClick={() => router.push(`/voyages/${voyage.id}`)}
                                                    className="text-sm font-black text-slate-900 text-left hover:text-brand transition-colors tracking-tight"
                                                    title={voyage.vessel?.name || undefined}
                                                >
                                                    {voyage.vessel?.code || '---'}
                                                </button>
                                                <span className="text-[10px] font-bold text-slate-500 mt-1">{voyage.vessel?.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-5 px-6 text-center">
                                            {voyage.eta ? (
                                                <div className="inline-flex flex-col items-center">
                                                    <span className="text-[12px] font-bold text-slate-700 tracking-tight">
                                                        {formatDateTime(voyage.eta).split(' ')[1]}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400">
                                                        {formatDateTime(voyage.eta).split(' ')[0]}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-sm font-medium text-slate-400 italic">Chưa đặt</span>
                                            )}
                                        </td>
                                        <td className="py-5 px-6 text-right">
                                            <span className="inline-flex flex-col items-end">
                                                <span className="text-sm font-bold text-slate-700">{Number(voyage.vessel?.capacity || 0).toLocaleString('vi-VN')}</span>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">DWT</span>
                                            </span>
                                        </td>
                                        <td className="py-5 px-6">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${voyage.type === 'NHAP'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                : 'bg-brand-soft text-brand border-brand/10'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${voyage.type === 'NHAP' ? 'bg-emerald-500' : 'bg-brand'}`}></span>
                                                {voyage.type === 'NHAP' ? 'Nhập hàng' : 'Xuất hàng'}
                                            </span>
                                        </td>
                                        <td className="py-5 px-6 text-center">
                                            {getStatusBadge(voyage.status, voyage)}
                                        </td>
                                        <td className="py-5 px-6">
                                            {(() => {
                                                const total = Number(voyage.totalVolume || 0);
                                                const cumulative = voyage.progress && voyage.progress.length > 0
                                                    ? Number(voyage.progress[0].cumulative)
                                                    : 0;
                                                const percent = total > 0 ? Math.min(100, Math.round((cumulative / total) * 100)) : 0;

                                                return (
                                                    <div className="flex flex-col items-center gap-1 min-w-[100px]">
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-xs font-bold text-slate-700">{cumulative.toLocaleString('vi-VN')}</span>
                                                            <span className="text-[10px] text-slate-400 font-bold">/ {total.toLocaleString('vi-VN')}</span>
                                                        </div>
                                                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200/50">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-500 ${percent >= 100 ? 'bg-emerald-500' : percent > 0 ? 'bg-brand' : 'bg-slate-300'}`}
                                                                style={{ width: `${percent}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-[10px] font-black text-slate-500">{percent}%</span>
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td className="py-5 px-6 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {voyage.status === 'LAM_HANG' && (
                                                    <button
                                                        onClick={() => setProgressModalVoyage(voyage)}
                                                        className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-amber-600 border border-transparent hover:border-amber-100 transition-all shadow-sm shadow-transparent hover:shadow-amber-100"
                                                        title="Nhập sản lượng"
                                                    >
                                                        <Activity className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => router.push(`/voyages/${voyage.id}`)}
                                                    className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-brand border border-transparent hover:border-brand-soft transition-all shadow-sm shadow-transparent hover:shadow-brand/10"
                                                    title="Xem chi tiết"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteModalVoyage(voyage)}
                                                    disabled={voyage.status !== 'NHAP'}
                                                    className={`p-2 rounded-lg transition-all border border-transparent ${voyage.status === 'NHAP'
                                                        ? 'text-slate-400 hover:text-red-600 hover:bg-white hover:border-red-100 hover:shadow-sm hover:shadow-red-100'
                                                        : 'text-slate-300 opacity-50 cursor-not-allowed'}`}
                                                    title={voyage.status === 'NHAP' ? 'Xóa' : 'Chỉ có thể xóa bản nháp'}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="text-xs font-medium text-slate-500">
                        Hiển thị 1 đến {filteredVoyages.length} trong tổng số <span className="font-bold text-slate-700">{filteredVoyages.length}</span> chuyến tàu
                    </div>
                    <div className="flex gap-2">
                        <button disabled className="px-3 py-1.5 text-xs font-semibold text-slate-400 bg-white border border-slate-200 rounded-lg opacity-50 cursor-not-allowed">Trước</button>
                        <button disabled className="px-3 py-1.5 text-xs font-semibold text-slate-400 bg-white border border-slate-200 rounded-lg opacity-50 cursor-not-allowed">Sau</button>
                    </div>
                </div>
            </div>

            <CreateVoyageModal
                isOpen={isCreateModalOpen || !!editModalVoyage}
                onClose={() => {
                    setIsCreateModalOpen(false);
                    setEditModalVoyage(undefined);
                }}
                editData={editModalVoyage}
            />

            <StatusTransitionModal
                isOpen={!!statusModalVoyage}
                voyage={voyages?.find((v: Voyage) => v.id === statusModalVoyage?.id) || statusModalVoyage}
                onClose={() => setStatusModalVoyage(null)}
            />

            <AddShiftProgressModal
                isOpen={!!progressModalVoyage}
                voyage={voyages?.find((v: Voyage) => v.id === progressModalVoyage?.id) || progressModalVoyage}
                onClose={() => setProgressModalVoyage(null)}
            />

            <ConfirmDialog
                isOpen={!!deleteModalVoyage}
                title="Xác nhận xóa"
                description="Bạn có chắc chắn muốn xóa chuyến tàu này? Hành động này không thể hoàn tác."
                onConfirm={handleDelete}
                onClose={() => setDeleteModalVoyage(null)}
            />
        </div>
    );
}

