import { Circle, Clock, Info, History, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * Centralized configuration for Voyage Statuses
 * Includes Labels, Tailwind CSS classes for colors, icons, and descriptions.
 */

export const VOYAGE_STATUS_CONFIG: Record<string, { 
    label: string; 
    color: string; 
    bg: string; 
    border: string;
    icon: any;
    description?: string;
}> = {
    'NHAP': { 
        label: 'Nháp', 
        color: 'text-slate-600', 
        bg: 'bg-slate-50', 
        border: 'border-slate-200',
        icon: Circle,
        description: 'Mới khởi tạo' 
    },
    'THU_TUC': { 
        label: 'Làm thủ tục', 
        color: 'text-indigo-700', 
        bg: 'bg-indigo-50', 
        border: 'border-indigo-100',
        icon: Clock,
        description: 'Đang hoàn thiện hồ sơ'
    },
    'DO_MON_DAU_VAO': { 
        label: 'Đo mớn đầu vào', 
        color: 'text-violet-700', 
        bg: 'bg-violet-50', 
        border: 'border-violet-100',
        icon: Info,
        description: 'Xác định lượng hàng thực tế'
    },
    'LAY_MAU': { 
        label: 'Lấy mẫu', 
        color: 'text-purple-700', 
        bg: 'bg-purple-50', 
        border: 'border-purple-100',
        icon: Info,
        description: 'Kiểm định chất lượng'
    },
    'LAM_HANG': { 
        label: 'Làm hàng', 
        color: 'text-emerald-700', 
        bg: 'bg-emerald-50', 
        border: 'border-emerald-100',
        icon: History,
        description: 'Đang bốc/dỡ hàng'
    },
    'DO_MON_DAU_RA': { 
        label: 'Đo mớn đầu ra', 
        color: 'text-cyan-700', 
        bg: 'bg-cyan-50', 
        border: 'border-cyan-100',
        icon: Info,
        description: 'Xác định lượng hàng sau khi làm'
    },
    'HOAN_THANH': { 
        label: 'Hoàn thành', 
        color: 'text-green-700', 
        bg: 'bg-green-50', 
        border: 'border-green-100',
        icon: CheckCircle2,
        description: 'Đã xuất bến'
    },
    'TAM_DUNG': { 
        label: 'Tạm dừng', 
        color: 'text-amber-700', 
        bg: 'bg-amber-50', 
        border: 'border-amber-200',
        icon: Clock,
        description: 'Đang tạm dừng do sự cố'
    },
    'HUY_BO': { 
        label: 'Hủy bỏ', 
        color: 'text-red-700', 
        bg: 'bg-red-50', 
        border: 'border-red-200',
        icon: AlertCircle,
        description: 'Đã hủy dịch vụ'
    }
};

export type VoyageStatusValue = keyof typeof VOYAGE_STATUS_CONFIG;

export const getStatusConfig = (status: string) => {
    return VOYAGE_STATUS_CONFIG[status as VoyageStatusValue] || {
        label: status,
        color: 'text-slate-500',
        bg: 'bg-slate-50',
        border: 'border-slate-100',
        icon: Circle
    };
};
