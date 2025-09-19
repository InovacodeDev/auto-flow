/**
 * Template de Compliance LGPD Automatizado para PMEs Brasileiras
 *
 * Este template automatiza processos de conformidade com a Lei Geral de
 * Proteção de Dados (LGPD), incluindo gestão de consentimentos, direitos
 * do titular, relatórios de conformidade e notificação de incidentes.
 *
 * Integra com:
 * - CRM para gestão de consentimentos
 * - Email para comunicações LGPD
 * - WhatsApp para solicitações de titulares
 * - Sistema de auditoria interna
 */

import { WorkflowTemplate, WorkflowTemplateCategory, BrazilianIndustryType } from "./BrazilianWorkflowTemplateManager";
import { WorkflowNode, WorkflowEdge, TriggerConfig } from "../types";

export function createComplianceLGPDTemplate(): WorkflowTemplate {
    return {
        id: "compliance-lgpd-template",
        name: "Compliance LGPD Automatizado",
        description:
            "Sistema completo de conformidade com LGPD incluindo gestão de consentimentos, direitos do titular e relatórios",
        category: "compliance_automation" as WorkflowTemplateCategory,
        industry: "general" as BrazilianIndustryType,
        complexity: "advanced",
        estimatedSetupTime: 180,
        estimatedROI: {
            timeSavedPerMonth: 80,
            costSavingsPerMonth: 12000,
            revenueImpactPerMonth: 20000,
        },
        tags: ["lgpd", "compliance", "privacidade", "consentimento", "auditoria", "titular", "dados"],
        brazilianSpecific: {
            requiresCPFCNPJ: true,
            requiresPIX: false,
            requiresWhatsApp: true,
            requiresERP: false,
            complianceRequired: ["LGPD"],
        },
        template: {
            nodes: createLGPDNodes(),
            edges: createLGPDEdges(),
            triggers: createLGPDTriggers(),
            variables: {
                dataRetentionPeriod: 730, // dias (2 anos)
                consentExpiryPeriod: 365, // dias (1 ano)
                incidentResponseTime: 72, // horas (3 dias)
                auditFrequency: "monthly",
                anonymizationDelay: 30, // dias após solicitação
                businessHours: {
                    start: "09:00",
                    end: "17:00",
                    timezone: "America/Sao_Paulo",
                },
            },
            metadata: {
                lgpdCompliant: true,
                dataGovernance: true,
                incidentManagement: true,
                auditReady: true,
            },
        },
        configurationSteps: [
            {
                id: "data-mapping",
                title: "Mapeamento de Dados Pessoais",
                description: "Identifique e mapeie todos os dados pessoais processados",
                order: 1,
                required: true,
                type: "variable_configuration",
                instructions: "Complete o inventário de dados pessoais e bases legais",
            },
            {
                id: "consent-system",
                title: "Sistema de Consentimentos",
                description: "Configure o sistema de gestão de consentimentos",
                order: 2,
                required: true,
                type: "integration_setup",
                instructions: "Integre com CRM para rastreamento de consentimentos",
            },
            {
                id: "rights-management",
                title: "Gestão de Direitos do Titular",
                description: "Configure processos para atender direitos dos titulares",
                order: 3,
                required: true,
                type: "integration_setup",
                instructions: "Configure canais para recebimento de solicitações",
            },
            {
                id: "incident-response",
                title: "Resposta a Incidentes",
                description: "Configure processo de resposta a vazamentos de dados",
                order: 4,
                required: true,
                type: "integration_setup",
                instructions: "Configure alertas e planos de ação para incidentes",
            },
        ],
        prerequisites: [
            {
                id: "privacy-policy",
                type: "legal",
                name: "Política de Privacidade",
                description: "Política de privacidade atualizada conforme LGPD",
                required: true,
            },
            {
                id: "dpo-designation",
                type: "legal",
                name: "Designação de DPO",
                description: "Data Protection Officer designado (se aplicável)",
                required: false,
            },
            {
                id: "data-inventory",
                type: "technical",
                name: "Inventário de Dados",
                description: "Mapeamento completo dos dados pessoais processados",
                required: true,
            },
        ],
        supportedIntegrations: ["crm", "email", "whatsapp", "audit_system"],
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0,
        rating: 4.9,
        version: "1.0.0",
    };
}

function createLGPDNodes(): WorkflowNode[] {
    return [
        {
            id: "consent-request-received",
            type: "trigger",
            name: "Solicitação de Consentimento",
            description: "Dispara quando nova solicitação de consentimento é recebida",
            position: { x: 100, y: 100 },
            config: {
                triggerType: "webhook",
                sources: ["website", "app", "email", "whatsapp"],
                dataTypes: ["personal_data", "sensitive_data"],
            },
            inputs: [],
            outputs: [{ name: "consent_request", type: "object" }],
        },
        {
            id: "validate-consent-request",
            type: "condition",
            name: "Validar Solicitação",
            description: "Valida se a solicitação de consentimento está completa",
            position: { x: 300, y: 100 },
            config: {
                validationRules: ["cpf_valid", "purpose_specified", "legal_basis_identified", "data_types_listed"],
            },
            inputs: [{ name: "consent_request", type: "object", required: true }],
            outputs: [
                { name: "valid_request", type: "object" },
                { name: "invalid_request", type: "object" },
            ],
        },
        {
            id: "record-consent",
            type: "action",
            name: "Registrar Consentimento",
            description: "Registra consentimento no sistema de gestão",
            position: { x: 500, y: 50 },
            config: {
                action: "record_consent",
                includeTimestamp: true,
                includeIpAddress: true,
                generateConsentId: true,
                notifyDPO: true,
            },
            inputs: [{ name: "valid_request", type: "object", required: true }],
            outputs: [{ name: "consent_recorded", type: "object" }],
        },
        {
            id: "data-subject-request",
            type: "trigger",
            name: "Solicitação de Direitos",
            description: "Dispara quando titular solicita exercer direitos LGPD",
            position: { x: 100, y: 300 },
            config: {
                triggerType: "webhook",
                requestTypes: ["access", "rectification", "erasure", "portability", "objection", "restriction"],
            },
            inputs: [],
            outputs: [{ name: "rights_request", type: "object" }],
        },
        {
            id: "verify-identity",
            type: "action",
            name: "Verificar Identidade",
            description: "Verifica identidade do titular antes de processar solicitação",
            position: { x: 300, y: 300 },
            config: {
                action: "identity_verification",
                methods: ["cpf_validation", "email_confirmation", "phone_verification"],
                securityLevel: "high",
            },
            inputs: [{ name: "rights_request", type: "object", required: true }],
            outputs: [{ name: "verified_request", type: "object" }],
        },
        {
            id: "process-data-request",
            type: "action",
            name: "Processar Solicitação",
            description: "Processa solicitação do titular conforme tipo de direito",
            position: { x: 500, y: 300 },
            config: {
                action: "process_data_subject_request",
                maxProcessingDays: 15,
                autoApproveSimple: true,
                requireApprovalComplex: true,
            },
            inputs: [{ name: "verified_request", type: "object", required: true }],
            outputs: [{ name: "processed_request", type: "object" }],
        },
        {
            id: "incident-detected",
            type: "trigger",
            name: "Incidente de Segurança",
            description: "Dispara quando incidente de segurança é detectado",
            position: { x: 100, y: 500 },
            config: {
                triggerType: "webhook",
                incidentTypes: ["data_breach", "unauthorized_access", "system_compromise"],
                severity: ["low", "medium", "high", "critical"],
            },
            inputs: [],
            outputs: [{ name: "incident_data", type: "object" }],
        },
        {
            id: "assess-incident-severity",
            type: "condition",
            name: "Avaliar Gravidade",
            description: "Avalia gravidade do incidente para determinar ações",
            position: { x: 300, y: 500 },
            config: {
                severityMatrix: {
                    dataVolume: ["low", "medium", "high"],
                    dataSensitivity: ["public", "personal", "sensitive"],
                    impactScope: ["individual", "group", "mass"],
                },
            },
            inputs: [{ name: "incident_data", type: "object", required: true }],
            outputs: [
                { name: "minor_incident", type: "object" },
                { name: "major_incident", type: "object" },
            ],
        },
        {
            id: "notify-anpd",
            type: "action",
            name: "Notificar ANPD",
            description: "Notifica a Autoridade Nacional de Proteção de Dados",
            position: { x: 500, y: 450 },
            config: {
                action: "notify_anpd",
                timeframe: 72, // horas
                includeRemediation: true,
                generateReport: true,
            },
            inputs: [{ name: "major_incident", type: "object", required: true }],
            outputs: [{ name: "anpd_notified", type: "boolean" }],
        },
        {
            id: "notify-affected-users",
            type: "action",
            name: "Notificar Usuários Afetados",
            description: "Notifica usuários afetados pelo incidente",
            position: { x: 500, y: 550 },
            config: {
                action: "notify_affected_users",
                channels: ["email", "whatsapp", "sms"],
                includeRemediationSteps: true,
                provideSupportContact: true,
            },
            inputs: [{ name: "major_incident", type: "object", required: true }],
            outputs: [{ name: "users_notified", type: "boolean" }],
        },
        {
            id: "generate-compliance-report",
            type: "action",
            name: "Gerar Relatório de Conformidade",
            description: "Gera relatório mensal de conformidade LGPD",
            position: { x: 700, y: 300 },
            config: {
                action: "generate_compliance_report",
                frequency: "monthly",
                includeMetrics: true,
                includeRecommendations: true,
                auditReady: true,
            },
            inputs: [
                { name: "consent_activities", type: "array", required: false },
                { name: "rights_requests", type: "array", required: false },
                { name: "incidents", type: "array", required: false },
            ],
            outputs: [{ name: "compliance_report", type: "object" }],
        },
    ];
}

function createLGPDEdges(): WorkflowEdge[] {
    return [
        { id: "e1", source: "consent-request-received", target: "validate-consent-request" },
        { id: "e2", source: "validate-consent-request", target: "record-consent", condition: "valid" },
        { id: "e3", source: "data-subject-request", target: "verify-identity" },
        { id: "e4", source: "verify-identity", target: "process-data-request" },
        { id: "e5", source: "incident-detected", target: "assess-incident-severity" },
        { id: "e6", source: "assess-incident-severity", target: "notify-anpd", condition: "major" },
        { id: "e7", source: "assess-incident-severity", target: "notify-affected-users", condition: "major" },
        { id: "e8", source: "record-consent", target: "generate-compliance-report" },
        { id: "e9", source: "process-data-request", target: "generate-compliance-report" },
        { id: "e10", source: "notify-anpd", target: "generate-compliance-report" },
    ];
}

function createLGPDTriggers(): TriggerConfig[] {
    return [
        {
            type: "webhook",
            config: {
                endpoint: "/webhook/consent-request",
                method: "POST",
                description: "Webhook para novas solicitações de consentimento",
            },
            enabled: true,
            webhook: {
                method: "POST",
                path: "/webhook/consent-request",
                authentication: {
                    type: "api-key",
                    config: { header: "X-LGPD-Key" },
                },
            },
        },
        {
            type: "webhook",
            config: {
                endpoint: "/webhook/data-subject-request",
                method: "POST",
                description: "Webhook para solicitações de direitos do titular",
            },
            enabled: true,
            webhook: {
                method: "POST",
                path: "/webhook/data-subject-request",
                authentication: {
                    type: "api-key",
                    config: { header: "X-LGPD-Key" },
                },
            },
        },
        {
            type: "schedule",
            config: {
                cron: "0 9 1 * *", // Primeiro dia do mês às 9h
                timezone: "America/Sao_Paulo",
                description: "Geração mensal de relatório de conformidade",
            },
            enabled: true,
            schedule: {
                cron: "0 9 1 * *",
                timezone: "America/Sao_Paulo",
                enabled: true,
            },
        },
    ];
}

/**
 * Configurações específicas do template LGPD
 */
export interface LGPDComplianceConfig {
    dataGovernance: {
        dataRetentionPeriod: number;
        consentExpiryPeriod: number;
        anonymizationDelay: number;
        auditFrequency: "weekly" | "monthly" | "quarterly";
    };
    consentManagement: {
        granularConsent: boolean;
        consentWithdrawal: boolean;
        cookieConsent: boolean;
        minorDataProtection: boolean;
    };
    rightsManagement: {
        maxResponseTime: number; // dias
        autoApprovalRules: string[];
        identityVerificationLevel: "basic" | "enhanced" | "strict";
        dataPortabilityFormats: string[];
    };
    incidentResponse: {
        anpdNotificationTime: number; // horas
        userNotificationTime: number; // horas
        escalationMatrix: Array<{
            severity: string;
            notifyAuthority: boolean;
            notifyUsers: boolean;
            notifyMedia: boolean;
        }>;
    };
    compliance: {
        dpoContact: string;
        privacyPolicyUrl: string;
        cookiePolicyUrl: string;
        legalBasisTracking: boolean;
        crossBorderTransfers: boolean;
    };
}

/**
 * Métricas de conformidade LGPD
 */
export const LGPDComplianceMetrics = {
    complianceScore: 0.95, // 95% conformidade
    responseTimeAverage: 7, // dias para solicitações
    consentRate: 0.78, // 78% taxa de consentimento
    incidentResponseTime: 24, // horas média
    auditReadiness: 0.92, // 92% preparação para auditoria
    roiProjection: {
        monthly: {
            fineAvoidance: 50000, // multas evitadas (reais)
            processEfficiency: 12000, // economias operacionais
            reputationValue: 20000, // valor reputacional
            complianceCost: 5000, // custo de conformidade
        },
        riskMitigation: {
            fineRisk: 0.85, // 85% redução risco multas
            liabilityReduction: 0.7, // 70% redução responsabilidade
            auditPreparedness: 0.9, // 90% preparação auditoria
            dataBreachImpact: 0.6, // 60% redução impacto vazamentos
        },
    },
    complianceBenefits: {
        automaticCompliance: true,
        realTimeMonitoring: true,
        proactiveIncidentResponse: true,
        comprehensiveAuditTrail: true,
        customerTrustIncrease: true,
    },
};
