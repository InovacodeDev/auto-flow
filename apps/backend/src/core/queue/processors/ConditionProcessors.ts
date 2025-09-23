import { NodeProcessor, NodeJobData, NodeExecutionResult, WorkflowLog } from "../types";

/**
 * Processador para condição IF
 */
export const ConditionProcessor: NodeProcessor = {
    nodeType: "condition_if",

    process: async (data: NodeJobData): Promise<NodeExecutionResult> => {
        const { config, inputs, context } = data;

        try {
            const condition = config.condition || "true";
            const operator = config.operator || "javascript";

            let result: boolean;

            if (operator === "javascript") {
                // Avaliar condição JavaScript
                result = evaluateJavaScriptCondition(condition, inputs);
            } else {
                // Avaliar condição simples
                result = evaluateSimpleCondition(condition, inputs);
            }

            const output = {
                condition,
                result,
                timestamp: new Date().toISOString(),
                inputs,
            };

            const log: WorkflowLog = {
                id: `${data.executionId}-${Date.now()}`,
                timestamp: new Date(),
                level: "info",
                message: `Condition evaluated: ${condition} = ${result}`,
                nodeId: data.nodeId,
                data: { condition, result },
            };
            context.logs.push(log);

            return {
                success: true,
                data: output,
                logs: [log],
                nextNodes: result ? ["true"] : ["false"],
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);

            const log: WorkflowLog = {
                id: `${data.executionId}-${Date.now()}`,
                timestamp: new Date(),
                level: "error",
                message: `Condition evaluation failed: ${errorMessage}`,
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
        const condition = config.condition;
        const operator = config.operator;

        if (!condition || typeof condition !== "string") {
            return false;
        }

        const validOperators = ["javascript", "equals", "greater", "less", "contains"];
        if (operator && !validOperators.includes(operator)) {
            return false;
        }

        return true;
    },
};

/**
 * Processador para validação
 */
export const ValidationProcessor: NodeProcessor = {
    nodeType: "validation",

    process: async (data: NodeJobData): Promise<NodeExecutionResult> => {
        const { config, inputs, context } = data;

        try {
            const rules = config.rules || [];
            const dataToValidate = inputs.input || inputs;

            const validationResult = validateData(dataToValidate, rules);

            const output = {
                valid: validationResult.valid,
                errors: validationResult.errors,
                data: dataToValidate,
                timestamp: new Date().toISOString(),
            };

            const log: WorkflowLog = {
                id: `${data.executionId}-${Date.now()}`,
                timestamp: new Date(),
                level: validationResult.valid ? "info" : "warn",
                message: `Validation ${validationResult.valid ? "passed" : "failed"}`,
                nodeId: data.nodeId,
                data: { valid: validationResult.valid, errors: validationResult.errors },
            };
            context.logs.push(log);

            return {
                success: true,
                data: output,
                logs: [log],
                nextNodes: validationResult.valid ? ["valid"] : ["invalid"],
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);

            const log: WorkflowLog = {
                id: `${data.executionId}-${Date.now()}`,
                timestamp: new Date(),
                level: "error",
                message: `Validation failed: ${errorMessage}`,
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
        const rules = config.rules;

        if (!Array.isArray(rules)) {
            return false;
        }

        return true;
    },
};

/**
 * Processador para tratamento de erro
 */
export const ErrorHandlerProcessor: NodeProcessor = {
    nodeType: "error_handler",

    process: async (data: NodeJobData): Promise<NodeExecutionResult> => {
        const { config, inputs, context } = data;

        try {
            const error = inputs.error;
            const type = config.type || "catch";
            const fallbackAction = config.fallbackAction || "log";

            if (!error) {
                // Sem erro, continuar normalmente
                const output = {
                    handled: false,
                    type,
                    timestamp: new Date().toISOString(),
                };

                const log: WorkflowLog = {
                    id: `${data.executionId}-${Date.now()}`,
                    timestamp: new Date(),
                    level: "info",
                    message: "No error to handle",
                    nodeId: data.nodeId,
                };
                context.logs.push(log);

                return {
                    success: true,
                    data: output,
                    logs: [log],
                    nextNodes: ["success"],
                };
            }

            // Processar erro
            const handledError = {
                error: error,
                type,
                fallbackAction,
                handled: true,
                timestamp: new Date().toISOString(),
            };

            const log: WorkflowLog = {
                id: `${data.executionId}-${Date.now()}`,
                timestamp: new Date(),
                level: "warn",
                message: `Error handled: ${error}`,
                nodeId: data.nodeId,
                data: { error, type },
            };
            context.logs.push(log);

            return {
                success: true,
                data: handledError,
                logs: [log],
                nextNodes: ["handled"],
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);

            const log: WorkflowLog = {
                id: `${data.executionId}-${Date.now()}`,
                timestamp: new Date(),
                level: "error",
                message: `Error handler failed: ${errorMessage}`,
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
        const fallbackAction = config.fallbackAction;

        const validTypes = ["catch", "retry", "fallback"];
        if (type && !validTypes.includes(type)) {
            return false;
        }

        const validActions = ["log", "notify", "fallback", "retry"];
        if (fallbackAction && !validActions.includes(fallbackAction)) {
            return false;
        }

        return true;
    },
};

/**
 * Processador para retry
 */
export const RetryProcessor: NodeProcessor = {
    nodeType: "retry",

    process: async (data: NodeJobData): Promise<NodeExecutionResult> => {
        const { config, inputs, context } = data;

        try {
            const attempts = config.attempts || 3;
            const delay = config.delay || 1000;
            const condition = config.condition;

            // Simular lógica de retry
            const shouldRetry = condition ? evaluateJavaScriptCondition(condition, inputs) : true;

            const output = {
                attempts,
                delay,
                shouldRetry,
                timestamp: new Date().toISOString(),
            };

            const log: WorkflowLog = {
                id: `${data.executionId}-${Date.now()}`,
                timestamp: new Date(),
                level: "info",
                message: `Retry logic evaluated: ${shouldRetry ? "will retry" : "will not retry"}`,
                nodeId: data.nodeId,
                data: { attempts, delay, shouldRetry },
            };
            context.logs.push(log);

            return {
                success: true,
                data: output,
                logs: [log],
                nextNodes: shouldRetry ? ["retry"] : ["failed"],
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);

            const log: WorkflowLog = {
                id: `${data.executionId}-${Date.now()}`,
                timestamp: new Date(),
                level: "error",
                message: `Retry logic failed: ${errorMessage}`,
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
        const attempts = config.attempts;
        const delay = config.delay;

        if (attempts && (isNaN(attempts) || attempts < 1 || attempts > 10)) {
            return false;
        }

        if (delay && (isNaN(delay) || delay < 0)) {
            return false;
        }

        return true;
    },
};

/**
 * Avalia condição JavaScript
 */
function evaluateJavaScriptCondition(condition: string, inputs: any): boolean {
    try {
        // Criar contexto seguro para avaliação
        const context = {
            input: inputs,
            ...inputs,
        };

        // Substituir variáveis na condição
        let evaluatedCondition = condition;
        for (const [key, value] of Object.entries(context)) {
            evaluatedCondition = evaluatedCondition.replace(
                new RegExp(`\\b${key}\\b`, "g"),
                JSON.stringify(value)
            );
        }

        // Avaliar condição
        return eval(evaluatedCondition);
    } catch (error) {
        console.error("Error evaluating JavaScript condition:", error);
        return false;
    }
}

/**
 * Avalia condição simples
 */
function evaluateSimpleCondition(condition: string, inputs: any): boolean {
    // Implementar lógica para condições simples
    // Por enquanto, retornar true
    return true;
}

/**
 * Valida dados com regras
 */
function validateData(data: any, rules: any[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const rule of rules) {
        if (rule.type === "required" && !data[rule.field]) {
            errors.push(`Field ${rule.field} is required`);
        }

        if (rule.type === "email" && data[rule.field] && !isValidEmail(data[rule.field])) {
            errors.push(`Field ${rule.field} must be a valid email`);
        }

        if (rule.type === "minLength" && data[rule.field] && data[rule.field].length < rule.value) {
            errors.push(`Field ${rule.field} must be at least ${rule.value} characters`);
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Valida email
 */
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
