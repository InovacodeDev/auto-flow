import { FastifyPluginAsync } from "fastify";
import { Type } from "@sinclair/typebox";
import { WhatsAppIntegration } from "../integrations/whatsapp/WhatsAppIntegration";
import { PIXIntegration } from "../integrations/pix/PIXIntegration";
import { OmieERPIntegration } from "../integrations/erp/OmieERPIntegration";
import { BlingERPIntegration } from "../integrations/erp/BlingERPIntegration";
import { env } from "@autoflow/config";

export const integrationRoutes: FastifyPluginAsync = async (fastify) => {
    // GET /api/integrations - Lista integrações disponíveis
    fastify.get(
        "/",
        {
            schema: {
                tags: ["integrations"],
                response: {
                    200: Type.Object({
                        success: Type.Boolean(),
                        data: Type.Object({
                            available: Type.Array(
                                Type.Object({
                                    id: Type.String(),
                                    name: Type.String(),
                                    category: Type.String(),
                                    description: Type.String(),
                                    status: Type.String(),
                                    configRequired: Type.Array(Type.String()),
                                })
                            ),
                        }),
                    }),
                },
            },
        },
        async () => {
            return {
                success: true,
                data: {
                    available: [
                        {
                            id: "whatsapp_business",
                            name: "WhatsApp Business",
                            category: "Comunicação",
                            description: "Envio e recebimento de mensagens WhatsApp",
                            status: env.WHATSAPP_ACCESS_TOKEN ? "configured" : "requires_setup",
                            configRequired: ["access_token", "phone_number_id", "webhook_verify_token"],
                        },
                        {
                            id: "pix_mercado_pago",
                            name: "PIX - Mercado Pago",
                            category: "Pagamento",
                            description: "Processamento de pagamentos PIX",
                            status: "requires_setup",
                            configRequired: ["access_token", "user_id"],
                        },
                        {
                            id: "omie_erp",
                            name: "Omie ERP",
                            category: "ERP",
                            description: "Gestão empresarial completa",
                            status: "requires_setup",
                            configRequired: ["app_key", "app_secret"],
                        },
                        {
                            id: "bling_erp",
                            name: "Bling ERP",
                            category: "ERP",
                            description: "Gestão de vendas e estoque",
                            status: "requires_setup",
                            configRequired: ["api_key"],
                        },
                    ],
                },
            };
        }
    );

    // POST /api/integrations/whatsapp/webhook - Webhook do WhatsApp
    fastify.post(
        "/whatsapp/webhook",
        {
            schema: {
                tags: ["integrations"],
                body: Type.Any(),
                response: {
                    200: Type.Object({
                        success: Type.Boolean(),
                        processed: Type.Number(),
                    }),
                },
            },
        },
        async (request, reply) => {
            try {
                const payload = request.body;

                // Verificar se é uma verificação do webhook
                if (request.query && typeof request.query === "object" && "hub.mode" in request.query) {
                    const mode = (request.query as any)["hub.mode"];
                    const token = (request.query as any)["hub.verify_token"];
                    const challenge = (request.query as any)["hub.challenge"];

                    if (mode === "subscribe" && token === env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
                        fastify.log.info("WhatsApp webhook verified successfully");
                        return reply.code(200).send(challenge);
                    } else {
                        return reply.code(403).send("Forbidden");
                    }
                }

                // Processar mensagens recebidas
                if (!env.WHATSAPP_ACCESS_TOKEN) {
                    return reply.code(500).send({
                        success: false,
                        error: "WhatsApp não configurado",
                    });
                }

                const whatsappIntegration = new WhatsAppIntegration(
                    {
                        apiKey: env.WHATSAPP_ACCESS_TOKEN,
                        phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID,
                        businessAccountId: "",
                        webhookVerifyToken: env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
                    },
                    "system"
                );

                const messages = await whatsappIntegration.processWebhook(payload);

                // TODO: Processar mensagens recebidas e disparar workflows
                fastify.log.info(`Processadas ${messages.length} mensagens do WhatsApp`);

                return {
                    success: true,
                    processed: messages.length,
                };
            } catch (error) {
                fastify.log.error(`Erro no webhook WhatsApp: ${error}`);
                return reply.status(500).send({
                    success: false,
                    error: "Erro interno do servidor",
                });
            }
        }
    );

    // GET /api/integrations/whatsapp/webhook - Verificação do webhook
    fastify.get(
        "/whatsapp/webhook",
        {
            schema: {
                tags: ["integrations"],
                querystring: Type.Object({
                    "hub.mode": Type.Optional(Type.String()),
                    "hub.verify_token": Type.Optional(Type.String()),
                    "hub.challenge": Type.Optional(Type.String()),
                }),
            },
        },
        async (request, reply) => {
            const { "hub.mode": mode, "hub.verify_token": token, "hub.challenge": challenge } = request.query as any;

            if (mode === "subscribe" && token === env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
                fastify.log.info("WhatsApp webhook verified successfully");
                return reply.code(200).send(challenge);
            } else {
                return reply.code(403).send("Forbidden");
            }
        }
    );

    // GET /api/integrations/whatsapp/status - Status da integração WhatsApp
    fastify.get(
        "/whatsapp/status",
        {
            schema: {
                tags: ["integrations"],
                response: {
                    200: Type.Object({
                        success: Type.Boolean(),
                        data: Type.Object({
                            configured: Type.Boolean(),
                            connected: Type.Boolean(),
                            phoneNumber: Type.Optional(Type.String()),
                            lastCheck: Type.String(),
                        }),
                    }),
                },
            },
        },
        async () => {
            try {
                if (!env.WHATSAPP_ACCESS_TOKEN) {
                    return {
                        success: true,
                        data: {
                            configured: false,
                            connected: false,
                            lastCheck: new Date().toISOString(),
                        },
                    };
                }

                const whatsappIntegration = new WhatsAppIntegration(
                    {
                        apiKey: env.WHATSAPP_ACCESS_TOKEN,
                        phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID,
                        businessAccountId: "",
                        webhookVerifyToken: env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
                    },
                    "system"
                );

                const connected = await whatsappIntegration.testConnection();

                return {
                    success: true,
                    data: {
                        configured: true,
                        connected,
                        phoneNumber: env.WHATSAPP_PHONE_NUMBER_ID,
                        lastCheck: new Date().toISOString(),
                    },
                };
            } catch (error) {
                return {
                    success: true,
                    data: {
                        configured: true,
                        connected: false,
                        lastCheck: new Date().toISOString(),
                    },
                };
            }
        }
    );

    // POST /api/integrations/pix/webhook - Webhook do PIX
    fastify.post(
        "/pix/webhook",
        {
            schema: {
                tags: ["integrations"],
                body: Type.Any(),
            },
        },
        async (_request, reply) => {
            try {
                fastify.log.info("PIX webhook recebido");

                // TODO: Processar confirmação de pagamento PIX
                return { success: true, processed: 1 };
            } catch (error) {
                fastify.log.error(`Erro no webhook PIX: ${error}`);
                return reply.status(500).send({
                    success: false,
                    error: "Erro interno do servidor",
                });
            }
        }
    );

    // POST /api/integrations/test/:type - Testar integração
    fastify.post(
        "/test/:type",
        {
            schema: {
                tags: ["integrations"],
                params: Type.Object({
                    type: Type.String(),
                }),
                body: Type.Object({
                    config: Type.Record(Type.String(), Type.Any()),
                }),
                response: {
                    200: Type.Object({
                        success: Type.Boolean(),
                        connected: Type.Boolean(),
                        message: Type.String(),
                        details: Type.Optional(Type.Any()),
                    }),
                },
            },
        },
        async (request, reply) => {
            try {
                const { type } = request.params as { type: string };
                const { config } = request.body as { config: Record<string, any> };

                let integration: any;
                let connected = false;

                switch (type) {
                    case "whatsapp":
                        integration = new WhatsAppIntegration(config as any, "test");
                        connected = await integration.testConnection();
                        break;

                    case "pix":
                        integration = new PIXIntegration(config as any, "test");
                        connected = await integration.testConnection();
                        break;

                    case "omie":
                        integration = new OmieERPIntegration(config as any, "test");
                        connected = await integration.testConnection();
                        break;

                    case "bling":
                        integration = new BlingERPIntegration(config as any, "test");
                        connected = await integration.testConnection();
                        break;

                    default:
                        return reply.status(400).send({
                            success: false,
                            connected: false,
                            message: `Tipo de integração não suportado: ${type}`,
                        });
                }

                return {
                    success: true,
                    connected,
                    message: connected ? "Conexão estabelecida com sucesso" : "Falha na conexão",
                };
            } catch (error) {
                return {
                    success: false,
                    connected: false,
                    message: error instanceof Error ? error.message : "Erro desconhecido",
                };
            }
        }
    );
};
