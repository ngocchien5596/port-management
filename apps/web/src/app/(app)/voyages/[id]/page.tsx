'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useVoyage } from '@/features/qltau/hooks';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Ship, Calendar, Anchor, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { safeDate, formatDateTime } from '@/lib/utils/date';
import { VoyageCoreInfo } from './(components)/VoyageCoreInfo';
import { VoyagePerformanceChart } from './(components)/VoyagePerformanceChart';
import { StatusHistoryTimeline } from './(components)/StatusHistoryTimeline';
import { CargoProgressLogTable } from './(components)/CargoProgressLogTable';
import IncidentLogSection from './(components)/IncidentLogSection';
import StatusTransitionModal from '../StatusTransitionModal';
import QRCodeModal from '@/components/voyage/QRCodeModal';
import { VoyageAlertBanner } from './(components)/VoyageAlertBanner';
import { useActiveIncidentsForVoyage } from '@/features/incidents/hooks';
import { cn } from '@/lib/utils/cn';
import { Incident } from '@/features/incidents/types';
import { QrCode } from 'lucide-react';

export default function VoyageDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false);

    const { data: voyage, isLoading, error } = useVoyage(id);
    const { data: activeIncidents } = useActiveIncidentsForVoyage(id);

    const globalOrLaneIncidents = activeIncidents?.filter((i: Incident) => i.scope === 'GLOBAL' || i.scope === 'LANE') || [];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-8 h-8 text-brand animate-spin" />
                <p className="text-slate-500 font-medium text-sm font-body">Đang tải thông tin chuyến tàu...</p>
            </div>
        );
    }

    if (error || !voyage) {
        return (
            <div className="p-8 text-center">
                <div className="bg-red-50 text-red-600 p-4 rounded-lg inline-block border border-red-100 font-body">
                    Chuyến tàu không tồn tại hoặc đã bị xóa.
                </div>
                <div className="mt-4">
                    <Button variant="outline" onClick={() => router.push('/voyages')} className="font-body">
                        <ArrowLeft className="mr-2 w-4 h-4" /> Quay lại danh sách
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10 px-4 md:px-6 w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest font-heading mb-1">
                        <Button variant="ghost" size="sm" onClick={() => router.push('/voyages')} className="h-6 p-0 px-2 -ml-2 hover:bg-slate-100 text-[10px]">
                            <ArrowLeft size={12} className="mr-1" /> Danh sách
                        </Button>
                        <span>/</span>
                        <span className="text-slate-600">Chi tiết chuyến tàu</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-brand-soft text-brand rounded-2xl shadow-sm shadow-brand/5">
                            <Ship size={28} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight font-heading leading-tight uppercase">
                                Mã chuyến: {voyage.voyageCode} <span className="text-slate-300 mx-2">|</span> {voyage.vessel?.code || 'N/A'}
                            </h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black tracking-widest uppercase border ${voyage.status === 'NHAP' ? 'bg-slate-50 text-slate-500 border-slate-200' :
                                    voyage.status === 'THU_TUC' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                        voyage.status === 'DO_MON_DAU_VAO' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                            voyage.status === 'LAY_MAU' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                voyage.status === 'LAM_HANG' ? 'bg-brand-soft text-brand border-brand/10' :
                                                    voyage.status === 'DO_MON_DAU_RA' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                        voyage.status === 'HOAN_THANH' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                            voyage.status === 'TAM_DUNG' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                                                                voyage.status === 'HUY_BO' ? 'bg-red-50 text-red-600 border-red-100' :
                                                                    'bg-gray-50 text-gray-700 border-gray-200'
                                    }`}>
                                    {
                                        voyage.status === 'NHAP' ? 'Nháp' :
                                            voyage.status === 'THU_TUC' ? 'Làm thủ tục' :
                                                voyage.status === 'DO_MON_DAU_VAO' ? 'Đo mớn đầu vào' :
                                                    voyage.status === 'LAY_MAU' ? 'Lấy mẫu' :
                                                        voyage.status === 'LAM_HANG' ? 'Làm hàng' :
                                                            voyage.status === 'DO_MON_DAU_RA' ? 'Đo mớn đầu ra' :
                                                                voyage.status === 'HOAN_THANH' ? 'Hoàn thành' :
                                                                    voyage.status === 'TAM_DUNG' ? 'Tạm dừng' :
                                                                        voyage.status === 'HUY_BO' ? 'Hủy bỏ' :
                                                                            voyage.status
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setIsQRCodeModalOpen(true)}
                        className="border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl px-4 h-10 font-bold text-sm tracking-tight flex items-center gap-2 group transition-all"
                    >
                        <QrCode size={16} className="group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                        Mã QR Tra cứu
                    </Button>
                    {voyage.status !== 'HOAN_THANH' && (
                        <Button
                            onClick={() => setIsStatusModalOpen(true)}
                            className="bg-brand hover:bg-brand-hover text-white shadow-sm shadow-brand/20 rounded-xl px-4 h-10 font-bold text-sm tracking-tight flex items-center gap-2 group transition-all"
                        >
                            <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" strokeWidth={2.5} />
                            Chuyển trạng thái
                        </Button>
                    )}
                </div>
            </div>

            <QRCodeModal
                isOpen={isQRCodeModalOpen}
                onClose={() => setIsQRCodeModalOpen(false)}
                voyage={voyage}
            />

            {/* Global/Lane Warnings */}
            {globalOrLaneIncidents.length > 0 && (
                <div className="space-y-4 mb-4">
                    {globalOrLaneIncidents.map((i: Incident) => (
                        <div key={i.id} className={cn(
                            "p-5 rounded-3xl border flex gap-4 animate-in slide-in-from-top-4 duration-500 shadow-sm",
                            i.severity === 'RED' ? "bg-red-50 border-red-100 text-red-900" : "bg-amber-50 border-amber-100 text-amber-900"
                        )}>
                            <AlertCircle className={cn("shrink-0", i.severity === 'RED' ? "text-red-500" : "text-amber-500")} size={22} />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-white/60 px-2.5 py-1 rounded-lg border border-white/40 font-heading">
                                        CẢNH BÁO {i.scope === 'GLOBAL' ? 'TOÀN CẢNG' : 'LUỒNG'}
                                    </span>
                                    <span className="text-[10px] font-black opacity-40 uppercase tracking-widest font-heading">• {i.type}</span>
                                </div>
                                <p className="text-sm font-bold font-body leading-tight">"{i.description}"</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Voyage-Specific Alerts (Low Productivity, Checklist Errors, etc) */}
            <VoyageAlertBanner voyageId={voyage.id} />

            {/* Layout Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Main Column (8/12) */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Core Info (Compacted) */}
                    <VoyageCoreInfo voyage={voyage} />

                    {/* Deviation Analysis & Performance Chart */}
                    {['LAM_HANG', 'DO_MON_DAU_RA', 'HOAN_THANH'].includes(voyage.status) && (
                        <div className="space-y-6">
                            <VoyagePerformanceChart voyage={voyage as any} />
                        </div>
                    )}

                    {/* Progress table */}
                    <CargoProgressLogTable
                        voyageId={voyage.id}
                        progress={voyage.progress || []}
                        events={voyage.events || []}
                        status={voyage.status}
                        totalVolume={voyage.totalVolume}
                        unit={voyage.product?.unit === 'TON' ? 'tấn' : (voyage.product?.unit || 'tấn')}
                    />

                    {/* Incident logs moved here */}
                    <IncidentLogSection voyageId={voyage.id} isReadOnly={voyage.status === 'HOAN_THANH'} />
                </div>

                {/* Sidebar Column (4/12) */}
                <div className="lg:col-span-4">
                    {/* History timeline pushed up to match Core Info top alignment */}
                    <StatusHistoryTimeline events={voyage.events || []} />
                </div>
            </div>

            <StatusTransitionModal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                voyage={voyage}
            />
        </div>
    );
}
