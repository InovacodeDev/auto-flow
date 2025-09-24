import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../stores/authStore";
import type { LoginCredentials, RegisterData, User, AuthTokens } from "../stores/authStore";

// API Base URL
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:3001/api";

// API functions
const authApi = {
    login: async (credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> => {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    },

    register: async (data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> => {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    },

    logout: async (): Promise<void> => {
        const authState = useAuthStore.getState();

        if (authState.tokens?.accessToken) {
            const response = await fetch(`${API_BASE_URL}/auth/logout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authState.tokens.accessToken}`,
                },
            });

            if (!response.ok) {
                console.warn("Logout API call failed:", await response.text());
            }
        }
    },

    refreshToken: async (refreshToken: string): Promise<{ tokens: AuthTokens }> => {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            throw new Error("Token refresh failed");
        }

        return response.json();
    },

    getMe: async (accessToken: string): Promise<{ user: User }> => {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to get user profile");
        }

        return response.json();
    },
};

/**
 * Hook para login com TanStack Query
 */
export const useLoginMutation = () => {
    const queryClient = useQueryClient();
    const { setUser, setTokens, setLoading, clearError } = useAuthStore();

    return useMutation({
        mutationFn: authApi.login,
        onMutate: () => {
            setLoading(true);
            clearError();
        },
        onSuccess: (data) => {
            setUser(data.user);
            setTokens(data.tokens);
            setLoading(false);

            // Invalidate and refetch user-related queries
            queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
            queryClient.invalidateQueries({ queryKey: ["auth", "profile"] });
        },
        onError: (error) => {
            setLoading(false);
            useAuthStore.setState({
                error: error instanceof Error ? error.message : "Login failed",
                isAuthenticated: false,
                user: null,
                tokens: null,
            });
        },
    });
};

/**
 * Hook para registro com TanStack Query
 */
export const useRegisterMutation = () => {
    const queryClient = useQueryClient();
    const { setUser, setTokens, setLoading, clearError } = useAuthStore();

    return useMutation({
        mutationFn: authApi.register,
        onMutate: () => {
            setLoading(true);
            clearError();
        },
        onSuccess: (data) => {
            setUser(data.user);
            setTokens(data.tokens);
            setLoading(false);

            // Invalidate and refetch user-related queries
            queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
            queryClient.invalidateQueries({ queryKey: ["auth", "profile"] });
        },
        onError: (error) => {
            setLoading(false);
            useAuthStore.setState({
                error: error instanceof Error ? error.message : "Registration failed",
                isAuthenticated: false,
                user: null,
                tokens: null,
            });
        },
    });
};

/**
 * Hook para logout com TanStack Query
 */
export const useLogoutMutation = () => {
    const queryClient = useQueryClient();
    const { setUser, setTokens, clearError } = useAuthStore();

    return useMutation({
        mutationFn: authApi.logout,
        onSuccess: () => {
            setUser(null);
            setTokens(null);
            clearError();

            // Clear all queries
            queryClient.clear();
        },
        onError: (error) => {
            // Logout sempre deve funcionar, mesmo com erro de API
            console.warn("Logout warning:", error);
            setUser(null);
            setTokens(null);
            clearError();
            queryClient.clear();
        },
    });
};

/**
 * Hook para refresh token com TanStack Query
 */
export const useRefreshTokenMutation = () => {
    const { setTokens, setUser, setLoading } = useAuthStore();

    return useMutation({
        mutationFn: (refreshToken: string) => authApi.refreshToken(refreshToken),
        onSuccess: (data) => {
            setTokens(data.tokens);
            setLoading(false);
        },
        onError: (error) => {
            setLoading(false);
            // Refresh failed, logout user
            useAuthStore.setState({
                user: null,
                tokens: null,
                isAuthenticated: false,
                error: "Session expired",
            });
        },
    });
};

/**
 * Hook para buscar perfil do usuário com TanStack Query
 */
export const useUserProfileQuery = (accessToken: string | null, enabled: boolean = true) => {
    return useMutation({
        mutationFn: () => {
            if (!accessToken) throw new Error("No access token");
            return authApi.getMe(accessToken);
        },
        enabled: enabled && !!accessToken,
    });
};
