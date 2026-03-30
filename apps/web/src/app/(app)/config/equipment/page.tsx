'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal, Input, Button, CreateButton, ConfirmDialog } from '@/components/ui';
import { useEquipment, useLanes, useProducts } from '@/features/config/hooks';
import { Equipment, Lane } from '@/features/config/types';
import { Product } from '@/features/qltau/types';
import { Search, Cpu, Trash2, Edit2, Map, CheckCircle2, Circle, ChevronDown, Filter, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function EquipmentPage() {
    const router = useRouter();
    const { data: equipment, isLoading, createMutation, updateMutation, deleteMutation } = useEquipment();
    const { data: lanes } = useLanes();
    const { data: products } = useProducts();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Equipment | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterLane, setFilterLane] = useState('all');

    // Multiple select state for cargo types
    const [selectedCargoIds, setSelectedCargoIds] = useState<string[]>([]);

    const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name') as string,
            laneId: formData.get('laneId') as string,
            capacity: Number(formData.get('capacity') || 0),
            productIds: selectedCargoIds,
        };
        await createMutation.mutateAsync(data);
        setIsAddModalOpen(false);
        setSelectedCargoIds([]);
    };

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingItem) return;
        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name') as string,
            laneId: formData.get('laneId') as string,
            capacity: Number(formData.get('capacity') || 0),
            productIds: selectedCargoIds,
        };
        await updateMutation.mutateAsync({ id: editingItem.id, data });
        setEditingItem(null);
        setSelectedCargoIds([]);
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        await deleteMutation.mutateAsync(deletingId);
        setDeletingId(null);
    };

    const toggleCargo = (id: string) => {
        setSelectedCargoIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'BUSY':
                return { bg: 'bg-brand-soft/50', text: 'text-brand', border: 'border-brand-soft', dot: 'bg-brand', label: 'LÀM HÀNG' };
            case 'IDLE':
                return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400', label: 'TRỐNG CẢNG' };
            case 'MAINTENANCE':
            case 'REPAIR':
                return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', dot: 'bg-amber-500', label: 'SỬA CHỮA' };
            default:
                return { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-100', dot: 'bg-slate-400', label: 'KHÔNG XÁC ĐỊNH' };
        }
    };

    const filteredItems = equipment?.filter((item: Equipment) => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
        const matchesLane = filterLane === 'all' || item.laneId === filterLane;

        return matchesSearch && matchesStatus && matchesLane;
    }) || [];

    const importProducts = products?.filter((c: any) => c.type === 'IMPORT') || [];
    const exportProducts = products?.filter((c: any) => c.type === 'EXPORT') || [];

    if (isLoading) return <div className="py-20 text-center text-slate-400 font-bold animate-pulse">Đang tải danh sách thiết bị...</div>;

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 lowercase">
                        <Cpu className="w-8 h-8 text-brand" />
                        <span className="uppercase">QUẢN LÝ THIẾT BỊ</span>
                    </h3>
                    <p className="text-[15px] text-slate-500 mt-1 font-medium italic">Quản lý các loại cẩu và thiết bị theo luồng</p>
                </div>
                <CreateButton onClick={() => {
                    setSelectedCargoIds([]);
                    setIsAddModalOpen(true);
                }}>
                    THÊM THIẾT BỊ MỚI
                </CreateButton>
            </div>

            <div className="bg-white rounded-[24px] border border-vtborder shadow-xl shadow-slate-200/50 overflow-hidden">
                {/* Integrated Toolbar */}
                <div className="p-4 border-b border-surface-2 flex flex-col lg:flex-row gap-4 items-center justify-between bg-white">
                    <div className="relative flex-1 w-full lg:max-w-md">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-vttext-muted">
                            <Search className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên thiết bị..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
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
                                <option value="all">Trạng thái</option>
                                <option value="IDLE">Rảnh</option>
                                <option value="BUSY">Bận</option>
                                <option value="MAINTENANCE">Bảo trì</option>
                                <option value="REPAIR">Sửa chữa</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-vttext-muted pointer-events-none" />
                        </div>

                        <div className="relative min-w-[140px] flex-1 lg:flex-none">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-vttext-muted">
                                <Filter className="w-4 h-4" />
                            </div>
                            <select
                                value={filterLane}
                                onChange={(e) => setFilterLane(e.target.value)}
                                className="w-full h-10 pl-9 pr-8 bg-white border border-vtborder rounded-xl text-sm font-bold text-vttext-secondary focus:outline-none focus:ring-2 focus:ring-focus focus:border-brand appearance-none cursor-pointer transition-all"
                            >
                                <option value="all">Tất cả luồng</option>
                                {lanes?.map((lane: Lane) => (
                                    <option key={lane.id} value={lane.id}>{lane.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-vttext-muted pointer-events-none" />
                        </div>

                        <div className="h-10 px-4 bg-surface-2 border border-vtborder rounded-xl flex items-center gap-2.5 shrink-0 hidden sm:flex">
                            <span className="text-[10px] font-black text-vttext-muted uppercase tracking-widest">Tổng cộng</span>
                            <span className="text-sm font-black text-brand">{filteredItems.length}</span>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="py-5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] w-20 text-center">STT</th>
                                <th className="py-5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Thông tin thiết bị</th>
                                <th className="py-5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Trạng thái</th>
                                <th className="py-5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Luồng gán</th>
                                <th className="py-5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Công suất</th>
                                <th className="py-5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Khả năng xếp dỡ</th>
                                <th className="py-5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] w-32 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center text-slate-400 italic text-[15px]">
                                        Không tìm thấy thiết bị nào trong hệ thống.
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item: Equipment, idx: number) => {
                                    const statusStyles = getStatusStyles(item.status);
                                    return (
                                        <tr key={item.id} className="hover:bg-brand-soft/30 transition-colors group">
                                            <td className="py-5 px-6 text-center">
                                                <span className="inline-flex items-center justify-center w-8 h-8 bg-slate-100 rounded-lg text-xs font-black text-slate-500 group-hover:bg-brand group-hover:text-white transition-all">
                                                    {String(idx + 1).padStart(2, '0')}
                                                </span>
                                            </td>
                                            <td className="py-5 px-6">
                                                <div className="flex flex-col">
                                                    <span className="text-[15px] font-bold text-slate-900 group-hover:text-brand transition-colors uppercase tracking-tight">{item.name}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 tracking-widest">{item.manualStatus ? 'Tùy chỉnh thủ công' : 'Chế độ Tự động'}</span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6">
                                                <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-tighter", statusStyles.bg, statusStyles.text, statusStyles.border)}>
                                                    <div className={cn("w-1.5 h-1.5 rounded-full", statusStyles.dot)}></div>
                                                    {statusStyles.label}
                                                </div>
                                            </td>
                                            <td className="py-5 px-6">
                                                <span className="inline-flex items-center gap-2 px-3 py-1 bg-white text-slate-600 rounded-full text-xs font-black border border-slate-100 uppercase tracking-tighter shadow-sm">
                                                    <Map className="w-3 h-3 text-brand" />
                                                    {item.lane?.name || 'CHƯA GÁN'}
                                                </span>
                                            </td>
                                            <td className="py-5 px-6 text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[14px] font-black text-brand tracking-tighter leading-none">{Number(item.capacity || 0)}</span>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">tấn/giờ</span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-6">
                                                <div className="flex flex-wrap gap-1.5 max-w-[180px]">
                                                    {item.products && item.products.length > 0 ? (
                                                        item.products.map((c: Product) => (
                                                            <span key={c.id} className={cn(
                                                                "px-2 py-0.5 rounded-md text-[10px] font-black border uppercase tracking-tighter shadow-sm",
                                                                c.type === 'IMPORT'
                                                                    ? "bg-green-50 text-green-700 border-green-100"
                                                                    : "bg-amber-50 text-amber-700 border-amber-100"
                                                            )}>
                                                                {c.name}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-[11px] text-slate-300 font-bold italic">Chưa chọn loại hàng</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-5 px-6">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        onClick={() => router.push(`/config/equipment/${item.id}`)}
                                                        title="Xem chi tiết & Chỉnh sửa thiết bị"
                                                        className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-brand border border-transparent hover:border-brand-soft transition-all shadow-sm"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeletingId(item.id)}
                                                        className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-red-600 border border-transparent hover:border-red-100 transition-all shadow-sm"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
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

            {/* Add/Edit Form Logic */}
            <Modal
                isOpen={isAddModalOpen || !!editingItem}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setEditingItem(null);
                    setSelectedCargoIds([]);
                }}
                title={isAddModalOpen ? "THÊM THIẾT BỊ MỚI" : "CẬP NHẬT THIẾT BỊ"}
            >
                <form onSubmit={isAddModalOpen ? handleCreate : handleUpdate} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-widest">Tên thiết bị (Cẩu)</label>
                            <Input name="name" defaultValue={editingItem?.name} placeholder="Ví dụ: Cẩu trục QC-01" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-widest">Công suất (tấn/giờ)</label>
                            <Input name="capacity" type="number" defaultValue={editingItem?.capacity} placeholder="VD: 100, 250..." required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-widest">Gán vào luồng</label>
                        <select
                            name="laneId"
                            defaultValue={editingItem?.laneId}
                            className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all"
                            required
                        >
                            <option value="">-- CHỌN LUỒNG --</option>
                            {lanes?.map((lane: Lane) => (
                                <option key={lane.id} value={lane.id}>{lane.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-widest block mb-2">Chức năng (Chọn nhiều)</label>

                        {/* Import Section */}
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                            <h4 className="text-[10px] font-black text-green-600 uppercase tracking-widest border-b border-green-100 pb-2 flex items-center gap-2">
                                <CheckCircle2 className="w-3 h-3" />
                                LOẠI HÀNG NHẬP
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                                {importProducts.map((p: Product) => (
                                    <div
                                        key={p.id}
                                        onClick={() => toggleCargo(p.id)}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all border",
                                            selectedCargoIds.includes(p.id)
                                                ? "bg-green-600 text-white border-green-600 shadow-md shadow-green-100"
                                                : "bg-white text-slate-600 border-slate-200 hover:border-green-300"
                                        )}
                                    >
                                        {selectedCargoIds.includes(p.id) ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4 text-slate-300" />}
                                        <span className="text-xs font-bold leading-none">{p.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Export Section */}
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                            <h4 className="text-[10px] font-black text-brand uppercase tracking-widest border-b border-brand-soft pb-2 flex items-center gap-2">
                                <CheckCircle2 className="w-3 h-3" />
                                LOẠI HÀNG XUẤT
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                                {exportProducts.map((p: Product) => (
                                    <div
                                        key={p.id}
                                        onClick={() => toggleCargo(p.id)}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all border",
                                            selectedCargoIds.includes(p.id)
                                                ? "bg-brand text-white border-brand shadow-md shadow-brand/10"
                                                : "bg-white text-slate-600 border-slate-200 hover:border-brand-soft"
                                        )}
                                    >
                                        {selectedCargoIds.includes(p.id) ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4 text-slate-300" />}
                                        <span className="text-xs font-bold leading-none">{p.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        size="lg"
                        className="w-full bg-brand hover:bg-brand-hover shadow-xl shadow-brand/10"
                        disabled={createMutation.isPending || updateMutation.isPending}
                    >
                        {isAddModalOpen
                            ? (createMutation.isPending ? 'ĐANG LƯU...' : 'LƯU THIẾT BỊ')
                            : (updateMutation.isPending ? 'ĐANG CẬP NHẬT...' : 'CẬP NHẬT THIẾT BỊ')}
                    </Button>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={handleDelete}
                title="Xóa thiết bị?"
                description="Dữ liệu này sẽ được xóa vĩnh viễn khỏi hệ thống."
                type="danger"
            />
        </div>
    );
}
