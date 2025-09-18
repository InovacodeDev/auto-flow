import { create } from "zustand";
import { persist } from "zustand/middleware";

// Types
export interface User {
    id: string;
    email: string;
    name: string;
    role: "admin" | "manager" | "user";
    organizationId: string;
    organization: {
        id: string;
        name: string;
        plan: string;
    };
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    organization: {
        name: string;
        industry: string;
        size: "micro" | "pequena" | "media";
        country: "BR";
    };
    user: {
        name: string;
        email: string;
        password: string;
        phone?: string;
    };
    acceptedTerms: boolean;
    acceptedPrivacy: boolean;
}

interface AuthState {
    // State
    user: User | null;
    tokens: AuthTokens | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<void>;
    clearError: () => void;
    setLoading: (loading: boolean) => void;
    setUser: (user: User | null) => void;
    setTokens: (tokens: AuthTokens | null) => void;
}

// API Base URL
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:3001/api";

// HTTP Client with auth interceptors
class ApiClient {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;

        // Get current auth state
        const authState = useAuthStore.getState();

        // Add auth header if we have a token
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            ...(options.headers as Record<string, string>),
        };

        if (authState.tokens?.accessToken) {
            headers.Authorization = `Bearer ${authState.tokens.accessToken}`;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers,
            });

            // Handle 401 - try to refresh token
            if (response.status === 401 && authState.tokens?.refreshToken) {
                try {
                    await authState.refreshToken();

                    // Retry the original request with new token
                    const newAuthState = useAuthStore.getState();
                    if (newAuthState.tokens?.accessToken) {
                        headers.Authorization = `Bearer ${newAuthState.tokens.accessToken}`;
                        const retryResponse = await fetch(url, {
                            ...options,
                            headers,
                        });

                        if (!retryResponse.ok) {
                            throw new Error(await retryResponse.text());
                        }

                        return retryResponse.json();
                    }
                } catch (refreshError) {
                    // Refresh failed, logout user
                    authState.logout();
                    throw new Error("Session expired. Please login again.");
                }
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `HTTP error! status: ${response.status}`);
            }

            return response.json();
        } catch (error) {
            throw error instanceof Error ? error : new Error("Network error");
        }
    }

    async get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: "GET" });
    }

    async post<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: "POST",
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async put<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: "PUT",
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: "DELETE" });
    }
}

// Create API client instance
const apiClient = new ApiClient(API_BASE_URL);

// Zustand Auth Store
export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            // Initial state
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            // Actions
            login: async (credentials: LoginCredentials) => {
                try {
                    set({ isLoading: true, error: null });

                    const response = await apiClient.post<{
                        user: User;
                        tokens: AuthTokens;
                    }>("/auth/login", credentials);

                    set({
                        user: response.user,
                        tokens: response.tokens,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error) {
                    const message = error instanceof Error ? error.message : "Login failed";
                    set({
                        error: message,
                        isLoading: false,
                        isAuthenticated: false,
                        user: null,
                        tokens: null,
                    });
                    throw error;
                }
            },

            register: async (data: RegisterData) => {
                try {
                    set({ isLoading: true, error: null });

                    const response = await apiClient.post<{
                        user: User;
                        tokens: AuthTokens;
                    }>("/auth/register", data);

                    set({
                        user: response.user,
                        tokens: response.tokens,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (error) {
                    const message = error instanceof Error ? error.message : "Registration failed";
                    set({
                        error: message,
                        isLoading: false,
                        isAuthenticated: false,
                        user: null,
                        tokens: null,
                    });
                    throw error;
                }
            },

            logout: async () => {
                try {
                    const { tokens } = get();

                    if (tokens?.accessToken) {
                        // Call logout endpoint to invalidate tokens
                        await apiClient.post("/auth/logout");
                    }
                } catch (error) {
                    // Ignore logout errors, just clear local state
                    console.warn("Logout API call failed:", error);
                } finally {
                    set({
                        user: null,
                        tokens: null,
                        isAuthenticated: false,
                        error: null,
                    });
                }
            },

            refreshToken: async () => {
                try {
                    const { tokens } = get();

                    if (!tokens?.refreshToken) {
                        throw new Error("No refresh token available");
                    }

                    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            refreshToken: tokens.refreshToken,
                        }),
                    });

                    if (!response.ok) {
                        throw new Error("Token refresh failed");
                    }

                    const data = await response.json();

                    set({
                        tokens: data.tokens,
                    });
                } catch (error) {
                    // Refresh failed, logout user
                    set({
                        user: null,
                        tokens: null,
                        isAuthenticated: false,
                        error: "Session expired",
                    });
                    throw error;
                }
            },

            clearError: () => set({ error: null }),
            setLoading: (loading: boolean) => set({ isLoading: loading }),
            setUser: (user: User | null) => set({ user }),
            setTokens: (tokens: AuthTokens | null) => set({ tokens }),
        }),
        {
            name: "autoflow-auth", // localStorage key
            partialize: (state) => ({
                user: state.user,
                tokens: state.tokens,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

// Initialize auth state on app load
export const initializeAuth = async () => {
    const authState = useAuthStore.getState();

    if (authState.tokens?.accessToken && authState.user) {
        try {
            // Verify token is still valid by fetching user profile
            const user = await apiClient.get<{ user: User }>("/auth/me");
            authState.setUser(user.user);
        } catch (error) {
            // Token invalid, clear auth state
            authState.logout();
        }
    }
};

// Export API client for use in other components
export { apiClient };
