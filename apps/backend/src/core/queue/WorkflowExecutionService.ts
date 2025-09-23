import { ExecutionEngine } from "./ExecutionEngine";
import { ExecutionEngineConfig, WorkflowExecutionInput, WorkflowExecutionOutput } from "./types";
import { testRedisConnection } from "./redis";

// Importar todos os processadores
import {
    ManualTriggerProcessor,
    WebhookTriggerProcessor,
    ScheduleTriggerProcessor,
    DatabaseTriggerProcessor,
} from "./processors/TriggerProcessors";

import {
    HttpRequestProcessor,
    EmailProcessor,
    DatabaseProcessor,
    WhatsAppProcessor,
    PaymentProcessor,
} from "./processors/ActionProcessors";

import {
    ConditionProcessor,
    ValidationProcessor,
    ErrorHandlerProcessor,
    RetryProcessor,
} from "./processors/ConditionProcessors";

import {
    DelayProcessor,
    DataTransformProcessor,
    CloneProcessor,
    CodeExecutionProcessor,
    LoggerProcessor,
} from "./processors/UtilityProcessors";

/**
 * Serviço de execução de workflows
 */
export class WorkflowExecutionService {
    private executionEngine: ExecutionEngine;
    private isInitialized = false;

    constructor() {
        this.initializeExecutionEngine();
    }

    /**
     * Inicializa o motor de execução
     */
    private async initializeExecutionEngine(): Promise<void> {
        try {
            // Testar conexão com Redis
            const redisConnected = await testRedisConnection();
            if (!redisConnected) {
                throw new Error("Failed to connect to Redis");
            }

            // Configuração do motor de execução
            const config: ExecutionEngineConfig = {
                redis: {
                    host: process.env.REDIS_HOST || "localhost",
                    port: parseInt(process.env.REDIS_PORT || "6379"),
                    password: process.env.REDIS_PASSWORD,
                    db: parseInt(process.env.REDIS_DB || "0"),
                },
                queues: {
                    workflow: {
                        name: "workflow-execution",
                        concurrency: parseInt(process.env.WORKFLOW_CONCURRENCY || "5"),
                        removeOnComplete: 100,
                        removeOnFail: 50,
                        defaultJobOptions: {
                            removeOnComplete: 100,
                            removeOnFail: 50,
                            attempts: 3,
                            backoff: {
                                type: "exponential",
                                delay: 2000,
                            },
                        },
                    },
                    node: {
                        name: "node-execution",
                        concurrency: parseInt(process.env.NODE_CONCURRENCY || "10"),
                        removeOnComplete: 200,
                        removeOnFail: 100,
                        defaultJobOptions: {
                            removeOnComplete: 200,
                            removeOnFail: 100,
                            attempts: 2,
                            backoff: {
                                type: "exponential",
                                delay: 1000,
                            },
                        },
                    },
                },
                concurrency: {
                    workflow: parseInt(process.env.WORKFLOW_CONCURRENCY || "5"),
                    node: parseInt(process.env.NODE_CONCURRENCY || "10"),
                },
                retry: {
                    maxAttempts: 3,
                    delay: 2000,
                },
                monitoring: {
                    enabled: process.env.MONITORING_ENABLED === "true",
                    port: parseInt(process.env.MONITORING_PORT || "3001"),
                },
            };

            // Criar motor de execução
            this.executionEngine = new ExecutionEngine(config);

            // Registrar processadores de triggers
            this.executionEngine.registerNodeProcessor(ManualTriggerProcessor);
            this.executionEngine.registerNodeProcessor(WebhookTriggerProcessor);
            this.executionEngine.registerNodeProcessor(ScheduleTriggerProcessor);
            this.executionEngine.registerNodeProcessor(DatabaseTriggerProcessor);

            // Registrar processadores de ações
            this.executionEngine.registerNodeProcessor(HttpRequestProcessor);
            this.executionEngine.registerNodeProcessor(EmailProcessor);
            this.executionEngine.registerNodeProcessor(DatabaseProcessor);
            this.executionEngine.registerNodeProcessor(WhatsAppProcessor);
            this.executionEngine.registerNodeProcessor(PaymentProcessor);

            // Registrar processadores de condições
            this.executionEngine.registerNodeProcessor(ConditionProcessor);
            this.executionEngine.registerNodeProcessor(ValidationProcessor);
            this.executionEngine.registerNodeProcessor(ErrorHandlerProcessor);
            this.executionEngine.registerNodeProcessor(RetryProcessor);

            // Registrar processadores de utilitários
            this.executionEngine.registerNodeProcessor(DelayProcessor);
            this.executionEngine.registerNodeProcessor(DataTransformProcessor);
            this.executionEngine.registerNodeProcessor(CloneProcessor);
            this.executionEngine.registerNodeProcessor(CodeExecutionProcessor);
            this.executionEngine.registerNodeProcessor(LoggerProcessor);

            this.isInitialized = true;
            console.log("✅ Workflow Execution Service initialized successfully");
        } catch (error) {
            console.error("❌ Failed to initialize Workflow Execution Service:", error);
            throw error;
        }
    }

    /**
     * Executa um workflow
     */
    public async executeWorkflow(input: WorkflowExecutionInput): Promise<string> {
        if (!this.isInitialized) {
            throw new Error("Workflow Execution Service not initialized");
        }

        try {
            const executionId = await this.executionEngine.executeWorkflow(input);
            console.log(`🚀 Workflow execution started: ${executionId}`);
            return executionId;
        } catch (error) {
            console.error("❌ Failed to execute workflow:", error);
            throw error;
        }
    }

    /**
     * Obtém o status de uma execução
     */
    public async getExecutionStatus(executionId: string): Promise<string | null> {
        if (!this.isInitialized) {
            throw new Error("Workflow Execution Service not initialized");
        }

        try {
            return await this.executionEngine.getExecutionStatus(executionId);
        } catch (error) {
            console.error("❌ Failed to get execution status:", error);
            throw error;
        }
    }

    /**
     * Cancela uma execução
     */
    public async cancelExecution(executionId: string): Promise<boolean> {
        if (!this.isInitialized) {
            throw new Error("Workflow Execution Service not initialized");
        }

        try {
            return await this.executionEngine.cancelExecution(executionId);
        } catch (error) {
            console.error("❌ Failed to cancel execution:", error);
            throw error;
        }
    }

    /**
     * Obtém logs de uma execução
     */
    public getExecutionLogs(executionId: string): any[] {
        if (!this.isInitialized) {
            throw new Error("Workflow Execution Service not initialized");
        }

        try {
            return this.executionEngine.getExecutionLogs(executionId);
        } catch (error) {
            console.error("❌ Failed to get execution logs:", error);
            throw error;
        }
    }

    /**
     * Obtém estatísticas das filas
     */
    public async getQueueStats(): Promise<any> {
        if (!this.isInitialized) {
            throw new Error("Workflow Execution Service not initialized");
        }

        try {
            return await this.executionEngine.getQueueStats();
        } catch (error) {
            console.error("❌ Failed to get queue stats:", error);
            throw error;
        }
    }

    /**
     * Limpa as filas
     */
    public async clearQueues(): Promise<void> {
        if (!this.isInitialized) {
            throw new Error("Workflow Execution Service not initialized");
        }

        try {
            await this.executionEngine.clearQueues();
            console.log("🧹 Queues cleared successfully");
        } catch (error) {
            console.error("❌ Failed to clear queues:", error);
            throw error;
        }
    }

    /**
     * Para o serviço
     */
    public async stop(): Promise<void> {
        if (this.executionEngine) {
            try {
                await this.executionEngine.stop();
                console.log("🛑 Workflow Execution Service stopped");
            } catch (error) {
                console.error("❌ Error stopping Workflow Execution Service:", error);
            }
        }
    }

    /**
     * Verifica se o serviço está inicializado
     */
    public isReady(): boolean {
        return this.isInitialized;
    }

    /**
     * Obtém informações do serviço
     */
    public getServiceInfo(): any {
        return {
            initialized: this.isInitialized,
            timestamp: new Date().toISOString(),
            version: "1.0.0",
        };
    }
}

// Instância singleton do serviço
export const workflowExecutionService = new WorkflowExecutionService();
