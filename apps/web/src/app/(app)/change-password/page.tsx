'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { authApi } from '@/features/auth/api';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import {
    ShieldCheck,
    Lock,
    Eye,
    EyeOff,
    CheckCircle2,
    Save,
    Loader2
} from 'lucide-react';

// --- Component ---

export default function ChangePasswordContent() {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const [isLoading, setIsLoading] = useState(false);

    const toggleShow = (key: keyof typeof showPasswords) => {
        setShowPasswords(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Password validation logic
    const checks = {
        length: formData.newPassword.length >= 6 && formData.newPassword.length <= 12,
        hasLetter: /[a-zA-Z]/.test(formData.newPassword),
        hasNumber: /[0-9]/.test(formData.newPassword),
        hasSpecial: /[!@#$%^&*]/.test(formData.newPassword),
        match: formData.newPassword === formData.confirmPassword && formData.newPassword !== '',
    };

    const isStrong = checks.length && checks.hasLetter && checks.hasNumber && checks.hasSpecial;
    const isValid = isStrong && checks.match;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isValid) {
            toast.error('Vui lòng đảm bảo mật khẩu mới đáp ứng tất cả yêu cầu');
            return;
        }

        setIsLoading(true);
        try {
            await authApi.changePassword(formData.currentPassword, formData.newPassword);
            toast.success('Đổi mật khẩu thành công! ✨');
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            const msg = error?.response?.data?.error || error?.message || 'Có lỗi xảy ra, vui lòng thử lại';
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-[#f8fafc] px-4 pb-12 animate-in fade-in duration-500">
            <div className="max-w-[1280px] mx-auto pt-6">

                {/* 1. Header Section */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center shadow-xl shadow-brand/20">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 leading-none">Đổi mật khẩu</h1>
                            <p className="text-sm text-slate-500 mt-1.5 font-medium">Bảo vệ tài khoản của bạn bằng mật khẩu mạnh</p>
                        </div>
                    </div>
                </div>

                {/* 2. Main content area */}
                <div className="flex flex-col items-center justify-center py-4">
                    <div className="w-full max-w-[500px] bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">

                        <div className="p-8 sm:p-10">
                            <form onSubmit={handleSubmit} className="space-y-7">

                                {/* Current Password */}
                                <div className="space-y-2.5">
                                    <label className="text-[13px] font-black text-slate-700 uppercase tracking-wider ml-1">Mật khẩu hiện tại</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand transition-colors">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <input
                                            name="currentPassword"
                                            type={showPasswords.current ? "text" : "password"}
                                            value={formData.currentPassword}
                                            onChange={handleChange}
                                            required
                                            placeholder="Nhập mật khẩu cũ"
                                            className="block w-full h-12 pl-12 pr-12 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand focus:bg-white transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => toggleShow('current')}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-brand-hover transition-colors"
                                        >
                                            {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="relative py-2">
                                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
                                    <div className="relative flex justify-center"><span className="bg-white px-4 text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] leading-none text-center">Mật khẩu mới</span></div>
                                </div>

                                {/* New Password */}
                                <div className="space-y-2.5">
                                    <label className="text-[13px] font-black text-slate-700 uppercase tracking-wider ml-1">Mật khẩu mới</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand transition-colors">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <input
                                            name="newPassword"
                                            type={showPasswords.new ? "text" : "password"}
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            required
                                            placeholder="Tạo mật khẩu mạnh"
                                            className="block w-full h-12 pl-12 pr-12 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand focus:bg-white transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => toggleShow('new')}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-brand-hover transition-colors"
                                        >
                                            {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    {/* Strength indicators */}
                                    <div className="pt-2 grid grid-cols-2 gap-y-2 gap-x-4 px-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                                        <div className={cn("flex items-center gap-2 text-[12px] transition-colors", checks.length ? "text-emerald-600 font-bold" : "text-slate-400 font-medium")}>
                                            <CheckCircle2 className={cn("w-4 h-4", checks.length ? "text-emerald-500" : "text-transparent fill-slate-200")} />
                                            6-12 ký tự
                                        </div>
                                        <div className={cn("flex items-center gap-2 text-[12px] transition-colors", checks.hasLetter ? "text-emerald-600 font-bold" : "text-slate-400 font-medium")}>
                                            <CheckCircle2 className={cn("w-4 h-4", checks.hasLetter ? "text-emerald-500" : "text-transparent fill-slate-200")} />
                                            Chứa chữ cái
                                        </div>
                                        <div className={cn("flex items-center gap-2 text-[12px] transition-colors", checks.hasNumber ? "text-emerald-600 font-bold" : "text-slate-400 font-medium")}>
                                            <CheckCircle2 className={cn("w-4 h-4", checks.hasNumber ? "text-emerald-500" : "text-transparent fill-slate-200")} />
                                            Chứa con số
                                        </div>
                                        <div className={cn("flex items-center gap-2 text-[12px] transition-colors", checks.hasSpecial ? "text-emerald-600 font-bold" : "text-slate-400 font-medium")}>
                                            <CheckCircle2 className={cn("w-4 h-4", checks.hasSpecial ? "text-emerald-500" : "text-transparent fill-slate-200")} />
                                            Ký tự đặc biệt (!@#)
                                        </div>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-2.5">
                                    <label className="text-[13px] font-black text-slate-700 uppercase tracking-wider ml-1">Xác nhận mật khẩu</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand transition-colors">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <input
                                            name="confirmPassword"
                                            type={showPasswords.confirm ? "text" : "password"}
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                            placeholder="Nhập lại mật khẩu mới"
                                            className={cn(
                                                "block w-full h-12 pl-12 pr-12 bg-slate-50 border rounded-2xl text-[15px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 transition-all",
                                                formData.confirmPassword && !checks.match ? "border-red-300 focus:ring-red-500/10 focus:border-red-500" : "border-slate-200 focus:ring-brand/10 focus:border-brand focus:bg-white"
                                            )}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => toggleShow('confirm')}
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-brand-hover transition-colors"
                                        >
                                            {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {formData.confirmPassword && !checks.match && (
                                        <p className="text-[12px] text-red-600 font-bold pl-1 mt-1 animate-in slide-in-from-top-1">Mật khẩu xác nhận không khớp</p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    isLoading={isLoading}
                                    disabled={!isValid || isLoading}
                                    className={cn(
                                        "w-full h-13 rounded-2xl text-[16px] font-black shadow-lg transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2",
                                        isValid
                                            ? "bg-brand hover:bg-brand-hover text-white shadow-brand/20"
                                            : "bg-surface-1 text-vttext-muted cursor-not-allowed"
                                    )}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            ĐANG XỬ LÝ...
                                        </>
                                    ) : 'CẬP NHẬT MẬT KHẨU'}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* 3. Footer info */}
                <div className="mt-12 text-center space-y-3">
                    <div className="inline-flex items-center gap-2 text-[11px] font-black pointer-events-none text-emerald-600 uppercase tracking-[0.2em] bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        Mật khẩu đã được mã hóa 256-bit
                    </div>
                    <p className="text-sm font-medium text-slate-400">
                        Vui lòng lưu trữ mật khẩu ở nơi an toàn và không chia sẻ cho người khác.
                    </p>
                </div>

            </div>
        </div>
    );
}
