import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import {
    WhatsAppBusinessService,
    WhatsAppConfig,
    WhatsAppWebhookEvent,
} from "../integrations/whatsapp/WhatsAppBusinessService";

// Request/Response types
interface SendMessageRequest {
    to: string;
    message: string;
    type?: "text" | "template";
    templateName?: string;
    templateData?: any;
}

interface SendInteractiveRequest {
    to: string;
    bodyText: string;
    type: "buttons" | "list";
    buttons?: Array<{ id: string; title: string }>;
    listData?: {
        buttonText: string;
        sections: Array<{
            title: string;
            rows: Array<{
                id: string;
                title: string;
                description?: string;
            }>;
        }>;
    };
    headerText?: string;
    footerText?: string;
}

interface WhatsAppWebhookRequest {
    Body: WhatsAppWebhookEvent;
    Querystring: {
        "hub.mode"?: string;
        "hub.token"?: string;
        "hub.challenge"?: string;
    };
}

// Initialize WhatsApp service with environment variables
const getWhatsAppService = (): WhatsAppBusinessService | null => {
    const config: WhatsAppConfig = {
        accessToken: process.env["WHATSAPP_ACCESS_TOKEN"] || "",
        phoneNumberId: process.env["WHATSAPP_PHONE_NUMBER_ID"] || "",
        businessAccountId: process.env["WHATSAPP_BUSINESS_ACCOUNT_ID"] || "",
        webhookVerifyToken: process.env["WHATSAPP_WEBHOOK_VERIFY_TOKEN"] || "",
        apiVersion: process.env["WHATSAPP_API_VERSION"] || "v18.0",
    };

    // Verificar se todas as configurações necessárias estão presentes
    if (!config.accessToken || !config.phoneNumberId || !config.businessAccountId) {
        console.warn("WhatsApp configuration incomplete. WhatsApp integration will be disabled.");
        return null;
    }

    const service = new WhatsAppBusinessService(config);
    const validation = service.validateConfig();

    if (!validation.valid) {
        console.error("WhatsApp configuration errors:", validation.errors);
        return null;
    }

    return service;
};

const whatsappService = getWhatsAppService();

export default async function whatsappRoutes(fastify: FastifyInstance) {
    // Verificar se o serviço está disponível
    if (!whatsappService) {
        fastify.log.warn("WhatsApp Business API routes disabled due to missing configuration");

        // Adicionar rota de status para debug
        fastify.get("/status", async () => {
            return {
                status: "disabled",
                reason: "Missing WhatsApp configuration",
                requiredEnvVars: [
                    "WHATSAPP_ACCESS_TOKEN",
                    "WHATSAPP_PHONE_NUMBER_ID",
                    "WHATSAPP_BUSINESS_ACCOUNT_ID",
                    "WHATSAPP_WEBHOOK_VERIFY_TOKEN",
                ],
            };
        });

        return;
    }

    // Webhook verification (GET)
    fastify.get(
        "/webhook",
        {
            schema: {
                querystring: {
                    type: "object",
                    properties: {
                        "hub.mode": { type: "string" },
                        "hub.token": { type: "string" },
                        "hub.challenge": { type: "string" },
                    },
                },
            },
        },
        async (
            request: FastifyRequest<{ Querystring: WhatsAppWebhookRequest["Querystring"] }>,
            reply: FastifyReply
        ) => {
            try {
                const { "hub.mode": mode, "hub.token": token, "hub.challenge": challenge } = request.query;

                if (mode && token && challenge) {
                    const verificationResult = whatsappService!.verifyWebhook(mode, token, challenge);

                    if (verificationResult) {
                        reply.code(200).send(verificationResult);
                        return;
                    }
                }

                reply.code(403).send("Forbidden");
            } catch (error) {
                console.error("Error verifying webhook:", error);
                reply.code(500).send({ error: "Webhook verification failed" });
            }
        }
    );

    // Webhook receiver (POST)
    fastify.post(
        "/webhook",
        {
            schema: {
                body: {
                    type: "object",
                    properties: {
                        object: { type: "string" },
                        entry: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    id: { type: "string" },
                                    changes: {
                                        type: "array",
                                        items: { type: "object" },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        async (request: FastifyRequest<{ Body: WhatsAppWebhookEvent }>, reply: FastifyReply) => {
            try {
                const webhookData = request.body;

                // Processar mensagens recebidas
                const processedMessages = whatsappService!.processIncomingMessage(webhookData);

                // Log das mensagens recebidas para debug
                processedMessages.forEach((msg) => {
                    fastify.log.info(
                        `WhatsApp message received from ${msg.from}: ${msg.text || "Interactive message"}`
                    );
                });

                // TODO: Integrar com workflow engine para processar automações
                // TODO: Salvar mensagens no banco de dados
                // TODO: Trigger workflows baseados em mensagens recebidas

                // Marcar mensagens como lidas
                for (const message of processedMessages) {
                    try {
                        await whatsappService!.markAsRead(message.messageId);
                    } catch (error) {
                        console.error(`Error marking message ${message.messageId} as read:`, error);
                    }
                }

                reply.code(200).send({ status: "ok", processed: processedMessages.length });
            } catch (error) {
                console.error("Error processing webhook:", error);
                reply.code(500).send({ error: "Webhook processing failed" });
            }
        }
    );

    // Enviar mensagem de texto
    fastify.post<{
        Body: SendMessageRequest;
    }>(
        "/send-message",
        {
            schema: {
                body: {
                    type: "object",
                    required: ["to", "message"],
                    properties: {
                        to: { type: "string" },
                        message: { type: "string" },
                        type: { type: "string", enum: ["text", "template"] },
                        templateName: { type: "string" },
                        templateData: { type: "object" },
                    },
                },
            },
        },
        async (request: FastifyRequest<{ Body: SendMessageRequest }>, reply: FastifyReply) => {
            try {
                const { to, message, type = "text", templateName, templateData } = request.body;

                let result;

                if (type === "template" && templateName) {
                    result = await whatsappService!.sendTemplate(to, templateName, "pt_BR", templateData?.components);
                } else {
                    result = await whatsappService!.sendTextMessage(to, message);
                }

                reply.send({
                    success: true,
                    messageId: result.messages[0].id,
                    to: result.contacts[0].wa_id,
                });
            } catch (error) {
                console.error("Error sending message:", error);
                reply.code(500).send({
                    error: "Failed to send message",
                    details: error instanceof Error ? error.message : "Unknown error",
                });
            }
        }
    );

    // Enviar mensagem interativa
    fastify.post<{
        Body: SendInteractiveRequest;
    }>(
        "/send-interactive",
        {
            schema: {
                body: {
                    type: "object",
                    required: ["to", "bodyText", "type"],
                    properties: {
                        to: { type: "string" },
                        bodyText: { type: "string" },
                        type: { type: "string", enum: ["buttons", "list"] },
                        buttons: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    id: { type: "string" },
                                    title: { type: "string" },
                                },
                            },
                        },
                        listData: { type: "object" },
                        headerText: { type: "string" },
                        footerText: { type: "string" },
                    },
                },
            },
        },
        async (request: FastifyRequest<{ Body: SendInteractiveRequest }>, reply: FastifyReply) => {
            try {
                const { to, bodyText, type, buttons, listData, headerText, footerText } = request.body;

                let result;

                if (type === "buttons" && buttons) {
                    result = await whatsappService!.sendInteractiveButtons(
                        to,
                        bodyText,
                        buttons,
                        headerText,
                        footerText
                    );
                } else if (type === "list" && listData) {
                    result = await whatsappService!.sendInteractiveList(
                        to,
                        bodyText,
                        listData.buttonText,
                        listData.sections,
                        headerText,
                        footerText
                    );
                } else {
                    throw new Error("Invalid interactive message configuration");
                }

                reply.send({
                    success: true,
                    messageId: result.messages[0].id,
                    to: result.contacts[0].wa_id,
                });
            } catch (error) {
                console.error("Error sending interactive message:", error);
                reply.code(500).send({
                    error: "Failed to send interactive message",
                    details: error instanceof Error ? error.message : "Unknown error",
                });
            }
        }
    );

    // Enviar documento
    fastify.post<{
        Body: {
            to: string;
            documentLink: string;
            filename: string;
            caption?: string;
        };
    }>(
        "/send-document",
        {
            schema: {
                body: {
                    type: "object",
                    required: ["to", "documentLink", "filename"],
                    properties: {
                        to: { type: "string" },
                        documentLink: { type: "string" },
                        filename: { type: "string" },
                        caption: { type: "string" },
                    },
                },
            },
        },
        async (request, reply) => {
            try {
                const { to, documentLink, filename, caption } = request.body;

                const result = await whatsappService!.sendDocument(to, documentLink, filename, caption);

                reply.send({
                    success: true,
                    messageId: result.messages[0].id,
                    to: result.contacts[0].wa_id,
                });
            } catch (error) {
                console.error("Error sending document:", error);
                reply.code(500).send({
                    error: "Failed to send document",
                    details: error instanceof Error ? error.message : "Unknown error",
                });
            }
        }
    );

    // Enviar imagem
    fastify.post<{
        Body: {
            to: string;
            imageLink: string;
            caption?: string;
        };
    }>(
        "/send-image",
        {
            schema: {
                body: {
                    type: "object",
                    required: ["to", "imageLink"],
                    properties: {
                        to: { type: "string" },
                        imageLink: { type: "string" },
                        caption: { type: "string" },
                    },
                },
            },
        },
        async (request, reply) => {
            try {
                const { to, imageLink, caption } = request.body;

                const result = await whatsappService!.sendImage(to, imageLink, caption);

                reply.send({
                    success: true,
                    messageId: result.messages[0].id,
                    to: result.contacts[0].wa_id,
                });
            } catch (error) {
                console.error("Error sending image:", error);
                reply.code(500).send({
                    error: "Failed to send image",
                    details: error instanceof Error ? error.message : "Unknown error",
                });
            }
        }
    );

    // Status da integração
    fastify.get("/status", async () => {
        const validation = whatsappService!.validateConfig();
        return {
            status: "enabled",
            valid: validation.valid,
            errors: validation.errors,
            apiVersion: process.env["WHATSAPP_API_VERSION"] || "v18.0",
        };
    });

    // Health check
    fastify.get("/health", async () => {
        return {
            service: "WhatsApp Business API",
            status: "healthy",
            timestamp: new Date().toISOString(),
        };
    });
}
