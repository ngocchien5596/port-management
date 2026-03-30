import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountApi } from './api';
import { CreateAccountRequest, UpdateAccountRequest } from './types';

export const useAccounts = () => {
    return useQuery({
        queryKey: ['accounts'],
        queryFn: accountApi.getAccounts,
    });
};

export const useCreateAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateAccountRequest) => accountApi.createAccount(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        },
    });
};

export const useUpdateAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateAccountRequest }) => accountApi.updateAccount({ id, data }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        },
    });
};

export const useAccount = (id: string) => {
    return useQuery({
        queryKey: ['accounts', id],
        queryFn: () => accountApi.getAccount(id),
        enabled: !!id,
    });
};

export const useDeleteAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => accountApi.deleteAccount(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
        },
    });
};
