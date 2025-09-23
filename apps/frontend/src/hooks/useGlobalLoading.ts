import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../stores/authStore";

/**
 * Hook para gerenciar estado de loading global
 * Combina loading states de autenticação e queries
 */
export const useGlobalLoading = () => {
    const queryClient = useQueryClient();
    const { isLoading: authLoading } = useAuthStore();

    // Verificar se há queries em loading
    const isQueriesLoading = queryClient.isFetching() > 0;
    const isMutationsPending = queryClient.isMutating() > 0;

    // Loading global é true se qualquer um estiver loading
    const isLoading = authLoading || isQueriesLoading || isMutationsPending;

    return {
        isLoading,
        authLoading,
        queriesLoading: isQueriesLoading,
        mutationsPending: isMutationsPending,
    };
};
