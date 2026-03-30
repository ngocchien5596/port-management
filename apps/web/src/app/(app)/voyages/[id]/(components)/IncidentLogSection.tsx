'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useActiveIncidentsForVoyage, useResolveIncident } from '@/features/incidents/hooks';
import { incidentApi } from '@/features/incidents/api';
import { Incident } from '@/features/incidents/types';
import { AlertTriangle, Clock, CheckCircle, MessageSquare, Layout, Anchor, Ship, Trash2 } from 'lucide-react';
import { Button, Badge, Card } from '@/components/ui';
import { formatDateTime } from '@/lib/utils/date';
import IncidentCard from '@/features/incidents/components/IncidentCard';
import { cn } from '@/lib/utils/cn';

interface IncidentLogSectionProps {
    voyageId: string;
    isReadOnly?: boolean;
}

export default function IncidentLogSection({ voyageId, isReadOnly }: IncidentLogSectionProps) {
    const { data: incidents, isLoading } = useQuery({
        queryKey: ['incidents', 'voyage', voyageId, 'all'],
        queryFn: () => incidentApi.getActiveForVoyage(voyageId, { activeOnly: false }),
        enabled: !!voyageId
    });
    const resolveMutation = useResolveIncident();

    const handleResolve = async (id: string) => {
        await resolveMutation.mutateAsync({ id, endTime: undefined });
    };

    if (isLoading) return <div className="p-12 text-center text-slate-400 font-semibold animate-pulse">Đang tải nhật ký sự cố...</div>;

    return (
        <Card className="overflow-hidden border-vtborder shadow-sm border-vtborder bg-white rounded-2xl">
            <div className="p-5 border-b border-vtborder bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shadow-sm">
                        <AlertTriangle size={18} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-700">Nhật ký sự cố</h4>
                        <p className="font-medium text-slate-500 mt-0.5 opacity-70">Ghi nhận gián đoạn vận hành</p>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-4">
                {incidents?.length === 0 ? (
                    <div className="p-10 text-center space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-slate-100">
                            <CheckCircle size={20} className="text-emerald-500" />
                        </div>
                        <p className="font-medium text-slate-500 italic">Hiện tại không có sự cố nào.</p>
                    </div>
                ) : (
                    incidents?.map((i: Incident) => (
                        <IncidentCard
                            key={i.id}
                            incident={i}
                            onResolve={handleResolve}
                            isReadOnly={isReadOnly}
                        />
                    ))
                )}
            </div>
        </Card>
    );
}
