'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { ChevronDown, ChevronRight, Package, Map, Cpu, BarChart3, Activity } from 'lucide-react';

// Icons
const DashboardIcon = ({ className = "w-[18px] h-[18px]" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
    </svg>
);

const VesselIcon = ({ className = "w-[18px] h-[18px]" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
        <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.26.59 4.39 1.62 6.22" />
        <path d="M12 10V2" />
        <path d="M12 5H8" />
    </svg>
);

const VoyageIcon = ({ className = "w-[18px] h-[18px]" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);


const ZoneIcon = ({ className = "w-[18px] h-[18px]" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

const IdCardIcon = ({ className = "w-[18px] h-[18px]" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <circle cx="8" cy="12" r="2" />
        <path d="M14 10h4" />
        <path d="M14 14h4" />
    </svg>
);

const SettingsIcon = ({ className = "w-[18px] h-[18px]" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const LockIcon = ({ className = "w-[18px] h-[18px]" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const IncidentIcon = ({ className = "w-[18px] h-[18px]" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

interface MenuItem {
    key: string;
    label: string;
    href?: string;
    icon: React.ComponentType<{ className?: string }>;
    roles?: string[];
    children?: MenuItem[];
}

const menuItems: MenuItem[] = [
    { key: 'dashboard', label: 'Bảng điều khiển', href: '/dashboard', icon: DashboardIcon },
    { key: 'voyages', label: 'Quản lý chuyến tàu', href: '/voyages', icon: VoyageIcon, roles: ['MANAGER', 'STAFF'] },
    { key: 'vessels', label: 'Danh mục tàu', href: '/vessels', icon: VesselIcon, roles: ['MANAGER', 'STAFF'] },
    { key: 'incidents', label: 'Nhật ký sự cố', href: '/incidents', icon: IncidentIcon, roles: ['MANAGER', 'STAFF'] },
    {
        key: 'reports',
        label: 'Báo cáo & KPI',
        icon: Package,
        roles: ['MANAGER', 'STAFF'],
        children: [
            { key: 'volumeReport', label: 'Báo Cáo Sản lượng', href: '/reports/volume', icon: Package, roles: ['MANAGER', 'STAFF'] },
            { key: 'productivityPort', label: 'Năng suất Toàn Cảng', href: '/reports/productivity/port', icon: BarChart3, roles: ['MANAGER', 'STAFF'] },
            { key: 'productivityEquipment', label: 'Năng suất Thiết bị', href: '/reports/productivity/equipment', icon: Activity, roles: ['MANAGER', 'STAFF'] }
        ]
    },
    {
        key: 'systemConfig',
        label: 'Cấu hình hệ thống',
        icon: SettingsIcon,
        roles: ['MANAGER', 'STAFF'], // Allow parents but children will be restricted
        children: [
            { key: 'cargoTypes', label: 'Loại hàng', href: '/config/cargo-types', icon: Package, roles: ['MANAGER', 'STAFF'] },
            { key: 'lanes', label: 'Quản lý luồng', href: '/config/lanes', icon: Map, roles: ['MANAGER'] },
            { key: 'equipment', label: 'Thiết bị cẩu', href: '/config/equipment', icon: Cpu, roles: ['MANAGER'] },
            { key: 'procedureTime', label: 'Thời gian thủ tục', href: '/config/procedure-time', icon: SettingsIcon, roles: ['MANAGER'] },
            { key: 'shifts', label: 'Cấu hình ca làm việc', href: '/config/shifts', icon: SettingsIcon, roles: ['MANAGER'] },
            { key: 'accounts', label: 'Cấp tài khoản', href: '/accounts', icon: IdCardIcon, roles: ['MANAGER'] },
            { key: 'password', label: 'Đổi mật khẩu', href: '/change-password', icon: LockIcon },
        ]
    },
];

export function LeftMenu({ userRole }: { userRole?: string }) {
    const pathname = usePathname();
    const [expandedKeys, setExpandedKeys] = useState<string[]>(['systemConfig']);

    const isActive = (href: string) => {
        if (!href) return false;
        if (href === '/dashboard' || href === '/') {
            return pathname === '/dashboard' || pathname === '/';
        }
        return pathname.startsWith(href);
    };

    const isParentActive = (item: MenuItem) => {
        if (item.href && isActive(item.href)) return true;
        if (item.children) {
            return item.children.some(child => child.href && isActive(child.href));
        }
        return false;
    };

    const toggleExpand = (key: string) => {
        setExpandedKeys(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    // Auto expand parent if child is active
    useEffect(() => {
        menuItems.forEach(item => {
            if (item.children && isParentActive(item)) {
                if (!expandedKeys.includes(item.key)) {
                    setExpandedKeys(prev => [...prev, item.key]);
                }
            }
        });
    }, [pathname]);

    const renderItem = (item: MenuItem, isChild = false) => {
        // Role check
        if (item.roles && (!userRole || !item.roles.includes(userRole))) {
            return null;
        }

        const active = item.href ? isActive(item.href) : false;
        const parentActive = isParentActive(item);
        const isExpanded = expandedKeys.includes(item.key);
        const hasChildren = !!item.children && item.children.length > 0;
        const Icon = item.icon;

        const content = (
            <div
                className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-all duration-150',
                    isChild ? 'pl-11 py-2' : '',
                    active
                        ? 'bg-red-50 text-vt-primary shadow-sm'
                        : parentActive && !isExpanded
                            ? 'bg-slate-50 text-vt-primary font-bold'
                            : 'text-slate-600 hover:bg-slate-50'
                )}
                onClick={() => hasChildren && toggleExpand(item.key)}
            >
                <Icon className={cn(
                    isChild ? 'w-4 h-4' : 'w-[18px] h-[18px]',
                    active || (parentActive && !isExpanded) ? 'stroke-vt-primary' : 'stroke-slate-500'
                )} />
                <span className={cn(
                    isChild ? 'text-[14px]' : 'text-[15px]',
                    'font-medium flex-1'
                )}>
                    {item.label}
                </span>
                {hasChildren && (
                    <div className="text-slate-400">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                )}
            </div>
        );

        return (
            <div key={item.key} className="w-full">
                {item.href ? (
                    <Link href={item.href} className="w-full block">
                        {content}
                    </Link>
                ) : (
                    content
                )}

                {hasChildren && isExpanded && (
                    <div className="mt-1 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                        {item.children!.map(child => renderItem(child, true))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <aside className="w-[240px] bg-white pt-4 pl-4 pr-3 shrink-0 h-full border-r border-gray-100 flex flex-col">
            <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-1">
                {menuItems.map(item => renderItem(item))}
            </nav>

            {/* Version / Info at bottom if needed */}
            <div className="mt-auto py-4 px-4 border-t border-gray-50">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Phiên bản 1.0</p>
            </div>
        </aside>
    );
}
