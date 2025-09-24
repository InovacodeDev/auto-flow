import { z } from "zod";

// ============================================================================
// CORE WORKFLOW TYPES - Conforme AGENTS-autoflow.md
// ============================================================================

export const WorkflowTriggerSchema = z.object({
    id: z.string(),
    type: z.enum(["whatsapp_received", "webhook", "schedule", "manual", "email_received"]),
    name: z.string(),
    config: z.record(z.string(), z.any()),
    enabled: z.boolean().default(true),
});

export const WorkflowActionSchema = z.object({
    id: z.string(),
    type: z.enum(["send_whatsapp", "send_email", "api_call", "save_data", "webhook_call"]),
    name: z.string(),
    config: z.record(z.string(), z.any()),
    enabled: z.boolean().default(true),
});

export const WorkflowConditionSchema = z.object({
    id: z.string(),
    type: z.enum(["if", "switch", "loop", "delay"]),
    condition: z.string(),
    trueActions: z.array(z.string()),
    falseActions: z.array(z.string()).optional(),
});

export const AutoFlowWorkflowSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    triggers: z.array(WorkflowTriggerSchema),
    actions: z.array(WorkflowActionSchema),
    conditions: z.array(WorkflowConditionSchema),
    metadata: z.object({
        createdBy: z.string(),
        aiGenerated: z.boolean().default(false),
        language: z.literal("pt-BR"),
        industry: z.string(),
        tags: z.array(z.string()).default([]),
        version: z.number().default(1),
    }),
    status: z.enum(["draft", "active", "paused", "archived"]).default("draft"),
    createdAt: z.date(),
    updatedAt: z.date(),
});

// ============================================================================
// INTEGRATION TYPES
// ============================================================================

export const IntegrationConfigSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(["whatsapp", "email", "crm", "erp", "ecommerce", "webhook"]),
    credentials: z.record(z.string(), z.string()),
    settings: z.record(z.string(), z.any()),
    isActive: z.boolean().default(true),
});

// WhatsApp specific types
export const WhatsAppMessageSchema = z.object({
    id: z.string(),
    from: z.string(),
    to: z.string(),
    message: z.string(),
    timestamp: z.date(),
    messageType: z.enum(["text", "image", "audio", "document"]),
    metadata: z.record(z.string(), z.any()).optional(),
});

// ============================================================================
// USER & ORGANIZATION TYPES
// ============================================================================

export const UserSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
    role: z.enum(["owner", "admin", "member", "viewer"]),
    organizationId: z.string(),
    isActive: z.boolean().default(true),
    createdAt: z.date(),
    lastLoginAt: z.date().optional(),
});

export const OrganizationSchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    industry: z.string(),
    size: z.enum(["micro", "small", "medium", "large"]),
    plan: z.enum(["free", "starter", "professional", "enterprise"]),
    settings: z.record(z.string(), z.any()),
    createdAt: z.date(),
});

// ============================================================================
// ANALYTICS & METRICS TYPES
// ============================================================================

export const AutomationMetricsSchema = z.object({
    workflowId: z.string(),
    executionsCount: z.number(),
    timeSaved: z.number(), // em horas
    costSavings: z.number(), // em reais
    revenueGenerated: z.number(),
    errorRate: z.number().min(0).max(1),
    successRate: z.number().min(0).max(1),
    avgExecutionTime: z.number(), // em segundos
    period: z.object({
        start: z.date(),
        end: z.date(),
    }),
});

export const ROIReportSchema = z.object({
    organizationId: z.string(),
    totalROI: z.number(),
    timeSavings: z.number(),
    costSavings: z.number(),
    revenueImpact: z.number(),
    efficiency: z.number(),
    workflowsAnalyzed: z.number(),
    period: z.object({
        start: z.date(),
        end: z.date(),
    }),
});

// ============================================================================
// AI ASSISTANT TYPES
// ============================================================================

export const AIPromptTemplateSchema = z.object({
    id: z.string(),
    name: z.string(),
    context: z.enum(["automation_creation", "optimization", "troubleshooting"]),
    prompt: z.string(),
    variables: z.array(z.string()),
    expectedOutput: z.enum(["workflow_json", "suggestion", "analysis"]),
});

export const BusinessContextSchema = z.object({
    industry: z.string(),
    businessSize: z.enum(["micro", "small", "medium"]),
    currentTools: z.array(z.string()),
    painPoints: z.array(z.string()),
    goals: z.array(z.string()),
});

export const WorkflowSuggestionSchema = z.object({
    confidence: z.number().min(0).max(1),
    workflow: AutoFlowWorkflowSchema,
    reasoning: z.string(),
    estimatedROI: z.object({
        timeSaved: z.number(),
        costSavings: z.number(),
        implementationEffort: z.enum(["low", "medium", "high"]),
    }),
});

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export const APIResponseSchema = z.object({
    success: z.boolean(),
    data: z.any().optional(),
    message: z.string().optional(),
    errors: z.array(z.string()).optional(),
    timestamp: z.date(),
});

// ============================================================================
// EXPORTED TYPES
// ============================================================================

export type AutoFlowWorkflow = z.infer<typeof AutoFlowWorkflowSchema>;
export type WorkflowTrigger = z.infer<typeof WorkflowTriggerSchema>;
export type WorkflowAction = z.infer<typeof WorkflowActionSchema>;
export type WorkflowCondition = z.infer<typeof WorkflowConditionSchema>;

export type IntegrationConfig = z.infer<typeof IntegrationConfigSchema>;
export type WhatsAppMessage = z.infer<typeof WhatsAppMessageSchema>;

export type User = z.infer<typeof UserSchema>;
export type Organization = z.infer<typeof OrganizationSchema>;

export type AutomationMetrics = z.infer<typeof AutomationMetricsSchema>;
export type ROIReport = z.infer<typeof ROIReportSchema>;

export type AIPromptTemplate = z.infer<typeof AIPromptTemplateSchema>;
export type BusinessContext = z.infer<typeof BusinessContextSchema>;
export type WorkflowSuggestion = z.infer<typeof WorkflowSuggestionSchema>;

export type APIResponse<T = any> = z.infer<typeof APIResponseSchema> & { data?: T };

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type WorkflowExecutionResult = {
    success: boolean;
    executedActions: string[];
    errors: string[];
    executionTime: number;
    metadata: Record<string, any>;
};

export type IntegrationAction = {
    type: string;
    config: Record<string, any>;
    payload: Record<string, any>;
};

export type ActionResult = {
    success: boolean;
    data?: any;
    error?: string;
    metadata?: Record<string, any>;
};

export type ValidationResult = {
    isValid: boolean;
    errors: string[];
    warnings: string[];
};
