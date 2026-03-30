'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { Home, Ship, Timer, LayoutPanelLeft, Lock } from 'lucide-react';

interface MobileNavProps {
    userRole?: string;
}

export function MobileNav({ userRole }: MobileNavProps) {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === '/dashboard' || href === '/') {
            return pathname === '/dashboard' || pathname === '/';
        }
        return pathname.startsWith(href);
    };

    return (
        <>
            {/* Height spacer to prevent content from being hidden behind nav */}
            <div className="h-16 md:hidden" />

            {/* Bottom Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden pb-safe">
                <div className="flex items-center justify-around h-16 px-2">
                    {/* 1. Dashboard */}
                    <Link
                        href="/dashboard"
                        className={cn(
                            "flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors",
                            isActive('/dashboard') ? "text-brand" : "text-gray-400 hover:text-gray-600"
                        )}
                    >
                        <Home size={22} strokeWidth={isActive('/dashboard') ? 2.5 : 2} />
                        <span className="text-[10px] font-bold">Trang chủ</span>
                    </Link>

                    {/* 2. Voyages */}
                    <Link
                        href="/voyages"
                        className={cn(
                            "flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors",
                            isActive('/voyages') ? "text-brand" : "text-gray-400 hover:text-gray-600"
                        )}
                    >
                        <Timer size={22} strokeWidth={isActive('/voyages') ? 2.5 : 2} />
                        <span className="text-[10px] font-bold">Chuyến</span>
                    </Link>

                    {/* 3. Vessels */}
                    <Link
                        href="/vessels"
                        className={cn(
                            "flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors",
                            isActive('/vessels') ? "text-brand" : "text-gray-400 hover:text-gray-600"
                        )}
                    >
                        <Ship size={22} strokeWidth={isActive('/vessels') ? 2.5 : 2} />
                        <span className="text-[10px] font-bold">Tàu</span>
                    </Link>



                    {/* 5. Password */}
                    <Link
                        href="/change-password"
                        className={cn(
                            "flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors",
                            isActive('/change-password') ? "text-brand" : "text-gray-400 hover:text-gray-600"
                        )}
                    >
                        <Lock size={22} strokeWidth={isActive('/change-password') ? 2.5 : 2} />
                        <span className="text-[10px] font-bold">Mật khẩu</span>
                    </Link>
                </div>
            </div>
        </>
    );
}
