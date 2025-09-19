import {
    CRMConfig,
    CRMContact,
    CRMEvent,
    ValidationResult,
    IntegrationAction,
    ActionResult,
    AutoFlowError,
} from "../../core/types";
import { Integration } from "../../core/integrations/base";

/**
 * RD Station CRM Integration
 * Implements RD Station capabilities for AutoFlow workflows
 */
export class RDStationIntegration extends Integration {
    private config: CRMConfig;

    constructor(config: CRMConfig, organizationId: string) {
        super(config.apiKey, "https://api.rd.services", organizationId);
        this.config = config;
    }

    async authenticate(): Promise<boolean> {
        try {
            // Test authentication with a simple call
            const response = await this.makeRequest("/platform/contacts", "GET", undefined, {
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
        const requiredFields = ["apiKey", "clientId"];
        const baseValidation = this.validateRequiredFields(this.config, requiredFields);

        if (!baseValidation.isValid) {
            return baseValidation;
        }

        // Test connection
        const isConnected = await this.testConnection();
        if (!isConnected) {
            return {
                isValid: false,
                errors: ["Unable to connect to RD Station API"],
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
            "create_event",
            "update_opportunity",
            "create_opportunity",
            "send_email",
        ];
    }

    async execute(action: IntegrationAction): Promise<ActionResult> {
        try {
            switch (action.type) {
                case "create_contact":
                    return await this.createContact(action.payload as CRMContact);

                case "get_contact":
                    return await this.getContact(action.payload["email"]);

                case "create_event":
                    return await this.createEvent(action.payload as CRMEvent);

                case "create_opportunity":
                    return await this.createOpportunity(action.payload);

                case "send_email":
                    return await this.sendEmail(
                        action.payload["email"],
                        action.payload["subject"],
                        action.payload["content"]
                    );

                default:
                    throw new AutoFlowError(`Unsupported RD Station action: ${action.type}`, "RD_UNSUPPORTED_ACTION");
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
     * Create or update contact in RD Station
     */
    async createContact(contact: CRMContact): Promise<ActionResult> {
        try {
            const payload = {
                email: contact.email,
                name: contact.name,
                job_title: contact.jobTitle,
                personal_phone: contact.phone,
                city: contact.city,
                state: contact.state,
                country: contact.country || "Brasil",
                tags: contact.tags || [],
                cf_custom_field: contact.customFields || {},
            };

            const response = await this.makeRequest(
                "/platform/contacts",
                "POST",
                {
                    contact: payload,
                },
                {
                    Authorization: `Bearer ${this.config.apiKey}`,
                    "Content-Type": "application/json",
                }
            );

            await this.logActivity("create_contact", true, {
                contactId: response.data?.id,
                email: contact.email,
            });

            return {
                success: true,
                data: {
                    contactId: response.data?.id,
                    email: contact.email,
                    uuid: response.data?.uuid,
                },
                metadata: {
                    contactId: response.data?.id,
                    email: contact.email,
                },
            };
        } catch (error) {
            throw new AutoFlowError("Failed to create RD Station contact", "RD_CREATE_CONTACT_ERROR", {
                email: contact.email,
                originalError: error,
            });
        }
    }

    /**
     * Get contact from RD Station by email
     */
    async getContact(email: string): Promise<ActionResult> {
        try {
            const response = await this.makeRequest(
                `/platform/contacts/email:${encodeURIComponent(email)}`,
                "GET",
                undefined,
                {
                    Authorization: `Bearer ${this.config.apiKey}`,
                }
            );

            await this.logActivity("get_contact", true, {
                email,
                found: !!response.data,
            });

            return {
                success: true,
                data: response.data,
                metadata: {
                    email,
                    contactId: response.data?.id,
                },
            };
        } catch (error) {
            throw new AutoFlowError("Failed to get RD Station contact", "RD_GET_CONTACT_ERROR", {
                email,
                originalError: error,
            });
        }
    }

    /**
     * Create event in RD Station
     */
    async createEvent(event: CRMEvent): Promise<ActionResult> {
        try {
            const payload = {
                event_type: event.type || "CONVERSION",
                event_identifier: event.identifier,
                contact: {
                    email: event.contactEmail,
                },
                conversion_data: event.data || {},
            };

            const response = await this.makeRequest("/platform/events", "POST", payload, {
                Authorization: `Bearer ${this.config.apiKey}`,
                "Content-Type": "application/json",
            });

            await this.logActivity("create_event", true, {
                eventType: event.type,
                contactEmail: event.contactEmail,
            });

            return {
                success: true,
                data: response,
                metadata: {
                    eventType: event.type,
                    contactEmail: event.contactEmail,
                },
            };
        } catch (error) {
            throw new AutoFlowError("Failed to create RD Station event", "RD_CREATE_EVENT_ERROR", {
                eventType: event.type,
                contactEmail: event.contactEmail,
                originalError: error,
            });
        }
    }

    /**
     * Create opportunity in RD Station
     */
    async createOpportunity(opportunityData: any): Promise<ActionResult> {
        try {
            const payload = {
                funnel_name: opportunityData.funnelName || "default",
                contact_email: opportunityData.contactEmail,
                deal_stage_name: opportunityData.stageName || "Lead",
                deal_title: opportunityData.title,
                deal_value: opportunityData.value || 0,
            };

            const response = await this.makeRequest("/platform/deals", "POST", payload, {
                Authorization: `Bearer ${this.config.apiKey}`,
                "Content-Type": "application/json",
            });

            await this.logActivity("create_opportunity", true, {
                dealId: response.data?.id,
                contactEmail: opportunityData.contactEmail,
                value: opportunityData.value,
            });

            return {
                success: true,
                data: response.data,
                metadata: {
                    dealId: response.data?.id,
                    contactEmail: opportunityData.contactEmail,
                },
            };
        } catch (error) {
            throw new AutoFlowError("Failed to create RD Station opportunity", "RD_CREATE_OPPORTUNITY_ERROR", {
                contactEmail: opportunityData.contactEmail,
                originalError: error,
            });
        }
    }

    /**
     * Send email via RD Station
     */
    async sendEmail(email: string, subject: string, content: string): Promise<ActionResult> {
        try {
            const payload = {
                email_campaign: {
                    subject,
                    contacts: [{ email }],
                    content: {
                        html: content,
                    },
                },
            };

            const response = await this.makeRequest("/platform/emails", "POST", payload, {
                Authorization: `Bearer ${this.config.apiKey}`,
                "Content-Type": "application/json",
            });

            await this.logActivity("send_email", true, {
                email,
                subject,
                campaignId: response.data?.id,
            });

            return {
                success: true,
                data: response.data,
                metadata: {
                    email,
                    subject,
                    campaignId: response.data?.id,
                },
            };
        } catch (error) {
            throw new AutoFlowError("Failed to send RD Station email", "RD_SEND_EMAIL_ERROR", {
                email,
                subject,
                originalError: error,
            });
        }
    }

    /**
     * Process RD Station webhook
     */
    async processWebhook(payload: any): Promise<CRMEvent[]> {
        const events: CRMEvent[] = [];

        try {
            // RD Station webhook format
            if (payload.leads && Array.isArray(payload.leads)) {
                for (const lead of payload.leads) {
                    events.push({
                        type: "LEAD_UPDATE",
                        identifier: lead.uuid,
                        contactEmail: lead.email,
                        data: {
                            name: lead.name,
                            company: lead.company,
                            lifecycle_stage: lead.lifecycle_stage,
                            lead_score: lead.lead_score,
                        },
                        timestamp: new Date(),
                    });
                }
            }

            await this.logActivity("process_webhook", true, {
                eventsProcessed: events.length,
            });

            return events;
        } catch (error) {
            await this.logActivity("process_webhook", false, { error });
            return events;
        }
    }
}
