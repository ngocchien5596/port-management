'use client';

import React, { useState } from 'react';
import { useIncidents, useResolveIncident } from '@/features/incidents/hooks';
import { Incident } from '@/features/incidents/types';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { startOfDay, endOfDay, format } from 'date-fns';
import { Card } from '@/components/ui';
import IncidentCard from '@/features/incidents/components/IncidentCard';

export function EquipmentIncidentLogSection({ equipmentId }: { equipmentId: string }) {
    const { data: incidents, isLoading } = useIncidents({ equipmentId, parentId: 'null' });
    const resolveMutation = useResolveIncident();
    const [filterDate, setFilterDate] = useState<string>(() => format(new Date(), 'yyyy-MM-dd'));

    const handleResolve = async (id: string) => {
        await resolveMutation.mutateAsync({ id, endTime: undefined });
    };

    if (isLoading) return <div className="p-12 text-center text-slate-400 font-semibold animate-pulse">Đang tải nhật ký sự cố...</div>;

    const filteredIncidents = incidents?.filter((i: Incident) => {
        if (!filterDate) return true;
        const selectedDate = new Date(filterDate);
        const dayStart = startOfDay(selectedDate);
        const dayEnd = endOfDay(selectedDate);

        const incidentStart = new Date(i.startTime);
        const incidentEnd = i.endTime ? new Date(i.endTime) : null;

        const isBeforeOrOnDayEnd = incidentStart <= dayEnd;
        const isAfterOrOnDayStart = !incidentEnd || incidentEnd >= dayStart;

        return isBeforeOrOnDayEnd && isAfterOrOnDayStart;
    }) || [];

    return (
        <Card className="overflow-hidden border-vtborder shadow-sm border-vtborder bg-white rounded-2xl mb-6">
            <div className="p-5 border-b border-vtborder bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shadow-sm">
                        <AlertTriangle size={18} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-700">Nhật ký sự cố</h4>
                        <p className="font-medium text-slate-500 mt-0.5 opacity-70">Ghi nhận sự cố ảnh hưởng thiết bị</p>
                    </div>
                </div>
                <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="h-8 px-3 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand shadow-sm appearance-none cursor-pointer transition-all w-[130px]"
                />
            </div>

            <div className="p-4 space-y-4">
                {filteredIncidents.length === 0 ? (
                    <div className="p-10 text-center space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-slate-100">
                            <CheckCircle size={20} className="text-emerald-500" />
                        </div>
                        <p className="font-medium text-slate-500 italic">Hiện tại không có sự cố nào.</p>
                    </div>
                ) : (
                    filteredIncidents.map((i: Incident) => (
                        <IncidentCard
                            key={i.id}
                            incident={i}
                            onResolve={handleResolve}
                        />
                    ))
                )}
            </div>
        </Card>
    );
}
