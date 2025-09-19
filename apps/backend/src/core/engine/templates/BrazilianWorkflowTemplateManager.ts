import { WorkflowDefinition, WorkflowNode, WorkflowEdge, TriggerConfig } from "../types";
import { createWhatsAppCRMTemplate } from "./WhatsAppCRMTemplate";
import { createPIXPaymentTemplate } from "./PIXPaymentTemplate";
import { createERPWhatsAppTemplate } from "./ERPWhatsAppTemplate";
import { createCustomerOnboardingTemplate } from "./CustomerOnboardingTemplate";
import { createInventoryManagementTemplate } from "./InventoryManagementTemplate";
import { createComplianceLGPDTemplate } from "./ComplianceLGPDTemplate";

/**
 * Template de Workflow para PMEs Brasileiras
 *
 * Define estruturas pré-configuradas para automações comuns
 * no mercado brasileiro, com configurações específicas regionais.
 */
export interface WorkflowTemplate {
    id: string;
    name: string;
    description: string;
    category: WorkflowTemplateCategory;
    industry: BrazilianIndustryType;
    complexity: "basic" | "intermediate" | "advanced";
    estimatedSetupTime: number; // em minutos
    estimatedROI: {
        timeSavedPerMonth: number; // horas
        costSavingsPerMonth: number; // reais
        revenueImpactPerMonth: number; // reais
    };
    tags: string[];
    brazilianSpecific: {
        requiresCPFCNPJ: boolean;
        requiresPIX: boolean;
        requiresWhatsApp: boolean;
        requiresERP: boolean;
        complianceRequired: string[]; // LGPD, ANVISA, etc.
    };
    template: {
        nodes: WorkflowNode[];
        edges: WorkflowEdge[];
        triggers: TriggerConfig[];
        variables: Record<string, any>;
        metadata: Record<string, any>;
    };
    configurationSteps: TemplateConfigurationStep[];
    prerequisites: TemplatePrerequisite[];
    supportedIntegrations: string[];
    createdAt: Date;
    updatedAt: Date;
    usageCount: number;
    rating: number;
    version: string;
}

export type WorkflowTemplateCategory =
    | "customer_service" // Atendimento ao cliente
    | "sales_automation" // Automação de vendas
    | "financial_management" // Gestão financeira
    | "inventory_management" // Gestão de estoque
    | "marketing_automation" // Automação de marketing
    | "compliance_automation" // Automação de compliance
    | "operational_efficiency" // Eficiência operacional
    | "customer_onboarding"; // Onboarding de clientes

export type BrazilianIndustryType =
    | "e_commerce" // E-commerce
    | "retail" // Varejo
    | "services" // Serviços
    | "healthcare" // Saúde
    | "education" // Educação
    | "real_estate" // Imobiliário
    | "food_beverage" // Alimentício
    | "beauty_wellness" // Beleza e bem-estar
    | "automotive" // Automotivo
    | "technology" // Tecnologia
    | "manufacturing" // Manufatura
    | "logistics" // Logística
    | "financial_services" // Serviços financeiros
    | "consulting" // Consultoria
    | "general"; // Geral

export interface TemplateConfigurationStep {
    id: string;
    title: string;
    description: string;
    order: number;
    required: boolean;
    type: "integration_setup" | "variable_configuration" | "validation" | "testing";
    instructions: string;
    validationRules?: {
        field: string;
        rule: "required" | "cpf" | "cnpj" | "phone" | "email" | "url";
        message: string;
    }[];
}

export interface TemplatePrerequisite {
    id: string;
    type: "integration" | "subscription" | "technical" | "legal";
    name: string;
    description: string;
    required: boolean;
    documentationUrl?: string;
    estimatedCost?: {
        monthly: number;
        setup: number;
        currency: "BRL";
    };
}

/**
 * Gerenciador de Templates para PMEs Brasileiras
 *
 * Responsável por carregar, validar e instanciar templates
 * de workflow específicos para o mercado brasileiro.
 */
export class BrazilianWorkflowTemplateManager {
    private templates: Map<string, WorkflowTemplate> = new Map();
    private categories: Map<WorkflowTemplateCategory, WorkflowTemplate[]> = new Map();
    private industries: Map<BrazilianIndustryType, WorkflowTemplate[]> = new Map();

    constructor() {
        this.initializeDefaultTemplates();
    }

    /**
     * Inicializa templates padrão para PMEs brasileiras
     */
    private initializeDefaultTemplates(): void {
        // Carregar templates implementados
        const defaultTemplates = [
            createWhatsAppCRMTemplate(),
            createPIXPaymentTemplate(),
            createERPWhatsAppTemplate(),
            createCustomerOnboardingTemplate(),
            createInventoryManagementTemplate(),
            createComplianceLGPDTemplate(),
            this.createSalesFollowUpTemplate(),
        ];

        defaultTemplates.forEach((template) => {
            this.addTemplate(template);
        });
    }

    /**
     * Adiciona template ao gerenciador
     */
    addTemplate(template: WorkflowTemplate): void {
        this.templates.set(template.id, template);

        // Indexar por categoria
        if (!this.categories.has(template.category)) {
            this.categories.set(template.category, []);
        }
        this.categories.get(template.category)!.push(template);

        // Indexar por indústria
        if (!this.industries.has(template.industry)) {
            this.industries.set(template.industry, []);
        }
        this.industries.get(template.industry)!.push(template);
    }

    /**
     * Busca templates por categoria
     */
    getTemplatesByCategory(category: WorkflowTemplateCategory): WorkflowTemplate[] {
        return this.categories.get(category) || [];
    }

    /**
     * Busca templates por indústria
     */
    getTemplatesByIndustry(industry: BrazilianIndustryType): WorkflowTemplate[] {
        return this.industries.get(industry) || [];
    }

    /**
     * Busca template específico
     */
    getTemplate(id: string): WorkflowTemplate | undefined {
        return this.templates.get(id);
    }

    /**
     * Busca templates com filtros
     */
    searchTemplates(filters: {
        category?: WorkflowTemplateCategory;
        industry?: BrazilianIndustryType;
        complexity?: "basic" | "intermediate" | "advanced";
        tags?: string[];
        requiresIntegration?: string;
    }): WorkflowTemplate[] {
        let results = Array.from(this.templates.values());

        if (filters.category) {
            results = results.filter((t) => t.category === filters.category);
        }

        if (filters.industry) {
            results = results.filter((t) => t.industry === filters.industry);
        }

        if (filters.complexity) {
            results = results.filter((t) => t.complexity === filters.complexity);
        }

        if (filters.tags && filters.tags.length > 0) {
            results = results.filter((t) => filters.tags!.some((tag) => t.tags.includes(tag)));
        }

        if (filters.requiresIntegration) {
            results = results.filter((t) => t.supportedIntegrations.includes(filters.requiresIntegration!));
        }

        return results.sort((a, b) => b.rating - a.rating);
    }

    /**
     * Instancia workflow a partir de template
     */
    instantiateTemplate(
        templateId: string,
        organizationId: string,
        userId: string,
        customizations?: {
            name?: string;
            variables?: Record<string, any>;
            integrationConfigs?: Record<string, any>;
        }
    ): WorkflowDefinition {
        const template = this.getTemplate(templateId);
        if (!template) {
            throw new Error(`Template não encontrado: ${templateId}`);
        }

        const workflow: WorkflowDefinition = {
            id: `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: customizations?.name || template.name,
            description: template.description,
            organizationId,
            version: 1,
            status: "draft",
            triggers: template.template.triggers,
            nodes: template.template.nodes.map((node) => ({
                ...node,
                id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                config: {
                    ...node.config,
                    ...(customizations?.integrationConfigs?.[node.type] || {}),
                },
            })),
            variables: {
                ...template.template.variables,
                ...(customizations?.variables || {}),
            },
            metadata: {
                ...template.template.metadata,
                templateId: template.id,
                templateVersion: template.version,
                instantiatedAt: new Date(),
                brazilianSpecific: template.brazilianSpecific,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: userId,
        };

        // As edges serão recriadas com os novos IDs quando o workflow for salvo
        // TODO: Implementar mapeamento de edges quando necessário

        // Incrementar contador de uso
        template.usageCount++;

        return workflow;
    }

    /**
     * Valida se template pode ser usado pela organização
     */
    validateTemplateCompatibility(
        templateId: string,
        organizationProfile: {
            industry: BrazilianIndustryType;
            size: "micro" | "small" | "medium";
            availableIntegrations: string[];
            complianceRequirements: string[];
        }
    ): {
        compatible: boolean;
        issues: string[];
        recommendations: string[];
    } {
        const template = this.getTemplate(templateId);
        if (!template) {
            return {
                compatible: false,
                issues: ["Template não encontrado"],
                recommendations: [],
            };
        }

        const issues: string[] = [];
        const recommendations: string[] = [];

        // Verificar integrações necessárias
        const missingIntegrations = template.supportedIntegrations.filter(
            (integration) => !organizationProfile.availableIntegrations.includes(integration)
        );

        if (missingIntegrations.length > 0) {
            issues.push(`Integrações necessárias não disponíveis: ${missingIntegrations.join(", ")}`);
            recommendations.push("Configure as integrações necessárias antes de usar este template");
        }

        // Verificar compliance
        const missingCompliance = template.brazilianSpecific.complianceRequired.filter(
            (requirement) => !organizationProfile.complianceRequirements.includes(requirement)
        );

        if (missingCompliance.length > 0) {
            issues.push(`Requisitos de compliance não atendidos: ${missingCompliance.join(", ")}`);
            recommendations.push("Verifique os requisitos legais antes de implementar");
        }

        return {
            compatible: issues.length === 0,
            issues,
            recommendations,
        };
    }

    // Templates específicos implementados nos arquivos dedicados

    private createSalesFollowUpTemplate(): WorkflowTemplate {
        return {
            id: "sales_followup_template",
            name: "Follow-up de Vendas",
            description: "Sequência automatizada de follow-up pós-venda",
            category: "sales_automation",
            industry: "general",
            complexity: "intermediate",
            estimatedSetupTime: 30,
            estimatedROI: {
                timeSavedPerMonth: 20,
                costSavingsPerMonth: 2000,
                revenueImpactPerMonth: 5000,
            },
            tags: ["vendas", "follow-up", "automacao"],
            brazilianSpecific: {
                requiresCPFCNPJ: false,
                requiresPIX: false,
                requiresWhatsApp: true,
                requiresERP: false,
                complianceRequired: [],
            },
            template: {
                nodes: [],
                edges: [],
                triggers: [],
                variables: {},
                metadata: {},
            },
            configurationSteps: [],
            prerequisites: [],
            supportedIntegrations: ["whatsapp", "crm"],
            createdAt: new Date(),
            updatedAt: new Date(),
            usageCount: 0,
            rating: 4.5,
            version: "1.0.0",
        };
    }
}
