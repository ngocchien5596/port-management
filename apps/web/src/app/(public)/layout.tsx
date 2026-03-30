import React from 'react';
import { Ship } from 'lucide-react';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Minimalist Header */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 md:px-8 shrink-0 z-20 sticky top-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center shadow-lg shadow-brand/20">
                        <Ship className="text-white w-6 h-6" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-base font-black text-slate-900 leading-tight uppercase tracking-tight">
                            Công ty Cổ phần Xi măng Cẩm phả
                        </h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-0.5">
                            Hệ thống Quản lý Cảng
                        </p>
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 overflow-auto bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                {children}
            </main>

            {/* Simple Footer */}
            <footer className="h-12 border-t border-slate-200 bg-white flex items-center justify-center px-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                © {new Date().getFullYear()} Công ty CP Xi măng Cẩm phả • Hệ thống Quản lý Cảng
            </footer>
        </div>
    );
}
