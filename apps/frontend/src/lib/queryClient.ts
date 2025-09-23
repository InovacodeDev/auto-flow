import { QueryClient } from "@tanstack/react-query";

/**
 * Configuração do TanStack Query Client
 * Otimizada para o sistema de autenticação e cache de dados
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Configurações de cache
            staleTime: 5 * 60 * 1000, // 5 minutos
            gcTime: 10 * 60 * 1000, // 10 minutos (anteriormente cacheTime)
            retry: (failureCount, error) => {
                // Não tentar novamente em erros 401 (não autorizado)
                if (error instanceof Error && error.message.includes("401")) {
                    return false;
                }
                // Tentar até 3 vezes para outros erros
                return failureCount < 3;
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            refetchOnWindowFocus: false, // Não refetch automaticamente ao focar na janela
            refetchOnReconnect: true, // Refetch quando reconectar à internet
        },
        mutations: {
            // Configurações para mutations
            retry: false, // Não tentar novamente mutations por padrão
            retryDelay: 1000,
        },
    },
});

/**
 * Chaves de query padronizadas para o sistema de autenticação
 */
export const queryKeys = {
    auth: {
        all: ["auth"] as const,
        status: () => [...queryKeys.auth.all, "status"] as const,
        profile: () => [...queryKeys.auth.all, "profile"] as const,
        tokenRefresh: () => [...queryKeys.auth.all, "token-refresh"] as const,
    },
    workflows: {
        all: ["workflows"] as const,
        list: () => [...queryKeys.workflows.all, "list"] as const,
        detail: (id: string) => [...queryKeys.workflows.all, "detail", id] as const,
        executions: (id: string) => [...queryKeys.workflows.all, "executions", id] as const,
    },
    integrations: {
        all: ["integrations"] as const,
        list: () => [...queryKeys.integrations.all, "list"] as const,
        status: (id: string) => [...queryKeys.integrations.all, "status", id] as const,
        health: () => [...queryKeys.integrations.all, "health"] as const,
        stats: () => [...queryKeys.integrations.all, "stats"] as const,
        overview: () => [...queryKeys.integrations.all, "overview"] as const,
        operations: (filters?: any) =>
            [...queryKeys.integrations.all, "operations", filters] as const,
    },
    analytics: {
        all: ["analytics"] as const,
        dashboard: () => [...queryKeys.analytics.all, "dashboard"] as const,
        workflows: () => [...queryKeys.analytics.all, "workflows"] as const,
        integrations: () => [...queryKeys.analytics.all, "integrations"] as const,
    },
    executions: {
        all: ["executions"] as const,
        list: () => [...queryKeys.executions.all, "list"] as const,
        status: (id: string) => [...queryKeys.executions.all, "status", id] as const,
        logs: (id: string) => [...queryKeys.executions.all, "logs", id] as const,
        stats: () => [...queryKeys.executions.all, "stats"] as const,
        health: () => [...queryKeys.executions.all, "health"] as const,
    },
    ai: {
        all: ["ai"] as const,
        conversations: () => [...queryKeys.ai.all, "conversations"] as const,
        conversation: (id: string) => [...queryKeys.ai.all, "conversation", id] as const,
        health: () => [...queryKeys.ai.all, "health"] as const,
        suggestions: (type: string) => [...queryKeys.ai.all, "suggestions", type] as const,
    },
} as const;

/**
 * Função para invalidar queries relacionadas à autenticação
 */
export const invalidateAuthQueries = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
};

/**
 * Função para limpar todas as queries (usado no logout)
 */
export const clearAllQueries = () => {
    queryClient.clear();
};

/**
 * Função para pré-carregar dados do usuário
 */
export const prefetchUserProfile = async (accessToken: string) => {
    await queryClient.prefetchQuery({
        queryKey: queryKeys.auth.profile(),
        queryFn: async () => {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:3001/api"}/auth/me`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to get user profile");
            }

            return response.json();
        },
        staleTime: 5 * 60 * 1000, // 5 minutos
    });
};
