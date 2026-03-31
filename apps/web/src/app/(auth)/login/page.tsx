'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth';
import { Eye, EyeOff } from 'lucide-react';

// Professional port-themed background
const bgUrl = "/login_bg.png";

export default function LoginPage() {
    const router = useRouter();
    const { login, isLoading, error, isAuthenticated, checkAuth, _hasHydrated } = useAuthStore();
    const [employeeCode, setEmployeeCode] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (_hasHydrated) {
            checkAuth();
        }
    }, [_hasHydrated, checkAuth]);

    useEffect(() => {
        if (mounted && _hasHydrated && isAuthenticated) {
            router.replace('/dashboard');
        }
    }, [mounted, _hasHydrated, isAuthenticated, router]);

    if (!mounted || !_hasHydrated || isAuthenticated) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await login(employeeCode, password);
        if (success) {
            router.push('/dashboard');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 shrink-0 z-20">
                {/* Logo container */}
                <div className="w-11 h-11 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-gray-100 p-1 shadow-sm">
                    <img src="/logo_new.png" alt="Logo" className="w-full h-full object-contain" />
                </div>

                {/* Title */}
                <div className="ml-4">
                    <h1 className="text-lg font-bold text-gray-900 leading-tight">
                        HỆ THỐNG QUẢN LÝ CẢNG
                    </h1>
                    <p className="text-sm text-gray-500 leading-tight">
                        CÔNG TY CP XI MĂNG CẨM PHẢ
                    </p>
                </div>
            </header>

            {/* Main content with background */}
            <main
                className="flex-1 relative flex items-center justify-center p-4 overflow-hidden"
                style={{
                    backgroundImage: `url(${bgUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                {/* Dark overlay with subtle blur */}
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] z-0" />

                {/* Login card - Refined Professional Design */}
                <div className="relative z-10 w-full max-w-[480px] bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-10 border border-white/20">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Đăng nhập</h2>
                        <p className="text-gray-500 italic text-sm">Vui lòng đăng nhập để truy cập hệ thống quản trị</p>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-3">
                            <svg className="w-5 h-5 text-red-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <p className="text-sm text-red-600 font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Employee Code Field */}
                        <div>
                            <label className="flex items-center gap-2 mb-2">
                                {/* User icon */}
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="text-gray-600"
                                >
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                </svg>
                                <span className="font-semibold text-gray-700">Mã nhân viên</span>
                            </label>
                            <input
                                type="text"
                                value={employeeCode}
                                onChange={(e) => setEmployeeCode(e.target.value)}
                                placeholder="Nhập mã nhân viên của bạn"
                                className="w-full h-12 px-4 border border-vtborder rounded-lg focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent placeholder:text-vttext-muted placeholder:italic transition-all duration-200"
                                required
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-vttext-secondary">Mật khẩu</span>
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-vttext-secondary">
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="text-vttext-secondary"
                                    >
                                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu"
                                    className="w-full h-12 pl-12 pr-12 border border-vtborder rounded-lg focus:outline-none focus:ring-2 focus:ring-focus focus:border-transparent transition-all duration-200"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-brand transition-colors focus:outline-none"
                                    tabIndex={-1}
                                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2 flex flex-col gap-3">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 bg-brand hover:bg-brand-hover text-white font-bold rounded-lg shadow-lg shadow-brand/20 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {isLoading ? 'Đang xác thực...' : 'ĐĂNG NHẬP'}
                            </button>
                        </div>

                        {/* Help Link */}
                        <div className="text-center">
                            <a
                                href="#"
                                className="inline-block mt-4 text-brand font-medium underline text-sm hover:text-brand-hover transition-colors cursor-pointer"
                            >
                                Quên mật khẩu? Liên hệ Admin để cấp lại.
                            </a>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
