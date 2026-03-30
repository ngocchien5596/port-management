'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle, Clock, Activity } from 'lucide-react';
import { Voyage } from '@/features/qltau/types';
import { useAddVoyageProgress } from '@/features/qltau/hooks';
import * as dateLocales from 'date-fns/locale';
import { api } from '@/lib/api';
import { DatePicker as StandardDatePicker } from '@/components/ui/date-picker';

interface AddShiftProgressModalProps {
    isOpen: boolean;
    onClose: () => void;
    voyage: Voyage | null;
}

export default function AddShiftProgressModal({ isOpen, onClose, voyage }: AddShiftProgressModalProps) {
    const [amount, setAmount] = useState('');
    const [startTime, setStartTime] = useState<string>('');
    const [endTime, setEndTime] = useState<string>('');
    const [notes, setNotes] = useState('');
    const [shiftCode, setShiftCode] = useState('CA_1');
    const [error, setError] = useState('');
    const addProgressMutation = useAddVoyageProgress();

    // Mapping Shift IDs
    const shiftOptions = [
        { id: 'CA_1', label: 'Ca 1 (06:00 - 14:00)' },
        { id: 'CA_2', label: 'Ca 2 (14:00 - 22:00)' },
        { id: 'CA_3', label: 'Ca 3 (22:00 - 06:00)' }
    ];

    // Helper to determine current shift
    const calculateCurrentShift = (configs: any[]) => {
        const s1 = configs.find((c: any) => c.key === 'SHIFT_1_START')?.value || '06:00';
        const s2 = configs.find((c: any) => c.key === 'SHIFT_2_START')?.value || '14:00';
        const s3 = configs.find((c: any) => c.key === 'SHIFT_3_START')?.value || '22:00';

        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTimeDecimal = currentHour + currentMinute / 60;

        const parseTime = (t: string) => {
            const [h, m] = t.split(':').map(Number);
            return h + (m || 0) / 60;
        };

        const t1 = parseTime(s1);
        const t2 = parseTime(s2);
        const t3 = parseTime(s3);

        if (currentTimeDecimal >= t1 && currentTimeDecimal < t2) return 'CA_1';
        if (currentTimeDecimal >= t2 && currentTimeDecimal < t3) return 'CA_2';
        return 'CA_3';
    };

    useEffect(() => {
        if (isOpen) {
            const now = new Date();
            setStartTime(now.toISOString());

            // Fetch shift config to auto-select
            api.get<any>('/config/shifts').then(res => {
                const configs = res.data?.data || res.data;
                if (configs) {
                    setShiftCode(calculateCurrentShift(configs));
                }
            }).catch(console.error);
        }
    }, [isOpen]);

    if (!isOpen || !voyage) return null;

    const isLamHang = voyage.status === 'LAM_HANG';

    const handleSubmit = async () => {
        setError('');
        if (!amount || Number(amount) <= 0) {
            setError('Vui lòng nhập số lượng hợp lệ');
            return;
        }
        if (!startTime || !endTime) {
            setError('Vui lòng nhập thời gian bắt đầu và kết thúc');
            return;
        }
        if (new Date(startTime) >= new Date(endTime)) {
            setError('Thời gian kết thúc phải sau thời gian bắt đầu');
            return;
        }

        try {
            await addProgressMutation.mutateAsync({
                id: voyage.id,
                data: {
                    amount: Number(amount),
                    startTime: new Date(new Date(startTime).setSeconds(0, 0)).toISOString(),
                    endTime: new Date(new Date(endTime).setSeconds(0, 0)).toISOString(),
                    notes: notes.trim() || undefined,
                    shiftCode
                }
            });

            // Reset form and close
            setAmount('');
            setStartTime('');
            setEndTime('');
            setNotes('');
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Cập nhật thất bại');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800">Nhập sản lượng ca</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Header Info */}
                    <div className="bg-brand-soft border border-brand-soft rounded-xl p-4 flex gap-4 items-center">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-brand-soft flex items-center justify-center text-brand font-bold">
                            #{voyage.voyageCode}
                        </div>
                        <div>
                            <div className="font-bold text-slate-800">{voyage.vessel?.customerName}</div>
                            <div className="text-xs text-slate-500 flex gap-2 mt-1">
                                <span>Mục tiêu: <span className="font-semibold text-slate-700">{Number(voyage.totalVolume || 0).toLocaleString('vi-VN')} {voyage.product?.unit === 'TON' ? 'tấn' : (voyage.product?.unit || 'đơn vị')}</span></span>
                            </div>
                        </div>
                    </div>

                    {!isLamHang && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-700">
                            <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-bold">Cảnh báo trạng thái</p>
                                <p className="mt-1 text-red-600" dangerouslySetInnerHTML={{ __html: 'Chuyến tàu hiện không ở trạng thái <strong>Làm hàng</strong>. Vui lòng cập nhật trạng thái trước khi nhập sản lượng.' }} />
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex gap-2 text-red-600 text-sm">
                            <AlertTriangle size={18} className="shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    {isLamHang && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Amount */}
                                <div className="sm:col-span-1">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        <span className="flex items-center gap-1.5"><Activity size={14} className="text-slate-400" />Sản lượng <span className="text-red-500">*</span></span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand font-bold text-slate-800"
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 select-none uppercase">
                                            {voyage.product?.unit === 'TON' ? 'tấn' : (voyage.product?.unit || 'đơn vị')}
                                        </span>
                                    </div>
                                </div>

                                {/* Shift Selection */}
                                <div className="sm:col-span-1">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        <span className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400" />Ca làm việc <span className="text-red-500">*</span></span>
                                    </label>
                                    <select
                                        value={shiftCode}
                                        onChange={(e) => setShiftCode(e.target.value)}
                                        className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand bg-white appearance-none font-bold text-slate-700"
                                    >
                                        {shiftOptions.map(opt => (
                                            <option key={opt.id} value={opt.id}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Time Dates */}
                                <div className="sm:col-span-1">
                                    <StandardDatePicker
                                        selected={startTime ? new Date(startTime) : null}
                                        onChange={(date) => setStartTime(date ? date.toISOString() : '')}
                                        showTimeSelect
                                        label="Thời gian bắt đầu"
                                        required
                                    />
                                </div>
                                <div className="sm:col-span-1">
                                    <StandardDatePicker
                                        selected={endTime ? new Date(endTime) : null}
                                        onChange={(date) => setEndTime(date ? date.toISOString() : '')}
                                        showTimeSelect
                                        label="Thời gian kết thúc"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Ghi chú</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={2}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                                    placeholder="Nhập ghi chú nếu có..."
                                />
                            </div>
                        </div>
                    )}

                </div>

                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                        disabled={addProgressMutation.isPending}
                    >
                        Đóng
                    </button>
                    {isLamHang && (
                        <button
                            onClick={handleSubmit}
                            disabled={addProgressMutation.isPending || !amount || !startTime || !endTime}
                            className="px-5 py-2.5 rounded-xl font-semibold text-white bg-brand hover:bg-brand-hover transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {addProgressMutation.isPending ? 'Đang lưu...' : 'Lưu kết quả'}
                            {!addProgressMutation.isPending && <Save size={18} />}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
