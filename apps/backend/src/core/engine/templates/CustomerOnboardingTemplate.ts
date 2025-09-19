/**
 * Template de Onboarding de Clientes para PMEs Brasileiras
 *
 * Este template automatiza o processo de onboarding de novos clientes,
 * incluindo coleta de dados, validação de documentos brasileiros,
 * criação de conta no sistema, e sequência de boas-vindas.
 *
 * Integra com:
 * - WhatsApp Business para comunicação
 * - CRM para gestão de clientes
 * - Sistema de validação CPF/CNPJ
 * - Compliance LGPD
 */

import { WorkflowTemplate, WorkflowTemplateCategory, BrazilianIndustryType } from "./BrazilianWorkflowTemplateManager";
import { WorkflowNode, WorkflowEdge, TriggerConfig } from "../types";

export function createCustomerOnboardingTemplate(): WorkflowTemplate {
    return {
        id: "customer-onboarding-template",
        name: "Onboarding Automatizado de Clientes",
        description:
            "Processo completo de onboarding para novos clientes brasileiros com validação de documentos e compliance LGPD",
        category: "customer_onboarding" as WorkflowTemplateCategory,
        industry: "general" as BrazilianIndustryType,
        complexity: "intermediate",
        estimatedSetupTime: 60,
        estimatedROI: {
            timeSavedPerMonth: 40,
            costSavingsPerMonth: 4000,
            revenueImpactPerMonth: 8000,
        },
        tags: ["onboarding", "clientes", "cpf", "cnpj", "lgpd", "whatsapp", "automacao"],
        brazilianSpecific: {
            requiresCPFCNPJ: true,
            requiresPIX: false,
            requiresWhatsApp: true,
            requiresERP: false,
            complianceRequired: ["LGPD"],
        },
        template: {
            nodes: createOnboardingNodes(),
            edges: createOnboardingEdges(),
            triggers: createOnboardingTriggers(),
            variables: {
                welcomeMessage: "Bem-vindo(a) à nossa empresa! Vamos iniciar seu cadastro.",
                cpfValidationRequired: true,
                cnpjValidationRequired: true,
                lgpdConsentRequired: true,
                maxRetries: 3,
                timeoutMinutes: 30,
            },
            metadata: {
                brazilianCompliance: true,
                lgpdCompliant: true,
                documentValidation: true,
                multiChannel: true,
            },
        },
        configurationSteps: [
            {
                id: "whatsapp-setup",
                title: "Configurar WhatsApp Business",
                description: "Configure as credenciais da API do WhatsApp Business",
                order: 1,
                required: true,
                type: "integration_setup",
                instructions: "Acesse o Meta Business e configure a API do WhatsApp Business",
                validationRules: [
                    { field: "whatsapp_token", rule: "required", message: "Token é obrigatório" },
                    { field: "whatsapp_phone_id", rule: "required", message: "Phone ID é obrigatório" },
                ],
            },
            {
                id: "crm-setup",
                title: "Configurar CRM",
                description: "Configure a integração com seu sistema CRM",
                order: 2,
                required: true,
                type: "integration_setup",
                instructions: "Configure as credenciais do seu CRM para sincronização de dados",
            },
            {
                id: "validation-setup",
                title: "Configurar Validação de Documentos",
                description: "Configure o serviço de validação CPF/CNPJ",
                order: 3,
                required: true,
                type: "integration_setup",
                instructions: "Configurar serviço de validação de documentos brasileiros",
            },
            {
                id: "message-customization",
                title: "Personalizar Mensagens",
                description: "Personalize as mensagens do processo de onboarding",
                order: 4,
                required: false,
                type: "variable_configuration",
                instructions: "Customize as mensagens para refletir o tom da sua marca",
            },
        ],
        prerequisites: [
            {
                id: "whatsapp-business-api",
                type: "integration",
                name: "WhatsApp Business API",
                description: "Conta ativa no WhatsApp Business API",
                required: true,
                documentationUrl: "https://developers.facebook.com/docs/whatsapp",
            },
            {
                id: "crm-system",
                type: "integration",
                name: "CRM System",
                description: "Sistema CRM com API disponível",
                required: true,
            },
            {
                id: "lgpd-compliance",
                type: "legal",
                name: "LGPD Compliance",
                description: "Política de privacidade em conformidade com LGPD",
                required: true,
            },
        ],
        supportedIntegrations: ["whatsapp", "crm", "cpf_validation", "cnpj_validation", "email"],
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0,
        rating: 4.7,
        version: "1.0.0",
    };
}

function createOnboardingNodes(): WorkflowNode[] {
    return [
        {
            id: "trigger-new-lead",
            type: "trigger",
            name: "Novo Lead Recebido",
            description: "Dispara quando um novo lead é identificado",
            position: { x: 100, y: 100 },
            config: {
                triggerType: "webhook",
                conditions: {
                    source: ["website", "whatsapp", "social_media"],
                    status: "new",
                },
            },
            inputs: [],
            outputs: [{ name: "lead_data", type: "object" }],
        },
        {
            id: "send-welcome-whatsapp",
            type: "action",
            name: "Enviar Mensagem de Boas-vindas",
            description: "Envia mensagem inicial via WhatsApp",
            position: { x: 300, y: 100 },
            config: {
                action: "whatsapp_send_message",
                template: "welcome_message",
                variables: ["customer_name", "company_name"],
            },
            inputs: [{ name: "lead_data", type: "object", required: true }],
            outputs: [{ name: "message_sent", type: "boolean" }],
        },
        {
            id: "collect-customer-data",
            type: "action",
            name: "Coletar Dados do Cliente",
            description: "Coleta informações básicas e documentos",
            position: { x: 500, y: 100 },
            config: {
                action: "customer_data_collection",
                fields: ["name", "email", "phone", "document_type", "document_number"],
            },
            inputs: [{ name: "previous_step", type: "any", required: true }],
            outputs: [{ name: "customer_data", type: "object" }],
        },
        {
            id: "create-crm-contact",
            type: "action",
            name: "Criar Contato no CRM",
            description: "Cria registro do cliente no CRM",
            position: { x: 700, y: 100 },
            config: {
                action: "crm_create_contact",
                mapFields: {
                    name: "customer_data.name",
                    email: "customer_data.email",
                    phone: "customer_data.phone",
                    document: "customer_data.document_number",
                },
            },
            inputs: [{ name: "customer_data", type: "object", required: true }],
            outputs: [{ name: "crm_contact_id", type: "string" }],
        },
        {
            id: "send-success-message",
            type: "action",
            name: "Enviar Confirmação",
            description: "Confirma conclusão do onboarding",
            position: { x: 900, y: 100 },
            config: {
                action: "whatsapp_send_message",
                text: "✅ Cadastro concluído com sucesso! Em breve nossa equipe entrará em contato.",
            },
            inputs: [{ name: "crm_contact_id", type: "string", required: true }],
            outputs: [{ name: "onboarding_completed", type: "boolean" }],
        },
    ];
}

function createOnboardingEdges(): WorkflowEdge[] {
    return [
        { id: "e1", source: "trigger-new-lead", target: "send-welcome-whatsapp" },
        { id: "e2", source: "send-welcome-whatsapp", target: "collect-customer-data" },
        { id: "e3", source: "collect-customer-data", target: "create-crm-contact" },
        { id: "e4", source: "create-crm-contact", target: "send-success-message" },
    ];
}

function createOnboardingTriggers(): TriggerConfig[] {
    return [
        {
            type: "webhook",
            config: {
                method: "POST",
                path: "/webhook/new-lead",
                authentication: "api_key",
                filters: {
                    source: ["website", "whatsapp", "social_media"],
                    status: "new",
                },
            },
            enabled: true,
            webhook: {
                method: "POST",
                path: "/webhook/new-lead",
                authentication: {
                    type: "api-key",
                    config: { header: "X-API-Key" },
                },
            },
        },
    ];
}

/**
 * Configuração específica para o template de onboarding
 */
export interface OnboardingTemplateConfig {
    whatsappConfig: {
        businessName: string;
        welcomeMessage: string;
        timeoutMinutes: number;
    };
    documentValidation: {
        service: "receita_federal" | "serasa" | "custom";
        apiKey: string;
        maxRetries: number;
    };
    lgpdCompliance: {
        privacyPolicyUrl: string;
        consentRequired: boolean;
        dataRetentionDays: number;
    };
    crmIntegration: {
        defaultPipeline: string;
        assignToTeam: string;
        followUpDelay: number;
    };
}

/**
 * Métricas esperadas do template de onboarding
 */
export const OnboardingTemplateMetrics = {
    averageCompletionTime: 15, // minutos
    completionRate: 0.85, // 85%
    qualityScore: 0.92, // 92% de dados corretos
    customerSatisfaction: 4.6, // de 5.0
    timeSavedPerLead: 30, // minutos vs processo manual
    costPerLead: 2.5, // reais (vs R$ 15 manual)
    roiProjection: {
        monthly: {
            leadsProcessed: 500,
            timeSaved: 250, // horas
            costSavings: 6250, // reais
            revenueImpact: 12500, // reais (conversão melhorada)
        },
    },
};
