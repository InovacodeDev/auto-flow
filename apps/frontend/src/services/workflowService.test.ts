import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { 
    useWorkflows, 
    useWorkflowCanvas, 
    useCreateWorkflow, 
    useUpdateWorkflow, 
    useDeleteWorkflow,
    useExecuteWorkflow,
    useAutoSaveWorkflow,
    workflowApi 
} from "./workflowService";
import { mockWorkflow, testHelpers } from "../test/utils";

// Mock axios
const mockAxios = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
};

vi.mock("../lib/axiosClient", () => ({
    axiosClient: mockAxios,
}));

describe("workflowService", () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = testHelpers.createMockQueryClient();
        vi.clearAllMocks();
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    describe("workflowApi", () => {
        it("getWorkflows calls correct endpoint", async () => {
            mockAxios.get.mockResolvedValue({ data: [mockWorkflow] });

            await workflowApi.getWorkflows();

            expect(mockAxios.get).toHaveBeenCalledWith("/workflows");
        });

        it("getWorkflowCanvas calls correct endpoint", async () => {
            mockAxios.get.mockResolvedValue({ data: mockWorkflow });

            await workflowApi.getWorkflowCanvas("workflow_1");

            expect(mockAxios.get).toHaveBeenCalledWith("/workflows/workflow_1/canvas");
        });

        it("createWorkflow calls correct endpoint", async () => {
            mockAxios.post.mockResolvedValue({ data: mockWorkflow });

            await workflowApi.createWorkflow(mockWorkflow);

            expect(mockAxios.post).toHaveBeenCalledWith("/workflows", mockWorkflow);
        });

        it("updateWorkflow calls correct endpoint", async () => {
            mockAxios.put.mockResolvedValue({ data: mockWorkflow });

            await workflowApi.updateWorkflow("workflow_1", mockWorkflow);

            expect(mockAxios.put).toHaveBeenCalledWith("/workflows/workflow_1", mockWorkflow);
        });

        it("deleteWorkflow calls correct endpoint", async () => {
            mockAxios.delete.mockResolvedValue({ data: {} });

            await workflowApi.deleteWorkflow("workflow_1");

            expect(mockAxios.delete).toHaveBeenCalledWith("/workflows/workflow_1");
        });

        it("executeWorkflow calls correct endpoint", async () => {
            mockAxios.post.mockResolvedValue({ data: { executionId: "exec_1" } });

            await workflowApi.executeWorkflow("workflow_1");

            expect(mockAxios.post).toHaveBeenCalledWith("/workflows/workflow_1/execute");
        });
    });

    describe("useWorkflows", () => {
        it("fetches workflows successfully", async () => {
            mockAxios.get.mockResolvedValue({ data: [mockWorkflow] });

            const { result } = renderHook(() => useWorkflows(), { wrapper });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual([mockWorkflow]);
        });

        it("handles error when fetching workflows fails", async () => {
            mockAxios.get.mockRejectedValue(new Error("Failed to fetch"));

            const { result } = renderHook(() => useWorkflows(), { wrapper });

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            expect(result.current.error).toBeDefined();
        });
    });

    describe("useWorkflowCanvas", () => {
        it("fetches workflow canvas successfully", async () => {
            mockAxios.get.mockResolvedValue({ data: mockWorkflow });

            const { result } = renderHook(() => useWorkflowCanvas("workflow_1"), { wrapper });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockWorkflow);
        });

        it("handles error when fetching workflow canvas fails", async () => {
            mockAxios.get.mockRejectedValue(new Error("Failed to fetch"));

            const { result } = renderHook(() => useWorkflowCanvas("workflow_1"), { wrapper });

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            expect(result.current.error).toBeDefined();
        });
    });

    describe("useCreateWorkflow", () => {
        it("creates workflow successfully", async () => {
            mockAxios.post.mockResolvedValue({ data: mockWorkflow });

            const { result } = renderHook(() => useCreateWorkflow(), { wrapper });

            await act(async () => {
                await result.current.mutateAsync(mockWorkflow);
            });

            expect(result.current.isSuccess).toBe(true);
            expect(result.current.data).toEqual(mockWorkflow);
        });

        it("handles error when creating workflow fails", async () => {
            mockAxios.post.mockRejectedValue(new Error("Failed to create"));

            const { result } = renderHook(() => useCreateWorkflow(), { wrapper });

            await act(async () => {
                try {
                    await result.current.mutateAsync(mockWorkflow);
                } catch (error) {
                    // Expected to throw
                }
            });

            expect(result.current.isError).toBe(true);
            expect(result.current.error).toBeDefined();
        });
    });

    describe("useUpdateWorkflow", () => {
        it("updates workflow successfully", async () => {
            mockAxios.put.mockResolvedValue({ data: mockWorkflow });

            const { result } = renderHook(() => useUpdateWorkflow(), { wrapper });

            await act(async () => {
                await result.current.mutateAsync({ id: "workflow_1", data: mockWorkflow });
            });

            expect(result.current.isSuccess).toBe(true);
            expect(result.current.data).toEqual(mockWorkflow);
        });

        it("handles error when updating workflow fails", async () => {
            mockAxios.put.mockRejectedValue(new Error("Failed to update"));

            const { result } = renderHook(() => useUpdateWorkflow(), { wrapper });

            await act(async () => {
                try {
                    await result.current.mutateAsync({ id: "workflow_1", data: mockWorkflow });
                } catch (error) {
                    // Expected to throw
                }
            });

            expect(result.current.isError).toBe(true);
            expect(result.current.error).toBeDefined();
        });
    });

    describe("useDeleteWorkflow", () => {
        it("deletes workflow successfully", async () => {
            mockAxios.delete.mockResolvedValue({ data: {} });

            const { result } = renderHook(() => useDeleteWorkflow(), { wrapper });

            await act(async () => {
                await result.current.mutateAsync("workflow_1");
            });

            expect(result.current.isSuccess).toBe(true);
        });

        it("handles error when deleting workflow fails", async () => {
            mockAxios.delete.mockRejectedValue(new Error("Failed to delete"));

            const { result } = renderHook(() => useDeleteWorkflow(), { wrapper });

            await act(async () => {
                try {
                    await result.current.mutateAsync("workflow_1");
                } catch (error) {
                    // Expected to throw
                }
            });

            expect(result.current.isError).toBe(true);
            expect(result.current.error).toBeDefined();
        });
    });

    describe("useExecuteWorkflow", () => {
        it("executes workflow successfully", async () => {
            mockAxios.post.mockResolvedValue({ data: { executionId: "exec_1" } });

            const { result } = renderHook(() => useExecuteWorkflow(), { wrapper });

            await act(async () => {
                await result.current.mutateAsync("workflow_1");
            });

            expect(result.current.isSuccess).toBe(true);
            expect(result.current.data).toEqual({ executionId: "exec_1" });
        });

        it("handles error when executing workflow fails", async () => {
            mockAxios.post.mockRejectedValue(new Error("Failed to execute"));

            const { result } = renderHook(() => useExecuteWorkflow(), { wrapper });

            await act(async () => {
                try {
                    await result.current.mutateAsync("workflow_1");
                } catch (error) {
                    // Expected to throw
                }
            });

            expect(result.current.isError).toBe(true);
            expect(result.current.error).toBeDefined();
        });
    });

    describe("useAutoSaveWorkflow", () => {
        it("auto-saves workflow with debouncing", async () => {
            mockAxios.put.mockResolvedValue({ data: mockWorkflow });

            const { result } = renderHook(() => useAutoSaveWorkflow(), { wrapper });

            // Trigger multiple rapid updates
            act(() => {
                result.current.mutate({ id: "workflow_1", data: mockWorkflow });
            });

            act(() => {
                result.current.mutate({ id: "workflow_1", data: mockWorkflow });
            });

            act(() => {
                result.current.mutate({ id: "workflow_1", data: mockWorkflow });
            });

            // Wait for debounced save
            await waitFor(() => {
                expect(mockAxios.put).toHaveBeenCalledTimes(1);
            }, { timeout: 2000 });
        });
    });
});
