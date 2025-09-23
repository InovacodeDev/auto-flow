import { NodeProcessor, NodeJobData, NodeExecutionResult, WorkflowLog } from "../types";

/**
 * Processador para trigger manual
 */
export const ManualTriggerProcessor: NodeProcessor = {
    nodeType: "manual_trigger",

    process: async (data: NodeJobData): Promise<NodeExecutionResult> => {
        const { inputs, context } = data;

        // Trigger manual sempre executa com sucesso
        const result = {
            triggerType: "manual",
            timestamp: new Date().toISOString(),
            data: inputs.triggerData || {},
        };

        // Adicionar log
        const log: WorkflowLog = {
            id: `${data.executionId}-${Date.now()}`,
            timestamp: new Date(),
            level: "info",
            message: "Manual trigger executed",
            nodeId: data.nodeId,
        };
        context.logs.push(log);

        return {
            success: true,
            data: result,
            logs: [log],
        };
    },

    validate: (config: Record<string, any>): boolean => {
        return true; // Trigger manual não precisa de validação
    },
};

/**
 * Processador para webhook trigger
 */
export const WebhookTriggerProcessor: NodeProcessor = {
    nodeType: "webhook_trigger",

    process: async (data: NodeJobData): Promise<NodeExecutionResult> => {
        const { inputs, config, context } = data;

        try {
            const method = config.method || "POST";
            const authentication = config.authentication || "none";

            // Simular processamento de webhook
            const result = {
                triggerType: "webhook",
                method,
                authentication,
                timestamp: new Date().toISOString(),
                headers: inputs.headers || {},
                body: inputs.body || {},
                query: inputs.query || {},
            };

            const log: WorkflowLog = {
                id: `${data.executionId}-${Date.now()}`,
                timestamp: new Date(),
                level: "info",
                message: `Webhook trigger executed (${method})`,
                nodeId: data.nodeId,
                data: { method, authentication },
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
                message: `Webhook trigger failed: ${errorMessage}`,
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
        const validMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"];
        const method = config.method;

        if (method && !validMethods.includes(method)) {
            return false;
        }

        return true;
    },
};

/**
 * Processador para schedule trigger
 */
export const ScheduleTriggerProcessor: NodeProcessor = {
    nodeType: "schedule_trigger",

    process: async (data: NodeJobData): Promise<NodeExecutionResult> => {
        const { config, context } = data;

        try {
            const cron = config.cron || "0 9 * * 1-5";
            const timezone = config.timezone || "America/Sao_Paulo";

            // Simular execução agendada
            const result = {
                triggerType: "schedule",
                cron,
                timezone,
                timestamp: new Date().toISOString(),
                nextExecution: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Próximo dia
            };

            const log: WorkflowLog = {
                id: `${data.executionId}-${Date.now()}`,
                timestamp: new Date(),
                level: "info",
                message: `Schedule trigger executed (${cron})`,
                nodeId: data.nodeId,
                data: { cron, timezone },
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
                message: `Schedule trigger failed: ${errorMessage}`,
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
        const cron = config.cron;
        if (!cron || typeof cron !== "string") {
            return false;
        }

        // Validação básica de cron (5 campos)
        const cronParts = cron.split(" ");
        if (cronParts.length !== 5) {
            return false;
        }

        return true;
    },
};

/**
 * Processador para database trigger
 */
export const DatabaseTriggerProcessor: NodeProcessor = {
    nodeType: "database_trigger",

    process: async (data: NodeJobData): Promise<NodeExecutionResult> => {
        const { config, inputs, context } = data;

        try {
            const table = config.table || "users";
            const operation = config.operation || "insert";

            // Simular trigger de banco de dados
            const result = {
                triggerType: "database",
                table,
                operation,
                timestamp: new Date().toISOString(),
                record: inputs.record || {},
                changes: inputs.changes || {},
            };

            const log: WorkflowLog = {
                id: `${data.executionId}-${Date.now()}`,
                timestamp: new Date(),
                level: "info",
                message: `Database trigger executed (${table}.${operation})`,
                nodeId: data.nodeId,
                data: { table, operation },
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
                message: `Database trigger failed: ${errorMessage}`,
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

        const validOperations = ["insert", "update", "delete"];
        if (operation && !validOperations.includes(operation)) {
            return false;
        }

        return true;
    },
};
