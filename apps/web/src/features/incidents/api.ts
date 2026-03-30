import { api } from '@/lib/api';
import { Incident, CreateIncidentData } from './types';

export const incidentApi = {
    getAll: (params: any = {}) =>
        api.get<Incident[]>('/incidents', { params }).then((res: any) => res),

    create: (data: CreateIncidentData) =>
        api.post<Incident>('/incidents', data).then((res: any) => res),

    resolve: (id: string, endTime?: string) =>
        api.patch<Incident>(`/incidents/${id}/resolve`, { endTime }).then((res: any) => res),

    delete: (id: string) =>
        api.delete(`/incidents/${id}`).then((res: any) => res),

    getActiveForVoyage: (voyageId: string, options: any = {}) =>
        api.get<Incident[]>(`/incidents/voyage/${voyageId}`, { params: options }).then((res: any) => res),
};
