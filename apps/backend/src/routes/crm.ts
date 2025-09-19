import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
    CRMIntegrationService,
    CRMIntegrationConfig,
    CreateDealRequest,
    CreateActivityRequest,
    CRMWebhookData,
} from "../integrations/crm/CRMIntegrationService";

const crmServices = new Map<string, CRMIntegrationService>();

interface ConfigureCRMBody {
    platform: "rdstation" | "pipedrive" | "hubspot";
    apiKey: string;
    apiUrl: string;
    webhookSecret?: string;
    customMappings?: Record<string, string>;
}

interface CreateContactBody {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    position?: string;
    tags?: string[];
    customFields?: Record<string, any>;
}

interface CreateDealBody {
    title: string;
    value: number;
    contactId: string;
    stage?: string;
    expectedCloseDate?: string;
    customFields?: Record<string, any>;
}

interface CreateActivityBody {
    type: "call" | "email" | "meeting" | "task" | "note" | "whatsapp";
    subject: string;
    description?: string;
    contactId?: string;
    dealId?: string;
    dueDate?: string;
}

interface UpdateDealStatusBody {
    status: "open" | "won" | "lost";
    stage?: string;
}

async function crmRoutes(fastify: FastifyInstance) {
    // Configurar integração CRM
    fastify.post<{ Body: ConfigureCRMBody; Params: { platform: string } }>(
        "/configure/:platform",
        {
            schema: {
                tags: ["crm"],
                summary: "Configurar integração CRM",
                description: "Configura a integração com RD Station, Pipedrive ou HubSpot",
                params: {
                    type: "object",
                    properties: {
                        platform: { type: "string", enum: ["rdstation", "pipedrive", "hubspot"] },
                    },
                    required: ["platform"],
                },
                body: {
                    type: "object",
                    required: ["apiKey", "apiUrl"],
                    properties: {
                        platform: { type: "string", enum: ["rdstation", "pipedrive", "hubspot"] },
                        apiKey: { type: "string", description: "Chave da API do CRM" },
                        apiUrl: { type: "string", description: "URL base da API" },
                        webhookSecret: { type: "string", description: "Secret para validação de webhooks" },
                        customMappings: { type: "object", description: "Mapeamentos customizados de campos" },
                    },
                },
                response: {
                    200: {
                        type: "object",
                        properties: {
                            success: { type: "boolean" },
                            message: { type: "string" },
                            platform: { type: "string" },
                        },
                    },
                },
            },
        },
        async (
            request: FastifyRequest<{ Body: ConfigureCRMBody; Params: { platform: string } }>,
            reply: FastifyReply
        ) => {
            try {
                const { platform } = request.params;
                const { apiKey, apiUrl, webhookSecret, customMappings } = request.body;

                const config: CRMIntegrationConfig = {
                    platform: platform as "rdstation" | "pipedrive" | "hubspot",
                    apiKey,
                    apiUrl,
                    ...(webhookSecret && { webhookSecret }),
                    ...(customMappings && { customMappings }),
                };

                const crmService = new CRMIntegrationService(config);
                crmServices.set(platform, crmService);

                return reply.send({
                    success: true,
                    message: `Integração ${platform} configurada com sucesso`,
                    platform,
                });
            } catch (error) {
                console.error("Erro ao configurar CRM:", error);
                return reply.status(400).send({
                    success: false,
                    error: error instanceof Error ? error.message : "Erro interno do servidor",
                });
            }
        }
    );

    // Criar contato
    fastify.post<{ Body: CreateContactBody; Params: { platform: string } }>(
        "/:platform/contacts",
        {
            schema: {
                tags: ["crm"],
                summary: "Criar contato no CRM",
                description: "Cria um novo contato no CRM configurado",
                params: {
                    type: "object",
                    properties: {
                        platform: { type: "string", enum: ["rdstation", "pipedrive", "hubspot"] },
                    },
                    required: ["platform"],
                },
                body: {
                    type: "object",
                    required: ["name", "email"],
                    properties: {
                        name: { type: "string", description: "Nome completo" },
                        email: { type: "string", format: "email", description: "Email do contato" },
                        phone: { type: "string", description: "Telefone" },
                        company: { type: "string", description: "Empresa" },
                        position: { type: "string", description: "Cargo" },
                        tags: { type: "array", items: { type: "string" }, description: "Tags" },
                        customFields: { type: "object", description: "Campos customizados" },
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
                                    id: { type: "string" },
                                    name: { type: "string" },
                                    email: { type: "string" },
                                    phone: { type: "string" },
                                    company: { type: "string" },
                                },
                            },
                        },
                    },
                },
            },
        },
        async (
            request: FastifyRequest<{ Body: CreateContactBody; Params: { platform: string } }>,
            reply: FastifyReply
        ) => {
            try {
                const { platform } = request.params;
                const crmService = crmServices.get(platform);

                if (!crmService) {
                    return reply.status(400).send({
                        success: false,
                        error: `CRM ${platform} não configurado`,
                    });
                }

                const contact = await crmService.createContact(request.body);

                return reply.send({
                    success: true,
                    data: contact,
                });
            } catch (error) {
                console.error("Erro ao criar contato:", error);
                return reply.status(400).send({
                    success: false,
                    error: error instanceof Error ? error.message : "Erro interno do servidor",
                });
            }
        }
    );

    // Buscar contato por email
    fastify.get<{ Params: { platform: string; email: string } }>(
        "/:platform/contacts/email/:email",
        {
            schema: {
                tags: ["crm"],
                summary: "Buscar contato por email",
                description: "Busca um contato pelo endereço de email",
                params: {
                    type: "object",
                    properties: {
                        platform: { type: "string", enum: ["rdstation", "pipedrive", "hubspot"] },
                        email: { type: "string", format: "email" },
                    },
                    required: ["platform", "email"],
                },
                response: {
                    200: {
                        type: "object",
                        properties: {
                            success: { type: "boolean" },
                            data: {
                                type: "object",
                                nullable: true,
                                properties: {
                                    id: { type: "string" },
                                    name: { type: "string" },
                                    email: { type: "string" },
                                    phone: { type: "string" },
                                    company: { type: "string" },
                                },
                            },
                        },
                    },
                },
            },
        },
        async (request: FastifyRequest<{ Params: { platform: string; email: string } }>, reply: FastifyReply) => {
            try {
                const { platform, email } = request.params;
                const crmService = crmServices.get(platform);

                if (!crmService) {
                    return reply.status(400).send({
                        success: false,
                        error: `CRM ${platform} não configurado`,
                    });
                }

                const contact = await crmService.findContactByEmail(email);

                return reply.send({
                    success: true,
                    data: contact,
                });
            } catch (error) {
                console.error("Erro ao buscar contato:", error);
                return reply.status(400).send({
                    success: false,
                    error: error instanceof Error ? error.message : "Erro interno do servidor",
                });
            }
        }
    );

    // Criar oportunidade
    fastify.post<{ Body: CreateDealBody; Params: { platform: string } }>(
        "/:platform/deals",
        {
            schema: {
                tags: ["crm"],
                summary: "Criar oportunidade",
                description: "Cria uma nova oportunidade no CRM",
                params: {
                    type: "object",
                    properties: {
                        platform: { type: "string", enum: ["rdstation", "pipedrive", "hubspot"] },
                    },
                    required: ["platform"],
                },
                body: {
                    type: "object",
                    required: ["title", "value", "contactId"],
                    properties: {
                        title: { type: "string", description: "Título da oportunidade" },
                        value: { type: "number", minimum: 0, description: "Valor da oportunidade" },
                        contactId: { type: "string", description: "ID do contato" },
                        stage: { type: "string", description: "Estágio atual" },
                        expectedCloseDate: {
                            type: "string",
                            format: "date",
                            description: "Data prevista de fechamento",
                        },
                        customFields: { type: "object", description: "Campos customizados" },
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
                                    id: { type: "string" },
                                    title: { type: "string" },
                                    value: { type: "number" },
                                    stage: { type: "string" },
                                    status: { type: "string" },
                                },
                            },
                        },
                    },
                },
            },
        },
        async (
            request: FastifyRequest<{ Body: CreateDealBody; Params: { platform: string } }>,
            reply: FastifyReply
        ) => {
            try {
                const { platform } = request.params;
                const { title, value, contactId, stage, expectedCloseDate, customFields } = request.body;
                const crmService = crmServices.get(platform);

                if (!crmService) {
                    return reply.status(400).send({
                        success: false,
                        error: `CRM ${platform} não configurado`,
                    });
                }

                const dealRequest: CreateDealRequest = {
                    title,
                    value,
                    contactId,
                    ...(stage && { stage }),
                    ...(expectedCloseDate && { expectedCloseDate: new Date(expectedCloseDate) }),
                    ...(customFields && { customFields }),
                };

                const deal = await crmService.createDeal(dealRequest);

                return reply.send({
                    success: true,
                    data: deal,
                });
            } catch (error) {
                console.error("Erro ao criar oportunidade:", error);
                return reply.status(400).send({
                    success: false,
                    error: error instanceof Error ? error.message : "Erro interno do servidor",
                });
            }
        }
    );

    // Atualizar status da oportunidade
    fastify.patch<{ Body: UpdateDealStatusBody; Params: { platform: string; dealId: string } }>(
        "/:platform/deals/:dealId/status",
        {
            schema: {
                tags: ["crm"],
                summary: "Atualizar status da oportunidade",
                description: "Atualiza o status e estágio de uma oportunidade",
                params: {
                    type: "object",
                    properties: {
                        platform: { type: "string", enum: ["rdstation", "pipedrive", "hubspot"] },
                        dealId: { type: "string" },
                    },
                    required: ["platform", "dealId"],
                },
                body: {
                    type: "object",
                    required: ["status"],
                    properties: {
                        status: { type: "string", enum: ["open", "won", "lost"] },
                        stage: { type: "string", description: "Novo estágio" },
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
                                    id: { type: "string" },
                                    status: { type: "string" },
                                    stage: { type: "string" },
                                },
                            },
                        },
                    },
                },
            },
        },
        async (
            request: FastifyRequest<{ Body: UpdateDealStatusBody; Params: { platform: string; dealId: string } }>,
            reply: FastifyReply
        ) => {
            try {
                const { platform, dealId } = request.params;
                const { status, stage } = request.body;
                const crmService = crmServices.get(platform);

                if (!crmService) {
                    return reply.status(400).send({
                        success: false,
                        error: `CRM ${platform} não configurado`,
                    });
                }

                const deal = await crmService.updateDealStatus(dealId, status, stage);

                return reply.send({
                    success: true,
                    data: deal,
                });
            } catch (error) {
                console.error("Erro ao atualizar oportunidade:", error);
                return reply.status(400).send({
                    success: false,
                    error: error instanceof Error ? error.message : "Erro interno do servidor",
                });
            }
        }
    );

    // Criar atividade
    fastify.post<{ Body: CreateActivityBody; Params: { platform: string } }>(
        "/:platform/activities",
        {
            schema: {
                tags: ["crm"],
                summary: "Criar atividade",
                description: "Cria uma nova atividade no CRM",
                params: {
                    type: "object",
                    properties: {
                        platform: { type: "string", enum: ["rdstation", "pipedrive", "hubspot"] },
                    },
                    required: ["platform"],
                },
                body: {
                    type: "object",
                    required: ["type", "subject"],
                    properties: {
                        type: { type: "string", enum: ["call", "email", "meeting", "task", "note", "whatsapp"] },
                        subject: { type: "string", description: "Assunto da atividade" },
                        description: { type: "string", description: "Descrição detalhada" },
                        contactId: { type: "string", description: "ID do contato" },
                        dealId: { type: "string", description: "ID da oportunidade" },
                        dueDate: { type: "string", format: "date-time", description: "Data de vencimento" },
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
                                    id: { type: "string" },
                                    type: { type: "string" },
                                    subject: { type: "string" },
                                    completed: { type: "boolean" },
                                },
                            },
                        },
                    },
                },
            },
        },
        async (
            request: FastifyRequest<{ Body: CreateActivityBody; Params: { platform: string } }>,
            reply: FastifyReply
        ) => {
            try {
                const { platform } = request.params;
                const { type, subject, description, contactId, dealId, dueDate } = request.body;
                const crmService = crmServices.get(platform);

                if (!crmService) {
                    return reply.status(400).send({
                        success: false,
                        error: `CRM ${platform} não configurado`,
                    });
                }

                const activityRequest: CreateActivityRequest = {
                    type,
                    subject,
                    ...(description && { description }),
                    ...(contactId && { contactId }),
                    ...(dealId && { dealId }),
                    ...(dueDate && { dueDate: new Date(dueDate) }),
                };

                const activity = await crmService.createActivity(activityRequest);

                return reply.send({
                    success: true,
                    data: activity,
                });
            } catch (error) {
                console.error("Erro ao criar atividade:", error);
                return reply.status(400).send({
                    success: false,
                    error: error instanceof Error ? error.message : "Erro interno do servidor",
                });
            }
        }
    );

    // Webhook genérico para CRMs
    fastify.post<{ Body: any; Params: { platform: string } }>(
        "/:platform/webhook",
        {
            schema: {
                tags: ["crm"],
                summary: "Webhook do CRM",
                description: "Processa webhooks dos CRMs configurados",
                params: {
                    type: "object",
                    properties: {
                        platform: { type: "string", enum: ["rdstation", "pipedrive", "hubspot"] },
                    },
                    required: ["platform"],
                },
                body: {
                    type: "object",
                    description: "Dados do webhook do CRM",
                },
                response: {
                    200: {
                        type: "object",
                        properties: {
                            success: { type: "boolean" },
                            message: { type: "string" },
                            processed: { type: "boolean" },
                        },
                    },
                },
            },
        },
        async (request: FastifyRequest<{ Body: any; Params: { platform: string } }>, reply: FastifyReply) => {
            try {
                const { platform } = request.params;
                const crmService = crmServices.get(platform);

                if (!crmService) {
                    return reply.status(400).send({
                        success: false,
                        error: `CRM ${platform} não configurado`,
                    });
                }

                const webhookBody = request.body as any;
                const webhookData: CRMWebhookData = {
                    event: webhookBody.event || "unknown",
                    data: webhookBody,
                    timestamp: new Date().toISOString(),
                    source: platform as "rdstation" | "pipedrive" | "hubspot",
                };

                const result = await crmService.processWebhook(webhookData);

                console.log(`Webhook ${platform} processado:`, result);

                // Aqui você pode implementar lógicas adicionais:
                // - Disparar workflows automáticos
                // - Sincronizar com PIX/WhatsApp
                // - Atualizar dados locais
                // - Enviar notificações

                return reply.send({
                    success: true,
                    message: "Webhook processado com sucesso",
                    processed: result.processed,
                    data: result,
                });
            } catch (error) {
                console.error("Erro ao processar webhook:", error);
                return reply.status(400).send({
                    success: false,
                    error: error instanceof Error ? error.message : "Erro interno do servidor",
                });
            }
        }
    );

    // Sincronizar dados
    fastify.post<{ Params: { platform: string } }>(
        "/:platform/sync",
        {
            schema: {
                tags: ["crm"],
                summary: "Sincronizar dados",
                description: "Sincroniza dados entre AutoFlow e o CRM",
                params: {
                    type: "object",
                    properties: {
                        platform: { type: "string", enum: ["rdstation", "pipedrive", "hubspot"] },
                    },
                    required: ["platform"],
                },
                response: {
                    200: {
                        type: "object",
                        properties: {
                            success: { type: "boolean" },
                            data: {
                                type: "object",
                                properties: {
                                    synchronized: { type: "number" },
                                    errors: { type: "number" },
                                    details: {
                                        type: "object",
                                        properties: {
                                            contacts: { type: "number" },
                                            deals: { type: "number" },
                                            activities: { type: "number" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        async (request: FastifyRequest<{ Params: { platform: string } }>, reply: FastifyReply) => {
            try {
                const { platform } = request.params;
                const crmService = crmServices.get(platform);

                if (!crmService) {
                    return reply.status(400).send({
                        success: false,
                        error: `CRM ${platform} não configurado`,
                    });
                }

                const syncResult = await crmService.syncWithCRM();

                return reply.send({
                    success: true,
                    data: syncResult,
                });
            } catch (error) {
                console.error("Erro na sincronização:", error);
                return reply.status(400).send({
                    success: false,
                    error: error instanceof Error ? error.message : "Erro interno do servidor",
                });
            }
        }
    );

    // Health check CRM
    fastify.get(
        "/health",
        {
            schema: {
                tags: ["crm"],
                summary: "Health check CRM",
                description: "Verifica o status das integrações CRM configuradas",
                response: {
                    200: {
                        type: "object",
                        properties: {
                            status: { type: "string" },
                            service: { type: "string" },
                            timestamp: { type: "string" },
                            platforms: {
                                type: "object",
                                properties: {
                                    configured: { type: "array", items: { type: "string" } },
                                    available: { type: "array", items: { type: "string" } },
                                },
                            },
                        },
                    },
                },
            },
        },
        async (_request: FastifyRequest, reply: FastifyReply) => {
            const configuredPlatforms = Array.from(crmServices.keys());
            const availablePlatforms = ["rdstation", "pipedrive", "hubspot"];

            return reply.send({
                status: "ok",
                service: "CRM Integration Service",
                timestamp: new Date().toISOString(),
                platforms: {
                    configured: configuredPlatforms,
                    available: availablePlatforms,
                },
                features: [
                    "Gestão unificada de contatos",
                    "Automação de oportunidades",
                    "Sincronização bidirecional",
                    "Webhooks em tempo real",
                    "Atividades automatizadas",
                    "Integração PIX + WhatsApp",
                ],
            });
        }
    );
}

export default crmRoutes;
