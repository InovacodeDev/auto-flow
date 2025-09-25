import {
    WhatsAppConfig,
    WhatsAppMessage,
    MessageResult,
    ValidationResult,
    IntegrationAction,
    ActionResult,
    AutoFlowError,
} from "../../core/types";
import { Integration } from "../../core/integrations/base";

/**
 * WhatsApp Business API Integration
 * Implements WhatsApp messaging capabilities for AutoFlow workflows
 */
export class WhatsAppIntegration extends Integration {
    private config: WhatsAppConfig;

    constructor(config: WhatsAppConfig, organizationId: string) {
        super(config.apiKey, "https://graph.facebook.com/v18.0", organizationId);
        this.config = config;
    }

    async authenticate(): Promise<boolean> {
        try {
            const response = await this.makeRequest(`/${this.config.phoneNumberId}`, "GET");

            await this.logActivity("authenticate", true, {
                phoneNumberId: this.config.phoneNumberId,
            });

            return !!response.id;
        } catch (error) {
            await this.logActivity("authenticate", false, { error });
            return false;
        }
    }

    async validateConfig(): Promise<ValidationResult> {
        const requiredFields = ["apiKey", "phoneNumberId", "businessAccountId"];
        const baseValidation = this.validateRequiredFields(this.config, requiredFields);

        if (!baseValidation.isValid) {
            return baseValidation;
        }

        // Test connection
        const isConnected = await this.testConnection();
        if (!isConnected) {
            return {
                isValid: false,
                errors: ["Unable to connect to WhatsApp Business API"],
            };
        }

        return { isValid: true };
    }

    async testConnection(): Promise<boolean> {
        return await this.authenticate();
    }

    getAvailableActions(): string[] {
        return ["send_text_message", "send_template_message", "send_media_message", "mark_as_read"];
    }

    async execute(action: IntegrationAction): Promise<ActionResult> {
        try {
            switch (action.type) {
                case "send_text_message":
                    return await this.sendTextMessage(action.payload["to"], action.payload["message"]);

                case "send_template_message":
                    return await this.sendTemplateMessage(
                        action.payload["to"],
                        action.payload["templateName"],
                        action.payload["parameters"]
                    );

                default:
                    throw new AutoFlowError(
                        `Unsupported WhatsApp action: ${action.type}`,
                        "WHATSAPP_UNSUPPORTED_ACTION"
                    );
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
     * Send a text message via WhatsApp
     */
    // Backwards-compatible sendMessage: supports either (to, message) or a single payload object
    async sendMessage(
        toOrPayload: string | { to: string; body: string },
        maybeMessage?: string
    ): Promise<MessageResult> {
        let to: string;
        let message: string;

        if (typeof toOrPayload === "string") {
            to = toOrPayload;
            message = maybeMessage || "";
        } else {
            to = toOrPayload.to;
            message = (toOrPayload as any).body || "";
        }

        const result = await this.sendTextMessage(to, message);
        return {
            success: result.success,
            messageId: result.data?.messages?.[0]?.id,
            ...(result.error && { error: result.error }),
        };
    }

    private async sendTextMessage(to: string, message: string): Promise<ActionResult> {
        try {
            const payload = {
                messaging_product: "whatsapp",
                to: to,
                type: "text",
                text: {
                    body: message,
                },
            };

            const response = await this.makeRequest(`/${this.config.phoneNumberId}/messages`, "POST", payload);

            await this.logActivity("send_text_message", true, {
                to,
                messageId: response.messages?.[0]?.id,
            });

            return {
                success: true,
                data: response,
                metadata: {
                    to,
                    messageType: "text",
                    messageId: response.messages?.[0]?.id,
                },
            };
        } catch (error) {
            throw new AutoFlowError("Failed to send WhatsApp message", "WHATSAPP_SEND_ERROR", {
                to,
                message,
                originalError: error,
            });
        }
    }

    private async sendTemplateMessage(to: string, templateName: string, parameters: any[]): Promise<ActionResult> {
        try {
            const payload = {
                messaging_product: "whatsapp",
                to: to,
                type: "template",
                template: {
                    name: templateName,
                    language: {
                        code: "pt_BR",
                    },
                    components:
                        parameters.length > 0
                            ? [
                                  {
                                      type: "body",
                                      parameters: parameters.map((param) => ({
                                          type: "text",
                                          text: param,
                                      })),
                                  },
                              ]
                            : [],
                },
            };

            const response = await this.makeRequest(`/${this.config.phoneNumberId}/messages`, "POST", payload);

            await this.logActivity("send_template_message", true, {
                to,
                templateName,
                messageId: response.messages?.[0]?.id,
            });

            return {
                success: true,
                data: response,
                metadata: {
                    to,
                    messageType: "template",
                    templateName,
                    messageId: response.messages?.[0]?.id,
                },
            };
        } catch (error) {
            throw new AutoFlowError("Failed to send WhatsApp template message", "WHATSAPP_TEMPLATE_ERROR", {
                to,
                templateName,
                originalError: error,
            });
        }
    }

    /**
     * Process incoming WhatsApp webhook
     */
    async processWebhook(payload: any): Promise<WhatsAppMessage[]> {
        const messages: WhatsAppMessage[] = [];

        if (payload.entry) {
            for (const entry of payload.entry) {
                if (entry.changes) {
                    for (const change of entry.changes) {
                        if (change.value?.messages) {
                            for (const message of change.value.messages) {
                                messages.push({
                                    from: message.from,
                                    to: this.config.phoneNumberId,
                                    body: message.text?.body || "",
                                    type: message.type || "text",
                                    timestamp: message.timestamp,
                                });
                            }
                        }
                    }
                }
            }
        }

        await this.logActivity("process_webhook", true, {
            messagesCount: messages.length,
        });

        return messages;
    }
}
