import { api, APIResponse } from '@/lib/api';
import type { LoginRequest, LoginResponse, User } from './types';

// Helper to define standard API response shape

export const authApi = {
    login: async (data: LoginRequest) => {
        const response = await api.post<LoginResponse>('/auth/login', data);
        return response.data;
    },

    logout: () =>
        api.post('/auth/logout'),

    getMe: async () => {
        const response = await api.get<User>('/auth/me');
        return response.data;
    },

    changePassword: (currentPassword: string, newPassword: string) =>
        api.post('/auth/change-password', { currentPassword, newPassword }),

    updateSecretCode: (secretCode: string) =>
        api.post('/auth/secret-code', { secretCode }),
};

