'use client';

import React, { useState } from 'react';
import { Modal, Input, Button, CreateButton, ConfirmDialog } from '@/components/ui';
import { useProducts } from '@/features/config/hooks';
import { Product } from '@/features/qltau/types';
import { Search, Package, ArrowDownLeft, ArrowUpRight, Trash2, Edit2, ChevronDown, Filter } from 'lucide-react';

export default function ProductsPage() {
    const { data: products, isLoading, createMutation, updateMutation, deleteMutation } = useProducts();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Product | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');

    const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            code: formData.get('code') as string || `PROD_${Date.now()}`, // Fallback generation
            name: formData.get('name') as string,
            unit: formData.get('unit') as string,
            type: formData.get('type') as string,
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
            unit: formData.get('unit') as string,
            type: formData.get('type') as string,
        };
        await updateMutation.mutateAsync({ id: editingItem.id, data });
        setEditingItem(null);
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        try {
            await deleteMutation.mutateAsync(deletingId);
        } catch (error: any) {
            console.error("Failed to delete:", error);
        } finally {
            setDeletingId(null);
        }
    };

    const filteredItems = products?.filter((item: Product) => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.code?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = filterType === 'all' || item.type === filterType;

        return matchesSearch && matchesType;
    }) || [];

    if (isLoading) return <div className="py-20 text-center text-slate-400 font-bold animate-pulse">Đang tải danh sách hàng hóa...</div>;

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 lowercase">
                        <Package className="w-8 h-8 text-brand" />
                        <span className="uppercase">QUẢN LÝ HÀNG HÓA</span>
                    </h3>
                    <p className="text-[15px] text-slate-500 mt-1 font-medium italic">Danh mục hàng hóa, đơn vị tính và phân loại</p>
                </div>
                <CreateButton onClick={() => setIsAddModalOpen(true)}>
                    THÊM HÀNG HÓA
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
                            placeholder="Tìm kiếm theo tên hoặc mã hàng..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 bg-surface-2 border border-vtborder rounded-xl text-sm font-medium text-vttext-primary focus:outline-none focus:ring-2 focus:ring-focus focus:border-brand transition-all"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                        <div className="relative min-w-[140px] flex-1 lg:flex-none">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-vttext-muted">
                                <Filter className="w-4 h-4" />
                            </div>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full h-10 pl-9 pr-8 bg-white border border-vtborder rounded-xl text-sm font-bold text-vttext-secondary focus:outline-none focus:ring-2 focus:ring-focus focus:border-brand appearance-none cursor-pointer transition-all"
                            >
                                <option value="all">Loại hình</option>
                                <option value="IMPORT">Hàng nhập</option>
                                <option value="EXPORT">Hàng xuất</option>
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
                                <th className="py-5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Mã hàng</th>
                                <th className="py-5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Tên hàng hóa</th>
                                <th className="py-5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Đơn vị</th>
                                <th className="py-5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Phân loại</th>
                                <th className="py-5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] w-32 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center text-slate-400 italic text-[15px]">
                                        Không tìm thấy hàng hóa nào trong hệ thống.
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item: Product, idx: number) => (
                                    <tr key={item.id} className="hover:bg-brand-soft/30 transition-colors group">
                                        <td className="py-5 px-6 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 bg-slate-100 rounded-lg text-xs font-black text-slate-500 group-hover:bg-brand group-hover:text-white transition-all">
                                                {String(idx + 1).padStart(2, '0')}
                                            </span>
                                        </td>
                                        <td className="py-5 px-6 font-mono text-xs font-bold text-slate-500">
                                            {item.code}
                                        </td>
                                        <td className="py-5 px-6">
                                            <span className="text-[15px] font-bold text-slate-900 group-hover:text-brand transition-colors uppercase tracking-tight">{item.name}</span>
                                        </td>
                                        <td className="py-5 px-6 text-sm font-semibold text-slate-600">
                                            {item.unit === 'TON' ? 'tấn' : item.unit}
                                        </td>
                                        <td className="py-5 px-6 text-center">
                                            {item.type === 'IMPORT' ? (
                                                <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-black border border-green-100">
                                                    <ArrowDownLeft className="w-3 h-3" />
                                                    NHẬP HÀNG
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-2 px-3 py-1 bg-brand-soft text-brand rounded-full text-xs font-black border border-brand-soft">
                                                    <ArrowUpRight className="w-3 h-3" />
                                                    XUẤT HÀNG
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-5 px-6">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => setEditingItem(item)}
                                                    className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-brand border border-transparent hover:border-brand-soft transition-all shadow-sm shadow-transparent hover:shadow-brand/10"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingId(item.id)}
                                                    className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-red-600 border border-transparent hover:border-red-100 transition-all shadow-sm shadow-transparent hover:shadow-red-100"
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

            {/* Add Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="THÊM HÀNG HÓA MỚI">
                <form onSubmit={handleCreate} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2">
                            <label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-widest">Tên hàng hóa</label>
                            <Input name="name" placeholder="Ví dụ: Than đá, Sắt thép..." required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-widest">Mã hàng (Tự động)</label>
                            <Input name="code" placeholder="Để trống để tự tạo" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-widest">Đơn vị tính</label>
                            <select
                                name="unit"
                                defaultValue="TON"
                                className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                required
                            >
                                <option value="TON">tấn (TON)</option>
                                <option value="TEU">CONTAINER (TEU)</option>
                                <option value="MTS">MTS</option>
                                <option value="KGS">KILOGRAM (KGS)</option>
                                <option value="CBM">KHỐI (CBM)</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-widest">Loại hình</label>
                        <select
                            name="type"
                            className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            required
                        >
                            <option value="IMPORT">HÀNG NHẬP</option>
                            <option value="EXPORT">HÀNG XUẤT</option>
                        </select>
                    </div>
                    <Button type="submit" size="lg" className="w-full bg-brand hover:bg-brand-hover shadow-xl shadow-brand/10" disabled={createMutation.isPending}>
                        {createMutation.isPending ? 'ĐANG LƯU...' : 'LƯU HÀNG HÓA'}
                    </Button>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={!!editingItem} onClose={() => setEditingItem(null)} title="CẬP NHẬT HÀNG HÓA">
                <form onSubmit={handleUpdate} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2">
                            <label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-widest">Tên hàng hóa</label>
                            <Input name="name" defaultValue={editingItem?.name} required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-widest">Mã hàng</label>
                            <Input name="code" defaultValue={editingItem?.code} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-widest">Đơn vị tính</label>
                            <select
                                name="unit"
                                defaultValue={editingItem?.unit || 'TON'}
                                className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                required
                            >
                                <option value="TON">tấn (TON)</option>
                                <option value="TEU">CONTAINER (TEU)</option>
                                <option value="MTS">MTS</option>
                                <option value="KGS">KILOGRAM (KGS)</option>
                                <option value="CBM">KHỐI (CBM)</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-widest">Loại hình</label>
                        <select
                            name="type"
                            defaultValue={editingItem?.type}
                            className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            required
                        >
                            <option value="IMPORT">HÀNG NHẬP KHẨU</option>
                            <option value="EXPORT">HÀNG XUẤT KHẨU</option>
                        </select>
                    </div>
                    <Button type="submit" size="lg" className="w-full bg-brand hover:bg-brand-hover shadow-xl shadow-brand/10" disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? 'ĐANG CẬP NHẬT...' : 'CẬP NHẬT HÀNG HÓA'}
                    </Button>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={handleDelete}
                title="Xóa hàng hóa?"
                description="Hành động này không thể hoàn tác. Các dữ liệu liên quan có thể bị ảnh hưởng."
                type="danger"
            />
        </div>
    );
}
