'use client';

import React, { useState } from 'react';
import { Modal, Input, Button, CreateButton, ConfirmDialog } from '@/components/ui';
import { useLanes } from '@/features/config/hooks';
import { Lane } from '@/features/config/types';
import { Search, Map, Trash2, Edit2, Cpu } from 'lucide-react';

export default function LanesPage() {
    const { data: lanes, isLoading, createMutation, updateMutation, deleteMutation } = useLanes();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Lane | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name') as string,
        };
        await createMutation.mutateAsync(data);
        setIsAddModalOpen(false);
    };

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingItem) return;
        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name') as string,
        };
        await updateMutation.mutateAsync({ id: editingItem.id, data });
        setEditingItem(null);
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        await deleteMutation.mutateAsync(deletingId);
        setDeletingId(null);
    };

    const filteredItems = lanes?.filter((item: Lane) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    if (isLoading) return <div className="py-20 text-center text-slate-400 font-bold animate-pulse">Đang tải danh sách luồng...</div>;

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 lowercase">
                        <Map className="w-8 h-8 text-brand" />
                        <span className="uppercase">QUẢN LÝ LUỒNG</span>
                    </h3>
                    <p className="text-[15px] text-slate-500 mt-1 font-medium italic">Quản lý các luồng vận hành trong cảng</p>
                </div>
                <CreateButton onClick={() => setIsAddModalOpen(true)}>
                    THÊM LUỒNG MỚI
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
                            placeholder="Tìm kiếm theo tên luồng..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 bg-surface-2 border border-vtborder rounded-xl text-sm font-medium text-vttext-primary focus:outline-none focus:ring-2 focus:ring-focus focus:border-brand transition-all"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
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
                                <th className="py-5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Tên luồng</th>
                                <th className="py-5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Số lượng thiết bị</th>
                                <th className="py-5 px-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] w-32 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center text-slate-400 italic text-[15px]">
                                        Không tìm thấy luồng nào trong hệ thống.
                                    </td>
                                </tr>
                            ) : (
                                filteredItems.map((item: Lane, idx: number) => (
                                    <tr key={item.id} className="hover:bg-brand-soft/30 transition-colors group">
                                        <td className="py-5 px-6 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 bg-slate-100 rounded-lg text-xs font-black text-slate-500 group-hover:bg-brand group-hover:text-white transition-all">
                                                {String(idx + 1).padStart(2, '0')}
                                            </span>
                                        </td>
                                        <td className="py-5 px-6">
                                            <span className="text-[15px] font-bold text-slate-900 group-hover:text-brand transition-colors uppercase tracking-tight">{item.name}</span>
                                        </td>
                                        <td className="py-5 px-6">
                                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-black border border-slate-200">
                                                <Cpu className="w-3 h-3" />
                                                {item.equipments?.length || 0} THIẾT BỊ
                                            </span>
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
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="THÊM LUỒNG MỚI">
                <form onSubmit={handleCreate} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-widest">Tên luồng</label>
                        <Input name="name" placeholder="Ví dụ: Luồng số 1, Luồng A..." required />
                    </div>
                    <Button type="submit" size="lg" className="w-full bg-brand hover:bg-brand-hover shadow-xl shadow-brand/10" disabled={createMutation.isPending}>
                        {createMutation.isPending ? 'ĐANG LƯU...' : 'LƯU LUỒNG'}
                    </Button>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={!!editingItem} onClose={() => setEditingItem(null)} title="CẬP NHẬT LUỒNG">
                <form onSubmit={handleUpdate} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-widest">Tên luồng</label>
                        <Input name="name" defaultValue={editingItem?.name} placeholder="Ví dụ: Luồng số 1, Luồng A..." required />
                    </div>
                    <Button type="submit" size="lg" className="w-full bg-brand hover:bg-brand-hover shadow-xl shadow-brand/10" disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? 'ĐANG CẬP NHẬT...' : 'CẬP NHẬT LUỒNG'}
                    </Button>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={handleDelete}
                title="Xóa luồng?"
                description="Hành động này không thể hoàn tác. Các dữ liệu liên quan có thể bị ảnh hưởng."
                type="danger"
            />
        </div>
    );
}
