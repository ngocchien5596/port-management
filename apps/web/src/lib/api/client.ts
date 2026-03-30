import { APIError, NetworkError, UnauthorizedError } from './errors';
import type { APIResponse } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6000/api';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestConfig {
    headers?: Record<string, string>;
    params?: Record<string, string | number | boolean | undefined>;
    responseType?: 'json' | 'blob';
    signal?: AbortSignal;
}

// Get token from Zustand store (localStorage)
const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    try {
        const storage = localStorage.getItem('auth-storage');
        if (!storage) return null;
        const parsed = JSON.parse(storage);
        return parsed?.state?.token || null;
    } catch {
        return null;
    }
};

async function request<T>(
    method: RequestMethod,
    endpoint: string,
    body?: unknown,
    config: RequestConfig = {}
): Promise<APIResponse<T>> {
    const token = getToken();

    const isFormData = body instanceof FormData;
    const headers: Record<string, string> = {
        ...config.headers,
    };

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        let url = `${API_URL}${endpoint}`;
        if (config.params) {
            const searchParams = new URLSearchParams();
            Object.entries(config.params).forEach(([key, value]) => {
                if (value !== undefined) {
                    searchParams.append(key, String(value));
                }
            });
            const queryString = searchParams.toString();
            if (queryString) {
                url += (url.includes('?') ? '&' : '?') + queryString;
            }
        }

        const response = await fetch(url, {
            method,
            headers,
            body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
            signal: config.signal,
        });

        if (config.responseType === 'blob') {
            return await response.blob() as any;
        }

        // Handle 204 No Content and 205 Reset Content responses
        if (response.status === 204 || response.status === 205) {
            return { success: true, data: null as any };
        }

        const data: APIResponse<T> = await response.json();

        if (!response.ok) {
            const errorMsg = (data as any).message || data.error?.message;
            if (response.status === 401) {
                // Clear auth state on unauthorized
                localStorage.removeItem('auth-storage');
                localStorage.removeItem('token');
                throw new UnauthorizedError(errorMsg);
            }
            throw new APIError(
                data.error?.code || 'UNKNOWN_ERROR',
                errorMsg || 'An error occurred',
                response.status
            );
        }

        return data;
    } catch (error) {
        if (error instanceof APIError) throw error;
        if (error instanceof TypeError) {
            throw new NetworkError('Unable to connect to server');
        }
        throw error;
    }
}

export const apiClient = {
    get: <T>(endpoint: string, config?: RequestConfig) =>
        request<T>('GET', endpoint, undefined, config),

    post: <T>(endpoint: string, body?: unknown, config?: RequestConfig) =>
        request<T>('POST', endpoint, body, config),

    put: <T>(endpoint: string, body?: unknown, config?: RequestConfig) =>
        request<T>('PUT', endpoint, body, config),

    patch: <T>(endpoint: string, body?: unknown, config?: RequestConfig) =>
        request<T>('PATCH', endpoint, body, config),

    delete: <T>(endpoint: string, config?: RequestConfig) =>
        request<T>('DELETE', endpoint, undefined, config),
};

export type { RequestConfig };
