import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authApi } from './api';
import type { User, AuthState } from './types';

interface AuthStore extends AuthState {
    login: (employeeCode: string, password: string) => Promise<boolean>;
    logout: () => void;
    checkAuth: () => Promise<void>;
    clearError: () => void;
    _hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isLoading: false,
            error: null,
            isAuthenticated: false,
            _hasHydrated: false,

            setHasHydrated: (state: boolean) => {
                set({ _hasHydrated: state });
            },

            login: async (employeeCode: string, password: string) => {
                set({ isLoading: true, error: null });

                try {
                    const { token, user } = await authApi.login({ employeeCode, password });

                    set({
                        user,
                        token,
                        isLoading: false,
                        isAuthenticated: true,
                    });
                    return true;
                } catch (error: any) {
                    const message = error.message || 'Đăng nhập thất bại';
                    set({ error: message, isLoading: false });
                    return false;
                }
            },

            logout: () => {
                // Sync with api.ts expectation
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                }

                set({
                    user: null,
                    token: null,
                    error: null,
                    isAuthenticated: false,
                });
            },

            checkAuth: async () => {
                const token = get().token;
                if (!token) {
                    set({ isAuthenticated: false });
                    return;
                }

                try {
                    const user = await authApi.getMe();
                    set({ user, isAuthenticated: true });
                } catch {
                    set({ user: null, token: null, isAuthenticated: false });
                }
            },

            clearError: () => {
                set({ error: null });
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                token: state.token,
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);

// Hook to wait for hydration
export const useAuthHydration = () => {
    return useAuthStore((state) => state._hasHydrated);
};

