'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAccounts, useDeleteAccount } from '@/features/accounts';
import { useAuthStore } from '@/features/auth';
import { ConfirmDialog } from '@/components/ui';
import { formatDateTime } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';

import {
    Users,
    Search,
    Plus,
    Filter,
    ChevronDown,
    Edit,
    Trash2,
    FileUp,
    Loader2,
    Building2,
    ShieldCheck,
    Briefcase,
    UserCheck,
    UserX,
    UserPlus
} from 'lucide-react';

const StatCard = ({
    label,
    value,
    subValue,
    icon: Icon,
    color
}: {
    label: string,
    value: string | number,
    subValue?: string,
    icon: any,
    color: 'brand' | 'emerald' | 'rose' | 'amber'
}) => {
    const colorConfigs = {
        emerald: "bg-emerald-50 text-emerald-600",
        rose: "bg-rose-50 text-rose-600",
        brand: "bg-brand-soft text-brand",
        amber: "bg-amber-50 text-amber-600",
    };

    return (
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
            <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                colorConfigs[color]
            )}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-sm font-bold text-slate-500">{label}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className={cn(
                        "text-2xl font-black tracking-tight",
                        color === 'rose' ? "text-rose-600" :
                            color === 'emerald' ? "text-emerald-600" :
                                color === 'amber' ? "text-amber-600" : "text-slate-900"
                    )}>
                        {value}
                    </h3>
                    {subValue && <span className="text-xs font-medium text-slate-400">{subValue}</span>}
                </div>
            </div>
        </div>
    );
};

export default function AccountManagementContent() {
    const { data: accounts, isLoading: isLoadingAccounts } = useAccounts();
    const deleteAccount = useDeleteAccount();
    const { user } = useAuthStore();
    const canManage = user?.role === 'HR' || user?.role === 'ADMIN_SYSTEM';
    const router = useRouter();

    useEffect(() => {
        if (user && !canManage) {
            router.replace('/dashboard');
        }
    }, [user, canManage, router]);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Confirm Modal State
    const [confirmId, setConfirmId] = useState<string | null>(null);
    const [confirmName, setConfirmName] = useState<string>('');

    const handleDeleteClick = (id: string, name: string) => {
        setConfirmId(id);
        setConfirmName(name);
    };

    const handleConfirmDelete = async () => {
        if (!confirmId) return;
        try {
            await deleteAccount.mutateAsync(confirmId);
            toast.success('Xóa tài khoản thành công!');
        } catch (err: any) {
            const msg = err.response?.data?.error?.message || err.message || 'Lỗi không xác định';
            toast.error(`Lỗi khi xóa: ${msg}`);
        } finally {
            setConfirmId(null);
        }
    };

    const filteredAccounts = accounts?.filter(acc => {
        const matchesSearch = acc.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            acc.employeeCode.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' && acc.isActive) ||
            (filterStatus === 'inactive' && !acc.isActive);

        return matchesSearch && matchesStatus;
    }) || [];

    if (isLoadingAccounts) {
        return (
            <div className="w-full min-h-[400px] flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-brand animate-spin" />
                <p className="text-sm font-bold text-vttext-muted">Đang tải danh sách tài khoản...</p>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-[#f8fafc] px-4 pb-12 animate-in fade-in duration-500">
            <div className="max-w-[1280px] mx-auto pt-6">

                {/* 1. Header & Actions */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center shadow-xl shadow-brand/20">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-vttext-primary leading-none">Quản lý tài khoản</h1>
                            <p className="text-sm text-vttext-muted mt-1.5 font-medium">Danh sách nhân viên và quyền truy cập hệ thống</p>
                        </div>
                    </div>

                    {canManage && (
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <Link
                                href="/accounts/import"
                                className="h-10 px-4 flex items-center gap-2 bg-white border border-vtborder rounded-xl text-sm font-bold text-vttext-secondary hover:bg-surface-2 hover:text-vttext-primary transition-all shadow-sm active:scale-95"
                            >
                                <FileUp className="w-4 h-4" />
                                <span className="hidden sm:inline">Nhập Excel</span>
                            </Link>
                            <Link
                                href="/accounts/create"
                                className="h-10 px-4 flex items-center gap-2 bg-brand hover:bg-brand-hover text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-brand/20 active:scale-95"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Thêm mới</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        label="Tổng nhân sự"
                        value={accounts?.length || 0}
                        icon={Users}
                        color="brand"
                    />
                    <StatCard
                        label="Đang hoạt động"
                        value={accounts?.filter(a => a.isActive).length || 0}
                        icon={UserCheck}
                        color="emerald"
                    />
                    <StatCard
                        label="Ngưng hoạt động"
                        value={accounts?.filter(a => !a.isActive).length || 0}
                        icon={UserX}
                        color="rose"
                    />
                    <StatCard
                        label="Mới tháng này"
                        value={accounts?.filter(a => {
                            if (!a.createdAt) return false;
                            const d = new Date(a.createdAt);
                            const now = new Date();
                            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                        }).length || 0}
                        icon={UserPlus}
                        color="amber"
                    />
                </div>


                <div className="bg-white rounded-[24px] border border-vtborder shadow-xl shadow-slate-200/50 overflow-hidden">
                    {/* Integrated Toolbar */}
                    <div className="p-4 border-b border-surface-2 flex flex-col lg:flex-row gap-4 items-center justify-between bg-white">
                        <div className="relative flex-1 w-full lg:max-w-md">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-vttext-muted">
                                <Search className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                placeholder="Tìm tên hoặc MNV..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full h-10 pl-10 pr-4 bg-surface-2 border border-vtborder rounded-xl text-sm font-medium text-vttext-primary focus:outline-none focus:ring-2 focus:ring-focus focus:border-brand transition-all"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">

                            <div className="relative min-w-[140px] flex-1 lg:flex-none">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-vttext-muted">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="w-full h-10 pl-9 pr-8 bg-white border border-vtborder rounded-xl text-sm font-bold text-vttext-secondary focus:outline-none focus:ring-2 focus:ring-focus focus:border-brand appearance-none cursor-pointer transition-all"
                                >
                                    <option value="all">Trạng thái</option>
                                    <option value="active">Hoạt động</option>
                                    <option value="inactive">Ngưng</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-vttext-muted pointer-events-none" />
                            </div>

                            <div className="h-10 px-4 bg-surface-2 border border-vtborder rounded-xl flex items-center gap-2.5 shrink-0 hidden sm:flex">
                                <span className="text-[10px] font-black text-vttext-muted uppercase tracking-widest">Tổng cộng</span>
                                <span className="text-sm font-black text-brand">{filteredAccounts.length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-100">
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mã NV</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Họ tên nhân viên</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Vai trò</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngày tạo</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Trạng thái</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredAccounts.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate-400 font-bold">
                                            Không có dữ liệu phù hợp
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAccounts.map((account) => (
                                        <tr key={account.id} className="group hover:bg-brand-soft/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <span className="text-sm font-bold font-mono text-vttext-muted tracking-wider">
                                                    {account.employeeCode}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-sm font-medium text-vttext-primary group-hover:text-brand transition-colors">
                                                {account.fullName}
                                            </td>
                                            <td className="py-4 px-6">
                                                {account.role === 'ADMIN_SYSTEM' ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black bg-rose-50 text-rose-600 border border-rose-100 uppercase tracking-wider">
                                                        System Admin
                                                    </span>
                                                ) : account.role === 'ADMIN_KITCHEN' ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-wider">
                                                        Kitchen Admin
                                                    </span>
                                                ) : account.role === 'HR' ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wider">
                                                        HR Manager
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wider">
                                                        Employee
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="text-[13px] font-medium text-slate-400">
                                                    {formatDateTime(account.createdAt)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                {account.isActive ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-black uppercase tracking-wider border border-emerald-100">
                                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-400 text-[11px] font-black uppercase tracking-wider border border-slate-200">
                                                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                {canManage && (
                                                    <div className="flex items-center justify-end gap-1 transition-all">
                                                        <Link
                                                            href={`/accounts/${account.id}/edit`}
                                                            className="p-2 hover:bg-brand-soft rounded-xl text-vttext-muted hover:text-brand transition-colors"
                                                            title="Chỉnh sửa"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDeleteClick(account.id, account.fullName)}
                                                            className="p-2 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-600 transition-colors"
                                                            title="Xóa tài khoản"
                                                            disabled={deleteAccount.isPending}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            <ConfirmDialog
                isOpen={!!confirmId}
                onClose={() => setConfirmId(null)}
                onConfirm={handleConfirmDelete}
                isLoading={deleteAccount.isPending}
                title="Xác nhận xóa tài khoản"
                description={`Bạn có chắc chắn muốn xóa tài khoản của "${confirmName}"? Hành động này không thể hoàn tác và toàn bộ dữ liệu sẽ bị loại bỏ.`}
                confirmText="Xác nhận xóa"
                cancelText="Hủy bỏ"
                type="danger"
            />
        </div>
    );
}
