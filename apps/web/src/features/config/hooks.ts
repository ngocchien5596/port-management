import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { configApi } from './api';
import { CreateLaneRequest, CreateEquipmentRequest, EquipmentEvent } from './types';

export const useProducts = () => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['products'],
        queryFn: configApi.getProducts,
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => configApi.createProduct(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            configApi.updateProduct(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => configApi.deleteProduct(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
    });

    return { ...query, createMutation, updateMutation, deleteMutation };
};

export const useLanes = () => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['lanes'],
        queryFn: configApi.getLanes,
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateLaneRequest) => configApi.createLane(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lanes'] }),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateLaneRequest> }) =>
            configApi.updateLane(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lanes'] }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => configApi.deleteLane(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lanes'] }),
    });

    return { ...query, createMutation, updateMutation, deleteMutation };
};

export const useEquipment = () => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['equipment'],
        queryFn: configApi.getEquipment,
    });

    const createMutation = useMutation({
        mutationFn: (data: CreateEquipmentRequest) => configApi.createEquipment(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['equipment'] });
            queryClient.invalidateQueries({ queryKey: ['lanes'] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateEquipmentRequest> }) =>
            configApi.updateEquipment(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['equipment'] });
            queryClient.invalidateQueries({ queryKey: ['lanes'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => configApi.deleteEquipment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['equipment'] });
            queryClient.invalidateQueries({ queryKey: ['lanes'] });
        },
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: { status: string; description?: string } }) =>
            configApi.updateEquipmentStatus(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['equipment'] });
            queryClient.invalidateQueries({ queryKey: ['incidents'] });
        },
    });

    return { ...query, createMutation, updateMutation, deleteMutation, statusMutation };
};

export const useEquipmentDetail = (id: string) => {
    return useQuery({
        queryKey: ['equipment', id],
        queryFn: () => configApi.getEquipmentById(id),
        enabled: !!id,
    });
};

export const useEquipmentHistory = (id: string) => {
    return useQuery({
        queryKey: ['equipment', id, 'history'],
        queryFn: () => configApi.getEquipmentHistory(id),
        enabled: !!id,
    });
};

export const useEquipmentKpi = (id: string) => {
    return useQuery({
        queryKey: ['equipment', id, 'kpi'],
        queryFn: () => configApi.getEquipmentKpi(id),
        enabled: !!id,
    });
};

export const useSystemConfig = () => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['system-configs'],
        queryFn: configApi.getGlobalConfigs,
    });

    const updateMutation = useMutation({
        mutationFn: ({ key, value }: { key: string; value: string }) =>
            configApi.updateGlobalConfig(key, value),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['system-configs'] });
        },
    });

    return { ...query, updateMutation };
};
