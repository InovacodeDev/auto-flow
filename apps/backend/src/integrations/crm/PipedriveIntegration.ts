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
 * Pipedrive CRM Integration
 * Implements Pipedrive capabilities for AutoFlow workflows
 */
export class PipedriveIntegration extends Integration {
    private config: CRMConfig;

    constructor(config: CRMConfig, organizationId: string) {
        super(config.apiKey, "https://api.pipedrive.com/v1", organizationId);
        this.config = config;
    }

    async authenticate(): Promise<boolean> {
        try {
            // Test authentication with a simple call
            const response = await this.makeRequest(`/users/me?api_token=${this.config.apiKey}`, "GET");

            await this.logActivity("authenticate", true, {
                userId: response.data?.id,
            });

            return response.success;
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
                errors: ["Unable to connect to Pipedrive API"],
            };
        }

        return { isValid: true };
    }

    async testConnection(): Promise<boolean> {
        return await this.authenticate();
    }

    getAvailableActions(): string[] {
        return [
            "create_person",
            "update_person",
            "get_person",
            "create_deal",
            "update_deal",
            "get_deal",
            "create_activity",
            "create_organization",
        ];
    }

    async execute(action: IntegrationAction): Promise<ActionResult> {
        try {
            switch (action.type) {
                case "create_person":
                    return await this.createPerson(action.payload as CRMContact);

                case "get_person":
                    return await this.getPerson(action.payload["personId"]);

                case "create_deal":
                    return await this.createDeal(action.payload);

                case "get_deal":
                    return await this.getDeal(action.payload["dealId"]);

                case "create_activity":
                    return await this.createActivity(action.payload);

                case "create_organization":
                    return await this.createOrganization(action.payload);

                default:
                    throw new AutoFlowError(
                        `Unsupported Pipedrive action: ${action.type}`,
                        "PIPEDRIVE_UNSUPPORTED_ACTION"
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
     * Create person in Pipedrive
     */
    async createPerson(contact: CRMContact): Promise<ActionResult> {
        try {
            const payload = {
                name: contact.name,
                email: [contact.email],
                phone: [contact.phone],
                job_title: contact.jobTitle,
                org_name: contact.company,
            };

            const response = await this.makeRequest(`/persons?api_token=${this.config.apiKey}`, "POST", payload);

            await this.logActivity("create_person", true, {
                personId: response.data?.id,
                email: contact.email,
            });

            return {
                success: true,
                data: {
                    personId: response.data?.id,
                    name: contact.name,
                    email: contact.email,
                },
                metadata: {
                    personId: response.data?.id,
                    email: contact.email,
                },
            };
        } catch (error) {
            throw new AutoFlowError("Failed to create Pipedrive person", "PIPEDRIVE_CREATE_PERSON_ERROR", {
                email: contact.email,
                originalError: error,
            });
        }
    }

    /**
     * Get person from Pipedrive
     */
    async getPerson(personId: string): Promise<ActionResult> {
        try {
            const response = await this.makeRequest(`/persons/${personId}?api_token=${this.config.apiKey}`, "GET");

            await this.logActivity("get_person", true, {
                personId,
                found: !!response.data,
            });

            return {
                success: true,
                data: response.data,
                metadata: {
                    personId,
                },
            };
        } catch (error) {
            throw new AutoFlowError("Failed to get Pipedrive person", "PIPEDRIVE_GET_PERSON_ERROR", {
                personId,
                originalError: error,
            });
        }
    }

    /**
     * Create deal in Pipedrive
     */
    async createDeal(dealData: any): Promise<ActionResult> {
        try {
            const payload = {
                title: dealData.title,
                value: dealData.value || 0,
                currency: dealData.currency || "BRL",
                person_id: dealData.personId,
                org_id: dealData.organizationId,
                pipeline_id: dealData.pipelineId,
                stage_id: dealData.stageId,
                status: dealData.status || "open",
            };

            const response = await this.makeRequest(`/deals?api_token=${this.config.apiKey}`, "POST", payload);

            await this.logActivity("create_deal", true, {
                dealId: response.data?.id,
                title: dealData.title,
                value: dealData.value,
            });

            return {
                success: true,
                data: response.data,
                metadata: {
                    dealId: response.data?.id,
                    title: dealData.title,
                },
            };
        } catch (error) {
            throw new AutoFlowError("Failed to create Pipedrive deal", "PIPEDRIVE_CREATE_DEAL_ERROR", {
                title: dealData.title,
                originalError: error,
            });
        }
    }

    /**
     * Get deal from Pipedrive
     */
    async getDeal(dealId: string): Promise<ActionResult> {
        try {
            const response = await this.makeRequest(`/deals/${dealId}?api_token=${this.config.apiKey}`, "GET");

            await this.logActivity("get_deal", true, {
                dealId,
                found: !!response.data,
            });

            return {
                success: true,
                data: response.data,
                metadata: {
                    dealId,
                },
            };
        } catch (error) {
            throw new AutoFlowError("Failed to get Pipedrive deal", "PIPEDRIVE_GET_DEAL_ERROR", {
                dealId,
                originalError: error,
            });
        }
    }

    /**
     * Create activity in Pipedrive
     */
    async createActivity(activityData: any): Promise<ActionResult> {
        try {
            const payload = {
                subject: activityData.subject,
                type: activityData.type || "call",
                due_date: activityData.dueDate,
                due_time: activityData.dueTime,
                person_id: activityData.personId,
                deal_id: activityData.dealId,
                note: activityData.note,
            };

            const response = await this.makeRequest(`/activities?api_token=${this.config.apiKey}`, "POST", payload);

            await this.logActivity("create_activity", true, {
                activityId: response.data?.id,
                subject: activityData.subject,
                type: activityData.type,
            });

            return {
                success: true,
                data: response.data,
                metadata: {
                    activityId: response.data?.id,
                    subject: activityData.subject,
                },
            };
        } catch (error) {
            throw new AutoFlowError("Failed to create Pipedrive activity", "PIPEDRIVE_CREATE_ACTIVITY_ERROR", {
                subject: activityData.subject,
                originalError: error,
            });
        }
    }

    /**
     * Create organization in Pipedrive
     */
    async createOrganization(orgData: any): Promise<ActionResult> {
        try {
            const payload = {
                name: orgData.name,
                address: orgData.address,
                owner_id: orgData.ownerId,
            };

            const response = await this.makeRequest(`/organizations?api_token=${this.config.apiKey}`, "POST", payload);

            await this.logActivity("create_organization", true, {
                organizationId: response.data?.id,
                name: orgData.name,
            });

            return {
                success: true,
                data: response.data,
                metadata: {
                    organizationId: response.data?.id,
                    name: orgData.name,
                },
            };
        } catch (error) {
            throw new AutoFlowError("Failed to create Pipedrive organization", "PIPEDRIVE_CREATE_ORGANIZATION_ERROR", {
                name: orgData.name,
                originalError: error,
            });
        }
    }

    /**
     * Process Pipedrive webhook
     */
    async processWebhook(payload: any): Promise<CRMEvent[]> {
        const events: CRMEvent[] = [];

        try {
            // Pipedrive webhook format
            if (payload.event && payload.current) {
                const eventType = payload.event;
                const current = payload.current;

                events.push({
                    type: eventType.toUpperCase(),
                    identifier: current.id?.toString() || "",
                    contactEmail: current.person?.email?.[0]?.value || "",
                    data: {
                        object_type: payload.meta?.object,
                        action: payload.meta?.action,
                        current,
                        previous: payload.previous,
                    },
                    timestamp: new Date(),
                });
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
