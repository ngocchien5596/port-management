import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incidentApi } from './api';
import { CreateIncidentData } from './types';
import { toast } from 'react-hot-toast';

export const useIncidents = (params: any = {}) => {
    return useQuery({
        queryKey: ['incidents', params],
        queryFn: () => incidentApi.getAll(params)
    });
};

export const useActiveIncidentsForVoyage = (voyageId: string, options: any = {}) => {
    return useQuery({
        queryKey: ['incidents', 'voyage', voyageId, options],
        queryFn: () => incidentApi.getActiveForVoyage(voyageId, options),
        enabled: !!voyageId
    });
};

export const useCreateIncident = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateIncidentData) => incidentApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['incidents'] });
            toast.success('Báo cáo sự cố thành công');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi báo cáo sự cố');
        }
    });
};

export const useResolveIncident = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, endTime }: { id: string, endTime?: string }) => incidentApi.resolve(id, endTime),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['incidents'] });
            toast.success('Đã kết thúc sự cố');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi kết thúc sự cố');
        }
    });
};

export const useDeleteIncident = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => incidentApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['incidents'] });
            toast.success('Đã xóa báo cáo sự cố');
        }
    });
};
