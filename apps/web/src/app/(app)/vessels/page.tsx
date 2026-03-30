'use client';

import React, { useState } from 'react';
import { Modal, Input, Button, CreateButton, ConfirmDialog } from '@/components/ui';
import { useVessels, useCreateVessel, useUpdateVessel, useDeleteVessel } from '@/features/qltau/hooks';
import { Vessel } from '@/features/qltau/types';
import { Search, Ship, Phone, Anchor, Edit2, Trash2, ChevronDown, Filter } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function VesselsPage() {
    const { data: vessels, isLoading } = useVessels();
    const createMutation = useCreateVessel();
    const updateMutation = useUpdateVessel();
    const deleteMutation = useDeleteVessel();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Vessel | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');

    const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            code: formData.get('code') as string,
            name: formData.get('name') as string,
            customerName: formData.get('customerName') as string,
            capacity: Number(formData.get('capacity')),
            customerPhone: formData.get('customerPhone') as string,
            vesselType: 'TÀU HÀNG', // Default value
        };
        await createMutation.mutateAsync(data);
        setIsAddModalOpen(false);
    };

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingItem) return;
        const formData = new FormData(e.currentTarget);
        const data = {
            code: formData.get('code') as string,
            name: formData.get('name') as string,
            customerName: formData.get('customerName') as string,
            capacity: Number(formData.get('capacity')),
            customerPhone: formData.get('customerPhone') as string,
        };
        await updateMutation.mutateAsync({ id: editingItem.id, data });
        setEditingItem(null);
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        await deleteMutation.mutateAsync(deletingId);
        setDeletingId(null);
    };

    const filteredVessels = vessels?.filter((v: Vessel) => {
        const matchesSearch = v.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.code.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = filterType === 'all' || v.vesselType === filterType;

        return matchesSearch && matchesType;
    }) || [];

    if (isLoading) return <div className="py-20 text-center text-slate-400 font-bold">Đang tải danh sách tàu...</div>;

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        DANH MỤC TÀU
                    </h3>
                </div>
                <CreateButton onClick={() => setIsAddModalOpen(true)}>
                    THÊM TÀU MỚI
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
                            placeholder="Tìm kiếm theo tên khách hàng hoặc mã tàu..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 bg-surface-2 border border-vtborder rounded-xl text-sm font-medium text-vttext-primary focus:outline-none focus:ring-2 focus:ring-focus focus:border-brand transition-all"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <div className="relative min-width-[160px] flex-1 lg:flex-none">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-vttext-muted">
                                <Filter className="w-4 h-4" />
                            </div>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full h-10 pl-9 pr-8 bg-white border border-vtborder rounded-xl text-sm font-bold text-vttext-secondary focus:outline-none focus:ring-2 focus:ring-focus focus:border-brand appearance-none cursor-pointer transition-all"
                            >
                                <option value="all">Loại tàu</option>
                                <option value="TÀU HÀNG">Tàu hàng</option>
                                <option value="TÀU KHÁCH">Tàu khách</option>
                                <option value="TÀU DẦU">Tàu dầu</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-vttext-muted pointer-events-none" />
                        </div>

                        <div className="h-10 px-4 bg-surface-2 border border-vtborder rounded-xl flex items-center gap-2.5 shrink-0 hidden sm:flex">
                            <span className="text-[10px] font-black text-vttext-muted uppercase tracking-widest">Tổng cộng</span>
                            <span className="text-sm font-black text-brand">{filteredVessels.length}</span>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="py-5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] w-20 text-center">STT</th>
                                <th className="py-5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Tên Tàu</th>
                                <th className="py-5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Khách hàng / Chủ tàu</th>
                                <th className="py-5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Tải trọng (DWT)</th>
                                <th className="py-5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Liên hệ</th>
                                <th className="py-5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] w-32 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {filteredVessels.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center text-slate-400 italic text-[15px]">
                                        Không tìm thấy tàu nào trong hệ thống.
                                    </td>
                                </tr>
                            ) : (
                                filteredVessels.map((v: Vessel, idx: number) => (
                                    <tr key={v.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="py-5 px-6 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 bg-slate-100 rounded-lg text-xs font-black text-slate-500 group-hover:bg-brand-soft group-hover:text-brand transition-all">
                                                {String(idx + 1).padStart(2, '0')}
                                            </span>
                                        </td>
                                        <td className="py-5 px-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900">{v.name || 'N/A'}</span>
                                                <span className="text-[10px] font-bold text-brand bg-brand-soft px-2 py-0.5 rounded-full w-fit mt-1">{v.code}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-sm font-medium text-slate-600 italic">{v.customerName}</span>
                                        </td>
                                        <td className="py-5 px-6">
                                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-xs font-bold border border-slate-200">
                                                <Anchor className="w-3 h-3" />
                                                {Number(v.capacity).toLocaleString() || '0'} DWT
                                            </span>
                                        </td>
                                        <td className="py-5 px-6">
                                            <div className="flex items-center gap-2 text-[14px] text-slate-600 font-medium">
                                                <Phone className="w-4 h-4 text-slate-300" />
                                                {v.customerPhone || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="py-5 px-6">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => setEditingItem(v)}
                                                    className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingId(v.id)}
                                                    className="p-2 rounded-lg text-slate-400 hover:text-brand hover:bg-brand-soft transition-all"
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
            </div>

            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="THÊM TÀU MỚI"
            >
                <form onSubmit={handleCreate} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-widest">Mã tàu (IMO)</label>
                            <Input name="code" placeholder="Ví dụ: 9112345" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-widest">Tên tàu</label>
                            <Input name="name" placeholder="Ví dụ: PHÚC LONG 18" required />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-widest">Tải trọng (DWT)</label>
                            <Input name="capacity" type="number" placeholder="Ví dụ: 30000" required />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-widest">Tên khách hàng</label>
                        <Input name="customerName" placeholder="Ví dụ: SEA GLORY LOGISTICS" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-widest">Số điện thoại liên hệ</label>
                        <Input name="customerPhone" placeholder="Ví dụ: 0987xxx..." />
                    </div>
                    <Button
                        type="submit"
                        size="lg"
                        className="w-full mt-4"
                        disabled={createMutation.isPending}
                    >
                        {createMutation.isPending ? 'ĐANG LƯU...' : 'LƯU THÔNG TIN TÀU'}
                    </Button>
                </form>
            </Modal>

            <Modal
                isOpen={!!editingItem}
                onClose={() => setEditingItem(null)}
                title="CẬP NHẬT TÀU"
            >
                <form onSubmit={handleUpdate} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="MÃ TÀU" name="code" defaultValue={editingItem?.code} required />
                        <Input label="TÊN TÀU" name="name" defaultValue={editingItem?.name || ''} required placeholder="Ví dụ: PHÚC LONG 18" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-widest">Tải trọng (DWT)</label>
                            <Input name="capacity" type="number" defaultValue={Number(editingItem?.capacity)} placeholder="Ví dụ: 30000" required />
                        </div>
                    </div>
                    <Input label="KHÁCH HÀNG / CHỦ TÀU" name="customerName" defaultValue={editingItem?.customerName} required placeholder="Tên công ty hoặc chủ sở hữu" />
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-widest">Số điện thoại liên hệ</label>
                        <Input name="customerPhone" defaultValue={editingItem?.customerPhone || ''} placeholder="Ví dụ: 0987xxx..." />
                    </div>
                    <Button
                        type="submit"
                        size="lg"
                        className="w-full mt-4"
                        disabled={updateMutation.isPending}
                    >
                        {updateMutation.isPending ? 'ĐANG CẬP NHẬT...' : 'CẬP NHẬT THÔNG TIN'}
                    </Button>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={handleDelete}
                title="Xóa tàu này?"
                description="Hành động này không thể hoàn tác. Các chuyến tàu liên quan sẽ bị ảnh hưởng."
                type="danger"
            />
        </div>
    );
}
