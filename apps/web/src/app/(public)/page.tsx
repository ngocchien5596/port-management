'use client';

import Link from 'next/link';

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-50">
            <div className="text-center">
                <div className="mb-6 flex justify-center">
                    <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center overflow-hidden p-2">
                        <img src="/logo.jpg" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                </div>
                <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight uppercase">
                    QUẢN LÝ CẢNG BIỂN
                </h1>
                <p className="text-lg text-slate-500 mb-8 font-medium">
                    Hệ thống quản lý điều hành cảng tập trung
                </p>
                <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-2xl bg-[#005596] px-10 py-4 text-sm font-black text-white shadow-xl shadow-[#005596]/20 transition-all hover:bg-[#00447a] hover:scale-105 active:scale-95 uppercase tracking-widest"
                >
                    ĐĂNG NHẬP HỆ THỐNG
                </Link>
            </div>

            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
                <div className="p-8 rounded-[32px] border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="font-black mb-3 text-slate-900 uppercase tracking-tight">🚢 Quản lý chuyến tàu</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        Theo dõi lịch trình, trạng thái làm hàng và tiến độ của các tàu tại cảng.
                    </p>
                </div>
                <div className="p-8 rounded-[32px] border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="font-black mb-3 text-slate-900 uppercase tracking-tight">🏗️ Điều phối bến bãi</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        Tối ưu hóa việc sử dụng bến bãi và cầu cảng dựa trên kế hoạch thực tế.
                    </p>
                </div>
                <div className="p-8 rounded-[32px] border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="font-black mb-3 text-slate-900 uppercase tracking-tight">📊 Báo cáo vận hành</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        Phân tích hiệu suất khai thác và tổng hợp dữ liệu báo cáo chi tiết.
                    </p>
                </div>
            </div>
        </main>
    );
}
