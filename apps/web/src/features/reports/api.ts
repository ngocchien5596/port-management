import { api } from '@/lib/api';
import { AggregatedStats, EquipmentUtilization } from './types';

export const reportApi = {
    getAggregatedStats: async (start: string, end: string): Promise<AggregatedStats> => {
        const response = await api.get<AggregatedStats>('/reports/aggregated', {
            params: { start, end }
        });
        return response.data;
    },

    getEquipmentUtilization: async (start: string, end: string): Promise<EquipmentUtilization[]> => {
        const response = await api.get<EquipmentUtilization[]>('/reports/equipment-utilization', {
            params: { start, end }
        });
        return response.data;
    },

    getVolumeReport: async (start: string, end: string): Promise<any[]> => {
        const response = await api.get<any[]>('/reports/volume', {
            params: { start, end }
        });
        return response.data;
    },

    getProductivityReport: async (start: string, end: string): Promise<any[]> => {
        const response = await api.get<any[]>('/reports/productivity', {
            params: { start, end }
        });
        return response.data;
    },

    getEquipmentAnalytics: async (start: string, end: string): Promise<any[]> => {
        const response = await api.get<any[]>('/reports/productivity/equipment', {
            params: { start, end }
        });
        return response.data;
    },

    getPortAnalytics: async (start: string, end: string): Promise<any> => {
        const response = await api.get<any>('/reports/productivity/port', {
            params: { start, end }
        });
        return response.data;
    }
};
