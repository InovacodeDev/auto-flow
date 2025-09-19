import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
    PIXService,
    PIXPaymentRequest,
    PIXWebhookData,
    PIXRecurringPaymentRequest,
} from "../integrations/pix/PIXService";

const pixService = new PIXService();

interface CreatePaymentBody {
    amount: number;
    description: string;
    payerEmail?: string;
    payerName?: string;
    payerDocument?: string;
    externalReference?: string;
}

interface WebhookBody {
    id: string;
    live_mode: boolean;
    type: string;
    date_created: string;
    application_id: string;
    user_id: string;
    version: number;
    api_version: string;
    action: string;
    data: {
        id: string;
    };
}

interface RefundBody {
    paymentId: string;
    amount?: number;
    reason?: string;
}

interface RecurringPaymentBody {
    amount: number;
    description: string;
    frequency: "monthly" | "weekly" | "daily";
    startDate: string;
    endDate?: string;
    payerEmail: string;
    maxAmount?: number;
}

async function pixRoutes(fastify: FastifyInstance) {
    // Criar pagamento PIX
    fastify.post<{ Body: CreatePaymentBody }>(
        "/payment",
        {
            schema: {
                tags: ["pix"],
                summary: "Criar cobrança PIX",
                description: "Cria uma nova cobrança PIX com QR Code",
                body: {
                    type: "object",
                    required: ["amount", "description"],
                    properties: {
                        amount: { type: "number", minimum: 0.01, description: "Valor em reais" },
                        description: {
                            type: "string",
                            minLength: 1,
                            maxLength: 256,
                            description: "Descrição do pagamento",
                        },
                        payerEmail: { type: "string", format: "email", description: "Email do pagador" },
                        payerName: { type: "string", description: "Nome do pagador" },
                        payerDocument: { type: "string", description: "CPF ou CNPJ do pagador" },
                        externalReference: { type: "string", description: "Referência externa" },
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
                                    qrCode: { type: "string" },
                                    qrCodeBase64: { type: "string" },
                                    pixKey: { type: "string" },
                                    amount: { type: "number" },
                                    description: { type: "string" },
                                    expirationDate: { type: "string" },
                                    paymentLink: { type: "string" },
                                },
                            },
                        },
                    },
                    400: {
                        type: "object",
                        properties: {
                            success: { type: "boolean" },
                            error: { type: "string" },
                        },
                    },
                },
            },
        },
        async (request: FastifyRequest<{ Body: CreatePaymentBody }>, reply: FastifyReply) => {
            try {
                const { amount, description, payerEmail, payerName, payerDocument, externalReference } = request.body;

                // Validação de documento brasileiro se fornecido
                if (payerDocument && !pixService.validateBrazilianDocument(payerDocument)) {
                    return reply.status(400).send({
                        success: false,
                        error: "CPF ou CNPJ inválido",
                    });
                }

                const pixRequest: PIXPaymentRequest = {
                    amount,
                    description,
                    notificationUrl: `${process.env["BACKEND_URL"] || "http://localhost:3001"}/api/pix/webhook`,
                    ...(payerEmail && { payerEmail }),
                    ...(payerName && { payerName }),
                    ...(payerDocument && { payerDocument }),
                    ...(externalReference && { externalReference }),
                };

                const payment = await pixService.createPIXPayment(pixRequest);
                const paymentLink = pixService.generatePaymentLink(payment.id);

                return reply.send({
                    success: true,
                    data: {
                        ...payment,
                        paymentLink,
                        formattedAmount: pixService.formatCurrency(payment.amount),
                    },
                });
            } catch (error) {
                console.error("Erro ao criar pagamento PIX:", error);
                return reply.status(400).send({
                    success: false,
                    error: error instanceof Error ? error.message : "Erro interno do servidor",
                });
            }
        }
    );

    // Consultar status do pagamento
    fastify.get<{ Params: { paymentId: string } }>(
        "/payment/:paymentId",
        {
            schema: {
                tags: ["pix"],
                summary: "Consultar status do pagamento",
                description: "Consulta o status atual de um pagamento PIX",
                params: {
                    type: "object",
                    properties: {
                        paymentId: { type: "string", description: "ID do pagamento" },
                    },
                    required: ["paymentId"],
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
                                    amount: { type: "number" },
                                    description: { type: "string" },
                                    formattedAmount: { type: "string" },
                                },
                            },
                        },
                    },
                    404: {
                        type: "object",
                        properties: {
                            success: { type: "boolean" },
                            error: { type: "string" },
                        },
                    },
                },
            },
        },
        async (request: FastifyRequest<{ Params: { paymentId: string } }>, reply: FastifyReply) => {
            try {
                const { paymentId } = request.params;

                const payment = await pixService.getPaymentStatus(paymentId);

                if (!payment) {
                    return reply.status(404).send({
                        success: false,
                        error: "Pagamento não encontrado",
                    });
                }

                return reply.send({
                    success: true,
                    data: {
                        ...payment,
                        formattedAmount: pixService.formatCurrency(payment.amount),
                    },
                });
            } catch (error) {
                console.error("Erro ao consultar pagamento:", error);
                return reply.status(400).send({
                    success: false,
                    error: error instanceof Error ? error.message : "Erro interno do servidor",
                });
            }
        }
    );

    // Webhook do Mercado Pago
    fastify.post<{ Body: WebhookBody }>(
        "/webhook",
        {
            schema: {
                tags: ["pix"],
                summary: "Webhook do Mercado Pago",
                description: "Processa notificações de status de pagamento do Mercado Pago",
                body: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        live_mode: { type: "boolean" },
                        type: { type: "string" },
                        date_created: { type: "string" },
                        application_id: { type: "string" },
                        user_id: { type: "string" },
                        version: { type: "number" },
                        api_version: { type: "string" },
                        action: { type: "string" },
                        data: {
                            type: "object",
                            properties: {
                                id: { type: "string" },
                            },
                            required: ["id"],
                        },
                    },
                    required: ["type", "data"],
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
        async (request: FastifyRequest<{ Body: WebhookBody }>, reply: FastifyReply) => {
            try {
                console.log("Recebendo webhook PIX:", request.body);

                const webhookData: PIXWebhookData = request.body;
                const result = await pixService.processWebhook(webhookData);

                console.log("Webhook processado:", result);

                // Aqui você pode implementar lógicas adicionais:
                // - Disparar workflows automáticos
                // - Enviar notificações via WhatsApp
                // - Atualizar status no banco de dados
                // - Integrar com sistemas ERP/CRM

                return reply.send({
                    success: true,
                    message: "Webhook processado com sucesso",
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

    // Estornar pagamento (PIX não suporta estorno automático)
    fastify.post<{ Body: RefundBody }>(
        "/refund",
        {
            schema: {
                tags: ["pix"],
                summary: "Solicitar estorno (manual)",
                description: "Registra solicitação de estorno PIX (processo manual)",
                body: {
                    type: "object",
                    required: ["paymentId"],
                    properties: {
                        paymentId: { type: "string", description: "ID do pagamento" },
                        amount: { type: "number", minimum: 0.01, description: "Valor a estornar (opcional)" },
                        reason: { type: "string", description: "Motivo do estorno" },
                    },
                },
                response: {
                    400: {
                        type: "object",
                        properties: {
                            success: { type: "boolean" },
                            error: { type: "string" },
                            message: { type: "string" },
                        },
                    },
                },
            },
        },
        async (request: FastifyRequest<{ Body: RefundBody }>, reply: FastifyReply) => {
            try {
                // PIX não suporta estorno automático
                console.log("Solicitação de estorno PIX recebida:", request.body);

                return reply.status(400).send({
                    success: false,
                    error: "PIX não suporta estorno automático",
                    message: "Para estornar um PIX, acesse o painel do Mercado Pago e faça o estorno manual.",
                });
            } catch (error) {
                console.error("Erro ao processar estorno:", error);
                return reply.status(400).send({
                    success: false,
                    error: error instanceof Error ? error.message : "Erro interno do servidor",
                });
            }
        }
    );

    // Criar pagamento recorrente
    fastify.post<{ Body: RecurringPaymentBody }>(
        "/recurring",
        {
            schema: {
                tags: ["pix"],
                summary: "Criar pagamento recorrente",
                description: "Cria um pagamento recorrente usando Pre-approval",
                body: {
                    type: "object",
                    required: ["amount", "description", "frequency", "startDate", "payerEmail"],
                    properties: {
                        amount: { type: "number", minimum: 0.01, description: "Valor da recorrência" },
                        description: { type: "string", minLength: 1, description: "Descrição do pagamento recorrente" },
                        frequency: { type: "string", enum: ["monthly", "weekly", "daily"], description: "Frequência" },
                        startDate: { type: "string", format: "date", description: "Data de início" },
                        endDate: { type: "string", format: "date", description: "Data de fim (opcional)" },
                        payerEmail: { type: "string", format: "email", description: "Email do pagador" },
                        maxAmount: { type: "number", description: "Valor máximo da recorrência" },
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
                                    preApprovalId: { type: "string" },
                                    status: { type: "string" },
                                    nextPaymentDate: { type: "string" },
                                },
                            },
                        },
                    },
                },
            },
        },
        async (request: FastifyRequest<{ Body: RecurringPaymentBody }>, reply: FastifyReply) => {
            try {
                const { amount, description, frequency, startDate, endDate, payerEmail, maxAmount } = request.body;

                const recurringRequest: PIXRecurringPaymentRequest = {
                    amount,
                    description,
                    frequency,
                    startDate: new Date(startDate),
                    payerEmail,
                    ...(endDate && { endDate: new Date(endDate) }),
                    ...(maxAmount && { maxAmount }),
                };

                const recurring = await pixService.createRecurringPayment(recurringRequest);

                return reply.send({
                    success: true,
                    data: recurring,
                });
            } catch (error) {
                console.error("Erro ao criar pagamento recorrente:", error);
                return reply.status(400).send({
                    success: false,
                    error: error instanceof Error ? error.message : "Erro interno do servidor",
                });
            }
        }
    );

    // Health check
    fastify.get(
        "/health",
        {
            schema: {
                tags: ["pix"],
                summary: "Health check PIX",
                description: "Verifica se o serviço PIX está funcionando",
                response: {
                    200: {
                        type: "object",
                        properties: {
                            status: { type: "string" },
                            service: { type: "string" },
                            timestamp: { type: "string" },
                        },
                    },
                },
            },
        },
        async (_request: FastifyRequest, reply: FastifyReply) => {
            return reply.send({
                status: "ok",
                service: "PIX Mercado Pago",
                timestamp: new Date().toISOString(),
                features: [
                    "Criação de pagamentos PIX",
                    "Consulta de status",
                    "Processamento de webhooks",
                    "Pagamentos recorrentes",
                    "Validação de documentos brasileiros",
                ],
            });
        }
    );
}

export default pixRoutes;
