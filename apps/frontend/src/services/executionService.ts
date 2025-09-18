import { useMutation, useQuery } from "@tanstack/react-query";

// Tipos para execuções
export interface WorkflowExecution {
    id: string;
    status: "running" | "success" | "failed" | "cancelled";
    startedAt: string;
    completedAt?: string;
    duration?: number;
    errorMessage?: string;
}

export interface ExecutionLog {
    id: string;
    nodeId?: string;
    level: "info" | "warn" | "error" | "debug";
    component: string;
    message: string;
    data?: any;
    timestamp: string;
}

export interface ExecuteWorkflowRequest {
    triggerData?: any;
    triggerType?: "manual" | "webhook" | "schedule";
}

export interface ExecuteWorkflowResponse {
    executionId: string;
    status: string;
    message: string;
}

// API functions
const executeWorkflow = async (
    workflowId: string,
    request: ExecuteWorkflowRequest
): Promise<ExecuteWorkflowResponse> => {
    const response = await fetch(`/api/workflows/${workflowId}/execute`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken") || "mock-token"}`,
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao executar workflow");
    }

    return response.json();
};

const fetchWorkflowExecutions = async (
    workflowId: string,
    options: {
        limit?: number;
        offset?: number;
        status?: string;
    } = {}
): Promise<{ executions: WorkflowExecution[]; total: number }> => {
    const params = new URLSearchParams();
    if (options.limit) params.append("limit", options.limit.toString());
    if (options.offset) params.append("offset", options.offset.toString());
    if (options.status) params.append("status", options.status);

    const response = await fetch(`/api/workflows/${workflowId}/executions?${params}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken") || "mock-token"}`,
        },
    });

    if (!response.ok) {
        throw new Error("Erro ao buscar execuções");
    }

    return response.json();
};

const fetchExecutionLogs = async (
    executionId: string,
    options: {
        limit?: number;
        offset?: number;
        level?: string;
        nodeId?: string;
    } = {}
): Promise<{ logs: ExecutionLog[]; total: number }> => {
    const params = new URLSearchParams();
    if (options.limit) params.append("limit", options.limit.toString());
    if (options.offset) params.append("offset", options.offset.toString());
    if (options.level) params.append("level", options.level);
    if (options.nodeId) params.append("nodeId", options.nodeId);

    const response = await fetch(`/api/workflows/executions/${executionId}/logs?${params}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken") || "mock-token"}`,
        },
    });

    if (!response.ok) {
        throw new Error("Erro ao buscar logs de execução");
    }

    return response.json();
};

// React Query hooks

/**
 * Hook para executar um workflow
 */
export const useExecuteWorkflow = () => {
    return useMutation({
        mutationFn: ({ workflowId, request }: { workflowId: string; request: ExecuteWorkflowRequest }) =>
            executeWorkflow(workflowId, request),
        onSuccess: (data) => {
            console.log("Workflow executado com sucesso:", data);
        },
        onError: (error) => {
            console.error("Erro ao executar workflow:", error);
        },
    });
};

/**
 * Hook para buscar execuções de um workflow
 */
export const useWorkflowExecutions = (
    workflowId: string,
    options: {
        limit?: number;
        offset?: number;
        status?: string;
        enabled?: boolean;
    } = {}
) => {
    return useQuery({
        queryKey: ["workflow-executions", workflowId, options],
        queryFn: () => fetchWorkflowExecutions(workflowId, options),
        enabled: options.enabled !== false && !!workflowId,
        refetchInterval: 5000, // Atualizar a cada 5 segundos para execuções em andamento
    });
};

/**
 * Hook para buscar logs de uma execução
 */
export const useExecutionLogs = (
    executionId: string,
    options: {
        limit?: number;
        offset?: number;
        level?: string;
        nodeId?: string;
        enabled?: boolean;
    } = {}
) => {
    return useQuery({
        queryKey: ["execution-logs", executionId, options],
        queryFn: () => fetchExecutionLogs(executionId, options),
        enabled: options.enabled !== false && !!executionId,
        refetchInterval: 2000, // Atualizar a cada 2 segundos para logs em tempo real
    });
};

export default {
    useExecuteWorkflow,
    useWorkflowExecutions,
    useExecutionLogs,
};
