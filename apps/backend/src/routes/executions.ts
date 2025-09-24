import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { workflowExecutionService } from "../core/queue/WorkflowExecutionService";
import { WorkflowExecutionInput } from "../core/queue/types";

// Schemas de validação
const ExecuteWorkflowSchema = z.object({
    workflowId: z.string().min(1, "ID do workflow é obrigatório"),
    triggerData: z.record(z.string(), z.any()).optional(),
    userId: z.string().optional(),
    organizationId: z.string().optional(),
    context: z.record(z.string(), z.any()).optional(),
});

const ExecutionIdSchema = z.object({
    executionId: z.string(),
});

/**
 * Rotas para execução de workflows
 */
export async function executionRoutes(fastify: FastifyInstance) {
    // Executar workflow
    fastify.post("/execute", async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const body = request.body as z.infer<typeof ExecuteWorkflowSchema>;

            // Validar dados
            const validatedData = ExecuteWorkflowSchema.parse(body);

            // Verificar se o serviço está pronto
            if (!workflowExecutionService.isReady()) {
                return reply.status(503).send({
                    success: false,
                    error: "Workflow execution service is not ready",
                });
            }

            // Construir o input para execução do workflow
            const workflowInput: WorkflowExecutionInput = {
                workflowId: validatedData.workflowId,
                ...(validatedData.triggerData && { triggerData: validatedData.triggerData }),
                ...(validatedData.userId && { userId: validatedData.userId }),
                ...(validatedData.organizationId && { organizationId: validatedData.organizationId }),
                ...(validatedData.context && { context: validatedData.context }),
            };

            // Executar workflow
            const executionId = await workflowExecutionService.executeWorkflow(workflowInput);

            return reply.send({
                success: true,
                executionId,
                message: "Workflow execution started successfully",
            });
        } catch (error) {
            console.error("Error executing workflow:", error);

            if (error instanceof z.ZodError) {
                return reply.status(400).send({
                    success: false,
                    error: "Invalid request data",
                    details: error.issues,
                });
            }

            return reply.status(500).send({
                success: false,
                error: error instanceof Error ? error.message : "Internal server error",
            });
        }
    });

    // Obter status de execução
    fastify.get("/:executionId/status", async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { executionId } = request.params as z.infer<typeof ExecutionIdSchema>;

            // Validar executionId
            const validatedParams = ExecutionIdSchema.parse({ executionId });

            // Verificar se o serviço está pronto
            if (!workflowExecutionService.isReady()) {
                return reply.status(503).send({
                    success: false,
                    error: "Workflow execution service is not ready",
                });
            }

            // Obter status
            const status = await workflowExecutionService.getExecutionStatus(validatedParams.executionId);

            if (status === null) {
                return reply.status(404).send({
                    success: false,
                    error: "Execution not found",
                });
            }

            return reply.send({
                success: true,
                executionId: validatedParams.executionId,
                status,
                timestamp: new Date().toISOString(),
            });
        } catch (error) {
            console.error("Error getting execution status:", error);

            if (error instanceof z.ZodError) {
                return reply.status(400).send({
                    success: false,
                    error: "Invalid execution ID",
                });
            }

            return reply.status(500).send({
                success: false,
                error: error instanceof Error ? error.message : "Internal server error",
            });
        }
    });

    // Cancelar execução
    fastify.delete("/:executionId", async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { executionId } = request.params as z.infer<typeof ExecutionIdSchema>;

            // Validar executionId
            const validatedParams = ExecutionIdSchema.parse({ executionId });

            // Verificar se o serviço está pronto
            if (!workflowExecutionService.isReady()) {
                return reply.status(503).send({
                    success: false,
                    error: "Workflow execution service is not ready",
                });
            }

            // Cancelar execução
            const cancelled = await workflowExecutionService.cancelExecution(validatedParams.executionId);

            if (!cancelled) {
                return reply.status(404).send({
                    success: false,
                    error: "Execution not found or already completed",
                });
            }

            return reply.send({
                success: true,
                message: "Execution cancelled successfully",
            });
        } catch (error) {
            console.error("Error cancelling execution:", error);

            if (error instanceof z.ZodError) {
                return reply.status(400).send({
                    success: false,
                    error: "Invalid execution ID",
                });
            }

            return reply.status(500).send({
                success: false,
                error: error instanceof Error ? error.message : "Internal server error",
            });
        }
    });

    // Obter logs da execução
    fastify.get("/:executionId/logs", async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const { executionId } = request.params as z.infer<typeof ExecutionIdSchema>;

            // Validar executionId
            const validatedParams = ExecutionIdSchema.parse({ executionId });

            // Verificar se o serviço está pronto
            if (!workflowExecutionService.isReady()) {
                return reply.status(503).send({
                    success: false,
                    error: "Workflow execution service is not ready",
                });
            }

            // Obter logs
            const logs = await workflowExecutionService.getExecutionLogs(validatedParams.executionId);

            if (!logs) {
                return reply.status(404).send({
                    success: false,
                    error: "Execution not found",
                });
            }

            return reply.send({
                success: true,
                executionId: validatedParams.executionId,
                logs,
            });
        } catch (error) {
            console.error("Error getting execution logs:", error);

            if (error instanceof z.ZodError) {
                return reply.status(400).send({
                    success: false,
                    error: "Invalid execution ID",
                });
            }

            return reply.status(500).send({
                success: false,
                error: error instanceof Error ? error.message : "Internal server error",
            });
        }
    });

    // Obter estatísticas das filas
    fastify.get("/stats", async (_request: FastifyRequest, reply: FastifyReply) => {
        try {
            // Verificar se o serviço está pronto
            if (!workflowExecutionService.isReady()) {
                return reply.status(503).send({
                    success: false,
                    error: "Workflow execution service is not ready",
                });
            }

            // Obter estatísticas
            const stats = await workflowExecutionService.getQueueStats();

            return reply.send({
                success: true,
                stats,
            });
        } catch (error) {
            console.error("Error getting queue stats:", error);

            return reply.status(500).send({
                success: false,
                error: error instanceof Error ? error.message : "Internal server error",
            });
        }
    });

    // Limpar filas (apenas para desenvolvimento)
    fastify.delete("/clear", async (_request: FastifyRequest, reply: FastifyReply) => {
        try {
            // Verificar se é ambiente de desenvolvimento
            if (process.env["NODE_ENV"] === "production") {
                return reply.status(403).send({
                    success: false,
                    error: "Queue clearing is not allowed in production",
                });
            }

            // Verificar se o serviço está pronto
            if (!workflowExecutionService.isReady()) {
                return reply.status(503).send({
                    success: false,
                    error: "Workflow execution service is not ready",
                });
            }

            // Limpar filas
            await workflowExecutionService.clearQueues();

            return reply.send({
                success: true,
                message: "Queues cleared successfully",
            });
        } catch (error) {
            console.error("Error clearing queues:", error);

            return reply.status(500).send({
                success: false,
                error: error instanceof Error ? error.message : "Internal server error",
            });
        }
    });

    // Health check do serviço
    fastify.get("/health", async (_request: FastifyRequest, reply: FastifyReply) => {
        try {
            const serviceInfo = workflowExecutionService.getServiceInfo();

            return reply.send({
                success: true,
                service: serviceInfo,
            });
        } catch (error) {
            console.error("Error checking service health:", error);

            return reply.status(500).send({
                success: false,
                error: error instanceof Error ? error.message : "Internal server error",
            });
        }
    });
}
