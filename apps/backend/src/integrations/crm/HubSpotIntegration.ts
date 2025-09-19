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
 * HubSpot CRM Integration
 * Implements HubSpot capabilities for AutoFlow workflows
 */
export class HubSpotIntegration extends Integration {
    private config: CRMConfig;

    constructor(config: CRMConfig, organizationId: string) {
        super(config.apiKey, "https://api.hubapi.com", organizationId);
        this.config = config;
    }

    async authenticate(): Promise<boolean> {
        try {
            // Test authentication with a simple call
            const response = await this.makeRequest("/crm/v3/objects/contacts", "GET", undefined, {
                Authorization: `Bearer ${this.config.apiKey}`,
            });

            await this.logActivity("authenticate", true, {
                contactsCount: response.results?.length || 0,
            });

            return !!response.results;
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
                errors: ["Unable to connect to HubSpot API"],
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
            "create_company",
            "create_deal",
            "create_ticket",
            "create_note",
            "add_to_list",
        ];
    }

    async execute(action: IntegrationAction): Promise<ActionResult> {
        try {
            switch (action.type) {
                case "create_contact":
                    return await this.createContact(action.payload as CRMContact);

                case "get_contact":
                    return await this.getContact(action.payload["email"]);

                case "create_company":
                    return await this.createCompany(action.payload);

                case "create_deal":
                    return await this.createDeal(action.payload);

                case "create_ticket":
                    return await this.createTicket(action.payload);

                case "create_note":
                    return await this.createNote(action.payload);

                case "add_to_list":
                    return await this.addToList(action.payload["contactId"], action.payload["listId"]);

                default:
                    throw new AutoFlowError(`Unsupported HubSpot action: ${action.type}`, "HUBSPOT_UNSUPPORTED_ACTION");
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
     * Create contact in HubSpot
     */
    async createContact(contact: CRMContact): Promise<ActionResult> {
        try {
            const payload = {
                properties: {
                    email: contact.email,
                    firstname: contact.name.split(" ")[0],
                    lastname: contact.name.split(" ").slice(1).join(" "),
                    phone: contact.phone,
                    jobtitle: contact.jobTitle,
                    company: contact.company,
                    city: contact.city,
                    state: contact.state,
                    country: contact.country || "Brasil",
                    ...contact.customFields,
                },
            };

            const response = await this.makeRequest("/crm/v3/objects/contacts", "POST", payload, {
                Authorization: `Bearer ${this.config.apiKey}`,
                "Content-Type": "application/json",
            });

            await this.logActivity("create_contact", true, {
                contactId: response.id,
                email: contact.email,
            });

            return {
                success: true,
                data: {
                    contactId: response.id,
                    email: contact.email,
                },
                metadata: {
                    contactId: response.id,
                    email: contact.email,
                },
            };
        } catch (error) {
            throw new AutoFlowError("Failed to create HubSpot contact", "HUBSPOT_CREATE_CONTACT_ERROR", {
                email: contact.email,
                originalError: error,
            });
        }
    }

    /**
     * Get contact from HubSpot by email
     */
    async getContact(email: string): Promise<ActionResult> {
        try {
            const response = await this.makeRequest(
                `/crm/v3/objects/contacts/search`,
                "POST",
                {
                    filterGroups: [
                        {
                            filters: [
                                {
                                    propertyName: "email",
                                    operator: "EQ",
                                    value: email,
                                },
                            ],
                        },
                    ],
                },
                {
                    Authorization: `Bearer ${this.config.apiKey}`,
                    "Content-Type": "application/json",
                }
            );

            const contact = response.results?.[0];

            await this.logActivity("get_contact", true, {
                email,
                found: !!contact,
            });

            return {
                success: true,
                data: contact,
                metadata: {
                    email,
                    contactId: contact?.id,
                },
            };
        } catch (error) {
            throw new AutoFlowError("Failed to get HubSpot contact", "HUBSPOT_GET_CONTACT_ERROR", {
                email,
                originalError: error,
            });
        }
    }

    /**
     * Create company in HubSpot
     */
    async createCompany(companyData: any): Promise<ActionResult> {
        try {
            const payload = {
                properties: {
                    name: companyData.name,
                    domain: companyData.domain,
                    industry: companyData.industry,
                    city: companyData.city,
                    state: companyData.state,
                    country: companyData.country || "Brasil",
                    phone: companyData.phone,
                    website: companyData.website,
                },
            };

            const response = await this.makeRequest("/crm/v3/objects/companies", "POST", payload, {
                Authorization: `Bearer ${this.config.apiKey}`,
                "Content-Type": "application/json",
            });

            await this.logActivity("create_company", true, {
                companyId: response.id,
                name: companyData.name,
            });

            return {
                success: true,
                data: response,
                metadata: {
                    companyId: response.id,
                    name: companyData.name,
                },
            };
        } catch (error) {
            throw new AutoFlowError("Failed to create HubSpot company", "HUBSPOT_CREATE_COMPANY_ERROR", {
                name: companyData.name,
                originalError: error,
            });
        }
    }

    /**
     * Create deal in HubSpot
     */
    async createDeal(dealData: any): Promise<ActionResult> {
        try {
            const payload = {
                properties: {
                    dealname: dealData.name,
                    amount: dealData.amount || 0,
                    dealstage: dealData.stage || "appointmentscheduled",
                    pipeline: dealData.pipeline || "default",
                    closedate: dealData.closeDate,
                    hubspot_owner_id: dealData.ownerId,
                },
                associations: dealData.contactId
                    ? [
                          {
                              to: { id: dealData.contactId },
                              types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 3 }],
                          },
                      ]
                    : [],
            };

            const response = await this.makeRequest("/crm/v3/objects/deals", "POST", payload, {
                Authorization: `Bearer ${this.config.apiKey}`,
                "Content-Type": "application/json",
            });

            await this.logActivity("create_deal", true, {
                dealId: response.id,
                name: dealData.name,
                amount: dealData.amount,
            });

            return {
                success: true,
                data: response,
                metadata: {
                    dealId: response.id,
                    name: dealData.name,
                },
            };
        } catch (error) {
            throw new AutoFlowError("Failed to create HubSpot deal", "HUBSPOT_CREATE_DEAL_ERROR", {
                name: dealData.name,
                originalError: error,
            });
        }
    }

    /**
     * Create ticket in HubSpot
     */
    async createTicket(ticketData: any): Promise<ActionResult> {
        try {
            const payload = {
                properties: {
                    subject: ticketData.subject,
                    content: ticketData.content,
                    hs_pipeline: ticketData.pipeline || "0",
                    hs_pipeline_stage: ticketData.stage || "1",
                    hs_ticket_priority: ticketData.priority || "MEDIUM",
                    hubspot_owner_id: ticketData.ownerId,
                },
                associations: ticketData.contactId
                    ? [
                          {
                              to: { id: ticketData.contactId },
                              types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 16 }],
                          },
                      ]
                    : [],
            };

            const response = await this.makeRequest("/crm/v3/objects/tickets", "POST", payload, {
                Authorization: `Bearer ${this.config.apiKey}`,
                "Content-Type": "application/json",
            });

            await this.logActivity("create_ticket", true, {
                ticketId: response.id,
                subject: ticketData.subject,
            });

            return {
                success: true,
                data: response,
                metadata: {
                    ticketId: response.id,
                    subject: ticketData.subject,
                },
            };
        } catch (error) {
            throw new AutoFlowError("Failed to create HubSpot ticket", "HUBSPOT_CREATE_TICKET_ERROR", {
                subject: ticketData.subject,
                originalError: error,
            });
        }
    }

    /**
     * Create note in HubSpot
     */
    async createNote(noteData: any): Promise<ActionResult> {
        try {
            const payload = {
                properties: {
                    hs_note_body: noteData.content,
                    hubspot_owner_id: noteData.ownerId,
                },
                associations: [
                    {
                        to: { id: noteData.contactId },
                        types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 202 }],
                    },
                ],
            };

            const response = await this.makeRequest("/crm/v3/objects/notes", "POST", payload, {
                Authorization: `Bearer ${this.config.apiKey}`,
                "Content-Type": "application/json",
            });

            await this.logActivity("create_note", true, {
                noteId: response.id,
                contactId: noteData.contactId,
            });

            return {
                success: true,
                data: response,
                metadata: {
                    noteId: response.id,
                    contactId: noteData.contactId,
                },
            };
        } catch (error) {
            throw new AutoFlowError("Failed to create HubSpot note", "HUBSPOT_CREATE_NOTE_ERROR", {
                contactId: noteData.contactId,
                originalError: error,
            });
        }
    }

    /**
     * Add contact to static list
     */
    async addToList(contactId: string, listId: string): Promise<ActionResult> {
        try {
            const payload = {
                vids: [parseInt(contactId)],
            };

            const response = await this.makeRequest(`/contacts/v1/lists/${listId}/add`, "POST", payload, {
                Authorization: `Bearer ${this.config.apiKey}`,
                "Content-Type": "application/json",
            });

            await this.logActivity("add_to_list", true, {
                contactId,
                listId,
            });

            return {
                success: true,
                data: response,
                metadata: {
                    contactId,
                    listId,
                },
            };
        } catch (error) {
            throw new AutoFlowError("Failed to add contact to HubSpot list", "HUBSPOT_ADD_TO_LIST_ERROR", {
                contactId,
                listId,
                originalError: error,
            });
        }
    }

    /**
     * Process HubSpot webhook
     */
    async processWebhook(payload: any): Promise<CRMEvent[]> {
        const events: CRMEvent[] = [];

        try {
            // HubSpot webhook format
            if (payload && Array.isArray(payload)) {
                for (const event of payload) {
                    if (event.subscriptionType && event.objectId) {
                        events.push({
                            type: event.subscriptionType.toUpperCase(),
                            identifier: event.objectId.toString(),
                            contactEmail: event.propertyValue || "",
                            data: {
                                subscriptionType: event.subscriptionType,
                                objectId: event.objectId,
                                propertyName: event.propertyName,
                                propertyValue: event.propertyValue,
                                changeSource: event.changeSource,
                                eventId: event.eventId,
                            },
                            timestamp: new Date(event.occurredAt || Date.now()),
                        });
                    }
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
