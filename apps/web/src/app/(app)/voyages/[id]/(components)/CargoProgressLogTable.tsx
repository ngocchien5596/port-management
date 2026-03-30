'use client';

import { useState, useEffect } from 'react';
import { safeDate, formatTime, formatDate, formatDateTime } from '@/lib/utils/date';
import { useAddVoyageProgress, useUpdateVoyageProgress, useDeleteVoyageProgress } from '@/features/qltau/hooks';
import { api } from '@/lib/api';
import { useUser } from '@/features/auth/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge'; // Updated Badge import
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils/cn'; // New import
import DatePicker from 'react-datepicker';
import { DatePicker as StandardDatePicker } from '@/components/ui/date-picker';
import "react-datepicker/dist/react-datepicker.css";
import { vi } from 'date-fns/locale';
import {
    Activity,
    Plus,
    History,
    Save,
    Calculator,
    PackageCheck,
    Truck,
    Loader2,
    User as UserIcon,
    Edit,
    Trash2,
    X,
    Check,
    Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { VoyageProgress, VoyageEvent } from '@/features/qltau/types';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

// ProgressRecord is now replaced by VoyageProgress from central types


interface CargoProgressLogTableProps {
    voyageId: string;
    progress: VoyageProgress[];
    events?: VoyageEvent[];
    status: string;
    totalVolume?: number | null;
    unit: string;
}

export function CargoProgressLogTable({
    voyageId,
    progress,
    events = [],
    status,
    totalVolume = 0,
    unit
}: CargoProgressLogTableProps) {
    const addProgress = useAddVoyageProgress();
    const { user } = useUser();

    const [isAdding, setIsAdding] = useState(false);
    const [amount, setAmount] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [notes, setNotes] = useState('');
    const [shiftCode, setShiftCode] = useState('CA_1');
    const [isWarningOpen, setIsWarningOpen] = useState(false);

    // Mapping Shift IDs
    const shiftOptions = [
        { id: 'CA_1', label: 'Ca 1 (Sáng)' },
        { id: 'CA_2', label: 'Ca 2 (Chiều)' },
        { id: 'CA_3', label: 'Ca 3 (Đêm)' }
    ];

    // Helper to determine current shift
    const calculateCurrentShift = (configs: any[]) => {
        const s1 = configs.find((c: any) => c.key === 'SHIFT_1_START')?.value || '06:00';
        const s2 = configs.find((c: any) => c.key === 'SHIFT_2_START')?.value || '14:00';
        const s3 = configs.find((c: any) => c.key === 'SHIFT_3_START')?.value || '22:00';

        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTimeDecimal = currentHour + currentMinute / 60;

        const parseTime = (t: string) => {
            const [h, m] = t.split(':').map(Number);
            return h + (m || 0) / 60;
        };

        const t1 = parseTime(s1);
        const t2 = parseTime(s2);
        const t3 = parseTime(s3);

        if (currentTimeDecimal >= t1 && currentTimeDecimal < t2) return 'CA_1';
        if (currentTimeDecimal >= t2 && currentTimeDecimal < t3) return 'CA_2';
        return 'CA_3';
    };

    // Auto-fill start time and Shift when opening the "Add Record" form
    useEffect(() => {
        if (isAdding) {
            if (progress.length > 0 && progress[0].endTime) {
                // If there are existing records, use the end time of the most recent one
                setStartTime(new Date(progress[0].endTime).toISOString());
            } else {
                // If this is the very first record, find when status changed to LAM_HANG
                const startEvent = [...events].reverse().find(
                    e => e.type === 'STATUS_CHANGE' && e.metadata?.status === 'LAM_HANG'
                );
                if (startEvent) {
                    setStartTime(new Date(startEvent.createdAt).toISOString());
                } else {
                    // Fallback to current time if no explicit event found
                    setStartTime(new Date().toISOString());
                }
            }

            // Fetch shift config to auto-select
            api.get<any>('/config/shifts').then(res => {
                const configs = res.data?.data || res.data;
                if (configs) {
                    setShiftCode(calculateCurrentShift(configs));
                }
            }).catch(console.error);
        }
    }, [isAdding, progress, events]);

    // Edit/Delete state
    const updateProgress = useUpdateVoyageProgress();
    const deleteProgress = useDeleteVoyageProgress();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editAmount, setEditAmount] = useState('');
    const [editStartTime, setEditStartTime] = useState('');
    const [editEndTime, setEditEndTime] = useState('');
    const [editNotes, setEditNotes] = useState('');
    const [editShiftCode, setEditShiftCode] = useState('CA_1');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState<string | null>(null);

    const currentTotal = progress.length > 0 ? Number(progress[0].cumulative) : 0;
    const remaining = Math.max(0, Number(totalVolume || 0) - currentTotal);
    const percent = totalVolume && Number(totalVolume) > 0
        ? Math.min(100, Math.round((currentTotal / Number(totalVolume)) * 100))
        : 0;

    const confirmSave = async () => {
        setIsWarningOpen(false);
        try {
            await addProgress.mutateAsync({
                id: voyageId,
                data: {
                    amount: Number(amount),
                    startTime: startTime ? new Date(new Date(startTime).setSeconds(0, 0)).toISOString() : undefined,
                    endTime: endTime ? new Date(new Date(endTime).setSeconds(0, 0)).toISOString() : undefined,
                    userId: user?.id,
                    notes: notes || undefined,
                    shiftCode
                }
            });
            toast.success('Đã lưu bản ghi sản lượng mới');
            setAmount('');
            setStartTime('');
            setEndTime('');
            setNotes('');
            setIsAdding(false);
        } catch (error) {
            toast.error('Không thể lưu sản lượng');
        }
    };

    const handleSave = async () => {
        if (!amount || Number(amount) <= 0) {
            toast.error('Vui lòng nhập sản lượng hợp lệ');
            return;
        }

        if (!startTime || !endTime) {
            toast.error('Vui lòng chọn Thời gian Bắt đầu và Kết thúc');
            return;
        }

        if (startTime && endTime && startTime >= endTime) {
            toast.error('Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc');
            return;
        }

        const projectedTotal = currentTotal + Number(amount);
        if (totalVolume && projectedTotal > Number(totalVolume)) {
            setIsWarningOpen(true);
            return;
        }

        await confirmSave();
    };

    const handleStartEdit = (rec: VoyageProgress) => {
        setEditingId(rec.id);
        setEditAmount(rec.amount.toString());
        setEditStartTime(rec.startTime ? new Date(rec.startTime).toISOString().slice(0, 16) : '');
        setEditEndTime(rec.endTime ? new Date(rec.endTime).toISOString().slice(0, 16) : '');
        setEditNotes(rec.notes || '');
        setEditShiftCode(rec.shiftCode || 'CA_1');
    };

    const handleCancelEdit = () => {
        setEditingId(null);
    };

    const handleUpdate = async () => {
        if (!editingId) return;
        if (!editAmount || Number(editAmount) <= 0) {
            toast.error('Vui lòng nhập sản lượng hợp lệ');
            return;
        }

        if (!editStartTime || !editEndTime) {
            toast.error('Vui lòng chọn Thời gian Bắt đầu và Kết thúc');
            return;
        }

        if (editStartTime && editEndTime && new Date(editStartTime) >= new Date(editEndTime)) {
            toast.error('Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc');
            return;
        }

        try {
            await updateProgress.mutateAsync({
                id: voyageId,
                progressId: editingId,
                data: {
                    amount: Number(editAmount),
                    startTime: editStartTime ? new Date(new Date(editStartTime).setSeconds(0, 0)).toISOString() : undefined,
                    endTime: editEndTime ? new Date(new Date(editEndTime).setSeconds(0, 0)).toISOString() : undefined,
                    notes: editNotes,
                    shiftCode: editShiftCode,
                    updatedById: user?.id
                }
            });
            toast.success('Đã cập nhật sản lượng');
            setEditingId(null);
        } catch (error) {
            toast.error('Không thể cập nhật sản lượng');
        }
    };

    const handleDelete = (id: string) => {
        setIdToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!idToDelete) return;
        try {
            await deleteProgress.mutateAsync({ id: voyageId, progressId: idToDelete });
            toast.success('Đã xóa bản ghi sản lượng');
            setIsDeleteDialogOpen(false);
            setIdToDelete(null);
        } catch (error) {
            toast.error('Không thể xóa bản ghi');
        }
    };

    const isOperationActive = status === 'LAM_HANG';
    const isCompleted = status === 'HOAN_THANH';

    return (
        <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="font-semibold text-slate-700 flex items-center gap-2">
                        <Activity size={16} className="text-brand" />
                        Tiến độ làm hàng
                    </CardTitle>
                    {isOperationActive && (
                        <Button
                            variant={isAdding ? "ghost" : "default"}
                            onClick={() => setIsAdding(!isAdding)}
                            className={!isAdding ? "bg-brand hover:bg-brand-hover text-white h-9" : "text-slate-500 h-9"}
                        >
                            {isAdding ? "Hủy bỏ" : (
                                <><Plus size={14} className="mr-1" /> Thêm bản ghi</>
                            )}
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="p-0">
                {/* Add Form Area */}
                {isAdding && (
                    <div className="p-5 bg-brand-soft/50 border-b border-brand-soft animate-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-4 gap-y-6 items-end">
                            {/* Product Amount */}
                            <div className="lg:col-span-2">
                                <Input
                                    label="Sản lượng"
                                    type="number"
                                    placeholder="0"
                                    className="bg-white pr-10 h-10 font-bold"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                />
                                <span className="absolute right-3 top-[34px] font-bold text-brand/60 text-xs">{unit}</span>
                            </div>

                            {/* Shift Selection */}
                            <div className="lg:col-span-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1 mb-1.5 block">
                                    Ca <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={shiftCode}
                                    onChange={(e) => setShiftCode(e.target.value)}
                                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand shadow-sm appearance-none cursor-pointer"
                                >
                                    {shiftOptions.map(opt => (
                                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Start/End Times */}
                            <div className="sm:col-span-2 lg:col-span-4 grid grid-cols-2 gap-3">
                                <StandardDatePicker
                                    selected={startTime ? new Date(startTime) : null}
                                    onChange={(date) => setStartTime(date ? date.toISOString() : '')}
                                    showTimeSelect
                                    label="Bắt đầu"
                                    required
                                />
                                <StandardDatePicker
                                    selected={endTime ? new Date(endTime) : null}
                                    onChange={(date) => setEndTime(date ? date.toISOString() : '')}
                                    showTimeSelect
                                    label="Kết thúc"
                                    required
                                />
                            </div>

                            {/* Notes */}
                            <div className="sm:col-span-2 lg:col-span-2">
                                <Input
                                    label="Ghi chú"
                                    placeholder="Ca làm, máy cẩu, thời tiết..."
                                    className="bg-white h-10 w-full font-medium"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>

                            {/* Actions */}
                            <div className="sm:col-span-2 lg:col-span-2 flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    className="flex-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 h-10 px-4 font-bold"
                                    onClick={() => setIsAdding(false)}
                                    type="button"
                                >
                                    Hủy
                                </Button>
                                <Button
                                    className="flex-[2] bg-brand hover:bg-brand-hover text-white shadow-lg shadow-brand/20 h-10 font-black tracking-tight"
                                    onClick={handleSave}
                                    disabled={addProgress.isPending}
                                >
                                    {addProgress.isPending ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} className="mr-2" /> LƯU</>}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Log Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 font-semibold text-slate-500 border-b border-slate-100">
                                <th className="px-6 py-3">Bắt đầu</th>
                                <th className="px-6 py-3">Kết thúc</th>
                                <th className="px-6 py-3">Ca</th>
                                <th className="px-6 py-3">Sản lượng</th>
                                <th className="px-6 py-3">Số giờ</th>
                                <th className="px-6 py-3">Lũy kế</th>
                                <th className="px-6 py-3 font-body">Ghi chú</th>
                                {!isCompleted && <th className="px-6 py-3 text-right">Thao tác</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {progress.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2 opacity-30">
                                            <History size={40} className="text-slate-300" />
                                            <p className="text-sm font-medium text-slate-400">Chưa có nhật ký làm hàng</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                progress.map((rec) => {
                                    const isEditing = editingId === rec.id;

                                    return (
                                        <tr key={rec.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                {isEditing ? (
                                                    <StandardDatePicker
                                                        selected={editStartTime ? new Date(editStartTime) : null}
                                                        onChange={(date) => setEditStartTime(date ? date.toISOString() : '')}
                                                        showTimeSelect
                                                        className="h-8 py-1"
                                                    />
                                                ) : (
                                                    rec.startTime ? (
                                                        <div className="font-medium text-slate-700">
                                                            {formatDateTime(rec.startTime)}
                                                        </div>
                                                    ) : (
                                                        <div className="font-medium text-slate-400 italic">
                                                            {formatDateTime(rec.createdAt)}
                                                        </div>
                                                    )
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {isEditing ? (
                                                    <StandardDatePicker
                                                        selected={editEndTime ? new Date(editEndTime) : null}
                                                        onChange={(date) => setEditEndTime(date ? date.toISOString() : '')}
                                                        showTimeSelect
                                                        className="h-8 py-1"
                                                    />
                                                ) : (
                                                    rec.endTime ? (
                                                        <div className="font-medium text-slate-700">
                                                            {formatDateTime(rec.endTime)}
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-slate-300 font-medium">---</span>
                                                        </div>
                                                    )
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {isEditing ? (
                                                    <select
                                                        value={editShiftCode}
                                                        onChange={(e) => setEditShiftCode(e.target.value)}
                                                        className="w-full min-w-[100px] h-9 rounded-xl border border-slate-200 px-3 py-1 text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                                                    >
                                                        {shiftOptions.map(opt => (
                                                            <option key={opt.id} value={opt.id}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <div className="font-semibold text-slate-700 whitespace-nowrap">
                                                        {shiftOptions.find(o => o.id === rec.shiftCode)?.label || rec.shiftCode || '---'}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {isEditing ? (
                                                    <Input
                                                        type="number"
                                                        value={editAmount}
                                                        onChange={(e) => setEditAmount(e.target.value)}
                                                        className="w-24 h-9 font-bold text-brand"
                                                    />
                                                ) : (
                                                    <TooltipProvider delayDuration={200}>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <button type="button" className="inline-block outline-none text-left">
                                                                    <Badge className="font-semibold text-brand bg-brand-soft border-brand-soft border flex items-center gap-1.5 px-2 py-1 cursor-help hover:bg-brand hover:text-white hover:shadow-md transition-all group">
                                                                        <span>+ {rec.amount.toLocaleString('vi-VN')}</span>
                                                                        <Info size={12} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                                                                    </Badge>
                                                                </button>
                                                            </TooltipTrigger>
                                                            <TooltipContent align="center" className="p-3 shadow-xl border-slate-100 bg-white">
                                                                <div className="space-y-1.5">
                                                                    <p className="font-semibold text-slate-800 border-b border-slate-100 pb-1">Chi tiết bản ghi</p>
                                                                    <div className="font-medium text-slate-500 flex flex-col gap-1.5 mt-2">
                                                                        <span className="flex items-center gap-1.5"><UserIcon size={12} className="text-slate-400" />Người lập: <strong className="text-slate-700">{rec.employee?.fullName || 'Hệ thống'}</strong></span>
                                                                        <span className="flex items-center gap-1.5"><History size={12} className="text-slate-400" />Giờ lập: <strong className="text-slate-700">{formatDateTime(rec.createdAt)}</strong></span>
                                                                    </div>
                                                                </div>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {!isEditing && (
                                                    <span className="font-semibold text-slate-700">
                                                        {rec.hours ? `${Number(rec.hours).toFixed(1)} h` : '---'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-700 flex items-baseline gap-1">
                                                    <span>{rec.cumulative.toLocaleString('vi-VN')}</span>
                                                    <span className="font-medium text-slate-400">/ {(totalVolume || 0).toLocaleString('vi-VN')}</span>
                                                </div>
                                                <div className="w-16 h-1 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                                                    <div
                                                        className="h-full bg-slate-300"
                                                        style={{ width: `${totalVolume ? Math.min(100, (Number(rec.cumulative) / Number(totalVolume)) * 100) : 0}% ` }}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {isEditing ? (
                                                    <Input
                                                        value={editNotes}
                                                        onChange={(e) => setEditNotes(e.target.value)}
                                                        className="w-full min-w-[180px] h-9 font-medium"
                                                        placeholder="Ghi chú..."
                                                    />
                                                ) : (
                                                    <div className="space-y-1">
                                                        <div className="font-medium text-slate-500 italic">
                                                            {rec.notes || '---'}
                                                        </div>
                                                        {rec.updatedBy && (
                                                            <div className="font-medium text-brand/60 flex items-center gap-1">
                                                                <Edit size={10} />
                                                                Đã sửa bởi {rec.updatedBy.fullName} ({formatDateTime(rec.updatedAt)})
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            {!isCompleted && (
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {isEditing ? (
                                                            <>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                                    onClick={handleUpdate}
                                                                    disabled={updateProgress.isPending}
                                                                >
                                                                    {updateProgress.isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={14} />}
                                                                </Button>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-7 w-7 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                                                    onClick={handleCancelEdit}
                                                                >
                                                                    <X size={14} />
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-7 w-7 text-slate-400 hover:text-brand hover:bg-brand-soft/30"
                                                                    onClick={() => handleStartEdit(rec)}
                                                                >
                                                                    <Edit size={14} />
                                                                </Button>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-7 w-7 text-slate-400 hover:text-red-500 hover:bg-red-50"
                                                                    onClick={() => handleDelete(rec.id)}
                                                                >
                                                                    <Trash2 size={14} />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>

            <ConfirmDialog
                isOpen={isWarningOpen}
                onClose={() => setIsWarningOpen(false)}
                onConfirm={confirmSave}
                title="Cảnh báo vượt sản lượng"
                description={`Sản lượng nhập vào sẽ làm tổng sản lượng vượt quá sản lượng mục tiêu của chuyến tàu(${(totalVolume || 0).toLocaleString()} tấn).Bạn có chắc chắn muốn tiếp tục ? `}
                type="info"
                confirmText="Xác nhận nhập vượt"
                cancelText="Xem lại"
                isLoading={addProgress.isPending}
            />

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title="Xác nhận xóa"
                description="Bạn có chắc chắn muốn xóa bản ghi sản lượng này không? Việc này sẽ ảnh hưởng đến tính lũy kế của các bản ghi sau và thay đổi thời gian dự kiến hoàn thành."
                type="danger"
                confirmText="Xóa bản ghi"
                cancelText="Hủy bỏ"
                isLoading={deleteProgress.isPending}
            />
        </Card>
    );
}
