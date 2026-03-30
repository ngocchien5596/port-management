'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Settings2, RotateCcw } from 'lucide-react';
import { Equipment } from '@/features/config/types';
import { useEquipment } from '@/features/config/hooks';

interface EquipmentStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    equipment: Equipment | null;
}

const STATUS_OPTIONS = [
    { value: 'AUTO', label: 'Tự động (Theo chuyến tàu)', icon: RotateCcw, color: 'text-brand', bg: 'bg-brand/10' },
    { value: 'MAINTENANCE', label: 'Sửa chữa', icon: Settings2, color: 'text-amber-600', bg: 'bg-amber-100' },
];

export default function EquipmentStatusModal({ isOpen, onClose, equipment }: EquipmentStatusModalProps) {
    const [selectedStatus, setSelectedStatus] = useState<string>('AUTO');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [requireConfirm, setRequireConfirm] = useState(false);

    const { statusMutation } = useEquipment();

    useEffect(() => {
        if (equipment) {
            setSelectedStatus(equipment.manualStatus || 'AUTO');
            setDescription('');
            setError('');
            setRequireConfirm(false);
        }
    }, [equipment, isOpen]);

    if (!isOpen || !equipment) return null;

    const handleSubmit = async () => {
        setError('');
        try {
            if (selectedStatus !== 'AUTO' && !description.trim()) {
                setError('Vui lòng nhập lý do/ghi chú cho trạng thái thủ công.');
                return;
            }

            const activeVoyages = (equipment as any).voyages || [];
            if (selectedStatus !== 'AUTO' && activeVoyages.length > 0 && !requireConfirm) {
                setRequireConfirm(true);
                return;
            }

            await statusMutation.mutateAsync({
                id: equipment.id,
                data: {
                    status: selectedStatus,
                    description: description.trim() || undefined,
                }
            });

            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra.');
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Trạng thái thiết bị</h2>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{equipment.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-full transition-all border border-transparent hover:border-slate-200">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 text-red-600 text-sm animate-in slide-in-from-top-2">
                            <AlertTriangle size={20} className="shrink-0" />
                            <p className="font-bold">{error}</p>
                        </div>
                    )}

                    {requireConfirm ? (
                        <div className="space-y-4 animate-in slide-in-from-right-4">
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col gap-3">
                                <div className="flex gap-3 text-amber-700">
                                    <AlertTriangle size={24} className="shrink-0" />
                                    <div>
                                        <p className="font-bold text-sm">Xác nhận chuyển trạng thái</p>
                                        <p className="text-xs font-medium mt-1 leading-relaxed">
                                            Thiết bị này đang làm hàng cho <strong>{((equipment as any).voyages || []).length}</strong> chuyến tàu. Việc chuyển sang <strong>{STATUS_OPTIONS.find(o => o.value === selectedStatus)?.label}</strong> sẽ tự động tạo Sự cố Trì hoãn vận hành cho các chuyến tàu đang làm hàng.
                                        </p>
                                    </div>
                                </div>
                                <div className="pl-9 space-y-1">
                                    <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">Tàu sẽ bị ảnh hưởng sự cố:</p>
                                    <ul className="list-disc list-inside text-xs font-semibold text-amber-800">
                                        {((equipment as any).voyages || []).map((v: any, i: number) => (
                                            <li key={i}>{v.voyageCode} - {v.vessel?.code}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-widest">Chọn trạng thái mới</label>
                                <div className="grid gap-2">
                                    {STATUS_OPTIONS.map((opt) => {
                                        const Icon = opt.icon;
                                        const isActive = selectedStatus === opt.value;
                                        return (
                                            <button
                                                key={opt.value}
                                                onClick={() => setSelectedStatus(opt.value)}
                                                className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${isActive
                                                    ? `border-brand bg-brand-soft/30 shadow-md shadow-brand/5`
                                                    : 'border-slate-100 bg-slate-50 hover:border-slate-200 text-slate-500'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-xl ${opt.bg} ${opt.color}`}>
                                                        <Icon size={20} />
                                                    </div>
                                                    <span className={`font-bold ${isActive ? 'text-slate-900' : ''}`}>{opt.label}</span>
                                                </div>
                                                {isActive && <CheckCircle size={20} className="text-brand" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-widest">
                                    Ghi chú / Lý do {selectedStatus !== 'AUTO' && <span className="text-red-500">*</span>}
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand font-bold text-slate-900 placeholder:text-slate-300 resize-none transition-all"
                                    placeholder="Nhập lý do thay đổi trạng thái..."
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                    <button
                        onClick={() => {
                            if (requireConfirm) setRequireConfirm(false);
                            else onClose();
                        }}
                        className="px-6 py-3 rounded-xl font-black text-slate-500 hover:bg-white border border-transparent hover:border-slate-200 transition-all uppercase tracking-widest text-xs"
                        disabled={statusMutation.isPending}
                    >
                        {requireConfirm ? 'QUAY LẠI' : 'HỦY'}
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={statusMutation.isPending}
                        className="px-8 py-3 rounded-xl font-black text-white bg-brand hover:bg-brand-hover transition-all disabled:opacity-50 flex items-center gap-2 shadow-xl shadow-brand/20 uppercase tracking-widest text-xs"
                    >
                        {statusMutation.isPending ? 'ĐANG LƯU...' : 'XÁC NHẬN'}
                        {!statusMutation.isPending && <CheckCircle size={18} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
