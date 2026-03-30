'use client';
import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useVoyages, useLanes, useUpdateVoyageQueue } from '@/features/qltau/hooks';
import { safeDate, formatTime, formatDateTime, getServerDate } from '@/lib/utils/date';
import { Voyage, VoyageProgress } from '@/features/qltau/types';
import { Lane, Equipment } from '@/features/config/types';
import { useIncidents } from '@/features/incidents/hooks';
import { Incident } from '@/features/incidents/types';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils/cn';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import EmergencyOverrideModal from './EmergencyOverrideModal';

// --- HELPER COMPONENTS & FUNCTIONS ---

const Icon = ({ path, className = "w-5 h-5" }: { path: string, className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={path} />
    </svg>
);

const PATHS = {
    ship: "M2 21h20M2 17h20M5 17l1.5-4h11l1.5 4M9 13V9a2 2 0 012-2h2a2 2 0 012 2v4",
    crane: "M12 2v20M5 7l7-5 7 5M5 7v10h14V7M2 17h20",
    alert: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
    activity: "M22 12h-4l-3 9L9 3l-3 9H2",
    clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    check: "M20 6L9 17l-5-5",
    arrowRight: "M5 12h14M12 5l7 7-7 7",
    anchor: "M12 2v6M12 22v-3m-6.17-5a6.27 6.27 0 0012.34 0M2 12h20",
    package: "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
};

const mapStatus = (dbStatus: string) => {
    switch (dbStatus) {
        case 'LAM_HANG': return 'LOADING';
        case 'TAM_DUNG': return 'DELAY';
        case 'HOAN_THANH': return 'DEPARTED';
        case 'HUY_BO': return 'CANCELLED';
        case 'NHAP':
        case 'THU_TUC':
        case 'DO_MON_DAU_VAO':
        case 'LAY_MAU':
        case 'DO_MON_DAU_RA':
            return 'WAITING';
        default: return dbStatus;
    }
};

const getStatusStyles = (status: string) => {
    const uiStatus = mapStatus(status).toUpperCase();
    switch (uiStatus) {
        case 'LOADING': case 'ACTIVE': case 'NORMAL': case 'BUSY':
            return {
                bg: 'bg-emerald-500/10', text: 'text-emerald-700', border: 'border-emerald-500/20', dot: 'bg-emerald-500',
                solidBg: 'bg-emerald-600', solidText: 'text-white'
            };
        case 'WAITING': case 'IDLE': case 'WARNING':
            return {
                bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400',
                solidBg: 'bg-slate-500', solidText: 'text-white'
            };
        case 'DELAY': case 'ERROR': case 'MAINTENANCE': case 'REPAIR':
            return {
                bg: 'bg-red-500/10', text: 'text-red-700', border: 'border-red-500/20', dot: 'bg-red-500',
                solidBg: 'bg-red-600', solidText: 'text-white'
            };
        case 'DEPARTED':
            return {
                bg: 'bg-blue-500/10', text: 'text-blue-700', border: 'border-blue-500/20', dot: 'bg-blue-500',
                solidBg: 'bg-blue-600', solidText: 'text-white'
            };
        default:
            return {
                bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400',
                solidBg: 'bg-slate-500', solidText: 'text-white'
            };
    }
};

const STATUS_LABELS: Record<string, string> = {
    'LOADING': 'Làm hàng',
    'WAITING': 'Đang chờ',
    'DELAY': 'Chậm trễ',
    'DEPARTED': 'Đã rời bến',
    'ACTIVE': 'Hoạt động',
    'IDLE': 'Đang rảnh',
    'MAINTENANCE': 'Bảo trì',
    'ERROR': 'Lỗi',
    'NORMAL': 'Bình thường',
    'WARNING': 'Cảnh báo',
    'CANCELLED': 'Hủy bỏ',
    'REPAIR': 'Sửa chữa',
};

const getStatusLabel = (status: string) => {
    const uiStatus = mapStatus(status).toUpperCase();
    return STATUS_LABELS[uiStatus] || status;
};

// --- COMPONENT PORTDASHBOARD ---

export default function PortDashboardContent() {
    const router = useRouter();
    const { data: voyages, isLoading: isLoadingVoyages } = useVoyages();
    const { data: lanes, isLoading: isLoadingLanes } = useLanes();
    const updateQueueMutation = useUpdateVoyageQueue();

    const { data: activeIncidents, isLoading: isLoadingIncidents } = useIncidents({ active: true });

    // Local state for optimistic drag and drop
    const [localVoyages, setLocalVoyages] = React.useState<Voyage[]>([]);
    const [confirmQueueUpdate, setConfirmQueueUpdate] = React.useState<{
        updates: { id: string, queueNo: number }[],
        revertVoyages: Voyage[]
    } | null>(null);

    // State for Emergency Override 
    const [emergencyOverrideState, setEmergencyOverrideState] = React.useState<{
        currentVoyage: Voyage;
        emergencyVoyage: Voyage;
    } | null>(null);

    React.useEffect(() => {
        if (voyages) {
            setLocalVoyages(voyages);
        }
    }, [voyages]);

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const sourceIndex = result.source.index;
        const destinationIndex = result.destination.index;
        const laneId = result.source.droppableId;

        if (sourceIndex === destinationIndex && result.destination.droppableId === laneId) return;

        // Find voyages in this lane's queue
        const laneQueue = localVoyages
            .filter(v => v.laneId === laneId && !['HOAN_THANH', 'HUY_BO', 'LAM_HANG', 'TAM_DUNG'].includes(v.status))
            .sort((a, b) => (a.queueNo || 0) - (b.queueNo || 0));

        const [movedItem] = laneQueue.splice(sourceIndex, 1);
        laneQueue.splice(destinationIndex, 0, movedItem);

        // Calculate new queueNos
        const updates = laneQueue.map((v, index) => ({
            id: v.id,
            queueNo: index + 1
        }));

        // Optimistic update
        const updatedVoyages = localVoyages.map(v => {
            const update = updates.find(u => u.id === v.id);
            return update ? { ...v, queueNo: update.queueNo } : v;
        });

        // Save current state for reversion before optimistic update
        const revertState = [...localVoyages];
        setLocalVoyages(updatedVoyages);

        // Open confirmation modal
        setConfirmQueueUpdate({
            updates,
            revertVoyages: revertState
        });
    };

    // State for Side Panel (Quick View detail)
    const [selectedVoyageId, setSelectedVoyageId] = React.useState<string | null>(null);
    const [isAlertModalOpen, setIsAlertModalOpen] = React.useState(false);

    const kpis = useMemo(() => {
        if (!voyages) return null;
        const now = getServerDate();

        const vesselStats = { loading: 0, waiting: 0, delay: 0, departed: 0, delayedCount: 0 };
        const activeVoyages = voyages.filter((t: Voyage) => mapStatus(t.status) !== 'DEPARTED' && mapStatus(t.status) !== 'CANCELLED');

        activeVoyages.forEach((t: Voyage) => {
            const uiStatus = mapStatus(t.status).toLowerCase();
            if (uiStatus in vesselStats) {
                vesselStats[uiStatus as keyof typeof vesselStats]++;
            }

            // Check for delays > 2h
            if (uiStatus === 'waiting' && t.eta) {
                const arrivalDate = new Date(t.eta);
                if (now.getTime() - arrivalDate.getTime() > 120 * 60 * 1000) {
                    vesselStats.delayedCount++;
                }
            } else if (uiStatus === 'delay') {
                vesselStats.delayedCount++;
            }
        });

        const deviceStats = { busy: 0, total: 0, error: 0, alerts: [] as string[] };
        let activeLanesCount = 0;

        lanes?.forEach((lane: Lane) => {
            let laneActive = false;
            lane.equipments?.forEach((eq: any) => {
                deviceStats.total++;
                const status = (eq.status || 'IDLE').toUpperCase();
                if (status === 'BUSY') {
                    deviceStats.busy++;
                    laneActive = true;
                }
                else if (status === 'ERROR' || status === 'MAINTENANCE' || status === 'REPAIR') {
                    deviceStats.error++;
                    deviceStats.alerts.push(`Sự cố ${eq.name}`);
                }
            });
            if (laneActive || voyages.some((v: Voyage) => v.laneId === lane.id && mapStatus(v.status) === 'LOADING')) {
                activeLanesCount++;
            }
        });

        const totalPlan = activeVoyages.reduce((acc: number, t: Voyage) => acc + (Number(t.totalVolume) || 0), 0);
        const totalDone = activeVoyages.reduce((acc: number, t: Voyage) => {
            const latestCumulative = t.progress?.[0]?.cumulative || 0;
            return acc + Number(latestCumulative);
        }, 0);

        const throughputPercent = totalPlan > 0 ? Math.round((totalDone / totalPlan) * 100) : 0;

        // Compile Alerts Sidebar Data
        const sidebarAlerts: { type: string, severity: string, title: string, time: string }[] = [];

        // 1. Red Incidents
        if (activeIncidents) {
            activeIncidents.forEach((i: Incident) => {
                if (i.severity === 'RED' || i.severity === 'ORANGE') {
                    sidebarAlerts.push({
                        type: 'incident',
                        severity: i.severity,
                        title: i.description || "Sự cố hệ thống",
                        time: formatTime(i.startTime),
                    });
                }
            });
        }

        // 2. Equipment Errors
        if (deviceStats.alerts.length > 0) {
            deviceStats.alerts.forEach(msg => {
                sidebarAlerts.push({
                    type: 'equipment',
                    severity: 'RED',
                    title: msg,
                    time: 'Hiện tại',
                });
            });
        }

        // 3. Delayed Vessels
        activeVoyages.forEach((t: Voyage) => {
            if (mapStatus(t.status) === 'WAITING' && t.eta) {
                const arrivalDate = new Date(t.eta);
                const diffMs = now.getTime() - arrivalDate.getTime();
                if (diffMs > 120 * 60 * 1000) {
                    sidebarAlerts.push({
                        type: 'vessel',
                        severity: 'ORANGE',
                        title: `Tàu ${t.vessel?.name || t.voyageCode} trễ cập bến > 2h`,
                        time: formatTime(t.eta),
                    });
                }
            }
        });

        return {
            vesselStats,
            deviceStats,
            activeLanesCount,
            totalPlan,
            totalDone,
            throughputPercent,
            alerts: sidebarAlerts.sort((a, b) => a.severity === 'RED' ? -1 : 1)
        };
    }, [voyages, lanes, activeIncidents]);

    if (isLoadingVoyages || isLoadingLanes || isLoadingIncidents) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#00695C] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-black text-slate-400 uppercase tracking-widest text-[#00695C]">Đang tải dữ liệu...</span>
                </div>
            </div>
        );
    }

    const currentData = kpis || {
        vesselStats: { loading: 0, waiting: 0, delay: 0, departed: 0, delayedCount: 0 },
        deviceStats: { busy: 0, total: 0, error: 0, alerts: [] },
        activeLanesCount: 0,
        totalPlan: 0,
        totalDone: 0,
        throughputPercent: 0,
        alerts: [] as any[]
    };

    const currentTimeString = formatTime(getServerDate());
    const totalActiveVessels = currentData.vesselStats.loading + currentData.vesselStats.waiting + currentData.vesselStats.delay;

    return (
        <div className="flex flex-col w-full h-full min-h-screen bg-slate-50 p-6 space-y-6 font-sans">

            {/* (Dashboard Header removed to maximize space for KPI and Lanes) */}

            {/* ACTIONABLE KPI BAR */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-[#00695C] flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start text-slate-500">
                        <span className="font-medium text-slate-500">Tàu tại cảng</span>
                        <Icon path={PATHS.ship} className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex items-baseline gap-2 mt-1.5">
                        <span className="text-2xl font-black text-slate-900 tracking-tight">{totalActiveVessels}</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">{currentData.vesselStats.loading} Làm hàng</span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">{currentData.vesselStats.waiting} Đang chờ</span>
                    </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-slate-800 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start text-slate-500">
                        <span className="font-medium text-slate-500">Luồng</span>
                        <Icon path={PATHS.activity} className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex items-baseline gap-2 mt-1.5">
                        <span className="text-2xl font-black text-slate-900 tracking-tight">{currentData.activeLanesCount}</span>
                        <span className="text-xs font-semibold text-slate-400">/ {lanes?.length || 0}</span>
                    </div>
                    <span className="font-medium text-slate-500 mt-2 inline-block">Luồng</span>
                </div>

                <div
                    onClick={() => setIsAlertModalOpen(true)}
                    className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-slate-800 flex flex-col justify-between hover:shadow-md transition-all cursor-pointer group"
                >
                    <div className="flex justify-between items-start text-slate-500 group-hover:text-slate-800 transition-colors">
                        <span className="font-medium text-slate-500">Cần cẩu</span>
                        <Icon path={PATHS.crane} className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex items-baseline gap-2 mt-1.5">
                        <span className="text-2xl font-black text-slate-900 tracking-tight">{currentData.deviceStats.busy}</span>
                        <span className="font-medium text-slate-400">/ {currentData.deviceStats.total}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-2 gap-y-1 mt-2">
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{currentData.deviceStats.busy} Đang hoạt động</span>
                        <span className="text-[10px] font-bold text-red-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>{currentData.deviceStats.error} Lỗi</span>
                    </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm border-t-4 border-t-[#00695C] flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start text-slate-500">
                        <span className="font-medium text-slate-500">Sản lượng</span>
                        <Icon path={PATHS.package} className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex items-baseline gap-2 mt-1.5">
                        <span className="text-2xl font-black text-slate-900 tracking-tight">{currentData.throughputPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
                        <div className="bg-[#00695C] h-full rounded-full transition-all duration-1000" style={{ width: `${currentData.throughputPercent}%` }} />
                    </div>
                    <span className="text-xs font-medium">
                        <span>{currentData.totalDone.toLocaleString()}  / </span>
                        <span>{currentData.totalPlan.toLocaleString()} tấn</span>
                    </span>
                </div>
            </div>

            {/* MAIN AREA - FULL WIDTH KANBAN */}
            <div className="flex-1 min-h-0 overflow-hidden w-full">
                <DragDropContext onDragEnd={handleDragEnd}>
                    <div className="w-full flex flex-row gap-6 overflow-x-auto overflow-y-hidden custom-scrollbar pb-4 min-h-[600px] h-full items-stretch">
                        {lanes?.map((lane: Lane) => {
                            const laneCranes = lane.equipments || [];
                            const laneTrips = localVoyages.filter((v: Voyage) => v.laneId === lane.id && !['HOAN_THANH', 'HUY_BO'].includes(v.status));
                            const servingTrips = laneTrips.filter(v => ['LAM_HANG', 'TAM_DUNG'].includes(v.status));
                            const queueTrips = laneTrips.filter(v => !['LAM_HANG', 'TAM_DUNG'].includes(v.status)).sort((a, b) => (a.queueNo || 0) - (b.queueNo || 0));
                            const laneStatus = servingTrips.length > 0 ? 'NORMAL' : 'IDLE';

                            const renderTripCard = (trip: Voyage, isQueue: boolean, queueIndex: number) => {
                                const tStyles = getStatusStyles(trip.status);
                                const totalDone = Number(trip.progress?.[0]?.cumulative || 0);
                                const volume = Number(trip.totalVolume) || 1;
                                const progress = Math.min(100, Math.round((totalDone / volume) * 100));

                                // Handle Delay Logic
                                let isWarning = false;
                                if (mapStatus(trip.status) === 'WAITING' && trip.eta) {
                                    const diffMs = getServerDate().getTime() - new Date(trip.eta).getTime();
                                    isWarning = diffMs > 120 * 60 * 1000;
                                }

                                const emergencyTripWaiting = queueTrips.find(v => v.priority === 'EMERGENCY');
                                const isHandlingAndEmergencyWaiting = !isQueue && mapStatus(trip.status) === 'LOADING' && !!emergencyTripWaiting;

                                return (
                                    <div
                                        key={trip.id}
                                        onClick={() => setSelectedVoyageId(trip.id)}
                                        className={`w-full bg-white rounded-lg border shadow-sm hover:shadow-md hover:border-[#00695C] cursor-pointer transition-all relative overflow-hidden group shrink-0 ${isWarning ? 'border-red-300 bg-red-50/30' : 'border-slate-200'} ${isHandlingAndEmergencyWaiting ? 'pt-8 pb-3 px-3' : 'p-3'}`}
                                    >
                                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isWarning ? 'bg-red-500' : tStyles.solidBg} transition-colors group-hover:w-2 ${isHandlingAndEmergencyWaiting ? 'z-20' : ''}`}></div>

                                        {isHandlingAndEmergencyWaiting && (
                                            <div className="absolute top-0 right-0 left-0 bg-red-600 text-white text-[10px] font-bold text-center py-1.5 tracking-widest z-10 flex items-center justify-center gap-1.5 hover:bg-red-700 hover:cursor-pointer transition-colors shadow-sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEmergencyOverrideState({
                                                        currentVoyage: trip,
                                                        emergencyVoyage: emergencyTripWaiting!,
                                                    });
                                                }}
                                            >
                                                <Icon path={PATHS.alert} className="w-3.5 h-3.5" />
                                                KHẨN CẤP
                                            </div>
                                        )}

                                        <div className="flex justify-between items-start mb-2 pl-2">
                                            <div className="flex items-start gap-2 max-w-[72%]">
                                                {isQueue && (
                                                    <div className="shrink-0 bg-slate-100 border border-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded text-xs mt-0.5">
                                                        #{queueIndex}
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="text-[15px] font-black text-slate-900 group-hover:text-[#00695C] transition-colors uppercase leading-tight tracking-tight truncate" title={`${trip.voyageCode}${trip.vessel?.code ? ` - ${trip.vessel.code}` : ''}`}>
                                                        {trip.voyageCode}{trip.vessel?.code ? ` - ${trip.vessel.code}` : ''}
                                                    </h4>
                                                    <p className="text-[11px] font-medium text-slate-500 mt-0.5 truncate" title={trip.product?.name || 'Chưa rõ hàng hóa'}>{trip.product?.name || 'Chưa rõ hàng hóa'}</p>
                                                </div>
                                            </div>
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap font-medium border ${tStyles.bg} ${tStyles.text} ${tStyles.border}`}>
                                                {getStatusLabel(trip.status)}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mb-3 bg-slate-50 p-1.5 rounded-md border border-slate-100 pl-3">
                                            <div>
                                                <p className="text-[10px] font-medium text-slate-400 mb-0.5">ETA</p>
                                                <p className={`text-[11px] font-semibold font-mono ${isWarning ? 'text-red-600' : 'text-slate-700'}`}>
                                                    {trip.eta ? formatDateTime(trip.eta) : '---'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-medium text-slate-400 mb-0.5">ETD</p>
                                                <p className="text-[11px] font-semibold text-slate-700 font-mono">
                                                    {trip.etd ? formatDateTime(trip.etd) : '---'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="pl-2">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <span className="text-[10px] font-medium text-slate-400">Tiến độ</span>
                                                <span className="text-[11px] font-semibold font-mono text-slate-700">
                                                    <span className="text-[#00695C]">{totalDone.toLocaleString()}</span> / {volume.toLocaleString()}T
                                                </span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                <div className="bg-[#00695C] h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            };

                            return (
                                <div key={lane.id} className="w-80 shrink-0 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden relative group h-full max-h-full">

                                    {/* LANE HEADER: Compact Top Header */}
                                    <div className="w-full shrink-0 bg-[#00695C] text-white px-3 py-2.5 flex flex-col gap-2 border-b border-[#004D40]">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-1.5">
                                                <h3 className="font-semibold text-white">{lane.name}</h3>
                                                <span className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${laneStatus === 'NORMAL' ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-500/30' : 'bg-white/10 text-slate-300 border border-white/20'}`}>
                                                    {getStatusLabel(laneStatus)}
                                                </span>
                                            </div>
                                        </div>

                                        {laneCranes.length > 0 && (
                                            <div className={`flex ${laneCranes.length === 1 ? 'justify-center' : laneCranes.length === 2 ? 'justify-between' : 'flex-wrap gap-1.5'}`}>
                                                {laneCranes.map((crane: any) => {
                                                    let cw = 'bg-slate-400';
                                                    switch (crane.status) {
                                                        case 'IDLE': cw = 'bg-slate-400'; break;
                                                        case 'BUSY': cw = 'bg-emerald-500'; break;
                                                        case 'MAINTENANCE':
                                                        case 'REPAIR':
                                                        case 'ERROR': cw = 'bg-red-500'; break;
                                                    }
                                                    return (
                                                        <div key={crane.id} className="flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded border border-white/10" title={getStatusLabel(crane.status)}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${cw}`}></span>
                                                            <span className="text-[10px] font-bold font-mono">{crane.name.replace('STS-', '')}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    {/* LANE CONTENT: Vertical List */}
                                    <div className="flex-1 p-3 bg-slate-50/50 flex flex-col gap-3 overflow-y-auto custom-scrollbar items-start">
                                        {laneTrips.length === 0 ? (
                                            <div className="w-full flex-1 flex flex-col items-center justify-center p-6 rounded-lg text-slate-400">
                                                <Icon path={PATHS.anchor} className="w-8 h-8 opacity-20 mb-2" />
                                                <span className="font-semibold text-slate-500">Chưa có tàu</span>
                                                <span className="text-[10px] font-medium mt-1">Sẵn sàng tiếp nhận</span>
                                            </div>
                                        ) : (
                                            <div className="w-full flex flex-col gap-4">
                                                {/* SERVING SECTION */}
                                                {servingTrips.length > 0 && (
                                                    <div className="w-full">
                                                        <h4 className="text-[11px] font-black text-emerald-700 uppercase tracking-widest mb-2 pl-2 border-l-2 border-emerald-500 pb-0.5">Đang làm hàng</h4>
                                                        <div className="flex flex-col gap-2">
                                                            {servingTrips.map((trip: Voyage) => renderTripCard(trip, false, 0))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* QUEUE SECTION */}
                                                <div className="w-full flex-1">
                                                    <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 pl-2 border-l-2 border-slate-300 pb-0.5 mt-2">Hàng đợi ({queueTrips.length})</h4>
                                                    <Droppable droppableId={lane.id}>
                                                        {(provided: any) => (
                                                            <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col gap-2 min-h-[100px]">
                                                                {queueTrips.map((trip: Voyage, index: number) => (
                                                                    <Draggable key={trip.id} draggableId={trip.id} index={index}>
                                                                        {(provided: any, snapshot: any) => (
                                                                            <div
                                                                                ref={provided.innerRef}
                                                                                {...provided.draggableProps}
                                                                                {...provided.dragHandleProps}
                                                                                style={
                                                                                    snapshot.isDragging
                                                                                        ? { ...provided.draggableProps.style, filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.15))', zIndex: 50, opacity: 0.9 }
                                                                                        : provided.draggableProps.style
                                                                                }
                                                                            >
                                                                                {renderTripCard(trip, true, index + 1)}
                                                                            </div>
                                                                        )}
                                                                    </Draggable>
                                                                ))}
                                                                {provided.placeholder}
                                                            </div>
                                                        )}
                                                    </Droppable>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </DragDropContext>
            </div>

            {/* VOYAGE QUICK VIEW SIDE PANEL */}
            {selectedVoyageId && (
                <>
                    <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity" onClick={() => setSelectedVoyageId(null)} />
                    <div className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-white shadow-2xl z-50 transform transition-transform duration-300 translate-x-0 border-l border-slate-200 flex flex-col h-screen max-h-screen">
                        {/* Side Panel Header */}
                        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50 shrink-0">
                            <h2 className="text-lg font-semibold text-slate-800 tracking-tight">Xem nhanh</h2>
                            <button onClick={() => setSelectedVoyageId(null)} className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                            </button>
                        </div>
                        {/* Side Panel Content */}
                        <div className="flex-1 overflow-y-auto p-6 min-h-0 bg-white relative overscroll-contain pb-10">
                            {(() => {
                                const trip = voyages?.find((v: Voyage) => v.id === selectedVoyageId);
                                if (!trip) return null;
                                const tStyles = getStatusStyles(trip.status);
                                const totalDone = Number(trip.progress?.[0]?.cumulative || 0);
                                const volume = Number(trip.totalVolume) || 1;
                                const progress = Math.min(100, Math.round((totalDone / volume) * 100));

                                return (
                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <h3 className="text-2xl font-bold text-slate-900 leading-none">{trip.voyageCode}{trip.vessel?.code ? ` - ${trip.vessel.code}` : ''}</h3>
                                                <span className={`px-2 py-1 rounded text-[11px] font-medium border ${tStyles.bg} ${tStyles.text} ${tStyles.border}`}>
                                                {getStatusLabel(trip.status)}
                                            </span>
                                            </div>

                                            <button
                                                onClick={() => router.push(`/voyages/${trip.id}`)}
                                                className="w-full bg-[#00695C] hover:bg-teal-800 text-white font-semibold py-2.5 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 mb-4"
                                            >
                                                Xem chi tiết
                                                <Icon path={PATHS.arrowRight} className="w-3.5 h-3.5" />
                                            </button>

                                            {trip.product?.name && (
                                                <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                                    <span className="font-medium text-slate-500">Loại hàng</span>
                                                    <span className="font-semibold text-slate-900">{trip.product.name}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex flex-col items-center text-center">
                                                <p className="font-medium text-slate-400 mb-1">ETA</p>
                                                <p className="font-semibold text-slate-700 font-mono mt-auto">{trip.eta ? formatDateTime(trip.eta) : 'Chưa có'}</p>
                                            </div>
                                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex flex-col items-center text-center">
                                                <p className="font-medium text-slate-400 mb-1 leading-[1.1]">ETD<br /><span className="text-[11px] opacity-70">(Lý thuyết)</span></p>
                                                <p className="font-semibold text-slate-700 font-mono mt-auto">{(trip as any).theoreticalEtd ? formatDateTime((trip as any).theoreticalEtd) : '---'}</p>
                                            </div>
                                            <div className="relative group p-3 bg-slate-50 hover:bg-white rounded-lg border border-slate-100 hover:border-[#00695C] transition-all flex flex-col items-center text-center cursor-help">
                                                <div className="absolute bottom-full mb-2 right-[-20px] w-[320px] p-3 bg-white rounded-lg border border-slate-200 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none translate-y-2 group-hover:translate-y-0 text-left">
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between items-center">
                                                            <p className="font-bold text-xs text-slate-800">ETD Thực tế</p>
                                                            <div className="w-1.5 h-1.5 rounded-full bg-[#00695C] animate-pulse"></div>
                                                        </div>
                                                        <p className="text-[10px] text-slate-500 leading-relaxed">
                                                            Thời gian rời bến được tính toán liên tục dựa trên <strong className="text-slate-700">Công suất TB thực tế của thiết bị</strong> và thời gian xảy ra <strong className="text-slate-700">Sự cố</strong>.
                                                        </p>
                                                        <div className="bg-slate-50 p-2 rounded text-[10px] font-mono text-slate-600 border border-slate-100 leading-relaxed">
                                                            <span className="text-slate-400">// Công thức</span><br />
                                                            <span>+ Thời gian kết thúc của bản ghi sản lượng mới nhất</span><br />
                                                            <span>+ (Sản lượng còn lại / Công suất TB thực tế của thiết bị)</span><br />
                                                            <span>+ Tổng Thời gian Downtime Sự cố</span><br />
                                                            <span>+ Thời gian thủ tục</span>
                                                        </div>
                                                    </div>
                                                    <div className="absolute -bottom-1.5 right-[50px] w-3 h-3 bg-white border-b border-r border-slate-200 rotate-45"></div>
                                                </div>
                                                <p className="text-[10px] text-slate-400 group-hover:text-[#00695C] uppercase font-black tracking-widest mb-1 leading-[1.1] transition-colors">
                                                    ETD<br /><span className="text-[8px] opacity-70 group-hover:opacity-100">(Thực tế)</span>
                                                </p>
                                                <p className="text-xs font-bold text-slate-700 group-hover:text-emerald-700 font-mono mt-auto transition-colors">
                                                    {trip.etd ? formatDateTime(trip.etd) : '---'}
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-baseline mb-2">
                                                <span className="font-medium text-slate-500">Sản lượng</span>
                                                <span className="text-sm font-bold font-mono text-slate-900">
                                                    <span className="text-[#00695C]">{totalDone.toLocaleString()}</span> / {volume.toLocaleString()} tấn
                                                </span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                                <div className="bg-[#00695C] h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
                                            </div>
                                        </div>

                                        {/* Delay Warning if applicable */}
                                        {(() => {
                                            if (mapStatus(trip.status) === 'WAITING' && trip.eta) {
                                                const diffMs = getServerDate().getTime() - new Date(trip.eta).getTime();
                                                if (diffMs > 120 * 60 * 1000) {
                                                    return (
                                                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-3 items-start">
                                                            <Icon path={PATHS.alert} className="w-5 h-5 text-red-600 mt-0.5" />
                                                            <div>
                                                                <h4 className="font-semibold text-red-800 mb-0.5">Cảnh báo trễ bến</h4>
                                                                <p className="text-sm font-medium text-red-700">Tàu đã trễ hơn 2 giờ so với thời gian dự kiến cập bến.</p>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            }
                                            return null;
                                        })()}

                                        {(trip as any).events && (trip as any).events.length > 0 && (
                                            <div className="mt-2 text-left">
                                                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-100 pb-2">Lịch sử vận hành</h4>
                                                <div className="space-y-2">
                                                    {(trip as any).events.map((event: any) => (
                                                        <div key={event.id} className="flex gap-2.5 text-sm">
                                                            <div className="w-14 shrink-0 text-slate-400 font-mono text-[9px] flex flex-col pt-0.5">
                                                                <span className="font-bold">{formatDateTime(event.createdAt).split(' ')[1]}</span>
                                                                <span>{formatDateTime(event.createdAt).split(' ')[0]}</span>
                                                            </div>
                                                            <div className="flex-1 bg-slate-50 px-2 py-1.5 rounded border border-slate-100">
                                                                <div className="font-bold text-slate-700 text-[11px] mb-0.5">{event.title}</div>
                                                                <div className="text-slate-500 text-[10px] leading-snug">{event.description}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </>
            )}

            {/* Emergency Override Modal */}
            {emergencyOverrideState && (
                <EmergencyOverrideModal
                    currentVoyage={emergencyOverrideState.currentVoyage}
                    emergencyVoyage={emergencyOverrideState.emergencyVoyage}
                    onClose={() => setEmergencyOverrideState(null)}
                />
            )}

            {/* Queue Reorder Confirmation Modal */}
            {confirmQueueUpdate && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <div className="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center mb-4">
                                <Icon path={PATHS.package} className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Xác nhận thay đổi</h3>
                            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                                Bạn có chắc chắn muốn thay đổi thứ tự hàng đợi của tàu này?
                            </p>
                            <div className="flex gap-3">
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1 rounded-xl h-11"
                                    onClick={() => {
                                        setLocalVoyages(confirmQueueUpdate.revertVoyages);
                                        setConfirmQueueUpdate(null);
                                    }}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    className="flex-1 rounded-xl h-11 bg-brand hover:bg-brand-hover text-white flex items-center justify-center gap-2"
                                    disabled={updateQueueMutation.isPending}
                                    onClick={() => {
                                        const toastId = toast.loading('Đang cập nhật...');
                                        updateQueueMutation.mutate(confirmQueueUpdate.updates, {
                                            onSuccess: () => {
                                                toast.success('Cập nhật thành công', { id: toastId });
                                                setConfirmQueueUpdate(null);
                                            },
                                            onError: () => {
                                                toast.error('Cập nhật thất bại', { id: toastId });
                                                setLocalVoyages(confirmQueueUpdate.revertVoyages);
                                                setConfirmQueueUpdate(null);
                                            }
                                        });
                                    }}
                                >
                                    {updateQueueMutation.isPending ? 'Đang cập nhật...' : 'Xác nhận'}
                                </Button>
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* ALERTS MODAL */}
            {isAlertModalOpen && (
                <>
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity" onClick={() => setIsAlertModalOpen(false)} />
                    <div className="fixed inset-0 m-auto w-[90%] md:w-[500px] h-fit max-h-[80vh] bg-white rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-2">
                                <Icon path={PATHS.alert} className={`w-5 h-5 ${currentData.alerts.length > 0 ? 'text-red-600 animate-pulse' : 'text-slate-400'}`} />
                                <h3 className="text-base font-black uppercase tracking-tight text-slate-800">Clog & Alerts System</h3>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">{currentData.alerts.length}</span>
                                <button onClick={() => setIsAlertModalOpen(false)} className="p-1 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 bg-slate-50/50">
                            {currentData.alerts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-10 text-center text-slate-400">
                                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                                        <Icon path={PATHS.check} className="w-8 h-8 text-emerald-500" />
                                    </div>
                                    <span className="text-sm font-black uppercase tracking-widest text-slate-700">Hệ thống ổn định</span>
                                    <span className="text-xs mt-1">Không có cảnh báo trễ hạn hay sự cố nào.</span>
                                </div>
                            ) : (
                                currentData.alerts.map((alert, idx) => {
                                    const isRed = alert.severity === 'RED';
                                    return (
                                        <div key={idx} className={`p-4 rounded-xl border ${isRed ? 'bg-red-50 border-red-500/30' : 'bg-orange-50 border-orange-400/30'} shadow-sm`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${isRed ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${isRed ? 'bg-red-500' : 'bg-orange-500'}`}></span>
                                                    {alert.type === 'incident' ? 'Sự cố' : alert.type === 'equipment' ? 'Thiết bị' : 'Tàu trễ'}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-500 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">{alert.time}</span>
                                            </div>
                                            <p className="text-sm font-bold text-slate-800 leading-snug">{alert.title}</p>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        {currentData.alerts.length > 0 && (
                            <div className="p-4 border-t border-slate-100 bg-white">
                                <button
                                    onClick={() => router.push('/incidents')}
                                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-lg transition-colors text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                                >
                                    Xem toàn bộ quản lý sự cố
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}} />
        </div>
    );
}
