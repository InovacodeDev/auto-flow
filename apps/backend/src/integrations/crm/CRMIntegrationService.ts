export interface CRMContact {
    id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    position?: string;
    tags?: string[];
    customFields?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export interface CRMDeal {
    id: string;
    title: string;
    value: number;
    currency: string;
    stage: string;
    status: "open" | "won" | "lost";
    contactId: string;
    ownerId?: string;
    expectedCloseDate?: Date;
    customFields?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export interface CRMActivity {
    id: string;
    type: "call" | "email" | "meeting" | "task" | "note" | "whatsapp";
    subject: string;
    description?: string;
    contactId?: string;
    dealId?: string;
    ownerId?: string;
    dueDate?: Date;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CRMWebhookData {
    event: string;
    data: any;
    timestamp: string;
    source: "rdstation" | "pipedrive" | "hubspot";
}

export interface CreateContactRequest {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    position?: string;
    tags?: string[];
    customFields?: Record<string, any>;
}

export interface CreateDealRequest {
    title: string;
    value: number;
    contactId: string;
    stage?: string;
    expectedCloseDate?: Date;
    customFields?: Record<string, any>;
}

export interface CreateActivityRequest {
    type: "call" | "email" | "meeting" | "task" | "note" | "whatsapp";
    subject: string;
    description?: string;
    contactId?: string;
    dealId?: string;
    dueDate?: Date;
}

export interface CRMIntegrationConfig {
    platform: "rdstation" | "pipedrive" | "hubspot";
    apiKey: string;
    apiUrl: string;
    webhookSecret?: string;
    customMappings?: Record<string, string>;
}

export interface CRMSyncResult {
    success: boolean;
    synchronized: number;
    errors: number;
    details?: {
        contacts: number;
        deals: number;
        activities: number;
    };
}

/**
 * Serviço unificado para integração com CRMs brasileiros
 * Oferece interface única para RD Station, Pipedrive e HubSpot
 */
export class CRMIntegrationService {
    private config: CRMIntegrationConfig;

    constructor(config: CRMIntegrationConfig) {
        this.config = config;
        this.validateConfig();
    }

    /**
     * Criar novo contato no CRM
     */
    async createContact(request: CreateContactRequest): Promise<CRMContact> {
        try {
            console.log(`Criando contato no ${this.config.platform}:`, request);

            switch (this.config.platform) {
                case "rdstation":
                    return await this.createRDStationContact(request);
                case "pipedrive":
                    return await this.createPipedriveContact(request);
                case "hubspot":
                    return await this.createHubSpotContact(request);
                default:
                    throw new Error(`Plataforma CRM não suportada: ${this.config.platform}`);
            }
        } catch (error) {
            console.error("Erro ao criar contato:", error);
            throw new Error(`Falha ao criar contato: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
        }
    }

    /**
     * Buscar contato por email
     */
    async findContactByEmail(email: string): Promise<CRMContact | null> {
        try {
            console.log(`Buscando contato por email no ${this.config.platform}:`, email);

            switch (this.config.platform) {
                case "rdstation":
                    return await this.findRDStationContactByEmail(email);
                case "pipedrive":
                    return await this.findPipedriveContactByEmail(email);
                case "hubspot":
                    return await this.findHubSpotContactByEmail(email);
                default:
                    throw new Error(`Plataforma CRM não suportada: ${this.config.platform}`);
            }
        } catch (error) {
            console.error("Erro ao buscar contato:", error);
            return null;
        }
    }

    /**
     * Criar nova oportunidade
     */
    async createDeal(request: CreateDealRequest): Promise<CRMDeal> {
        try {
            console.log(`Criando oportunidade no ${this.config.platform}:`, request);

            switch (this.config.platform) {
                case "rdstation":
                    return await this.createRDStationDeal(request);
                case "pipedrive":
                    return await this.createPipedriveDeal(request);
                case "hubspot":
                    return await this.createHubSpotDeal(request);
                default:
                    throw new Error(`Plataforma CRM não suportada: ${this.config.platform}`);
            }
        } catch (error) {
            console.error("Erro ao criar oportunidade:", error);
            throw new Error(
                `Falha ao criar oportunidade: ${error instanceof Error ? error.message : "Erro desconhecido"}`
            );
        }
    }

    /**
     * Atualizar status da oportunidade
     */
    async updateDealStatus(dealId: string, status: "open" | "won" | "lost", stage?: string): Promise<CRMDeal> {
        try {
            console.log(`Atualizando status da oportunidade ${dealId} para ${status}`);

            switch (this.config.platform) {
                case "rdstation":
                    return await this.updateRDStationDealStatus(dealId, status, stage);
                case "pipedrive":
                    return await this.updatePipedriveDealStatus(dealId, status, stage);
                case "hubspot":
                    return await this.updateHubSpotDealStatus(dealId, status, stage);
                default:
                    throw new Error(`Plataforma CRM não suportada: ${this.config.platform}`);
            }
        } catch (error) {
            console.error("Erro ao atualizar oportunidade:", error);
            throw new Error(
                `Falha ao atualizar oportunidade: ${error instanceof Error ? error.message : "Erro desconhecido"}`
            );
        }
    }

    /**
     * Criar atividade/interação
     */
    async createActivity(request: CreateActivityRequest): Promise<CRMActivity> {
        try {
            console.log(`Criando atividade no ${this.config.platform}:`, request);

            switch (this.config.platform) {
                case "rdstation":
                    return await this.createRDStationActivity(request);
                case "pipedrive":
                    return await this.createPipedriveActivity(request);
                case "hubspot":
                    return await this.createHubSpotActivity(request);
                default:
                    throw new Error(`Plataforma CRM não suportada: ${this.config.platform}`);
            }
        } catch (error) {
            console.error("Erro ao criar atividade:", error);
            throw new Error(
                `Falha ao criar atividade: ${error instanceof Error ? error.message : "Erro desconhecido"}`
            );
        }
    }

    /**
     * Processar webhook do CRM
     */
    async processWebhook(webhookData: CRMWebhookData): Promise<{
        processed: boolean;
        action: string;
        entityType: string;
        entityId?: string;
    }> {
        try {
            console.log(`Processando webhook do ${webhookData.source}:`, webhookData);

            switch (webhookData.source) {
                case "rdstation":
                    return await this.processRDStationWebhook(webhookData);
                case "pipedrive":
                    return await this.processPipedriveWebhook(webhookData);
                case "hubspot":
                    return await this.processHubSpotWebhook(webhookData);
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
     * Sincronizar dados entre AutoFlow e CRM
     */
    async syncWithCRM(): Promise<CRMSyncResult> {
        try {
            console.log(`Iniciando sincronização com ${this.config.platform}`);

            const contacts = 0;
            const deals = 0;
            const activities = 0;
            const errors = 0;

            // Aqui você implementaria a lógica de sincronização
            // Por exemplo:
            // - Buscar contatos modificados recentemente
            // - Sincronizar oportunidades em aberto
            // - Atualizar atividades pendentes

            return {
                success: true,
                synchronized: contacts + deals + activities,
                errors,
                details: { contacts, deals, activities },
            };
        } catch (error) {
            console.error("Erro na sincronização:", error);
            throw new Error(`Falha na sincronização: ${error instanceof Error ? error.message : "Erro desconhecido"}`);
        }
    }

    // Métodos específicos para RD Station
    private async createRDStationContact(request: CreateContactRequest): Promise<CRMContact> {
        const response = await this.makeRDStationRequest("POST", "/platform/contacts", {
            name: request.name,
            email: request.email,
            mobile_phone: request.phone,
            company: request.company,
            job_title: request.position,
            tags: request.tags,
            cf_custom_field_api_identifier: request.customFields,
        });

        return this.mapRDStationContact(response.data);
    }

    private async findRDStationContactByEmail(email: string): Promise<CRMContact | null> {
        const response = await this.makeRDStationRequest("GET", `/platform/contacts/email:${email}`);
        return response.data ? this.mapRDStationContact(response.data) : null;
    }

    private async createRDStationDeal(request: CreateDealRequest): Promise<CRMDeal> {
        const response = await this.makeRDStationRequest("POST", "/platform/deals", {
            name: request.title,
            deal_value: request.value,
            contacts: [{ contact_id: request.contactId }],
            deal_stage_id: request.stage,
            predicted_close_date: request.expectedCloseDate?.toISOString(),
        });

        return this.mapRDStationDeal(response.data);
    }

    private async updateRDStationDealStatus(dealId: string, status: string, stage?: string): Promise<CRMDeal> {
        const updateData: any = {};

        if (stage) {
            updateData.deal_stage_id = stage;
        }

        if (status === "won") {
            updateData.deal_status = "won";
        } else if (status === "lost") {
            updateData.deal_status = "lost";
            updateData.lost_reason = "Não especificado";
        }

        const response = await this.makeRDStationRequest("PATCH", `/platform/deals/${dealId}`, updateData);
        return this.mapRDStationDeal(response.data);
    }

    private async createRDStationActivity(request: CreateActivityRequest): Promise<CRMActivity> {
        const response = await this.makeRDStationRequest("POST", "/platform/activities", {
            activity_type: this.mapActivityType(request.type),
            text: request.subject,
            description: request.description,
            contact_id: request.contactId,
            deal_id: request.dealId,
            due_date: request.dueDate?.toISOString(),
        });

        return this.mapRDStationActivity(response.data);
    }

    private async processRDStationWebhook(webhookData: CRMWebhookData): Promise<any> {
        // Implementar processamento específico do RD Station
        return {
            processed: true,
            action: webhookData.event,
            entityType: "contact",
        };
    }

    // Métodos específicos para Pipedrive
    private async createPipedriveContact(request: CreateContactRequest): Promise<CRMContact> {
        const response = await this.makePipedriveRequest("POST", "/persons", {
            name: request.name,
            email: [{ value: request.email, primary: true }],
            phone: request.phone ? [{ value: request.phone, primary: true }] : undefined,
            org_name: request.company,
        });

        return this.mapPipedriveContact(response.data);
    }

    private async findPipedriveContactByEmail(email: string): Promise<CRMContact | null> {
        const response = await this.makePipedriveRequest("GET", `/persons/search?term=${email}&field=email`);
        const person = response.data.items?.[0];
        return person ? this.mapPipedriveContact(person.item) : null;
    }

    private async createPipedriveDeal(request: CreateDealRequest): Promise<CRMDeal> {
        const response = await this.makePipedriveRequest("POST", "/deals", {
            title: request.title,
            value: request.value,
            person_id: request.contactId,
            stage_id: request.stage,
            expected_close_date: request.expectedCloseDate?.toISOString().split("T")[0],
        });

        return this.mapPipedriveDeal(response.data);
    }

    private async updatePipedriveDealStatus(dealId: string, status: string, stage?: string): Promise<CRMDeal> {
        const updateData: any = {};

        if (stage) {
            updateData.stage_id = stage;
        }

        if (status === "won") {
            updateData.status = "won";
        } else if (status === "lost") {
            updateData.status = "lost";
        }

        const response = await this.makePipedriveRequest("PUT", `/deals/${dealId}`, updateData);
        return this.mapPipedriveDeal(response.data);
    }

    private async createPipedriveActivity(request: CreateActivityRequest): Promise<CRMActivity> {
        const response = await this.makePipedriveRequest("POST", "/activities", {
            subject: request.subject,
            type: this.mapActivityType(request.type),
            note: request.description,
            person_id: request.contactId,
            deal_id: request.dealId,
            due_date: request.dueDate?.toISOString().split("T")[0],
        });

        return this.mapPipedriveActivity(response.data);
    }

    private async processPipedriveWebhook(webhookData: CRMWebhookData): Promise<any> {
        // Implementar processamento específico do Pipedrive
        return {
            processed: true,
            action: webhookData.event,
            entityType: "deal",
        };
    }

    // Métodos específicos para HubSpot
    private async createHubSpotContact(request: CreateContactRequest): Promise<CRMContact> {
        const response = await this.makeHubSpotRequest("POST", "/crm/v3/objects/contacts", {
            properties: {
                firstname: request.name.split(" ")[0],
                lastname: request.name.split(" ").slice(1).join(" "),
                email: request.email,
                phone: request.phone,
                company: request.company,
                jobtitle: request.position,
            },
        });

        return this.mapHubSpotContact(response);
    }

    private async findHubSpotContactByEmail(email: string): Promise<CRMContact | null> {
        const response = await this.makeHubSpotRequest("GET", `/crm/v3/objects/contacts/${email}?idProperty=email`);
        return response ? this.mapHubSpotContact(response) : null;
    }

    private async createHubSpotDeal(request: CreateDealRequest): Promise<CRMDeal> {
        const response = await this.makeHubSpotRequest("POST", "/crm/v3/objects/deals", {
            properties: {
                dealname: request.title,
                amount: request.value.toString(),
                dealstage: request.stage,
                closedate: request.expectedCloseDate?.toISOString(),
            },
            associations: [
                {
                    to: { id: request.contactId },
                    types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 3 }],
                },
            ],
        });

        return this.mapHubSpotDeal(response);
    }

    private async updateHubSpotDealStatus(dealId: string, status: string, stage?: string): Promise<CRMDeal> {
        const properties: any = {};

        if (stage) {
            properties.dealstage = stage;
        }

        if (status === "won") {
            properties.dealstage = "closedwon";
        } else if (status === "lost") {
            properties.dealstage = "closedlost";
        }

        const response = await this.makeHubSpotRequest("PATCH", `/crm/v3/objects/deals/${dealId}`, {
            properties,
        });

        return this.mapHubSpotDeal(response);
    }

    private async createHubSpotActivity(request: CreateActivityRequest): Promise<CRMActivity> {
        const response = await this.makeHubSpotRequest("POST", "/crm/v3/objects/tasks", {
            properties: {
                hs_task_subject: request.subject,
                hs_task_body: request.description,
                hs_task_type: this.mapActivityType(request.type),
                hs_timestamp: request.dueDate?.toISOString(),
            },
        });

        return this.mapHubSpotActivity(response);
    }

    private async processHubSpotWebhook(webhookData: CRMWebhookData): Promise<any> {
        // Implementar processamento específico do HubSpot
        return {
            processed: true,
            action: webhookData.event,
            entityType: "contact",
        };
    }

    // Métodos auxiliares para chamadas HTTP
    private async makeRDStationRequest(method: string, path: string, data?: any): Promise<any> {
        const url = `${this.config.apiUrl}${path}`;
        // Implementar chamada HTTP para RD Station
        console.log(`RD Station ${method} ${url}`, data);
        return { data: {} }; // Mock response
    }

    private async makePipedriveRequest(method: string, path: string, data?: any): Promise<any> {
        const url = `${this.config.apiUrl}${path}`;
        // Implementar chamada HTTP para Pipedrive
        console.log(`Pipedrive ${method} ${url}`, data);
        return { data: {} }; // Mock response
    }

    private async makeHubSpotRequest(method: string, path: string, data?: any): Promise<any> {
        const url = `${this.config.apiUrl}${path}`;
        // Implementar chamada HTTP para HubSpot
        console.log(`HubSpot ${method} ${url}`, data);
        return {}; // Mock response
    }

    // Métodos auxiliares para mapeamento de dados
    private mapRDStationContact(data: any): CRMContact {
        return {
            id: data.uuid,
            name: data.name,
            email: data.email,
            phone: data.mobile_phone,
            company: data.company,
            position: data.job_title,
            tags: data.tags,
            customFields: data.custom_fields,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
        };
    }

    private mapRDStationDeal(data: any): CRMDeal {
        return {
            id: data.id,
            title: data.name,
            value: data.deal_value,
            currency: "BRL",
            stage: data.deal_stage.name,
            status: data.deal_status,
            contactId: data.contacts[0]?.contact_id,
            ...(data.predicted_close_date && { expectedCloseDate: new Date(data.predicted_close_date) }),
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
        };
    }

    private mapRDStationActivity(data: any): CRMActivity {
        return {
            id: data.id,
            type: data.activity_type,
            subject: data.text,
            description: data.description,
            contactId: data.contact_id,
            dealId: data.deal_id,
            ...(data.due_date && { dueDate: new Date(data.due_date) }),
            completed: data.done,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
        };
    }

    private mapPipedriveContact(data: any): CRMContact {
        return {
            id: data.id.toString(),
            name: data.name,
            email: data.email[0]?.value,
            phone: data.phone[0]?.value,
            company: data.org_name,
            tags: [],
            createdAt: new Date(data.add_time),
            updatedAt: new Date(data.update_time),
        };
    }

    private mapPipedriveDeal(data: any): CRMDeal {
        return {
            id: data.id.toString(),
            title: data.title,
            value: data.value,
            currency: data.currency,
            stage: data.stage_name,
            status: data.status,
            contactId: data.person_id?.toString(),
            ...(data.expected_close_date && { expectedCloseDate: new Date(data.expected_close_date) }),
            createdAt: new Date(data.add_time),
            updatedAt: new Date(data.update_time),
        };
    }

    private mapPipedriveActivity(data: any): CRMActivity {
        return {
            id: data.id.toString(),
            type: data.type,
            subject: data.subject,
            description: data.note,
            contactId: data.person_id?.toString(),
            dealId: data.deal_id?.toString(),
            ...(data.due_date && { dueDate: new Date(data.due_date) }),
            completed: data.done,
            createdAt: new Date(data.add_time),
            updatedAt: new Date(data.update_time),
        };
    }

    private mapHubSpotContact(data: any): CRMContact {
        const props = data.properties;
        return {
            id: data.id,
            name: `${props.firstname || ""} ${props.lastname || ""}`.trim(),
            email: props.email,
            phone: props.phone,
            company: props.company,
            position: props.jobtitle,
            tags: [],
            createdAt: new Date(props.createdate),
            updatedAt: new Date(props.lastmodifieddate),
        };
    }

    private mapHubSpotDeal(data: any): CRMDeal {
        const props = data.properties;
        return {
            id: data.id,
            title: props.dealname,
            value: parseFloat(props.amount || "0"),
            currency: "BRL",
            stage: props.dealstage,
            status: props.dealstage?.includes("won") ? "won" : props.dealstage?.includes("lost") ? "lost" : "open",
            contactId: "", // Needs association lookup
            ...(props.closedate && { expectedCloseDate: new Date(props.closedate) }),
            createdAt: new Date(props.createdate),
            updatedAt: new Date(props.hs_lastmodifieddate),
        };
    }

    private mapHubSpotActivity(data: any): CRMActivity {
        const props = data.properties;
        return {
            id: data.id,
            type: props.hs_task_type,
            subject: props.hs_task_subject,
            description: props.hs_task_body,
            ...(props.hs_timestamp && { dueDate: new Date(props.hs_timestamp) }),
            completed: props.hs_task_status === "COMPLETED",
            createdAt: new Date(props.hs_createdate),
            updatedAt: new Date(props.hs_lastmodifieddate),
        };
    }

    private mapActivityType(type: string): string {
        const mapping: Record<string, string> = {
            call: "call",
            email: "email",
            meeting: "meeting",
            task: "task",
            note: "note",
            whatsapp: "call", // Mapear WhatsApp como call
        };
        return mapping[type] || "task";
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
