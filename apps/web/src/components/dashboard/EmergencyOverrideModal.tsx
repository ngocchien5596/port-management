'use client';
import React, { useState, useEffect } from 'react';
import { Voyage } from '@/features/qltau/types';
import { useOverrideEquipment } from '@/features/qltau/hooks';
import toast from 'react-hot-toast';
import { vi } from 'date-fns/locale';
import { DatePicker as StandardDatePicker } from '@/components/ui/date-picker';

interface Props {
    currentVoyage: Voyage;
    emergencyVoyage: Voyage;
    onClose: () => void;
}

const Icon = ({ path, className = "w-5 h-5" }: { path: string, className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={path} />
    </svg>
);

const alertPath = "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01";

export default function EmergencyOverrideModal({ currentVoyage, emergencyVoyage, onClose }: Props) {
    const overrideMutation = useOverrideEquipment();

    // Get last known cumulative progress to display as a hint
    const lastCumulative = currentVoyage.progress?.[0]?.cumulative || 0;

    // The operator MUST input the final volume manually to confirm
    const [amount, setAmount] = useState<string>('');
    const [startTime, setStartTime] = useState<string>('');
    const [endTime, setEndTime] = useState<string>('');
    const [reason, setReason] = useState<string>('');

    useEffect(() => {
        // Auto-fill defaults
        setEndTime(new Date().toISOString());
        if (currentVoyage.progress && currentVoyage.progress.length > 0 && currentVoyage.progress[0].endTime) {
            setStartTime(new Date(currentVoyage.progress[0].endTime).toISOString());
        } else {
            setStartTime(new Date().toISOString());
        }
    }, [currentVoyage]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const volumeNum = Number(amount);

        if (isNaN(volumeNum) || volumeNum < 0) {
            toast.error('Vui lòng nhập sản lượng phát sinh hợp lệ (>= 0)');
            return;
        }

        if (volumeNum > 0) {
            if (!startTime || !endTime) {
                toast.error('Vui lòng chọn Thời gian vì có phát sinh sản lượng');
                return;
            }

            if (new Date(startTime) >= new Date(endTime)) {
                toast.error('Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc');
                return;
            }
        }

        const toastId = toast.loading('Đang xử lý yêu cầu nhường cẩu...');
        overrideMutation.mutate({
            currentVoyageId: currentVoyage.id,
            emergencyVoyageId: emergencyVoyage.id,
            progressData: {
                amount: volumeNum,
                startTime: startTime ? new Date(new Date(startTime).setSeconds(0, 0)).toISOString() : undefined,
                endTime: endTime ? new Date(new Date(endTime).setSeconds(0, 0)).toISOString() : undefined
            },
            reason: reason.trim()
        }, {
            onSuccess: () => {
                toast.success('Đã chuyển mốc thiết bị thành công', { id: toastId });
                onClose();
            },
            onError: (err: any) => {
                toast.error(err.message || 'Lỗi khi nhường cẩu', { id: toastId });
            }
        });
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-red-600 text-white px-6 py-4 flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full">
                        <Icon path={alertPath} className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight shadow-sm">Yêu Cầu Nhường Cẩu Khẩn Cấp</h2>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            {/* Tàu Hiện Tại */}
                            <div className="border border-slate-200 rounded-xl bg-slate-50 p-4">
                                <span className="inline-block px-2 text-[10px] font-bold tracking-widest uppercase text-slate-500 bg-slate-200 rounded mb-2">Đang làm hàng</span>
                                <h3 className="text-lg font-black text-slate-900 uppercase">
                                    {currentVoyage.voyageCode} {currentVoyage.vessel?.code ? `- ${currentVoyage.vessel.code}` : ''}
                                </h3>
                                <div className="mt-3 space-y-2 text-sm text-slate-600">
                                    <div className="flex justify-between">
                                        <span className="font-medium text-slate-500">Thiết bị:</span>
                                        <span className="font-bold text-slate-800">{currentVoyage.equipment?.name || 'Đang sử dụng'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium text-slate-500">Đã hoàn thành:</span>
                                        <span className="font-mono bg-[#00695C]/10 text-[#00695C] px-1.5 py-0.5 rounded font-bold">{Number(lastCumulative).toLocaleString()}T</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium text-slate-500">Mục tiêu:</span>
                                        <span className="font-mono text-slate-800">{Number(currentVoyage.totalVolume || 0).toLocaleString()}T</span>
                                    </div>
                                </div>
                            </div>

                            {/* Tàu Khẩn Cấp */}
                            <div className="border border-red-200 rounded-xl bg-red-50 p-4 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-red-100 rounded-bl-full -z-0"></div>
                                <span className="relative z-10 inline-block px-2 text-[10px] font-bold tracking-widest uppercase text-red-600 bg-red-200 rounded mb-2 animate-pulse">Khẩn cấp</span>
                                <h3 className="relative z-10 text-lg font-black text-red-700 uppercase">
                                    {emergencyVoyage.voyageCode} {emergencyVoyage.vessel?.code ? `- ${emergencyVoyage.vessel.code}` : ''}
                                </h3>
                                <div className="relative z-10 mt-3 space-y-2 text-sm text-slate-600">
                                    <div className="flex justify-between">
                                        <span className="font-medium text-red-900/60">Hàng hóa:</span>
                                        <span className="font-bold text-red-900">{emergencyVoyage.product?.name || '---'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium text-red-900/60">Sản lượng:</span>
                                        <span className="font-mono font-bold text-red-900">{Number(emergencyVoyage.totalVolume || 0).toLocaleString()}T</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="bg-amber-50 border border-amber-200 p-5 rounded-xl space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-1">
                                    Sản lượng phát sinh mới của chuyến {currentVoyage.voyageCode} (nếu có)
                                </label>
                                <p className="text-[11px] text-amber-700 font-medium mb-3">Sản lượng lũy kế hiện tại: <strong>{Number(lastCumulative).toLocaleString()} tấn</strong>. Hãy nhập lượng hàng vừa làm thêm chưa kịp báo cáo.</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="md:col-span-1 border-r border-amber-200 pr-4">
                                        <label className="block text-xs font-semibold text-slate-600 mb-1.5 focus-within:text-brand transition-colors">Sản lượng <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min={0}
                                                value={amount}
                                                onChange={e => setAmount(e.target.value)}
                                                className="w-full h-10 pl-3 pr-10 text-base font-mono font-bold text-slate-900 bg-white border border-amber-300 rounded-lg focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all placeholder:text-slate-300 placeholder:font-sans"
                                                placeholder="VD: 0"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">tấn</span>
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 grid grid-cols-2 gap-3 opacity-90">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Từ giờ {Number(amount) > 0 && <span className="text-red-500">*</span>}</label>
                                            <StandardDatePicker
                                                selected={startTime ? new Date(startTime) : null}
                                                onChange={(date) => setStartTime(date ? date.toISOString() : '')}
                                                showTimeSelect
                                                disabled={Number(amount) <= 0}
                                                className={Number(amount) > 0 ? 'border-amber-400 bg-white text-slate-900' : 'border-slate-200 bg-slate-50 text-slate-500'}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Đến giờ {Number(amount) > 0 && <span className="text-red-500">*</span>}</label>
                                            <StandardDatePicker
                                                selected={endTime ? new Date(endTime) : null}
                                                onChange={(date) => setEndTime(date ? date.toISOString() : '')}
                                                showTimeSelect
                                                disabled={Number(amount) <= 0}
                                                className={Number(amount) > 0 ? 'border-amber-400 bg-white text-slate-900' : 'border-slate-200 bg-slate-50 text-slate-500'}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-2">Lý do nhường cẩu (Tùy chọn)</label>
                                <input
                                    type="text"
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                    className="w-full h-10 px-3 bg-white border border-amber-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                    placeholder="Lệnh điều động, hoặc sự cố mớn nước..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={overrideMutation.isPending}
                            className="px-6 py-2.5 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20 disabled:opacity-50 flex items-center gap-2 transition-all"
                        >
                            {overrideMutation.isPending ? 'Đang xử lý...' : 'Xác nhận Nhường Cẩu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
