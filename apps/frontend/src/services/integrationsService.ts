import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "../lib/axiosClient";
import { queryKeys } from "../lib/queryClient";

// Types
export interface IntegrationHealth {
    id: string;
    name: string;
    type: "whatsapp" | "pix" | "crm" | "erp";
    status: "connected" | "disconnected" | "error" | "configuring";
    platform?: string;
    lastSync?: string;
    errorMessage?: string;
    metrics: {
        totalOperations: number;
        successRate: number;
        monthlyVolume: number;
        lastActivity: string;
    };
    configuration?: {
        isConfigured: boolean;
        requiredFields: string[];
        optionalFields: string[];
    };
}

export interface IntegrationStats {
    totalIntegrations: number;
    activeIntegrations: number;
    monthlyOperations: number;
    successRate: number;
    totalRevenue: number;
}

export interface IntegrationOperation {
    id: string;
    integrationType: string;
    platform: string;
    operation: string;
    status: "success" | "error" | "pending";
    timestamp: string;
    data?: any;
    error?: string;
}

export interface IntegrationOverview {
    summary: {
        totalIntegrations: number;
        activeIntegrations: number;
        errorIntegrations: number;
        configuringIntegrations: number;
    };
    metrics: {
        monthlyOperations: number;
        successRate: number;
        totalRevenue: number;
        avgResponseTime: number;
    };
    byType: {
        whatsapp: number;
        pix: number;
        crm: number;
        erp: number;
    };
    alerts: Array<{
        type: "error" | "warning" | "info";
        message: string;
        integrationId: string;
    }>;
}

export interface SyncResult {
    successful: number;
    failed: number;
    details: Array<{
        id: string;
        status: "success" | "error";
        error?: string;
    }>;
}

// API functions
const integrationsApi = {
    // Obter status de saúde de todas as integrações
    async getHealth(): Promise<IntegrationHealth[]> {
        const response = await axiosClient.get("/integrations-unified/health");
        return response.data.data;
    },

    // Obter estatísticas gerais
    async getStats(): Promise<IntegrationStats> {
        const response = await axiosClient.get("/integrations-unified/stats");
        return response.data.data;
    },

    // Obter overview geral
    async getOverview(): Promise<IntegrationOverview> {
        const response = await axiosClient.get("/integrations-unified/overview");
        return response.data.data;
    },

    // Obter histórico de operações
    async getOperations(filters?: {
        type?: string;
        platform?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
        limit?: number;
    }): Promise<{ data: IntegrationOperation[]; pagination: any }> {
        const params = new URLSearchParams();
        if (filters?.type) params.append("type", filters.type);
        if (filters?.platform) params.append("platform", filters.platform);
        if (filters?.status) params.append("status", filters.status);
        if (filters?.startDate) params.append("startDate", filters.startDate);
        if (filters?.endDate) params.append("endDate", filters.endDate);
        if (filters?.limit) params.append("limit", filters.limit.toString());

        const response = await axiosClient.get(
            `/integrations-unified/operations?${params.toString()}`
        );
        return response.data;
    },

    // Sincronizar todas as integrações
    async syncAll(): Promise<SyncResult> {
        const response = await axiosClient.post("/integrations-unified/sync");
        return response.data.data;
    },

    // Limpar dados antigos
    async cleanup(): Promise<{ removedOperations: number; message: string }> {
        const response = await axiosClient.post("/integrations-unified/cleanup");
        return response.data.data;
    },

    // Exportar dados
    async exportData(): Promise<any> {
        const response = await axiosClient.get("/integrations-unified/export");
        return response.data.data;
    },
};

// React Query Hooks

export const useIntegrationsHealth = () => {
    return useQuery({
        queryKey: queryKeys.integrations.health(),
        queryFn: integrationsApi.getHealth,
        refetchInterval: 30000, // Refetch every 30 seconds
        staleTime: 10000, // Consider data stale after 10 seconds
    });
};

export const useIntegrationsStats = () => {
    return useQuery({
        queryKey: queryKeys.integrations.stats(),
        queryFn: integrationsApi.getStats,
        refetchInterval: 60000, // Refetch every minute
        staleTime: 30000, // Consider data stale after 30 seconds
    });
};

export const useIntegrationsOverview = () => {
    return useQuery({
        queryKey: queryKeys.integrations.overview(),
        queryFn: integrationsApi.getOverview,
        refetchInterval: 30000, // Refetch every 30 seconds
        staleTime: 10000, // Consider data stale after 10 seconds
    });
};

export const useIntegrationsOperations = (filters?: {
    type?: string;
    platform?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
}) => {
    return useQuery({
        queryKey: queryKeys.integrations.operations(filters),
        queryFn: () => integrationsApi.getOperations(filters),
        refetchInterval: 60000, // Refetch every minute
        staleTime: 30000, // Consider data stale after 30 seconds
    });
};

export const useSyncIntegrations = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: integrationsApi.syncAll,
        onSuccess: () => {
            // Invalidate all integration queries
            queryClient.invalidateQueries({ queryKey: queryKeys.integrations.all });
        },
    });
};

export const useCleanupIntegrations = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: integrationsApi.cleanup,
        onSuccess: () => {
            // Invalidate operations query
            queryClient.invalidateQueries({ queryKey: queryKeys.integrations.operations() });
        },
    });
};

export const useExportIntegrations = () => {
    return useMutation({
        mutationFn: integrationsApi.exportData,
    });
};

// Helper hooks for specific data

export const useActiveIntegrations = () => {
    const { data: health, ...rest } = useIntegrationsHealth();

    return {
        ...rest,
        data: health?.filter((integration) => integration.status === "connected") || [],
    };
};

export const useErrorIntegrations = () => {
    const { data: health, ...rest } = useIntegrationsHealth();

    return {
        ...rest,
        data: health?.filter((integration) => integration.status === "error") || [],
    };
};

export const useIntegrationsByType = (type: "whatsapp" | "pix" | "crm" | "erp") => {
    const { data: health, ...rest } = useIntegrationsHealth();

    return {
        ...rest,
        data: health?.filter((integration) => integration.type === type) || [],
    };
};

export const useIntegrationHealth = (integrationId: string) => {
    const { data: health, ...rest } = useIntegrationsHealth();

    return {
        ...rest,
        data: health?.find((integration) => integration.id === integrationId),
    };
};
