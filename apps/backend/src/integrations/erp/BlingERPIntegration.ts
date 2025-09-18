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
 * Bling ERP Integration
 * Implements Bling ERP capabilities for AutoFlow workflows
 */
export class BlingERPIntegration extends Integration {
    private config: ERPConfig;

    constructor(config: ERPConfig, organizationId: string) {
        super(config.apiKey, "https://www.bling.com.br/Api/v3", organizationId);
        this.config = config;
    }

    async authenticate(): Promise<boolean> {
        try {
            // Test authentication with a simple call
            const response = await this.makeRequest("/contatos", "GET", undefined, {
                Authorization: `Bearer ${this.config.apiKey}`,
            });

            await this.logActivity("authenticate", true, {
                apiKey: this.config.apiKey.substring(0, 10) + "...",
            });

            return response && !response.error;
        } catch (error) {
            await this.logActivity("authenticate", false, { error });
            return false;
        }
    }

    async validateConfig(): Promise<ValidationResult> {
        const requiredFields = ["apiKey"];
        const baseValidation = this.validateRequiredFields(this.config, requiredFields);

        if (!baseValidation.isValid) {
            return baseValidation;
        }

        // Test connection
        const isConnected = await this.testConnection();
        if (!isConnected) {
            return {
                isValid: false,
                errors: ["Unable to connect to Bling ERP API"],
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
                    throw new AutoFlowError(`Unsupported Bling ERP action: ${action.type}`, "BLING_UNSUPPORTED_ACTION");
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
     * Create contact
     */
    async createContact(contact: ERPContact): Promise<ActionResult> {
        try {
            const payload = {
                nome: contact.name,
                email: contact.email || "",
                telefone: contact.phone || "",
                numeroDocumento: contact.document || "",
                tipo: "C", // Cliente
            };

            const response = await this.makeRequest("/contatos", "POST", payload, {
                Authorization: `Bearer ${this.config.apiKey}`,
                "Content-Type": "application/json",
            });

            if (response.error) {
                throw new Error(response.error.message || "Unknown Bling error");
            }

            await this.logActivity("create_contact", true, {
                contactId: response.data.id,
                name: contact.name,
            });

            return {
                success: true,
                data: {
                    contactId: response.data.id,
                    name: response.data.nome,
                },
                metadata: {
                    contactId: response.data.id,
                    name: contact.name,
                },
            };
        } catch (error) {
            throw new AutoFlowError("Failed to create contact in Bling", "BLING_CREATE_CONTACT_ERROR", {
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
            const response = await this.makeRequest(`/contatos/${contactId}`, "GET", undefined, {
                Authorization: `Bearer ${this.config.apiKey}`,
            });

            if (response.error) {
                throw new Error(response.error.message || "Unknown Bling error");
            }

            await this.logActivity("get_contact", true, {
                contactId,
            });

            return {
                success: true,
                data: {
                    id: response.data.id,
                    name: response.data.nome,
                    email: response.data.email,
                    phone: response.data.telefone,
                    document: response.data.numeroDocumento,
                },
                metadata: {
                    contactId,
                },
            };
        } catch (error) {
            throw new AutoFlowError("Failed to get contact from Bling", "BLING_GET_CONTACT_ERROR", {
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
                nome: product.name,
                codigo: product.sku,
                preco: product.price,
                tipo: "P", // Produto
                situacao: "Ativo",
                formato: "S", // Simples
                unidade: "UN",
            };

            const response = await this.makeRequest("/produtos", "POST", payload, {
                Authorization: `Bearer ${this.config.apiKey}`,
                "Content-Type": "application/json",
            });

            if (response.error) {
                throw new Error(response.error.message || "Unknown Bling error");
            }

            await this.logActivity("create_product", true, {
                productId: response.data.id,
                name: product.name,
                sku: product.sku,
            });

            return {
                success: true,
                data: {
                    productId: response.data.id,
                    name: response.data.nome,
                    sku: response.data.codigo,
                },
                metadata: {
                    productId: response.data.id,
                    name: product.name,
                    sku: product.sku,
                },
            };
        } catch (error) {
            throw new AutoFlowError("Failed to create product in Bling", "BLING_CREATE_PRODUCT_ERROR", {
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
            const response = await this.makeRequest(`/produtos/${productId}`, "GET", undefined, {
                Authorization: `Bearer ${this.config.apiKey}`,
            });

            if (response.error) {
                throw new Error(response.error.message || "Unknown Bling error");
            }

            await this.logActivity("get_product", true, {
                productId,
            });

            return {
                success: true,
                data: {
                    id: response.data.id,
                    name: response.data.nome,
                    sku: response.data.codigo,
                    price: response.data.preco,
                },
                metadata: {
                    productId,
                },
            };
        } catch (error) {
            throw new AutoFlowError("Failed to get product from Bling", "BLING_GET_PRODUCT_ERROR", {
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
                contato: {
                    id: parseInt(order.customerId),
                },
                itens: order.items.map((item) => ({
                    produto: {
                        id: parseInt(item.productId),
                    },
                    quantidade: item.quantity,
                    valor: item.price,
                })),
                data: new Date().toISOString().split("T")[0],
                numero: Date.now().toString(), // Generate order number
            };

            const response = await this.makeRequest("/pedidos/vendas", "POST", payload, {
                Authorization: `Bearer ${this.config.apiKey}`,
                "Content-Type": "application/json",
            });

            if (response.error) {
                throw new Error(response.error.message || "Unknown Bling error");
            }

            await this.logActivity("create_order", true, {
                orderId: response.data.id,
                customerId: order.customerId,
                total: order.total,
            });

            return {
                success: true,
                data: {
                    orderId: response.data.id,
                    orderNumber: response.data.numero,
                },
                metadata: {
                    orderId: response.data.id,
                    customerId: order.customerId,
                    total: order.total,
                },
            };
        } catch (error) {
            throw new AutoFlowError("Failed to create order in Bling", "BLING_CREATE_ORDER_ERROR", {
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
            const response = await this.makeRequest(`/pedidos/vendas/${orderId}`, "GET", undefined, {
                Authorization: `Bearer ${this.config.apiKey}`,
            });

            if (response.error) {
                throw new Error(response.error.message || "Unknown Bling error");
            }

            await this.logActivity("get_order", true, {
                orderId,
            });

            return {
                success: true,
                data: {
                    id: response.data.id,
                    orderNumber: response.data.numero,
                    customerId: response.data.contato.id,
                    status: response.data.situacao,
                    total: response.data.total,
                    items:
                        response.data.itens?.map((item: any) => ({
                            productId: item.produto.id,
                            quantity: item.quantidade,
                            price: item.valor,
                        })) || [],
                },
                metadata: {
                    orderId,
                },
            };
        } catch (error) {
            throw new AutoFlowError("Failed to get order from Bling", "BLING_GET_ORDER_ERROR", {
                orderId,
                originalError: error,
            });
        }
    }
}
