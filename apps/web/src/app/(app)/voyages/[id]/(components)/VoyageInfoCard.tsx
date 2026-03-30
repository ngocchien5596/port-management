'use client';

import { useState, useEffect } from 'react';
import { safeDate, toLocalISOString, formatDateTime } from '@/lib/utils/date';
import { Voyage } from '@/features/qltau/types';
import { useUpdateVoyage } from '@/features/qltau/hooks';
import { useEquipment } from '@/features/config/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { Info, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface VoyageInfoCardProps {
    voyage: Voyage;
}

export function VoyageInfoCard({ voyage }: VoyageInfoCardProps) {
    const updateVoyage = useUpdateVoyage();
    const { data: equipments } = useEquipment();

    // Form states
    const [eta, setEta] = useState('');
    const [priority, setPriority] = useState('');
    const [totalVolume, setTotalVolume] = useState('');
    const [equipmentId, setEquipmentId] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Initial state
    useEffect(() => {
        if (voyage.eta) {
            setEta(toLocalISOString(voyage.eta));
        }
        setPriority(voyage.priority || 'NORMAL');
        setTotalVolume(voyage.totalVolume?.toString() || '');
        setEquipmentId(voyage.equipmentId || '');
    }, [voyage]);

    const handleAutoSave = async (field: string, value: any) => {
        // Skip if value hasn't changed to avoid unnecessary API calls
        if (field === 'priority' && value === voyage.priority) return;
        if (field === 'totalVolume' && value === voyage.totalVolume?.toString()) return;

        setIsSaving(true);
        try {
            await updateVoyage.mutateAsync({
                id: voyage.id,
                data: { [field]: field === 'totalVolume' ? Number(value) : (field === 'eta' ? safeDate(value).toISOString() : value) }
            });
            toast.success(`Đã lưu ${field === 'eta' ? 'thời gian' : field === 'priority' ? 'độ ưu tiên' : 'sản lượng'}`);
        } catch (error) {
            toast.error('Không thể lưu thay đổi');
        } finally {
            setIsSaving(false);
        }
    };

    const statusLabels: Record<string, string> = {
        'NHAP': 'Nháp',
        'THU_TUC': 'Làm thủ tục',
        'DO_MON_DAU_VAO': 'Đo mớn đầu vào',
        'LAY_MAU': 'Lấy mẫu hàng',
        'LAM_HANG': 'Đang làm hàng',
        'DO_MON_DAU_RA': 'Đo mớn đầu ra',
        'HOAN_THANH': 'Hoàn thành',
        'HUY_BO': 'Đã hủy',
        'TAM_DUNG': 'Tạm dừng',
    };

    const isReadOnly = voyage.status !== 'NHAP';
    const isVolumeReadOnly = voyage.status === 'LAM_HANG' || voyage.status === 'HOAN_THANH';

    return (
        <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <Info size={16} className="text-brand" />
                        Thông tin cốt lõi
                    </CardTitle>
                    {isSaving && (
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full animate-pulse">
                            <Loader2 size={10} className="animate-spin" />
                            Đang lưu...
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
                {/* Status Warning */}
                {isReadOnly && (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100 text-[11px] text-amber-700 leading-relaxed shadow-sm">
                        <AlertCircle size={14} className="mt-0.5 shrink-0" />
                        <p>
                            Chuyến tàu đang trong trạng thái <span className="font-bold underline">{statusLabels[voyage.status] || voyage.status}</span>.
                            Thông tin định danh đã được khóa để đảm bảo toàn vẹn dữ liệu.
                        </p>
                    </div>
                )}

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 tracking-tight">Tên tàu</label>
                            <Input value={voyage.vessel?.name || voyage.vessel?.code || 'N/A'} disabled className="bg-slate-50 font-bold text-brand h-9 text-xs tracking-tight" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 tracking-tight">Hàng hóa</label>
                            <Input value={voyage.product?.name || 'N/A'} disabled className="bg-slate-50 h-9 text-xs tracking-tight" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 tracking-tight">Khách hàng / chủ tàu</label>
                            <Input value={voyage.vessel?.customerName || 'N/A'} disabled className="bg-slate-50 h-9 text-xs tracking-tight" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 tracking-tight">Thiết bị cẩu</label>
                            <Select
                                value={equipmentId}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setEquipmentId(val);
                                    handleAutoSave('equipmentId', val);
                                }}
                                disabled={isReadOnly}
                                options={[
                                    { value: '', label: '-- Chọn thiết bị cẩu --' },
                                    ...(equipments || []).map((eq: any) => ({
                                        value: eq.id,
                                        label: `${eq.name} (${eq.capacity} tấn/giờ) - ${eq.lane?.name || 'Chưa gán luồng'}`
                                    }))
                                ]}
                                className="h-9 text-xs tracking-tight bg-emerald-50/50 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400/20"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 tracking-tight">Dự kiến cập bến (ETA)</label>
                            <Input
                                type="datetime-local"
                                value={eta}
                                onChange={(e) => setEta(e.target.value)}
                                onBlur={() => handleAutoSave('eta', eta)}
                                disabled={isReadOnly}
                                className={cn("h-9 text-xs tracking-tight", isReadOnly ? "bg-slate-50" : "")}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 tracking-tight">Dự kiến hoàn thành (ETD)</label>
                            <Input
                                value={voyage.etd ? formatDateTime(voyage.etd) : 'Chưa có dữ liệu'}
                                disabled
                                className="bg-brand-soft/50 font-bold text-brand h-9 text-xs tracking-tight"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 tracking-tight">Độ ưu tiên</label>
                            <Select
                                value={priority}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setPriority(val);
                                    handleAutoSave('priority', val);
                                }}
                                disabled={isReadOnly}
                                options={[
                                    { value: 'NORMAL', label: 'Thông thường' },
                                    { value: 'EMERGENCY', label: 'Khẩn cấp' }
                                ]}
                                className="h-9 text-xs tracking-tight"
                            />
                        </div>
                        <div className="space-y-1 relative">
                            <label className="text-[10px] font-bold text-slate-500 tracking-tight">Sản lượng mục tiêu</label>
                            <div className={cn(
                                "flex items-center gap-1 h-9 rounded-md border border-slate-200 px-3 shadow-sm transition-colors focus-within:ring-1 focus-within:ring-brand focus-within:border-brand cursor-text",
                                isVolumeReadOnly ? "bg-slate-50" : "bg-transparent hover:border-slate-300"
                            )}>
                                <input
                                    type="number"
                                    value={totalVolume}
                                    onChange={(e) => setTotalVolume(e.target.value)}
                                    onBlur={() => handleAutoSave('totalVolume', totalVolume)}
                                    disabled={isVolumeReadOnly}
                                    placeholder="0"
                                    style={{ width: `${Math.max(String(totalVolume).length, 1) + 1}ch` }}
                                    className="bg-transparent border-none outline-none ring-0 p-0 text-xs tracking-tight font-semibold text-slate-900 min-w-[30px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
                                    {voyage.product?.unit === 'TON' ? 'tấn' : (voyage.product?.unit || 'tấn')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
