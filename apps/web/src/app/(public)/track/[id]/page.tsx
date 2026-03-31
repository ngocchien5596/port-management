'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Ship, Clock, Anchor, Package, ArrowLeft, Loader2, AlertCircle, CheckCircle2, Info, Lock, Phone } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDateTime } from '@/lib/utils/date';

import { getStatusConfig } from '@/constants/voyage';

export default function PublicTrackingDetailPage({ params }: { params: { id: string } }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [voyage, setVoyage] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<{ message: string; title: string; type: 'auth' | 'notfound' | 'error' | 'unlock' } | null>(null);
    const [userInputPhone, setUserInputPhone] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    // Initial phone from URL or Session
    const initialPhone = searchParams.get('phone') || (typeof window !== 'undefined' ? sessionStorage.getItem('tracking_phone') : null);

    const fetchVoyage = async (phoneToUse: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get<any>(`/public/voyage-track/${params.id}`, {
                params: { phone: phoneToUse }
            });

            const voyageData = (response as any).data || response;
            setVoyage(voyageData);
            
            // Save to session for future refreshes
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('tracking_phone', phoneToUse);
            }
        } catch (err: any) {
            console.error('Fetch error:', err);
            const status = err.status;
            const message = err.message || 'Không thể kết nối đến máy chủ';

            if (status === 404) {
                setError({
                    title: 'Không tìm thấy',
                    message: 'Chúng tôi không tìm thấy dữ liệu cho chuyến tàu này.',
                    type: 'notfound'
                });
            } else if (status === 401 || status === 403) {
                setError({
                    title: 'Yêu cầu xác thực',
                    message: 'Thông tin tra cứu không chính xác hoặc bạn không có quyền truy cập.',
                    type: 'auth'
                });
            } else {
                setError({
                    title: 'Lỗi hệ thống',
                    message: message,
                    type: 'error'
                });
            }
        } finally {
            setIsLoading(false);
            setIsVerifying(false);
        }
    };

    useEffect(() => {
        if (!initialPhone) {
            setError({
                title: 'Truy cập an toàn',
                message: 'Vui lòng nhập số điện thoại khách hàng để xác minh quyền truy cập hành trình này.',
                type: 'unlock'
            });
            setIsLoading(false);
            return;
        }

        fetchVoyage(initialPhone);
    }, [params.id]);

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInputPhone) return;
        setIsVerifying(true);
        fetchVoyage(userInputPhone);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-brand animate-spin mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Đang tải dữ liệu...</p>
            </div>
        );
    }

    if (error?.type === 'unlock') {
        return (
            <div className="flex flex-col items-center justify-center p-6 md:p-12 min-h-[60vh]">
                <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 p-10 text-center animate-in fade-in zoom-in duration-500">
                    <div className="inline-flex p-5 bg-brand-soft rounded-3xl mb-8 shadow-sm shadow-brand/5">
                        <Lock className="text-brand w-10 h-10" strokeWidth={2.5} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-3">
                        {error.title}
                    </h2>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10 px-4">
                        {error.message}
                    </p>

                    <form onSubmit={handleUnlock} className="space-y-6">
                        <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors" size={18} />
                            <input
                                type="tel"
                                value={userInputPhone}
                                onChange={(e) => setUserInputPhone(e.target.value)}
                                placeholder="Nhập số điện thoại khách hàng"
                                className="w-full h-14 pl-12 pr-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-brand focus:bg-white transition-all font-bold text-slate-900"
                                required
                                autoFocus
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isVerifying}
                            className="w-full h-14 bg-brand hover:bg-brand-hover text-white font-black rounded-2xl shadow-lg shadow-brand/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                        >
                            {isVerifying ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Đang xác minh...
                                </>
                            ) : (
                                <>
                                    Mở khóa thông tin
                                </>
                            )}
                        </button>
                    </form>
                    
                    <button
                        onClick={() => router.push('/track')}
                        className="mt-8 text-[11px] font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-[0.2em] flex items-center justify-center gap-2 mx-auto"
                    >
                        <ArrowLeft size={12} /> Quay lại tra cứu mã chuyến
                    </button>
                </div>
            </div>
        );
    }

    if (error || !voyage) {
        return (
            <div className="flex flex-col items-center justify-center p-6 md:p-12 min-h-[60vh]">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-red-100 p-8 text-center animate-in fade-in zoom-in duration-300">
                    <div className={`inline-flex p-4 rounded-2xl mb-6 ${error?.type === 'auth' ? 'bg-amber-50' : error?.type === 'notfound' ? 'bg-slate-50' : 'bg-red-50'}`}>
                        {error?.type === 'auth' ? (
                            <Lock className="text-amber-500 w-8 h-8" />
                        ) : error?.type === 'notfound' ? (
                            <Ship className="text-slate-400 w-8 h-8" />
                        ) : (
                            <AlertCircle className="text-red-500 w-8 h-8" />
                        )}
                    </div>
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">
                        {error?.title || 'Yêu cầu xác thực'}
                    </h2>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
                        {error?.message || 'Chúng tôi không tìm thấy dữ liệu cho chuyến tàu này.'}
                    </p>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => {
                                if (error?.type === 'auth') {
                                    if (typeof window !== 'undefined') sessionStorage.removeItem('tracking_phone');
                                    window.location.reload();
                                } else {
                                    router.push('/track');
                                }
                            }}
                            className="w-full h-12 bg-slate-900 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[11px]"
                        >
                            {error?.type === 'auth' ? 'Thử lại số điện thoại khác' : 'Quay lại tra cứu'}
                        </button>
                        <button
                            onClick={() => router.push('/track')}
                            className="w-full h-12 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[11px]"
                        >
                            <ArrowLeft size={14} strokeWidth={3} /> Về trang tìm kiếm
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const totalDone = Number(voyage.progress?.[0]?.cumulative || 0);
    const volume = Number(voyage.totalVolume) || 1;
    const percent = Math.min(100, Math.round((totalDone / volume) * 100));

    const getExactVoyageStatusLabel = (status: string) => {
        return getStatusConfig(status).label;
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Info */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-brand-soft rounded-2xl flex items-center justify-center shrink-0">
                            <Ship className="text-brand w-8 h-8" strokeWidth={2.5} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-black bg-brand/10 text-brand px-2 py-0.5 rounded uppercase tracking-widest font-heading">Chuyến {voyage.voyageCode}</span>
                                {voyage.status === 'HOAN_THANH' && (
                                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-1 font-heading">
                                        <CheckCircle2 size={10} /> Đã hoàn thành
                                    </span>
                                )}
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight uppercase leading-none font-heading">
                                {voyage.vessel.name}
                            </h2>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1 font-heading">
                                Mã tàu: {voyage.vessel.code} • {voyage.product.name}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Progress Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    {/* Visual Progress */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4">
                            <Info className="text-slate-200 w-5 h-5" />
                        </div>

                        <div className="relative w-48 h-48 mb-6">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="88"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    fill="transparent"
                                    className="text-slate-100"
                                />
                                <circle
                                    cx="96"
                                    cy="96"
                                    r="88"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    fill="transparent"
                                    strokeDasharray={2 * Math.PI * 88}
                                    strokeDashoffset={2 * Math.PI * 88 * (1 - percent / 100)}
                                    strokeLinecap="round"
                                    className="text-brand transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-black text-slate-900 leading-none font-heading">{percent}%</span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 font-heading">Đã hoàn thành</span>
                            </div>
                        </div>

                        <div className="w-full max-w-xs space-y-1">
                            <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-400 font-heading">
                                <span>Sản lượng</span>
                                <span>{voyage.product.unit}</span>
                            </div>
                            <div className="flex justify-between items-baseline">
                                <span className="text-3xl font-black text-brand tracking-tighter">{totalDone.toLocaleString()}</span>
                                <span className="text-slate-300 font-bold mx-2">/</span>
                                <span className="text-xl font-black text-slate-400 tracking-tighter">{volume.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Timeline / Logs */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em] mb-8 flex items-center gap-3 font-heading">
                            <Clock size={16} className="text-brand" />
                            Nhật ký vận hành
                        </h3>

                        <div className="space-y-8 relative before:absolute before:inset-0 before:left-[11px] before:w-0.5 before:bg-slate-100">
                            {(voyage.logs || []).length > 0 ? (
                                voyage.logs.map((log: any, idx: number) => {
                                    // Robust mapping for status titles
                                    let displayTitle = log.title;
                                    const upperTitle = log.title?.toUpperCase();
                                    if (['NHAP', 'THU_TUC', 'DO_MON_DAU_VAO', 'LAY_MAU', 'LAM_HANG', 'DO_MON_DAU_RA', 'HOAN_THANH', 'TAM_DUNG', 'HUY_BO'].includes(upperTitle)) {
                                        displayTitle = getStatusConfig(upperTitle).label;
                                    }

                                    return (
                                        <div key={log.id} className="relative pl-10 animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                                            <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center shadow-sm ${idx === 0 ? 'bg-brand' : 'bg-slate-200'}`}>
                                                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                            </div>
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight font-heading">{displayTitle}</h4>
                                                    <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap font-heading">{formatDateTime(log.createdAt)}</span>
                                                </div>
                                                <p className="text-xs text-slate-500 font-medium leading-relaxed">{log.description}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-10 opacity-40">
                                    <p className="text-xs font-bold uppercase tracking-widest font-heading">Chưa có nhật ký vận hành</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Time Info */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-slate-50 rounded-lg shrink-0">
                                    <Anchor className="text-slate-400 w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 font-heading">Dự kiến đến (ETA)</p>
                                    <p className="text-sm font-black text-slate-900 font-mono tracking-tight font-heading">
                                        {voyage.eta ? formatDateTime(voyage.eta) : '---'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-slate-50 rounded-lg shrink-0">
                                    <Package className="text-slate-400 w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 font-heading">
                                        {voyage.actualDeparture
                                            ? 'Thời điểm đi thực tế'
                                            : voyage.etd ? 'Thời điểm đi dự kiến (ETD)' : 'Thời điểm đi lý thuyết'}
                                    </p>
                                    <p className="text-sm font-black text-slate-900 font-mono tracking-tight font-heading">
                                        {voyage.actualDeparture
                                            ? formatDateTime(voyage.actualDeparture)
                                            : voyage.etd
                                                ? formatDateTime(voyage.etd)
                                                : voyage.theoreticalEtd ? formatDateTime(voyage.theoreticalEtd) : '---'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-50">
                            <div className="p-4 bg-brand-soft rounded-2xl border border-brand/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle2 size={14} className="text-brand" />
                                    <span className="text-[10px] font-black text-brand uppercase tracking-widest font-heading">Trạng thái hiện tại</span>
                                </div>
                                <p className="text-sm font-black text-slate-800 uppercase leading-snug font-heading">
                                    {getExactVoyageStatusLabel(voyage.status)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Support Box */}
                    <div className="bg-slate-900 rounded-3xl p-6 shadow-xl shadow-slate-200">
                        <h4 className="text-white text-xs font-black uppercase tracking-[0.2em] mb-4 font-heading">Hỗ trợ khách hàng</h4>
                        <p className="text-slate-400 text-[11px] leading-relaxed font-medium mb-6 font-body">
                            Nếu quý khách cần hỗ trợ thêm thông tin về hàng hóa, vui lòng liên hệ bộ phận điều độ cảng.
                        </p>
                        <button className="w-full h-11 bg-white/10 hover:bg-white/20 text-white font-black text-[10px] rounded-xl transition-all uppercase tracking-widest border border-white/5 font-heading">
                            Hotline: 0203 3XXX XXX
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
