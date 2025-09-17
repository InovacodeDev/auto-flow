// ============================================================================
// AUTOFLOW CONFIGURATION - Conforme AGENTS-autoflow.md
// ============================================================================

export const env = {
    NODE_ENV: process.env["NODE_ENV"] || "development",
    PORT: Number(process.env["PORT"]) || 3001,
    HOST: process.env["HOST"] || "0.0.0.0",

    // Database
    DATABASE_URL: process.env["DATABASE_URL"] || "postgresql://autoflow:password@localhost:5432/autoflow",

    // Redis
    REDIS_URL: process.env["REDIS_URL"] || "redis://localhost:6379",

    // JWT
    JWT_SECRET: process.env["JWT_SECRET"] || "autoflow-super-secret-key",
    JWT_EXPIRES_IN: process.env["JWT_EXPIRES_IN"] || "7d",

    // Frontend
    FRONTEND_URL: process.env["FRONTEND_URL"] || "http://localhost:3000",

    // AI/OpenAI
    OPENAI_API_KEY: process.env["OPENAI_API_KEY"] || "",
    OPENAI_MODEL: process.env["OPENAI_MODEL"] || "gpt-4",

    // WhatsApp Business API
    WHATSAPP_ACCESS_TOKEN: process.env["WHATSAPP_ACCESS_TOKEN"] || "",
    WHATSAPP_PHONE_NUMBER_ID: process.env["WHATSAPP_PHONE_NUMBER_ID"] || "",
    WHATSAPP_WEBHOOK_VERIFY_TOKEN: process.env["WHATSAPP_WEBHOOK_VERIFY_TOKEN"] || "autoflow-webhook-token",

    // Email
    SMTP_HOST: process.env["SMTP_HOST"] || "localhost",
    SMTP_PORT: Number(process.env["SMTP_PORT"]) || 587,
    SMTP_USER: process.env["SMTP_USER"] || "",
    SMTP_PASS: process.env["SMTP_PASS"] || "",

    // File Storage
    STORAGE_TYPE: process.env["STORAGE_TYPE"] || "local", // 'local' | 's3'
    AWS_REGION: process.env["AWS_REGION"] || "us-east-1",
    AWS_S3_BUCKET: process.env["AWS_S3_BUCKET"] || "",
} as const;

// ============================================================================
// BUSINESS CONSTANTS
// ============================================================================

export const BUSINESS_CONFIG = {
    // Cálculo de ROI conforme especificação
    HOURLY_COST: 50, // R$ por hora (custo médio PME)
    AUTOMATION_COST_PER_EXECUTION: 0.01, // R$ por execução

    // Planos de assinatura
    PLANS: {
        FREE: {
            name: "Grátis",
            workflowsLimit: 3,
            executionsPerMonth: 100,
            price: 0,
        },
        STARTER: {
            name: "Iniciante",
            workflowsLimit: 10,
            executionsPerMonth: 1000,
            price: 97,
        },
        PROFESSIONAL: {
            name: "Profissional",
            workflowsLimit: 50,
            executionsPerMonth: 10000,
            price: 297,
        },
        ENTERPRISE: {
            name: "Empresarial",
            workflowsLimit: -1, // ilimitado
            executionsPerMonth: -1,
            price: 797,
        },
    },

    // Indústrias brasileiras suportadas
    INDUSTRIES: [
        "Varejo",
        "E-commerce",
        "Serviços",
        "Consultoria",
        "Saúde",
        "Educação",
        "Imobiliário",
        "Alimentação",
        "Tecnologia",
        "Manufatura",
        "Logística",
        "Financeiro",
    ],

    // Integrações nativas suportadas
    INTEGRATIONS: {
        WHATSAPP: {
            name: "WhatsApp Business",
            category: "Comunicação",
            description: "Envio e recebimento de mensagens WhatsApp",
        },
        RD_STATION: {
            name: "RD Station",
            category: "CRM",
            description: "Gestão de leads e marketing",
        },
        PIPEDRIVE: {
            name: "Pipedrive",
            category: "CRM",
            description: "Pipeline de vendas",
        },
        OMIE: {
            name: "Omie",
            category: "ERP",
            description: "Gestão empresarial completa",
        },
        CONTAAZUL: {
            name: "ContaAzul",
            category: "ERP",
            description: "Gestão financeira e fiscal",
        },
        MERCADOPAGO: {
            name: "Mercado Pago",
            category: "Pagamento",
            description: "Processamento de pagamentos PIX",
        },
    },
} as const;

// ============================================================================
// TECHNICAL CONSTANTS
// ============================================================================

export const TECHNICAL_CONFIG = {
    // Rate limiting
    RATE_LIMIT: {
        windowMs: 15 * 60 * 1000, // 15 minutos
        max: 100, // máximo de requests por IP
        standardHeaders: true,
        legacyHeaders: false,
    },

    // Workflow execution
    WORKFLOW_EXECUTION: {
        maxExecutionTime: 300, // 5 minutos
        maxRetries: 3,
        retryDelay: 1000, // 1 segundo
        queueConcurrency: 10,
    },

    // File upload
    FILE_UPLOAD: {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ["image/jpeg", "image/png", "image/gif", "application/pdf", "text/plain"],
        tempDir: "/tmp/autoflow-uploads",
    },

    // Logs
    LOG_CONFIG: {
        level: env.NODE_ENV === "production" ? "info" : "debug",
        format: env.NODE_ENV === "production" ? "json" : "pretty",
        rotation: {
            frequency: "daily",
            max: "10d",
        },
    },
} as const;

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const VALIDATION_RULES = {
    user: {
        nameMinLength: 2,
        nameMaxLength: 100,
        passwordMinLength: 8,
        passwordMaxLength: 128,
    },
    organization: {
        nameMinLength: 2,
        nameMaxLength: 100,
        slugMinLength: 3,
        slugMaxLength: 50,
    },
    workflow: {
        nameMinLength: 3,
        nameMaxLength: 100,
        descriptionMaxLength: 500,
        maxTriggers: 5,
        maxActions: 50,
        maxConditions: 20,
    },
} as const;

// ============================================================================
// AI PROMPTS TEMPLATES
// ============================================================================

export const AI_PROMPTS = {
    WORKFLOW_CREATION: `
Você é um especialista em automação de processos para PMEs brasileiras.
Crie um workflow baseado na seguinte solicitação do usuário: {userMessage}

Contexto do negócio:
- Indústria: {industry}
- Tamanho: {businessSize}
- Ferramentas atuais: {currentTools}

Responda em formato JSON com:
1. workflow: objeto com triggers, actions e conditions
2. reasoning: explicação da lógica
3. estimatedROI: tempo economizado e impacto financeiro

Foque em soluções práticas para o mercado brasileiro.
`,

    WORKFLOW_OPTIMIZATION: `
Analise o workflow atual e sugira melhorias:
{currentWorkflow}

Métricas atuais:
- Taxa de sucesso: {successRate}%
- Tempo médio: {avgTime}s
- Erros frequentes: {commonErrors}

Sugira otimizações específicas para aumentar eficiência e reduzir erros.
`,

    TROUBLESHOOTING: `
Diagnostique o problema no workflow:
{workflowData}

Erro reportado: {errorMessage}
Logs: {errorLogs}

Forneça:
1. Causa raiz provável
2. Solução passo a passo
3. Prevenção futura
`,
} as const;

// ============================================================================
// EXPORTED UTILITIES
// ============================================================================

export const isDevelopment = () => env.NODE_ENV === "development";
export const isProduction = () => env.NODE_ENV === "production";
export const isTest = () => env.NODE_ENV === "test";

export const getApiUrl = (path: string = "") => {
    const baseUrl = isProduction() ? "https://api.autoflow.com.br" : `http://localhost:${env.PORT}`;
    return `${baseUrl}${path}`;
};

export const getFrontendUrl = (path: string = "") => {
    return `${env.FRONTEND_URL}${path}`;
};
