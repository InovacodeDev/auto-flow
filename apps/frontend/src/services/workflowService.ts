import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    WorkflowCanvas,
    WorkflowListItem,
    CreateWorkflowRequest,
    UpdateWorkflowRequest,
} from "../types/workflow";
import { axiosClient } from "../lib/axiosClient";
import { queryKeys } from "../lib/queryClient";

// API functions
const workflowApi = {
    // Lista workflows
    async getWorkflows(): Promise<{ workflows: WorkflowListItem[] }> {
        const response = await axiosClient.get("/workflows");
        return response.data;
    },

    // Get workflow com dados do canvas
    async getWorkflowCanvas(id: string): Promise<WorkflowCanvas> {
        const response = await axiosClient.get(`/workflows/${id}/canvas`);
        return response.data;
    },

    // Criar novo workflow
    async createWorkflow(data: CreateWorkflowRequest): Promise<WorkflowCanvas> {
        const response = await axiosClient.post("/workflows/canvas", data);
        return response.data;
    },

    // Atualizar workflow
    async updateWorkflow(id: string, data: UpdateWorkflowRequest): Promise<WorkflowCanvas> {
        const response = await axiosClient.put(`/workflows/${id}/canvas`, data);
        return response.data;
    },

    // Deletar workflow
    async deleteWorkflow(id: string): Promise<void> {
        await axiosClient.delete(`/workflows/${id}`);
    },

    // Executar workflow
    async executeWorkflow(id: string): Promise<{ executionId: string }> {
        const response = await axiosClient.post(`/workflows/${id}/execute`);
        return response.data;
    },
};

// React Query Hooks

export const useWorkflows = () => {
    return useQuery({
        queryKey: queryKeys.workflows.list(),
        queryFn: workflowApi.getWorkflows,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useWorkflowCanvas = (id: string | undefined) => {
    return useQuery({
        queryKey: queryKeys.workflows.detail(id!),
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
            queryClient.invalidateQueries({ queryKey: queryKeys.workflows.list() });
        },
    });
};

export const useUpdateWorkflow = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, ...data }: { id: string } & UpdateWorkflowRequest) =>
            workflowApi.updateWorkflow(id, data),
        onSuccess: (_, variables) => {
            // Invalidate both the specific workflow and the list
            queryClient.invalidateQueries({ queryKey: queryKeys.workflows.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.workflows.list() });
        },
    });
};

export const useDeleteWorkflow = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: workflowApi.deleteWorkflow,
        onSuccess: () => {
            // Invalidate workflows list
            queryClient.invalidateQueries({ queryKey: queryKeys.workflows.list() });
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
