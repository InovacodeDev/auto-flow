import { WorkflowTemplate, WorkflowTemplateCategory, BrazilianIndustryType } from "./BrazilianWorkflowTemplateManager";
import { WorkflowNode, WorkflowEdge, TriggerConfig } from "../types";

/**
 * Template: Integração ERP + WhatsApp
 *
 * Automação para notificações do ERP via WhatsApp para PMEs brasileiras.
 * Compatível com ERPs nacionais: Omie, Bling, Tiny, ContaAzul.
 *
 * Fluxo:
 * 1. Monitora eventos do ERP (webhook/polling)
 * 2. Processa evento (nova venda, produto em falta, etc.)
 * 3. Identifica destinatários (cliente, gerente, equipe)
 * 4. Gera mensagem personalizada baseada no evento
 * 5. Envia notificação via WhatsApp
 * 6. Registra notificação no sistema
 * 7. Agenda follow-ups se necessário
 */
export function createERPWhatsAppTemplate(): WorkflowTemplate {
    const nodes: WorkflowNode[] = [
        // 1. Trigger: Webhook do ERP
        {
            id: "trigger_erp_webhook",
            type: "webhook_trigger",
            name: "Evento ERP",
            description: "Recebe webhooks do sistema ERP",
            position: { x: 100, y: 100 },
            config: {
                webhookPath: "/webhook/erp-event",
                method: "POST",
                authentication: {
                    type: "api-key",
                    config: {
                        keyField: "x-api-key",
                        headerName: "X-API-Key",
                    },
                },
                expectedPayload: {
                    event_type: "string",
                    entity_type: "string",
                    entity_id: "string",
                    data: "object",
                },
            },
            inputs: [],
            outputs: [
                { name: "eventType", type: "string", description: "Tipo do evento ERP" },
                { name: "entityType", type: "string", description: "Tipo da entidade" },
                { name: "entityId", type: "string", description: "ID da entidade" },
                { name: "eventData", type: "object", description: "Dados do evento" },
                { name: "timestamp", type: "string", description: "Timestamp do evento" },
            ],
            enabled: true,
        },

        // 2. Filtrar eventos relevantes
        {
            id: "filter_relevant_events",
            type: "condition",
            name: "Filtrar Eventos",
            description: "Filtra apenas eventos que precisam de notificação",
            position: { x: 100, y: 250 },
            config: {
                condition: `
                    eventType === 'order_created' || 
                    eventType === 'product_low_stock' || 
                    eventType === 'payment_received' || 
                    eventType === 'order_shipped' || 
                    eventType === 'order_delivered' || 
                    eventType === 'customer_created' ||
                    eventType === 'product_out_of_stock'
                `,
                trueFlow: "process_event",
                falseFlow: "end_workflow",
            },
            inputs: [{ name: "eventType", type: "string", required: true, description: "Tipo do evento" }],
            outputs: [{ name: "shouldProcess", type: "boolean", description: "Deve processar evento" }],
            enabled: true,
        },

        // 3. Buscar dados detalhados da entidade
        {
            id: "fetch_entity_details",
            type: "erp_api_call",
            name: "Buscar Detalhes ERP",
            description: "Busca dados completos da entidade no ERP",
            position: { x: 100, y: 400 },
            config: {
                endpoint: "/{{entityType}}/{{entityId}}",
                method: "GET",
                headers: {
                    Authorization: "Bearer {{erpAccessToken}}",
                    "Content-Type": "application/json",
                },
            },
            inputs: [
                { name: "entityType", type: "string", required: true, description: "Tipo da entidade" },
                { name: "entityId", type: "string", required: true, description: "ID da entidade" },
            ],
            outputs: [
                { name: "entityDetails", type: "object", description: "Detalhes completos da entidade" },
                { name: "customerData", type: "object", description: "Dados do cliente (se aplicável)" },
                { name: "productData", type: "object", description: "Dados do produto (se aplicável)" },
            ],
            enabled: true,
        },

        // 4. Determinar destinatários
        {
            id: "determine_recipients",
            type: "data_transformer",
            name: "Determinar Destinatários",
            description: "Define quem deve receber a notificação",
            position: { x: 100, y: 550 },
            config: {
                rules: [
                    {
                        condition: 'eventType === "order_created"',
                        recipients: ["customer", "sales_team"],
                        priority: "high",
                    },
                    {
                        condition: 'eventType === "product_low_stock"',
                        recipients: ["inventory_manager"],
                        priority: "medium",
                    },
                    {
                        condition: 'eventType === "payment_received"',
                        recipients: ["customer", "financial_team"],
                        priority: "high",
                    },
                    {
                        condition: 'eventType === "order_shipped"',
                        recipients: ["customer"],
                        priority: "high",
                    },
                    {
                        condition: 'eventType === "order_delivered"',
                        recipients: ["customer", "sales_team"],
                        priority: "medium",
                    },
                ],
            },
            inputs: [
                { name: "eventType", type: "string", required: true, description: "Tipo do evento" },
                { name: "entityDetails", type: "object", required: true, description: "Detalhes da entidade" },
            ],
            outputs: [
                { name: "recipients", type: "array", description: "Lista de destinatários" },
                { name: "priority", type: "string", description: "Prioridade da notificação" },
            ],
            enabled: true,
        },

        // 5. Buscar contatos dos destinatários
        {
            id: "fetch_recipient_contacts",
            type: "database_query",
            name: "Buscar Contatos",
            description: "Busca números WhatsApp dos destinatários",
            position: { x: 100, y: 700 },
            config: {
                query: `
                    SELECT 
                        type,
                        phone,
                        name,
                        preferences
                    FROM notification_contacts 
                    WHERE type = ANY({{recipients}})
                    AND active = true
                    AND phone IS NOT NULL
                `,
                returnType: "array",
            },
            inputs: [{ name: "recipients", type: "array", required: true, description: "Tipos de destinatários" }],
            outputs: [
                { name: "contacts", type: "array", description: "Contatos para notificar" },
                { name: "contactCount", type: "number", description: "Quantidade de contatos" },
            ],
            enabled: true,
        },

        // 6. Gerar mensagem personalizada
        {
            id: "generate_notification_message",
            type: "ai_generate",
            name: "Gerar Mensagem",
            description: "Gera mensagem personalizada baseada no evento",
            position: { x: 100, y: 850 },
            config: {
                model: "gpt-3.5-turbo",
                prompt: `
                Gere uma mensagem WhatsApp para notificação ERP:
                
                Evento: {{eventType}}
                Entidade: {{entityType}}
                Dados: {{entityDetails}}
                Destinatário: {{recipient.type}}
                Nome: {{recipient.name}}
                
                Diretrizes por tipo de evento:
                
                order_created: "Novo pedido #{{orderNumber}} recebido! Cliente: {{customerName}}, Valor: R$ {{total}}"
                
                product_low_stock: "⚠️ ESTOQUE BAIXO: {{productName}} - Restam apenas {{stock}} unidades"
                
                payment_received: "✅ Pagamento confirmado! Pedido #{{orderNumber}} - R$ {{amount}}"
                
                order_shipped: "📦 Seu pedido #{{orderNumber}} foi enviado! Código de rastreamento: {{trackingCode}}"
                
                order_delivered: "🎉 Pedido #{{orderNumber}} entregue com sucesso!"
                
                Características:
                - Linguagem brasileira amigável
                - Emojis quando apropriado
                - Informações essenciais
                - Call-to-action se necessário
                - Máximo 300 caracteres
                
                Mensagem:
                `,
                maxTokens: 150,
            },
            inputs: [
                { name: "eventType", type: "string", required: true, description: "Tipo do evento" },
                { name: "entityType", type: "string", required: true, description: "Tipo da entidade" },
                { name: "entityDetails", type: "object", required: true, description: "Detalhes da entidade" },
                { name: "recipient", type: "object", required: true, description: "Dados do destinatário" },
            ],
            outputs: [{ name: "message", type: "string", description: "Mensagem personalizada" }],
            enabled: true,
        },

        // 7. Loop: Enviar para cada contato
        {
            id: "loop_send_notifications",
            type: "loop",
            name: "Enviar Notificações",
            description: "Envia notificação para cada contato",
            position: { x: 100, y: 1000 },
            config: {
                iteratorVariable: "contact",
                arrayPath: "contacts",
                maxIterations: 20,
            },
            inputs: [{ name: "contacts", type: "array", required: true, description: "Lista de contatos" }],
            outputs: [
                { name: "contact", type: "object", description: "Contato atual" },
                { name: "loopIndex", type: "number", description: "Índice atual" },
            ],
            enabled: true,
        },

        // 8. Verificar horário comercial
        {
            id: "check_business_hours",
            type: "condition",
            name: "Horário Comercial?",
            description: "Verifica se está no horário comercial",
            position: { x: 100, y: 1150 },
            config: {
                condition: `
                    const now = new Date();
                    const hour = now.getHours();
                    const day = now.getDay();
                    
                    // Segunda a sexta, 8h às 18h
                    const isWeekday = day >= 1 && day <= 5;
                    const isBusinessHour = hour >= 8 && hour <= 18;
                    
                    return isWeekday && isBusinessHour;
                `,
                trueFlow: "send_immediate",
                falseFlow: "schedule_for_business_hours",
            },
            inputs: [],
            outputs: [{ name: "isBusinessHours", type: "boolean", description: "É horário comercial" }],
            enabled: true,
        },

        // 9A. Enviar imediatamente
        {
            id: "send_immediate",
            type: "whatsapp_business",
            name: "Enviar Agora",
            description: "Envia notificação imediatamente",
            position: { x: 300, y: 1300 },
            config: {
                action: "sendMessage",
            },
            inputs: [
                { name: "to", type: "string", required: true, description: "Número destinatário" },
                { name: "message", type: "string", required: true, description: "Mensagem" },
            ],
            outputs: [
                { name: "messageId", type: "string", description: "ID da mensagem" },
                { name: "status", type: "string", description: "Status do envio" },
            ],
            enabled: true,
        },

        // 9B. Agendar para horário comercial
        {
            id: "schedule_for_business_hours",
            type: "schedule_action",
            name: "Agendar Envio",
            description: "Agenda envio para próximo horário comercial",
            position: { x: -100, y: 1300 },
            config: {
                scheduleType: "next_business_hour",
                timezone: "America/Sao_Paulo",
                businessHours: {
                    start: "08:00",
                    end: "18:00",
                    days: [1, 2, 3, 4, 5], // Segunda a sexta
                },
            },
            inputs: [
                { name: "contact", type: "object", required: true, description: "Dados do contato" },
                { name: "message", type: "string", required: true, description: "Mensagem" },
            ],
            outputs: [
                { name: "scheduledTime", type: "string", description: "Horário agendado" },
                { name: "scheduledId", type: "string", description: "ID do agendamento" },
            ],
            enabled: true,
        },

        // 10. Registrar notificação
        {
            id: "log_notification",
            type: "database_insert",
            name: "Registrar Notificação",
            description: "Registra notificação enviada no banco",
            position: { x: 100, y: 1450 },
            config: {
                table: "erp_notifications",
                fields: {
                    event_type: "{{eventType}}",
                    entity_type: "{{entityType}}",
                    entity_id: "{{entityId}}",
                    recipient_type: "{{contact.type}}",
                    recipient_phone: "{{contact.phone}}",
                    message: "{{message}}",
                    status: "{{status}}",
                    whatsapp_message_id: "{{messageId}}",
                    sent_at: "NOW()",
                    scheduled_for: "{{scheduledTime}}",
                },
            },
            inputs: [
                { name: "eventType", type: "string", required: true, description: "Tipo do evento" },
                { name: "entityType", type: "string", required: true, description: "Tipo da entidade" },
                { name: "entityId", type: "string", required: true, description: "ID da entidade" },
                { name: "contact", type: "object", required: true, description: "Dados do contato" },
                { name: "message", type: "string", required: true, description: "Mensagem" },
                { name: "status", type: "string", required: true, description: "Status" },
                { name: "messageId", type: "string", required: false, description: "ID da mensagem" },
                { name: "scheduledTime", type: "string", required: false, description: "Horário agendado" },
            ],
            outputs: [{ name: "notificationId", type: "string", description: "ID da notificação registrada" }],
            enabled: true,
        },

        // 11. Atualizar métricas
        {
            id: "update_metrics",
            type: "database_update",
            name: "Atualizar Métricas",
            description: "Atualiza métricas de notificações",
            position: { x: 100, y: 1600 },
            config: {
                table: "erp_notification_metrics",
                whereClause: "date = CURRENT_DATE AND event_type = {{eventType}}",
                updateFields: {
                    total_notifications: "total_notifications + 1",
                    successful_sends:
                        'CASE WHEN {{status}} = "sent" THEN successful_sends + 1 ELSE successful_sends END',
                    updated_at: "NOW()",
                },
                upsert: true,
            },
            inputs: [
                { name: "eventType", type: "string", required: true, description: "Tipo do evento" },
                { name: "status", type: "string", required: true, description: "Status do envio" },
            ],
            outputs: [{ name: "metricsUpdated", type: "boolean", description: "Métricas atualizadas" }],
            enabled: true,
        },
    ];

    const edges: WorkflowEdge[] = [
        { id: "e1", source: "trigger_erp_webhook", target: "filter_relevant_events" },
        {
            id: "e2",
            source: "filter_relevant_events",
            target: "fetch_entity_details",
            condition: "shouldProcess === true",
        },
        { id: "e3", source: "fetch_entity_details", target: "determine_recipients" },
        { id: "e4", source: "determine_recipients", target: "fetch_recipient_contacts" },
        { id: "e5", source: "fetch_recipient_contacts", target: "generate_notification_message" },
        { id: "e6", source: "generate_notification_message", target: "loop_send_notifications" },
        { id: "e7", source: "loop_send_notifications", target: "check_business_hours" },
        { id: "e8", source: "check_business_hours", target: "send_immediate", condition: "isBusinessHours === true" },
        {
            id: "e9",
            source: "check_business_hours",
            target: "schedule_for_business_hours",
            condition: "isBusinessHours === false",
        },
        { id: "e10", source: "send_immediate", target: "log_notification" },
        { id: "e11", source: "schedule_for_business_hours", target: "log_notification" },
        { id: "e12", source: "log_notification", target: "update_metrics" },
    ];

    const triggers: TriggerConfig[] = [
        {
            type: "webhook",
            config: {
                path: "/webhook/erp-event",
                method: "POST",
                authentication: {
                    type: "api-key",
                    config: {
                        keyField: "x-api-key",
                        headerName: "X-API-Key",
                    },
                },
            },
            enabled: true,
        },
    ];

    return {
        id: "erp_whatsapp_template",
        name: "Integração ERP + WhatsApp",
        description: "Notificações automáticas do ERP via WhatsApp para equipe e clientes",
        category: "operational_efficiency" as WorkflowTemplateCategory,
        industry: "e_commerce" as BrazilianIndustryType,
        complexity: "advanced",
        estimatedSetupTime: 90,
        estimatedROI: {
            timeSavedPerMonth: 25,
            costSavingsPerMonth: 3000,
            revenueImpactPerMonth: 7000,
        },
        tags: ["erp", "whatsapp", "notificacoes", "vendas", "estoque", "automacao"],
        brazilianSpecific: {
            requiresCPFCNPJ: false,
            requiresPIX: false,
            requiresWhatsApp: true,
            requiresERP: true,
            complianceRequired: ["LGPD"],
        },
        template: {
            nodes,
            edges,
            triggers,
            variables: {
                businessHours: {
                    start: "08:00",
                    end: "18:00",
                    timezone: "America/Sao_Paulo",
                    weekdays: [1, 2, 3, 4, 5],
                },
                notificationSettings: {
                    maxRetries: 3,
                    retryInterval: 5,
                    enableScheduling: true,
                    respectQuietHours: true,
                },
                erpSettings: {
                    apiTimeout: 30,
                    rateLimitPerMinute: 60,
                    supportedERPs: ["omie", "bling", "tiny", "contaazul"],
                },
            },
            metadata: {
                createdFor: "brazilian_pme",
                version: "1.0.0",
                language: "pt-BR",
                timezone: "America/Sao_Paulo",
                supportedERPs: ["omie", "bling", "tiny", "contaazul"],
            },
        },
        configurationSteps: [
            {
                id: "step1",
                title: "Configurar ERP",
                description: "Configure integração com seu ERP",
                order: 1,
                required: true,
                type: "integration_setup",
                instructions:
                    "Configure a integração com seu ERP (Omie, Bling, Tiny, ContaAzul). Você precisará da chave API e configurar os webhooks.",
                validationRules: [
                    { field: "erpType", rule: "required", message: "Tipo de ERP é obrigatório" },
                    { field: "erpApiKey", rule: "required", message: "Chave API do ERP é obrigatória" },
                    { field: "erpBaseUrl", rule: "url", message: "URL base do ERP deve ser válida" },
                ],
            },
            {
                id: "step2",
                title: "Configurar WhatsApp",
                description: "Configure WhatsApp Business API",
                order: 2,
                required: true,
                type: "integration_setup",
                instructions: "Configure sua conta WhatsApp Business API para envio das notificações.",
                validationRules: [
                    { field: "whatsappToken", rule: "required", message: "Token WhatsApp é obrigatório" },
                    { field: "phoneNumberId", rule: "required", message: "ID do número de telefone é obrigatório" },
                ],
            },
            {
                id: "step3",
                title: "Configurar Contatos",
                description: "Configure lista de contatos para notificações",
                order: 3,
                required: true,
                type: "variable_configuration",
                instructions: "Configure os contatos que devem receber notificações para cada tipo de evento.",
                validationRules: [
                    { field: "managerPhone", rule: "phone", message: "Telefone do gerente deve ser válido" },
                    { field: "salesTeamPhone", rule: "phone", message: "Telefone da equipe de vendas deve ser válido" },
                ],
            },
            {
                id: "step4",
                title: "Configurar Webhooks ERP",
                description: "Configure webhooks no ERP",
                order: 4,
                required: true,
                type: "integration_setup",
                instructions: "Configure os webhooks no seu ERP para enviar eventos para o AutoFlow.",
                validationRules: [
                    { field: "webhookUrl", rule: "url", message: "URL do webhook deve ser válida" },
                    { field: "webhookSecret", rule: "required", message: "Chave secreta do webhook é obrigatória" },
                ],
            },
            {
                id: "step5",
                title: "Testar Notificações",
                description: "Teste o fluxo de notificações",
                order: 5,
                required: true,
                type: "testing",
                instructions:
                    "Crie um evento teste no ERP e verifique se as notificações estão sendo enviadas corretamente.",
            },
        ],
        prerequisites: [
            {
                id: "erp_system",
                type: "integration",
                name: "Sistema ERP",
                description: "ERP compatível (Omie, Bling, Tiny, ContaAzul)",
                required: true,
                estimatedCost: { monthly: 500, setup: 0, currency: "BRL" },
            },
            {
                id: "whatsapp_business",
                type: "integration",
                name: "WhatsApp Business API",
                description: "WhatsApp Business API para notificações",
                required: true,
                estimatedCost: { monthly: 0, setup: 0, currency: "BRL" },
            },
            {
                id: "database",
                type: "technical",
                name: "Banco de Dados",
                description: "Banco para armazenar contatos e logs",
                required: true,
                estimatedCost: { monthly: 100, setup: 0, currency: "BRL" },
            },
        ],
        supportedIntegrations: ["omie", "bling", "tiny", "contaazul", "whatsapp_business"],
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0,
        rating: 4.7,
        version: "1.0.0",
    };
}
