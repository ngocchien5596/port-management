import { api } from '@/lib/api';
import { Vessel, Voyage, Product } from './types';

export const qltauApi = {
    // Vessels
    getVessels: () =>
        api.get<Vessel[]>('/vessels').then((res: any) => res),

    createVessel: (data: Partial<Vessel>) =>
        api.post<Vessel>('/vessels', data).then((res: any) => res),

    updateVessel: (id: string, data: Partial<Vessel>) =>
        api.patch<Vessel>(`/vessels/${id}`, data).then((res: any) => res),

    deleteVessel: (id: string) =>
        api.delete(`/vessels/${id}`).then((res: any) => res),

    // Voyages
    getVoyages: () =>
        api.get<Voyage[]>('/voyages').then((res: any) => res),

    getVoyageDetail: (id: string) =>
        api.get<Voyage>(`/voyages/${id}`).then((res: any) => res),

    createVoyage: (data: any) =>
        api.post<Voyage>('/voyages', data).then((res: any) => res),

    updateVoyage: (id: string, data: any) =>
        api.put<Voyage>(`/voyages/${id}`, data).then((res: any) => res),

    deleteVoyage: (id: string) =>
        api.delete(`/voyages/${id}`).then((res: any) => res),



    // Products
    getProducts: () =>
        api.get<Product[]>('/products').then((res: any) => res),

    // Equipment
    getEquipment: () =>
        api.get<any[]>('/equipments').then((res: any) => res),

    // Lanes
    getLanes: () =>
        api.get<any[]>('/lanes').then((res: any) => res),

    suggestLanes: (data: { productId: string; eta?: string }) =>
        api.post<any[]>('/lanes/suggest', data).then((res: any) => res),


    updateVoyageStatus: (id: string, status: string, reason?: string, userId?: string) =>
        api.patch<Voyage>(`/voyages/${id}/status`, { status, reason, userId }).then((res: any) => res),

    updateVoyageReadiness: (id: string, checklist: any) =>
        api.patch<Voyage>(`/voyages/${id}/readiness`, checklist).then((res: any) => res),

    reorderVoyageQueue: async (updates: { id: string, queueNo: number }[]) => {
        const response = await api.post('/voyages/reorder-queue', updates);
        return response.data;
    },

    overrideVoyageEquipment: async (currentVoyageId: string, emergencyVoyageId: string, progressData: { amount: number; startTime?: string; endTime?: string }, reason?: string) => {
        const response = await api.post('/voyages/override-equipment', {
            currentVoyageId,
            emergencyVoyageId,
            progressData,
            reason
        });
        return response.data;
    },

    addVoyageProgress: (id: string, data: { amount: number, hours?: number, startTime?: string, endTime?: string, userId?: string, notes?: string, shiftCode?: string }) =>
        api.post<{ progress: any, voyage: Voyage }>(`/voyages/${id}/progress`, data).then((res: any) => res),

    updateVoyageProgress: (id: string, progressId: string, data: { amount?: number, hours?: number, startTime?: string, endTime?: string, notes?: string, shiftCode?: string, updatedById?: string }) =>
        api.put<{ voyage: Voyage }>(`/voyages/${id}/progress/${progressId}`, data).then((res: any) => res),

    deleteVoyageProgress: (id: string, progressId: string) =>
        api.delete(`/voyages/${id}/progress/${progressId}`).then((res: any) => res),
};
