import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../stores/authStore";

/**
 * Hook para gerenciar erros globais
 * Monitora erros de autenticação e queries
 */
export const useGlobalError = () => {
    const queryClient = useQueryClient();
    const { error: authError, clearError } = useAuthStore();

    // Monitorar erros de queries
    useEffect(() => {
        const handleQueryError = (error: Error) => {
            console.error("Query error:", error);

            // Se for erro 401, limpar estado de autenticação
            if (error.message.includes("401")) {
                useAuthStore.getState().logout();
            }
        };

        // Adicionar listener para erros de queries
        const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
            if (event.type === "updated" && event.query.state.status === "error") {
                handleQueryError(event.query.state.error as Error);
            }
        });

        return unsubscribe;
    }, [queryClient]);

    // Monitorar erros de mutations
    useEffect(() => {
        const handleMutationError = (error: Error) => {
            console.error("Mutation error:", error);

            // Se for erro 401, limpar estado de autenticação
            if (error.message.includes("401")) {
                useAuthStore.getState().logout();
            }
        };

        // Adicionar listener para erros de mutations
        const unsubscribe = queryClient.getMutationCache().subscribe((event) => {
            if (event.type === "updated" && event.mutation.state.status === "error") {
                handleMutationError(event.mutation.state.error as Error);
            }
        });

        return unsubscribe;
    }, [queryClient]);

    return {
        authError,
        clearError,
    };
};
