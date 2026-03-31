import { Voyage } from '@/features/qltau/types';

export const Icon = ({ path, className = "w-5 h-5" }: { path: string, className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={path} />
    </svg>
);

export const PATHS = {
    ship: "M2 21h20M2 17h20M5 17l1.5-4h11l1.5 4M9 13V9a2 2 0 012-2h2a2 2 0 012 2v4",
    crane: "M12 2v20M5 7l7-5 7 5M5 7v10h14V7M2 17h20",
    alert: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
    activity: "M22 12h-4l-3 9L9 3l-3 9H2",
    clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    check: "M20 6L9 17l-5-5",
    arrowRight: "M5 12h14M12 5l7 7-7 7",
    anchor: "M12 2v6M12 22v-3m-6.17-5a6.27 6.27 0 0012.34 0M2 12h20",
    package: "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
};

export const mapStatus = (dbStatus: string) => {
    switch (dbStatus) {
        case 'LAM_HANG': return 'LOADING';
        case 'TAM_DUNG': return 'SUSPENDED';
        case 'HOAN_THANH': return 'DEPARTED';
        case 'HUY_BO': return 'CANCELLED';
        case 'NHAP':
        case 'THU_TUC':
        case 'DO_MON_DAU_VAO':
        case 'LAY_MAU':
        case 'DO_MON_DAU_RA':
            return 'WAITING';
        default: return dbStatus;
    }
};

export const STATUS_LABELS: Record<string, string> = {
    'LOADING': 'Làm hàng',
    'WAITING': 'Đang chờ',
    'DELAY': 'Chậm trễ',
    'SUSPENDED': 'Tạm dừng',
    'DEPARTED': 'Đã rời bến',
    'ACTIVE': 'Hoạt động',
    'IDLE': 'Đang rảnh',
    'MAINTENANCE': 'Bảo trì',
    'ERROR': 'Lỗi',
    'NORMAL': 'Bình thường',
    'WARNING': 'Cảnh báo',
    'CANCELLED': 'Hủy bỏ',
    'REPAIR': 'Sửa chữa',
};

export const getStatusLabel = (status: string) => {
    const uiStatus = mapStatus(status).toUpperCase();
    return STATUS_LABELS[uiStatus] || status;
};

export const getStatusStyles = (status: string) => {
    const uiStatus = mapStatus(status).toUpperCase();
    switch (uiStatus) {
        case 'LOADING': case 'ACTIVE': case 'NORMAL': case 'BUSY':
            return {
                bg: 'bg-emerald-500/10', text: 'text-emerald-700', border: 'border-emerald-500/20', dot: 'bg-emerald-500',
                solidBg: 'bg-emerald-600', solidText: 'text-white'
            };
        case 'WAITING': case 'IDLE': case 'WARNING':
            return {
                bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400',
                solidBg: 'bg-slate-500', solidText: 'text-white'
            };
        case 'DELAY': case 'ERROR': case 'MAINTENANCE': case 'REPAIR':
            return {
                bg: 'bg-red-500/10', text: 'text-red-700', border: 'border-red-500/20', dot: 'bg-red-500',
                solidBg: 'bg-red-600', solidText: 'text-white'
            };
        case 'SUSPENDED':
            return {
                bg: 'bg-amber-500/10', text: 'text-amber-700', border: 'border-amber-500/20', dot: 'bg-amber-500',
                solidBg: 'bg-amber-600', solidText: 'text-white'
            };
        case 'DEPARTED':
            return {
                bg: 'bg-blue-500/10', text: 'text-blue-700', border: 'border-blue-500/20', dot: 'bg-blue-500',
                solidBg: 'bg-blue-600', solidText: 'text-white'
            };
        default:
            return {
                bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400',
                solidBg: 'bg-slate-500', solidText: 'text-white'
            };
    }
};
