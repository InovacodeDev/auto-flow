/**
 * WhatsApp Business API Integration Service
 * Integração oficial com WhatsApp Business API para automações
 */

export interface WhatsAppConfig {
    accessToken: string;
    phoneNumberId: string;
    businessAccountId: string;
    webhookVerifyToken: string;
    apiVersion: string;
}

export interface WhatsAppMessage {
    to: string;
    type: "text" | "template" | "interactive" | "document" | "image" | "audio" | "video";
    text?: {
        body: string;
        preview_url?: boolean;
    };
    template?: {
        name: string;
        language: {
            code: string;
        };
        components?: WhatsAppTemplateComponent[];
    };
    interactive?: WhatsAppInteractive;
    document?: {
        link: string;
        caption?: string;
        filename?: string;
    };
    image?: {
        link: string;
        caption?: string;
    };
}

export interface WhatsAppTemplateComponent {
    type: "header" | "body" | "button";
    parameters?: Array<{
        type: "text" | "currency" | "date_time" | "image" | "document";
        text?: string;
        currency?: {
            fallback_value: string;
            code: string;
            amount_1000: number;
        };
        date_time?: {
            fallback_value: string;
        };
        image?: {
            link: string;
        };
        document?: {
            link: string;
            filename: string;
        };
    }>;
}

export interface WhatsAppInteractive {
    type: "button" | "list";
    header?: {
        type: "text" | "image" | "document" | "video";
        text?: string;
        image?: { link: string };
        document?: { link: string; filename: string };
        video?: { link: string };
    };
    body: {
        text: string;
    };
    footer?: {
        text: string;
    };
    action: {
        buttons?: Array<{
            type: "reply";
            reply: {
                id: string;
                title: string;
            };
        }>;
        button?: string;
        sections?: Array<{
            title: string;
            rows: Array<{
                id: string;
                title: string;
                description?: string;
            }>;
        }>;
    };
}

export interface WhatsAppIncomingMessage {
    messaging_product: string;
    metadata: {
        display_phone_number: string;
        phone_number_id: string;
    };
    contacts: Array<{
        profile: {
            name: string;
        };
        wa_id: string;
    }>;
    messages: Array<{
        from: string;
        id: string;
        timestamp: string;
        type: string;
        text?: {
            body: string;
        };
        interactive?: {
            type: string;
            button_reply?: {
                id: string;
                title: string;
            };
            list_reply?: {
                id: string;
                title: string;
                description?: string;
            };
        };
        button?: {
            text: string;
            payload: string;
        };
    }>;
}

export interface WhatsAppWebhookEvent {
    object: string;
    entry: Array<{
        id: string;
        changes: Array<{
            value: WhatsAppIncomingMessage;
            field: string;
        }>;
    }>;
}

class WhatsAppBusinessService {
    private config: WhatsAppConfig;
    private baseUrl: string;

    constructor(config: WhatsAppConfig) {
        this.config = config;
        this.baseUrl = `https://graph.facebook.com/${config.apiVersion}`;
    }

    /**
     * Enviar mensagem de texto simples
     */
    async sendTextMessage(to: string, message: string, previewUrl = false): Promise<any> {
        const payload: WhatsAppMessage = {
            to: this.formatPhoneNumber(to),
            type: "text",
            text: {
                body: message,
                preview_url: previewUrl,
            },
        };

        return await this.sendMessage(payload);
    }

    /**
     * Enviar template de mensagem
     */
    async sendTemplate(
        to: string,
        templateName: string,
        languageCode = "pt_BR",
        components?: WhatsAppTemplateComponent[]
    ): Promise<any> {
        const payload: WhatsAppMessage = {
            to: this.formatPhoneNumber(to),
            type: "template",
            template: {
                name: templateName,
                language: {
                    code: languageCode,
                },
                ...(components && { components }),
            },
        };

        return await this.sendMessage(payload);
    }

    /**
     * Enviar mensagem interativa com botões
     */
    async sendInteractiveButtons(
        to: string,
        bodyText: string,
        buttons: Array<{ id: string; title: string }>,
        headerText?: string,
        footerText?: string
    ): Promise<any> {
        const interactive: WhatsAppInteractive = {
            type: "button",
            body: { text: bodyText },
            action: {
                buttons: buttons.map((btn) => ({
                    type: "reply",
                    reply: {
                        id: btn.id,
                        title: btn.title,
                    },
                })),
            },
        };

        if (headerText) {
            interactive.header = {
                type: "text",
                text: headerText,
            };
        }

        if (footerText) {
            interactive.footer = { text: footerText };
        }

        const payload: WhatsAppMessage = {
            to: this.formatPhoneNumber(to),
            type: "interactive",
            interactive,
        };

        return await this.sendMessage(payload);
    }

    /**
     * Enviar lista interativa
     */
    async sendInteractiveList(
        to: string,
        bodyText: string,
        buttonText: string,
        sections: Array<{
            title: string;
            rows: Array<{
                id: string;
                title: string;
                description?: string;
            }>;
        }>,
        headerText?: string,
        footerText?: string
    ): Promise<any> {
        const interactive: WhatsAppInteractive = {
            type: "list",
            body: { text: bodyText },
            action: {
                button: buttonText,
                sections,
            },
        };

        if (headerText) {
            interactive.header = {
                type: "text",
                text: headerText,
            };
        }

        if (footerText) {
            interactive.footer = { text: footerText };
        }

        const payload: WhatsAppMessage = {
            to: this.formatPhoneNumber(to),
            type: "interactive",
            interactive,
        };

        return await this.sendMessage(payload);
    }

    /**
     * Enviar documento
     */
    async sendDocument(to: string, documentLink: string, filename: string, caption?: string): Promise<any> {
        const payload: WhatsAppMessage = {
            to: this.formatPhoneNumber(to),
            type: "document",
            document: {
                link: documentLink,
                filename,
                ...(caption && { caption }),
            },
        };

        return await this.sendMessage(payload);
    }

    /**
     * Enviar imagem
     */
    async sendImage(to: string, imageLink: string, caption?: string): Promise<any> {
        const payload: WhatsAppMessage = {
            to: this.formatPhoneNumber(to),
            type: "image",
            image: {
                link: imageLink,
                ...(caption && { caption }),
            },
        };

        return await this.sendMessage(payload);
    }

    /**
     * Método principal para enviar mensagens
     */
    private async sendMessage(payload: WhatsAppMessage): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/${this.config.phoneNumberId}/messages`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.config.accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(`WhatsApp API Error: ${data.error?.message || "Unknown error"}`);
            }

            return data;
        } catch (error) {
            console.error("Error sending WhatsApp message:", error);
            throw error;
        }
    }

    /**
     * Validar webhook do WhatsApp
     */
    verifyWebhook(mode: string, token: string, challenge: string): string | null {
        if (mode === "subscribe" && token === this.config.webhookVerifyToken) {
            return challenge;
        }
        return null;
    }

    /**
     * Processar mensagem recebida via webhook
     */
    processIncomingMessage(webhookData: WhatsAppWebhookEvent): Array<{
        from: string;
        phoneNumberId: string;
        messageId: string;
        timestamp: Date;
        type: string;
        text?: string;
        interactionData?: any;
        contactName?: string;
    }> {
        const processedMessages: any[] = [];

        webhookData.entry.forEach((entry) => {
            entry.changes.forEach((change) => {
                if (change.field === "messages") {
                    const messageData = change.value;

                    messageData.messages?.forEach((message) => {
                        const contact = messageData.contacts?.find((c) => c.wa_id === message.from);

                        const processedMessage: any = {
                            from: message.from,
                            phoneNumberId: messageData.metadata.phone_number_id,
                            messageId: message.id,
                            timestamp: new Date(parseInt(message.timestamp) * 1000),
                            type: message.type,
                            contactName: contact?.profile.name,
                        };

                        // Adicionar conteúdo específico por tipo
                        if (message.text) {
                            processedMessage.text = message.text.body;
                        }

                        if (message.interactive) {
                            processedMessage.interactionData = message.interactive;
                        }

                        if (message.button) {
                            processedMessage.interactionData = message.button;
                        }

                        processedMessages.push(processedMessage);
                    });
                }
            });
        });

        return processedMessages;
    }

    /**
     * Marcar mensagem como lida
     */
    async markAsRead(messageId: string): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/${this.config.phoneNumberId}/messages`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.config.accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messaging_product: "whatsapp",
                    status: "read",
                    message_id: messageId,
                }),
            });

            return await response.json();
        } catch (error) {
            console.error("Error marking message as read:", error);
            throw error;
        }
    }

    /**
     * Obter informações do perfil do usuário
     */
    async getUserProfile(phoneNumber: string): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/${this.formatPhoneNumber(phoneNumber)}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${this.config.accessToken}`,
                },
            });

            return await response.json();
        } catch (error) {
            console.error("Error getting user profile:", error);
            throw error;
        }
    }

    /**
     * Formatar número de telefone para formato internacional
     */
    private formatPhoneNumber(phoneNumber: string): string {
        // Remove caracteres não numéricos
        let formatted = phoneNumber.replace(/\D/g, "");

        // Se o número começa com 0, remove o 0
        if (formatted.startsWith("0")) {
            formatted = formatted.substring(1);
        }

        // Se não tem código do país, adiciona +55 (Brasil)
        if (!formatted.startsWith("55") && formatted.length <= 11) {
            formatted = "55" + formatted;
        }

        return formatted;
    }

    /**
     * Validar configuração do serviço
     */
    validateConfig(): { valid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!this.config.accessToken) {
            errors.push("Access Token é obrigatório");
        }

        if (!this.config.phoneNumberId) {
            errors.push("Phone Number ID é obrigatório");
        }

        if (!this.config.businessAccountId) {
            errors.push("Business Account ID é obrigatório");
        }

        if (!this.config.webhookVerifyToken) {
            errors.push("Webhook Verify Token é obrigatório");
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    }
}

export { WhatsAppBusinessService };
