import { MercadoPagoConfig, Payment, PreApproval } from "mercadopago";

export interface PIXPaymentRequest {
    amount: number;
    description: string;
    payerEmail?: string;
    payerName?: string;
    payerDocument?: string;
    externalReference?: string;
    notificationUrl?: string;
}

export interface PIXPaymentResponse {
    id: string;
    status: "pending" | "approved" | "rejected" | "cancelled";
    qrCode: string;
    qrCodeBase64: string;
    pixKey: string;
    amount: number;
    description: string;
    expirationDate: Date;
    transactionId?: string;
    externalReference?: string;
}

export interface PIXWebhookData {
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
        status?: string;
        external_reference?: string;
        transaction_amount?: number;
    };
}

export interface PIXRefundRequest {
    paymentId: string;
    amount?: number; // Se não informado, estorna o valor total
    reason?: string;
}

export interface PIXRecurringPaymentRequest {
    amount: number;
    description: string;
    frequency: "monthly" | "weekly" | "daily";
    startDate: Date;
    endDate?: Date;
    payerEmail: string;
    maxAmount?: number;
}

/**
 * Serviço para integração com PIX via Mercado Pago
 * Oferece funcionalidades completas para automação de pagamentos PIX
 */
export class PIXService {
    private mercadopago: MercadoPagoConfig;
    private payment: Payment;
    private preApproval: PreApproval;

    constructor() {
        const accessToken = process.env["MERCADO_PAGO_ACCESS_TOKEN"];
        const isDevelopment = process.env["NODE_ENV"] === "development";

        if (!accessToken && !isDevelopment) {
            throw new Error("MERCADO_PAGO_ACCESS_TOKEN é obrigatório");
        }

        // Em desenvolvimento, usar token de teste ou mock
        const token = accessToken || "TEST_TOKEN_DEVELOPMENT";

        this.mercadopago = new MercadoPagoConfig({
            accessToken: token,
            options: {
                timeout: 5000,
                idempotencyKey: this.generateIdempotencyKey(),
            },
        });

        this.payment = new Payment(this.mercadopago);
        this.preApproval = new PreApproval(this.mercadopago);
    }

    /**
     * Cria uma cobrança PIX
     */
    async createPIXPayment(request: PIXPaymentRequest): Promise<PIXPaymentResponse> {
        try {
            console.log("Criando pagamento PIX:", request);

            const paymentData: any = {
                transaction_amount: request.amount,
                description: request.description,
                payment_method_id: "pix",
                payer: {
                    email: request.payerEmail,
                    first_name: request.payerName,
                    identification: request.payerDocument
                        ? {
                              type: this.getDocumentType(request.payerDocument),
                              number: request.payerDocument.replace(/\D/g, ""),
                          }
                        : undefined,
                },
                metadata: {
                    integration_type: "autoflow_pix",
                    created_at: new Date().toISOString(),
                },
            };

            // Adiciona propriedades opcionais apenas se definidas
            if (request.externalReference) {
                paymentData.external_reference = request.externalReference;
            }
            if (request.notificationUrl) {
                paymentData.notification_url = request.notificationUrl;
            }

            const payment = await this.payment.create({ body: paymentData });

            console.log("Pagamento PIX criado:", payment);

            if (!payment.point_of_interaction?.transaction_data) {
                throw new Error("Falha ao gerar dados PIX");
            }

            const qrCode = payment.point_of_interaction.transaction_data.qr_code;
            const qrCodeBase64 = payment.point_of_interaction.transaction_data.qr_code_base64;

            // Calcular data de expiração (24 horas por padrão para PIX)
            const expirationDate = new Date();
            expirationDate.setHours(expirationDate.getHours() + 24);

            return {
                id: payment.id!.toString(),
                status: this.mapPaymentStatus(payment.status!),
                qrCode: qrCode!,
                qrCodeBase64: qrCodeBase64!,
                pixKey: qrCode!, // PIX code é a chave para o pagamento
                amount: request.amount,
                description: request.description,
                expirationDate,
                ...(request.externalReference && { externalReference: request.externalReference }),
            };
        } catch (error) {
            console.error("Erro ao criar pagamento PIX:", error);
            throw new Error(
                `Falha ao criar pagamento PIX: ${error instanceof Error ? error.message : "Erro desconhecido"}`
            );
        }
    }

    // Backwards-compatible alias for older tests
    async createPayment(request: PIXPaymentRequest): Promise<PIXPaymentResponse> {
        return this.createPIXPayment(request);
    }

    /**
     * Consulta o status de um pagamento PIX
     */
    async getPaymentStatus(paymentId: string): Promise<PIXPaymentResponse | null> {
        try {
            console.log("Consultando status do pagamento:", paymentId);

            const payment = await this.payment.get({ id: paymentId });

            if (!payment) {
                return null;
            }

            return {
                id: payment.id!.toString(),
                status: this.mapPaymentStatus(payment.status!),
                qrCode: payment.point_of_interaction?.transaction_data?.qr_code || "",
                qrCodeBase64: payment.point_of_interaction?.transaction_data?.qr_code_base64 || "",
                pixKey: payment.point_of_interaction?.transaction_data?.qr_code || "",
                amount: payment.transaction_amount!,
                description: payment.description!,
                expirationDate: new Date(payment.date_of_expiration!),
                transactionId: payment.id!.toString(),
                ...(payment.external_reference && { externalReference: payment.external_reference }),
            };
        } catch (error) {
            console.error("Erro ao consultar pagamento:", error);
            throw new Error(
                `Falha ao consultar pagamento: ${error instanceof Error ? error.message : "Erro desconhecido"}`
            );
        }
    }

    /**
     * Processa webhook do Mercado Pago
     */
    async processWebhook(webhookData: PIXWebhookData): Promise<{
        paymentId: string;
        status: string;
        processedAt: Date;
        processed: boolean;
    }> {
        try {
            console.log("Processando webhook PIX:", webhookData);

            // Verifica se é um evento de pagamento
            if (webhookData.type !== "payment") {
                throw new Error("Tipo de webhook não suportado");
            }

            const paymentId = webhookData.data.id;
            const paymentDetails = await this.getPaymentStatus(paymentId);

            if (!paymentDetails) {
                throw new Error("Pagamento não encontrado");
            }

            // Aqui você pode adicionar lógica para:
            // - Atualizar status no banco de dados
            // - Disparar workflows automáticos
            // - Enviar notificações via WhatsApp
            // - Conciliar com sistemas ERP

            return {
                paymentId,
                status: paymentDetails.status,
                processedAt: new Date(),
                processed: true,
            };
        } catch (error) {
            console.error("Erro ao processar webhook:", error);
            throw new Error(
                `Falha ao processar webhook: ${error instanceof Error ? error.message : "Erro desconhecido"}`
            );
        }
    }

    /**
     * Estorna um pagamento PIX (parcial ou total)
     */
    async refundPayment(request: PIXRefundRequest): Promise<{
        refundId: string;
        status: string;
        amount: number;
    }> {
        try {
            console.log("Processando estorno PIX:", request);

            // Note: PIX não permite estorno direto via API
            // Esta funcionalidade seria mais para controle interno
            // O estorno PIX deve ser feito manualmente via interface do Mercado Pago

            console.warn("PIX não suporta estorno automático. Use a interface do Mercado Pago para estornos manuais.");

            throw new Error("PIX não suporta estorno automático via API. Use a interface do Mercado Pago.");
        } catch (error) {
            console.error("Erro ao processar estorno:", error);
            throw error;
        }
    }

    /**
     * Cria um pagamento recorrente usando Pre-approval
     */
    async createRecurringPayment(request: PIXRecurringPaymentRequest): Promise<{
        preApprovalId: string;
        status: string;
        nextPaymentDate: Date;
    }> {
        try {
            console.log("Criando pagamento recorrente:", request);

            const autoRecurring: any = {
                frequency: 1,
                frequency_type: request.frequency,
                transaction_amount: request.amount,
                currency_id: "BRL",
                start_date: request.startDate.toISOString(),
            };

            // Adiciona end_date apenas se definida
            if (request.endDate) {
                autoRecurring.end_date = request.endDate.toISOString();
            }

            const preApprovalData: any = {
                reason: request.description,
                auto_recurring: autoRecurring,
                payer_email: request.payerEmail,
                back_url: process.env["FRONTEND_URL"] || "https://autoflow.com.br",
                status: "pending",
            };

            const preApproval = await this.preApproval.create({ body: preApprovalData });

            console.log("Pagamento recorrente criado:", preApproval);

            const nextPaymentDate = new Date(request.startDate);
            if (request.frequency === "monthly") {
                nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
            } else if (request.frequency === "weekly") {
                nextPaymentDate.setDate(nextPaymentDate.getDate() + 7);
            } else if (request.frequency === "daily") {
                nextPaymentDate.setDate(nextPaymentDate.getDate() + 1);
            }

            return {
                preApprovalId: preApproval.id!,
                status: preApproval.status!,
                nextPaymentDate,
            };
        } catch (error) {
            console.error("Erro ao criar pagamento recorrente:", error);
            throw new Error(
                `Falha ao criar pagamento recorrente: ${error instanceof Error ? error.message : "Erro desconhecido"}`
            );
        }
    }

    /**
     * Gera link de pagamento PIX
     */
    generatePaymentLink(paymentId: string): string {
        return `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=${paymentId}`;
    }

    /**
     * Valida CPF/CNPJ brasileiro
     */
    validateBrazilianDocument(document: string): boolean {
        const cleanDoc = document.replace(/\D/g, "");

        if (cleanDoc.length === 11) {
            return this.validateCPF(cleanDoc);
        } else if (cleanDoc.length === 14) {
            return this.validateCNPJ(cleanDoc);
        }

        return false;
    }

    /**
     * Formata valor para exibição em reais
     */
    formatCurrency(amount: number): string {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(amount);
    }

    // Métodos auxiliares privados
    private generateIdempotencyKey(): string {
        return `autoflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private mapPaymentStatus(mpStatus: string): "pending" | "approved" | "rejected" | "cancelled" {
        switch (mpStatus) {
            case "pending":
            case "in_process":
                return "pending";
            case "approved":
                return "approved";
            case "rejected":
                return "rejected";
            case "cancelled":
                return "cancelled";
            default:
                return "pending";
        }
    }

    private getDocumentType(document: string): "CPF" | "CNPJ" {
        const cleanDoc = document.replace(/\D/g, "");
        return cleanDoc.length === 11 ? "CPF" : "CNPJ";
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
}
