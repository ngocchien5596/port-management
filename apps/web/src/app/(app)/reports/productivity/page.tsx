'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProductivityRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/reports/productivity/port');
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50/50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Đang chuyển hướng...</p>
            </div>
        </div>
    );
}
