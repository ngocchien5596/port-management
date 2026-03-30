'use client';

import React, { useState, useEffect } from 'react';
import { useSystemConfig } from '@/features/config/hooks';
import { Button, Input, ConfirmDialog } from '@/components/ui';
import { Settings, Save } from 'lucide-react';

export default function ProcedureTimePage() {
    const { data: configResponse, isLoading } = useSystemConfig();
    const { updateMutation } = useSystemConfig();
    const [hours, setHours] = useState('0');
    const [isConfirming, setIsConfirming] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (configResponse?.data) {
            const procedureTimeConfig = configResponse.data.find((c: any) => c.key === 'PROCEDURE_TIME_HOURS');
            if (procedureTimeConfig) {
                setHours(procedureTimeConfig.value);
            }
        }
    }, [configResponse?.data]);

    const handleSave = async () => {
        try {
            await updateMutation.mutateAsync({ key: 'PROCEDURE_TIME_HOURS', value: hours });
            setIsConfirming(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error('Save config error:', error);
            alert('Lỗi khi lưu cấu hình.');
            setIsConfirming(false);
        }
    };

    if (isLoading) {
        return <div className="py-20 text-center text-slate-400 font-bold animate-pulse">Đang tải cấu hình...</div>;
    }

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500 max-w-2xl mx-auto w-full pt-10">
            <div className="mb-8">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 lowercase">
                    <Settings className="w-8 h-8 text-brand" />
                    <span className="uppercase">THỜI GIAN THỦ TỤC</span>
                </h3>
            </div>

            <div className="bg-white rounded-[24px] border border-vtborder shadow-xl shadow-slate-200/50 p-8">
                <div className="space-y-6">
                    <div className="space-y-3">
                        <label className="text-sm font-black text-slate-800 uppercase tracking-widest block">
                            Số Giờ (h)
                        </label>
                        <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
                            Lưu ý: Thay đổi này chỉ áp dụng cho nhóm tàu tạo mới kể từ thời điểm cập nhật.
                        </p>
                        <Input
                            type="number"
                            min="0"
                            step="0.5"
                            value={hours}
                            onChange={(e) => setHours(e.target.value)}
                            className="max-w-[200px] text-lg font-bold"
                        />
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <Button
                            onClick={() => setIsConfirming(true)}
                            disabled={updateMutation.isPending}
                            className="bg-brand hover:bg-brand-hover text-white px-8 h-12 rounded-xl font-bold shadow-xl shadow-brand/20 flex items-center gap-2 transition-all"
                        >
                            <Save className="w-5 h-5" />
                            {updateMutation.isPending ? 'ĐANG LƯU...' : 'LƯU LẠI'}
                        </Button>

                        {showSuccess && (
                            <span className="text-sm font-bold text-green-600 animate-in fade-in slide-in-from-right-4 duration-300">
                                ✓ Đã lưu thành công!
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmDialog
                isOpen={isConfirming}
                onClose={() => setIsConfirming(false)}
                onConfirm={handleSave}
                title="Thay đổi Thời gian thủ tục"
                description={`Bạn có chắc chắn muốn cập nhật thời gian làm thủ tục thành ${hours} giờ không? Thay đổi này sẽ được áp dụng ngay lập tức cho các chuyến tàu tạo mới.`}
                confirmText="Xác nhận lưu"
                cancelText="Hủy bỏ"
                type="danger"
            />
        </div>
    );
}
