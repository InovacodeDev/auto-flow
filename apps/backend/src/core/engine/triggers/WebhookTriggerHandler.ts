import { TriggerHandler, TriggerConfig, TriggerType } from "../types";
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import crypto from "crypto";

/**
 * Webhook Trigger Handler
 * Permite execução de workflows via requisições HTTP
 */
export class WebhookTriggerHandler implements TriggerHandler {
    type: TriggerType = "webhook";
    private fastify: FastifyInstance;
    private registeredWebhooks = new Map<string, { config: TriggerConfig; secret?: string }>();
    private executeCallback?: (workflowId: string, triggerData: any) => Promise<void>;

    constructor(fastify: FastifyInstance) {
        this.fastify = fastify;
    }

    setExecuteCallback(callback: (workflowId: string, triggerData: any) => Promise<void>): void {
        this.executeCallback = callback;
    }

    async register(workflowId: string, config: TriggerConfig): Promise<void> {
        if (config.type !== "webhook") {
            throw new Error(`Invalid trigger type for WebhookTriggerHandler: ${config.type}`);
        }

        const webhookConfig = config.webhook;
        if (!webhookConfig) {
            throw new Error("Webhook configuration is required");
        }

        // Gerar secret para validação opcional
        const secret = crypto.randomBytes(32).toString("hex");

        // Registrar rota no Fastify
        const path = `/api/webhooks/${workflowId}`;
        const method = webhookConfig.method.toLowerCase() as "get" | "post" | "put" | "delete";

        this.fastify.route({
            method: method,
            url: path,
            handler: async (request: FastifyRequest, reply: FastifyReply) => {
                try {
                    await this.handleWebhookRequest(workflowId, request, reply);
                } catch (error) {
                    this.fastify.log.error(`Webhook error for workflow ${workflowId}: ${(error as Error).message}`);
                    reply.status(500).send({
                        error: "Internal Server Error",
                        message: "Failed to process webhook",
                    });
                }
            },
        });

        this.registeredWebhooks.set(workflowId, { config, secret });

        console.log(`✅ Webhook registered: ${method.toUpperCase()} ${path} for workflow: ${workflowId}`);
    }

    async unregister(workflowId: string): Promise<void> {
        const registration = this.registeredWebhooks.get(workflowId);
        if (registration) {
            // Nota: Fastify não tem uma maneira direta de remover rotas após o registro
            // Em um ambiente de produção, você precisaria de uma estratégia diferente
            // como usar um middleware que verifica se a rota ainda está ativa

            this.registeredWebhooks.delete(workflowId);
            console.log(`❌ Webhook unregistered for workflow: ${workflowId}`);
        }
    }

    async update(workflowId: string, config: TriggerConfig): Promise<void> {
        if (config.type !== "webhook") {
            throw new Error(`Invalid trigger type for WebhookTriggerHandler: ${config.type}`);
        }

        // Para atualizar, precisamos remover e registrar novamente
        await this.unregister(workflowId);
        await this.register(workflowId, config);
    }

    async isActive(workflowId: string): Promise<boolean> {
        return this.registeredWebhooks.has(workflowId);
    }

    private async handleWebhookRequest(
        workflowId: string,
        request: FastifyRequest,
        reply: FastifyReply
    ): Promise<void> {
        const registration = this.registeredWebhooks.get(workflowId);

        if (!registration) {
            reply.status(404).send({
                error: "Not Found",
                message: `Webhook not found for workflow: ${workflowId}`,
            });
            return;
        }

        // Validar autenticação se configurada
        const authResult = this.validateAuthentication(request, registration.config);
        if (!authResult.valid) {
            reply.status(401).send({
                error: "Unauthorized",
                message: authResult.message || "Authentication failed",
            });
            return;
        }

        // Preparar dados do trigger
        const triggerData = {
            webhook: {
                method: request.method,
                url: request.url,
                headers: request.headers,
                query: request.query,
                body: request.body,
                ip: request.ip,
                timestamp: new Date().toISOString(),
            },
        };

        // Executar workflow
        if (this.executeCallback) {
            try {
                await this.executeCallback(workflowId, triggerData);

                reply.send({
                    success: true,
                    message: "Workflow triggered successfully",
                    workflowId,
                    timestamp: triggerData.webhook.timestamp,
                });
            } catch (error) {
                this.fastify.log.error(`Failed to execute workflow ${workflowId}: ${(error as Error).message}`);
                reply.status(500).send({
                    error: "Execution Error",
                    message: "Failed to execute workflow",
                });
            }
        } else {
            reply.status(500).send({
                error: "Configuration Error",
                message: "Execute callback not configured",
            });
        }
    }

    private validateAuthentication(
        request: FastifyRequest,
        config: TriggerConfig
    ): { valid: boolean; message?: string } {
        const authConfig = config.webhook?.authentication;

        if (!authConfig) {
            return { valid: true }; // Sem autenticação requerida
        }

        switch (authConfig.type) {
            case "bearer":
                return this.validateBearerAuth(request, authConfig.config);

            case "basic":
                return this.validateBasicAuth(request, authConfig.config);

            case "api-key":
                return this.validateApiKeyAuth(request, authConfig.config);

            default:
                return { valid: false, message: `Unsupported authentication type: ${authConfig.type}` };
        }
    }

    private validateBearerAuth(
        request: FastifyRequest,
        authConfig: Record<string, any>
    ): { valid: boolean; message?: string } {
        const authorization = request.headers.authorization;

        if (!authorization || !authorization.startsWith("Bearer ")) {
            return { valid: false, message: "Bearer token required" };
        }

        const token = authorization.substring(7);
        const expectedToken = authConfig["token"];

        if (!expectedToken) {
            return { valid: false, message: "Bearer token not configured" };
        }

        if (token !== expectedToken) {
            return { valid: false, message: "Invalid bearer token" };
        }

        return { valid: true };
    }

    private validateBasicAuth(
        request: FastifyRequest,
        authConfig: Record<string, any>
    ): { valid: boolean; message?: string } {
        const authorization = request.headers.authorization;

        if (!authorization || !authorization.startsWith("Basic ")) {
            return { valid: false, message: "Basic authentication required" };
        }

        try {
            const credentials = Buffer.from(authorization.substring(6), "base64").toString();
            const [username, password] = credentials.split(":");

            const expectedUsername = authConfig["username"];
            const expectedPassword = authConfig["password"];

            if (!expectedUsername || !expectedPassword) {
                return { valid: false, message: "Basic auth credentials not configured" };
            }

            if (username !== expectedUsername || password !== expectedPassword) {
                return { valid: false, message: "Invalid credentials" };
            }

            return { valid: true };
        } catch (error) {
            return { valid: false, message: "Invalid basic auth format" };
        }
    }

    private validateApiKeyAuth(
        request: FastifyRequest,
        authConfig: Record<string, any>
    ): { valid: boolean; message?: string } {
        const headerName = authConfig["headerName"] || "X-API-Key";
        const apiKey = request.headers[headerName.toLowerCase()] as string;

        if (!apiKey) {
            return { valid: false, message: `API key required in header: ${headerName}` };
        }

        const expectedApiKey = authConfig["apiKey"];

        if (!expectedApiKey) {
            return { valid: false, message: "API key not configured" };
        }

        if (apiKey !== expectedApiKey) {
            return { valid: false, message: "Invalid API key" };
        }

        return { valid: true };
    }

    /**
     * Obter informações sobre o webhook registrado
     */
    getWebhookInfo(workflowId: string): { url: string; method: string; secret?: string } | null {
        const registration = this.registeredWebhooks.get(workflowId);

        if (!registration || !registration.config.webhook) {
            return null;
        }

        const returnValue: { url: string; method: string; secret?: string } = {
            url: `/api/webhooks/${workflowId}`,
            method: registration.config.webhook.method,
        };

        if (registration.secret) {
            returnValue.secret = registration.secret;
        }

        return returnValue;
    }

    /**
     * Listar todos os webhooks registrados
     */
    listWebhooks(): Array<{ workflowId: string; url: string; method: string }> {
        const webhooks: Array<{ workflowId: string; url: string; method: string }> = [];

        for (const [workflowId, registration] of this.registeredWebhooks) {
            if (registration.config.webhook) {
                webhooks.push({
                    workflowId,
                    url: `/api/webhooks/${workflowId}`,
                    method: registration.config.webhook.method,
                });
            }
        }

        return webhooks;
    }
}
