'use client';

import { Search } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-50">
            <div className="text-center">
                <div className="mb-8 flex justify-center">
                    <div className="w-24 h-24 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-center overflow-hidden p-3 transition-transform hover:scale-105 duration-300">
                        <img src="/logo_new.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                </div>
                <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight uppercase">
                    QUẢN LÝ CẢNG BIỂN
                </h1>
                <p className="text-sm text-slate-500 mb-10 font-bold uppercase tracking-widest opacity-60">
                    Hệ thống quản lý điều hành cảng tập trung
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <Link
                        href="/login"
                        className="w-full sm:w-auto min-w-[240px] inline-flex items-center justify-center rounded-xl bg-[#EE0033] px-12 py-5 text-sm font-black text-white shadow-2xl shadow-[#EE0033]/30 transition-all hover:bg-[#D0002D] hover:scale-105 active:scale-95 uppercase tracking-[0.2em]"
                    >
                        ĐĂNG NHẬP HỆ THỐNG
                    </Link>
                    <Link
                        href="/track"
                        className="w-full sm:w-auto min-w-[240px] inline-flex items-center justify-center rounded-xl bg-white border-2 border-[#EE0033] px-10 py-5 text-sm font-black text-[#EE0033] shadow-lg shadow-slate-200/50 transition-all hover:bg-red-50 hover:scale-105 active:scale-95 uppercase tracking-[0.2em] gap-3"
                    >
                        <Search size={20} strokeWidth={3} />
                        TRA CỨU
                    </Link>
                </div>
            </div>

            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
                <div className="p-8 rounded-[32px] border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="font-extrabold mb-3 text-[#EE0033] uppercase tracking-tight flex items-center gap-2">
                        <span className="p-1.5 bg-red-50 rounded-lg">🚢</span>
                        Quản lý chuyến tàu
                    </h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        Theo dõi lịch trình, trạng thái làm hàng và tiến độ của các tàu tại cảng.
                    </p>
                </div>
                <div className="p-8 rounded-[32px] border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="font-extrabold mb-3 text-[#EE0033] uppercase tracking-tight flex items-center gap-2">
                        <span className="p-1.5 bg-red-50 rounded-lg">🏗️</span>
                        Điều phối bến bãi
                    </h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        Tối ưu hóa việc sử dụng bến bãi và cầu cảng dựa trên kế hoạch thực tế.
                    </p>
                </div>
                <div className="p-8 rounded-[32px] border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="font-extrabold mb-3 text-[#EE0033] uppercase tracking-tight flex items-center gap-2">
                        <span className="p-1.5 bg-red-50 rounded-lg">📊</span>
                        Báo cáo vận hành
                    </h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        Phân tích hiệu suất khai thác và tổng hợp dữ liệu báo cáo chi tiết.
                    </p>
                </div>
            </div>
        </main>
    );
}
