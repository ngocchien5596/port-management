import { api, APIResponse } from '@/lib/api';
import type { Account, CreateAccountRequest, UpdateAccountRequest } from './types';

export const accountApi = {
    getAccounts: async () => {
        const response = await api.get<Account[]>('/accounts');
        return response.data;
    },

    createAccount: async (data: CreateAccountRequest) => {
        const response = await api.post<Account>('/accounts', data);
        return response.data;
    },

    updateAccount: async ({ id, data }: { id: string; data: UpdateAccountRequest }) => {
        const response = await api.put<Account>(`/accounts/${id}`, data);
        return response.data;
    },

    importAccounts: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post<any>('/accounts/import', formData);
    },

    downloadTemplate: async () => {
        const response = await api.get('/accounts/template', {
            responseType: 'blob',
        });
        // Create url from blob
        const url = window.URL.createObjectURL(response as unknown as Blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'template_accounts.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
    },

    getAccount: async (id: string) => {
        const response = await api.get<Account>(`/accounts/${id}`);
        return response.data;
    },

    deleteAccount: async (id: string) => {
        const response = await api.delete<any>(`/accounts/${id}`);
        return response.data;
    },
};
