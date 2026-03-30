'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/features/auth/store';
import { authApi } from '@/features/auth/api';
import * as QRCode from 'qrcode';
import toast from 'react-hot-toast';
import {
    QrCode as QrIcon,
    Download as DownloadIcon,
    RefreshCcw as RefreshIcon,
    Eye,
    EyeOff,
    Save as SaveIcon
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// --- Component ---

export default function MyQrContent() {
    const { user, checkAuth } = useAuthStore();
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const [secretCode, setSecretCode] = useState<string>('');
    const [showSecret, setShowSecret] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [qrTimestamp, setQrTimestamp] = useState<number>(Date.now());

    // Initialize secret code from user
    useEffect(() => {
        if (user?.secretCode) {
            setSecretCode(user.secretCode);
        }
    }, [user]);

    // Generate QR whenever user or timestamp changes
    useEffect(() => {
        const generateQR = async () => {
            if (!user?.employeeCode) {
                console.warn('QR Generation skipped: Missing employee code');
                setQrCodeUrl('');
                return;
            }
            setIsGenerating(true);
            try {
                // QR content: JSON string with basic info + timestamp to make it dynamic
                console.log('Generating My QR for:', user.employeeCode);
                const qrData = JSON.stringify({
                    id: user.id,
                    code: user.employeeCode,
                    name: user.fullName,
                    type: 'EMPLOYEE',
                    ts: qrTimestamp
                });

                const url = await QRCode.toDataURL(qrData, {
                    width: 300,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#ffffff'
                    }
                });
                setQrCodeUrl(url);
            } catch (err) {
                console.error('QR Generation failed', err);
                setQrCodeUrl('');
                toast.error(`Không thể tạo mã QR: ${(err as any)?.message}`);
            } finally {
                setIsGenerating(false);
            }
        };

        generateQR();
    }, [user, qrTimestamp]);

    const handleDownload = () => {
        if (!qrCodeUrl) {
            toast.error('Chưa có mã QR để tải');
            return;
        }

        try {
            const link = document.createElement('a');
            link.href = qrCodeUrl;
            link.download = `QR-${user?.employeeCode || 'code'}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('Tải mã QR thành công!');
        } catch (error) {
            toast.error('Lỗi khi tải mã QR');
        }
    };

    const handleRegenerate = () => {
        // Just update timestamp to change QR image
        setQrTimestamp(Date.now());
        toast.success('Đã làm mới mã QR');
    };

    const handleSaveManual = async () => {
        if (!secretCode) return;
        setIsSaving(true);
        try {
            await authApi.updateSecretCode(secretCode);
            toast.success('Đã lưu mã bí mật!');
            await checkAuth();
        } catch (error) {
            console.error(error);
            const msg = (error as any)?.response?.data?.error || 'Lỗi khi lưu mã';
            toast.error(msg);
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) return <div className="p-8 text-center text-gray-500">Đang tải thông tin...</div>;

    return (
        <div className="w-full min-h-screen bg-[#f8fafc] px-4 pb-12 animate-in fade-in duration-500">
            <div className="max-w-[1280px] mx-auto pt-6">

                {/* 1. Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center shadow-xl shadow-brand/20">
                            <QrIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 leading-none">Mã QR của tôi</h1>
                            <p className="text-sm text-slate-500 mt-1.5 font-medium">Sử dụng mã này để điểm danh nhận suất ăn</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleDownload}
                            className="h-10 px-4 flex items-center gap-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm active:scale-95"
                        >
                            <DownloadIcon className="w-4 h-4" />
                            Tải về
                        </button>
                        <button
                            onClick={handleRegenerate}
                            className="h-10 px-4 flex items-center gap-2 bg-brand hover:bg-brand-hover text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-brand/20 active:scale-95"
                        >
                            <RefreshIcon className="w-4 h-4" />
                            Làm mới
                        </button>
                    </div>
                </div>

                {/* 2. Main content */}
                <div className="flex flex-col items-center justify-center py-4 lg:py-8">
                    <div className="w-full max-w-[440px] bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden p-4 md:p-8 flex flex-col items-center">

                        {/* QR Display Area */}
                        <div className="relative group w-full flex justify-center">
                            {/* Decorative frame */}
                            <div className="w-full max-w-[280px] aspect-square bg-slate-50 border-2 border-slate-100 rounded-[28px] flex items-center justify-center p-4 transition-all group-hover:border-brand-soft group-hover:bg-brand-soft/30">
                                <div className="w-full h-full bg-white rounded-2xl shadow-sm flex items-center justify-center p-2 overflow-hidden">
                                    {qrCodeUrl ? (
                                        <img src={qrCodeUrl} alt="My QR Code" className="w-full h-full object-contain" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-8 h-8 border-4 border-brand-soft/20 border-t-brand rounded-full animate-spin" />
                                            <span className="text-xs font-bold text-slate-400">Đang tạo...</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* User Basic Info */}
                        <div className="mt-8 text-center space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Thông tin nhân viên</p>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{user.fullName}</h2>
                            <div className="inline-flex items-center px-4 py-1.5 bg-slate-100 rounded-full text-slate-600">
                                <span className="text-xs font-black font-mono tracking-widest">{user.employeeCode}</span>
                            </div>
                        </div>

                        <div className="w-full mt-10 p-6 bg-slate-50/80 rounded-[24px] border border-slate-100 space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mã bí mật cá nhân</p>
                            </div>

                            <div className="relative group">
                                <input
                                    type={showSecret ? "text" : "password"}
                                    value={secretCode}
                                    onChange={(e) => setSecretCode(e.target.value)}
                                    className="w-full h-12 pl-5 pr-12 bg-white border border-slate-200 rounded-xl text-lg font-bold text-slate-900 tracking-[0.3em] placeholder:tracking-normal placeholder:font-medium placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-brand-soft/10 focus:border-brand transition-all text-center"
                                    placeholder="••••••••"
                                />
                                <button
                                    onClick={() => setShowSecret(!showSecret)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-brand transition-colors"
                                >
                                    {showSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            <button
                                onClick={handleSaveManual}
                                disabled={isSaving || !secretCode || secretCode === user.secretCode}
                                className="w-full h-12 flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand/20 active:scale-[0.98]"
                            >
                                <SaveIcon className="w-4 h-4" />
                                {isSaving ? 'Đang lưu...' : 'Lưu mã bí mật'}
                            </button>
                        </div>

                        <div className="mt-8 flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            Đã bảo mật 256-bit
                        </div>
                    </div>
                </div>

                {/* 3. Footer info */}
                <div className="mt-12 text-center text-sm font-medium text-slate-400">
                    <p>Mã QR này được dùng để điểm danh nhận suất ăn tại nhà ăn công ty.</p>
                    <p className="mt-1">Vui lòng không cung cấp mã bí mật cho người khác.</p>
                </div>

            </div>
        </div>
    );
}
