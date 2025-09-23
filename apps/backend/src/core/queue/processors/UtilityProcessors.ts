import { NodeProcessor, NodeJobData, NodeExecutionResult, WorkflowLog } from "../types";

/**
 * Processador para delay
 */
export const DelayProcessor: NodeProcessor = {
    nodeType: "delay",

    process: async (data: NodeJobData): Promise<NodeExecutionResult> => {
        const { config, inputs, context } = data;

        try {
            const duration = config.duration || 5000;
            const unit = config.unit || "milliseconds";

            // Converter para milissegundos
            let delayMs = duration;
            if (unit === "seconds") {
                delayMs = duration * 1000;
            } else if (unit === "minutes") {
                delayMs = duration * 60 * 1000;
            } else if (unit === "hours") {
                delayMs = duration * 60 * 60 * 1000;
            }

            // Aguardar
            await new Promise((resolve) => setTimeout(resolve, delayMs));

            const output = {
                duration,
                unit,
                delayMs,
                timestamp: new Date().toISOString(),
            };

            const log: WorkflowLog = {
                id: `${data.executionId}-${Date.now()}`,
                timestamp: new Date(),
                level: "info",
                message: `Delay completed: ${duration}${unit}`,
                nodeId: data.nodeId,
                data: { duration, unit, delayMs },
            };
            context.logs.push(log);

            return {
                success: true,
                data: output,
                logs: [log],
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);

            const log: WorkflowLog = {
                id: `${data.executionId}-${Date.now()}`,
                timestamp: new Date(),
                level: "error",
                message: `Delay failed: ${errorMessage}`,
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
        const duration = config.duration;
        const unit = config.unit;

        if (duration && (isNaN(duration) || duration < 0)) {
            return false;
        }

        const validUnits = ["milliseconds", "seconds", "minutes", "hours"];
        if (unit && !validUnits.includes(unit)) {
            return false;
        }

        return true;
    },
};

/**
 * Processador para transformação de dados
 */
export const DataTransformProcessor: NodeProcessor = {
    nodeType: "data_transform_util",

    process: async (data: NodeJobData): Promise<NodeExecutionResult> => {
        const { config, inputs, context } = data;

        try {
            const operation = config.operation || "map";
            const mapping = config.mapping || inputs.mapping || {};
            const inputData = inputs.input || inputs;

            let transformedData: any;

            switch (operation) {
                case "map":
                    transformedData = mapData(inputData, mapping);
                    break;
                case "filter":
                    transformedData = filterData(inputData, mapping);
                    break;
                case "reduce":
                    transformedData = reduceData(inputData, mapping);
                    break;
                case "sort":
                    transformedData = sortData(inputData, mapping);
                    break;
                default:
                    transformedData = inputData;
            }

            const output = {
                operation,
                originalData: inputData,
                transformedData,
                mapping,
                timestamp: new Date().toISOString(),
            };

            const log: WorkflowLog = {
                id: `${data.executionId}-${Date.now()}`,
                timestamp: new Date(),
                level: "info",
                message: `Data transformation completed: ${operation}`,
                nodeId: data.nodeId,
                data: { operation, mapping },
            };
            context.logs.push(log);

            return {
                success: true,
                data: output,
                logs: [log],
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);

            const log: WorkflowLog = {
                id: `${data.executionId}-${Date.now()}`,
                timestamp: new Date(),
                level: "error",
                message: `Data transformation failed: ${errorMessage}`,
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
        const operation = config.operation;

        const validOperations = ["map", "filter", "reduce", "sort", "group"];
        if (operation && !validOperations.includes(operation)) {
            return false;
        }

        return true;
    },
};

/**
 * Processador para clonagem
 */
export const CloneProcessor: NodeProcessor = {
    nodeType: "clone",

    process: async (data: NodeJobData): Promise<NodeExecutionResult> => {
        const { config, inputs, context } = data;

        try {
            const copies = config.copies || 1;
            const inputData = inputs.input || inputs;

            const clonedData = Array(copies)
                .fill(null)
                .map((_, index) => ({
                    ...inputData,
                    cloneIndex: index + 1,
                    clonedAt: new Date().toISOString(),
                }));

            const output = {
                copies,
                originalData: inputData,
                clonedData,
                timestamp: new Date().toISOString(),
            };

            const log: WorkflowLog = {
                id: `${data.executionId}-${Date.now()}`,
                timestamp: new Date(),
                level: "info",
                message: `Data cloned ${copies} times`,
                nodeId: data.nodeId,
                data: { copies },
            };
            context.logs.push(log);

            return {
                success: true,
                data: output,
                logs: [log],
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);

            const log: WorkflowLog = {
                id: `${data.executionId}-${Date.now()}`,
                timestamp: new Date(),
                level: "error",
                message: `Cloning failed: ${errorMessage}`,
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
        const copies = config.copies;

        if (copies && (isNaN(copies) || copies < 1 || copies > 10)) {
            return false;
        }

        return true;
    },
};

/**
 * Processador para execução de código
 */
export const CodeExecutionProcessor: NodeProcessor = {
    nodeType: "code_execution",

    process: async (data: NodeJobData): Promise<NodeExecutionResult> => {
        const { config, inputs, context } = data;

        try {
            const code = config.code || inputs.code;
            const language = config.language || "javascript";

            if (!code) {
                throw new Error("Code is required for execution");
            }

            let result: any;

            if (language === "javascript") {
                result = await executeJavaScriptCode(code, inputs);
            } else {
                throw new Error(`Unsupported language: ${language}`);
            }

            const output = {
                language,
                code,
                result,
                timestamp: new Date().toISOString(),
            };

            const log: WorkflowLog = {
                id: `${data.executionId}-${Date.now()}`,
                timestamp: new Date(),
                level: "info",
                message: `Code executed successfully (${language})`,
                nodeId: data.nodeId,
                data: { language, codeLength: code.length },
            };
            context.logs.push(log);

            return {
                success: true,
                data: output,
                logs: [log],
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);

            const log: WorkflowLog = {
                id: `${data.executionId}-${Date.now()}`,
                timestamp: new Date(),
                level: "error",
                message: `Code execution failed: ${errorMessage}`,
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
        const code = config.code;
        const language = config.language;

        if (!code || typeof code !== "string") {
            return false;
        }

        const validLanguages = ["javascript", "python", "sql"];
        if (language && !validLanguages.includes(language)) {
            return false;
        }

        return true;
    },
};

/**
 * Processador para logger
 */
export const LoggerProcessor: NodeProcessor = {
    nodeType: "logger",

    process: async (data: NodeJobData): Promise<NodeExecutionResult> => {
        const { config, inputs, context } = data;

        try {
            const level = config.level || "info";
            const message = inputs.message || config.message || "Log message";
            const inputData = inputs.input || inputs;

            const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const output = {
                logId,
                level,
                message,
                data: inputData,
                timestamp: new Date().toISOString(),
            };

            const log: WorkflowLog = {
                id: `${data.executionId}-${Date.now()}`,
                timestamp: new Date(),
                level: level as any,
                message: `Logger: ${message}`,
                nodeId: data.nodeId,
                data: { level, message, logId },
            };
            context.logs.push(log);

            return {
                success: true,
                data: output,
                logs: [log],
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);

            const log: WorkflowLog = {
                id: `${data.executionId}-${Date.now()}`,
                timestamp: new Date(),
                level: "error",
                message: `Logger failed: ${errorMessage}`,
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
        const level = config.level;

        const validLevels = ["debug", "info", "warn", "error"];
        if (level && !validLevels.includes(level)) {
            return false;
        }

        return true;
    },
};

/**
 * Executa código JavaScript
 */
async function executeJavaScriptCode(code: string, inputs: any): Promise<any> {
    try {
        // Criar contexto seguro
        const context = {
            input: inputs,
            ...inputs,
            console: {
                log: (...args: any[]) => console.log("[Code Execution]", ...args),
                error: (...args: any[]) => console.error("[Code Execution]", ...args),
            },
        };

        // Executar código
        const func = new Function(...Object.keys(context), `return (${code})`);
        return func(...Object.values(context));
    } catch (error) {
        throw new Error(`Code execution error: ${error}`);
    }
}

/**
 * Mapeia dados
 */
function mapData(data: any, mapping: any): any {
    if (Array.isArray(data)) {
        return data.map((item) => mapObject(item, mapping));
    }
    return mapObject(data, mapping);
}

/**
 * Mapeia objeto
 */
function mapObject(obj: any, mapping: any): any {
    const result: any = {};

    for (const [newKey, oldKey] of Object.entries(mapping)) {
        if (typeof oldKey === "string") {
            result[newKey] = getNestedValue(obj, oldKey);
        } else if (typeof oldKey === "function") {
            result[newKey] = oldKey(obj);
        }
    }

    return result;
}

/**
 * Filtra dados
 */
function filterData(data: any, mapping: any): any {
    if (Array.isArray(data)) {
        return data.filter((item) => evaluateFilter(item, mapping));
    }
    return data;
}

/**
 * Avalia filtro
 */
function evaluateFilter(item: any, mapping: any): boolean {
    for (const [key, value] of Object.entries(mapping)) {
        if (getNestedValue(item, key) !== value) {
            return false;
        }
    }
    return true;
}

/**
 * Reduz dados
 */
function reduceData(data: any, mapping: any): any {
    if (!Array.isArray(data)) {
        return data;
    }

    const initialValue = mapping.initialValue || 0;
    const reducer = mapping.reducer || ((acc: any, item: any) => acc + item);

    return data.reduce(reducer, initialValue);
}

/**
 * Ordena dados
 */
function sortData(data: any, mapping: any): any {
    if (!Array.isArray(data)) {
        return data;
    }

    const sortKey = mapping.sortKey || "id";
    const order = mapping.order || "asc";

    return data.sort((a: any, b: any) => {
        const aVal = getNestedValue(a, sortKey);
        const bVal = getNestedValue(b, sortKey);

        if (order === "desc") {
            return bVal > aVal ? 1 : -1;
        }
        return aVal > bVal ? 1 : -1;
    });
}

/**
 * Obtém valor aninhado
 */
function getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((current, key) => current?.[key], obj);
}
