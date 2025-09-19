import { WorkflowTemplate, WorkflowTemplateCategory, BrazilianIndustryType } from "./BrazilianWorkflowTemplateManager";
import { WorkflowNode, WorkflowEdge, TriggerConfig } from "../types";

/**
 * Template: Atendimento WhatsApp + CRM
 *
 * Automação completa para atendimento ao cliente via WhatsApp
 * com integração automática ao CRM para empresas brasileiras.
 *
 * Fluxo:
 * 1. Cliente envia mensagem no WhatsApp
 * 2. Sistema identifica cliente (por telefone)
 * 3. Se novo cliente: cria registro no CRM
 * 4. Se cliente existente: carrega histórico
 * 5. Envia resposta automática personalizada
 * 6. Registra interação no CRM
 * 7. Notifica equipe se necessário
 */
export function createWhatsAppCRMTemplate(): WorkflowTemplate {
    const nodes: WorkflowNode[] = [
        // 1. Trigger: Mensagem recebida no WhatsApp
        {
            id: "trigger_whatsapp_received",
            type: "webhook_trigger",
            name: "Mensagem WhatsApp Recebida",
            description: "Recebe webhooks do WhatsApp Business API",
            position: { x: 100, y: 100 },
            config: {
                webhookPath: "/webhook/whatsapp",
                method: "POST",
                authentication: {
                    type: "bearer",
                    tokenField: "verify_token",
                },
                expectedPayload: {
                    entry: "array",
                    "entry[0].changes": "array",
                    "entry[0].changes[0].value.messages": "array",
                },
            },
            inputs: [],
            outputs: [
                { name: "message", type: "object", description: "Dados da mensagem" },
                { name: "from", type: "string", description: "Número do remetente" },
                { name: "messageText", type: "string", description: "Texto da mensagem" },
                { name: "timestamp", type: "string", description: "Timestamp da mensagem" },
            ],
            enabled: true,
        },

        // 2. Processar dados do WhatsApp
        {
            id: "process_whatsapp_data",
            type: "data_transformer",
            name: "Processar Dados WhatsApp",
            description: "Extrai e formata dados da mensagem WhatsApp",
            position: { x: 100, y: 250 },
            config: {
                transformations: [
                    {
                        input: "webhook.entry[0].changes[0].value.messages[0].from",
                        output: "customerPhone",
                        type: "extract",
                    },
                    {
                        input: "webhook.entry[0].changes[0].value.messages[0].text.body",
                        output: "messageText",
                        type: "extract",
                    },
                    {
                        input: "customerPhone",
                        output: "formattedPhone",
                        type: "function",
                        function: "formatBrazilianPhone",
                    },
                ],
            },
            inputs: [{ name: "webhook", type: "object", required: true, description: "Dados do webhook" }],
            outputs: [
                { name: "customerPhone", type: "string", description: "Telefone do cliente" },
                { name: "formattedPhone", type: "string", description: "Telefone formatado" },
                { name: "messageText", type: "string", description: "Texto da mensagem" },
            ],
            enabled: true,
        },

        // 3. Buscar cliente no CRM
        {
            id: "search_customer_crm",
            type: "crm_search",
            name: "Buscar Cliente no CRM",
            description: "Busca cliente por telefone no CRM",
            position: { x: 100, y: 400 },
            config: {
                searchField: "phone",
                matchType: "exact",
                returnFields: ["id", "name", "email", "tags", "lastInteraction", "status"],
            },
            inputs: [{ name: "phone", type: "string", required: true, description: "Telefone para busca" }],
            outputs: [
                { name: "customer", type: "object", description: "Dados do cliente" },
                { name: "customerExists", type: "boolean", description: "Cliente encontrado" },
                { name: "customerId", type: "string", description: "ID do cliente" },
            ],
            enabled: true,
        },

        // 4. Decisão: Cliente novo ou existente
        {
            id: "decision_customer_exists",
            type: "condition",
            name: "Cliente Existe?",
            description: "Verifica se cliente já existe no CRM",
            position: { x: 100, y: 550 },
            config: {
                condition: "customerExists === true",
                trueFlow: "load_customer_history",
                falseFlow: "create_new_customer",
            },
            inputs: [{ name: "customerExists", type: "boolean", required: true, description: "Cliente existe" }],
            outputs: [{ name: "result", type: "boolean", description: "Resultado da condição" }],
            enabled: true,
        },

        // 5A. Criar novo cliente
        {
            id: "create_new_customer",
            type: "crm_create",
            name: "Criar Novo Cliente",
            description: "Cria novo cliente no CRM",
            position: { x: 300, y: 700 },
            config: {
                entity: "contact",
                fields: {
                    phone: "{{formattedPhone}}",
                    source: "WhatsApp",
                    status: "lead",
                    tags: ["whatsapp", "novo-cliente"],
                    customFields: {
                        firstContact: "{{timestamp}}",
                        firstMessage: "{{messageText}}",
                    },
                },
            },
            inputs: [
                { name: "formattedPhone", type: "string", required: true, description: "Telefone" },
                { name: "messageText", type: "string", required: true, description: "Primeira mensagem" },
                { name: "timestamp", type: "string", required: true, description: "Timestamp" },
            ],
            outputs: [
                { name: "customerId", type: "string", description: "ID do novo cliente" },
                { name: "customer", type: "object", description: "Dados do cliente criado" },
            ],
            enabled: true,
        },

        // 5B. Carregar histórico do cliente
        {
            id: "load_customer_history",
            type: "crm_query",
            name: "Carregar Histórico",
            description: "Carrega histórico de interações do cliente",
            position: { x: -100, y: 700 },
            config: {
                entity: "interaction",
                filters: {
                    customerId: "{{customerId}}",
                    type: "whatsapp",
                },
                limit: 10,
                orderBy: "createdAt",
                order: "DESC",
            },
            inputs: [{ name: "customerId", type: "string", required: true, description: "ID do cliente" }],
            outputs: [
                { name: "interactions", type: "array", description: "Histórico de interações" },
                { name: "lastInteraction", type: "object", description: "Última interação" },
            ],
            enabled: true,
        },

        // 6. Analisar mensagem e definir resposta
        {
            id: "analyze_message_intent",
            type: "ai_analyze",
            name: "Analisar Intenção",
            description: "Analisa intenção da mensagem usando IA",
            position: { x: 100, y: 850 },
            config: {
                model: "gpt-3.5-turbo",
                prompt: `
                Analise a mensagem do cliente e determine a intenção:
                
                Mensagem: {{messageText}}
                Cliente: {{customer.name || 'Novo cliente'}}
                Histórico: {{interactions || 'Primeiro contato'}}
                
                Identifique a intenção entre:
                - saudacao: Saudação inicial
                - duvida: Dúvida sobre produto/serviço
                - suporte: Solicitação de suporte
                - compra: Interesse em comprar
                - reclamacao: Reclamação ou problema
                - informacao: Solicitação de informações
                
                Responda apenas com a intenção identificada.
                `,
                responseFormat: "string",
            },
            inputs: [
                { name: "messageText", type: "string", required: true, description: "Texto da mensagem" },
                { name: "customer", type: "object", required: false, description: "Dados do cliente" },
                { name: "interactions", type: "array", required: false, description: "Histórico" },
            ],
            outputs: [
                { name: "intent", type: "string", description: "Intenção identificada" },
                { name: "confidence", type: "number", description: "Confiança da análise" },
            ],
            enabled: true,
        },

        // 7. Gerar resposta personalizada
        {
            id: "generate_response",
            type: "ai_generate",
            name: "Gerar Resposta",
            description: "Gera resposta personalizada baseada na intenção",
            position: { x: 100, y: 1000 },
            config: {
                model: "gpt-3.5-turbo",
                prompt: `
                Gere uma resposta personalizada para o cliente:
                
                Cliente: {{customer.name || 'Cliente'}}
                Intenção: {{intent}}
                Mensagem original: {{messageText}}
                É novo cliente: {{isNewCustomer}}
                
                Diretrizes:
                - Use linguagem brasileira amigável
                - Seja conciso e útil
                - Se for novo cliente, dê boas-vindas
                - Para dúvidas, ofereça ajuda específica
                - Para suporte, tranquilize e ofereça solução
                - Para compras, demonstre interesse e ofereça informações
                - Máximo 160 caracteres para WhatsApp
                
                Resposta:
                `,
                maxTokens: 100,
            },
            inputs: [
                { name: "intent", type: "string", required: true, description: "Intenção" },
                { name: "messageText", type: "string", required: true, description: "Mensagem original" },
                { name: "customer", type: "object", required: false, description: "Dados do cliente" },
                { name: "isNewCustomer", type: "boolean", required: true, description: "É novo cliente" },
            ],
            outputs: [{ name: "response", type: "string", description: "Resposta gerada" }],
            enabled: true,
        },

        // 8. Enviar resposta WhatsApp
        {
            id: "send_whatsapp_response",
            type: "whatsapp_business",
            name: "Enviar Resposta",
            description: "Envia resposta automática via WhatsApp",
            position: { x: 100, y: 1150 },
            config: {
                action: "sendMessage",
            },
            inputs: [
                { name: "to", type: "string", required: true, description: "Número destinatário" },
                { name: "message", type: "string", required: true, description: "Mensagem a enviar" },
            ],
            outputs: [
                { name: "messageId", type: "string", description: "ID da mensagem enviada" },
                { name: "status", type: "string", description: "Status do envio" },
            ],
            enabled: true,
        },

        // 9. Registrar interação no CRM
        {
            id: "register_interaction",
            type: "crm_create",
            name: "Registrar Interação",
            description: "Registra interação no CRM",
            position: { x: 100, y: 1300 },
            config: {
                entity: "interaction",
                fields: {
                    customerId: "{{customerId}}",
                    type: "whatsapp",
                    direction: "inbound",
                    content: "{{messageText}}",
                    response: "{{response}}",
                    intent: "{{intent}}",
                    automated: true,
                    timestamp: "{{timestamp}}",
                },
            },
            inputs: [
                { name: "customerId", type: "string", required: true, description: "ID do cliente" },
                { name: "messageText", type: "string", required: true, description: "Mensagem recebida" },
                { name: "response", type: "string", required: true, description: "Resposta enviada" },
                { name: "intent", type: "string", required: true, description: "Intenção identificada" },
                { name: "timestamp", type: "string", required: true, description: "Timestamp" },
            ],
            outputs: [{ name: "interactionId", type: "string", description: "ID da interação criada" }],
            enabled: true,
        },

        // 10. Notificar equipe se necessário
        {
            id: "notify_team",
            type: "condition",
            name: "Notificar Equipe?",
            description: "Decide se deve notificar a equipe",
            position: { x: 100, y: 1450 },
            config: {
                condition: 'intent === "reclamacao" || intent === "suporte" || confidence < 0.7',
                trueFlow: "send_team_notification",
                falseFlow: "end_workflow",
            },
            inputs: [
                { name: "intent", type: "string", required: true, description: "Intenção" },
                { name: "confidence", type: "number", required: true, description: "Confiança" },
            ],
            outputs: [{ name: "shouldNotify", type: "boolean", description: "Deve notificar equipe" }],
            enabled: true,
        },

        // 11. Enviar notificação para equipe
        {
            id: "send_team_notification",
            type: "email_send",
            name: "Notificar Equipe",
            description: "Envia notificação para equipe de atendimento",
            position: { x: 300, y: 1600 },
            config: {
                to: "{{teamEmail}}",
                subject: "Nova interação WhatsApp requer atenção",
                template: "team_notification",
                variables: {
                    customerName: "{{customer.name}}",
                    customerPhone: "{{formattedPhone}}",
                    message: "{{messageText}}",
                    intent: "{{intent}}",
                    confidence: "{{confidence}}",
                    timestamp: "{{timestamp}}",
                },
            },
            inputs: [
                { name: "teamEmail", type: "string", required: true, description: "Email da equipe" },
                { name: "customer", type: "object", required: true, description: "Dados do cliente" },
                { name: "formattedPhone", type: "string", required: true, description: "Telefone" },
                { name: "messageText", type: "string", required: true, description: "Mensagem" },
                { name: "intent", type: "string", required: true, description: "Intenção" },
                { name: "confidence", type: "number", required: true, description: "Confiança" },
                { name: "timestamp", type: "string", required: true, description: "Timestamp" },
            ],
            outputs: [{ name: "emailId", type: "string", description: "ID do email enviado" }],
            enabled: true,
        },
    ];

    const edges: WorkflowEdge[] = [
        { id: "e1", source: "trigger_whatsapp_received", target: "process_whatsapp_data" },
        { id: "e2", source: "process_whatsapp_data", target: "search_customer_crm" },
        { id: "e3", source: "search_customer_crm", target: "decision_customer_exists" },
        {
            id: "e4",
            source: "decision_customer_exists",
            target: "create_new_customer",
            condition: "customerExists === false",
        },
        {
            id: "e5",
            source: "decision_customer_exists",
            target: "load_customer_history",
            condition: "customerExists === true",
        },
        { id: "e6", source: "create_new_customer", target: "analyze_message_intent" },
        { id: "e7", source: "load_customer_history", target: "analyze_message_intent" },
        { id: "e8", source: "analyze_message_intent", target: "generate_response" },
        { id: "e9", source: "generate_response", target: "send_whatsapp_response" },
        { id: "e10", source: "send_whatsapp_response", target: "register_interaction" },
        { id: "e11", source: "register_interaction", target: "notify_team" },
        { id: "e12", source: "notify_team", target: "send_team_notification", condition: "shouldNotify === true" },
    ];

    const triggers: TriggerConfig[] = [
        {
            type: "webhook",
            config: {
                path: "/webhook/whatsapp",
                method: "POST",
                authentication: {
                    type: "bearer",
                    config: {
                        tokenField: "verify_token",
                    },
                },
            },
            enabled: true,
        },
    ];

    return {
        id: "whatsapp_crm_template",
        name: "Atendimento WhatsApp + CRM",
        description: "Automação completa de atendimento via WhatsApp com integração CRM para PMEs brasileiras",
        category: "customer_service" as WorkflowTemplateCategory,
        industry: "general" as BrazilianIndustryType,
        complexity: "intermediate",
        estimatedSetupTime: 45,
        estimatedROI: {
            timeSavedPerMonth: 20,
            costSavingsPerMonth: 2000,
            revenueImpactPerMonth: 5000,
        },
        tags: ["whatsapp", "crm", "atendimento", "ia", "automacao"],
        brazilianSpecific: {
            requiresCPFCNPJ: false,
            requiresPIX: false,
            requiresWhatsApp: true,
            requiresERP: false,
            complianceRequired: ["LGPD"],
        },
        template: {
            nodes,
            edges,
            triggers,
            variables: {
                teamEmail: "atendimento@empresa.com.br",
                responseTimeout: 300,
                maxAutoResponses: 3,
                businessHours: {
                    start: "08:00",
                    end: "18:00",
                    timezone: "America/Sao_Paulo",
                },
            },
            metadata: {
                createdFor: "brazilian_pme",
                version: "1.0.0",
                language: "pt-BR",
                timezone: "America/Sao_Paulo",
            },
        },
        configurationSteps: [
            {
                id: "step1",
                title: "Configurar WhatsApp Business API",
                description: "Configure sua conta WhatsApp Business API",
                order: 1,
                required: true,
                type: "integration_setup",
                instructions:
                    "Acesse o Meta Business Manager e configure sua conta WhatsApp Business API. Você precisará do token de acesso e número de telefone verificado.",
                validationRules: [
                    { field: "accessToken", rule: "required", message: "Token de acesso é obrigatório" },
                    { field: "phoneNumberId", rule: "required", message: "ID do número de telefone é obrigatório" },
                ],
            },
            {
                id: "step2",
                title: "Configurar CRM",
                description: "Configure sua integração com CRM",
                order: 2,
                required: true,
                type: "integration_setup",
                instructions:
                    "Configure a integração com seu CRM (RD Station, Pipedrive, HubSpot). Você precisará da chave API e configurações de campos.",
                validationRules: [
                    { field: "crmApiKey", rule: "required", message: "Chave API do CRM é obrigatória" },
                    { field: "crmBaseUrl", rule: "url", message: "URL base do CRM deve ser válida" },
                ],
            },
            {
                id: "step3",
                title: "Configurar Webhook",
                description: "Configure o webhook do WhatsApp",
                order: 3,
                required: true,
                type: "integration_setup",
                instructions:
                    "Configure o webhook URL no WhatsApp Business API para receber mensagens automaticamente.",
                validationRules: [
                    { field: "webhookUrl", rule: "url", message: "URL do webhook deve ser válida" },
                    { field: "verifyToken", rule: "required", message: "Token de verificação é obrigatório" },
                ],
            },
            {
                id: "step4",
                title: "Configurar Variáveis",
                description: "Configure variáveis específicas da empresa",
                order: 4,
                required: true,
                type: "variable_configuration",
                instructions: "Defina email da equipe, horário de funcionamento e outras configurações específicas.",
                validationRules: [{ field: "teamEmail", rule: "email", message: "Email da equipe deve ser válido" }],
            },
            {
                id: "step5",
                title: "Testar Integração",
                description: "Teste o fluxo completo",
                order: 5,
                required: true,
                type: "testing",
                instructions:
                    "Envie uma mensagem de teste para o WhatsApp e verifique se o fluxo está funcionando corretamente.",
            },
        ],
        prerequisites: [
            {
                id: "whatsapp_business",
                type: "integration",
                name: "WhatsApp Business API",
                description: "Conta WhatsApp Business API ativa",
                required: true,
                documentationUrl: "https://developers.facebook.com/docs/whatsapp",
                estimatedCost: { monthly: 0, setup: 0, currency: "BRL" },
            },
            {
                id: "crm_integration",
                type: "integration",
                name: "Sistema CRM",
                description: "Sistema CRM compatível (RD Station, Pipedrive, HubSpot)",
                required: true,
                estimatedCost: { monthly: 200, setup: 0, currency: "BRL" },
            },
            {
                id: "openai_api",
                type: "integration",
                name: "OpenAI API",
                description: "Chave API OpenAI para análise de intenção",
                required: true,
                estimatedCost: { monthly: 50, setup: 0, currency: "BRL" },
            },
        ],
        supportedIntegrations: ["whatsapp_business", "rd_station", "pipedrive", "hubspot", "openai"],
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0,
        rating: 4.8,
        version: "1.0.0",
    };
}
