import { TriggerHandler, TriggerType } from "../types";
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import crypto from "crypto";

/**
 * Advanced Webhook Trigger Handler
 * Suporta autenticação, validação de payload e filtragem
 */
export class AdvancedWebhookTriggerHandler implements TriggerHandler {
    type: TriggerType = "webhook";
    private fastify?: FastifyInstance;
    private webhooks = new Map<string, WebhookConfig>();

    constructor(fastify?: FastifyInstance) {
        if (fastify) {
            this.fastify = fastify;
        }
    }

    async register(workflowId: string, config: any): Promise<void> {
        if (!this.fastify) {
            throw new Error("Fastify instance not available");
        }

        const webhookConfig: WebhookConfig = {
            workflowId,
            path: config.path || `/webhook/${workflowId}`,
            method: config.method || "POST",
            authentication: config.authentication || "none",
            secretKey: config.secretKey,
            allowedIPs: config.allowedIPs || [],
            payloadValidation: config.payloadValidation,
            filters: config.filters || [],
            rateLimit: config.rateLimit,
            timeout: config.timeout || 30000,
            retryPolicy: config.retryPolicy || { enabled: false, maxAttempts: 3 },
        };

        // Registrar rota no Fastify
        const routeHandler = this.createRouteHandler(webhookConfig);

        if (webhookConfig.method.toLowerCase() === "get") {
            this.fastify.get(webhookConfig.path, routeHandler);
        } else if (webhookConfig.method.toLowerCase() === "post") {
            this.fastify.post(webhookConfig.path, routeHandler);
        } else if (webhookConfig.method.toLowerCase() === "put") {
            this.fastify.put(webhookConfig.path, routeHandler);
        } else if (webhookConfig.method.toLowerCase() === "delete") {
            this.fastify.delete(webhookConfig.path, routeHandler);
        }

        this.webhooks.set(workflowId, webhookConfig);
        console.log(`Advanced webhook registered: ${webhookConfig.method} ${webhookConfig.path}`);
    }

    async unregister(workflowId: string): Promise<void> {
        const config = this.webhooks.get(workflowId);
        if (config) {
            // TODO: Remover rota do Fastify (não há API direta para isso)
            this.webhooks.delete(workflowId);
            console.log(`Advanced webhook unregistered: ${config.path}`);
        }
    }

    private createRouteHandler(config: WebhookConfig) {
        return async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                // Verificar rate limiting
                if (config.rateLimit && !this.checkRateLimit(request, config.rateLimit)) {
                    reply.code(429).send({ error: "Rate limit exceeded" });
                    return;
                }

                // Verificar IPs permitidos
                if (config.allowedIPs.length > 0) {
                    const clientIP = request.ip;
                    if (!config.allowedIPs.includes(clientIP)) {
                        reply.code(403).send({ error: "IP not allowed" });
                        return;
                    }
                }

                // Autenticação
                if (!this.authenticate(request, config)) {
                    reply.code(401).send({ error: "Authentication failed" });
                    return;
                }

                // Validação do payload
                if (config.payloadValidation && !this.validatePayload(request.body, config.payloadValidation)) {
                    reply.code(400).send({ error: "Payload validation failed" });
                    return;
                }

                // Aplicar filtros
                if (config.filters.length > 0 && !this.applyFilters(request.body, config.filters)) {
                    reply.code(200).send({ message: "Filtered out" });
                    return;
                }

                // Extrair dados do trigger
                const triggerData = {
                    headers: request.headers,
                    body: request.body,
                    query: request.query,
                    params: request.params,
                    method: request.method,
                    url: request.url,
                    ip: request.ip,
                    timestamp: new Date().toISOString(),
                };

                // Executar workflow (delegado para o engine)
                await this.executeWorkflow(config.workflowId, triggerData);

                reply.code(200).send({
                    success: true,
                    message: "Workflow triggered successfully",
                    workflowId: config.workflowId,
                });
            } catch (error) {
                console.error(`Webhook error for workflow ${config.workflowId}:`, error);
                reply.code(500).send({ error: "Internal server error" });
            }
        };
    }

    private authenticate(request: FastifyRequest, config: WebhookConfig): boolean {
        switch (config.authentication) {
            case "none": {
                return true;
            }

            case "secret": {
                const providedSecret =
                    request.headers["x-webhook-secret"] || request.headers["authorization"]?.replace("Bearer ", "");
                return providedSecret === config.secretKey;
            }

            case "signature": {
                // Implementar validação de assinatura HMAC
                const signature = request.headers["x-hub-signature-256"] as string;
                if (!signature || !config.secretKey) return false;

                const expectedSignature = this.generateHMACSignature(JSON.stringify(request.body), config.secretKey);
                return signature === expectedSignature;
            }

            case "basic": {
                const authHeader = request.headers.authorization;
                if (!authHeader || !authHeader.startsWith("Basic ")) return false;

                const credentials = Buffer.from(authHeader.slice(6), "base64").toString();
                return credentials === config.secretKey;
            }

            default:
                return false;
        }
    }

    private generateHMACSignature(payload: string, secret: string): string {
        return "sha256=" + crypto.createHmac("sha256", secret).update(payload).digest("hex");
    }

    private validatePayload(payload: any, validation: PayloadValidation): boolean {
        try {
            if (validation.schema) {
                // Implementar validação JSON Schema
                // TODO: Adicionar biblioteca de validação como Ajv
                return true; // Placeholder
            }

            if (validation.requiredFields) {
                for (const field of validation.requiredFields) {
                    if (!this.hasProperty(payload, field)) {
                        return false;
                    }
                }
            }

            if (validation.forbiddenFields) {
                for (const field of validation.forbiddenFields) {
                    if (this.hasProperty(payload, field)) {
                        return false;
                    }
                }
            }

            return true;
        } catch (error) {
            console.error("Payload validation error:", error);
            return false;
        }
    }

    private hasProperty(obj: any, path: string): boolean {
        const keys = path.split(".");
        let current = obj;

        for (const key of keys) {
            if (current === null || current === undefined || !(key in current)) {
                return false;
            }
            current = current[key];
        }

        return true;
    }

    private applyFilters(payload: any, filters: WebhookFilter[]): boolean {
        for (const filter of filters) {
            if (!this.evaluateFilter(payload, filter)) {
                return false;
            }
        }
        return true;
    }

    private evaluateFilter(payload: any, filter: WebhookFilter): boolean {
        const value = this.getNestedValue(payload, filter.field);

        switch (filter.operator) {
            case "equals":
                return value === filter.value;
            case "not_equals":
                return value !== filter.value;
            case "contains":
                return typeof value === "string" && value.includes(filter.value);
            case "not_contains":
                return typeof value === "string" && !value.includes(filter.value);
            case "greater_than":
                return Number(value) > Number(filter.value);
            case "less_than":
                return Number(value) < Number(filter.value);
            case "exists":
                return value !== undefined && value !== null;
            case "not_exists":
                return value === undefined || value === null;
            case "regex":
                return new RegExp(filter.value).test(String(value));
            default:
                return true;
        }
    }

    private getNestedValue(obj: any, path: string): any {
        const keys = path.split(".");
        let current = obj;

        for (const key of keys) {
            if (current === null || current === undefined) {
                return undefined;
            }
            current = current[key];
        }

        return current;
    }

    async update(workflowId: string, config: any): Promise<void> {
        await this.unregister(workflowId);
        await this.register(workflowId, config);
    }

    async isActive(workflowId: string): Promise<boolean> {
        return this.webhooks.has(workflowId);
    }

    private checkRateLimit(_request: FastifyRequest, _rateLimit: RateLimit): boolean {
        // TODO: Implementar rate limiting com Redis ou cache em memória
        // Por agora, retornar true (sem limite)
        return true;
    }

    private async executeWorkflow(workflowId: string, triggerData: any): Promise<void> {
        // Esta função será implementada pelo engine que usar este handler
        console.log(`Executing workflow ${workflowId} with trigger data:`, triggerData);
    }
}

interface WebhookConfig {
    workflowId: string;
    path: string;
    method: string;
    authentication: "none" | "secret" | "signature" | "basic";
    secretKey?: string;
    allowedIPs: string[];
    payloadValidation?: PayloadValidation;
    filters: WebhookFilter[];
    rateLimit?: RateLimit;
    timeout: number;
    retryPolicy: {
        enabled: boolean;
        maxAttempts: number;
    };
}

interface PayloadValidation {
    schema?: any; // JSON Schema
    requiredFields?: string[];
    forbiddenFields?: string[];
}

interface WebhookFilter {
    field: string;
    operator:
        | "equals"
        | "not_equals"
        | "contains"
        | "not_contains"
        | "greater_than"
        | "less_than"
        | "exists"
        | "not_exists"
        | "regex";
    value: any;
}

interface RateLimit {
    requests: number;
    window: number; // em segundos
    keyGenerator?: (request: FastifyRequest) => string;
}
