import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { UnifiedIntegrationsService } from "../core/integrations/UnifiedIntegrationsService";

async function integrationsUnifiedRoutes(fastify: FastifyInstance) {
    const unifiedService = UnifiedIntegrationsService.getInstance();

    // Health check de todas as integrações
    fastify.get(
        "/health",
        {
            schema: {
                tags: ["integrations-unified"],
                summary: "Status de saúde de todas as integrações",
                description: "Obtém o status de conectividade e métricas de todas as integrações brasileiras",
                response: {
                    200: {
                        type: "object",
                        properties: {
                            success: { type: "boolean" },
                            data: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        id: { type: "string" },
                                        name: { type: "string" },
                                        type: { type: "string", enum: ["whatsapp", "pix", "crm", "erp"] },
                                        status: {
                                            type: "string",
                                            enum: ["connected", "disconnected", "error", "configuring"],
                                        },
                                        platform: { type: "string" },
                                        lastSync: { type: "string" },
                                        errorMessage: { type: "string" },
                                        metrics: {
                                            type: "object",
                                            properties: {
                                                totalOperations: { type: "number" },
                                                successRate: { type: "number" },
                                                monthlyVolume: { type: "number" },
                                                lastActivity: { type: "string" },
                                            },
                                        },
                                        configuration: {
                                            type: "object",
                                            properties: {
                                                isConfigured: { type: "boolean" },
                                                requiredFields: { type: "array", items: { type: "string" } },
                                                optionalFields: { type: "array", items: { type: "string" } },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        async (_request: FastifyRequest, reply: FastifyReply) => {
            try {
                const health = await unifiedService.getIntegrationsHealth();

                return reply.send({
                    success: true,
                    data: health,
                });
            } catch (error) {
                console.error("Erro ao obter status das integrações:", error);
                return reply.status(500).send({
                    success: false,
                    error: error instanceof Error ? error.message : "Erro interno do servidor",
                });
            }
        }
    );

    // Estatísticas gerais das integrações
    fastify.get(
        "/stats",
        {
            schema: {
                tags: ["integrations-unified"],
                summary: "Estatísticas gerais das integrações",
                description: "Obtém métricas consolidadas de todas as integrações",
                response: {
                    200: {
                        type: "object",
                        properties: {
                            success: { type: "boolean" },
                            data: {
                                type: "object",
                                properties: {
                                    totalIntegrations: { type: "number" },
                                    activeIntegrations: { type: "number" },
                                    monthlyOperations: { type: "number" },
                                    successRate: { type: "number" },
                                    totalRevenue: { type: "number" },
                                },
                            },
                        },
                    },
                },
            },
        },
        async (_request: FastifyRequest, reply: FastifyReply) => {
            try {
                const stats = await unifiedService.getIntegrationsStats();

                return reply.send({
                    success: true,
                    data: stats,
                });
            } catch (error) {
                console.error("Erro ao obter estatísticas das integrações:", error);
                return reply.status(500).send({
                    success: false,
                    error: error instanceof Error ? error.message : "Erro interno do servidor",
                });
            }
        }
    );

    // Histórico de operações
    fastify.get<{
        Querystring: {
            type?: string;
            platform?: string;
            status?: string;
            startDate?: string;
            endDate?: string;
            limit?: number;
        };
    }>(
        "/operations",
        {
            schema: {
                tags: ["integrations-unified"],
                summary: "Histórico de operações",
                description: "Obtém o histórico de operações das integrações com filtros opcionais",
                querystring: {
                    type: "object",
                    properties: {
                        type: { type: "string", description: "Filtrar por tipo de integração" },
                        platform: { type: "string", description: "Filtrar por plataforma" },
                        status: {
                            type: "string",
                            enum: ["success", "error", "pending"],
                            description: "Filtrar por status",
                        },
                        startDate: { type: "string", format: "date", description: "Data de início (YYYY-MM-DD)" },
                        endDate: { type: "string", format: "date", description: "Data de fim (YYYY-MM-DD)" },
                        limit: { type: "number", minimum: 1, maximum: 1000, description: "Limite de resultados" },
                    },
                },
                response: {
                    200: {
                        type: "object",
                        properties: {
                            success: { type: "boolean" },
                            data: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        id: { type: "string" },
                                        integrationType: { type: "string" },
                                        platform: { type: "string" },
                                        operation: { type: "string" },
                                        status: { type: "string", enum: ["success", "error", "pending"] },
                                        timestamp: { type: "string", format: "date-time" },
                                        data: { type: "object" },
                                        error: { type: "string" },
                                    },
                                },
                            },
                            pagination: {
                                type: "object",
                                properties: {
                                    total: { type: "number" },
                                    page: { type: "number" },
                                    limit: { type: "number" },
                                    hasMore: { type: "boolean" },
                                },
                            },
                        },
                    },
                },
            },
        },
        async (
            request: FastifyRequest<{
                Querystring: {
                    type?: string;
                    platform?: string;
                    status?: string;
                    startDate?: string;
                    endDate?: string;
                    limit?: number;
                };
            }>,
            reply: FastifyReply
        ) => {
            try {
                const { type, platform, status, startDate, endDate, limit = 100 } = request.query;

                const filters: any = {};
                if (type) filters.type = type;
                if (platform) filters.platform = platform;
                if (status) filters.status = status;
                if (startDate) filters.startDate = new Date(startDate);
                if (endDate) filters.endDate = new Date(endDate);
                if (limit) filters.limit = Math.min(limit, 1000);

                const operations = unifiedService.getOperationHistory(filters);

                return reply.send({
                    success: true,
                    data: operations,
                    pagination: {
                        total: operations.length,
                        page: 1,
                        limit,
                        hasMore: false,
                    },
                });
            } catch (error) {
                console.error("Erro ao obter histórico de operações:", error);
                return reply.status(500).send({
                    success: false,
                    error: error instanceof Error ? error.message : "Erro interno do servidor",
                });
            }
        }
    );

    // Sincronizar todas as integrações
    fastify.post(
        "/sync",
        {
            schema: {
                tags: ["integrations-unified"],
                summary: "Sincronizar todas as integrações",
                description: "Força a sincronização de todas as integrações ativas",
                response: {
                    200: {
                        type: "object",
                        properties: {
                            success: { type: "boolean" },
                            data: {
                                type: "object",
                                properties: {
                                    successful: { type: "number" },
                                    failed: { type: "number" },
                                    details: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                id: { type: "string" },
                                                status: { type: "string", enum: ["success", "error"] },
                                                error: { type: "string" },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        async (_request: FastifyRequest, reply: FastifyReply) => {
            try {
                const result = await unifiedService.syncAllIntegrations();

                return reply.send({
                    success: true,
                    data: result,
                });
            } catch (error) {
                console.error("Erro ao sincronizar integrações:", error);
                return reply.status(500).send({
                    success: false,
                    error: error instanceof Error ? error.message : "Erro interno do servidor",
                });
            }
        }
    );

    // Limpeza de dados antigos
    fastify.post(
        "/cleanup",
        {
            schema: {
                tags: ["integrations-unified"],
                summary: "Limpeza de dados antigos",
                description: "Remove operações antigas do histórico (90+ dias)",
                response: {
                    200: {
                        type: "object",
                        properties: {
                            success: { type: "boolean" },
                            data: {
                                type: "object",
                                properties: {
                                    removedOperations: { type: "number" },
                                    message: { type: "string" },
                                },
                            },
                        },
                    },
                },
            },
        },
        async (_request: FastifyRequest, reply: FastifyReply) => {
            try {
                const removedCount = unifiedService.cleanupOldData();

                return reply.send({
                    success: true,
                    data: {
                        removedOperations: removedCount,
                        message: `${removedCount} operações antigas foram removidas`,
                    },
                });
            } catch (error) {
                console.error("Erro na limpeza de dados:", error);
                return reply.status(500).send({
                    success: false,
                    error: error instanceof Error ? error.message : "Erro interno do servidor",
                });
            }
        }
    );

    // Exportar dados de monitoramento
    fastify.get(
        "/export",
        {
            schema: {
                tags: ["integrations-unified"],
                summary: "Exportar dados de monitoramento",
                description: "Exporta dados completos das integrações para análise",
                response: {
                    200: {
                        type: "object",
                        properties: {
                            success: { type: "boolean" },
                            data: {
                                type: "object",
                                properties: {
                                    integrations: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                id: { type: "string" },
                                                type: { type: "string" },
                                                platform: { type: "string" },
                                                status: { type: "string" },
                                            },
                                        },
                                    },
                                    operations: {
                                        type: "array",
                                        items: { type: "object" },
                                    },
                                    stats: {
                                        type: "object",
                                        properties: {
                                            totalIntegrations: { type: "number" },
                                            activeIntegrations: { type: "number" },
                                            monthlyOperations: { type: "number" },
                                            successRate: { type: "number" },
                                            totalRevenue: { type: "number" },
                                        },
                                    },
                                    exportedAt: { type: "string", format: "date-time" },
                                },
                            },
                        },
                    },
                },
            },
        },
        async (_request: FastifyRequest, reply: FastifyReply) => {
            try {
                const exportData = unifiedService.exportMonitoringData();

                return reply.send({
                    success: true,
                    data: exportData,
                });
            } catch (error) {
                console.error("Erro ao exportar dados:", error);
                return reply.status(500).send({
                    success: false,
                    error: error instanceof Error ? error.message : "Erro interno do servidor",
                });
            }
        }
    );

    // Registrar nova integração (para uso interno)
    fastify.post<{
        Body: {
            id: string;
            type: "whatsapp" | "pix" | "crm" | "erp";
            platform: string;
            service: any;
        };
    }>(
        "/register",
        {
            schema: {
                tags: ["integrations-unified"],
                summary: "Registrar nova integração",
                description: "Registra uma nova integração no sistema unificado (uso interno)",
                body: {
                    type: "object",
                    required: ["id", "type", "platform"],
                    properties: {
                        id: { type: "string", description: "ID único da integração" },
                        type: { type: "string", enum: ["whatsapp", "pix", "crm", "erp"] },
                        platform: { type: "string", description: "Nome da plataforma" },
                        service: { type: "object", description: "Instância do serviço" },
                    },
                },
                response: {
                    200: {
                        type: "object",
                        properties: {
                            success: { type: "boolean" },
                            message: { type: "string" },
                            id: { type: "string" },
                        },
                    },
                },
            },
        },
        async (
            request: FastifyRequest<{
                Body: {
                    id: string;
                    type: "whatsapp" | "pix" | "crm" | "erp";
                    platform: string;
                    service: any;
                };
            }>,
            reply: FastifyReply
        ) => {
            try {
                const { id, type, platform, service } = request.body;

                unifiedService.registerIntegration(id, service, type, platform);

                return reply.send({
                    success: true,
                    message: `Integração ${platform} (${type}) registrada com sucesso`,
                    id,
                });
            } catch (error) {
                console.error("Erro ao registrar integração:", error);
                return reply.status(400).send({
                    success: false,
                    error: error instanceof Error ? error.message : "Erro interno do servidor",
                });
            }
        }
    );

    // Remover integração
    fastify.delete<{ Params: { id: string } }>(
        "/unregister/:id",
        {
            schema: {
                tags: ["integrations-unified"],
                summary: "Remover integração",
                description: "Remove uma integração do sistema unificado",
                params: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                    },
                    required: ["id"],
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
        async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
            try {
                const { id } = request.params;

                unifiedService.unregisterIntegration(id);

                return reply.send({
                    success: true,
                    message: `Integração ${id} removida com sucesso`,
                });
            } catch (error) {
                console.error("Erro ao remover integração:", error);
                return reply.status(400).send({
                    success: false,
                    error: error instanceof Error ? error.message : "Erro interno do servidor",
                });
            }
        }
    );

    // Overview geral do sistema
    fastify.get(
        "/overview",
        {
            schema: {
                tags: ["integrations-unified"],
                summary: "Overview geral do sistema",
                description: "Visão geral completa de todas as integrações e métricas",
                response: {
                    200: {
                        type: "object",
                        properties: {
                            success: { type: "boolean" },
                            data: {
                                type: "object",
                                properties: {
                                    summary: {
                                        type: "object",
                                        properties: {
                                            totalIntegrations: { type: "number" },
                                            activeIntegrations: { type: "number" },
                                            errorIntegrations: { type: "number" },
                                            configuringIntegrations: { type: "number" },
                                        },
                                    },
                                    metrics: {
                                        type: "object",
                                        properties: {
                                            monthlyOperations: { type: "number" },
                                            successRate: { type: "number" },
                                            totalRevenue: { type: "number" },
                                            avgResponseTime: { type: "number" },
                                        },
                                    },
                                    byType: {
                                        type: "object",
                                        properties: {
                                            whatsapp: { type: "number" },
                                            pix: { type: "number" },
                                            crm: { type: "number" },
                                            erp: { type: "number" },
                                        },
                                    },
                                    alerts: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                type: { type: "string", enum: ["error", "warning", "info"] },
                                                message: { type: "string" },
                                                integrationId: { type: "string" },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        async (_request: FastifyRequest, reply: FastifyReply) => {
            try {
                const [health, stats] = await Promise.all([
                    unifiedService.getIntegrationsHealth(),
                    unifiedService.getIntegrationsStats(),
                ]);

                const summary = {
                    totalIntegrations: health.length,
                    activeIntegrations: health.filter((h) => h.status === "connected").length,
                    errorIntegrations: health.filter((h) => h.status === "error").length,
                    configuringIntegrations: health.filter((h) => h.status === "configuring").length,
                };

                const byType = {
                    whatsapp: health.filter((h) => h.type === "whatsapp").length,
                    pix: health.filter((h) => h.type === "pix").length,
                    crm: health.filter((h) => h.type === "crm").length,
                    erp: health.filter((h) => h.type === "erp").length,
                };

                const alerts = health
                    .filter((h) => h.status === "error" || h.status === "configuring")
                    .map((h) => ({
                        type: h.status === "error" ? ("error" as const) : ("warning" as const),
                        message:
                            h.errorMessage ||
                            `${h.name} está ${h.status === "error" ? "com erro" : "sendo configurado"}`,
                        integrationId: h.id,
                    }));

                return reply.send({
                    success: true,
                    data: {
                        summary,
                        metrics: {
                            monthlyOperations: stats.monthlyOperations,
                            successRate: stats.successRate,
                            totalRevenue: stats.totalRevenue,
                            avgResponseTime: 150, // Mock - implementar métrica real
                        },
                        byType,
                        alerts,
                    },
                });
            } catch (error) {
                console.error("Erro ao obter overview:", error);
                return reply.status(500).send({
                    success: false,
                    error: error instanceof Error ? error.message : "Erro interno do servidor",
                });
            }
        }
    );
}

export default integrationsUnifiedRoutes;
