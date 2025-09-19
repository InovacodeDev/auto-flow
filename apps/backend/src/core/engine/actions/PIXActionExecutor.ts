import { BaseActionExecutor } from "./BaseActionExecutor";
import { NodeExecutionResult, ExecutionContext, NodeInput, NodeOutput } from "../types";

interface PIXConfig {
    accessToken: string;
    publicKey: string;
    userId: string;
    environment: "sandbox" | "production";
    webhookUrl?: string;
    notificationUrl?: string;
}

interface PIXPaymentRequest {
    transaction_amount: number;
    description: string;
    payment_method_id: "pix";
    payer: {
        email: string;
        first_name?: string;
        last_name?: string;
        identification?: {
            type: "CPF" | "CNPJ";
            number: string;
        };
    };
    notification_url?: string;
    external_reference?: string;
    metadata?: Record<string, any>;
}

interface PIXPaymentResponse {
    id: string;
    status:
        | "pending"
        | "approved"
        | "authorized"
        | "in_process"
        | "in_mediation"
        | "rejected"
        | "cancelled"
        | "refunded"
        | "charged_back";
    status_detail: string;
    date_created: string;
    date_last_updated: string;
    money_release_date?: string;
    currency_id: string;
    transaction_amount: number;
    net_received_amount?: number;
    total_paid_amount?: number;
    shipping_cost?: number;
    coupon_amount?: number;
    description: string;
    external_reference?: string;
    payment_method_id: string;
    payment_type_id: string;
    payer: {
        id?: string;
        email: string;
        identification?: {
            type: string;
            number: string;
        };
        type?: string;
    };
    point_of_interaction?: {
        transaction_data?: {
            qr_code_base64?: string;
            qr_code?: string;
            ticket_url?: string;
        };
    };
    notification_url?: string;
    metadata?: Record<string, any>;
}

/**
 * PIX Payment Action Executor
 *
 * Integração completa com PIX para pagamentos instantâneos brasileiros.
 * Suporte ao Mercado Pago e Banco Central do Brasil.
 *
 * Funcionalidades:
 * - Criação de pagamentos PIX
 * - Geração de QR Code
 * - Consulta de status de pagamento
 * - Estorno de pagamentos
 * - Webhooks para notificações
 * - Validação de CPF/CNPJ
 * - Formatação de valores monetários brasileiros
 */
export class PIXActionExecutor extends BaseActionExecutor {
    readonly type = "pix_payment";
    readonly name = "PIX Payment";
    readonly description = "Pagamentos PIX instantâneos para PMEs brasileiras";
    readonly category = "payment";
    readonly icon = "pix";
    readonly color = "#00b4d8";

    readonly inputs: NodeInput[] = [
        {
            name: "action",
            type: "string",
            required: true,
            description: "Ação a ser executada",
            validation: {
                enum: ["createPayment", "getPayment", "refundPayment", "getQRCode", "checkStatus"],
            },
        },
        {
            name: "amount",
            type: "number",
            required: false,
            description: "Valor do pagamento em reais",
            validation: {
                min: 0.01,
                max: 100000,
            },
        },
        {
            name: "description",
            type: "string",
            required: false,
            description: "Descrição do pagamento",
        },
        {
            name: "payerEmail",
            type: "string",
            required: false,
            description: "Email do pagador",
        },
        {
            name: "payerDocument",
            type: "string",
            required: false,
            description: "CPF ou CNPJ do pagador",
        },
        {
            name: "paymentId",
            type: "string",
            required: false,
            description: "ID do pagamento (para consultas)",
        },
        {
            name: "externalReference",
            type: "string",
            required: false,
            description: "Referência externa do sistema",
        },
    ];

    readonly outputs: NodeOutput[] = [
        {
            name: "paymentId",
            type: "string",
            description: "ID do pagamento criado",
        },
        {
            name: "status",
            type: "string",
            description: "Status do pagamento",
        },
        {
            name: "qrCode",
            type: "string",
            description: "QR Code para pagamento",
        },
        {
            name: "qrCodeBase64",
            type: "string",
            description: "QR Code em base64",
        },
        {
            name: "amount",
            type: "number",
            description: "Valor do pagamento",
        },
        {
            name: "pixKey",
            type: "string",
            description: "Chave PIX gerada",
        },
        {
            name: "expirationDate",
            type: "string",
            description: "Data de expiração do pagamento",
        },
    ];

    private config: PIXConfig;
    private readonly baseUrl = "https://api.mercadopago.com/v1";

    constructor(config: PIXConfig) {
        super();
        this.config = config;
    }

    protected getRequiredConfigFields(): string[] {
        return ["accessToken", "publicKey", "userId"];
    }

    protected validateCustomConfig(config: Record<string, any>): string[] {
        const errors: string[] = [];

        if (config["accessToken"] && typeof config["accessToken"] !== "string") {
            errors.push("accessToken deve ser uma string");
        }

        if (config["publicKey"] && typeof config["publicKey"] !== "string") {
            errors.push("publicKey deve ser uma string");
        }

        if (config["environment"] && !["sandbox", "production"].includes(config["environment"])) {
            errors.push('environment deve ser "sandbox" ou "production"');
        }

        return errors;
    }

    protected async executeAction(
        config: Record<string, any>,
        inputs: Record<string, any>,
        context: ExecutionContext
    ): Promise<Record<string, any>> {
        // Atualizar configuração local
        this.config = {
            accessToken: config["accessToken"],
            publicKey: config["publicKey"],
            userId: config["userId"],
            environment: config["environment"] || "sandbox",
            webhookUrl: config["webhookUrl"],
            notificationUrl: config["notificationUrl"],
        };

        const action = inputs["action"] as string;

        context.logs.push({
            timestamp: new Date(),
            level: "info",
            component: "PIX",
            message: `Executando ação PIX: ${action}`,
            data: { action, amount: inputs["amount"] },
        });

        const result = await this.executePIXAction(action, inputs, context);
        return result.data || {};
    }

    private async executePIXAction(
        action: string,
        inputs: Record<string, any>,
        context: ExecutionContext
    ): Promise<NodeExecutionResult> {
        switch (action) {
            case "createPayment":
                return await this.createPayment(inputs, context);
            case "getPayment":
                return await this.getPayment(inputs, context);
            case "refundPayment":
                return await this.refundPayment(inputs, context);
            case "getQRCode":
                return await this.getQRCode(inputs, context);
            case "checkStatus":
                return await this.checkStatus(inputs, context);
            default:
                throw new Error(`Ação PIX não suportada: ${action}`);
        }
    }

    /**
     * Cria um novo pagamento PIX
     */
    private async createPayment(inputs: Record<string, any>, context: ExecutionContext): Promise<NodeExecutionResult> {
        const amount = inputs["amount"] as number;
        const description = inputs["description"] as string;
        const payerEmail = inputs["payerEmail"] as string;
        const payerDocument = inputs["payerDocument"] as string;
        const externalReference = inputs["externalReference"] as string;

        if (!amount || !description || !payerEmail) {
            throw new Error("Campos obrigatórios: amount, description, payerEmail");
        }

        // Validar CPF/CNPJ se fornecido
        if (payerDocument && !this.validateCPForCNPJ(payerDocument)) {
            throw new Error("CPF ou CNPJ inválido");
        }

        const paymentRequest: PIXPaymentRequest = {
            transaction_amount: amount,
            description,
            payment_method_id: "pix",
            payer: {
                email: payerEmail,
                ...(payerDocument && {
                    identification: {
                        type: this.getDocumentType(payerDocument),
                        number: this.cleanDocument(payerDocument),
                    },
                }),
            },
            ...(this.config.notificationUrl && { notification_url: this.config.notificationUrl }),
            ...(externalReference && { external_reference: externalReference }),
        };

        const payment = await this.makeAPIRequest("/payments", "POST", paymentRequest, context);

        return {
            success: true,
            data: {
                paymentId: payment.id,
                status: payment.status,
                qrCode: payment.point_of_interaction?.transaction_data?.qr_code,
                qrCodeBase64: payment.point_of_interaction?.transaction_data?.qr_code_base64,
                amount: payment.transaction_amount,
                description: payment.description,
                dateCreated: payment.date_created,
                externalReference: payment.external_reference,
                timestamp: new Date().toISOString(),
            },
        };
    }

    /**
     * Consulta um pagamento existente
     */
    private async getPayment(inputs: Record<string, any>, context: ExecutionContext): Promise<NodeExecutionResult> {
        const paymentId = inputs["paymentId"] as string;

        if (!paymentId) {
            throw new Error("Campo obrigatório: paymentId");
        }

        const payment = await this.makeAPIRequest(`/payments/${paymentId}`, "GET", null, context);

        return {
            success: true,
            data: {
                paymentId: payment.id,
                status: payment.status,
                statusDetail: payment.status_detail,
                amount: payment.transaction_amount,
                netAmount: payment.net_received_amount,
                description: payment.description,
                dateCreated: payment.date_created,
                dateLastUpdated: payment.date_last_updated,
                externalReference: payment.external_reference,
                paymentMethod: payment.payment_method_id,
                payer: payment.payer,
                timestamp: new Date().toISOString(),
            },
        };
    }

    /**
     * Processa estorno de pagamento PIX
     */
    private async refundPayment(inputs: Record<string, any>, context: ExecutionContext): Promise<NodeExecutionResult> {
        const paymentId = inputs["paymentId"] as string;
        const amount = inputs["amount"] as number;

        if (!paymentId) {
            throw new Error("Campo obrigatório: paymentId");
        }

        const refundData: any = {};
        if (amount) {
            refundData.amount = amount;
        }

        const refund = await this.makeAPIRequest(`/payments/${paymentId}/refunds`, "POST", refundData, context);

        return {
            success: true,
            data: {
                refundId: refund.id,
                paymentId: paymentId,
                amount: refund.amount,
                status: refund.status,
                dateCreated: refund.date_created,
                timestamp: new Date().toISOString(),
            },
        };
    }

    /**
     * Gera QR Code para pagamento
     */
    private async getQRCode(inputs: Record<string, any>, context: ExecutionContext): Promise<NodeExecutionResult> {
        const paymentId = inputs["paymentId"] as string;

        if (!paymentId) {
            throw new Error("Campo obrigatório: paymentId");
        }

        const payment = await this.makeAPIRequest(`/payments/${paymentId}`, "GET", null, context);

        if (!payment.point_of_interaction?.transaction_data?.qr_code) {
            throw new Error("QR Code não disponível para este pagamento");
        }

        return {
            success: true,
            data: {
                paymentId: payment.id,
                qrCode: payment.point_of_interaction.transaction_data.qr_code,
                qrCodeBase64: payment.point_of_interaction.transaction_data.qr_code_base64,
                amount: payment.transaction_amount,
                status: payment.status,
                timestamp: new Date().toISOString(),
            },
        };
    }

    /**
     * Verifica status de pagamento
     */
    private async checkStatus(inputs: Record<string, any>, context: ExecutionContext): Promise<NodeExecutionResult> {
        const paymentId = inputs["paymentId"] as string;

        if (!paymentId) {
            throw new Error("Campo obrigatório: paymentId");
        }

        const payment = await this.makeAPIRequest(`/payments/${paymentId}`, "GET", null, context);

        return {
            success: true,
            data: {
                paymentId: payment.id,
                status: payment.status,
                statusDetail: payment.status_detail,
                isPaid: payment.status === "approved",
                isPending: payment.status === "pending",
                isRejected: payment.status === "rejected",
                dateLastUpdated: payment.date_last_updated,
                timestamp: new Date().toISOString(),
            },
        };
    }

    /**
     * Faz requisição para API do Mercado Pago
     */
    private async makeAPIRequest(
        endpoint: string,
        method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
        data: any = null,
        context: ExecutionContext
    ): Promise<any> {
        const url = `${this.baseUrl}${endpoint}`;

        const options: RequestInit = {
            method,
            headers: {
                Authorization: `Bearer ${this.config.accessToken}`,
                "Content-Type": "application/json",
                "X-Idempotency-Key": `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            },
            ...(data && { body: JSON.stringify(data) }),
        };

        context.logs.push({
            timestamp: new Date(),
            level: "debug",
            component: "PIX",
            message: `PIX API Request: ${method} ${endpoint}`,
            data: { method, endpoint, hasData: !!data },
        });

        const response = await fetch(url, options);
        const result = await response.json();

        if (!response.ok) {
            const errorMessage = result.message || result.error || response.statusText;
            throw new Error(`PIX API Error: ${errorMessage}`);
        }

        context.logs.push({
            timestamp: new Date(),
            level: "debug",
            component: "PIX",
            message: `PIX API Response received`,
            data: { status: response.status, paymentId: result.id },
        });

        return result;
    }

    /**
     * Valida CPF ou CNPJ
     */
    private validateCPForCNPJ(document: string): boolean {
        const cleanDoc = this.cleanDocument(document);

        if (cleanDoc.length === 11) {
            return this.validateCPFDocument(cleanDoc);
        } else if (cleanDoc.length === 14) {
            return this.validateCNPJDocument(cleanDoc);
        }

        return false;
    }

    /**
     * Valida CPF
     */
    private validateCPFDocument(cpf: string): boolean {
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

    /**
     * Valida CNPJ
     */
    private validateCNPJDocument(cnpj: string): boolean {
        if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
            return false;
        }

        let length = cnpj.length - 2;
        let numbers = cnpj.substring(0, length);
        const digits = cnpj.substring(length);
        let sum = 0;
        let pos = length - 7;

        for (let i = length; i >= 1; i--) {
            sum += parseInt(numbers.charAt(length - i)) * pos--;
            if (pos < 2) pos = 9;
        }

        let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
        if (result !== parseInt(digits.charAt(0))) return false;

        length = length + 1;
        numbers = cnpj.substring(0, length);
        sum = 0;
        pos = length - 7;
        for (let i = length; i >= 1; i--) {
            sum += parseInt(numbers.charAt(length - i)) * pos--;
            if (pos < 2) pos = 9;
        }

        result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
        return result === parseInt(digits.charAt(1));
    }

    /**
     * Remove caracteres especiais do documento
     */
    private cleanDocument(document: string): string {
        return document.replace(/\D/g, "");
    }

    /**
     * Determina o tipo de documento
     */
    private getDocumentType(document: string): "CPF" | "CNPJ" {
        const cleanDoc = this.cleanDocument(document);
        return cleanDoc.length === 11 ? "CPF" : "CNPJ";
    }

    /**
     * Valida conexão com API do Mercado Pago
     */
    async validateAPIConnection(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/users/me`, {
                headers: {
                    Authorization: `Bearer ${this.config.accessToken}`,
                },
            });

            return response.ok;
        } catch (error) {
            return false;
        }
    }
}
