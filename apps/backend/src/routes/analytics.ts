import { FastifyPluginAsync } from "fastify";
import AnalyticsService from "../analytics/AnalyticsService";
import type { WorkflowExecution } from "../core/types";

// Instância global do AnalyticsService
let analyticsService: AnalyticsService;

export const analyticsRoutes: FastifyPluginAsync = async (fastify) => {
    // Inicializar AnalyticsService se não estiver inicializado
    if (!analyticsService) {
        analyticsService = new AnalyticsService();
        fastify.log.info("AnalyticsService inicializado com sucesso");
    }

    // GET /api/analytics/dashboard - Métricas gerais da organização
    fastify.get(
        "/dashboard",
        {
            schema: {
                tags: ["analytics"],
                querystring: {
                    type: "object",
                    properties: {
                        timeRange: { type: "string", enum: ["1h", "24h", "7d", "30d"], default: "7d" },
                    },
                },
                response: {
                    200: {
                        type: "object",
                        properties: {
                            success: { type: "boolean" },
                            data: {
                                type: "object",
                                properties: {
                                    overview: { type: "object" },
                                    trends: { type: "object" },
                                    topWorkflows: { type: "array" },
                                    recentExecutions: { type: "array" },
                                },
                            },
                        },
                    },
                },
            },
        },
        async (request, reply) => {
            try {
                const { timeRange } = request.query as any;

                // TODO: Extrair organizationId do token JWT
                const organizationId = "temp-org-id";

                const metrics = await analyticsService.getOrganizationMetrics(organizationId, timeRange);

                return {
                    success: true,
                    data: metrics,
                };
            } catch (error) {
                fastify.log.error(`Erro ao buscar métricas: ${error}`);
                return reply.status(500).send({
                    success: false,
                    error: "Erro interno do servidor",
                });
            }
        }
    );

    // GET /api/analytics/workflows/:workflowId/metrics - Métricas de um workflow específico
    fastify.get(
        "/workflows/:workflowId/metrics",
        {
            schema: {
                tags: ["analytics"],
                params: {
                    type: "object",
                    required: ["workflowId"],
                    properties: {
                        workflowId: { type: "string" },
                    },
                },
                response: {
                    200: {
                        type: "object",
                        properties: {
                            success: { type: "boolean" },
                            data: { type: "object" },
                        },
                    },
                },
            },
        },
        async (request, reply) => {
            try {
                const { workflowId } = request.params as any;

                // TODO: Extrair organizationId do token JWT
                const organizationId = "temp-org-id";

                const metrics = await analyticsService.getWorkflowMetrics(workflowId, organizationId);

                return {
                    success: true,
                    data: metrics,
                };
            } catch (error) {
                fastify.log.error(`Erro ao buscar métricas do workflow: ${error}`);
                return reply.status(500).send({
                    success: false,
                    error: "Erro interno do servidor",
                });
            }
        }
    );

    // GET /api/analytics/workflows/:workflowId/roi - ROI de um workflow específico
    fastify.get(
        "/workflows/:workflowId/roi",
        {
            schema: {
                tags: ["analytics"],
                params: {
                    type: "object",
                    required: ["workflowId"],
                    properties: {
                        workflowId: { type: "string" },
                    },
                },
                response: {
                    200: {
                        type: "object",
                        properties: {
                            success: { type: "boolean" },
                            data: { type: "object" },
                        },
                    },
                },
            },
        },
        async (request, reply) => {
            try {
                const { workflowId } = request.params as any;

                // TODO: Extrair organizationId do token JWT
                const organizationId = "temp-org-id";

                const roi = await analyticsService.calculateWorkflowROI(workflowId, organizationId);

                return {
                    success: true,
                    data: roi,
                };
            } catch (error) {
                fastify.log.error(`Erro ao calcular ROI: ${error}`);
                return reply.status(500).send({
                    success: false,
                    error: "Erro interno do servidor",
                });
            }
        }
    );

    // GET /api/analytics/roi-report - Relatório de ROI consolidado
    fastify.get(
        "/roi-report",
        {
            schema: {
                tags: ["analytics"],
                querystring: {
                    type: "object",
                    properties: {
                        startDate: { type: "string", format: "date-time" },
                        endDate: { type: "string", format: "date-time" },
                    },
                },
                response: {
                    200: {
                        type: "object",
                        properties: {
                            success: { type: "boolean" },
                            data: { type: "object" },
                        },
                    },
                },
            },
        },
        async (request, reply) => {
            try {
                const { startDate, endDate } = request.query as any;

                // TODO: Extrair organizationId do token JWT
                const organizationId = "temp-org-id";

                const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                const end = endDate ? new Date(endDate) : new Date();

                const report = await analyticsService.generatePerformanceReport(organizationId, start, end);

                return {
                    success: true,
                    data: report,
                };
            } catch (error) {
                fastify.log.error(`Erro ao gerar relatório: ${error}`);
                return reply.status(500).send({
                    success: false,
                    error: "Erro interno do servidor",
                });
            }
        }
    );

    // GET /api/analytics/alerts - Alertas ativos
    fastify.get(
        "/alerts",
        {
            schema: {
                tags: ["analytics"],
                response: {
                    200: {
                        type: "object",
                        properties: {
                            success: { type: "boolean" },
                            data: {
                                type: "object",
                                properties: {
                                    alerts: { type: "array" },
                                },
                            },
                        },
                    },
                },
            },
        },
        async (_request, reply) => {
            try {
                // TODO: Extrair organizationId do token JWT
                const organizationId = "temp-org-id";

                const alerts = await analyticsService.getActiveAlerts(organizationId);

                return {
                    success: true,
                    data: { alerts },
                };
            } catch (error) {
                fastify.log.error(`Erro ao buscar alertas: ${error}`);
                return reply.status(500).send({
                    success: false,
                    error: "Erro interno do servidor",
                });
            }
        }
    );

    // POST /api/analytics/execution - Registrar execução de workflow
    fastify.post(
        "/execution",
        {
            schema: {
                tags: ["analytics"],
                body: {
                    type: "object",
                    required: ["workflowId", "status", "startTime"],
                    properties: {
                        id: { type: "string" },
                        workflowId: { type: "string" },
                        status: { type: "string", enum: ["success", "failed", "running", "canceled"] },
                        startTime: { type: "string", format: "date-time" },
                        endTime: { type: "string", format: "date-time" },
                        duration: { type: "number" },
                        triggeredBy: { type: "string" },
                        actionsExecuted: { type: "number" },
                        errors: { type: "array", items: { type: "string" } },
                        metadata: { type: "object" },
                    },
                },
                response: {
                    200: {
                        type: "object",
                        properties: {
                            success: { type: "boolean" },
                            message: { type: "string" },
                        },
                    },
                },
            },
        },
        async (request, reply) => {
            try {
                const executionData = request.body as any;

                // TODO: Extrair organizationId do token JWT
                const organizationId = "temp-org-id";

                const execution: Partial<WorkflowExecution> = {
                    id: executionData.id || `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    workflowId: executionData.workflowId,
                    organizationId,
                    status: executionData.status,
                    startTime: new Date(executionData.startTime),
                    endTime: executionData.endTime ? new Date(executionData.endTime) : new Date(),
                    duration: executionData.duration,
                    triggeredBy: executionData.triggeredBy || "manual",
                    actionsExecuted: executionData.actionsExecuted || 0,
                    errors: executionData.errors || [],
                    metadata: executionData.metadata || {},
                };

                await analyticsService.recordWorkflowExecution(execution as WorkflowExecution);

                return {
                    success: true,
                    message: "Execução registrada com sucesso",
                };
            } catch (error) {
                fastify.log.error(`Erro ao registrar execução: ${error}`);
                return reply.status(500).send({
                    success: false,
                    error: "Erro interno do servidor",
                });
            }
        }
    );

    // WebSocket endpoints para métricas em tempo real
    // TODO: Implementar WebSocket adequadamente com plugin correto
};
