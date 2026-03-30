'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { Voyage } from '@/features/qltau/types';
import { useUpdateVoyageStatus, useUpdateVoyageReadiness, useVoyages } from '@/features/qltau/hooks';
import { useUser } from '@/features/auth/hooks';

interface StatusTransitionModalProps {
    isOpen: boolean;
    onClose: () => void;
    voyage: Voyage | null;
}

const STATUS_SEQUENCE = [
    { value: 'NHAP', label: 'Nháp' },
    { value: 'THU_TUC', label: 'Làm thủ tục' },
    { value: 'DO_MON_DAU_VAO', label: 'Đo mớn đầu vào' },
    { value: 'LAY_MAU', label: 'Lấy mẫu' },
    { value: 'LAM_HANG', label: 'Làm hàng' },
    { value: 'DO_MON_DAU_RA', label: 'Đo mớn đầu ra' },
    { value: 'HOAN_THANH', label: 'Hoàn thành' },
];

const STATUS_LABELS: Record<string, string> = {
    'NHAP': 'Nháp',
    'THU_TUC': 'Làm thủ tục',
    'DO_MON_DAU_VAO': 'Đo mớn đầu vào',
    'LAY_MAU': 'Lấy mẫu',
    'LAM_HANG': 'Làm hàng',
    'DO_MON_DAU_RA': 'Đo mớn đầu ra',
    'TAM_DUNG': 'Tạm dừng',
    'HOAN_THANH': 'Hoàn thành',
    'HUY_BO': 'Hủy bỏ',
};

export default function StatusTransitionModal({ isOpen, onClose, voyage }: StatusTransitionModalProps) {
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [reason, setReason] = useState('');
    const [checklist, setChecklist] = useState({
        procedure: false,
        draft: false,
        sample: false,
        equipment: false,
        weather: false,
    });
    const [error, setError] = useState('');

    const updateStatusMutation = useUpdateVoyageStatus();
    const updateReadinessMutation = useUpdateVoyageReadiness();
    const { user } = useUser();
    const { data: allVoyages } = useVoyages();

    useEffect(() => {
        if (voyage) {
            setSelectedStatus(voyage.status);
            // Default check next logical status if possible
            const currentIndex = STATUS_SEQUENCE.findIndex(s => s.value === voyage.status);
            if (currentIndex >= 0 && currentIndex < STATUS_SEQUENCE.length - 1) {
                setSelectedStatus(STATUS_SEQUENCE[currentIndex + 1].value);
            }

            // Set initial checklist if changing to LAM_HANG
            const existingChecklist = (voyage as any).readinessChecklist;
            if (existingChecklist) {
                setChecklist({
                    procedure: !!existingChecklist.procedure,
                    draft: !!existingChecklist.draft,
                    sample: !!existingChecklist.sample,
                    equipment: !!existingChecklist.equipment,
                    weather: !!existingChecklist.weather,
                });
            }
        }
    }, [voyage, isOpen]);

    if (!isOpen || !voyage) return null;

    const handleSubmit = async () => {
        setError('');
        try {
            if (selectedStatus === 'HUY_BO' && !reason.trim()) {
                setError(`Vui lòng nhập lý do hủy bỏ.`);
                return;
            }

            if (selectedStatus === 'LAM_HANG') {
                if (!checklist.procedure || !checklist.draft || !checklist.sample || !checklist.equipment || !checklist.weather) {
                    setError('Vui lòng hoàn thành tất cả các mục kiểm tra trước khi Làm hàng.');
                    return;
                }
                // Update readiness first
                await updateReadinessMutation.mutateAsync({
                    id: voyage.id,
                    checklist
                });
            }

            // Then update status
            await updateStatusMutation.mutateAsync({
                id: voyage.id,
                status: selectedStatus,
                reason: reason.trim() || undefined,
                userId: user?.id
            });

            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi lưu dữ liệu.');
        }
    };

    const isLamHang = selectedStatus === 'LAM_HANG';
    const isHuyBo = selectedStatus === 'HUY_BO';
    const isTamDung = selectedStatus === 'TAM_DUNG';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800">Cập nhật Trạng thái</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Current Status */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                            <div className="text-xs font-semibold text-slate-500 uppercase">Trạng thái hiện tại</div>
                            <div className="font-bold text-slate-700 mt-1">
                                {STATUS_LABELS[voyage.status] || voyage.status}
                            </div>
                        </div>
                        <ArrowRight className="text-slate-300" />
                        <div className="text-right">
                            <div className="text-xs font-semibold text-slate-500 uppercase">Tùy chọn kế tiếp</div>
                            <div className="font-bold text-brand mt-1">
                                {selectedStatus === 'TAM_DUNG' ? 'Tạm dừng' : selectedStatus === 'HUY_BO' ? 'Hủy bỏ' : (STATUS_LABELS[selectedStatus] || selectedStatus)}
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex gap-2 text-red-600 text-sm">
                            <AlertTriangle size={18} className="shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Status Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Trạng thái mới</label>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand bg-white"
                        >
                            <optgroup label="Quy trình chuẩn">
                                {STATUS_SEQUENCE.filter(s => {
                                    if (voyage.status === 'NHAP') return s.value === 'THU_TUC' || s.value === 'NHAP';
                                    if (s.value === 'NHAP') return false; // Cannot transition back to NHAP
                                    return true;
                                }).map(s => {
                                    // Check if LAM_HANG is allowed
                                    let isDisabled = s.value === voyage.status;
                                    let labelSuffix = '';
                                    if (s.value === 'LAM_HANG' && voyage.priority !== 'EMERGENCY' && allVoyages) {
                                        const WAITING_STATUSES = ['THU_TUC', 'DO_MON_DAU_VAO', 'LAY_MAU'];
                                        const waitingVoyages = allVoyages.filter((v: Voyage) => v.laneId === voyage.laneId && WAITING_STATUSES.includes(v.status));
                                        const sortedWaiting = waitingVoyages.sort((a: Voyage, b: Voyage) => (a.queueNo || 0) - (b.queueNo || 0));
                                        if (sortedWaiting.length > 0 && sortedWaiting[0].id !== voyage.id) {
                                            isDisabled = true;
                                            labelSuffix = ' (Chưa lọt lốt)';
                                        }
                                    }

                                    return (
                                        <option key={s.value} value={s.value} disabled={isDisabled}>
                                            {STATUS_LABELS[s.value] || s.value}{labelSuffix}
                                        </option>
                                    );
                                })}
                            </optgroup>
                            <optgroup label="Khác">
                                {voyage.status !== 'NHAP' && <option value="TAM_DUNG">Tạm dừng</option>}
                                <option value="HUY_BO">Hủy bỏ</option>
                            </optgroup>
                        </select>
                    </div>

                    {/* Warning for NHAP to THU_TUC transition */}
                    {voyage.status === 'NHAP' && selectedStatus === 'THU_TUC' && (
                        <div className="bg-orange-50 rounded-xl border border-orange-200 p-4 space-y-2">
                            <div className="flex gap-2 text-orange-700">
                                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold">Xác nhận thực hiện Thủ tục</p>
                                    <p className="text-sm mt-1">Lưu ý: Sau khi chuyển sang trạng thái Làm thủ tục, chuyến tàu sẽ không thể quay lại trạng thái Nháp được nữa. Vui lòng kiểm tra kỹ thông tin.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Conditional: Checklist for LAM_HANG */}
                    {isLamHang && (
                        <div className="bg-amber-50 rounded-xl border border-amber-100 p-4 space-y-3">
                            <div className="flex gap-2">
                                <AlertTriangle size={18} className="text-amber-600 shrink-0" />
                                <span className="text-sm font-semibold text-amber-800">
                                    Yêu cầu hoàn thành Checklist trước khi Làm hàng
                                </span>
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                    <input type="checkbox" checked={checklist.procedure} onChange={e => setChecklist({ ...checklist, procedure: e.target.checked })} className="rounded text-brand focus:ring-brand" />
                                    Thủ tục cảng vụ
                                </label>
                                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                    <input type="checkbox" checked={checklist.draft} onChange={e => setChecklist({ ...checklist, draft: e.target.checked })} className="rounded text-brand focus:ring-brand" />
                                    Hoàn tất Đo mớn đầu vào
                                </label>
                                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                    <input type="checkbox" checked={checklist.sample} onChange={e => setChecklist({ ...checklist, sample: e.target.checked })} className="rounded text-brand focus:ring-brand" />
                                    Hoàn tất Lấy mẫu
                                </label>
                                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                    <input type="checkbox" checked={checklist.equipment} onChange={e => setChecklist({ ...checklist, equipment: e.target.checked })} className="rounded text-brand focus:ring-brand" />
                                    Thiết bị đã sẵn sàng
                                </label>
                                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                    <input type="checkbox" checked={checklist.weather} onChange={e => setChecklist({ ...checklist, weather: e.target.checked })} className="rounded text-brand focus:ring-brand" />
                                    Thời tiết đảm bảo an toàn
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Conditional: Reason for PAUSE / CANCEL */}
                    {(isHuyBo || isTamDung) && (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Lý do {isHuyBo ? 'Hủy bỏ' : 'Tạm dừng'} <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
                                placeholder={`Nhập lý do chi tiết cho việc ${isHuyBo ? 'hủy bỏ' : 'tạm dừng'} chuyến tàu...`}
                            />
                        </div>
                    )}

                </div>

                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                        disabled={updateStatusMutation.isPending || updateReadinessMutation.isPending}
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={updateStatusMutation.isPending || updateReadinessMutation.isPending || (isLamHang && Object.values(checklist).some(v => !v))}
                        className="px-5 py-2.5 rounded-xl font-semibold text-white bg-brand hover:bg-brand-hover transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-brand/20"
                    >
                        {(updateStatusMutation.isPending || updateReadinessMutation.isPending) ? 'Đang lưu...' : 'Xác nhận cập nhật'}
                        {!updateStatusMutation.isPending && !updateReadinessMutation.isPending && <CheckCircle size={18} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
