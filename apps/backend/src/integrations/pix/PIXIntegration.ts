import {
    PIXConfig,
    ValidationResult,
    IntegrationAction,
    ActionResult,
    AutoFlowError,
    PaymentResult,
} from "../../core/types";
import { Integration } from "../../core/integrations/base";

/**
 * PIX Integration for Mercado Pago
 * Implements PIX payment capabilities for AutoFlow workflows
 */
export class PIXIntegration extends Integration {
    private config: PIXConfig;

    constructor(config: PIXConfig, organizationId: string) {
        super(config.accessToken, "https://api.mercadopago.com", organizationId);
        this.config = config;
    }

    async authenticate(): Promise<boolean> {
        try {
            const response = await this.makeRequest("/v1/account/settings", "GET", undefined, {
                Authorization: `Bearer ${this.config.accessToken}`,
            });

            await this.logActivity("authenticate", true, {
                userId: this.config.userId,
            });

            return !!response.id;
        } catch (error) {
            await this.logActivity("authenticate", false, { error });
            return false;
        }
    }

    async validateConfig(): Promise<ValidationResult> {
        const requiredFields = ["accessToken", "userId"];
        const baseValidation = this.validateRequiredFields(this.config, requiredFields);

        if (!baseValidation.isValid) {
            return baseValidation;
        }

        // Test connection
        const isConnected = await this.testConnection();
        if (!isConnected) {
            return {
                isValid: false,
                errors: ["Unable to connect to Mercado Pago API"],
            };
        }

        return { isValid: true };
    }

    async testConnection(): Promise<boolean> {
        return await this.authenticate();
    }

    getAvailableActions(): string[] {
        return ["create_pix_payment", "check_payment_status", "refund_payment"];
    }

    async execute(action: IntegrationAction): Promise<ActionResult> {
        try {
            switch (action.type) {
                case "create_pix_payment":
                    return await this.createPixPayment(
                        action.payload["amount"],
                        action.payload["description"],
                        action.payload["externalReference"]
                    );

                case "check_payment_status":
                    return await this.checkPaymentStatus(action.payload["paymentId"]);

                case "refund_payment":
                    return await this.refundPayment(action.payload["paymentId"]);

                default:
                    throw new AutoFlowError(`Unsupported PIX action: ${action.type}`, "PIX_UNSUPPORTED_ACTION");
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
     * Create PIX payment
     */
    async createPixPayment(amount: number, description: string, externalReference?: string): Promise<ActionResult> {
        try {
            const payload = {
                transaction_amount: amount,
                description,
                payment_method_id: "pix",
                payer: {
                    email: "customer@email.com", // TODO: Get from workflow context
                },
                external_reference: externalReference,
                notification_url: `${process.env["FRONTEND_URL"]}/api/integrations/pix/webhook`,
            };

            const response = await this.makeRequest("/v1/payments", "POST", payload, {
                Authorization: `Bearer ${this.config.accessToken}`,
                "Content-Type": "application/json",
            });

            await this.logActivity("create_pix_payment", true, {
                paymentId: response.id,
                amount,
                status: response.status,
            });

            return {
                success: true,
                data: {
                    paymentId: response.id,
                    status: response.status,
                    qrCode: response.point_of_interaction?.transaction_data?.qr_code,
                    qrCodeBase64: response.point_of_interaction?.transaction_data?.qr_code_base64,
                    ticketUrl: response.point_of_interaction?.transaction_data?.ticket_url,
                },
                metadata: {
                    paymentId: response.id,
                    amount,
                    description,
                    externalReference,
                },
            };
        } catch (error) {
            throw new AutoFlowError("Failed to create PIX payment", "PIX_CREATE_ERROR", {
                amount,
                description,
                originalError: error,
            });
        }
    }

    /**
     * Check payment status
     */
    async checkPaymentStatus(paymentId: string): Promise<ActionResult> {
        try {
            const response = await this.makeRequest(`/v1/payments/${paymentId}`, "GET", undefined, {
                Authorization: `Bearer ${this.config.accessToken}`,
            });

            await this.logActivity("check_payment_status", true, {
                paymentId,
                status: response.status,
            });

            return {
                success: true,
                data: {
                    paymentId: response.id,
                    status: response.status,
                    statusDetail: response.status_detail,
                    amount: response.transaction_amount,
                    dateCreated: response.date_created,
                    dateApproved: response.date_approved,
                },
                metadata: {
                    paymentId,
                    status: response.status,
                },
            };
        } catch (error) {
            throw new AutoFlowError("Failed to check PIX payment status", "PIX_STATUS_ERROR", {
                paymentId,
                originalError: error,
            });
        }
    }

    /**
     * Refund payment
     */
    async refundPayment(paymentId: string): Promise<ActionResult> {
        try {
            const response = await this.makeRequest(
                `/v1/payments/${paymentId}/refunds`,
                "POST",
                {},
                {
                    Authorization: `Bearer ${this.config.accessToken}`,
                    "Content-Type": "application/json",
                }
            );

            await this.logActivity("refund_payment", true, {
                paymentId,
                refundId: response.id,
            });

            return {
                success: true,
                data: {
                    refundId: response.id,
                    status: response.status,
                    amount: response.amount,
                },
                metadata: {
                    paymentId,
                    refundId: response.id,
                },
            };
        } catch (error) {
            throw new AutoFlowError("Failed to refund PIX payment", "PIX_REFUND_ERROR", {
                paymentId,
                originalError: error,
            });
        }
    }

    /**
     * Process PIX webhook notification
     */
    async processWebhook(payload: any): Promise<PaymentResult[]> {
        const results: PaymentResult[] = [];

        try {
            // Mercado Pago webhook format
            if (payload.type === "payment") {
                const paymentId = payload.data?.id;
                if (paymentId) {
                    const statusResult = await this.checkPaymentStatus(paymentId);
                    if (statusResult.success) {
                        results.push({
                            paymentId,
                            status: statusResult.data.status,
                            amount: statusResult.data.amount,
                            statusDetail: statusResult.data.statusDetail,
                        });
                    }
                }
            }

            await this.logActivity("process_webhook", true, {
                paymentsProcessed: results.length,
            });

            return results;
        } catch (error) {
            await this.logActivity("process_webhook", false, { error });
            return results;
        }
    }
}
