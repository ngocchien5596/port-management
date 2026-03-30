import { api } from '@/lib/api';
import { Product } from '../qltau/types';
import {
    Lane, CreateLaneRequest,
    Equipment, CreateEquipmentRequest,
    EquipmentEvent
} from './types';

export const configApi = {
    // Products
    getProducts: () => api.get<Product[]>('/products').then((res: any) => res),
    createProduct: (data: Partial<Product>) => api.post<Product>('/products', data).then((res: any) => res),
    updateProduct: (id: string, data: Partial<Product>) => api.put<Product>('/products/' + id, data).then((res: any) => res),
    deleteProduct: (id: string) => api.delete('/products/' + id).then((res: any) => res),

    // Lanes
    getLanes: () => api.get<Lane[]>('/lanes').then((res: any) => res),
    createLane: (data: CreateLaneRequest) => api.post<Lane>('/lanes', data).then((res: any) => res),
    updateLane: (id: string, data: Partial<CreateLaneRequest>) => api.put<Lane>(`/lanes/${id}`, data).then((res: any) => res),
    deleteLane: (id: string) => api.delete(`/lanes/${id}`).then((res: any) => res),

    // Equipment
    getEquipment: () => api.get<Equipment[]>('/equipments').then((res: any) => res),
    getEquipmentById: (id: string) => api.get<Equipment>(`/equipments/${id}`).then((res: any) => res),
    createEquipment: (data: CreateEquipmentRequest) => api.post<Equipment>('/equipments', data).then((res: any) => res),
    updateEquipment: (id: string, data: Partial<CreateEquipmentRequest>) => api.put<Equipment>(`/equipments/${id}`, data).then((res: any) => res),
    updateEquipmentStatus: (id: string, data: { status: string; description?: string }) => api.put<Equipment>(`/equipments/${id}/status`, data).then((res: any) => res),
    getEquipmentHistory: (id: string) => api.get<EquipmentEvent[]>(`/equipments/${id}/history`).then((res: any) => res),
    getEquipmentKpi: (id: string) => api.get<any>(`/equipments/${id}/kpi`).then((res: any) => res),
    deleteEquipment: (id: string) => api.delete(`/equipments/${id}`).then((res: any) => res),

    // System
    getServerTime: () => api.get<{ success: boolean; data: { serverTime: string; timezone: string } }>('/config/server-time').then((res: any) => res),
    getGlobalConfigs: () => api.get<{ success: boolean; data: any[] }>('/config/global').then((res: any) => res),
    updateGlobalConfig: (key: string, value: string) => api.put<{ success: boolean; data: any }>(`/config/global/${key}`, { value }).then((res: any) => res),
};
