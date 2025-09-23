import axios from "axios";
import { NodeProcessor, NodeJobData, NodeExecutionResult, WorkflowLog } from "../types";

/**
 * Processador para requisição HTTP
 */
export const HttpRequestProcessor: NodeProcessor = {
    nodeType: "http_request",

    process: async (data: NodeJobData): Promise<NodeExecutionResult> => {
        const { config, inputs, context } = data;

        try {
            const url = config.url || inputs.url;
            const method = (config.method || "GET").toUpperCase();
            const headers = config.headers || {};
            const timeout = config.timeout || 30000;

            if (!url) {
                throw new Error("URL is required for HTTP request");
            }

            const requestConfig = {
                method,
                url,
                headers,
                timeout,
                data: inputs.data,
                params: inputs.params,
            };

            const response = await axios(requestConfig);

            const result = {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
                data: response.data,
                url: response.config.url,
                method: response.config.method,
            };

            const log: WorkflowLog = {
                id: `${data.executionId}-${Date.now()}`,
                timestamp: new Date(),
                level: "info",
                message: `HTTP request completed (${method} ${url}) - Status: ${response.status}`,
                nodeId: data.nodeId,
                data: { method, url, status: response.status },
            };
            context.logs.push(log);

            return {
                success: true,
                data: result,
                logs: [log],
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);

            const log: WorkflowLog = {
                id: `${data.executionId}-${Date.now()}`,
                timestamp: new Date(),
                level: "error",
                message: `HTTP request failed: ${errorMessage}`,
                nodeId: data.nodeId,
            };
            context.logs.push(log);

            return {
                success: false,
                error: errorMessage,
                logs: [log],
            };
        }
    },

    validate: (config: Record<string, any>): boolean => {
        const url = config.url;
        const method = config.method;

        if (!url || typeof url !== "string") {
            return false;
        }

        const validMethods = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"];
        if (method && !validMethods.includes(method.toUpperCase())) {
            return false;
        }

        return true;
    },
};

/**
 * Processador para envio de email
 */
export const EmailProcessor: NodeProcessor = {
    nodeType: "send_email",

    process: async (data: NodeJobData): Promise<NodeExecutionResult> => {
        const { config, inputs, context } = data;

        try {
            const to = inputs.to || config.to;
            const subject = inputs.subject || config.subject;
            const body = inputs.body || config.body;
            const from = config.from || "noreply@autoflow.com";
            const provider = config.provider || "smtp";

            if (!to || !subject || !body) {
                throw new Error("To, subject, and body are required for email");
            }

            // Simular envio de email
            const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const result = {
                messageId,
                to,
                from,
                subject,
                provider,
                status: "sent",
                timestamp: new Date().toISOString(),
            };

            const log: WorkflowLog = {
                id: `${data.executionId}-${Date.now()}`,
                timestamp: new Date(),
                level: "info",
                message: `Email sent successfully to ${to}`,
                nodeId: data.nodeId,
                data: { to, subject, messageId },
            };
            context.logs.push(log);

            return {
                success: true,
                data: result,
                logs: [log],
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);

            const log: WorkflowLog = {
                id: `${data.executionId}-${Date.now()}`,
                timestamp: new Date(),
                level: "error",
                message: `Email sending failed: ${errorMessage}`,
                nodeId: data.nodeId,
            };
            context.logs.push(log);

            return {
                success: false,
                error: errorMessage,
                logs: [log],
            };
        }
    },

    validate: (config: Record<string, any>): boolean => {
        const from = config.from;
        const provider = config.provider;

        if (!from || typeof from !== "string") {
            return false;
        }

        const validProviders = ["smtp", "sendgrid", "mailgun", "ses"];
        if (provider && !validProviders.includes(provider)) {
            return false;
        }

        return true;
    },
};

/**
 * Processador para operações de banco de dados
 */
export const DatabaseProcessor: NodeProcessor = {
    nodeType: "database_save",

    process: async (data: NodeJobData): Promise<NodeExecutionResult> => {
        const { config, inputs, context } = data;

        try {
            const table = config.table || "records";
            const operation = config.operation || "insert";
            const dataToSave = inputs.data || {};

            if (!dataToSave || typeof dataToSave !== "object") {
                throw new Error("Data is required for database operation");
            }

            // Simular operação de banco de dados
            const recordId = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const result = {
                id: recordId,
                table,
                operation,
                data: dataToSave,
                timestamp: new Date().toISOString(),
                affectedRows: 1,
            };

            const log: WorkflowLog = {
                id: `${data.executionId}-${Date.now()}`,
                timestamp: new Date(),
                level: "info",
                message: `Database operation completed (${operation} on ${table})`,
                nodeId: data.nodeId,
                data: { table, operation, recordId },
            };
            context.logs.push(log);

            return {
                success: true,
                data: result,
                logs: [log],
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);

            const log: WorkflowLog = {
                id: `${data.executionId}-${Date.now()}`,
                timestamp: new Date(),
                level: "error",
                message: `Database operation failed: ${errorMessage}`,
                nodeId: data.nodeId,
            };
            context.logs.push(log);

            return {
                success: false,
                error: errorMessage,
                logs: [log],
            };
        }
    },

    validate: (config: Record<string, any>): boolean => {
        const table = config.table;
        const operation = config.operation;

        if (!table || typeof table !== "string") {
            return false;
        }

        const validOperations = ["insert", "update", "delete", "upsert"];
        if (operation && !validOperations.includes(operation)) {
            return false;
        }

        return true;
    },
};

/**
 * Processador para WhatsApp
 */
export const WhatsAppProcessor: NodeProcessor = {
    nodeType: "whatsapp_send",

    process: async (data: NodeJobData): Promise<NodeExecutionResult> => {
        const { config, inputs, context } = data;

        try {
            const to = inputs.to || config.to;
            const message = inputs.message || config.message;
            const type = config.type || "text";

            if (!to || !message) {
                throw new Error("To and message are required for WhatsApp");
            }

            // Simular envio de WhatsApp
            const messageId = `wa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const result = {
                messageId,
                to,
                message,
                type,
                status: "sent",
                timestamp: new Date().toISOString(),
            };

            const log: WorkflowLog = {
                id: `${data.executionId}-${Date.now()}`,
                timestamp: new Date(),
                level: "info",
                message: `WhatsApp message sent to ${to}`,
                nodeId: data.nodeId,
                data: { to, type, messageId },
            };
            context.logs.push(log);

            return {
                success: true,
                data: result,
                logs: [log],
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);

            const log: WorkflowLog = {
                id: `${data.executionId}-${Date.now()}`,
                timestamp: new Date(),
                level: "error",
                message: `WhatsApp sending failed: ${errorMessage}`,
                nodeId: data.nodeId,
            };
            context.logs.push(log);

            return {
                success: false,
                error: errorMessage,
                logs: [log],
            };
        }
    },

    validate: (config: Record<string, any>): boolean => {
        const type = config.type;

        const validTypes = ["text", "image", "document", "audio", "video"];
        if (type && !validTypes.includes(type)) {
            return false;
        }

        return true;
    },
};

/**
 * Processador para pagamentos
 */
export const PaymentProcessor: NodeProcessor = {
    nodeType: "payment_process",

    process: async (data: NodeJobData): Promise<NodeExecutionResult> => {
        const { config, inputs, context } = data;

        try {
            const amount = inputs.amount || config.amount;
            const customer = inputs.customer || config.customer;
            const provider = config.provider || "stripe";
            const currency = config.currency || "BRL";

            if (!amount || !customer) {
                throw new Error("Amount and customer are required for payment");
            }

            // Simular processamento de pagamento
            const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const result = {
                transactionId,
                amount,
                currency,
                customer,
                provider,
                status: "completed",
                timestamp: new Date().toISOString(),
                receipt: {
                    id: transactionId,
                    amount,
                    currency,
                    status: "paid",
                },
            };

            const log: WorkflowLog = {
                id: `${data.executionId}-${Date.now()}`,
                timestamp: new Date(),
                level: "info",
                message: `Payment processed successfully (${amount} ${currency})`,
                nodeId: data.nodeId,
                data: { amount, currency, transactionId },
            };
            context.logs.push(log);

            return {
                success: true,
                data: result,
                logs: [log],
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);

            const log: WorkflowLog = {
                id: `${data.executionId}-${Date.now()}`,
                timestamp: new Date(),
                level: "error",
                message: `Payment processing failed: ${errorMessage}`,
                nodeId: data.nodeId,
            };
            context.logs.push(log);

            return {
                success: false,
                error: errorMessage,
                logs: [log],
            };
        }
    },

    validate: (config: Record<string, any>): boolean => {
        const amount = config.amount;
        const currency = config.currency;
        const provider = config.provider;

        if (amount && (isNaN(amount) || amount <= 0)) {
            return false;
        }

        const validCurrencies = ["BRL", "USD", "EUR", "GBP"];
        if (currency && !validCurrencies.includes(currency)) {
            return false;
        }

        const validProviders = ["stripe", "mercadopago", "paypal", "pagseguro"];
        if (provider && !validProviders.includes(provider)) {
            return false;
        }

        return true;
    },
};
