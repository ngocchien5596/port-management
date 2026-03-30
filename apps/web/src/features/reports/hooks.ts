import { useQuery } from '@tanstack/react-query';
import { reportApi } from './api';

export const useAggregatedStats = (start: string, end: string) => {
    return useQuery({
        queryKey: ['reports', 'aggregated', start, end],
        queryFn: () => reportApi.getAggregatedStats(start, end),
        enabled: !!start && !!end
    });
};

export const useEquipmentUtilization = (start: string, end: string) => {
    return useQuery({
        queryKey: ['reports', 'equipment-utilization', start, end],
        queryFn: () => reportApi.getEquipmentUtilization(start, end),
        enabled: !!start && !!end
    });
};

export const useVolumeReport = (start: string, end: string) => {
    return useQuery({
        queryKey: ['reports', 'volume', start, end],
        queryFn: () => reportApi.getVolumeReport(start, end),
        enabled: !!start && !!end
    });
};

export const useProductivityReport = (start: string, end: string) => {
    return useQuery({
        queryKey: ['reports', 'productivity', start, end],
        queryFn: () => reportApi.getProductivityReport(start, end),
        enabled: !!start && !!end
    });
};

export const useEquipmentAnalytics = (start: string, end: string) => {
    return useQuery({
        queryKey: ['reports', 'productivity', 'equipment', start, end],
        queryFn: () => reportApi.getEquipmentAnalytics(start, end),
        enabled: !!start && !!end
    });
};

export const usePortAnalytics = (start: string, end: string) => {
    return useQuery({
        queryKey: ['reports', 'productivity', 'port', start, end],
        queryFn: () => reportApi.getPortAnalytics(start, end),
        enabled: !!start && !!end
    });
};
