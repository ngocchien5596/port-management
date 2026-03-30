import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { qltauApi } from './api';
import { Vessel } from './types';

// Vessels
export const useVessels = () => {
    return useQuery({
        queryKey: ['qltau', 'vessels'],
        queryFn: () => qltauApi.getVessels(),
    });
};

export const useCreateVessel = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Vessel>) => qltauApi.createVessel(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['qltau', 'vessels'] });
        },
    });
};

export const useUpdateVessel = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Vessel> }) =>
            qltauApi.updateVessel(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['qltau', 'vessels'] });
        },
    });
};

export const useDeleteVessel = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => qltauApi.deleteVessel(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['qltau', 'vessels'] });
        },
    });
};

// Voyages
export const useVoyages = () => {
    return useQuery({
        queryKey: ['qltau', 'voyages'],
        queryFn: () => qltauApi.getVoyages(),
    });
};

export const useVoyage = (id?: string) => {
    return useQuery({
        queryKey: ['qltau', 'voyage', id],
        queryFn: () => qltauApi.getVoyageDetail(id!),
        enabled: !!id,
    });
};


// Equipment
export const useEquipment = () => {
    return useQuery({
        queryKey: ['qltau', 'equipment'],
        queryFn: () => qltauApi.getEquipment(),
    });
};


// Products
export const useProducts = () => {
    return useQuery({
        queryKey: ['qltau', 'products'],
        queryFn: () => qltauApi.getProducts(),
    });
};

// Lanes
export const useLanes = () => {
    return useQuery({
        queryKey: ['qltau', 'lanes'],
        queryFn: () => qltauApi.getLanes(),
    });
};

export const useLaneSuggestion = (productId?: string, eta?: string) => {
    return useQuery({
        queryKey: ['qltau', 'lane-suggestion', productId, eta],
        queryFn: () => qltauApi.suggestLanes({ productId: productId!, eta }),
        enabled: !!productId,
    });
};



export const useCreateVoyage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => qltauApi.createVoyage(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['qltau', 'voyages'] });
        },
    });
};

export const useUpdateVoyage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            qltauApi.updateVoyage(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['qltau', 'voyages'] });
            queryClient.invalidateQueries({ queryKey: ['qltau', 'voyage', data.id] });
        },
    });
};

export const useDeleteVoyage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => qltauApi.deleteVoyage(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['qltau', 'voyages'] });
        },
    });
};

export const useUpdateVoyageStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status, reason, userId }: { id: string; status: string; reason?: string; userId?: string }) =>
            qltauApi.updateVoyageStatus(id, status, reason, userId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['qltau', 'voyages'] });
            queryClient.invalidateQueries({ queryKey: ['qltau', 'voyage', data.id] });
        },
    });
};

export const useUpdateVoyageQueue = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (updates: { id: string, queueNo: number }[]) =>
            qltauApi.reorderVoyageQueue(updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['qltau', 'voyages'] });
        },
    });
};

export const useOverrideEquipment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ currentVoyageId, emergencyVoyageId, progressData, reason }: { currentVoyageId: string, emergencyVoyageId: string, progressData: { amount: number; startTime?: string; endTime?: string }, reason?: string }) =>
            qltauApi.overrideVoyageEquipment(currentVoyageId, emergencyVoyageId, progressData, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['qltau', 'voyages'] });
            // Optionally, we could invalidate specific voyage keys, but invalidating all is safer
        },
    });
};

export const useUpdateVoyageReadiness = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, checklist }: { id: string; checklist: any }) =>
            qltauApi.updateVoyageReadiness(id, checklist),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['qltau', 'voyages'] });
            queryClient.invalidateQueries({ queryKey: ['qltau', 'voyage', data.id] });
        },
    });
};

export const useAddVoyageProgress = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: { amount: number; hours?: number; startTime?: string; endTime?: string; userId?: string; notes?: string; shiftCode?: string } }) =>
            qltauApi.addVoyageProgress(id, data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['qltau', 'voyages'] });
            queryClient.invalidateQueries({ queryKey: ['qltau', 'voyage', response.voyage.id] });
        },
    });
};

export const useUpdateVoyageProgress = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, progressId, data }: { id: string; progressId: string; data: { amount?: number; hours?: number; startTime?: string; endTime?: string; notes?: string; shiftCode?: string; updatedById?: string } }) =>
            qltauApi.updateVoyageProgress(id, progressId, data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['qltau', 'voyages'] });
            queryClient.invalidateQueries({ queryKey: ['qltau', 'voyage', response.voyage.id] });
        },
    });
};

export const useDeleteVoyageProgress = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, progressId }: { id: string; progressId: string }) =>
            qltauApi.deleteVoyageProgress(id, progressId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['qltau', 'voyages'] });
            queryClient.invalidateQueries({ queryKey: ['qltau', 'voyage', variables.id] });
        },
    });
};
