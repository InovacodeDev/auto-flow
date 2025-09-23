import { create } from "zustand";
import { persist } from "zustand/middleware";
import axiosClient from "../lib/axiosClient";

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

// API functions using axios client
const authApi = {
    login: async (credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> => {
        const response = await axiosClient.post("/auth/login", credentials);
        return response.data;
    },

    register: async (data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> => {
        const response = await axiosClient.post("/auth/register", data);
        return response.data;
    },

    logout: async (): Promise<void> => {
        await axiosClient.post("/auth/logout");
    },

    refreshToken: async (refreshToken: string): Promise<{ tokens: AuthTokens }> => {
        const response = await axiosClient.post("/auth/refresh", { refreshToken });
        return response.data;
    },

    getMe: async (): Promise<{ user: User }> => {
        const response = await axiosClient.get("/auth/me");
        return response.data;
    },
};

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

                    const response = await authApi.login(credentials);

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

                    const response = await authApi.register(data);

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
                    await authApi.logout();
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

                    const response = await authApi.refreshToken(tokens.refreshToken);

                    set({
                        tokens: response.tokens,
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
            const user = await authApi.getMe();
            authState.setUser(user.user);
        } catch (error) {
            // Token invalid, clear auth state
            authState.logout();
        }
    }
};

// Export axios client for use in other components
export { axiosClient };
