'use client';

import { useState, useEffect } from 'react';
import { safeDate, toLocalISOString, formatDateTime } from '@/lib/utils/date';
import { Voyage } from '@/features/qltau/types';
import { useUpdateVoyage, useEquipment } from '@/features/qltau/hooks';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { Ship, Package, Calendar, Anchor, Loader2, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VoyageCoreInfoProps {
    voyage: Voyage;
}

export function VoyageCoreInfo({ voyage }: VoyageCoreInfoProps) {
    const updateVoyage = useUpdateVoyage();

    // Form states
    const [eta, setEta] = useState('');
    const [priority, setPriority] = useState('');
    const [totalVolume, setTotalVolume] = useState('');
    const [equipmentId, setEquipmentId] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const { data: equipments } = useEquipment();

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
        if (field === 'priority' && value === voyage.priority) return;
        if (field === 'totalVolume' && value === voyage.totalVolume?.toString()) return;
        if (field === 'equipmentId' && value === voyage.equipmentId) return;

        setIsSaving(true);
        try {
            await updateVoyage.mutateAsync({
                id: voyage.id,
                data: { [field]: field === 'totalVolume' ? Number(value) : (field === 'eta' ? safeDate(value).toISOString() : value) }
            });
            toast.success(`Đã lưu ${field === 'eta' ? 'thời gian' : field === 'priority' ? 'độ ưu tiên' : field === 'equipmentId' ? 'thiết bị cẩu' : 'sản lượng'}`);
        } catch (error) {
            toast.error('Không thể lưu thay đổi');
        } finally {
            setIsSaving(false);
        }
    };

    const isReadOnly = voyage.status !== 'NHAP';
    const isVolumeReadOnly = voyage.status === 'LAM_HANG' || voyage.status === 'HOAN_THANH';

    return (
        <TooltipProvider>
            <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-50">



                    {/* 2. Cargo Information */}
                    <div className="p-4 space-y-3">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Package size={13} />
                            <span className="font-medium text-slate-500">Hàng hóa</span>
                        </div>
                        <div className="space-y-2">
                            <div className="space-y-0.5">
                                <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Tên hàng</label>
                                <p className="font-semibold text-slate-900 leading-none">
                                    {voyage.product?.name || 'N/A'}
                                </p>
                            </div>
                            <div className="space-y-0.5 relative group">
                                <label className="font-medium text-slate-500">Sản lượng mục tiêu</label>
                                <div className="flex items-center gap-1 h-5">
                                    <input
                                        type="number"
                                        value={totalVolume}
                                        onChange={(e) => setTotalVolume(e.target.value)}
                                        onBlur={() => handleAutoSave('totalVolume', totalVolume)}
                                        disabled={isVolumeReadOnly}
                                        style={{ width: `${Math.max(String(totalVolume).length, 1) + 1}ch` }}
                                        className={cn(
                                            "h-5 font-semibold border-transparent hover:border-slate-200 focus:border-brand bg-transparent p-0 transition-all outline-none ring-0 min-w-[30px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                                            isVolumeReadOnly && "cursor-not-allowed opacity-100"
                                        )}
                                    />
                                    <span className="font-semibold text-slate-500">{voyage.product ? (voyage.product.unit === 'TON' ? 'tấn' : voyage.product.unit) : ''}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Schedule Information */}
                    <div className="p-4 space-y-3 bg-slate-50/20">
                        <div className="flex items-center gap-2 text-brand">
                            <Calendar size={13} />
                            <span className="font-medium text-slate-500">Lịch trình</span>
                            {isSaving && <Loader2 size={9} className="animate-spin ml-auto" />}
                        </div>
                        <div className="space-y-2">
                            <div className="space-y-0.5">
                                <label className="font-medium text-slate-500">ETA</label>
                                <div className="relative group">
                                    <Input
                                        type="datetime-local"
                                        value={eta}
                                        onChange={(e) => setEta(e.target.value)}
                                        onBlur={() => handleAutoSave('eta', eta)}
                                        disabled={isReadOnly}
                                        className={cn(
                                            "absolute inset-0 opacity-0 cursor-pointer z-10",
                                            isReadOnly && "hidden"
                                        )}
                                    />
                                    <div className={cn(
                                        "flex items-center h-6 px-2 font-semibold text-slate-800 border border-transparent rounded transition-colors bg-white/50",
                                        !isReadOnly && "group-hover:border-slate-200 group-focus-within:border-brand"
                                    )}>
                                        {eta ? formatDateTime(eta) : '---'}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-0.5">
                                <label className="font-medium text-slate-500">ETD</label>
                                <div className="space-y-1">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1 w-20 whitespace-nowrap">
                                                <span className="font-medium text-slate-500">Thực tế:</span>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Info size={10} className="text-slate-400 hover:text-slate-600 cursor-help" />
                                                    </TooltipTrigger>
                                                    <TooltipContent align="start" className="w-[320px] p-3 shadow-xl border-slate-100 bg-white z-50">
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between items-center">
                                                                <p className="font-bold text-xs text-slate-800">ETD Thực tế</p>

                                                            </div>
                                                            <p className="text-[10px] text-slate-500 leading-relaxed">
                                                                Thời gian rời bến được tính toán liên tục dựa trên <strong className="text-slate-700">Công suất TB thực tế của thiết bị</strong> và thời gian xảy ra <strong className="text-slate-700">Sự cố</strong>.
                                                            </p>
                                                            <div className="bg-slate-50 p-2 rounded text-[10px] font-mono text-slate-600 border border-slate-100 leading-relaxed">
                                                                <span>= Thời gian kết thúc của bản ghi sản lượng mới nhất</span><br />
                                                                <span>+ (Sản lượng còn lại / Công suất TB thực tế của thiết bị)</span><br />
                                                                <span>+ Thời gian sự cố</span><br />
                                                                <span>+ Thời gian thủ tục</span>
                                                            </div>
                                                        </div>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                            {voyage.etd ? (
                                                <span className="font-semibold text-slate-800 leading-none">
                                                    {formatDateTime(voyage.etd)}
                                                </span>
                                            ) : (
                                                <span className="font-medium text-slate-400 italic">---</span>
                                            )}
                                        </div>
                                        {voyage.theoreticalEtd && (
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex items-center gap-1 w-20 whitespace-nowrap">
                                                    <span className="font-medium text-slate-500">Lý thuyết:</span>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Info size={10} className="text-slate-400 hover:text-slate-600 cursor-help" />
                                                        </TooltipTrigger>
                                                        <TooltipContent align="start" className="max-w-[260px] p-3 shadow-xl border-slate-100">
                                                            <div className="space-y-1">
                                                                <p className="font-semibold text-slate-800">ETD Lý thuyết</p>
                                                                <p className="text-[10px] text-slate-500 leading-relaxed">Thời gian rời bến theo kế hoạch dựa trên công suất định mức :</p>
                                                                <div className="bg-slate-50 p-2 rounded text-[10px] font-mono text-slate-600 mt-2 border border-slate-100">
                                                                    <span>= ETA</span><br />
                                                                    <span>+ (Tổng khối lượng / Công suất định mức thiết bị)</span><br />
                                                                    <span>{Number(voyage.procedureTimeHours) > 0 ? `+ Thời gian thủ tục` : ''}</span>
                                                                </div>
                                                            </div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <span className="font-semibold text-slate-500">
                                                    {formatDateTime(voyage.theoreticalEtd)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. Terminal Information */}
                    <div className="p-4 space-y-3">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Anchor size={13} />
                            <span className="font-medium text-slate-500">Khai thác</span>
                        </div>
                        <div className="space-y-2">
                            <div className="space-y-0.5">
                                <label className="font-medium text-slate-500">Luồng</label>
                                <p className="font-semibold text-slate-700 leading-none mb-2">
                                    {voyage.lane?.name || '---'}
                                </p>
                            </div>
                            <div className="space-y-0.5">
                                <label className="font-medium text-slate-500">Thiết bị cẩu</label>
                                <div className="flex items-center gap-2 h-5 mb-2">
                                    <Select
                                        key={equipments ? 'loaded' : 'loading'}
                                        value={equipmentId}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setEquipmentId(val);
                                            handleAutoSave('equipmentId', val);
                                        }}
                                        disabled={true}
                                        options={[
                                            { value: '', label: '-- Chọn thiết bị cẩu --' },
                                            ...(equipments || []).map((eq: any) => ({
                                                value: eq.id,
                                                label: `${eq.name} (${eq.capacity} tấn/giờ)`
                                            }))
                                        ]}
                                        className="h-5 font-semibold border-transparent bg-transparent p-0 transition-all truncate min-w-0"
                                    />
                                </div>
                            </div>
                            <div className="space-y-0.5">
                                <label className="font-medium text-slate-500">Ưu tiên</label>
                                <div className="flex items-center gap-2 h-5">
                                    <Select
                                        value={priority}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setPriority(val);
                                            handleAutoSave('priority', val);
                                        }}
                                        disabled={isReadOnly}
                                        options={[
                                            { value: 'NORMAL', label: 'Thường' },
                                            { value: 'EMERGENCY', label: 'Khẩn' }
                                        ]}
                                        className={cn(
                                            "h-5 font-semibold border-transparent bg-transparent p-0 transition-all",
                                            priority === 'EMERGENCY' ? "text-red-500" : "text-slate-600"
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Read-only Alert Bar */}
                {isReadOnly && (
                    <div className="px-4 py-1.5 bg-amber-50/40 border-t border-slate-50 flex items-center gap-2">
                        <AlertCircle size={9} className="text-amber-500" />
                        <span className="font-medium text-amber-600">
                            Thông tin định danh đã khóa.
                        </span>
                    </div>
                )}
            </div>
        </TooltipProvider >
    );
}
