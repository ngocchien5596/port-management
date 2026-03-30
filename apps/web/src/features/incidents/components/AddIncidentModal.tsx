'use client';

import React, { useState } from 'react';
import { Modal, Input, Button, Select } from '@/components/ui';
import { useCreateIncident } from '../hooks';
import { IncidentScope } from '../types';
import { useLanes, useVoyages } from '@/features/qltau/hooks';
import { useEquipment } from '@/features/config/hooks';
import { useUser } from '@/features/auth/hooks';
import { AlertTriangle, Clock, Info } from 'lucide-react';

interface AddIncidentModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialScope?: IncidentScope;
    initialVoyageId?: string;
}

export default function AddIncidentModal({ isOpen, onClose, initialScope = 'VOYAGE', initialVoyageId }: AddIncidentModalProps) {
    const { user } = useUser();
    const createMutation = useCreateIncident();
    const { data: lanes } = useLanes();
    const { data: voyages } = useVoyages();
    const { data: equipments } = useEquipment();

    const [scope, setScope] = useState<IncidentScope>(initialScope);
    const [type, setType] = useState('TECHNICAL');
    const [severity, setSeverity] = useState('RED');
    const [description, setDescription] = useState('');
    const [voyageId, setVoyageId] = useState(initialVoyageId || '');
    const [laneId, setLaneId] = useState('');
    const [equipmentId, setEquipmentId] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        await createMutation.mutateAsync({
            scope,
            type,
            severity,
            description,
            userId: user.id,
            voyageId: scope === 'VOYAGE' ? voyageId : undefined,
            laneId: scope === 'LANE' ? laneId : undefined,
            equipmentId: scope === 'EQUIPMENT' ? equipmentId : undefined
        });
        onClose();
        // Reset form
        setDescription('');
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="BÁO CÁO SỰ CỐ MỚI"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-widest">Phạm vi ảnh hưởng</label>
                        <select
                            value={scope}
                            onChange={(e) => setScope(e.target.value as IncidentScope)}
                            className="w-full h-10 px-4 bg-white border border-vtborder rounded-xl text-sm font-bold text-vttext-secondary focus:outline-none focus:ring-2 focus:ring-focus focus:border-brand appearance-none cursor-pointer transition-all"
                        >
                            <option value="GLOBAL">Toàn cảng</option>
                            <option value="VOYAGE">Chuyến tàu</option>
                            <option value="EQUIPMENT">Thiết bị, máy móc</option>
                            <option value="LANE">Luồng</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-widest">Mức độ nghiêm trọng</label>
                        <select
                            value={severity}
                            onChange={(e) => setSeverity(e.target.value)}
                            className="w-full h-10 px-4 bg-white border border-vtborder rounded-xl text-sm font-bold text-vttext-secondary focus:outline-none focus:ring-2 focus:ring-focus focus:border-brand appearance-none cursor-pointer transition-all"
                        >
                            <option value="RED">Nghiêm trọng / Dừng làm việc</option>
                        </select>
                    </div>
                </div>

                {scope === 'VOYAGE' && (
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-widest">Chọn Chuyến tàu</label>
                        <select
                            value={voyageId}
                            onChange={(e) => setVoyageId(e.target.value)}
                            required
                            className="w-full h-10 px-4 bg-white border border-vtborder rounded-xl text-sm font-bold text-vttext-secondary focus:outline-none focus:ring-2 focus:ring-focus focus:border-brand appearance-none cursor-pointer transition-all"
                        >
                            <option value="">-- Chọn chuyến tàu --</option>
                            {voyages?.map((v: any) => (
                                <option key={v.id} value={v.id}>{v.vessel?.name || v.vessel?.code} ({v.voyageCode})</option>
                            ))}
                        </select>
                    </div>
                )}

                {scope === 'LANE' && (
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-widest">Chọn Luồng</label>
                        <select
                            value={laneId}
                            onChange={(e) => setLaneId(e.target.value)}
                            required
                            className="w-full h-10 px-4 bg-white border border-vtborder rounded-xl text-sm font-bold text-vttext-secondary focus:outline-none focus:ring-2 focus:ring-focus focus:border-brand appearance-none cursor-pointer transition-all"
                        >
                            <option value="">-- Chọn luồng --</option>
                            {lanes?.map((l: any) => (
                                <option key={l.id} value={l.id}>{l.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {scope === 'EQUIPMENT' && (
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-widest">Chọn Thiết bị</label>
                        <select
                            value={equipmentId}
                            onChange={(e) => setEquipmentId(e.target.value)}
                            required
                            className="w-full h-10 px-4 bg-white border border-vtborder rounded-xl text-sm font-bold text-vttext-secondary focus:outline-none focus:ring-2 focus:ring-focus focus:border-brand appearance-none cursor-pointer transition-all"
                        >
                            <option value="">-- Chọn thiết bị --</option>
                            {equipments?.map((e: any) => (
                                <option key={e.id} value={e.id}>{e.name} ({e.code})</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-widest">Loại sự cố</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full h-10 px-4 bg-white border border-vtborder rounded-xl text-sm font-bold text-vttext-secondary focus:outline-none focus:ring-2 focus:ring-focus focus:border-brand appearance-none cursor-pointer transition-all"
                    >
                        <option value="TECHNICAL">Lỗi kỹ thuật (Hỏng máy móc, thiết bị...)</option>
                        <option value="WEATHER">Thời tiết xấu (Mưa lớn, dông bão...)</option>
                        <option value="OPERATIONAL">Lỗi vận hành (Thiếu xe, thiếu nhân sự...)</option>
                        <option value="EXTERNAL">Nguyên nhân khách quan (Từ tàu, hải quan...)</option>
                        <option value="OTHER">Nguyên nhân khác</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase ml-1 tracking-widest">Mô tả chi tiết</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-vtborder focus:outline-none focus:ring-2 focus:ring-focus focus:border-brand bg-white min-h-[100px] text-sm font-medium"
                        placeholder="Nhập mô tả chi tiết về sự cố đang xảy ra..."
                    />
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-3">
                    <Info className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        Lưu ý: Báo cáo này sẽ được gửi đến tất cả người điều phối. Nếu mức độ là <strong className="text-red-500 uppercase">ĐỎ</strong>, hệ thống sẽ tính thời gian dừng chờ cho các chuyến tàu bị ảnh hưởng.
                    </p>
                </div>

                <Button
                    type="submit"
                    size="lg"
                    className="w-full mt-4"
                    disabled={createMutation.isPending}
                >
                    {createMutation.isPending ? 'ĐANG GỬI BÁO CÁO...' : 'GỬI BÁO CÁO SỰ CỐ'}
                </Button>
            </form>
        </Modal>
    );
}
