export interface ERPProduct {
    id: string;
    name: string;
    sku: string;
    price: number;
    cost?: number;
    category: string;
    description?: string;
    stockQuantity: number;
    minStockLevel?: number;
    unit: string;
    weight?: number;
    dimensions?: {
        length: number;
        width: number;
        height: number;
    };
    ncm?: string; // Nomenclatura Comum do Mercosul
    cfop?: string; // Código Fiscal de Operações e Prestações
    icmsRate?: number;
    ipiRate?: number;
    pisRate?: number;
    cofinsRate?: number;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ERPCustomer {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    document: string; // CPF ou CNPJ
    documentType: "CPF" | "CNPJ";
    address: {
        street: string;
        number: string;
        complement?: string;
        neighborhood: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    stateRegistration?: string; // Inscrição Estadual
    municipalRegistration?: string; // Inscrição Municipal
    customerType: "individual" | "company";
    active: boolean;
    creditLimit?: number;
    paymentTerms?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ERPInvoice {
    id: string;
    number: string;
    series: string;
    type: "sale" | "purchase" | "service" | "return";
    status: "draft" | "issued" | "sent" | "paid" | "cancelled";
    customerId: string;
    issueDate: Date;
    dueDate: Date;
    paidDate?: Date;
    totalAmount: number;
    discountAmount?: number;
    taxAmount: number;
    netAmount: number;
    items: ERPInvoiceItem[];
    taxes: ERPTax[];
    paymentMethod?: string;
    observations?: string;
    nfeKey?: string; // Chave da NFe
    nfeStatus?: "pending" | "authorized" | "rejected" | "cancelled";
    xmlUrl?: string;
    pdfUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ERPInvoiceItem {
    id: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    discount?: number;
    cfop: string;
    ncm: string;
    taxes: ERPTax[];
}

export interface ERPTax {
    type: "ICMS" | "IPI" | "PIS" | "COFINS" | "ISS" | "IRRF" | "CSLL";
    rate: number;
    baseValue: number;
    taxValue: number;
    exempt?: boolean;
}

export interface ERPFinancialEntry {
    id: string;
    type: "receivable" | "payable";
    status: "pending" | "paid" | "overdue" | "cancelled";
    customerId?: string;
    supplierId?: string;
    invoiceId?: string;
    description: string;
    amount: number;
    dueDate: Date;
    paidDate?: Date;
    paymentMethod?: string;
    bankAccount?: string;
    category: string;
    installment?: {
        number: number;
        total: number;
    };
    tags?: string[];
    observations?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ERPStockMovement {
    id: string;
    productId: string;
    type: "in" | "out" | "adjustment" | "transfer";
    quantity: number;
    cost?: number;
    reason: string;
    reference?: string; // Referência (ex: venda, compra, ajuste)
    warehouseId?: string;
    userId?: string;
    date: Date;
    createdAt: Date;
}

export interface ERPWebhookData {
    event: string;
    data: any;
    timestamp: string;
    source: "omie" | "contaazul" | "bling";
}

export interface CreateProductRequest {
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

export interface CreateCustomerRequest {
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

export interface CreateInvoiceRequest {
    customerId: string;
    items: {
        productId: string;
        quantity: number;
        unitPrice: number;
    }[];
    dueDate: Date;
    paymentMethod?: string;
    observations?: string;
}

export interface ERPIntegrationConfig {
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

export interface ERPSyncResult {
    success: boolean;
    synchronized: number;
    errors: number;
    details?: {
        products: number;
        customers: number;
        invoices: number;
        financialEntries: number;
    };
}

/**
 * Serviço unificado para integração com ERPs brasileiros
 * Oferece interface única para Omie, ContaAzul e Bling
 */
export class ERPIntegrationService {
    private config: ERPIntegrationConfig;

    constructor(config: ERPIntegrationConfig) {
        this.config = config;
        this.validateConfig();
    }

    /**
     * Criar novo produto no ERP
     */
    async createProduct(request: CreateProductRequest): Promise<ERPProduct> {
        try {
            console.log(`Criando produto no ${this.config.platform}:`, request);

            switch (this.config.platform) {
                case "omie":
                    return await this.createOmieProduct(request);
                case "contaazul":
                    return await this.createContaAzulProduct(request);
                case "bling":
                    return await this.createBlingProduct(request);
                default:
                    throw new Error(`Plataforma ERP não suportada: ${this.config.platform}`);
            }
        } catch (error) {
            console.error("Erro ao criar produto:", error);
            throw new Error(`Falha ao criar produto: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
        }
    }

    /**
     * Buscar produto por SKU
     */
    async findProductBySKU(sku: string): Promise<ERPProduct | null> {
        try {
            console.log(`Buscando produto por SKU no ${this.config.platform}:`, sku);

            switch (this.config.platform) {
                case "omie":
                    return await this.findOmieProductBySKU(sku);
                case "contaazul":
                    return await this.findContaAzulProductBySKU(sku);
                case "bling":
                    return await this.findBlingProductBySKU(sku);
                default:
                    throw new Error(`Plataforma ERP não suportada: ${this.config.platform}`);
            }
        } catch (error) {
            console.error("Erro ao buscar produto:", error);
            return null;
        }
    }

    /**
     * Criar novo cliente
     */
    async createCustomer(request: CreateCustomerRequest): Promise<ERPCustomer> {
        try {
            console.log(`Criando cliente no ${this.config.platform}:`, request);

            // Validar documento brasileiro
            if (!this.validateBrazilianDocument(request.document)) {
                throw new Error("CPF ou CNPJ inválido");
            }

            switch (this.config.platform) {
                case "omie":
                    return await this.createOmieCustomer(request);
                case "contaazul":
                    return await this.createContaAzulCustomer(request);
                case "bling":
                    return await this.createBlingCustomer(request);
                default:
                    throw new Error(`Plataforma ERP não suportada: ${this.config.platform}`);
            }
        } catch (error) {
            console.error("Erro ao criar cliente:", error);
            throw new Error(`Falha ao criar cliente: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
        }
    }

    /**
     * Criar fatura/nota fiscal
     */
    async createInvoice(request: CreateInvoiceRequest): Promise<ERPInvoice> {
        try {
            console.log(`Criando fatura no ${this.config.platform}:`, request);

            switch (this.config.platform) {
                case "omie":
                    return await this.createOmieInvoice(request);
                case "contaazul":
                    return await this.createContaAzulInvoice(request);
                case "bling":
                    return await this.createBlingInvoice(request);
                default:
                    throw new Error(`Plataforma ERP não suportada: ${this.config.platform}`);
            }
        } catch (error) {
            console.error("Erro ao criar fatura:", error);
            throw new Error(`Falha ao criar fatura: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
        }
    }

    /**
     * Atualizar estoque do produto
     */
    async updateStock(
        productId: string,
        quantity: number,
        operation: "add" | "subtract" | "set"
    ): Promise<ERPStockMovement> {
        try {
            console.log(`Atualizando estoque no ${this.config.platform}:`, { productId, quantity, operation });

            switch (this.config.platform) {
                case "omie":
                    return await this.updateOmieStock(productId, quantity, operation);
                case "contaazul":
                    return await this.updateContaAzulStock(productId, quantity, operation);
                case "bling":
                    return await this.updateBlingStock(productId, quantity, operation);
                default:
                    throw new Error(`Plataforma ERP não suportada: ${this.config.platform}`);
            }
        } catch (error) {
            console.error("Erro ao atualizar estoque:", error);
            throw new Error(
                `Falha ao atualizar estoque: ${error instanceof Error ? error.message : "Erro desconhecido"}`
            );
        }
    }

    /**
     * Processar conciliação bancária
     */
    async processBankReconciliation(bankStatement: {
        date: Date;
        amount: number;
        description: string;
        reference?: string;
    }): Promise<{
        matched: boolean;
        entryId?: string;
        invoiceId?: string;
    }> {
        try {
            console.log(`Processando conciliação bancária no ${this.config.platform}:`, bankStatement);

            // Buscar movimentações financeiras pendentes
            const pendingEntries = await this.getPendingFinancialEntries();

            // Tentar fazer match automático
            const match = pendingEntries.find(
                (entry) => Math.abs(entry.amount - bankStatement.amount) < 0.01 && entry.dueDate <= bankStatement.date
            );

            if (match) {
                await this.markFinancialEntryAsPaid(match.id, bankStatement.date);
                return {
                    matched: true,
                    entryId: match.id,
                    ...(match.invoiceId && { invoiceId: match.invoiceId }),
                };
            }

            return { matched: false };
        } catch (error) {
            console.error("Erro na conciliação bancária:", error);
            throw new Error(`Falha na conciliação: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
        }
    }

    /**
     * Processar webhook do ERP
     */
    async processWebhook(webhookData: ERPWebhookData): Promise<{
        processed: boolean;
        action: string;
        entityType: string;
        entityId?: string;
    }> {
        try {
            console.log(`Processando webhook do ${webhookData.source}:`, webhookData);

            switch (webhookData.source) {
                case "omie":
                    return await this.processOmieWebhook(webhookData);
                case "contaazul":
                    return await this.processContaAzulWebhook(webhookData);
                case "bling":
                    return await this.processBlingWebhook(webhookData);
                default:
                    throw new Error(`Fonte de webhook não suportada: ${webhookData.source}`);
            }
        } catch (error) {
            console.error("Erro ao processar webhook:", error);
            throw new Error(
                `Falha ao processar webhook: ${error instanceof Error ? error.message : "Erro desconhecido"}`
            );
        }
    }

    /**
     * Sincronizar dados entre AutoFlow e ERP
     */
    async syncWithERP(): Promise<ERPSyncResult> {
        try {
            console.log(`Iniciando sincronização com ${this.config.platform}`);

            const products = 0;
            const customers = 0;
            const invoices = 0;
            const financialEntries = 0;
            const errors = 0;

            // Implementar lógica de sincronização específica por ERP
            // - Sincronizar produtos modificados
            // - Atualizar clientes
            // - Buscar novas faturas
            // - Atualizar movimentações financeiras

            return {
                success: true,
                synchronized: products + customers + invoices + financialEntries,
                errors,
                details: { products, customers, invoices, financialEntries },
            };
        } catch (error) {
            console.error("Erro na sincronização:", error);
            throw new Error(`Falha na sincronização: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
        }
    }

    // Métodos específicos para Omie
    private async createOmieProduct(request: CreateProductRequest): Promise<ERPProduct> {
        const response = await this.makeOmieRequest("POST", "/produtos/", {
            codigo_produto: request.sku,
            descricao: request.name,
            valor_unitario: request.price,
            peso_liquido: 0,
            marca: "",
            modelo: "",
            ncm: request.ncm || "00000000",
            origem: 0,
            categoria: request.category,
            unidade: request.unit,
            estoque_atual: request.stockQuantity,
        });

        return this.mapOmieProduct(response);
    }

    private async findOmieProductBySKU(sku: string): Promise<ERPProduct | null> {
        const response = await this.makeOmieRequest("POST", "/produtos/consultar/", {
            codigo_produto: sku,
        });
        return response ? this.mapOmieProduct(response) : null;
    }

    private async createOmieCustomer(request: CreateCustomerRequest): Promise<ERPCustomer> {
        const response = await this.makeOmieRequest("POST", "/clientes/", {
            nome_fantasia: request.name,
            email: request.email,
            telefone1_ddd: request.phone?.substring(0, 2),
            telefone1_numero: request.phone?.substring(2),
            cnpj_cpf: request.document.replace(/\D/g, ""),
            endereco: request.address.street,
            endereco_numero: request.address.number,
            bairro: request.address.neighborhood,
            cidade: request.address.city,
            estado: request.address.state,
            cep: request.address.zipCode.replace(/\D/g, ""),
        });

        return this.mapOmieCustomer(response);
    }

    private async createOmieInvoice(request: CreateInvoiceRequest): Promise<ERPInvoice> {
        const items = request.items.map((item) => ({
            codigo_produto: item.productId,
            quantidade: item.quantity,
            valor_unitario: item.unitPrice,
            valor_total: item.quantity * item.unitPrice,
        }));

        const response = await this.makeOmieRequest("POST", "/produtos/pedido/", {
            cabecalho: {
                codigo_cliente: request.customerId,
                data_previsao: request.dueDate.toISOString().split("T")[0],
                observacoes: request.observations,
            },
            det: items,
        });

        return this.mapOmieInvoice(response);
    }

    private async updateOmieStock(productId: string, quantity: number, operation: string): Promise<ERPStockMovement> {
        // Omie não tem endpoint direto para movimentação de estoque
        // Precisa ser feito via produto
        await this.makeOmieRequest("POST", "/estoque/consultar/", {
            codigo_produto: productId,
        });

        return {
            id: `omie_${Date.now()}`,
            productId,
            type: operation === "add" ? "in" : "out",
            quantity,
            reason: "Atualização via AutoFlow",
            date: new Date(),
            createdAt: new Date(),
        };
    }

    private async processOmieWebhook(webhookData: ERPWebhookData): Promise<any> {
        return {
            processed: true,
            action: webhookData.event,
            entityType: "product",
        };
    }

    // Métodos específicos para ContaAzul
    private async createContaAzulProduct(request: CreateProductRequest): Promise<ERPProduct> {
        const response = await this.makeContaAzulRequest("POST", "/products", {
            name: request.name,
            code: request.sku,
            price: request.price,
            cost: request.cost,
            category_id: request.category,
            stock_quantity: request.stockQuantity,
            unit: request.unit,
        });

        return this.mapContaAzulProduct(response);
    }

    private async findContaAzulProductBySKU(sku: string): Promise<ERPProduct | null> {
        const response = await this.makeContaAzulRequest("GET", `/products?code=${sku}`);
        const product = response.data?.[0];
        return product ? this.mapContaAzulProduct(product) : null;
    }

    private async createContaAzulCustomer(request: CreateCustomerRequest): Promise<ERPCustomer> {
        const response = await this.makeContaAzulRequest("POST", "/customers", {
            name: request.name,
            email: request.email,
            business_phone: request.phone,
            document: request.document.replace(/\D/g, ""),
            person_type: request.customerType === "individual" ? "NATURAL" : "LEGAL",
            address: {
                street: request.address.street,
                number: request.address.number,
                district: request.address.neighborhood,
                city: request.address.city,
                state: request.address.state,
                postal_code: request.address.zipCode.replace(/\D/g, ""),
            },
        });

        return this.mapContaAzulCustomer(response);
    }

    private async createContaAzulInvoice(request: CreateInvoiceRequest): Promise<ERPInvoice> {
        const response = await this.makeContaAzulRequest("POST", "/sales", {
            customer_id: request.customerId,
            payment_terms: request.paymentMethod,
            due_date: request.dueDate.toISOString().split("T")[0],
            notes: request.observations,
            product_services: request.items.map((item) => ({
                product_id: item.productId,
                quantity: item.quantity,
                value: item.unitPrice,
            })),
        });

        return this.mapContaAzulInvoice(response);
    }

    private async updateContaAzulStock(
        productId: string,
        quantity: number,
        operation: string
    ): Promise<ERPStockMovement> {
        const response = await this.makeContaAzulRequest("POST", "/stock_entries", {
            product_id: productId,
            quantity: operation === "subtract" ? -quantity : quantity,
            operation_type: operation === "add" ? "IN" : "OUT",
            description: "Atualização via AutoFlow",
        });

        return {
            id: response.id,
            productId,
            type: operation === "add" ? "in" : "out",
            quantity,
            reason: "Atualização via AutoFlow",
            date: new Date(),
            createdAt: new Date(),
        };
    }

    private async processContaAzulWebhook(webhookData: ERPWebhookData): Promise<any> {
        return {
            processed: true,
            action: webhookData.event,
            entityType: "invoice",
        };
    }

    // Métodos específicos para Bling
    private async createBlingProduct(request: CreateProductRequest): Promise<ERPProduct> {
        const response = await this.makeBlingRequest("POST", "/produto", {
            produto: {
                codigo: request.sku,
                descricao: request.name,
                preco: request.price,
                precoCusto: request.cost,
                categoria: { descricao: request.category },
                unidade: request.unit,
                pesoBruto: 0,
                marca: "",
                estoque: {
                    atual: request.stockQuantity,
                    minimo: 0,
                },
            },
        });

        return this.mapBlingProduct(response);
    }

    private async findBlingProductBySKU(sku: string): Promise<ERPProduct | null> {
        const response = await this.makeBlingRequest("GET", `/produto/${sku}`);
        return response ? this.mapBlingProduct(response) : null;
    }

    private async createBlingCustomer(request: CreateCustomerRequest): Promise<ERPCustomer> {
        const response = await this.makeBlingRequest("POST", "/contato", {
            contato: {
                nome: request.name,
                email: request.email,
                telefone: request.phone,
                cpf_cnpj: request.document.replace(/\D/g, ""),
                endereco: {
                    endereco: request.address.street,
                    numero: request.address.number,
                    bairro: request.address.neighborhood,
                    cidade: request.address.city,
                    uf: request.address.state,
                    cep: request.address.zipCode.replace(/\D/g, ""),
                },
            },
        });

        return this.mapBlingCustomer(response);
    }

    private async createBlingInvoice(request: CreateInvoiceRequest): Promise<ERPInvoice> {
        const response = await this.makeBlingRequest("POST", "/pedido", {
            pedido: {
                cliente: { id: request.customerId },
                data: new Date().toISOString().split("T")[0],
                observacoes: request.observations,
                itens: {
                    item: request.items.map((item) => ({
                        codigo: item.productId,
                        quantidade: item.quantity,
                        valor: item.unitPrice,
                    })),
                },
            },
        });

        return this.mapBlingInvoice(response);
    }

    private async updateBlingStock(productId: string, quantity: number, operation: string): Promise<ERPStockMovement> {
        // Bling não tem endpoint direto para movimentação
        console.log(`Bling stock update: ${productId}, ${quantity}, ${operation}`);

        return {
            id: `bling_${Date.now()}`,
            productId,
            type: operation === "add" ? "in" : "out",
            quantity,
            reason: "Atualização via AutoFlow",
            date: new Date(),
            createdAt: new Date(),
        };
    }

    private async processBlingWebhook(webhookData: ERPWebhookData): Promise<any> {
        return {
            processed: true,
            action: webhookData.event,
            entityType: "order",
        };
    }

    // Métodos auxiliares para chamadas HTTP
    private async makeOmieRequest(method: string, path: string, data?: any): Promise<any> {
        const url = `${this.config.apiUrl}${path}`;
        console.log(`Omie ${method} ${url}`, data);
        return { success: true }; // Mock response
    }

    private async makeContaAzulRequest(method: string, path: string, data?: any): Promise<any> {
        const url = `${this.config.apiUrl}${path}`;
        console.log(`ContaAzul ${method} ${url}`, data);
        return { success: true }; // Mock response
    }

    private async makeBlingRequest(method: string, path: string, data?: any): Promise<any> {
        const url = `${this.config.apiUrl}${path}`;
        console.log(`Bling ${method} ${url}`, data);
        return { success: true }; // Mock response
    }

    // Métodos auxiliares para mapeamento de dados
    private mapOmieProduct(data: any): ERPProduct {
        return {
            id: data.codigo_produto_integração || data.codigo_produto,
            name: data.descricao,
            sku: data.codigo_produto,
            price: data.valor_unitario,
            cost: data.valor_custo,
            category: data.categoria,
            description: data.observacoes,
            stockQuantity: data.estoque_atual || 0,
            unit: data.unidade,
            ncm: data.ncm,
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    private mapOmieCustomer(data: any): ERPCustomer {
        return {
            id: data.codigo_cliente_integração || data.codigo_cliente_omie,
            name: data.nome_fantasia || data.razao_social,
            email: data.email,
            phone: `${data.telefone1_ddd}${data.telefone1_numero}`,
            document: data.cnpj_cpf,
            documentType: data.cnpj_cpf?.length === 11 ? "CPF" : "CNPJ",
            address: {
                street: data.endereco,
                number: data.endereco_numero,
                neighborhood: data.bairro,
                city: data.cidade,
                state: data.estado,
                zipCode: data.cep,
                country: "Brasil",
            },
            customerType: data.cnpj_cpf?.length === 11 ? "individual" : "company",
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    private mapOmieInvoice(data: any): ERPInvoice {
        return {
            id: data.codigo_pedido,
            number: data.numero_pedido,
            series: "1",
            type: "sale",
            status: "draft",
            customerId: data.cabecalho?.codigo_cliente,
            issueDate: new Date(),
            dueDate: new Date(data.cabecalho?.data_previsao),
            totalAmount: data.total_pedido || 0,
            taxAmount: 0,
            netAmount: data.total_pedido || 0,
            items: [],
            taxes: [],
            observations: data.cabecalho?.observacoes,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    private mapContaAzulProduct(data: any): ERPProduct {
        return {
            id: data.id,
            name: data.name,
            sku: data.code,
            price: data.price,
            cost: data.cost,
            category: data.category?.name || "",
            stockQuantity: data.stock_quantity || 0,
            unit: data.unit,
            active: data.status === "ACTIVE",
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
        };
    }

    private mapContaAzulCustomer(data: any): ERPCustomer {
        return {
            id: data.id,
            name: data.name,
            email: data.email,
            phone: data.business_phone,
            document: data.document,
            documentType: data.person_type === "NATURAL" ? "CPF" : "CNPJ",
            address: {
                street: data.address?.street || "",
                number: data.address?.number || "",
                neighborhood: data.address?.district || "",
                city: data.address?.city || "",
                state: data.address?.state || "",
                zipCode: data.address?.postal_code || "",
                country: "Brasil",
            },
            customerType: data.person_type === "NATURAL" ? "individual" : "company",
            active: true,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
        };
    }

    private mapContaAzulInvoice(data: any): ERPInvoice {
        return {
            id: data.id,
            number: data.number || "",
            series: "1",
            type: "sale",
            status: data.status?.toLowerCase() || "draft",
            customerId: data.customer_id,
            issueDate: new Date(data.emission_date || data.created_at),
            dueDate: new Date(data.due_date),
            totalAmount: data.total || 0,
            taxAmount: data.taxes_amount || 0,
            netAmount: data.net_amount || 0,
            items: [],
            taxes: [],
            observations: data.notes,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
        };
    }

    private mapBlingProduct(data: any): ERPProduct {
        const produto = data.produto || data;
        return {
            id: produto.id,
            name: produto.descricao,
            sku: produto.codigo,
            price: produto.preco,
            cost: produto.precoCusto,
            category: produto.categoria?.descricao || "",
            stockQuantity: produto.estoque?.atual || 0,
            unit: produto.unidade,
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    private mapBlingCustomer(data: any): ERPCustomer {
        const contato = data.contato || data;
        return {
            id: contato.id,
            name: contato.nome,
            email: contato.email,
            phone: contato.telefone,
            document: contato.cpf_cnpj,
            documentType: contato.cpf_cnpj?.length === 11 ? "CPF" : "CNPJ",
            address: {
                street: contato.endereco?.endereco || "",
                number: contato.endereco?.numero || "",
                neighborhood: contato.endereco?.bairro || "",
                city: contato.endereco?.cidade || "",
                state: contato.endereco?.uf || "",
                zipCode: contato.endereco?.cep || "",
                country: "Brasil",
            },
            customerType: contato.cpf_cnpj?.length === 11 ? "individual" : "company",
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    private mapBlingInvoice(data: any): ERPInvoice {
        const pedido = data.pedido || data;
        return {
            id: pedido.id || pedido.numero,
            number: pedido.numero || "",
            series: "1",
            type: "sale",
            status: "draft",
            customerId: pedido.cliente?.id,
            issueDate: new Date(pedido.data),
            dueDate: new Date(pedido.data),
            totalAmount: pedido.totals?.total || 0,
            taxAmount: 0,
            netAmount: pedido.totals?.total || 0,
            items: [],
            taxes: [],
            observations: pedido.observacoes,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    // Métodos auxiliares
    private async getPendingFinancialEntries(): Promise<ERPFinancialEntry[]> {
        // Implementar busca de movimentações pendentes
        return [];
    }

    private async markFinancialEntryAsPaid(entryId: string, paidDate: Date): Promise<void> {
        console.log(`Marcando entrada ${entryId} como paga em ${paidDate}`);
    }

    private validateBrazilianDocument(document: string): boolean {
        const cleanDoc = document.replace(/\D/g, "");

        if (cleanDoc.length === 11) {
            return this.validateCPF(cleanDoc);
        } else if (cleanDoc.length === 14) {
            return this.validateCNPJ(cleanDoc);
        }

        return false;
    }

    private validateCPF(cpf: string): boolean {
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
            return false;
        }

        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.charAt(9))) return false;

        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf.charAt(i)) * (11 - i);
        }
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        return remainder === parseInt(cpf.charAt(10));
    }

    private validateCNPJ(cnpj: string): boolean {
        if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
            return false;
        }

        const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

        let sum = 0;
        for (let i = 0; i < 12; i++) {
            sum += parseInt(cnpj.charAt(i)) * weights1[i];
        }
        let remainder = sum % 11;
        const digit1 = remainder < 2 ? 0 : 11 - remainder;

        if (digit1 !== parseInt(cnpj.charAt(12))) return false;

        sum = 0;
        for (let i = 0; i < 13; i++) {
            sum += parseInt(cnpj.charAt(i)) * weights2[i];
        }
        remainder = sum % 11;
        const digit2 = remainder < 2 ? 0 : 11 - remainder;

        return digit2 === parseInt(cnpj.charAt(13));
    }

    private validateConfig(): void {
        if (!this.config.apiKey) {
            throw new Error("API Key é obrigatória");
        }
        if (!this.config.apiUrl) {
            throw new Error("API URL é obrigatória");
        }
    }
}
