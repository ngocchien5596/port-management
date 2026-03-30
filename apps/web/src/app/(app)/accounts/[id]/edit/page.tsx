'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAccount, useUpdateAccount } from '@/features/accounts';
import {
    ChevronLeft,
    User,
    Mail,
    Fingerprint,
    Lock,
    Briefcase,
    ShieldCheck,
    AlertCircle,
    Check,
    ToggleLeft,
    ToggleRight
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function EditAccountPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { id } = params;

    const { data: account, isLoading: isLoadingAccount, error: fetchError } = useAccount(id);
    const updateAccount = useUpdateAccount();

    const [formData, setFormData] = useState({
        fullName: '',
        employeeCode: '',
        email: '',
        role: 'EMPLOYEE',
        password: '',
        isActive: true
    });

    const [error, setError] = useState<string | null>(null);

    // Sync data when loaded
    useEffect(() => {
        if (account) {
            setFormData(prev => ({
                ...prev,
                fullName: account.fullName,
                employeeCode: account.employeeCode,
                email: account.email || '',
                role: account.role || 'EMPLOYEE',
                isActive: account.isActive
            }));
        }
    }, [account]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleToggleActive = () => {
        setFormData(prev => ({ ...prev, isActive: !prev.isActive }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            await updateAccount.mutateAsync({
                id,
                data: {
                    ...formData,
                    email: formData.email || undefined,
                    password: formData.password || undefined,
                }
            });
            toast.success('Cập nhật tài khoản thành công! ✨');
            router.push('/accounts');
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.error?.message || err.message || 'Lỗi không xác định';
            setError(msg);
            toast.error(`Không thể cập nhật: ${msg}`);
        }
    };

    if (isLoadingAccount) return (
        <div className="w-full min-h-[400px] flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-brand-soft/20 border-t-brand rounded-full animate-spin" />
            <p className="text-sm font-bold text-slate-400">Đang tải thông tin...</p>
        </div>
    );

    if (fetchError) return (
        <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Không tìm thấy tài khoản</h2>
            <Link href="/accounts" className="text-brand font-bold hover:underline transition-all">Quay lại danh sách</Link>
        </div>
    );

    return (
        <div className="w-full min-h-screen bg-[#f8fafc] px-4 pb-12 animate-in fade-in duration-500">
            <div className="max-w-[1280px] mx-auto pt-6">

                {/* 1. Header Section */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <Link
                            href="/accounts"
                            className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-brand hover:border-brand-soft transition-all shadow-sm active:scale-95"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center shadow-xl shadow-brand/20">
                                <User className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 leading-none">Chỉnh sửa tài khoản</h1>
                                <p className="text-sm text-slate-500 mt-1.5 font-medium">Cập nhật thông tin nhân viên {formData.fullName}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Main content area */}
                <div className="max-w-4xl mx-auto py-4">
                    <form onSubmit={handleSubmit} className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">

                        {/* Form Body Header */}
                        <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-black text-slate-800">Thông tin nhân viên</h2>
                                <p className="text-sm text-slate-500 font-medium mt-1">Cập nhật các trường thông tin cần thiết</p>
                            </div>

                            {/* Status Toggle */}
                            <button
                                type="button"
                                onClick={handleToggleActive}
                                className={cn(
                                    "px-4 py-2 rounded-2xl border flex items-center gap-3 transition-all active:scale-95",
                                    formData.isActive
                                        ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                                        : "bg-slate-50 border-slate-200 text-slate-400"
                                )}
                            >
                                <span className="text-[11px] font-black uppercase tracking-wider">
                                    {formData.isActive ? 'Đang hoạt động' : 'Ngưng hoạt động'}
                                </span>
                                {formData.isActive ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                            </button>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="px-8 pt-6">
                                <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
                                    <AlertCircle className="w-5 h-5" />
                                    <span className="text-sm font-bold">{error}</span>
                                </div>
                            </div>
                        )}

                        <div className="p-8 space-y-10">
                            {/* Section 1: Thông tin cơ bản */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-7 h-7 bg-brand-soft rounded-lg flex items-center justify-center">
                                        <User className="w-4 h-4 text-brand" />
                                    </div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Thông tin cơ bản</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Full Name */}
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-black text-slate-700 uppercase tracking-wider ml-1">Họ và tên <span className="text-rose-500">*</span></label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <input
                                                type="text"
                                                name="fullName"
                                                required
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                className="block w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all"
                                                placeholder="Nhập họ tên nhân viên"
                                            />
                                        </div>
                                    </div>

                                    {/* Employee Code */}
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-black text-slate-700 uppercase tracking-wider ml-1">Mã nhân viên <span className="text-rose-500">*</span></label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                                <Fingerprint className="w-5 h-5" />
                                            </div>
                                            <input
                                                type="text"
                                                name="employeeCode"
                                                required
                                                value={formData.employeeCode}
                                                onChange={handleChange}
                                                className="block w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-bold font-mono tracking-wider text-slate-900 placeholder:font-sans placeholder:tracking-normal placeholder:font-medium placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all"
                                                placeholder="VD: NV001"
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[13px] font-black text-slate-700 uppercase tracking-wider ml-1">Địa chỉ Email</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                                <Mail className="w-5 h-5" />
                                            </div>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="block w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all"
                                                placeholder="example@company.com"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Divider line */}
                            <div className="h-px bg-slate-100 w-full" />

                            {/* Divider line removed */}

                            {/* Section 3: Cài đặt tài khoản */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center">
                                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                                    </div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Thiết lập hệ thống</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Role */}
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-black text-slate-700 uppercase tracking-wider ml-1">Vai trò hệ thống</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                                <ShieldCheck className="w-5 h-5" />
                                            </div>
                                            <select
                                                name="role"
                                                value={formData.role}
                                                onChange={handleChange}
                                                className="block w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="EMPLOYEE">NHÂN VIÊN (MẶC ĐỊNH)</option>
                                                <option value="ADMIN_SYSTEM">ADMIN HỆ THỐNG</option>
                                                <option value="ADMIN_KITCHEN">ADMIN NHÀ ĂN</option>
                                                <option value="HR">NHÂN SỰ (HR)</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                                                <ChevronLeft className="w-4 h-4 -rotate-90" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div className="space-y-2">
                                        <label className="text-[13px] font-black text-slate-700 uppercase tracking-wider ml-1">Đặt lại mật khẩu</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                                <Lock className="w-5 h-5" />
                                            </div>
                                            <input
                                                type="text"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                className="block w-full h-12 pl-12 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-[15px] font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all"
                                                placeholder="Nhập để đổi mật khẩu mới"
                                            />
                                        </div>
                                        <p className="text-[11px] font-medium text-slate-400 mt-1.5 ml-1 italic">* Để trống nếu không muốn thay đổi mật khẩu.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Footer */}
                        <div className="px-8 py-8 bg-slate-50/50 border-t border-slate-50 flex items-center justify-end gap-4">
                            <Link
                                href="/accounts"
                                className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-bold rounded-2xl transition-all shadow-sm active:scale-95"
                            >
                                Hủy bỏ
                            </Link>
                            <button
                                type="submit"
                                disabled={updateAccount.isPending}
                                className="px-8 py-3 bg-brand hover:bg-brand-hover text-white text-sm font-black rounded-2xl transition-all shadow-lg shadow-brand/20 active:scale-[0.98] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {updateAccount.isPending ? (
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Check className="w-4 h-4" />
                                )}
                                {updateAccount.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Secure Badge */}
                <div className="mt-8 flex flex-col items-center gap-2">
                    <div className="inline-flex items-center gap-2 text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100 pointer-events-none">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Dữ liệu được bảo mật an toàn
                    </div>
                </div>

            </div>
        </div>
    );
}
