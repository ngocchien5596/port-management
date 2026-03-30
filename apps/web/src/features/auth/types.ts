export interface User {
    id: string;
    employeeCode: string;
    fullName: string;
    email?: string;
    role: string;
    department: string;
    position: string;
    secretCode?: string;
}

export interface LoginRequest {
    employeeCode: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}
