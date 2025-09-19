import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
    ERPIntegrationService,
    ERPIntegrationConfig,
    CreateInvoiceRequest,
    ERPWebhookData,
} from "../integrations/erp/ERPIntegrationService";

const erpServices = new Map<string, ERPIntegrationService>();

interface ConfigureERPBody {
    platform: "omie" | "contaazul" | "bling";
    apiKey: string;
    apiSecret?: string;
    apiUrl: string;
    companyId?: string;
    webhookSecret?: string;
    taxConfiguration?: {
        defaultCfop: string;
        icmsRate: number;
        ipiRate: number;
        pisRate: number;
        cofinsRate: number;
    };
}

interface CreateProductBody {
    name: string;
    sku: string;
    price: number;
    cost?: number;
    category: string;
    description?: string;
    stockQuantity: number;
    unit: string;
    ncm?: string;
    cfop?: string;
    icmsRate?: number;
}

interface CreateCustomerBody {
    name: string;
    email?: string;
    phone?: string;
    document: string;
    address: {
        street: string;
        number: string;
        neighborhood: string;
        city: string;
        state: string;
        zipCode: string;
    };
    customerType: "individual" | "company";
}

interface CreateInvoiceBody {
    customerId: string;
    items: {
        productId: string;
        quantity: number;
        unitPrice: number;
    }[];
    dueDate: string;
    paymentMethod?: string;
    observations?: string;
}

interface UpdateStockBody {
    operation: "add" | "subtract" | "set";
    quantity: number;
}

interface BankReconciliationBody {
    date: string;
    amount: number;
    description: string;
    reference?: string;
}

async function erpRoutes(fastify: FastifyInstance) {
    // Configurar integração ERP
    fastify.post<{ Body: ConfigureERPBody; Params: { platform: string } }>(
        "/configure/:platform",
        {
            schema: {
                tags: ["erp"],
                summary: "Configurar integração ERP",
                description: "Configura a integração com Omie, ContaAzul ou Bling",
                params: {
                    type: "object",
                    properties: {
                        platform: { type: "string", enum: ["omie", "contaazul", "bling"] },
                    },
                    required: ["platform"],
                },
                body: {
                    type: "object",
                    required: ["apiKey", "apiUrl"],
                    properties: {
                        platform: { type: "string", enum: ["omie", "contaazul", "bling"] },
                        apiKey: { type: "string", description: "Chave da API do ERP" },
                        apiSecret: { type: "string", description: "Secret da API (para alguns ERPs)" },
                        apiUrl: { type: "string", description: "URL base da API" },
                        companyId: { type: "string", description: "ID da empresa (se necessário)" },
                        webhookSecret: { type: "string", description: "Secret para validação de webhooks" },
                        taxConfiguration: {
                            type: "object",
                            description: "Configuração fiscal padrão",
                            properties: {
                                defaultCfop: { type: "string" },
                                icmsRate: { type: "number" },
                                ipiRate: { type: "number" },
                                pisRate: { type: "number" },
                                cofinsRate: { type: "number" },
                            },
                        },
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
            request: FastifyRequest<{ Body: ConfigureERPBody; Params: { platform: string } }>,
            reply: FastifyReply
        ) => {
            try {
                const { platform } = request.params;
                const { apiKey, apiSecret, apiUrl, companyId, webhookSecret, taxConfiguration } = request.body;

                const config: ERPIntegrationConfig = {
                    platform: platform as "omie" | "contaazul" | "bling",
                    apiKey,
                    apiUrl,
                    ...(apiSecret && { apiSecret }),
                    ...(companyId && { companyId }),
                    ...(webhookSecret && { webhookSecret }),
                    ...(taxConfiguration && { taxConfiguration }),
                };

                const erpService = new ERPIntegrationService(config);
                erpServices.set(platform, erpService);

                return reply.send({
                    success: true,
                    message: `Integração ${platform} configurada com sucesso`,
                    platform,
                });
            } catch (error) {
                console.error("Erro ao configurar ERP:", error);
                return reply.status(400).send({
                    success: false,
                    error: error instanceof Error ? error.message : "Erro interno do servidor",
                });
            }
        }
    );

    // Criar produto
    fastify.post<{ Body: CreateProductBody; Params: { platform: string } }>(
        "/:platform/products",
        {
            schema: {
                tags: ["erp"],
                summary: "Criar produto no ERP",
                description: "Cria um novo produto no ERP configurado",
                params: {
                    type: "object",
                    properties: {
                        platform: { type: "string", enum: ["omie", "contaazul", "bling"] },
                    },
                    required: ["platform"],
                },
                body: {
                    type: "object",
                    required: ["name", "sku", "price", "category", "stockQuantity", "unit"],
                    properties: {
                        name: { type: "string", description: "Nome do produto" },
                        sku: { type: "string", description: "Código SKU do produto" },
                        price: { type: "number", minimum: 0, description: "Preço de venda" },
                        cost: { type: "number", minimum: 0, description: "Custo do produto" },
                        category: { type: "string", description: "Categoria do produto" },
                        description: { type: "string", description: "Descrição detalhada" },
                        stockQuantity: { type: "number", minimum: 0, description: "Quantidade em estoque" },
                        unit: { type: "string", description: "Unidade de medida" },
                        ncm: { type: "string", description: "Código NCM" },
                        cfop: { type: "string", description: "CFOP padrão" },
                        icmsRate: { type: "number", description: "Alíquota ICMS" },
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
                                    sku: { type: "string" },
                                    price: { type: "number" },
                                    stockQuantity: { type: "number" },
                                },
                            },
                        },
                    },
                },
            },
        },
        async (
            request: FastifyRequest<{ Body: CreateProductBody; Params: { platform: string } }>,
            reply: FastifyReply
        ) => {
            try {
                const { platform } = request.params;
                const erpService = erpServices.get(platform);

                if (!erpService) {
                    return reply.status(400).send({
                        success: false,
                        error: `ERP ${platform} não configurado`,
                    });
                }

                const product = await erpService.createProduct(request.body);

                return reply.send({
                    success: true,
                    data: product,
                });
            } catch (error) {
                console.error("Erro ao criar produto:", error);
                return reply.status(400).send({
                    success: false,
                    error: error instanceof Error ? error.message : "Erro interno do servidor",
                });
            }
        }
    );

    // Buscar produto por SKU
    fastify.get<{ Params: { platform: string; sku: string } }>(
        "/:platform/products/sku/:sku",
        {
            schema: {
                tags: ["erp"],
                summary: "Buscar produto por SKU",
                description: "Busca um produto pelo código SKU",
                params: {
                    type: "object",
                    properties: {
                        platform: { type: "string", enum: ["omie", "contaazul", "bling"] },
                        sku: { type: "string" },
                    },
                    required: ["platform", "sku"],
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
                                    sku: { type: "string" },
                                    price: { type: "number" },
                                    stockQuantity: { type: "number" },
                                },
                            },
                        },
                    },
                },
            },
        },
        async (request: FastifyRequest<{ Params: { platform: string; sku: string } }>, reply: FastifyReply) => {
            try {
                const { platform, sku } = request.params;
                const erpService = erpServices.get(platform);

                if (!erpService) {
                    return reply.status(400).send({
                        success: false,
                        error: `ERP ${platform} não configurado`,
                    });
                }

                const product = await erpService.findProductBySKU(sku);

                return reply.send({
                    success: true,
                    data: product,
                });
            } catch (error) {
                console.error("Erro ao buscar produto:", error);
                return reply.status(400).send({
                    success: false,
                    error: error instanceof Error ? error.message : "Erro interno do servidor",
                });
            }
        }
    );

    // Atualizar estoque
    fastify.patch<{ Body: UpdateStockBody; Params: { platform: string; productId: string } }>(
        "/:platform/products/:productId/stock",
        {
            schema: {
                tags: ["erp"],
                summary: "Atualizar estoque do produto",
                description: "Atualiza a quantidade em estoque de um produto",
                params: {
                    type: "object",
                    properties: {
                        platform: { type: "string", enum: ["omie", "contaazul", "bling"] },
                        productId: { type: "string" },
                    },
                    required: ["platform", "productId"],
                },
                body: {
                    type: "object",
                    required: ["operation", "quantity"],
                    properties: {
                        operation: { type: "string", enum: ["add", "subtract", "set"] },
                        quantity: { type: "number", minimum: 0 },
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
                                    productId: { type: "string" },
                                    type: { type: "string" },
                                    quantity: { type: "number" },
                                    reason: { type: "string" },
                                },
                            },
                        },
                    },
                },
            },
        },
        async (
            request: FastifyRequest<{ Body: UpdateStockBody; Params: { platform: string; productId: string } }>,
            reply: FastifyReply
        ) => {
            try {
                const { platform, productId } = request.params;
                const { operation, quantity } = request.body;
                const erpService = erpServices.get(platform);

                if (!erpService) {
                    return reply.status(400).send({
                        success: false,
                        error: `ERP ${platform} não configurado`,
                    });
                }

                const stockMovement = await erpService.updateStock(productId, quantity, operation);

                return reply.send({
                    success: true,
                    data: stockMovement,
                });
            } catch (error) {
                console.error("Erro ao atualizar estoque:", error);
                return reply.status(400).send({
                    success: false,
                    error: error instanceof Error ? error.message : "Erro interno do servidor",
                });
            }
        }
    );

    // Criar cliente
    fastify.post<{ Body: CreateCustomerBody; Params: { platform: string } }>(
        "/:platform/customers",
        {
            schema: {
                tags: ["erp"],
                summary: "Criar cliente no ERP",
                description: "Cria um novo cliente no ERP configurado",
                params: {
                    type: "object",
                    properties: {
                        platform: { type: "string", enum: ["omie", "contaazul", "bling"] },
                    },
                    required: ["platform"],
                },
                body: {
                    type: "object",
                    required: ["name", "document", "address", "customerType"],
                    properties: {
                        name: { type: "string", description: "Nome/Razão social" },
                        email: { type: "string", format: "email", description: "Email do cliente" },
                        phone: { type: "string", description: "Telefone" },
                        document: { type: "string", description: "CPF ou CNPJ" },
                        address: {
                            type: "object",
                            required: ["street", "number", "neighborhood", "city", "state", "zipCode"],
                            properties: {
                                street: { type: "string" },
                                number: { type: "string" },
                                neighborhood: { type: "string" },
                                city: { type: "string" },
                                state: { type: "string" },
                                zipCode: { type: "string" },
                            },
                        },
                        customerType: { type: "string", enum: ["individual", "company"] },
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
                                    document: { type: "string" },
                                    customerType: { type: "string" },
                                },
                            },
                        },
                    },
                },
            },
        },
        async (
            request: FastifyRequest<{ Body: CreateCustomerBody; Params: { platform: string } }>,
            reply: FastifyReply
        ) => {
            try {
                const { platform } = request.params;
                const erpService = erpServices.get(platform);

                if (!erpService) {
                    return reply.status(400).send({
                        success: false,
                        error: `ERP ${platform} não configurado`,
                    });
                }

                const customer = await erpService.createCustomer(request.body);

                return reply.send({
                    success: true,
                    data: customer,
                });
            } catch (error) {
                console.error("Erro ao criar cliente:", error);
                return reply.status(400).send({
                    success: false,
                    error: error instanceof Error ? error.message : "Erro interno do servidor",
                });
            }
        }
    );

    // Criar fatura
    fastify.post<{ Body: CreateInvoiceBody; Params: { platform: string } }>(
        "/:platform/invoices",
        {
            schema: {
                tags: ["erp"],
                summary: "Criar fatura no ERP",
                description: "Cria uma nova fatura/nota fiscal no ERP",
                params: {
                    type: "object",
                    properties: {
                        platform: { type: "string", enum: ["omie", "contaazul", "bling"] },
                    },
                    required: ["platform"],
                },
                body: {
                    type: "object",
                    required: ["customerId", "items", "dueDate"],
                    properties: {
                        customerId: { type: "string", description: "ID do cliente" },
                        items: {
                            type: "array",
                            items: {
                                type: "object",
                                required: ["productId", "quantity", "unitPrice"],
                                properties: {
                                    productId: { type: "string" },
                                    quantity: { type: "number", minimum: 0 },
                                    unitPrice: { type: "number", minimum: 0 },
                                },
                            },
                        },
                        dueDate: { type: "string", format: "date", description: "Data de vencimento" },
                        paymentMethod: { type: "string", description: "Forma de pagamento" },
                        observations: { type: "string", description: "Observações" },
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
                                    number: { type: "string" },
                                    customerId: { type: "string" },
                                    totalAmount: { type: "number" },
                                    status: { type: "string" },
                                },
                            },
                        },
                    },
                },
            },
        },
        async (
            request: FastifyRequest<{ Body: CreateInvoiceBody; Params: { platform: string } }>,
            reply: FastifyReply
        ) => {
            try {
                const { platform } = request.params;
                const { customerId, items, dueDate, paymentMethod, observations } = request.body;
                const erpService = erpServices.get(platform);

                if (!erpService) {
                    return reply.status(400).send({
                        success: false,
                        error: `ERP ${platform} não configurado`,
                    });
                }

                const invoiceRequest: CreateInvoiceRequest = {
                    customerId,
                    items,
                    dueDate: new Date(dueDate),
                    ...(paymentMethod && { paymentMethod }),
                    ...(observations && { observations }),
                };

                const invoice = await erpService.createInvoice(invoiceRequest);

                return reply.send({
                    success: true,
                    data: invoice,
                });
            } catch (error) {
                console.error("Erro ao criar fatura:", error);
                return reply.status(400).send({
                    success: false,
                    error: error instanceof Error ? error.message : "Erro interno do servidor",
                });
            }
        }
    );

    // Conciliação bancária
    fastify.post<{ Body: BankReconciliationBody; Params: { platform: string } }>(
        "/:platform/reconciliation",
        {
            schema: {
                tags: ["erp"],
                summary: "Processar conciliação bancária",
                description: "Processa a conciliação de um extrato bancário com movimentações financeiras",
                params: {
                    type: "object",
                    properties: {
                        platform: { type: "string", enum: ["omie", "contaazul", "bling"] },
                    },
                    required: ["platform"],
                },
                body: {
                    type: "object",
                    required: ["date", "amount", "description"],
                    properties: {
                        date: { type: "string", format: "date", description: "Data da movimentação" },
                        amount: { type: "number", description: "Valor da movimentação" },
                        description: { type: "string", description: "Descrição da movimentação" },
                        reference: { type: "string", description: "Referência externa" },
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
                                    matched: { type: "boolean" },
                                    entryId: { type: "string" },
                                    invoiceId: { type: "string" },
                                },
                            },
                        },
                    },
                },
            },
        },
        async (
            request: FastifyRequest<{ Body: BankReconciliationBody; Params: { platform: string } }>,
            reply: FastifyReply
        ) => {
            try {
                const { platform } = request.params;
                const { date, amount, description, reference } = request.body;
                const erpService = erpServices.get(platform);

                if (!erpService) {
                    return reply.status(400).send({
                        success: false,
                        error: `ERP ${platform} não configurado`,
                    });
                }

                const reconciliation = await erpService.processBankReconciliation({
                    date: new Date(date),
                    amount,
                    description,
                    ...(reference && { reference }),
                });

                return reply.send({
                    success: true,
                    data: reconciliation,
                });
            } catch (error) {
                console.error("Erro na conciliação bancária:", error);
                return reply.status(400).send({
                    success: false,
                    error: error instanceof Error ? error.message : "Erro interno do servidor",
                });
            }
        }
    );

    // Webhook genérico para ERPs
    fastify.post<{ Body: any; Params: { platform: string } }>(
        "/:platform/webhook",
        {
            schema: {
                tags: ["erp"],
                summary: "Webhook do ERP",
                description: "Processa webhooks dos ERPs configurados",
                params: {
                    type: "object",
                    properties: {
                        platform: { type: "string", enum: ["omie", "contaazul", "bling"] },
                    },
                    required: ["platform"],
                },
                body: {
                    type: "object",
                    description: "Dados do webhook do ERP",
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
                const erpService = erpServices.get(platform);

                if (!erpService) {
                    return reply.status(400).send({
                        success: false,
                        error: `ERP ${platform} não configurado`,
                    });
                }

                const webhookBody = request.body as any;
                const webhookData: ERPWebhookData = {
                    event: webhookBody.event || "unknown",
                    data: webhookBody,
                    timestamp: new Date().toISOString(),
                    source: platform as "omie" | "contaazul" | "bling",
                };

                const result = await erpService.processWebhook(webhookData);

                console.log(`Webhook ${platform} processado:`, result);

                // Aqui você pode implementar lógicas adicionais:
                // - Disparar workflows automáticos
                // - Sincronizar com PIX/WhatsApp/CRM
                // - Atualizar dados locais
                // - Enviar notificações
                // - Baixar estoque automaticamente
                // - Emitir nota fiscal

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
                tags: ["erp"],
                summary: "Sincronizar dados",
                description: "Sincroniza dados entre AutoFlow e o ERP",
                params: {
                    type: "object",
                    properties: {
                        platform: { type: "string", enum: ["omie", "contaazul", "bling"] },
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
                                            products: { type: "number" },
                                            customers: { type: "number" },
                                            invoices: { type: "number" },
                                            financialEntries: { type: "number" },
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
                const erpService = erpServices.get(platform);

                if (!erpService) {
                    return reply.status(400).send({
                        success: false,
                        error: `ERP ${platform} não configurado`,
                    });
                }

                const syncResult = await erpService.syncWithERP();

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

    // Health check ERP
    fastify.get(
        "/health",
        {
            schema: {
                tags: ["erp"],
                summary: "Health check ERP",
                description: "Verifica o status das integrações ERP configuradas",
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
            const configuredPlatforms = Array.from(erpServices.keys());
            const availablePlatforms = ["omie", "contaazul", "bling"];

            return reply.send({
                status: "ok",
                service: "ERP Integration Service",
                timestamp: new Date().toISOString(),
                platforms: {
                    configured: configuredPlatforms,
                    available: availablePlatforms,
                },
                features: [
                    "Gestão completa de produtos",
                    "Cadastro unificado de clientes",
                    "Faturamento automático",
                    "Controle de estoque em tempo real",
                    "Conciliação bancária automatizada",
                    "Webhooks para eventos fiscais",
                    "Sincronização bidirecional",
                    "Integração PIX + CRM + WhatsApp",
                    "Compliance fiscal brasileiro",
                ],
            });
        }
    );
}

export default erpRoutes;
