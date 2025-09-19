import { WorkflowTemplate, WorkflowTemplateCategory, BrazilianIndustryType } from "./BrazilianWorkflowTemplateManager";
import { WorkflowNode, WorkflowEdge, TriggerConfig } from "../types";

/**
 * Template: Cobrança PIX Automatizada
 *
 * Sistema automatizado de cobrança PIX com follow-up para PMEs brasileiras.
 *
 * Fluxo:
 * 1. Trigger manual ou automático (vencimento de fatura)
 * 2. Cria pagamento PIX no Mercado Pago
 * 3. Gera QR Code e chave PIX
 * 4. Envia cobrança via WhatsApp/Email
 * 5. Agenda follow-ups automáticos
 * 6. Monitora status do pagamento
 * 7. Confirma pagamento e atualiza sistema
 * 8. Envia comprovante/nota fiscal
 */
export function createPIXPaymentTemplate(): WorkflowTemplate {
    const nodes: WorkflowNode[] = [
        // 1. Trigger: Vencimento de fatura ou trigger manual
        {
            id: "trigger_payment_due",
            type: "schedule_trigger",
            name: "Cobrança Agendada",
            description: "Dispara cobrança quando fatura vence",
            position: { x: 100, y: 100 },
            config: {
                scheduleType: "cron",
                cron: "0 9 * * *", // Todos os dias às 9h
                timezone: "America/Sao_Paulo",
                description: "Verifica faturas vencendo hoje",
            },
            inputs: [],
            outputs: [
                { name: "currentDate", type: "string", description: "Data atual" },
                { name: "timestamp", type: "string", description: "Timestamp da execução" },
            ],
            enabled: true,
        },

        // 2. Buscar faturas vencidas/vencendo
        {
            id: "fetch_due_invoices",
            type: "database_query",
            name: "Buscar Faturas Vencidas",
            description: "Busca faturas que vencem hoje ou já venceram",
            position: { x: 100, y: 250 },
            config: {
                query: `
                    SELECT * FROM invoices 
                    WHERE status = 'pending' 
                    AND due_date <= CURRENT_DATE 
                    AND (last_reminder IS NULL OR last_reminder < CURRENT_DATE - INTERVAL '3 days')
                    ORDER BY due_date ASC
                `,
                returnType: "array",
            },
            inputs: [{ name: "currentDate", type: "string", required: true, description: "Data atual" }],
            outputs: [
                { name: "invoices", type: "array", description: "Lista de faturas" },
                { name: "invoiceCount", type: "number", description: "Quantidade de faturas" },
            ],
            enabled: true,
        },

        // 3. Loop: Para cada fatura
        {
            id: "loop_invoices",
            type: "loop",
            name: "Para Cada Fatura",
            description: "Processa cada fatura individualmente",
            position: { x: 100, y: 400 },
            config: {
                iteratorVariable: "invoice",
                arrayPath: "invoices",
                maxIterations: 50,
            },
            inputs: [{ name: "invoices", type: "array", required: true, description: "Lista de faturas" }],
            outputs: [
                { name: "invoice", type: "object", description: "Fatura atual" },
                { name: "loopIndex", type: "number", description: "Índice atual" },
            ],
            enabled: true,
        },

        // 4. Buscar dados do cliente
        {
            id: "fetch_customer_data",
            type: "database_query",
            name: "Buscar Dados Cliente",
            description: "Busca dados completos do cliente",
            position: { x: 100, y: 550 },
            config: {
                query: "SELECT * FROM customers WHERE id = {{invoice.customer_id}}",
                returnType: "object",
            },
            inputs: [{ name: "invoice", type: "object", required: true, description: "Dados da fatura" }],
            outputs: [
                { name: "customer", type: "object", description: "Dados do cliente" },
                { name: "customerPhone", type: "string", description: "Telefone do cliente" },
                { name: "customerEmail", type: "string", description: "Email do cliente" },
            ],
            enabled: true,
        },

        // 5. Criar pagamento PIX
        {
            id: "create_pix_payment",
            type: "pix_payment",
            name: "Criar Pagamento PIX",
            description: "Cria pagamento PIX no Mercado Pago",
            position: { x: 100, y: 700 },
            config: {
                action: "createPayment",
            },
            inputs: [
                { name: "amount", type: "number", required: true, description: "Valor da fatura" },
                { name: "description", type: "string", required: true, description: "Descrição" },
                { name: "payerEmail", type: "string", required: true, description: "Email do pagador" },
                { name: "payerDocument", type: "string", required: false, description: "CPF/CNPJ" },
                { name: "externalReference", type: "string", required: true, description: "ID da fatura" },
            ],
            outputs: [
                { name: "paymentId", type: "string", description: "ID do pagamento PIX" },
                { name: "qrCode", type: "string", description: "QR Code PIX" },
                { name: "qrCodeBase64", type: "string", description: "QR Code em base64" },
                { name: "pixKey", type: "string", description: "Chave PIX" },
                { name: "expirationDate", type: "string", description: "Data de expiração" },
            ],
            enabled: true,
        },

        // 6. Gerar mensagem de cobrança personalizada
        {
            id: "generate_payment_message",
            type: "ai_generate",
            name: "Gerar Mensagem Cobrança",
            description: "Gera mensagem personalizada de cobrança",
            position: { x: 100, y: 850 },
            config: {
                model: "gpt-3.5-turbo",
                prompt: `
                Gere uma mensagem de cobrança amigável e profissional para PIX:
                
                Cliente: {{customer.name}}
                Fatura: {{invoice.number}}
                Valor: R$ {{invoice.amount}}
                Vencimento: {{invoice.due_date}}
                Dias em atraso: {{invoice.days_overdue}}
                
                Diretrizes:
                - Tom amigável mas profissional
                - Mencione facilidade do PIX
                - Inclua data de vencimento
                - Se em atraso, seja gentil mas firme
                - Ofereça suporte se necessário
                - Linguagem brasileira
                - Máximo 500 caracteres
                
                Mensagem:
                `,
                maxTokens: 200,
            },
            inputs: [
                { name: "customer", type: "object", required: true, description: "Dados do cliente" },
                { name: "invoice", type: "object", required: true, description: "Dados da fatura" },
            ],
            outputs: [{ name: "paymentMessage", type: "string", description: "Mensagem de cobrança" }],
            enabled: true,
        },

        // 7. Enviar cobrança via WhatsApp
        {
            id: "send_whatsapp_payment",
            type: "whatsapp_business",
            name: "Enviar PIX WhatsApp",
            description: "Envia cobrança PIX via WhatsApp",
            position: { x: 100, y: 1000 },
            config: {
                action: "sendMessage",
            },
            inputs: [
                { name: "to", type: "string", required: true, description: "Telefone do cliente" },
                { name: "message", type: "string", required: true, description: "Mensagem completa" },
            ],
            outputs: [
                { name: "messageId", type: "string", description: "ID da mensagem" },
                { name: "status", type: "string", description: "Status do envio" },
            ],
            enabled: true,
        },

        // 8. Enviar QR Code PIX
        {
            id: "send_qr_code",
            type: "whatsapp_business",
            name: "Enviar QR Code",
            description: "Envia QR Code PIX como imagem",
            position: { x: 100, y: 1150 },
            config: {
                action: "sendMedia",
            },
            inputs: [
                { name: "to", type: "string", required: true, description: "Telefone do cliente" },
                { name: "mediaType", type: "string", required: true, description: "Tipo de mídia" },
                { name: "mediaUrl", type: "string", required: true, description: "URL do QR Code" },
                { name: "caption", type: "string", required: true, description: "Legenda" },
            ],
            outputs: [{ name: "qrMessageId", type: "string", description: "ID da mensagem QR" }],
            enabled: true,
        },

        // 9. Atualizar fatura com dados PIX
        {
            id: "update_invoice_pix",
            type: "database_update",
            name: "Atualizar Fatura",
            description: "Atualiza fatura com dados do PIX",
            position: { x: 100, y: 1300 },
            config: {
                table: "invoices",
                whereClause: "id = {{invoice.id}}",
                updateFields: {
                    pix_payment_id: "{{paymentId}}",
                    pix_qr_code: "{{qrCode}}",
                    last_reminder: "CURRENT_DATE",
                    status: "pix_sent",
                    updated_at: "NOW()",
                },
            },
            inputs: [
                { name: "invoice", type: "object", required: true, description: "Dados da fatura" },
                { name: "paymentId", type: "string", required: true, description: "ID do pagamento PIX" },
                { name: "qrCode", type: "string", required: true, description: "QR Code" },
            ],
            outputs: [{ name: "updateSuccess", type: "boolean", description: "Sucesso da atualização" }],
            enabled: true,
        },

        // 10. Agendar follow-up
        {
            id: "schedule_followup",
            type: "schedule_action",
            name: "Agendar Follow-up",
            description: "Agenda lembrete de follow-up",
            position: { x: 100, y: 1450 },
            config: {
                delayType: "days",
                delayAmount: 2,
                actionType: "webhook",
                webhookUrl: "{{baseUrl}}/webhook/payment-followup",
                payload: {
                    invoiceId: "{{invoice.id}}",
                    paymentId: "{{paymentId}}",
                    followupType: "first_reminder",
                },
            },
            inputs: [
                { name: "invoice", type: "object", required: true, description: "Dados da fatura" },
                { name: "paymentId", type: "string", required: true, description: "ID do pagamento" },
            ],
            outputs: [{ name: "followupScheduled", type: "boolean", description: "Follow-up agendado" }],
            enabled: true,
        },

        // 11. Verificar status do pagamento (webhook separado)
        {
            id: "check_payment_status",
            type: "pix_payment",
            name: "Verificar Pagamento",
            description: "Verifica status do pagamento PIX",
            position: { x: 400, y: 100 },
            config: {
                action: "checkStatus",
            },
            inputs: [{ name: "paymentId", type: "string", required: true, description: "ID do pagamento" }],
            outputs: [
                { name: "status", type: "string", description: "Status do pagamento" },
                { name: "isPaid", type: "boolean", description: "Pagamento aprovado" },
                { name: "paidAmount", type: "number", description: "Valor pago" },
                { name: "paidDate", type: "string", description: "Data do pagamento" },
            ],
            enabled: true,
        },

        // 12. Processar pagamento aprovado
        {
            id: "process_payment_approved",
            type: "condition",
            name: "Pagamento Aprovado?",
            description: "Verifica se pagamento foi aprovado",
            position: { x: 400, y: 250 },
            config: {
                condition: "isPaid === true",
                trueFlow: "confirm_payment",
                falseFlow: "end_check",
            },
            inputs: [{ name: "isPaid", type: "boolean", required: true, description: "Pagamento aprovado" }],
            outputs: [{ name: "paymentConfirmed", type: "boolean", description: "Pagamento confirmado" }],
            enabled: true,
        },

        // 13. Confirmar pagamento
        {
            id: "confirm_payment",
            type: "database_update",
            name: "Confirmar Pagamento",
            description: "Marca fatura como paga",
            position: { x: 400, y: 400 },
            config: {
                table: "invoices",
                whereClause: "pix_payment_id = {{paymentId}}",
                updateFields: {
                    status: "paid",
                    paid_at: "{{paidDate}}",
                    paid_amount: "{{paidAmount}}",
                    payment_method: "pix",
                    updated_at: "NOW()",
                },
            },
            inputs: [
                { name: "paymentId", type: "string", required: true, description: "ID do pagamento" },
                { name: "paidAmount", type: "number", required: true, description: "Valor pago" },
                { name: "paidDate", type: "string", required: true, description: "Data do pagamento" },
            ],
            outputs: [{ name: "invoiceUpdated", type: "boolean", description: "Fatura atualizada" }],
            enabled: true,
        },

        // 14. Enviar confirmação de pagamento
        {
            id: "send_payment_confirmation",
            type: "whatsapp_business",
            name: "Confirmar Recebimento",
            description: "Envia confirmação de pagamento recebido",
            position: { x: 400, y: 550 },
            config: {
                action: "sendTemplate",
                templateName: "payment_confirmed",
                languageCode: "pt_BR",
            },
            inputs: [
                { name: "to", type: "string", required: true, description: "Telefone do cliente" },
                { name: "templateName", type: "string", required: true, description: "Nome do template" },
                { name: "components", type: "array", required: false, description: "Parâmetros do template" },
            ],
            outputs: [{ name: "confirmationSent", type: "boolean", description: "Confirmação enviada" }],
            enabled: true,
        },
    ];

    const edges: WorkflowEdge[] = [
        // Fluxo principal de cobrança
        { id: "e1", source: "trigger_payment_due", target: "fetch_due_invoices" },
        { id: "e2", source: "fetch_due_invoices", target: "loop_invoices" },
        { id: "e3", source: "loop_invoices", target: "fetch_customer_data" },
        { id: "e4", source: "fetch_customer_data", target: "create_pix_payment" },
        { id: "e5", source: "create_pix_payment", target: "generate_payment_message" },
        { id: "e6", source: "generate_payment_message", target: "send_whatsapp_payment" },
        { id: "e7", source: "send_whatsapp_payment", target: "send_qr_code" },
        { id: "e8", source: "send_qr_code", target: "update_invoice_pix" },
        { id: "e9", source: "update_invoice_pix", target: "schedule_followup" },

        // Fluxo de verificação de pagamento
        { id: "e10", source: "check_payment_status", target: "process_payment_approved" },
        { id: "e11", source: "process_payment_approved", target: "confirm_payment", condition: "isPaid === true" },
        { id: "e12", source: "confirm_payment", target: "send_payment_confirmation" },
    ];

    const triggers: TriggerConfig[] = [
        {
            type: "schedule",
            config: {
                cron: "0 9 * * *",
                timezone: "America/Sao_Paulo",
                enabled: true,
            },
            enabled: true,
        },
        {
            type: "webhook",
            config: {
                path: "/webhook/payment-status",
                method: "POST",
                authentication: {
                    type: "bearer",
                    config: {
                        tokenField: "webhook_token",
                    },
                },
            },
            enabled: true,
        },
    ];

    return {
        id: "pix_payment_template",
        name: "Cobrança PIX Automatizada",
        description: "Sistema completo de cobrança PIX automatizada com follow-up para PMEs brasileiras",
        category: "financial_management" as WorkflowTemplateCategory,
        industry: "general" as BrazilianIndustryType,
        complexity: "intermediate",
        estimatedSetupTime: 60,
        estimatedROI: {
            timeSavedPerMonth: 15,
            costSavingsPerMonth: 1500,
            revenueImpactPerMonth: 8000,
        },
        tags: ["pix", "cobranca", "pagamento", "financeiro", "whatsapp", "automacao"],
        brazilianSpecific: {
            requiresCPFCNPJ: true,
            requiresPIX: true,
            requiresWhatsApp: true,
            requiresERP: false,
            complianceRequired: ["LGPD", "Banco Central"],
        },
        template: {
            nodes,
            edges,
            triggers,
            variables: {
                maxFollowups: 3,
                followupIntervalDays: 2,
                pixExpirationHours: 24,
                businessHours: {
                    start: "08:00",
                    end: "18:00",
                    timezone: "America/Sao_Paulo",
                },
                reminderMessages: {
                    first: "Lembramos que sua fatura vence hoje. PIX disponível!",
                    second: "Sua fatura está em atraso. Pague via PIX de forma rápida.",
                    final: "Última oportunidade de pagamento via PIX.",
                },
            },
            metadata: {
                createdFor: "brazilian_pme",
                version: "1.0.0",
                language: "pt-BR",
                timezone: "America/Sao_Paulo",
                paymentMethod: "pix",
                compliance: ["banco_central", "lgpd"],
            },
        },
        configurationSteps: [
            {
                id: "step1",
                title: "Configurar Mercado Pago",
                description: "Configure sua conta Mercado Pago para PIX",
                order: 1,
                required: true,
                type: "integration_setup",
                instructions: "Acesse sua conta Mercado Pago, vá em Integrações > API e obtenha seu Access Token.",
                validationRules: [
                    { field: "accessToken", rule: "required", message: "Access Token do Mercado Pago é obrigatório" },
                    { field: "publicKey", rule: "required", message: "Public Key do Mercado Pago é obrigatória" },
                ],
            },
            {
                id: "step2",
                title: "Configurar Database",
                description: "Configure conexão com banco de dados de faturas",
                order: 2,
                required: true,
                type: "integration_setup",
                instructions: "Configure a conexão com seu banco de dados onde ficam as faturas.",
                validationRules: [
                    { field: "databaseUrl", rule: "required", message: "URL do banco de dados é obrigatória" },
                ],
            },
            {
                id: "step3",
                title: "Configurar WhatsApp",
                description: "Configure WhatsApp Business para envio",
                order: 3,
                required: true,
                type: "integration_setup",
                instructions: "Configure sua conta WhatsApp Business API para envio das cobranças.",
                validationRules: [
                    { field: "whatsappToken", rule: "required", message: "Token WhatsApp é obrigatório" },
                ],
            },
            {
                id: "step4",
                title: "Configurar Webhooks",
                description: "Configure webhooks do Mercado Pago",
                order: 4,
                required: true,
                type: "integration_setup",
                instructions: "Configure os webhooks no Mercado Pago para receber notificações de pagamento.",
                validationRules: [{ field: "webhookUrl", rule: "url", message: "URL do webhook deve ser válida" }],
            },
            {
                id: "step5",
                title: "Testar Fluxo",
                description: "Teste o fluxo completo de cobrança",
                order: 5,
                required: true,
                type: "testing",
                instructions: "Crie uma fatura teste e verifique se todo o fluxo está funcionando.",
            },
        ],
        prerequisites: [
            {
                id: "mercado_pago",
                type: "integration",
                name: "Conta Mercado Pago",
                description: "Conta Mercado Pago ativa para PIX",
                required: true,
                documentationUrl: "https://www.mercadopago.com.br/developers",
                estimatedCost: { monthly: 0, setup: 0, currency: "BRL" },
            },
            {
                id: "whatsapp_business",
                type: "integration",
                name: "WhatsApp Business API",
                description: "WhatsApp Business API para envio de mensagens",
                required: true,
                estimatedCost: { monthly: 0, setup: 0, currency: "BRL" },
            },
            {
                id: "database",
                type: "technical",
                name: "Banco de Dados",
                description: "Banco de dados com tabela de faturas",
                required: true,
                estimatedCost: { monthly: 100, setup: 0, currency: "BRL" },
            },
        ],
        supportedIntegrations: ["mercado_pago", "whatsapp_business", "postgresql", "mysql"],
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0,
        rating: 4.9,
        version: "1.0.0",
    };
}
