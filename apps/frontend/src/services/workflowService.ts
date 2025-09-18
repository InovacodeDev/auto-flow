import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { WorkflowCanvas, WorkflowListItem, CreateWorkflowRequest, UpdateWorkflowRequest } from "../types/workflow";

const API_BASE = "http://localhost:3001/api";

// API functions
const workflowApi = {
    // Lista workflows
    async getWorkflows(): Promise<{ workflows: WorkflowListItem[] }> {
        const response = await fetch(`${API_BASE}/workflows`, {
            headers: {
                Authorization: `Bearer mock-token`, // TODO: Real auth token
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch workflows");
        }

        return response.json();
    },

    // Get workflow com dados do canvas
    async getWorkflowCanvas(id: string): Promise<WorkflowCanvas> {
        const response = await fetch(`${API_BASE}/workflows/${id}/canvas`, {
            headers: {
                Authorization: `Bearer mock-token`, // TODO: Real auth token
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch workflow");
        }

        return response.json();
    },

    // Criar novo workflow
    async createWorkflow(data: CreateWorkflowRequest): Promise<WorkflowCanvas> {
        const response = await fetch(`${API_BASE}/workflows/canvas`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer mock-token`, // TODO: Real auth token
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error("Failed to create workflow");
        }

        return response.json();
    },

    // Atualizar workflow
    async updateWorkflow(id: string, data: UpdateWorkflowRequest): Promise<WorkflowCanvas> {
        const response = await fetch(`${API_BASE}/workflows/${id}/canvas`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer mock-token`, // TODO: Real auth token
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error("Failed to update workflow");
        }

        return response.json();
    },

    // Deletar workflow
    async deleteWorkflow(id: string): Promise<void> {
        const response = await fetch(`${API_BASE}/workflows/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer mock-token`, // TODO: Real auth token
            },
        });

        if (!response.ok) {
            throw new Error("Failed to delete workflow");
        }
    },

    // Executar workflow
    async executeWorkflow(id: string): Promise<{ executionId: string }> {
        const response = await fetch(`${API_BASE}/workflows/${id}/execute`, {
            method: "POST",
            headers: {
                Authorization: `Bearer mock-token`, // TODO: Real auth token
            },
        });

        if (!response.ok) {
            throw new Error("Failed to execute workflow");
        }

        return response.json();
    },
};

// React Query Hooks

export const useWorkflows = () => {
    return useQuery({
        queryKey: ["workflows"],
        queryFn: workflowApi.getWorkflows,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useWorkflowCanvas = (id: string | undefined) => {
    return useQuery({
        queryKey: ["workflow", id, "canvas"],
        queryFn: () => workflowApi.getWorkflowCanvas(id!),
        enabled: !!id,
        staleTime: 1 * 60 * 1000, // 1 minute (frequent updates)
    });
};

export const useCreateWorkflow = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: workflowApi.createWorkflow,
        onSuccess: () => {
            // Invalidate workflows list
            queryClient.invalidateQueries({ queryKey: ["workflows"] });
        },
    });
};

export const useUpdateWorkflow = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, ...data }: { id: string } & UpdateWorkflowRequest) => workflowApi.updateWorkflow(id, data),
        onSuccess: (_, variables) => {
            // Invalidate both the specific workflow and the list
            queryClient.invalidateQueries({ queryKey: ["workflow", variables.id, "canvas"] });
            queryClient.invalidateQueries({ queryKey: ["workflows"] });
        },
    });
};

export const useDeleteWorkflow = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: workflowApi.deleteWorkflow,
        onSuccess: () => {
            // Invalidate workflows list
            queryClient.invalidateQueries({ queryKey: ["workflows"] });
        },
    });
};

export const useExecuteWorkflow = () => {
    return useMutation({
        mutationFn: workflowApi.executeWorkflow,
    });
};

// Auto-save hook with debounce
export const useAutoSaveWorkflow = (workflowId: string) => {
    const updateWorkflow = useUpdateWorkflow();

    const autoSave = async (data: UpdateWorkflowRequest) => {
        try {
            await updateWorkflow.mutateAsync({ id: workflowId, ...data });
            console.log("Auto-saved workflow at", new Date().toLocaleTimeString());
        } catch (error) {
            console.error("Auto-save failed:", error);
        }
    };

    return {
        autoSave,
        isAutoSaving: updateWorkflow.isPending,
        autoSaveError: updateWorkflow.error,
    };
};
