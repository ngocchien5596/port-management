'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Select } from '@/components/ui';
import { safeDate, toLocalISOString } from '@/lib/utils/date';
import { useVessels, useProducts, useLaneSuggestion, useCreateVoyage, useUpdateVoyage } from '@/features/qltau/hooks';
import { Ship, Anchor, Info, Sparkles, TrendingUp, User, Weight, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Voyage, Vessel, Product, LaneSuggestion } from '@/features/qltau/types';

interface CreateVoyageModalProps {
    isOpen: boolean;
    onClose: () => void;
    editData?: Voyage;
}

export default function CreateVoyageModal({ isOpen, onClose, editData }: CreateVoyageModalProps) {
    const { data: vessels } = useVessels();
    const { data: products } = useProducts();
    const createMutation = useCreateVoyage();
    const updateMutation = useUpdateVoyage();

    // Form State
    const [selectedVesselId, setSelectedVesselId] = useState<string>('');
    const [isNewVessel, setIsNewVessel] = useState(false);

    // New Vessel Data
    const [newVessel, setNewVessel] = useState({
        code: '',
        name: '',
        customerName: '',
        capacity: 0,
        customerPhone: '',
        imoCode: ''
    });

    const [direction, setDirection] = useState('NHAP');
    const [selectedProductId, setSelectedProductId] = useState<string>('');
    const [selectedLaneId, setSelectedLaneId] = useState<string>('');
    const [eta, setEta] = useState<string>('');
    const [totalVolume, setTotalVolume] = useState<number>(0);
    const [priority, setPriority] = useState('NORMAL');

    // Initialize state if editing
    useEffect(() => {
        if (isOpen && editData) {
            setSelectedVesselId(editData.vesselId || '');
            setIsNewVessel(false);
            setDirection(editData.type || 'NHAP');
            setSelectedProductId(editData.productId || '');
            setSelectedLaneId(editData.laneId || '');
            setTotalVolume(editData.totalVolume || 0);
            setPriority(editData.priority || 'NORMAL');

            if (editData.eta) {
                setEta(toLocalISOString(editData.eta));
            } else {
                setEta('');
            }
        } else if (isOpen && !editData) {
            // Reset state for create
            setSelectedVesselId('');
            setIsNewVessel(false);
            setNewVessel({ code: '', name: '', customerName: '', capacity: 0, customerPhone: '', imoCode: '' });
            setDirection('NHAP');
            setSelectedProductId('');
            setSelectedLaneId('');
            setEta(toLocalISOString(new Date()));
            setTotalVolume(0);
            setPriority('NORMAL');
        }
    }, [isOpen, editData]);

    // Lane Suggestion
    const { data: laneSuggestions, isLoading: isLoadingSuggestions } = useLaneSuggestion(selectedProductId, eta);

    // Context Data
    const selectedVessel = vessels?.find((v: Vessel) => v.id === selectedVesselId);
    const selectedLaneSuggestion = laneSuggestions?.find((l: LaneSuggestion) => l.id === selectedLaneId);

    // Auto-select best lane
    useEffect(() => {
        if (laneSuggestions && laneSuggestions.length > 0 && !selectedLaneId) {
            setSelectedLaneId(laneSuggestions[0].id);
        }
    }, [laneSuggestions, selectedLaneId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editData) {
                await updateMutation.mutateAsync({
                    id: editData.id,
                    data: {
                        vesselId: selectedVesselId,
                        laneId: selectedLaneId,
                        productId: selectedProductId,
                        type: direction,
                        eta: eta ? safeDate(eta).toISOString() : undefined,
                        totalVolume,
                        priority
                    }
                });
            } else {
                await createMutation.mutateAsync({
                    vesselId: isNewVessel ? undefined : selectedVesselId,
                    newVessel: isNewVessel ? newVessel : undefined,
                    laneId: selectedLaneId,
                    equipmentId: selectedLaneSuggestion?.equipments?.[0]?.id,
                    productId: selectedProductId,
                    type: direction,
                    eta: eta ? safeDate(eta).toISOString() : undefined,
                    totalVolume,
                    priority
                });
            }
            onClose();
            setSelectedVesselId('');
            setIsNewVessel(false);
            setNewVessel({ code: '', name: '', customerName: '', capacity: 0, customerPhone: '', imoCode: '' });
            setSelectedLaneId('');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={editData ? "Chỉnh sửa chuyến tàu" : "Tạo chuyến tàu mới"}
            className="sm:max-w-[800px] overflow-hidden"
        >
            <form onSubmit={handleSubmit} className="space-y-8">

                {/* 1. VESSEL SELECTION */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-brand-soft flex items-center justify-center text-brand">
                                <Ship size={16} />
                            </div>
                            Thông tin tàu
                        </label>
                        {!editData && (
                            <div className="bg-slate-100 p-1 rounded-lg flex text-xs font-semibold">
                                <button
                                    type="button"
                                    onClick={() => setIsNewVessel(false)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-md transition-all",
                                        !isNewVessel ? "bg-white text-brand shadow-sm" : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    Chọn tàu có sẵn
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsNewVessel(true)}
                                    className={cn(
                                        "px-3 py-1.5 rounded-md transition-all",
                                        isNewVessel ? "bg-white text-brand shadow-sm" : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    Nhập tàu mới
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-200/60">
                        {!isNewVessel ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="md:col-span-2">
                                    <Select
                                        label="Tìm kiếm tàu"
                                        value={selectedVesselId}
                                        onChange={(e) => setSelectedVesselId(e.target.value)}
                                        options={[
                                            { value: '', label: "Chọn tàu..." },
                                            ...(vessels?.map((v: Vessel) => ({ value: v.id, label: `${v.code} - ${v.customerName}` })) || [])
                                        ]}
                                        className="bg-white"
                                    />
                                </div>
                                {selectedVessel && (
                                    <>
                                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                                            <div className="p-2 bg-brand-soft text-brand rounded-full"><User size={16} /></div>
                                            <div>
                                                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Chủ tàu</div>
                                                <div className="text-sm font-semibold text-slate-800">{selectedVessel.customerName}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-full"><Weight size={16} /></div>
                                            <div>
                                                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Trọng tải</div>
                                                <div className="text-sm font-semibold text-slate-800">{selectedVessel.capacity?.toLocaleString('vi-VN')} DWT</div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                <Input
                                    label="Mã tàu"
                                    placeholder="VD: V001"
                                    value={newVessel.code}
                                    onChange={(e) => setNewVessel({ ...newVessel, code: e.target.value })}
                                    required
                                    className="bg-white"
                                />
                                <Input
                                    label="Tên tàu"
                                    placeholder="Nhập tên tàu..."
                                    value={newVessel.name}
                                    onChange={(e) => setNewVessel({ ...newVessel, name: e.target.value })}
                                    required
                                    className="bg-white"
                                />
                                <Input
                                    label="Tên chủ tàu"
                                    placeholder="Nhập tên chủ tàu..."
                                    value={newVessel.customerName}
                                    onChange={(e) => setNewVessel({ ...newVessel, customerName: e.target.value })}
                                    required
                                    className="bg-white"
                                />
                                <Input
                                    label="Trọng tải (DWT)"
                                    type="number"
                                    placeholder="30000"
                                    value={newVessel.capacity}
                                    onChange={(e) => setNewVessel({ ...newVessel, capacity: Number(e.target.value) })}
                                    required
                                    className="bg-white"
                                />
                                <Input
                                    label="Số điện thoại liên hệ"
                                    placeholder="098xx..."
                                    value={newVessel.customerPhone}
                                    onChange={(e) => setNewVessel({ ...newVessel, customerPhone: e.target.value })}
                                    className="bg-white"
                                />
                                <Input
                                    label="Mã hiệu (IMO)"
                                    placeholder="VD: IMO9123456"
                                    value={newVessel.imoCode}
                                    onChange={(e) => setNewVessel({ ...newVessel, imoCode: e.target.value })}
                                    className="bg-white"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. CARGO & LANE */}
                <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-brand-soft text-brand flex items-center justify-center">
                            <Sparkles size={16} />
                        </div>
                        Hàng hóa & Luồng
                    </label>

                    <div className="grid grid-cols-12 gap-6">
                        {/* Left Column */}
                        <div className="col-span-12 md:col-span-4 space-y-4">
                            <Select
                                label="Mục đích"
                                value={direction}
                                onChange={(e) => {
                                    setDirection(e.target.value);
                                    setSelectedProductId('');
                                }}
                                options={[
                                    { value: 'NHAP', label: "Nhập hàng" },
                                    { value: 'XUAT', label: "Xuất hàng" }
                                ]}
                            />
                            <Select
                                label="Mặt hàng"
                                value={selectedProductId}
                                onChange={(e) => setSelectedProductId(e.target.value)}
                                options={[
                                    { value: '', label: "Chọn mặt hàng..." },
                                    ...(products
                                        ?.filter((p: Product) => {
                                            if (direction === 'NHAP') return p.type === 'IMPORT';
                                            if (direction === 'XUAT') return p.type === 'EXPORT';
                                            return true;
                                        })
                                        .map((p: Product) => {
                                            let unitDisplay = p.unit === 'TON' ? 'tấn' : p.unit;
                                            return { value: p.id, label: `${p.name} (${unitDisplay})` };
                                        }) || [])
                                ]}
                            />
                            <Input
                                label="ETA (Dự kiến đến)"
                                type="datetime-local"
                                value={eta}
                                onChange={(e) => setEta(e.target.value)}
                            />
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <Input
                                    label="Sản lượng"
                                    type="number"
                                    placeholder="0"
                                    value={totalVolume}
                                    onChange={(e) => setTotalVolume(Number(e.target.value))}
                                />
                                <Select
                                    label="Ưu tiên"
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    options={[
                                        { value: 'NORMAL', label: "Bình thường" },
                                        { value: 'EMERGENCY', label: "Khẩn cấp" }
                                    ]}
                                />
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="col-span-12 md:col-span-8 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/60 shadow-inner">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                        <TrendingUp size={16} className="text-brand" />
                                        Gợi ý luồng khai thác
                                    </label>
                                    <p className="text-[11px] text-slate-500 mt-0.5">AI đang tính toán luồng tối ưu dựa trên loại hàng và ETA</p>
                                </div>
                                {isLoadingSuggestions && (
                                    <span className="text-xs bg-brand-soft text-brand font-semibold px-3 py-1.5 rounded-full animate-pulse flex items-center gap-1.5 border border-brand/20">
                                        <Sparkles size={12} /> Đang phân tích...
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-col gap-3">
                                {laneSuggestions?.slice(0, 4).map((lane: any, index: number) => {
                                    const isRecommended = index === 0;
                                    const isSelected = selectedLaneId === lane.id;
                                    const waitHours = lane.estimatedWaitTime ? Math.round(lane.estimatedWaitTime / (1000 * 60 * 60)) : 0;

                                    return (
                                        <div
                                            key={lane.id}
                                            onClick={() => setSelectedLaneId(lane.id)}
                                            className={cn(
                                                "relative cursor-pointer p-3.5 rounded-xl border-2 transition-all duration-300 group flex items-center justify-between overflow-hidden",
                                                isSelected
                                                    ? "border-brand bg-brand-soft/20 ring-1 ring-brand/10 shadow-md shadow-brand/5"
                                                    : "border-slate-200 bg-white hover:border-brand/40 hover:shadow-sm"
                                            )}
                                        >
                                            {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand"></div>}

                                            <div className="flex items-center gap-3.5 pl-2">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base transition-colors shrink-0",
                                                    isSelected ? "bg-brand text-white shadow-sm" : "bg-slate-100 text-slate-600 group-hover:bg-brand-soft group-hover:text-brand"
                                                )}>
                                                    {lane.name.replace('Luồng ', 'L')}
                                                </div>

                                                <div className="flex flex-col justify-center">
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-bold text-slate-800 text-[15px]">{lane.name}</div>
                                                        {isRecommended && (
                                                            <span className="bg-emerald-500 text-white text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                                                                <Ship size={10} /> Gợi ý
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2 mt-1">
                                                        {lane.isFree ? (
                                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100/50">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                                Sẵn sàng
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100/50">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                                                Đang bận ({lane.activeCount} tàu)
                                                            </span>
                                                        )}
                                                        {lane.equipments?.length > 0 && (
                                                            <div className="flex items-center text-[10px] text-slate-400 font-medium">
                                                                <span className="w-1 h-1 rounded-full bg-slate-300 mx-1"></span>
                                                                {lane.equipments?.map((eq: any) => eq.name).join(', ')}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 text-right pr-1">
                                                <div className="hidden sm:block">
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Thời gian chờ</div>
                                                    {lane.isFree ? (
                                                        <div className="text-sm font-bold text-emerald-600">0 giờ (vào ngay)</div>
                                                    ) : (
                                                        <div className="text-sm font-bold text-amber-600 flex items-center justify-end gap-1">
                                                            <Clock size={14} /> ~{waitHours} giờ
                                                        </div>
                                                    )}
                                                </div>

                                                <div className={cn(
                                                    "w-6 h-6 rounded-full flex items-center justify-center transition-all shrink-0",
                                                    isSelected ? "bg-brand text-white shadow-md scale-110" : "bg-slate-100 text-slate-300 group-hover:bg-slate-200"
                                                )}>
                                                    <CheckCircle size={14} strokeWidth={isSelected ? 3 : 2} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {(!laneSuggestions || laneSuggestions.length === 0) && !isLoadingSuggestions && (
                                    <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center p-8 bg-white/50 border-2 border-dashed border-slate-200 rounded-xl text-center">
                                        <Anchor className="text-slate-300 mb-2" size={32} />
                                        <p className="text-sm font-semibold text-slate-600">Không có gợi ý</p>
                                        <p className="text-xs text-slate-400 mt-1 max-w-xs transition-all">Vui lòng chọn mặt hàng và ETA để nhận gợi ý luồng tối ưu</p>
                                    </div>
                                )}
                            </div>

                            {selectedLaneSuggestion && (
                                <div className="mt-4 p-3.5 bg-brand-soft/40 rounded-xl border border-brand/20 flex items-center gap-3 animate-in fade-in zoom-in-95">
                                    <div className="p-2 bg-white rounded-lg shadow-sm border border-brand/10 shrink-0">
                                        <Info size={18} className="text-brand" />
                                    </div>
                                    <div className="text-sm text-slate-700">
                                        Đăng ký vào <strong>{selectedLaneSuggestion.name}</strong>
                                        {selectedLaneSuggestion.isFree
                                            ? " đang trống. Chuyến tàu có thể cập bến ngay khi đến."
                                            : <span> đang có <strong className="text-brand bg-white px-2 py-0.5 rounded shadow-sm mx-1 border border-brand/10">#{selectedLaneSuggestion.activeCount + 1}</strong> tàu đang chờ. Thời gian chờ dự kiến khoảng <strong>{Math.round((selectedLaneSuggestion.estimatedWaitTime || 0) / 3600000)}</strong> giờ.</span>
                                        }
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 -mx-6 -mb-6 mt-6 border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                        disabled={createMutation.isPending || updateMutation.isPending}
                    >
                        Hủy
                    </button>
                    <Button
                        type="submit"
                        className="h-auto py-2.5 px-8 shadow-lg shadow-brand/20 rounded-xl font-bold transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
                        disabled={
                            createMutation.isPending ||
                            updateMutation.isPending ||
                            !selectedLaneId ||
                            !selectedProductId ||
                            (!isNewVessel && !selectedVesselId) ||
                            (isNewVessel && (!newVessel.code || !newVessel.name || !newVessel.customerName || !newVessel.capacity))
                        }
                    >
                        {(createMutation.isPending || updateMutation.isPending) ? "Đang xử lý..." : "Lưu thông tin"}
                        {!(createMutation.isPending || updateMutation.isPending) && <CheckCircle size={18} />}
                    </Button>
                </div>

            </form>
        </Modal>
    );
}
