'use client';

import { useState, useEffect } from 'react';
import { Equipment, Lane } from '@/features/config/types';
import { Product } from '@/features/qltau/types';
import { useEquipment, useLanes, useProducts } from '@/features/config/hooks';
import { Cpu, Map, Package, Activity, Navigation, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils/cn';

interface EquipmentCoreInfoProps {
    equipment: Equipment;
}

export function EquipmentCoreInfo({ equipment }: EquipmentCoreInfoProps) {
    const { updateMutation } = useEquipment();
    const { data: lanes } = useLanes();
    const { data: products } = useProducts();

    // Local states
    const [name, setName] = useState('');
    const [capacity, setCapacity] = useState('');
    const [laneId, setLaneId] = useState('');
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Initial state sync
    useEffect(() => {
        if (equipment) {
            setName(equipment.name || '');
            setCapacity(equipment.capacity?.toString() || '');
            setLaneId(equipment.laneId || '');
            setSelectedProductIds(equipment.products?.map((p: Product) => p.id) || []);
        }
    }, [equipment]);

    const isBusy = equipment.status === 'BUSY';
    const isEditingDisabled = isBusy || updateMutation.isPending;

    const handleAutoSaveStr = async (field: 'name' | 'laneId', value: string) => {
        if (value === equipment[field]) return;
        saveChanges({ [field]: value });
    };

    const handleAutoSaveNum = async (field: 'capacity', value: string) => {
        if (Number(value) === equipment[field]) return;
        saveChanges({ [field]: Number(value) });
    };

    const toggleCargo = async (productId: string) => {
        if (isEditingDisabled) return;

        let newIds = [...selectedProductIds];
        if (newIds.includes(productId)) {
            newIds = newIds.filter(id => id !== productId);
        } else {
            newIds.push(productId);
        }

        setSelectedProductIds(newIds);
        saveChanges({ productIds: newIds }, 'Cập nhật năng lực hàng hoá thành công');
    };

    const saveChanges = async (data: any, customSuccessMsg?: string) => {
        setIsSaving(true);
        try {
            await updateMutation.mutateAsync({
                id: equipment.id,
                data
            });
            toast.success(customSuccessMsg || 'Đã lưu cấu hình thiết bị');
        } catch (error) {
            toast.error('Lỗi khi lưu cấu hình');
            // Revert basic states on error (optional, could just refetch)
        } finally {
            setIsSaving(false);
        }
    };

    const allImportProducts = products?.filter((p: Product) => p.type === 'IMPORT') || [];
    const allExportProducts = products?.filter((p: Product) => p.type === 'EXPORT') || [];

    return (
        <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-6 relative">

            {/* Warning Overlay Layer */}
            {isBusy && (
                <div className="absolute inset-x-0 bottom-0 h-1 z-20 bg-amber-400"></div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-50 relative z-10">

                {/* 1. Identity */}
                <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-brand">
                            <Cpu size={13} />
                            <span className="font-medium text-slate-500">Định danh Cẩu</span>
                            {isSaving && <Loader2 size={10} className="animate-spin text-brand" />}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="relative group">
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onBlur={(e) => handleAutoSaveStr('name', e.target.value)}
                                disabled={isEditingDisabled}
                                className={cn(
                                    "h-8 text-xl font-bold text-slate-900 leading-none px-2 -ml-2 border-transparent bg-transparent transition-all",
                                    !isEditingDisabled && "hover:border-slate-200 hover:bg-slate-50 focus:border-brand focus:bg-white"
                                )}
                            />
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                            <Activity size={12} className="text-slate-400" />
                            <span>Công suất tối đa:</span>
                            <div className="flex items-center gap-1">
                                <Input
                                    type="number"
                                    value={capacity}
                                    onChange={(e) => setCapacity(e.target.value)}
                                    onBlur={(e) => handleAutoSaveNum('capacity', e.target.value)}
                                    disabled={isEditingDisabled}
                                    className={cn(
                                        "h-6 w-16 font-semibold text-slate-700 px-1 py-0 text-center border-transparent bg-transparent transition-all",
                                        !isEditingDisabled && "hover:border-slate-200 hover:bg-slate-50 focus:border-brand focus:bg-white"
                                    )}
                                />
                                <strong>tấn/giờ</strong>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Lane Info */}
                <div className="p-4 space-y-3 bg-slate-50/20">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Map size={13} />
                        <span className="font-medium text-slate-500">Vị trí khai thác</span>
                    </div>
                    <div className="space-y-3">
                        <div className="space-y-0.5">
                            <label className="font-medium text-slate-500">Luồng gán định</label>
                            <div className="flex items-center gap-2 relative group -ml-2">
                                <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                                    <Navigation size={12} className={cn(laneId ? "text-brand" : "text-slate-300")} />
                                </div>
                                <select
                                    value={laneId}
                                    onChange={(e) => {
                                        setLaneId(e.target.value);
                                        handleAutoSaveStr('laneId', e.target.value);
                                    }}
                                    disabled={isEditingDisabled}
                                    className={cn(
                                        "w-full h-7 pl-6 pr-2 rounded font-semibold border border-transparent bg-transparent transition-all cursor-pointer appearance-none truncate max-w-[200px]",
                                        laneId ? "text-slate-900" : "text-slate-400 italic",
                                        !isEditingDisabled && "hover:border-slate-200 hover:bg-white focus:border-brand focus:bg-white"
                                    )}
                                >
                                    <option value="">-- Chưa gắn luồng --</option>
                                    {lanes?.map((l: Lane) => (
                                        <option key={l.id} value={l.id}>{l.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        {isBusy && (equipment as any).voyages && (equipment as any).voyages.length > 0 && (
                            <div className="space-y-0.5">
                                <label className="font-medium text-slate-500">Tàu đang phục vụ</label>
                                <div className="flex flex-wrap gap-1">
                                    {(equipment as any).voyages.map((v: any) => (
                                        <span key={v.id} className="font-mono bg-brand/5 text-brand px-1.5 py-0.5 rounded font-medium border border-brand/10 truncate max-w-full">
                                            {v.voyageCode} - {v.vessel?.code || 'Tàu vô danh'}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Products Info (Tags Selector) */}
                <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Package size={13} />
                        <span className="font-medium text-slate-500">Năng lực hàng hóa (Click để chọn)</span>
                    </div>
                    <div className="space-y-3">
                        {/* Import Tag Selector */}
                        <div className="space-y-1.5">
                            <label className="font-medium text-slate-500 flex items-center gap-1">
                                Hàng Nhập <ArrowRight size={8} className="text-slate-300" />
                            </label>
                            <div className="flex gap-1.5 flex-wrap">
                                {allImportProducts.map((p: Product) => {
                                    const isSelected = selectedProductIds.includes(p.id);
                                    return (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => toggleCargo(p.id)}
                                            disabled={isEditingDisabled}
                                            className={cn(
                                                "flex items-center gap-1 px-1.5 py-0.5 rounded font-medium border transition-all",
                                                isSelected
                                                    ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm"
                                                    : "bg-slate-50 text-slate-400 border-slate-100 hover:bg-white hover:border-slate-300",
                                                isEditingDisabled && "opacity-50 cursor-not-allowed"
                                            )}
                                        >
                                            {isSelected && <CheckCircle2 size={8} className="text-blue-500" />}
                                            {p.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        {/* Export Tag Selector */}
                        <div className="space-y-1.5">
                            <label className="font-medium text-slate-500 flex items-center gap-1">
                                Hàng Xuất <ArrowRight size={8} className="text-slate-300" />
                            </label>
                            <div className="flex gap-1.5 flex-wrap">
                                {allExportProducts.map((p: Product) => {
                                    const isSelected = selectedProductIds.includes(p.id);
                                    return (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => toggleCargo(p.id)}
                                            disabled={isEditingDisabled}
                                            className={cn(
                                                "flex items-center gap-1 px-1.5 py-0.5 rounded font-medium border transition-all",
                                                isSelected
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm"
                                                    : "bg-slate-50 text-slate-400 border-slate-100 hover:bg-white hover:border-slate-300",
                                                isEditingDisabled && "opacity-50 cursor-not-allowed"
                                            )}
                                        >
                                            {isSelected && <CheckCircle2 size={8} className="text-emerald-500" />}
                                            {p.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
