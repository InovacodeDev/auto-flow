import { EventEmitter } from "events";
import crypto from "crypto";
import { FastifyInstance } from "fastify";
import {
    IWorkflowEngine,
    WorkflowDefinition,
    ExecutionContext,
    ExecutionLog,
    ExecutionMetrics,
    NodeExecutor,
    TriggerHandler,
    EngineConfig,
    NodeExecutionResult,
    WorkflowError,
    TimeoutError,
    LogLevel,
} from "./types";
import { ManualTriggerHandler } from "./triggers/ManualTriggerHandler";
import { WebhookTriggerHandler } from "./triggers/WebhookTriggerHandler";
import { ScheduleTriggerHandler } from "./triggers/ScheduleTriggerHandler";
import { WorkflowQueue } from "../queue/WorkflowQueue";

/**
 * AutoFlow Workflow Engine - Fase 4
 * Core execution engine para automações empresariais
 */
export class WorkflowEngine extends EventEmitter implements IWorkflowEngine {
    private workflows = new Map<string, WorkflowDefinition>();
    private executions = new Map<string, ExecutionContext>();
    private nodeExecutors = new Map<string, NodeExecutor>();
    private triggerHandlers = new Map<string, TriggerHandler>();
    private executionQueue: Array<{ workflowId: string; triggerData: any; userId?: string }> = [];
    private isProcessing = false;
    private metrics: ExecutionMetrics;
    private fastify?: FastifyInstance;
    private workflowQueue?: WorkflowQueue;

    public config: EngineConfig = {
        maxConcurrentExecutions: 100,
        defaultTimeout: 300000, // 5 minutos
        maxLogsPerExecution: 1000,
        maxExecutionDataSize: 10 * 1024 * 1024, // 10MB
        nodeExecutionPoolSize: 10,
        cacheEnabled: true,
        cacheTTL: 3600000, // 1 hora
        metricsEnabled: true,
        detailedLogging: true,
        sandboxEnabled: true,
    };

    constructor(config?: Partial<EngineConfig>, fastify?: FastifyInstance, useRedisQueue: boolean = false) {
        super();

        if (config) {
            this.config = { ...this.config, ...config };
        }

        if (fastify) {
            this.fastify = fastify;
        }

        this.metrics = this.initializeMetrics();
        this.initializeTriggerHandlers();

        // Inicializar Redis Queue se solicitado
        if (useRedisQueue) {
            this.initializeRedisQueue();
        } else {
            this.startQueueProcessor();
        }

        this.log("info", "WorkflowEngine", "Engine initialized successfully");
    }

    /**
     * Inicializar Redis Queue System
     */
    private initializeRedisQueue(): void {
        try {
            const queueConfig = WorkflowQueue.getDefaultConfig();
            this.workflowQueue = new WorkflowQueue(queueConfig);
            this.workflowQueue.setWorkflowEngine(this);
            this.log("info", "WorkflowEngine", "Redis Queue initialized successfully");
        } catch (error) {
            this.log(
                "error",
                "WorkflowEngine",
                "Failed to initialize Redis Queue, falling back to memory queue:",
                error
            );
            this.startQueueProcessor();
        }
    }

    /**
     * Inicializar handlers de trigger
     */
    private initializeTriggerHandlers(): void {
        // Manual Trigger Handler
        const manualHandler = new ManualTriggerHandler();
        manualHandler.setExecuteCallback(this.executeWorkflow.bind(this));
        this.triggerHandlers.set("manual", manualHandler);

        // Webhook Trigger Handler
        if (this.fastify) {
            const webhookHandler = new WebhookTriggerHandler(this.fastify);
            webhookHandler.setExecuteCallback(this.executeWorkflow.bind(this));
            this.triggerHandlers.set("webhook", webhookHandler);
        }

        // Schedule Trigger Handler
        const scheduleHandler = new ScheduleTriggerHandler();
        scheduleHandler.setExecuteCallback(this.executeWorkflow.bind(this));
        this.triggerHandlers.set("schedule", scheduleHandler);

        this.log("info", "WorkflowEngine", "Trigger handlers initialized");
    }

    /**
     * Inicializar métricas do engine
     */
    private initializeMetrics(): ExecutionMetrics {
        return {
            totalExecutions: 0,
            successfulExecutions: 0,
            failedExecutions: 0,
            averageExecutionTime: 0,
            totalExecutionTime: 0,
            peakConcurrentExecutions: 0,
            currentConcurrentExecutions: 0,
            queueSize: 0,
            errorRate: 0,
            lastExecution: null,
            startTime: new Date(),
            uptime: 0,
            executionsPerHour: 0,
            nodeExecutionCounts: {},
            nodeAverageExecutionTimes: {},
            nodeErrorRates: {},
            memoryUsage: process.memoryUsage().heapUsed,
            cpuUsage: process.cpuUsage().user,
        };
    }

    /**
     * Registrar um workflow
     */
    async registerWorkflow(workflow: WorkflowDefinition): Promise<void> {
        try {
            const validation = await this.validateWorkflow(workflow);
            if (!validation.valid) {
                throw new WorkflowError(
                    `Workflow validation failed: ${validation.errors.join(", ")}`,
                    "VALIDATION_ERROR"
                );
            }

            this.workflows.set(workflow.id, workflow);

            // Registrar triggers
            for (const trigger of workflow.triggers) {
                if (trigger.enabled) {
                    await this.registerTrigger(workflow.id, trigger);
                }
            }

            this.log("info", "WorkflowEngine", `Workflow registered: ${workflow.name} (${workflow.id})`);
            this.emit("workflowRegistered", { workflowId: workflow.id, workflow });
        } catch (error) {
            this.log("error", "WorkflowEngine", `Failed to register workflow ${workflow.id}:`, error);
            throw error;
        }
    }

    /**
     * Cancelar registro de um workflow
     */
    async unregisterWorkflow(workflowId: string): Promise<void> {
        const workflow = this.workflows.get(workflowId);

        if (!workflow) {
            throw new WorkflowError(`Workflow not found: ${workflowId}`, "WORKFLOW_NOT_FOUND");
        }

        // Cancelar triggers
        for (const trigger of workflow.triggers) {
            await this.unregisterTrigger(workflowId, trigger);
        }

        // Cancelar execuções ativas
        for (const [executionId, context] of this.executions) {
            if (context.workflowId === workflowId && context.status === "running") {
                await this.cancelExecution(executionId);
            }
        }

        this.workflows.delete(workflowId);

        this.log("info", "WorkflowEngine", `Workflow unregistered: ${workflowId}`);
        this.emit("workflowUnregistered", { workflowId });
    }

    /**
     * Registrar um trigger
     */
    private async registerTrigger(workflowId: string, trigger: any): Promise<void> {
        const handler = this.triggerHandlers.get(trigger.type);

        if (!handler) {
            throw new WorkflowError(`Trigger handler not found: ${trigger.type}`, "TRIGGER_HANDLER_NOT_FOUND");
        }

        await handler.register(workflowId, trigger);
        this.log("info", "WorkflowEngine", `Trigger registered: ${trigger.type} for workflow ${workflowId}`);
    }

    /**
     * Cancelar registro de um trigger
     */
    private async unregisterTrigger(workflowId: string, trigger: any): Promise<void> {
        const handler = this.triggerHandlers.get(trigger.type);

        if (handler) {
            await handler.unregister(workflowId);
            this.log("info", "WorkflowEngine", `Trigger unregistered: ${trigger.type} for workflow ${workflowId}`);
        }
    }

    /**
     * Executar um workflow (chamado pelos trigger handlers)
     */
    async executeWorkflow(workflowId: string, triggerData: any, userId?: string): Promise<void> {
        // Se Redis Queue estiver disponível, usar ela
        if (this.workflowQueue) {
            const jobData: any = {
                workflowId,
                triggerData,
            };

            if (userId) {
                jobData.userId = userId;
            }

            await this.workflowQueue.addJob(jobData);
            this.log("info", "WorkflowEngine", `Workflow queued in Redis: ${workflowId}`);
            return;
        }

        // Fallback para queue em memória
        const queueItem: { workflowId: string; triggerData: any; userId?: string } = {
            workflowId,
            triggerData,
        };

        if (userId) {
            queueItem.userId = userId;
        }

        this.executionQueue.push(queueItem);
        this.metrics.queueSize = this.executionQueue.length;

        this.log("info", "WorkflowEngine", `Workflow queued for execution: ${workflowId}`);
        this.emit("workflowQueued", { workflowId, triggerData, userId });
    }

    /**
     * Executar um workflow manualmente
     */
    async executeManual(workflowId: string, triggerData: any = {}, userId?: string): Promise<string> {
        const handler = this.triggerHandlers.get("manual") as ManualTriggerHandler;

        if (!handler) {
            throw new WorkflowError("Manual trigger handler not available", "TRIGGER_HANDLER_NOT_FOUND");
        }

        return await handler.execute(workflowId, triggerData, userId);
    }

    /**
     * Processador da fila de execução
     */
    private async startQueueProcessor(): Promise<void> {
        if (this.isProcessing) return;

        this.isProcessing = true;

        while (this.isProcessing) {
            try {
                if (
                    this.executionQueue.length > 0 &&
                    this.metrics.currentConcurrentExecutions < this.config.maxConcurrentExecutions
                ) {
                    const item = this.executionQueue.shift();
                    if (item) {
                        this.processExecution(item).catch((error) => {
                            this.log("error", "WorkflowEngine", "Queue processing error:", error);
                        });
                    }
                }

                await this.sleep(100); // 100ms entre verificações
            } catch (error) {
                this.log("error", "WorkflowEngine", "Queue processor error:", error);
                await this.sleep(1000); // Aguardar mais em caso de erro
            }
        }
    }

    /**
     * Processar uma execução individual
     */
    private async processExecution(item: { workflowId: string; triggerData: any; userId?: string }): Promise<void> {
        const { workflowId, triggerData, userId } = item;
        const executionId = crypto.randomUUID();

        const workflow = this.workflows.get(workflowId);
        if (!workflow) {
            this.log("error", "WorkflowEngine", `Workflow not found during execution: ${workflowId}`);
            return;
        }

        // Criar contexto de execução
        const context: ExecutionContext = {
            id: executionId,
            workflowId,
            status: "running",
            startTime: new Date(),
            triggerData,
            data: {},
            logs: [],
            completedNodes: [],
            metrics: {
                nodesExecuted: 0,
                totalExecutionTime: 0,
                nodeExecutionTimes: {},
                memoryUsage: process.memoryUsage().heapUsed,
            },
        };

        // Adicionar userId se fornecido
        if (userId) {
            (context as any).userId = userId;
        }

        this.executions.set(executionId, context);
        this.metrics.currentConcurrentExecutions++;
        this.metrics.totalExecutions++;

        if (this.metrics.currentConcurrentExecutions > this.metrics.peakConcurrentExecutions) {
            this.metrics.peakConcurrentExecutions = this.metrics.currentConcurrentExecutions;
        }

        this.log("info", "WorkflowEngine", `Started execution: ${executionId} for workflow: ${workflow.name}`);
        this.emit("executionStarted", { executionId, context });

        try {
            await this.executeNodes(context, workflow);

            context.status = "completed";
            context.endTime = new Date();

            this.metrics.successfulExecutions++;
            this.log("info", "WorkflowEngine", `Execution completed: ${executionId}`);
            this.emit("executionCompleted", { executionId, context });
        } catch (error) {
            context.status = "failed";
            context.endTime = new Date();
            context.error = {
                name: "WorkflowError",
                message: error instanceof Error ? error.message : "Unknown error",
                code: error instanceof WorkflowError ? error.code : "EXECUTION_ERROR",
                nodeId: context.currentNodeId,
                retryable: true,
            };

            this.metrics.failedExecutions++;
            this.log("error", "WorkflowEngine", `Execution failed: ${executionId}`, error);
            this.emit("executionFailed", { executionId, context, error });
        } finally {
            this.metrics.currentConcurrentExecutions--;
            this.updateMetrics(context);

            // Cleanup execution após um tempo
            setTimeout(() => {
                this.executions.delete(executionId);
            }, 300000); // 5 minutos
        }
    }

    /**
     * Executar nodes do workflow
     */
    private async executeNodes(context: ExecutionContext, workflow: WorkflowDefinition): Promise<void> {
        // Encontrar node inicial (deve ter type 'start' ou ser o primeiro)
        let currentNode = workflow.nodes.find((n) => n.type === "start") || workflow.nodes[0];

        if (!currentNode) {
            throw new WorkflowError("No start node found in workflow", "NO_START_NODE");
        }

        while (currentNode) {
            context.currentNodeId = currentNode.id;

            const startTime = Date.now();
            this.log("info", "WorkflowEngine", `Executing node: ${currentNode.id} (${currentNode.type})`);

            try {
                const result = await this.executeNode(context, currentNode);
                const executionTime = Date.now() - startTime;

                context.metrics.nodeExecutionTimes[currentNode.id] = executionTime;
                context.metrics.nodesExecuted++;
                context.completedNodes.push(currentNode.id);

                this.log("info", "WorkflowEngine", `Node completed: ${currentNode.id} in ${executionTime}ms`);

                // Determinar próximo node
                currentNode = this.getNextNode(workflow, currentNode, result);
            } catch (error) {
                this.log("error", "WorkflowEngine", `Node execution failed: ${currentNode.id}`, error);
                throw error;
            }
        }
    }

    /**
     * Executar um node individual
     */
    private async executeNode(context: ExecutionContext, node: any): Promise<NodeExecutionResult> {
        const executor = this.nodeExecutors.get(node.type);

        if (!executor) {
            throw new WorkflowError(`Node executor not found: ${node.type}`, "NODE_EXECUTOR_NOT_FOUND");
        }

        // Timeout
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => {
                reject(new TimeoutError(`Node execution timeout: ${node.id}`, this.config.defaultTimeout));
            }, this.config.defaultTimeout);
        });

        try {
            const result = await Promise.race([
                executor.execute(node.config || {}, context.data, context),
                timeoutPromise,
            ]);

            return result;
        } catch (error) {
            if (error instanceof TimeoutError) {
                this.log("error", "WorkflowEngine", `Node timeout: ${node.id}`);
            }
            throw error;
        }
    }

    /**
     * Determinar próximo node baseado no resultado
     */
    private getNextNode(workflow: WorkflowDefinition, currentNode: any, result: NodeExecutionResult): any | null {
        // Se o node indica o próximo explicitamente
        if (result.nextNodeId) {
            return workflow.nodes.find((n) => n.id === result.nextNodeId) || null;
        }

        // Seguir conexões baseadas no resultado
        if (currentNode.connections) {
            const connection = currentNode.connections.find((c: any) => {
                if (!c.condition) return true; // Conexão padrão

                // Avaliar condição (implementação simplificada)
                return this.evaluateCondition(c.condition, result.data);
            });

            if (connection) {
                return workflow.nodes.find((n) => n.id === connection.targetNodeId) || null;
            }
        }

        return null; // Fim do workflow
    }

    /**
     * Avaliar condição simples
     */
    private evaluateCondition(condition: any, data: any): boolean {
        // Implementação básica - expandir conforme necessário
        try {
            if (condition.type === "equals") {
                return data[condition.field] === condition.value;
            }
            if (condition.type === "exists") {
                return data[condition.field] !== undefined;
            }
            // Adicionar mais tipos de condição conforme necessário
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Cancelar uma execução
     */
    async cancelExecution(executionId: string): Promise<void> {
        const context = this.executions.get(executionId);

        if (!context) {
            throw new WorkflowError(`Execution not found: ${executionId}`, "EXECUTION_NOT_FOUND");
        }

        if (context.status !== "running") {
            throw new WorkflowError(
                `Cannot cancel execution with status: ${context.status}`,
                "INVALID_EXECUTION_STATUS"
            );
        }

        context.status = "cancelled";
        context.endTime = new Date();

        this.log("info", "WorkflowEngine", `Execution cancelled: ${executionId}`);
        this.emit("executionCancelled", { executionId, context });
    }

    /**
     * Obter status de uma execução
     */
    getExecutionStatus(executionId: string): ExecutionContext | null {
        return this.executions.get(executionId) || null;
    }

    /**
     * Listar execuções ativas
     */
    getActiveExecutions(): ExecutionContext[] {
        return Array.from(this.executions.values()).filter((ctx) => ctx.status === "running");
    }

    /**
     * Obter métricas do engine
     */
    getMetrics(): ExecutionMetrics {
        this.metrics.uptime = Date.now() - this.metrics.startTime.getTime();
        this.metrics.queueSize = this.executionQueue.length;
        this.metrics.errorRate =
            this.metrics.totalExecutions > 0 ? this.metrics.failedExecutions / this.metrics.totalExecutions : 0;

        return { ...this.metrics };
    }

    /**
     * Atualizar métricas após execução
     */
    private updateMetrics(context: ExecutionContext): void {
        if (context.startTime && context.endTime) {
            const executionTime = context.endTime.getTime() - context.startTime.getTime();
            this.metrics.totalExecutionTime += executionTime;
            this.metrics.averageExecutionTime = this.metrics.totalExecutionTime / this.metrics.totalExecutions;
            this.metrics.lastExecution = context.endTime;
        }
    }

    /**
     * Registrar node executor
     */
    registerNodeExecutor(nodeType: string, executor: NodeExecutor): void {
        this.nodeExecutors.set(nodeType, executor);
        this.log("info", "WorkflowEngine", `Node executor registered: ${nodeType}`);
    }

    /**
     * Validar workflow antes do registro
     */
    async validateWorkflow(workflow: WorkflowDefinition): Promise<{ valid: boolean; errors: string[] }> {
        const errors: string[] = [];

        try {
            if (!workflow.id) {
                errors.push("Workflow ID is required");
            }

            if (!workflow.name) {
                errors.push("Workflow name is required");
            }

            if (!workflow.nodes || workflow.nodes.length === 0) {
                errors.push("Workflow must have at least one node");
            }

            if (!workflow.triggers || workflow.triggers.length === 0) {
                errors.push("Workflow must have at least one trigger");
            }

            // Validar nodes únicos
            if (workflow.nodes) {
                const nodeIds = workflow.nodes.map((n) => n.id);
                const uniqueNodeIds = new Set(nodeIds);

                if (nodeIds.length !== uniqueNodeIds.size) {
                    errors.push("Workflow nodes must have unique IDs");
                }
            }
        } catch (error) {
            errors.push(error instanceof Error ? error.message : "Validation error");
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    }

    /**
     * Logging utility
     */
    private log(level: LogLevel, component: string, message: string, data?: any): void {
        if (!this.config.detailedLogging && level === "debug") {
            return;
        }

        const logEntry: ExecutionLog = {
            timestamp: new Date(),
            level,
            component,
            message,
            data,
        };

        console.log(`[${level.toUpperCase()}] ${component}: ${message}`, data || "");
        this.emit("log", logEntry);
    }

    /**
     * Sleep utility
     */
    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Parar o engine
     */
    async stop(): Promise<void> {
        this.log("info", "WorkflowEngine", "Stopping engine...");

        this.isProcessing = false;

        // Cleanup trigger handlers
        for (const handler of this.triggerHandlers.values()) {
            if ("cleanup" in handler && typeof handler.cleanup === "function") {
                await handler.cleanup();
            }
        }

        // Aguardar execuções ativas terminarem
        while (Array.from(this.executions.values()).some((ctx) => ctx.status === "running")) {
            await this.sleep(100);
        }

        this.log("info", "WorkflowEngine", "Engine stopped");
    }

    // Métodos faltantes da interface IWorkflowEngine
    async updateWorkflow(workflow: WorkflowDefinition): Promise<void> {
        if (!this.workflows.has(workflow.id)) {
            throw new Error(`Workflow ${workflow.id} not found`);
        }

        this.workflows.set(workflow.id, workflow);
        this.log("info", "WorkflowEngine", `Workflow updated: ${workflow.id}`);
    }

    async getExecution(executionId: string): Promise<ExecutionContext | null> {
        return this.executions.get(executionId) || null;
    }

    async getExecutionLogs(executionId: string): Promise<ExecutionLog[]> {
        const execution = this.executions.get(executionId);
        return execution ? execution.logs : [];
    }

    getAvailableNodes(): NodeExecutor[] {
        return Array.from(this.nodeExecutors.values());
    }

    getSystemHealth(): { status: string; metrics: ExecutionMetrics } {
        return {
            status: "healthy",
            metrics: this.getMetrics(),
        };
    }

    registerTriggerHandler(handler: TriggerHandler): void {
        this.triggerHandlers.set(handler.type, handler);
        this.log("info", "WorkflowEngine", `Trigger handler registered: ${handler.type}`);
    }

    async start(): Promise<void> {
        this.log("info", "WorkflowEngine", "Engine starting...");
        // Inicializar o processamento da fila
        this.isProcessing = false;
        this.log("info", "WorkflowEngine", "Engine started");
    }
}
