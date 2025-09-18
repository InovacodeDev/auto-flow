import { WorkflowCanvas } from "../types/workflow";

// Template para onboarding de clientes
export const onboardingClienteTemplate: WorkflowCanvas = {
    id: "template-onboarding-cliente",
    name: "Onboarding Cliente - Template",
    description: "Automatiza o processo de boas-vindas para novos clientes",
    status: "draft",
    canvasData: {
        viewport: { x: 0, y: 0, zoom: 1 },
    },
    nodes: [
        {
            id: "trigger-1",
            type: "trigger",
            nodeType: "webhook_trigger",
            position: { x: 100, y: 100 },
            data: {
                name: "Novo Cliente",
                nodeType: "webhook_trigger",
                description: "Webhook disparado quando cliente se cadastra",
                config: {
                    method: "POST",
                    authentication: "bearer",
                },
            },
        },
        {
            id: "action-1",
            type: "action",
            nodeType: "send_email",
            position: { x: 350, y: 100 },
            data: {
                name: "Email de Boas-vindas",
                nodeType: "send_email",
                description: "Envia email de boas-vindas personalizado",
                config: {
                    from: "boas-vindas@empresa.com",
                    subject: "Bem-vindo(a) à nossa empresa!",
                    template: "onboarding_welcome",
                },
            },
        },
        {
            id: "delay-1",
            type: "utility",
            nodeType: "delay",
            position: { x: 600, y: 100 },
            data: {
                name: "Aguardar 1 dia",
                nodeType: "delay",
                description: "Espera 24 horas antes do próximo contato",
                config: {
                    duration: 86400000, // 24 horas em ms
                    unit: "milliseconds",
                },
            },
        },
        {
            id: "action-2",
            type: "action",
            nodeType: "send_email",
            position: { x: 850, y: 100 },
            data: {
                name: "Email Dicas",
                nodeType: "send_email",
                description: "Envia dicas de como usar o produto",
                config: {
                    from: "suporte@empresa.com",
                    subject: "Dicas para aproveitar melhor nossos serviços",
                    template: "onboarding_tips",
                },
            },
        },
        {
            id: "action-3",
            type: "action",
            nodeType: "database_save",
            position: { x: 350, y: 300 },
            data: {
                name: "Salvar Histórico",
                nodeType: "database_save",
                description: "Registra o onboarding no histórico do cliente",
                config: {
                    table: "customer_history",
                    operation: "insert",
                },
            },
        },
    ],
    edges: [
        {
            id: "edge-1",
            source: "trigger-1",
            target: "action-1",
            sourceHandle: "output",
            targetHandle: "input",
        },
        {
            id: "edge-2",
            source: "action-1",
            target: "delay-1",
            sourceHandle: "output",
            targetHandle: "input",
        },
        {
            id: "edge-3",
            source: "delay-1",
            target: "action-2",
            sourceHandle: "output",
            targetHandle: "input",
        },
        {
            id: "edge-4",
            source: "trigger-1",
            target: "action-3",
            sourceHandle: "output",
            targetHandle: "input",
        },
    ],
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

// Template para cobrança automática
export const cobrancaAutomaticaTemplate: WorkflowCanvas = {
    id: "template-cobranca-automatica",
    name: "Cobrança Automática - Template",
    description: "Automatiza lembretes e cobrança de faturas em atraso",
    status: "draft",
    canvasData: {
        viewport: { x: 0, y: 0, zoom: 1 },
    },
    nodes: [
        {
            id: "trigger-1",
            type: "trigger",
            nodeType: "schedule_trigger",
            position: { x: 100, y: 100 },
            data: {
                name: "Verificação Diária",
                nodeType: "schedule_trigger",
                description: "Verifica faturas em atraso todos os dias às 9h",
                config: {
                    cron: "0 9 * * *",
                    timezone: "America/Sao_Paulo",
                },
            },
        },
        {
            id: "action-1",
            type: "action",
            nodeType: "http_request",
            position: { x: 350, y: 100 },
            data: {
                name: "Buscar Faturas Vencidas",
                nodeType: "http_request",
                description: "Consulta API para faturas vencidas",
                config: {
                    method: "GET",
                    url: "/api/invoices/overdue",
                    headers: { Authorization: "Bearer {{token}}" },
                },
            },
        },
        {
            id: "condition-1",
            type: "condition",
            nodeType: "condition",
            position: { x: 600, y: 100 },
            data: {
                name: "Tem Faturas?",
                nodeType: "condition",
                description: "Verifica se existem faturas em atraso",
                config: {
                    condition: "input.invoices.length > 0",
                    operator: "javascript",
                },
            },
        },
        {
            id: "action-2",
            type: "action",
            nodeType: "send_email",
            position: { x: 850, y: 50 },
            data: {
                name: "Enviar Lembrete",
                nodeType: "send_email",
                description: "Envia lembrete de cobrança por email",
                config: {
                    from: "financeiro@empresa.com",
                    subject: "Lembrete: Fatura em Atraso",
                    template: "overdue_reminder",
                },
            },
        },
        {
            id: "action-3",
            type: "action",
            nodeType: "http_request",
            position: { x: 850, y: 200 },
            data: {
                name: "Enviar WhatsApp",
                nodeType: "http_request",
                description: "Envia mensagem via WhatsApp Business",
                config: {
                    method: "POST",
                    url: "/api/whatsapp/send",
                    headers: { "Content-Type": "application/json" },
                },
            },
        },
    ],
    edges: [
        {
            id: "edge-1",
            source: "trigger-1",
            target: "action-1",
            sourceHandle: "output",
            targetHandle: "input",
        },
        {
            id: "edge-2",
            source: "action-1",
            target: "condition-1",
            sourceHandle: "output",
            targetHandle: "input",
        },
        {
            id: "edge-3",
            source: "condition-1",
            target: "action-2",
            sourceHandle: "true",
            targetHandle: "input",
        },
        {
            id: "edge-4",
            source: "condition-1",
            target: "action-3",
            sourceHandle: "true",
            targetHandle: "input",
        },
    ],
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

// Template para lead nurturing
export const leadNurturingTemplate: WorkflowCanvas = {
    id: "template-lead-nurturing",
    name: "Lead Nurturing - Template",
    description: "Cultiva leads através de conteúdo educativo sequencial",
    status: "draft",
    canvasData: {
        viewport: { x: 0, y: 0, zoom: 1 },
    },
    nodes: [
        {
            id: "trigger-1",
            type: "trigger",
            nodeType: "webhook_trigger",
            position: { x: 100, y: 100 },
            data: {
                name: "Lead Capturado",
                nodeType: "webhook_trigger",
                description: "Trigger quando lead baixa material rico",
                config: {
                    method: "POST",
                    authentication: "api_key",
                },
            },
        },
        {
            id: "action-1",
            type: "action",
            nodeType: "send_email",
            position: { x: 350, y: 100 },
            data: {
                name: "Email #1 - Obrigado",
                nodeType: "send_email",
                description: "Agradece pelo download e apresenta empresa",
                config: {
                    from: "marketing@empresa.com",
                    subject: "Obrigado pelo download! Aqui está seu material",
                    template: "nurturing_01_welcome",
                },
            },
        },
        {
            id: "delay-1",
            type: "utility",
            nodeType: "delay",
            position: { x: 600, y: 100 },
            data: {
                name: "Aguardar 3 dias",
                nodeType: "delay",
                description: "Espera 3 dias antes do próximo email",
                config: {
                    duration: 259200000, // 3 dias em ms
                    unit: "milliseconds",
                },
            },
        },
        {
            id: "action-2",
            type: "action",
            nodeType: "send_email",
            position: { x: 850, y: 100 },
            data: {
                name: "Email #2 - Educativo",
                nodeType: "send_email",
                description: "Conteúdo educativo sobre o tema de interesse",
                config: {
                    from: "marketing@empresa.com",
                    subject: "Dica valiosa sobre {{topic}}",
                    template: "nurturing_02_educational",
                },
            },
        },
        {
            id: "delay-2",
            type: "utility",
            nodeType: "delay",
            position: { x: 1100, y: 100 },
            data: {
                name: "Aguardar 5 dias",
                nodeType: "delay",
                description: "Espera 5 dias antes do caso de sucesso",
                config: {
                    duration: 432000000, // 5 dias em ms
                    unit: "milliseconds",
                },
            },
        },
        {
            id: "action-3",
            type: "action",
            nodeType: "send_email",
            position: { x: 1350, y: 100 },
            data: {
                name: "Email #3 - Caso de Sucesso",
                nodeType: "send_email",
                description: "Compartilha caso de sucesso de cliente",
                config: {
                    from: "marketing@empresa.com",
                    subject: "Como {{client_name}} aumentou vendas em 300%",
                    template: "nurturing_03_case_study",
                },
            },
        },
    ],
    edges: [
        {
            id: "edge-1",
            source: "trigger-1",
            target: "action-1",
            sourceHandle: "output",
            targetHandle: "input",
        },
        {
            id: "edge-2",
            source: "action-1",
            target: "delay-1",
            sourceHandle: "output",
            targetHandle: "input",
        },
        {
            id: "edge-3",
            source: "delay-1",
            target: "action-2",
            sourceHandle: "output",
            targetHandle: "input",
        },
        {
            id: "edge-4",
            source: "action-2",
            target: "delay-2",
            sourceHandle: "output",
            targetHandle: "input",
        },
        {
            id: "edge-5",
            source: "delay-2",
            target: "action-3",
            sourceHandle: "output",
            targetHandle: "input",
        },
    ],
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

// Lista de todos os templates
export const workflowTemplates = [onboardingClienteTemplate, cobrancaAutomaticaTemplate, leadNurturingTemplate];

export default workflowTemplates;
