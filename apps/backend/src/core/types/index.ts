import { z } from "zod";

// Base types for AutoFlow workflow engine
export interface AutoFlowWorkflow {
    id: string;
    name: string;
    triggers: WorkflowTrigger[];
    actions: WorkflowAction[];
    conditions: WorkflowCondition[];
    metadata: {
        createdBy: string;
        aiGenerated: boolean;
        language: "pt-BR";
        industry: string;
        [key: string]: any;
    };
}

// Workflow Trigger types
export interface WorkflowTrigger {
    id: string;
    type: TriggerType;
    config: Record<string, any>;
    enabled: boolean;
}

export type TriggerType = "whatsapp_received" | "webhook" | "schedule" | "manual" | "email_received" | "form_submitted";

// Workflow Action types
export interface WorkflowAction {
    id: string;
    type: ActionType;
    config: Record<string, any>;
    position: { x: number; y: number };
}

export type ActionType =
    | "whatsapp_send"
    | "email_send"
    | "http_request"
    | "database_save"
    | "ai_process"
    | "delay"
    | "condition_check";

// Workflow Condition types
export interface WorkflowCondition {
    id: string;
    type: "if" | "switch" | "loop";
    condition: string;
    trueActions: string[];
    falseActions?: string[];
}

// Workflow execution result
export interface WorkflowResult {
    status: "success" | "error" | "partial";
    executedActions: string[];
    errors?: Array<{
        actionId: string;
        message: string;
        details?: any;
    }>;
    data?: Record<string, any>;
}

// Integration base interface
export interface IntegrationBase {
    authenticate(): Promise<boolean>;
    validateConfig(): Promise<ValidationResult>;
    execute(action: IntegrationAction): Promise<ActionResult>;
}

export interface ValidationResult {
    isValid: boolean;
    errors?: string[];
    warnings?: string[];
}

export interface IntegrationAction {
    type: string;
    config: Record<string, any>;
    payload: Record<string, any>;
}

export interface ActionResult {
    success: boolean;
    data?: any;
    error?: string;
    metadata?: Record<string, any>;
}

// WhatsApp specific types
export interface WhatsAppConfig {
    apiKey: string;
    phoneNumberId: string;
    businessAccountId: string;
    webhookVerifyToken: string;
}

export interface WhatsAppMessage {
    from: string;
    to: string;
    body: string;
    type: "text" | "image" | "document" | "audio";
    timestamp: number;
}

export interface MessageResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

// PIX specific types
export interface PIXConfig {
    accessToken: string;
    userId: string;
    webhookUrl?: string;
}

export interface PaymentResult {
    paymentId: string;
    status: string;
    amount: number;
    statusDetail?: string;
}

// ERP specific types
export interface ERPConfig {
    apiKey: string;
    appSecret?: string;
    baseUrl?: string;
}

export interface ERPContact {
    id?: string;
    name: string;
    email?: string;
    phone?: string;
    document?: string;
}

export interface ERPProduct {
    id?: string;
    name: string;
    sku: string;
    price: number;
    stock?: number;
}

export interface ERPOrder {
    id?: string;
    customerId: string;
    items: Array<{
        productId: string;
        quantity: number;
        price: number;
    }>;
    total: number;
    status?: string;
}

// CRM specific types
export interface CRMConfig {
    apiKey: string;
    clientId?: string;
    clientSecret?: string;
    baseUrl?: string;
}

export interface CRMContact {
    id?: string;
    email: string;
    name: string;
    phone?: string;
    jobTitle?: string;
    company?: string;
    city?: string;
    state?: string;
    country?: string;
    tags?: string[];
    customFields?: Record<string, any>;
}

export interface CRMEvent {
    type: string;
    identifier: string;
    contactEmail: string;
    data?: Record<string, any>;
    timestamp?: Date;
}

// AI Assistant types
export interface AIPromptTemplate {
    id: string;
    name: string;
    context: "automation_creation" | "optimization" | "troubleshooting";
    prompt: string;
    variables: string[];
    expectedOutput: "workflow_json" | "suggestion" | "analysis";
}

export interface BusinessContext {
    industry: string;
    companySize: "micro" | "small" | "medium";
    currentTools: string[];
    mainProcesses: string[];
    painPoints: string[];
}

export interface WorkflowSuggestion {
    workflow: Partial<AutoFlowWorkflow>;
    confidence: number;
    explanation: string;
    estimatedROI: {
        timeSaved: number; // hours per month
        costSavings: number; // reais per month
    };
}

// Analytics and ROI types
export interface AutomationMetrics {
    executionsCount: number;
    timeSaved: number; // em horas
    costSavings: number; // em reais
    revenueGenerated: number;
    errorRate: number;
    successRate: number;
}

export interface ROIReport {
    totalROI: number;
    timeSavings: number;
    costSavings: number;
    revenueImpact: number;
    efficiency: number;
}

// Error handling
export class AutoFlowError extends Error {
    constructor(
        message: string,
        public code: string,
        public context: Record<string, any> = {}
    ) {
        super(message);
        this.name = "AutoFlowError";
    }
}

// Zod schemas for validation
export const WorkflowTriggerSchema = z.object({
    id: z.string(),
    type: z.enum(["whatsapp_received", "webhook", "schedule", "manual", "email_received", "form_submitted"]),
    config: z.record(z.any()),
    enabled: z.boolean(),
});

export const WorkflowActionSchema = z.object({
    id: z.string(),
    type: z.enum([
        "whatsapp_send",
        "email_send",
        "http_request",
        "database_save",
        "ai_process",
        "delay",
        "condition_check",
    ]),
    config: z.record(z.any()),
    position: z.object({
        x: z.number(),
        y: z.number(),
    }),
});

export const WorkflowConditionSchema = z.object({
    id: z.string(),
    type: z.enum(["if", "switch", "loop"]),
    condition: z.string(),
    trueActions: z.array(z.string()),
    falseActions: z.array(z.string()).optional(),
});

export const AutoFlowWorkflowSchema = z.object({
    id: z.string(),
    name: z.string(),
    triggers: z.array(WorkflowTriggerSchema),
    actions: z.array(WorkflowActionSchema),
    conditions: z.array(WorkflowConditionSchema),
    metadata: z
        .object({
            createdBy: z.string(),
            aiGenerated: z.boolean(),
            language: z.literal("pt-BR"),
            industry: z.string(),
        })
        .and(z.record(z.any())),
});
