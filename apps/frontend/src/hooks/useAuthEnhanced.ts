import { useEffect } from "react";
import { useAuthStore } from "../stores/authStore";
import {
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
    useRefreshTokenMutation,
} from "./useAuthMutations";
import { useUserProfile, useTokenRefresh, useInvalidateAuth } from "./useAuthQuery";
import type { LoginCredentials, RegisterData, User } from "../stores/authStore";

/**
 * Hook principal de autenticação que integra TanStack Query com Zustand
 * Fornece uma interface unificada para gerenciamento de autenticação
 */
export const useAuthEnhanced = () => {
    const { user, tokens, isAuthenticated, isLoading, error, clearError, setLoading } =
        useAuthStore();

    // TanStack Query hooks
    const loginMutation = useLoginMutation();
    const registerMutation = useRegisterMutation();
    const logoutMutation = useLogoutMutation();
    const refreshTokenMutation = useRefreshTokenMutation();
    const userProfileQuery = useUserProfile();
    const tokenRefreshQuery = useTokenRefresh();
    const { invalidateAll, invalidateUser, clearAll } = useInvalidateAuth();

    // Verificar se o token precisa ser renovado
    useEffect(() => {
        if (tokens?.accessToken && tokens?.refreshToken) {
            // Verificar se o token expira em menos de 5 minutos
            const now = Date.now();
            const tokenExpiry = tokens.expiresIn * 1000; // Convert to milliseconds
            const timeUntilExpiry = tokenExpiry - now;

            if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
                // Token expira em menos de 5 minutos, renovar
                refreshTokenMutation.mutate(tokens.refreshToken);
            }
        }
    }, [tokens, refreshTokenMutation]);

    // Verificar perfil do usuário quando autenticado
    useEffect(() => {
        if (isAuthenticated && tokens?.accessToken && !user) {
            userProfileQuery.refetch();
        }
    }, [isAuthenticated, tokens?.accessToken, user, userProfileQuery]);

    // Wrapper functions que integram TanStack Query com Zustand
    const login = async (credentials: LoginCredentials): Promise<void> => {
        try {
            await loginMutation.mutateAsync(credentials);
        } catch (error) {
            // Error já é tratado no mutation
            throw error;
        }
    };

    const register = async (data: RegisterData): Promise<void> => {
        try {
            await registerMutation.mutateAsync(data);
        } catch (error) {
            // Error já é tratado no mutation
            throw error;
        }
    };

    const logout = async (): Promise<void> => {
        try {
            await logoutMutation.mutateAsync();
        } catch (error) {
            // Error já é tratado no mutation
            console.warn("Logout warning:", error);
        }
    };

    const refreshToken = async (): Promise<void> => {
        if (!tokens?.refreshToken) {
            throw new Error("No refresh token available");
        }

        try {
            await refreshTokenMutation.mutateAsync(tokens.refreshToken);
        } catch (error) {
            // Error já é tratado no mutation
            throw error;
        }
    };

    // Helper functions
    const hasRole = (role: User["role"]): boolean => {
        return user?.role === role;
    };

    const hasAnyRole = (roles: User["role"][]): boolean => {
        return user ? roles.includes(user.role) : false;
    };

    const isAdmin = (): boolean => {
        return hasRole("admin");
    };

    const isManager = (): boolean => {
        return hasAnyRole(["admin", "manager"]);
    };

    const getOrganizationId = (): string | null => {
        return user?.organizationId || null;
    };

    const getAccessToken = (): string | null => {
        return tokens?.accessToken || null;
    };

    // Status de loading combinado
    const isAuthLoading =
        isLoading ||
        loginMutation.isPending ||
        registerMutation.isPending ||
        logoutMutation.isPending ||
        userProfileQuery.isLoading ||
        tokenRefreshQuery.isLoading;

    // Error combinado
    const authError =
        error ||
        loginMutation.error?.message ||
        registerMutation.error?.message ||
        logoutMutation.error?.message ||
        userProfileQuery.error?.message ||
        tokenRefreshQuery.error?.message;

    return {
        // State
        user,
        tokens,
        isAuthenticated,
        isLoading: isAuthLoading,
        error: authError,

        // Actions
        login,
        register,
        logout,
        refreshToken,
        clearError,
        setLoading,

        // Helper functions
        hasRole,
        hasAnyRole,
        isAdmin,
        isManager,
        getOrganizationId,
        getAccessToken,

        // TanStack Query status
        mutations: {
            login: {
                isPending: loginMutation.isPending,
                isError: loginMutation.isError,
                error: loginMutation.error,
            },
            register: {
                isPending: registerMutation.isPending,
                isError: registerMutation.isError,
                error: registerMutation.error,
            },
            logout: {
                isPending: logoutMutation.isPending,
                isError: logoutMutation.isError,
                error: logoutMutation.error,
            },
            refreshToken: {
                isPending: refreshTokenMutation.isPending,
                isError: refreshTokenMutation.isError,
                error: refreshTokenMutation.error,
            },
        },

        queries: {
            userProfile: {
                isLoading: userProfileQuery.isLoading,
                isError: userProfileQuery.isError,
                error: userProfileQuery.error,
                refetch: userProfileQuery.refetch,
            },
            tokenRefresh: {
                isLoading: tokenRefreshQuery.isLoading,
                isError: tokenRefreshQuery.isError,
                error: tokenRefreshQuery.error,
            },
        },

        // Query invalidation helpers
        invalidateAll,
        invalidateUser,
        clearAll,
    };
};
