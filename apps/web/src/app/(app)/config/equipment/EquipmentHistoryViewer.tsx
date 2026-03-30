'use client';

import React from 'react';
import { X, Calendar, User, Clock, Info } from 'lucide-react';
import { useEquipmentHistory } from '@/features/config/hooks';
import { Equipment } from '@/features/config/types';

interface EquipmentHistoryViewerProps {
    isOpen: boolean;
    onClose: () => void;
    equipment: Equipment | null;
}

export default function EquipmentHistoryViewer({ isOpen, onClose, equipment }: EquipmentHistoryViewerProps) {
    const { data: history, isLoading } = useEquipmentHistory(equipment?.id || '');

    if (!isOpen || !equipment) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-end bg-slate-900/40 backdrop-blur-sm transition-opacity">
            <div className="h-full w-full max-w-md bg-white shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col border-l border-slate-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">LỊCH SỬ VẬN HÀNH</h2>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{equipment.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-full transition-all border border-transparent hover:border-slate-200">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 scrollbar-none">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-40 space-y-3">
                            <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Đang tải lịch sử...</p>
                        </div>
                    ) : history && history.length > 0 ? (
                        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:via-slate-200 before:to-transparent">
                            {history.map((event: any) => (
                                <div key={event.id} className="relative flex items-start gap-6 group">
                                    <div className="absolute left-0 flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-slate-100 text-brand shadow-sm transition-all group-hover:border-brand">
                                        <Clock size={16} />
                                    </div>
                                    <div className="flex-1 bg-slate-50/50 rounded-2xl p-5 border border-slate-100 hover:border-brand-soft hover:bg-white transition-all">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-black text-brand uppercase tracking-widest">{event.type}</span>
                                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-lg border border-slate-100">
                                                <Calendar size={10} />
                                                {new Date(event.createdAt).toLocaleDateString('vi-VN')} {new Date(event.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-black text-slate-900 mb-1 leading-tight uppercase tracking-tight">{event.title}</h4>
                                        {event.description && (
                                            <p className="text-xs font-bold text-slate-500 italic mb-3">"{event.description}"</p>
                                        )}
                                        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                                            <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 font-black text-[10px]">
                                                {event.employee?.fullName.charAt(0)}
                                            </div>
                                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">
                                                {event.employee?.fullName || 'Hệ thống'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-300">
                            <Info size={48} strokeWidth={1} className="mb-4 opacity-20" />
                            <p className="text-sm font-bold uppercase tracking-widest">Chưa có lịch sử vận hành</p>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-xl font-black text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-all uppercase tracking-widest text-xs"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}
