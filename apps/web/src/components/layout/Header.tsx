'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LogOut, Menu, X, FileText } from 'lucide-react';
import { useLogout } from '@/features/auth';
import { NotificationCenter } from './NotificationCenter';

interface HeaderProps {
    user?: {
        fullName: string;
        employeeCode: string;
    };
    userRole?: string;
}

export function Header({ user, userRole }: HeaderProps) {
    const { logout } = useLogout();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [mounted, setMounted] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    if (!mounted) return <header className="h-[72px] bg-white border-b border-gray-200 shadow-sm z-10" />;

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const getInitial = (name: string) => {
        return name.charAt(0).toUpperCase();
    };

    return (
        <>
            <header className="h-16 md:h-[72px] bg-white border-b border-gray-200 flex items-center px-4 md:px-6 shrink-0 justify-between relative z-50">
                {/* Left - Hamburger (Mobile) + Logo */}
                <div className="flex items-center">
                    {/* Hamburger Button */}
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="md:hidden p-2 -ml-2 mr-2 text-gray-600 hover:bg-gray-100 rounded-full active:bg-gray-200 transition-colors"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="w-10 h-10 md:w-11 md:h-11 bg-white rounded flex items-center justify-center overflow-hidden border border-gray-100 p-1">
                        <img src="/logo_new.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <div className="ml-3 md:ml-4">
                        <h1 className="text-base md:text-lg font-bold text-gray-900 leading-tight line-clamp-1">
                            HỆ THỐNG QUẢN LÝ CẢNG
                        </h1>
                        <p className="text-xs lg:text-sm text-gray-500 leading-tight hidden sm:block">
                            CÔNG TY CP XI MĂNG CẨM PHẢ
                        </p>
                    </div>
                </div>

                {/* Center - Time (Hidden on Mobile) */}
                <div className="flex-1 flex justify-center hidden md:flex">
                    <div className="text-center">
                        <div className="text-3xl font-semibold text-gray-900">{formatTime(currentTime)}</div>
                        <div className="text-sm text-gray-500">{formatDate(currentTime)}</div>
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    <NotificationCenter />
                    <div className="text-right hidden sm:block">
                        <div className="font-semibold text-vttext-primary text-sm md:text-base">{user?.fullName || 'Khách'}</div>
                        <div className="text-xs md:text-sm text-vttext-secondary">Mã NV: {user?.employeeCode || '---'}</div>
                    </div>
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-brand rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-base">
                        {user?.fullName ? getInitial(user.fullName) : 'G'}
                    </div>
                    <button
                        onClick={logout}
                        className="p-1.5 md:p-2 text-vttext-muted hover:text-brand hover:bg-brand-soft rounded-lg transition-all duration-200"
                        title="Đăng xuất"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Mobile Menu Drawer */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-[60] md:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={() => setIsMenuOpen(false)}
                    />

                    {/* Drawer Panel */}
                    <div className="absolute top-0 left-0 bottom-0 w-[80%] max-w-[300px] bg-white shadow-2xl animate-in slide-in-from-left duration-200 flex flex-col">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-200 p-0.5">
                                    <img src="/logo_new.png" alt="Logo" className="w-full h-full object-contain" />
                                </div>
                                <span className="font-bold text-gray-800 text-lg">Menu</span>
                            </div>
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="p-2 bg-white rounded-full shadow-sm text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all border border-gray-100"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {/* User Info Card */}
                            <div className="mb-6 p-4 bg-brand-soft/50 rounded-2xl border border-brand-soft flex items-center gap-3">
                                <div className="w-10 h-10 bg-brand rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm">
                                    {user?.fullName ? getInitial(user.fullName) : 'G'}
                                </div>
                                <div className="overflow-hidden">
                                    <div className="font-bold text-gray-900 truncate">{user?.fullName || 'Khách'}</div>
                                    <div className="text-xs text-gray-500 truncate">Mã NV: {user?.employeeCode || '---'}</div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Quản lý</p>

                                {['PORT_OPERATOR', 'ADMIN_SYSTEM'].includes(userRole || '') && (
                                    <Link
                                        href="/voyages"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-brand-soft text-gray-700 hover:text-brand font-medium transition-colors group"
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-brand-soft text-brand flex items-center justify-center group-hover:bg-brand-soft group-hover:scale-105 transition-all">
                                            <FileText size={18} />
                                        </div>
                                        Quản lý chuyến tàu
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-200 hover:bg-red-50 hover:border-red-100 hover:text-red-600 text-gray-600 font-medium shadow-sm transition-all"
                            >
                                <LogOut size={18} />
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
