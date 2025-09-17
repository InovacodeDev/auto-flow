import { IntegrationBase, ValidationResult, IntegrationAction, ActionResult, AutoFlowError } from "../types";

/**
 * Base abstract class for all AutoFlow integrations
 * Following the pattern defined in AGENTS-autoflow.md
 */
export abstract class Integration implements IntegrationBase {
    protected apiKey: string;
    protected baseUrl: string;
    protected organizationId: string;

    constructor(apiKey: string, baseUrl: string, organizationId: string) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.organizationId = organizationId;
    }

    /**
     * Authenticate with the external service
     */
    abstract authenticate(): Promise<boolean>;

    /**
     * Validate the integration configuration
     */
    abstract validateConfig(): Promise<ValidationResult>;

    /**
     * Execute an integration action
     */
    abstract execute(action: IntegrationAction): Promise<ActionResult>;

    /**
     * Test the integration connection
     */
    abstract testConnection(): Promise<boolean>;

    /**
     * Get available actions for this integration
     */
    abstract getAvailableActions(): string[];

    /**
     * Protected method to handle API requests with error handling
     */
    protected async makeRequest(
        endpoint: string,
        method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
        data?: any,
        headers?: Record<string, string>
    ): Promise<any> {
        try {
            const url = `${this.baseUrl}${endpoint}`;
            const defaultHeaders = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.apiKey}`,
                ...headers,
            };

            const response = await fetch(url, {
                method,
                headers: defaultHeaders,
                body: data ? JSON.stringify(data) : null,
            });

            if (!response.ok) {
                throw new AutoFlowError(
                    `Integration API request failed: ${response.statusText}`,
                    "INTEGRATION_API_ERROR",
                    {
                        status: response.status,
                        url,
                        method,
                    }
                );
            }

            return await response.json();
        } catch (error) {
            if (error instanceof AutoFlowError) {
                throw error;
            }

            throw new AutoFlowError("Integration request failed", "INTEGRATION_REQUEST_ERROR", {
                originalError: error,
                endpoint,
                method,
            });
        }
    }

    /**
     * Validate required configuration fields
     */
    protected validateRequiredFields(config: Record<string, any>, requiredFields: string[]): ValidationResult {
        const missing = requiredFields.filter((field) => !config[field]);

        if (missing.length > 0) {
            return {
                isValid: false,
                errors: [`Missing required fields: ${missing.join(", ")}`],
            };
        }

        return { isValid: true };
    }

    /**
     * Log integration activity for audit purposes
     */
    protected async logActivity(action: string, success: boolean, details?: Record<string, any>): Promise<void> {
        // TODO: Implement activity logging to database
        console.log(`[${this.constructor.name}] ${action}:`, {
            success,
            organizationId: this.organizationId,
            timestamp: new Date().toISOString(),
            ...details,
        });
    }
}
