'use client';

import { useState } from 'react';
import { Ship, Search, Phone, ArrowLeft, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function PublicSearchPage() {
    const router = useRouter();

    const [voyageCode, setVoyageCode] = useState('');
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!voyageCode || !phone) {
            toast.error('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/public/voyage-track`, {
                params: { voyageCode, phone }
            });

            if (response.data?.id) {
                router.push(`/track/${response.data.id}?code=${voyageCode}&phone=${phone}`);
            }
        } catch (error: any) {
            console.error('Search error:', error);
            const message = error.response?.data?.message || 'Không tìm thấy thông tin chuyến tàu';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-6 md:p-12 min-h-full relative">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-10 animate-in fade-in zoom-in duration-500">
                <div className="text-center mb-10">
                    <div className="inline-flex p-4 bg-brand-soft rounded-2xl mb-6 shadow-sm shadow-brand/5">
                        <Search className="text-brand w-8 h-8" strokeWidth={2.5} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight font-heading uppercase">
                        TRA CỨU HÀNH TRÌNH TÀU
                    </h2>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-2 px-4 opacity-60">
                        Theo dõi tiến độ tàu làm hàng trực tuyến
                    </p>
                </div>

                <form onSubmit={handleSearch} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                            Mã chuyến tàu
                        </label>
                        <div className="relative group">
                            <Ship className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors" size={18} />
                            <input
                                type="text"
                                value={voyageCode}
                                onChange={(e) => setVoyageCode(e.target.value)}
                                placeholder="Nhập mã chuyến (VD: 24001)"
                                className="w-full h-14 pl-12 pr-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-brand focus:bg-white transition-all font-bold text-slate-900"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                            Số điện thoại
                        </label>
                        <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand transition-colors" size={18} />
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Nhập số điện thoại liên hệ"
                                className="w-full h-14 pl-12 pr-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none focus:border-brand focus:bg-white transition-all font-bold text-slate-900"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-14 bg-brand hover:bg-brand-hover text-white font-black rounded-2xl shadow-lg shadow-brand/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Đang tra cứu...
                            </>
                        ) : (
                            <>
                                <Search size={20} strokeWidth={3} />
                                Tra cứu ngay
                            </>
                        )}
                    </button>

                    <Link
                        href="/login"
                        className="w-full py-2 text-[11px] font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                    >
                        <ArrowLeft size={12} /> Quay lại đăng nhập
                    </Link>
                </form>

                <div className="mt-10 p-4 bg-amber-50 rounded-2xl border border-amber-100/50">
                    <p className="text-[10px] text-amber-700 leading-relaxed font-bold uppercase tracking-widest text-center">
                        QUÝ KHÁCH CÓ THỂ QUÉT MÃ QR TRÊN LỆNH ĐỂ TRA CỨU NHANH HƠN
                    </p>
                </div>
            </div>
        </div>
    );
}
