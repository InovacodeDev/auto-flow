import { FastifyPluginAsync } from "fastify";
import AIService, { OrganizationContext } from "../ai/AIService";

// Instância global do AIService
let aiService: AIService;

export const aiRoutes: FastifyPluginAsync = async (fastify) => {
    // Inicializar AIService se não estiver inicializado
    if (!aiService) {
        try {
            aiService = new AIService();
            await aiService.validateConfiguration();
            fastify.log.info("AIService inicializado com sucesso");
        } catch (error) {
            fastify.log.error(`Erro ao inicializar AIService: ${error}`);
            // Continue sem IA se não conseguir configurar
        }
    }

    // POST /api/ai/chat - Chat conversacional
    fastify.post(
        "/chat",
        {
            schema: {
                tags: ["ai"],
                body: {
                    type: "object",
                    required: ["message"],
                    properties: {
                        message: { type: "string", minLength: 1 },
                        organizationContext: {
                            type: "object",
                            properties: {
                                businessType: { type: "string" },
                                existingWorkflows: { type: "array", items: { type: "string" } },
                                availableIntegrations: { type: "array", items: { type: "string" } },
                                commonPatterns: { type: "array", items: { type: "string" } },
                            },
                        },
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
                                    response: { type: "string" },
                                    workflowGenerated: { type: "object" },
                                    suggestions: { type: "array", items: { type: "string" } },
                                },
                            },
                        },
                    },
                },
            },
        },
        async (request, reply) => {
            if (!aiService) {
                return reply.status(503).send({
                    success: false,
                    error: "Serviço de IA não está disponível",
                });
            }

            try {
                const { message, organizationContext } = request.body as any;

                // TODO: Extrair userId e organizationId do token JWT
                const userId = "temp-user-id";
                const organizationId = "temp-org-id";

                // Construir contexto organizacional
                const context: OrganizationContext = {
                    id: organizationId,
                    existingWorkflows: organizationContext?.existingWorkflows || [],
                    availableIntegrations: organizationContext?.availableIntegrations || [
                        "WhatsApp Business",
                        "PIX",
                        "Email",
                        "Webhook",
                    ],
                    businessType: organizationContext?.businessType,
                    commonPatterns: organizationContext?.commonPatterns || [],
                };

                const result = await aiService.processUserMessage(userId, organizationId, message, context);

                return {
                    success: true,
                    data: result,
                };
            } catch (error) {
                fastify.log.error(`Erro no chat AI: ${error}`);
                return reply.status(500).send({
                    success: false,
                    error: "Erro interno do servidor",
                });
            }
        }
    );

    // GET /api/ai/chat/history - Histórico de conversa
    fastify.get(
        "/chat/history",
        {
            schema: {
                tags: ["ai"],
                response: {
                    200: {
                        type: "object",
                        properties: {
                            success: { type: "boolean" },
                            data: {
                                type: "object",
                                properties: {
                                    messages: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            properties: {
                                                id: { type: "string" },
                                                role: { type: "string" },
                                                content: { type: "string" },
                                                timestamp: { type: "string" },
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
        async (_request, reply) => {
            if (!aiService) {
                return reply.status(503).send({
                    success: false,
                    error: "Serviço de IA não está disponível",
                });
            }

            try {
                // TODO: Extrair userId e organizationId do token JWT
                const userId = "temp-user-id";
                const organizationId = "temp-org-id";

                const messages = aiService.getConversationHistory(userId, organizationId);

                return {
                    success: true,
                    data: { messages },
                };
            } catch (error) {
                fastify.log.error(`Erro ao buscar histórico: ${error}`);
                return reply.status(500).send({
                    success: false,
                    error: "Erro interno do servidor",
                });
            }
        }
    );

    // DELETE /api/ai/chat/history - Limpar histórico
    fastify.delete(
        "/chat/history",
        {
            schema: {
                tags: ["ai"],
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
        async (_request, reply) => {
            if (!aiService) {
                return reply.status(503).send({
                    success: false,
                    error: "Serviço de IA não está disponível",
                });
            }

            try {
                // TODO: Extrair userId e organizationId do token JWT
                const userId = "temp-user-id";
                const organizationId = "temp-org-id";

                aiService.clearConversationHistory(userId, organizationId);

                return {
                    success: true,
                    message: "Histórico de conversa limpo com sucesso",
                };
            } catch (error) {
                fastify.log.error(`Erro ao limpar histórico: ${error}`);
                return reply.status(500).send({
                    success: false,
                    error: "Erro interno do servidor",
                });
            }
        }
    );

    // POST /api/ai/create-workflow (backward compatibility)
    fastify.post(
        "/create-workflow",
        {
            schema: {
                tags: ["ai"],
                body: {
                    type: "object",
                    required: ["message"],
                    properties: {
                        message: { type: "string", minLength: 10 },
                        context: {
                            type: "object",
                            properties: {
                                industry: { type: "string" },
                                businessSize: { type: "string" },
                                currentTools: { type: "array", items: { type: "string" } },
                            },
                        },
                    },
                },
            },
        },
        async (request) => {
            // Redirect para novo endpoint de chat
            const { message, context } = request.body as any;

            if (!aiService) {
                return { message: "Serviço de IA não está disponível" };
            }

            try {
                const userId = "temp-user-id";
                const organizationId = "temp-org-id";

                const organizationContext: OrganizationContext = {
                    id: organizationId,
                    existingWorkflows: [],
                    availableIntegrations: ["WhatsApp Business", "PIX", "Email"],
                    businessType: context?.industry,
                    commonPatterns: [],
                };

                const result = await aiService.processUserMessage(userId, organizationId, message, organizationContext);

                return {
                    message: result.response,
                    workflowGenerated: result.workflowGenerated,
                    suggestions: result.suggestions,
                };
            } catch (error) {
                return { message: "Erro ao processar solicitação de IA" };
            }
        }
    );

    // POST /api/ai/optimize-workflow
    fastify.post(
        "/optimize-workflow",
        {
            schema: {
                tags: ["ai"],
            },
        },
        async () => {
            return { message: "Otimizar workflow via IA - em desenvolvimento" };
        }
    );
};
