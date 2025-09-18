import { useAuthStore } from "../stores/authStore";
import type { LoginCredentials, RegisterData, User } from "../stores/authStore";

/**
 * Hook personalizado para gerenciar autenticação
 * Simplifica o uso do Zustand store nos componentes React
 */
export const useAuth = () => {
    const {
        user,
        tokens,
        isAuthenticated,
        isLoading,
        error,
        login: loginAction,
        register: registerAction,
        logout: logoutAction,
        refreshToken: refreshTokenAction,
        clearError,
        setLoading,
    } = useAuthStore();

    // Wrapper functions para melhor UX
    const login = async (credentials: LoginCredentials): Promise<void> => {
        await loginAction(credentials);
    };

    const register = async (data: RegisterData): Promise<void> => {
        await registerAction(data);
    };

    const logout = async (): Promise<void> => {
        try {
            await logoutAction();
        } catch (error) {
            // Logout sempre deve funcionar, mesmo com erro de API
            console.warn("Logout warning:", error);
        }
    };

    const refreshToken = async (): Promise<void> => {
        await refreshTokenAction();
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

    return {
        // State
        user,
        tokens,
        isAuthenticated,
        isLoading,
        error,

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
    };
};
