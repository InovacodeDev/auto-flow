import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../stores/authStore";
import type { User, AuthTokens } from "../stores/authStore";

// API Base URL
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:3001/api";

/**
 * Hook para verificar se o usuário está autenticado
 * Usa TanStack Query para cache e invalidação
 */
export const useAuthStatus = () => {
    const { user, tokens, isAuthenticated } = useAuthStore();

    return useQuery({
        queryKey: ["auth", "status"],
        queryFn: () => ({ user, tokens, isAuthenticated }),
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
};

/**
 * Hook para buscar perfil do usuário
 * Verifica se o token ainda é válido
 */
export const useUserProfile = () => {
    const { tokens, setUser: _setUser, setLoading } = useAuthStore();
    return useQuery<any>({
        queryKey: ["auth", "profile"],
        queryFn: async (): Promise<User> => {
            if (!tokens?.accessToken) {
                throw new Error("No access token available");
            }

            setLoading(true);

            try {
                const response = await fetch(`${API_BASE_URL}/auth/me`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${tokens.accessToken}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to get user profile");
                }

                const data = await response.json();
                _setUser(data.user);
                return data.user;
            } finally {
                setLoading(false);
            }
        },
        enabled: !!tokens?.accessToken,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: (failureCount: number, error: any) => {
            if (error instanceof Error && error.message.includes("401")) return false;
            return failureCount < 3;
        },
        onError: (error: any) => {
            console.error("Failed to fetch user profile:", error);
            useAuthStore.setState({
                user: null,
                tokens: null,
                isAuthenticated: false,
                error: "Session expired",
            });
        },
    } as any);
};

/**
 * Hook para verificar se o token precisa ser renovado
 */
export const useTokenRefresh = () => {
    const { tokens, setTokens, setUser: _setUser } = useAuthStore();
    const queryClient = useQueryClient();

    return useQuery<any>({
        queryKey: ["auth", "token-refresh"],
        queryFn: async (): Promise<AuthTokens> => {
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
            setTokens(data.tokens);
            return data.tokens;
        },
        enabled: !!tokens?.refreshToken,
        staleTime: 10 * 60 * 1000, // 10 minutes
        gcTime: 15 * 60 * 1000, // 15 minutes
        retry: false, // Don't retry token refresh
        onError: (error: any) => {
            console.error("Token refresh failed:", error);
            // If refresh fails, logout user
            useAuthStore.setState({
                user: null,
                tokens: null,
                isAuthenticated: false,
                error: "Session expired",
            });
            queryClient.clear();
        },
    } as any);
};

/**
 * Hook para invalidar todas as queries de autenticação
 */
export const useInvalidateAuth = () => {
    const queryClient = useQueryClient();

    const invalidateAll = () => {
        queryClient.invalidateQueries({ queryKey: ["auth"] });
    };

    const invalidateUser = () => {
        queryClient.invalidateQueries({ queryKey: ["auth", "profile"] });
        queryClient.invalidateQueries({ queryKey: ["auth", "status"] });
    };

    const clearAll = () => {
        queryClient.clear();
    };

    return {
        invalidateAll,
        invalidateUser,
        clearAll,
    };
};
