import React from 'react';
import { Check, Clock, AlertCircle } from 'lucide-react';
import { VOYAGE_STATUS_CONFIG } from '@/constants/voyage';
import { cn } from '@/lib/utils/cn';

const STEPS = [
    { id: 'THU_TUC', label: VOYAGE_STATUS_CONFIG.THU_TUC.label, description: VOYAGE_STATUS_CONFIG.THU_TUC.description },
    { id: 'DO_MON_DAU_VAO', label: VOYAGE_STATUS_CONFIG.DO_MON_DAU_VAO.label, description: VOYAGE_STATUS_CONFIG.DO_MON_DAU_VAO.description },
    { id: 'LAY_MAU', label: VOYAGE_STATUS_CONFIG.LAY_MAU.label, description: VOYAGE_STATUS_CONFIG.LAY_MAU.description },
    { id: 'LAM_HANG', label: VOYAGE_STATUS_CONFIG.LAM_HANG.label, description: VOYAGE_STATUS_CONFIG.LAM_HANG.description },
    { id: 'DO_MON_DAU_RA', label: VOYAGE_STATUS_CONFIG.DO_MON_DAU_RA.label, description: VOYAGE_STATUS_CONFIG.DO_MON_DAU_RA.description },
    { id: 'HOAN_THANH', label: VOYAGE_STATUS_CONFIG.HOAN_THANH.label, description: VOYAGE_STATUS_CONFIG.HOAN_THANH.description },
];

export default function StatusStepper({ currentStatus }: { currentStatus: string }) {
    // Find index
    const currentIndex = STEPS.findIndex(s => s.id === currentStatus);
    const isPaused = currentStatus === 'TAM_DUNG';

    // Adjusted index for Paused state (it falls under LAM_HANG visually or stays at current)
    // If paused, we show LAM_HANG as active but Amber color
    const visualIndex = currentStatus === 'TAM_DUNG'
        ? STEPS.findIndex(s => s.id === 'LAM_HANG')
        : currentIndex;

    return (
        <div className="w-full py-4">
            <div className="relative flex justify-between items-center w-full px-4">

                {/* Background Line */}
                <div className="absolute top-5 left-0 w-full h-1 bg-slate-100 -z-10 rounded-full"></div>

                {/* Active Line Progress */}
                <div
                    className="absolute top-5 left-0 h-1 bg-brand -z-10 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(visualIndex / (STEPS.length - 1)) * 100}%` }}
                ></div>

                {STEPS.map((step, index) => {
                    const isCompleted = index < visualIndex;
                    const isCurrent = index === visualIndex;
                    const isPending = index > visualIndex;

                    return (
                        <div key={step.id} className="flex flex-col items-center group relative cursor-default">
                            {/* Circle Node */}
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 z-10",
                                isCompleted
                                    ? "bg-brand border-brand text-white shadow-md shadow-brand/20"
                                    : isCurrent
                                        ? isPaused
                                            ? "bg-amber-500 border-amber-100 text-white ring-4 ring-amber-100 scale-110 shadow-lg shadow-amber-200"
                                            : "bg-white border-brand text-brand ring-4 ring-brand-soft scale-110 shadow-lg shadow-brand/20"
                                        : "bg-white border-slate-200 text-slate-300"
                            )}>
                                {isCompleted ? (
                                    <Check size={18} strokeWidth={3} />
                                ) : isCurrent ? (
                                    isPaused ? <AlertCircle size={18} /> : <div className="w-3 h-3 bg-brand rounded-full animate-pulse" />
                                ) : (
                                    <span className="text-[10px] font-bold">{index + 1}</span>
                                )}
                            </div>

                            {/* Label */}
                            <div className={cn(
                                "mt-3 text-center transition-all duration-300 absolute top-10 w-32",
                                isCurrent
                                    ? "transform translate-y-1 opacity-100"
                                    : "opacity-70 group-hover:opacity-100"
                            )}>
                                <div className={cn(
                                    "text-xs font-bold uppercase tracking-wider mb-0.5",
                                    isCompleted ? "text-brand" : isCurrent ? (isPaused ? "text-amber-600" : "text-brand") : "text-slate-400"
                                )}>
                                    {step.label}
                                </div>
                                <div className="text-[9px] text-slate-400 font-medium hidden md:block">
                                    {step.description}
                                </div>
                            </div>
                        </div>
                    );
                })}


            </div>

            {/* Status Message / Legend often helps below */}
            <div className="mt-14 flex justify-center">
                {isPaused ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-medium border border-amber-100 animate-in fade-in slide-in-from-bottom-2">
                        <AlertCircle size={16} />
                        Tàu đang tạm dừng hoạt động
                    </div>
                ) : currentIndex === STEPS.length - 1 ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-100">
                        <Check size={16} />
                        Chuyến tàu đã hoàn thành xuất sắc
                    </div>
                ) : (
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-full text-xs font-medium border border-slate-100 opacity-60">
                        <Clock size={14} />
                        Đang trong tiến trình xử lý
                    </div>
                )}
            </div>
        </div>
    );
}
