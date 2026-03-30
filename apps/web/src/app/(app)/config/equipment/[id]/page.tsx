'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEquipmentDetail, useEquipmentHistory } from '@/features/config/hooks';
import { ArrowLeft, Loader2, AlertTriangle, Ship, Map, Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui';
import EquipmentStatusModal from '../EquipmentStatusModal';
import toast from 'react-hot-toast';

import { EquipmentCoreInfo } from './(components)/EquipmentCoreInfo';
import { EquipmentKpiCards } from './(components)/EquipmentKpiCards';
import { EquipmentPerformanceChart } from './(components)/EquipmentPerformanceChart';
import { EquipmentHistoryTimeline } from './(components)/EquipmentHistoryTimeline';
import { EquipmentIncidentLogSection } from './(components)/EquipmentIncidentLogSection';
import { useEquipmentKpi } from '@/features/config/hooks';

export default function EquipmentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const equipmentId = params.id as string;

    const { data: equipment, isLoading: isLoadingEq } = useEquipmentDetail(equipmentId);
    const { data: history, isLoading: isLoadingHist } = useEquipmentHistory(equipmentId);
    const { data: kpiData, isLoading: isLoadingKpi } = useEquipmentKpi(equipmentId);

    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

    if (isLoadingEq || isLoadingHist) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-brand mb-4" />
                <p className="text-slate-500 font-bold animate-pulse">Đang tải thông tin thiết bị...</p>
            </div>
        );
    }

    if (!equipment) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
                <p className="text-slate-500 font-bold">Không tìm thấy thiết bị.</p>
                <button
                    onClick={() => router.push('/config/equipment')}
                    className="mt-4 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors font-bold text-sm"
                >
                    Quay lại danh sách
                </button>
            </div>
        );
    }

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'BUSY':
                return { bg: 'bg-brand-soft/50', text: 'text-brand', border: 'border-brand-soft', label: 'LÀM HÀNG' };
            case 'IDLE':
                return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', label: 'TRỐNG CẢNG' };
            case 'MAINTENANCE':
            case 'REPAIR':
                return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', label: 'SỬA CHỮA' };
            default:
                return { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-100', label: 'KHÔNG XÁC ĐỊNH' };
        }
    };

    const statusStyles = getStatusStyles(equipment.status);

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500 max-w-7xl mx-auto w-full pb-8">
            {/* Header & Back Button */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/config/equipment')}
                        className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-brand hover:border-brand/30 hover:bg-brand-soft/20 transition-all shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 font-heading tracking-tight flex items-center gap-3">
                            {equipment.name}
                            <span className={cn(
                                "text-[10px] px-2.5 py-1 rounded-full border shadow-sm font-bold tracking-widest uppercase",
                                statusStyles.bg, statusStyles.text, statusStyles.border
                            )}>
                                {statusStyles.label}
                            </span>
                        </h1>
                        <p className="text-slate-500 text-sm font-medium">Chi tiết Công suất và cấu hình thiết bị</p>
                    </div>
                </div>

                <Button
                    variant="default"
                    onClick={() => setIsStatusModalOpen(true)}
                    className="font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm h-10 px-5"
                >
                    Chuyển Trạng Thái
                </Button>
            </div>

            {/* Main Content Layout 8/4 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">

                {/* Main Area (8 columns) */}
                <div className="lg:col-span-8 flex flex-col">
                    <EquipmentCoreInfo equipment={equipment} />

                    <EquipmentKpiCards data={kpiData} isLoading={isLoadingKpi} />

                    <EquipmentPerformanceChart dailyHistory={kpiData?.dailyHistory} isLoading={isLoadingKpi} />

                    <EquipmentIncidentLogSection equipmentId={equipmentId} />
                </div>

                {/* Sidebar Area (4 columns) */}
                <div className="lg:col-span-4 max-h-[1000px] h-[calc(100vh-180px)] sticky top-24">
                    <EquipmentHistoryTimeline history={history} isLoading={isLoadingHist} />
                </div>
            </div>

            <EquipmentStatusModal
                equipment={equipment}
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
            />
        </div>
    );
}
