import {
    ERPConfig,
    ERPContact,
    ERPProduct,
    ERPOrder,
    ValidationResult,
    IntegrationAction,
    ActionResult,
    AutoFlowError,
} from "../../core/types";
import { Integration } from "../../core/integrations/base";

/**
 * Omie ERP Integration
 * Implements Omie ERP capabilities for AutoFlow workflows
 */
export class OmieERPIntegration extends Integration {
    private config: ERPConfig;

    constructor(config: ERPConfig, organizationId: string) {
        super(config.apiKey, "https://app.omie.com.br/api/v1", organizationId);
        this.config = config;
    }

    async authenticate(): Promise<boolean> {
        try {
            // Test authentication with a simple call
            const response = await this.makeRequest("/geral/categorias/", "POST", {
                call: "ListarCategorias",
                app_key: this.config.apiKey,
                app_secret: this.config.appSecret,
                param: [{}],
            });

            await this.logActivity("authenticate", true, {
                appKey: this.config.apiKey,
            });

            return response && !response.faultstring;
        } catch (error) {
            await this.logActivity("authenticate", false, { error });
            return false;
        }
    }

    async validateConfig(): Promise<ValidationResult> {
        const requiredFields = ["apiKey", "appSecret"];
        const baseValidation = this.validateRequiredFields(this.config, requiredFields);

        if (!baseValidation.isValid) {
            return baseValidation;
        }

        // Test connection
        const isConnected = await this.testConnection();
        if (!isConnected) {
            return {
                isValid: false,
                errors: ["Unable to connect to Omie ERP API"],
            };
        }

        return { isValid: true };
    }

    async testConnection(): Promise<boolean> {
        return await this.authenticate();
    }

    getAvailableActions(): string[] {
        return [
            "create_contact",
            "update_contact",
            "get_contact",
            "create_product",
            "update_product",
            "get_product",
            "create_order",
            "update_order",
            "get_order",
        ];
    }

    async execute(action: IntegrationAction): Promise<ActionResult> {
        try {
            switch (action.type) {
                case "create_contact":
                    return await this.createContact(action.payload as ERPContact);

                case "get_contact":
                    return await this.getContact(action.payload["contactId"]);

                case "create_product":
                    return await this.createProduct(action.payload as ERPProduct);

                case "get_product":
                    return await this.getProduct(action.payload["productId"]);

                case "create_order":
                    return await this.createOrder(action.payload as ERPOrder);

                case "get_order":
                    return await this.getOrder(action.payload["orderId"]);

                default:
                    throw new AutoFlowError(`Unsupported Omie ERP action: ${action.type}`, "OMIE_UNSUPPORTED_ACTION");
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            await this.logActivity("execute_action", false, {
                action: action.type,
                error: errorMessage,
            });

            return {
                success: false,
                error: errorMessage,
            };
        }
    }

    /**
     * Create contact (cliente/fornecedor)
     */
    async createContact(contact: ERPContact): Promise<ActionResult> {
        try {
            const payload = {
                call: "IncluirCliente",
                app_key: this.config.apiKey,
                app_secret: this.config.appSecret,
                param: [
                    {
                        codigo_cliente_omie: 0,
                        razao_social: contact.name,
                        nome_fantasia: contact.name,
                        email: contact.email || "",
                        telefone1_numero: contact.phone || "",
                        cnpj_cpf: contact.document || "",
                        cidade: "São Paulo",
                        estado: "SP",
                    },
                ],
            };

            const response = await this.makeRequest("/geral/clientes/", "POST", payload);

            if (response.faultstring) {
                throw new Error(response.faultstring);
            }

            await this.logActivity("create_contact", true, {
                contactId: response.codigo_cliente_omie,
                name: contact.name,
            });

            return {
                success: true,
                data: {
                    contactId: response.codigo_cliente_omie,
                    externalId: response.codigo_cliente_integracao,
                },
                metadata: {
                    contactId: response.codigo_cliente_omie,
                    name: contact.name,
                },
            };
        } catch (error) {
            throw new AutoFlowError("Failed to create contact in Omie", "OMIE_CREATE_CONTACT_ERROR", {
                contact,
                originalError: error,
            });
        }
    }

    /**
     * Get contact details
     */
    async getContact(contactId: string): Promise<ActionResult> {
        try {
            const payload = {
                call: "ConsultarCliente",
                app_key: this.config.apiKey,
                app_secret: this.config.appSecret,
                param: [
                    {
                        codigo_cliente_omie: parseInt(contactId),
                    },
                ],
            };

            const response = await this.makeRequest("/geral/clientes/", "POST", payload);

            if (response.faultstring) {
                throw new Error(response.faultstring);
            }

            await this.logActivity("get_contact", true, {
                contactId,
            });

            return {
                success: true,
                data: {
                    id: response.codigo_cliente_omie,
                    name: response.razao_social,
                    email: response.email,
                    phone: response.telefone1_numero,
                    document: response.cnpj_cpf,
                },
                metadata: {
                    contactId,
                },
            };
        } catch (error) {
            throw new AutoFlowError("Failed to get contact from Omie", "OMIE_GET_CONTACT_ERROR", {
                contactId,
                originalError: error,
            });
        }
    }

    /**
     * Create product
     */
    async createProduct(product: ERPProduct): Promise<ActionResult> {
        try {
            const payload = {
                call: "IncluirProduto",
                app_key: this.config.apiKey,
                app_secret: this.config.appSecret,
                param: [
                    {
                        codigo_produto: 0,
                        descricao: product.name,
                        codigo: product.sku,
                        valor_unitario: product.price,
                        tipo: "P", // Produto
                        unidade: "UN",
                    },
                ],
            };

            const response = await this.makeRequest("/geral/produtos/", "POST", payload);

            if (response.faultstring) {
                throw new Error(response.faultstring);
            }

            await this.logActivity("create_product", true, {
                productId: response.codigo_produto,
                name: product.name,
                sku: product.sku,
            });

            return {
                success: true,
                data: {
                    productId: response.codigo_produto,
                    sku: response.codigo,
                },
                metadata: {
                    productId: response.codigo_produto,
                    name: product.name,
                    sku: product.sku,
                },
            };
        } catch (error) {
            throw new AutoFlowError("Failed to create product in Omie", "OMIE_CREATE_PRODUCT_ERROR", {
                product,
                originalError: error,
            });
        }
    }

    /**
     * Get product details
     */
    async getProduct(productId: string): Promise<ActionResult> {
        try {
            const payload = {
                call: "ConsultarProduto",
                app_key: this.config.apiKey,
                app_secret: this.config.appSecret,
                param: [
                    {
                        codigo_produto: parseInt(productId),
                    },
                ],
            };

            const response = await this.makeRequest("/geral/produtos/", "POST", payload);

            if (response.faultstring) {
                throw new Error(response.faultstring);
            }

            await this.logActivity("get_product", true, {
                productId,
            });

            return {
                success: true,
                data: {
                    id: response.codigo_produto,
                    name: response.descricao,
                    sku: response.codigo,
                    price: response.valor_unitario,
                },
                metadata: {
                    productId,
                },
            };
        } catch (error) {
            throw new AutoFlowError("Failed to get product from Omie", "OMIE_GET_PRODUCT_ERROR", {
                productId,
                originalError: error,
            });
        }
    }

    /**
     * Create order (pedido de venda)
     */
    async createOrder(order: ERPOrder): Promise<ActionResult> {
        try {
            const payload = {
                call: "IncluirPedido",
                app_key: this.config.apiKey,
                app_secret: this.config.appSecret,
                param: [
                    {
                        cabecalho: {
                            codigo_pedido: 0,
                            codigo_cliente: parseInt(order.customerId),
                            data_previsao: new Date().toISOString().split("T")[0],
                            etapa: "10", // Faturamento
                            codigo_parcela: "999",
                        },
                        det: order.items.map((item, index) => ({
                            ide: {
                                codigo_item_integracao: `item-${index + 1}`,
                            },
                            produto: {
                                codigo_produto: parseInt(item.productId),
                                quantidade: item.quantity,
                                valor_unitario: item.price,
                            },
                        })),
                    },
                ],
            };

            const response = await this.makeRequest("/produtos/pedido/", "POST", payload);

            if (response.faultstring) {
                throw new Error(response.faultstring);
            }

            await this.logActivity("create_order", true, {
                orderId: response.codigo_pedido,
                customerId: order.customerId,
                total: order.total,
            });

            return {
                success: true,
                data: {
                    orderId: response.codigo_pedido,
                    orderNumber: response.numero_pedido,
                },
                metadata: {
                    orderId: response.codigo_pedido,
                    customerId: order.customerId,
                    total: order.total,
                },
            };
        } catch (error) {
            throw new AutoFlowError("Failed to create order in Omie", "OMIE_CREATE_ORDER_ERROR", {
                order,
                originalError: error,
            });
        }
    }

    /**
     * Get order details
     */
    async getOrder(orderId: string): Promise<ActionResult> {
        try {
            const payload = {
                call: "ConsultarPedido",
                app_key: this.config.apiKey,
                app_secret: this.config.appSecret,
                param: [
                    {
                        codigo_pedido: parseInt(orderId),
                    },
                ],
            };

            const response = await this.makeRequest("/produtos/pedido/", "POST", payload);

            if (response.faultstring) {
                throw new Error(response.faultstring);
            }

            await this.logActivity("get_order", true, {
                orderId,
            });

            return {
                success: true,
                data: {
                    id: response.cabecalho.codigo_pedido,
                    orderNumber: response.cabecalho.numero_pedido,
                    customerId: response.cabecalho.codigo_cliente,
                    status: response.cabecalho.etapa,
                    total: response.total_pedido.valor_total_pedido,
                    items:
                        response.det?.map((item: any) => ({
                            productId: item.produto.codigo_produto,
                            quantity: item.produto.quantidade,
                            price: item.produto.valor_unitario,
                        })) || [],
                },
                metadata: {
                    orderId,
                },
            };
        } catch (error) {
            throw new AutoFlowError("Failed to get order from Omie", "OMIE_GET_ORDER_ERROR", {
                orderId,
                originalError: error,
            });
        }
    }
}
