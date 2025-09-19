/**
 * Template de Gestão de Estoque Automatizada para PMEs Brasileiras
 *
 * Este template automatiza a gestão de estoque com alertas automáticos,
 * reposição inteligente, controle de validade, e integração com ERPs
 * brasileiros para manter níveis ótimos de inventário.
 *
 * Integra com:
 * - ERPs brasileiros (Omie, Bling, Tiny, ContaAzul)
 * - WhatsApp Business para notificações
 * - Email para relatórios
 * - APIs de fornecedores
 */

import { WorkflowTemplate, WorkflowTemplateCategory, BrazilianIndustryType } from "./BrazilianWorkflowTemplateManager";
import { WorkflowNode, WorkflowEdge, TriggerConfig } from "../types";

export function createInventoryManagementTemplate(): WorkflowTemplate {
    return {
        id: "inventory-management-template",
        name: "Gestão Automatizada de Estoque",
        description:
            "Sistema inteligente de gestão de estoque com alertas automáticos, controle de validade e reposição inteligente",
        category: "inventory_management" as WorkflowTemplateCategory,
        industry: "retail" as BrazilianIndustryType,
        complexity: "advanced",
        estimatedSetupTime: 120,
        estimatedROI: {
            timeSavedPerMonth: 60,
            costSavingsPerMonth: 8000,
            revenueImpactPerMonth: 15000,
        },
        tags: ["estoque", "inventario", "reposicao", "validade", "erp", "alertas", "automacao"],
        brazilianSpecific: {
            requiresCPFCNPJ: false,
            requiresPIX: false,
            requiresWhatsApp: true,
            requiresERP: true,
            complianceRequired: ["ANVISA"], // Para produtos com validade
        },
        template: {
            nodes: createInventoryNodes(),
            edges: createInventoryEdges(),
            triggers: createInventoryTriggers(),
            variables: {
                minimumStockLevel: 10,
                reorderPoint: 20,
                maxStockLevel: 100,
                expiryAlertDays: 30,
                criticalStockLevel: 5,
                autoReorderEnabled: true,
                businessHours: {
                    start: "08:00",
                    end: "18:00",
                    timezone: "America/Sao_Paulo",
                },
            },
            metadata: {
                inventorySystem: true,
                multiERP: true,
                smartReordering: true,
                expiryControl: true,
            },
        },
        configurationSteps: [
            {
                id: "erp-setup",
                title: "Configurar Integração ERP",
                description: "Configure a conexão com seu sistema ERP",
                order: 1,
                required: true,
                type: "integration_setup",
                instructions: "Configure as credenciais do ERP para sincronização de estoque",
            },
            {
                id: "stock-rules",
                title: "Definir Regras de Estoque",
                description: "Configure níveis mínimos, máximos e pontos de reposição",
                order: 2,
                required: true,
                type: "variable_configuration",
                instructions: "Defina os parâmetros de controle de estoque para cada categoria",
            },
            {
                id: "notification-setup",
                title: "Configurar Notificações",
                description: "Configure alertas via WhatsApp e email",
                order: 3,
                required: true,
                type: "integration_setup",
                instructions: "Configure canais de notificação para gestores e compradores",
            },
            {
                id: "supplier-integration",
                title: "Integrar Fornecedores",
                description: "Configure APIs ou emails de fornecedores para reposição automática",
                order: 4,
                required: false,
                type: "integration_setup",
                instructions: "Configure integração com fornecedores para pedidos automáticos",
            },
        ],
        prerequisites: [
            {
                id: "erp-system",
                type: "integration",
                name: "Sistema ERP",
                description: "ERP com API de estoque (Omie, Bling, Tiny, ContaAzul)",
                required: true,
            },
            {
                id: "whatsapp-business",
                type: "integration",
                name: "WhatsApp Business",
                description: "WhatsApp Business API para notificações",
                required: true,
            },
            {
                id: "inventory-data",
                type: "technical",
                name: "Dados de Estoque",
                description: "Cadastro completo de produtos no ERP",
                required: true,
            },
        ],
        supportedIntegrations: ["erp", "whatsapp", "email", "supplier_apis"],
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0,
        rating: 4.8,
        version: "1.0.0",
    };
}

function createInventoryNodes(): WorkflowNode[] {
    return [
        {
            id: "stock-level-monitor",
            type: "trigger",
            name: "Monitor de Níveis de Estoque",
            description: "Monitora níveis de estoque em tempo real",
            position: { x: 100, y: 100 },
            config: {
                triggerType: "schedule",
                interval: "*/30 * * * *", // A cada 30 minutos
                erpIntegration: {
                    endpoint: "/api/inventory/levels",
                    method: "GET",
                },
            },
            inputs: [],
            outputs: [{ name: "inventory_data", type: "array" }],
        },
        {
            id: "check-stock-levels",
            type: "condition",
            name: "Verificar Níveis Críticos",
            description: "Identifica produtos com estoque baixo ou crítico",
            position: { x: 300, y: 100 },
            config: {
                conditions: [
                    {
                        field: "current_stock",
                        operator: "less_than",
                        value: "minimum_stock_level",
                    },
                    {
                        field: "current_stock",
                        operator: "less_than",
                        value: "critical_stock_level",
                    },
                ],
            },
            inputs: [{ name: "inventory_data", type: "array", required: true }],
            outputs: [
                { name: "low_stock_items", type: "array" },
                { name: "critical_stock_items", type: "array" },
                { name: "normal_stock_items", type: "array" },
            ],
        },
        {
            id: "check-expiry-dates",
            type: "action",
            name: "Verificar Datas de Validade",
            description: "Identifica produtos próximos ao vencimento",
            position: { x: 500, y: 50 },
            config: {
                action: "expiry_date_check",
                alertDays: 30, // 30 dias antes do vencimento
                categories: ["alimentos", "medicamentos", "cosmeticos"],
            },
            inputs: [{ name: "inventory_data", type: "array", required: true }],
            outputs: [{ name: "expiring_items", type: "array" }],
        },
        {
            id: "send-critical-alert",
            type: "action",
            name: "Enviar Alerta Crítico",
            description: "Envia alerta urgente para gestores via WhatsApp",
            position: { x: 500, y: 150 },
            config: {
                action: "whatsapp_send_urgent_alert",
                recipients: ["manager", "buyer"],
                template: "critical_stock_alert",
                priority: "high",
            },
            inputs: [{ name: "critical_stock_items", type: "array", required: true }],
            outputs: [{ name: "alert_sent", type: "boolean" }],
        },
        {
            id: "generate-reorder-suggestions",
            type: "action",
            name: "Gerar Sugestões de Reposição",
            description: "Calcula quantidades ideais para reposição baseado em histórico",
            position: { x: 700, y: 100 },
            config: {
                action: "calculate_reorder_quantities",
                algorithm: "smart_reorder",
                factors: ["sales_velocity", "seasonality", "lead_time", "supplier_minimum"],
            },
            inputs: [{ name: "low_stock_items", type: "array", required: true }],
            outputs: [{ name: "reorder_suggestions", type: "array" }],
        },
        {
            id: "auto-create-purchase-orders",
            type: "action",
            name: "Criar Pedidos de Compra Automáticos",
            description: "Cria pedidos de compra automaticamente para fornecedores",
            position: { x: 900, y: 100 },
            config: {
                action: "create_purchase_orders",
                autoApprovalLimit: 5000, // R$ 5.000,00
                requiresApproval: true,
                erpIntegration: true,
            },
            inputs: [{ name: "reorder_suggestions", type: "array", required: true }],
            outputs: [{ name: "purchase_orders", type: "array" }],
        },
        {
            id: "send-reorder-notifications",
            type: "action",
            name: "Notificar Necessidade de Reposição",
            description: "Envia notificações sobre necessidade de reposição",
            position: { x: 1100, y: 100 },
            config: {
                action: "send_reorder_notifications",
                channels: ["whatsapp", "email"],
                includePriceComparison: true,
                suggestAlternativeSuppliers: true,
            },
            inputs: [{ name: "reorder_suggestions", type: "array", required: true }],
            outputs: [{ name: "notifications_sent", type: "boolean" }],
        },
        {
            id: "generate-inventory-report",
            type: "action",
            name: "Gerar Relatório de Estoque",
            description: "Gera relatório consolidado de situação do estoque",
            position: { x: 1300, y: 100 },
            config: {
                action: "generate_inventory_report",
                frequency: "daily",
                includeGraphics: true,
                metrics: ["turnover", "dead_stock", "profitability", "availability"],
            },
            inputs: [
                { name: "inventory_data", type: "array", required: true },
                { name: "expiring_items", type: "array", required: false },
            ],
            outputs: [{ name: "inventory_report", type: "object" }],
        },
        {
            id: "update-erp-system",
            type: "action",
            name: "Atualizar Sistema ERP",
            description: "Sincroniza dados processados de volta para o ERP",
            position: { x: 1500, y: 100 },
            config: {
                action: "erp_sync_back",
                updateFields: ["reorder_point", "stock_alerts", "supplier_suggestions"],
                batchSize: 100,
            },
            inputs: [{ name: "processed_data", type: "object", required: true }],
            outputs: [{ name: "sync_completed", type: "boolean" }],
        },
    ];
}

function createInventoryEdges(): WorkflowEdge[] {
    return [
        { id: "e1", source: "stock-level-monitor", target: "check-stock-levels" },
        { id: "e2", source: "stock-level-monitor", target: "check-expiry-dates" },
        { id: "e3", source: "check-stock-levels", target: "send-critical-alert", condition: "has_critical_items" },
        { id: "e4", source: "check-stock-levels", target: "generate-reorder-suggestions", condition: "has_low_stock" },
        { id: "e5", source: "generate-reorder-suggestions", target: "auto-create-purchase-orders" },
        { id: "e6", source: "generate-reorder-suggestions", target: "send-reorder-notifications" },
        { id: "e7", source: "check-expiry-dates", target: "generate-inventory-report" },
        { id: "e8", source: "send-reorder-notifications", target: "generate-inventory-report" },
        { id: "e9", source: "generate-inventory-report", target: "update-erp-system" },
    ];
}

function createInventoryTriggers(): TriggerConfig[] {
    return [
        {
            type: "schedule",
            config: {
                cron: "0 */6 * * *", // A cada 6 horas
                timezone: "America/Sao_Paulo",
                description: "Verificação regular de níveis de estoque",
            },
            enabled: true,
            schedule: {
                cron: "0 */6 * * *",
                timezone: "America/Sao_Paulo",
                enabled: true,
            },
        },
        {
            type: "webhook",
            config: {
                endpoint: "/webhook/erp-stock-update",
                method: "POST",
                description: "Trigger quando ERP notifica mudanças no estoque",
            },
            enabled: true,
            webhook: {
                method: "POST",
                path: "/webhook/erp-stock-update",
                authentication: {
                    type: "api-key",
                    config: { header: "X-API-Key" },
                },
            },
        },
    ];
}

/**
 * Configurações específicas do template de gestão de estoque
 */
export interface InventoryManagementConfig {
    erpIntegration: {
        provider: "omie" | "bling" | "tiny" | "contaazul" | "custom";
        apiKey: string;
        endpoint: string;
        syncFrequency: number; // minutos
    };
    stockRules: {
        minimumStockLevel: number;
        reorderPoint: number;
        maxStockLevel: number;
        criticalStockLevel: number;
        autoReorderEnabled: boolean;
    };
    expiryControl: {
        enabled: boolean;
        alertDays: number;
        categories: string[];
        complianceRequired: boolean;
    };
    notifications: {
        whatsappEnabled: boolean;
        emailEnabled: boolean;
        urgentThreshold: number;
        businessHoursOnly: boolean;
    };
    suppliers: {
        autoOrderEnabled: boolean;
        approvalLimit: number;
        defaultSuppliers: Array<{
            id: string;
            name: string;
            apiEndpoint?: string;
            email?: string;
            minimumOrder: number;
        }>;
    };
}

/**
 * Métricas e KPIs do template de gestão de estoque
 */
export const InventoryManagementMetrics = {
    stockoutReduction: 0.75, // 75% redução de rupturas
    inventoryTurnover: 1.4, // 40% melhoria no giro
    carryingCostReduction: 0.25, // 25% redução custos de estoque
    orderAccuracy: 0.95, // 95% precisão em pedidos
    timeSavedPerMonth: 60, // horas economizadas
    roiProjection: {
        monthly: {
            costSavings: 8000, // reais economizados
            revenueImpact: 15000, // reais de impacto
            efficiencyGain: 0.4, // 40% melhoria eficiência
            stockOptimization: 0.3, // 30% otimização estoque
        },
        annual: {
            totalSavings: 96000, // reais por ano
            revenueIncrease: 180000, // reais por ano
            paybackPeriod: 2.5, // meses para ROI
        },
    },
    integrationBenefits: {
        realTimeVisibility: true,
        predictiveReordering: true,
        supplierAutomation: true,
        complianceTracking: true,
        multiLocationSync: true,
    },
};
