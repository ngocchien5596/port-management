'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore, useAuthHydration } from './store';

export function useAuth() {
    const {
        user,
        token,
        isLoading,
        error,
        isAuthenticated,
        login,
        logout,
        checkAuth,
        clearError,
    } = useAuthStore();
    const hasHydrated = useAuthHydration();

    return {
        user,
        token,
        isLoading,
        error,
        isAuthenticated,
        login,
        logout,
        checkAuth,
        clearError,
        hasHydrated,
    };
}

export function useLogin() {
    const router = useRouter();
    const { login, isLoading, error, clearError } = useAuthStore();

    const handleLogin = async (employeeCode: string, password: string) => {
        const success = await login(employeeCode, password);
        if (success) {
            router.push('/dashboard');
        }
        return success;
    };

    return {
        login: handleLogin,
        isLoading,
        error,
        clearError,
    };
}

export function useLogout() {
    const router = useRouter();
    const { logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return { logout: handleLogout };
}

export function useUser() {
    const { user, isAuthenticated } = useAuthStore();
    const hasHydrated = useAuthHydration();

    return {
        user: hasHydrated ? user : null,
        isAuthenticated: hasHydrated ? isAuthenticated : false,
        hasHydrated,
    };
}

