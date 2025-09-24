import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "../lib/axiosClient";
import { queryKeys } from "../lib/queryClient";

// Types
export interface WorkflowExecutionInput {
    workflowId: string;
    triggerData?: Record<string, any>;
    userId?: string;
    organizationId?: string;
    context?: Record<string, any>;
}

export interface WorkflowExecutionOutput {
    executionId: string;
    status: "pending" | "running" | "completed" | "failed" | "cancelled" | "paused";
    result?: Record<string, any>;
    error?: string;
    startedAt: string;
    completedAt?: string;
    duration?: number;
}

export interface WorkflowLog {
    id: string;
    timestamp: string;
    level: "info" | "warn" | "error" | "debug";
    message: string;
    nodeId?: string;
    data?: Record<string, any>;
}

export interface QueueStats {
    workflow: {
        waiting: number;
        active: number;
        completed: number;
        failed: number;
        delayed: number;
        paused: number;
    };
    node: {
        waiting: number;
        active: number;
        completed: number;
        failed: number;
        delayed: number;
        paused: number;
    };
}

// API functions
const executionApi = {
    // Executar workflow
    async executeWorkflow(data: WorkflowExecutionInput): Promise<{ executionId: string }> {
        const response = await axiosClient.post("/executions/execute", data);
        return response.data;
    },

    // Obter status de execução
    async getExecutionStatus(executionId: string): Promise<{ status: string }> {
        const response = await axiosClient.get(`/executions/${executionId}/status`);
        return response.data;
    },

    // Cancelar execução
    async cancelExecution(executionId: string): Promise<void> {
        await axiosClient.delete(`/executions/${executionId}`);
    },

    // Obter logs de execução
    async getExecutionLogs(executionId: string): Promise<{ logs: WorkflowLog[] }> {
        const response = await axiosClient.get(`/executions/${executionId}/logs`);
        return response.data;
    },

    // Obter estatísticas das filas
    async getQueueStats(): Promise<{ stats: QueueStats }> {
        const response = await axiosClient.get("/executions/stats");
        return response.data;
    },

    // Limpar filas (apenas desenvolvimento)
    async clearQueues(): Promise<void> {
        await axiosClient.delete("/executions/clear");
    },

    // Health check do serviço
    async getServiceHealth(): Promise<{ service: any }> {
        const response = await axiosClient.get("/executions/health");
        return response.data;
    },
};

// React Query Hooks

export const useExecuteWorkflow = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: executionApi.executeWorkflow,
        onSuccess: () => {
            // Invalidate executions list
            queryClient.invalidateQueries({ queryKey: queryKeys.executions.list() });
        },
    });
};

export const useExecutionStatus = (executionId: string | undefined) => {
    return useQuery({
        queryKey: queryKeys.executions.status(executionId!),
        queryFn: () => executionApi.getExecutionStatus(executionId!),
        enabled: !!executionId,
        refetchInterval: 2000, // Poll every 2 seconds
    });
};

export const useExecutionLogs = (executionId: string | undefined) => {
    return useQuery({
        queryKey: queryKeys.executions.logs(executionId!),
        queryFn: () => executionApi.getExecutionLogs(executionId!),
        enabled: !!executionId,
        refetchInterval: 1000, // Poll every second for logs
    });
};

export const useQueueStats = () => {
    return useQuery({
        queryKey: queryKeys.executions.stats(),
        queryFn: executionApi.getQueueStats,
        refetchInterval: 5000, // Poll every 5 seconds
    });
};

export const useServiceHealth = () => {
    return useQuery({
        queryKey: queryKeys.executions.health(),
        queryFn: executionApi.getServiceHealth,
        refetchInterval: 10000, // Poll every 10 seconds
    });
};

export const useCancelExecution = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: executionApi.cancelExecution,
        onSuccess: () => {
            // Invalidate executions queries
            queryClient.invalidateQueries({ queryKey: queryKeys.executions.list() });
        },
    });
};

export const useClearQueues = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: executionApi.clearQueues,
        onSuccess: () => {
            // Invalidate all execution queries
            queryClient.invalidateQueries({ queryKey: queryKeys.executions.list() });
        },
    });
};

// Hook para monitorar execução em tempo real
export const useExecutionMonitor = (executionId: string | undefined) => {
    const statusQuery = useExecutionStatus(executionId);
    const logsQuery = useExecutionLogs(executionId);

    return {
        status: statusQuery.data?.status,
        logs: logsQuery.data?.logs || [],
        isLoading: statusQuery.isLoading || logsQuery.isLoading,
        error: statusQuery.error || logsQuery.error,
        isRunning: statusQuery.data?.status === "running",
        isCompleted: statusQuery.data?.status === "completed",
        isFailed: statusQuery.data?.status === "failed",
        isPending: statusQuery.data?.status === "pending",
    };
};

// Hook para listar execuções de workflow
export const useWorkflowExecutions = (workflowId?: string) => {
    return useQuery({
        queryKey: ["workflowExecutions", workflowId],
        queryFn: () => {
            // Mock implementation
            return Promise.resolve([
                {
                    executionId: "exec_1",
                    status: "completed" as const,
                    startedAt: new Date().toISOString(),
                    completedAt: new Date().toISOString(),
                    duration: 1500,
                },
                {
                    executionId: "exec_2",
                    status: "running" as const,
                    startedAt: new Date().toISOString(),
                },
            ]);
        },
        enabled: !!workflowId,
    });
};
