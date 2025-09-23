import { Queue, Worker, Job, QueueEvents } from "bullmq";
import { EventEmitter } from "events";
import { redis, createRedisConnection } from "./redis";
import {
    WorkflowExecutionInput,
    WorkflowExecutionOutput,
    WorkflowExecutionContext,
    WorkflowJobData,
    NodeJobData,
    NodeExecutionResult,
    NodeProcessor,
    WorkflowTrigger,
    ExecutionEngineConfig,
    WorkflowExecutionEvents,
    WorkflowLog,
    NodeExecutionStatus,
    WorkflowExecutionStatus,
} from "./types";

/**
 * Motor de execução de workflows com BullMQ
 */
export class ExecutionEngine extends EventEmitter {
    private workflowQueue: Queue<WorkflowJobData>;
    private nodeQueue: Queue<NodeJobData>;
    private workflowWorker: Worker<WorkflowJobData>;
    private nodeWorker: Worker<NodeJobData>;
    private queueEvents: QueueEvents;
    private nodeProcessors: Map<string, NodeProcessor> = new Map();
    private triggers: Map<string, WorkflowTrigger> = new Map();
    private executions: Map<string, WorkflowExecutionContext> = new Map();
    private config: ExecutionEngineConfig;

    constructor(config: ExecutionEngineConfig) {
        super();
        this.config = config;
        this.initializeQueues();
        this.initializeWorkers();
        this.setupEventHandlers();
    }

    /**
     * Inicializa as filas
     */
    private initializeQueues(): void {
        this.workflowQueue = new Queue<WorkflowJobData>("workflow-execution", {
            connection: redis,
            defaultJobOptions: this.config.queues.workflow.defaultJobOptions,
        });

        this.nodeQueue = new Queue<NodeJobData>("node-execution", {
            connection: redis,
            defaultJobOptions: this.config.queues.node.defaultJobOptions,
        });

        this.queueEvents = new QueueEvents("workflow-execution", {
            connection: redis,
        });
    }

    /**
     * Inicializa os workers
     */
    private initializeWorkers(): void {
        this.workflowWorker = new Worker<WorkflowJobData>(
            "workflow-execution",
            this.processWorkflow.bind(this),
            {
                connection: createRedisConnection(),
                concurrency: this.config.concurrency.workflow,
            }
        );

        this.nodeWorker = new Worker<NodeJobData>("node-execution", this.processNode.bind(this), {
            connection: createRedisConnection(),
            concurrency: this.config.concurrency.node,
        });
    }

    /**
     * Configura os event handlers
     */
    private setupEventHandlers(): void {
        this.workflowWorker.on("completed", (job) => {
            console.log(`✅ Workflow execution completed: ${job.id}`);
        });

        this.workflowWorker.on("failed", (job, err) => {
            console.error(`❌ Workflow execution failed: ${job?.id}`, err);
        });

        this.nodeWorker.on("completed", (job) => {
            console.log(`✅ Node execution completed: ${job.id}`);
        });

        this.nodeWorker.on("failed", (job, err) => {
            console.error(`❌ Node execution failed: ${job?.id}`, err);
        });

        this.queueEvents.on("waiting", ({ jobId }) => {
            console.log(`⏳ Workflow job waiting: ${jobId}`);
        });

        this.queueEvents.on("active", ({ jobId }) => {
            console.log(`🚀 Workflow job active: ${jobId}`);
        });
    }

    /**
     * Processa a execução de um workflow
     */
    private async processWorkflow(job: Job<WorkflowJobData>): Promise<WorkflowExecutionOutput> {
        const { workflowId, triggerData, userId, organizationId, context } = job.data;
        const executionId = job.id as string;

        try {
            // Criar contexto de execução
            const executionContext: WorkflowExecutionContext = {
                executionId,
                workflowId,
                userId,
                organizationId,
                triggerData: triggerData || {},
                nodeResults: new Map(),
                variables: new Map(),
                logs: [],
                startTime: new Date(),
            };

            this.executions.set(executionId, executionContext);

            this.emit("workflow:started", { executionId, workflowId });
            this.addLog(executionId, "info", "Workflow execution started");

            // Buscar definição do workflow
            const workflow = await this.getWorkflowDefinition(workflowId);
            if (!workflow) {
                throw new Error(`Workflow not found: ${workflowId}`);
            }

            // Encontrar nós de trigger
            const triggerNodes = workflow.nodes.filter(
                (node) =>
                    node.type === "trigger" ||
                    node.type === "manual_trigger" ||
                    node.type === "webhook_trigger" ||
                    node.type === "schedule_trigger"
            );

            if (triggerNodes.length === 0) {
                throw new Error("No trigger nodes found in workflow");
            }

            // Executar nós de trigger
            for (const triggerNode of triggerNodes) {
                await this.executeNode(executionId, triggerNode, executionContext);
            }

            // Executar nós subsequentes
            await this.executeWorkflowNodes(executionId, workflow, executionContext);

            const duration = Date.now() - executionContext.startTime.getTime();
            this.addLog(executionId, "info", `Workflow execution completed in ${duration}ms`);

            this.emit("workflow:completed", {
                executionId,
                result: Object.fromEntries(executionContext.nodeResults),
            });

            return {
                executionId,
                status: "completed",
                result: Object.fromEntries(executionContext.nodeResults),
                startedAt: executionContext.startTime,
                completedAt: new Date(),
                duration,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.addLog(executionId, "error", `Workflow execution failed: ${errorMessage}`);

            this.emit("workflow:failed", { executionId, error: errorMessage });

            return {
                executionId,
                status: "failed",
                error: errorMessage,
                startedAt: this.executions.get(executionId)?.startTime || new Date(),
                completedAt: new Date(),
            };
        } finally {
            this.executions.delete(executionId);
        }
    }

    /**
     * Processa a execução de um nó
     */
    private async processNode(job: Job<NodeJobData>): Promise<NodeExecutionResult> {
        const { executionId, nodeId, nodeType, config, inputs, context } = job.data;

        try {
            this.emit("node:started", { executionId, nodeId });
            this.addLog(executionId, "info", `Node ${nodeId} (${nodeType}) execution started`);

            // Buscar processador do nó
            const processor = this.nodeProcessors.get(nodeType);
            if (!processor) {
                throw new Error(`No processor found for node type: ${nodeType}`);
            }

            // Validar configuração se disponível
            if (processor.validate && !processor.validate(config)) {
                throw new Error(`Invalid configuration for node type: ${nodeType}`);
            }

            // Executar processador
            const result = await processor.process(job.data);

            if (result.success) {
                this.addLog(executionId, "info", `Node ${nodeId} completed successfully`);
                this.emit("node:completed", { executionId, nodeId, result: result.data });
            } else {
                this.addLog(executionId, "error", `Node ${nodeId} failed: ${result.error}`);
                this.emit("node:failed", {
                    executionId,
                    nodeId,
                    error: result.error || "Unknown error",
                });
            }

            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.addLog(executionId, "error", `Node ${nodeId} execution failed: ${errorMessage}`);

            this.emit("node:failed", { executionId, nodeId, error: errorMessage });

            return {
                success: false,
                error: errorMessage,
            };
        }
    }

    /**
     * Executa um nó específico
     */
    private async executeNode(
        executionId: string,
        node: any,
        context: WorkflowExecutionContext
    ): Promise<void> {
        const nodeJobData: NodeJobData = {
            executionId,
            nodeId: node.id,
            nodeType: node.type,
            config: node.data?.config || {},
            inputs: this.getNodeInputs(node, context),
            context,
        };

        // Adicionar job à fila de nós
        await this.nodeQueue.add(`node-${node.id}`, nodeJobData, {
            priority: 5,
            removeOnComplete: 10,
            removeOnFail: 5,
        });
    }

    /**
     * Executa todos os nós do workflow
     */
    private async executeWorkflowNodes(
        executionId: string,
        workflow: any,
        context: WorkflowExecutionContext
    ): Promise<void> {
        // Implementar lógica de execução baseada nas conexões
        // Por enquanto, executar todos os nós de ação
        const actionNodes = workflow.nodes.filter(
            (node: any) =>
                node.type === "action" ||
                node.type === "http_request" ||
                node.type === "send_email" ||
                node.type === "database_save"
        );

        for (const node of actionNodes) {
            await this.executeNode(executionId, node, context);
        }
    }

    /**
     * Obtém as entradas de um nó
     */
    private getNodeInputs(node: any, context: WorkflowExecutionContext): Record<string, any> {
        const inputs: Record<string, any> = {};

        // Adicionar dados do trigger
        if (node.type === "trigger" || node.type === "manual_trigger") {
            inputs.triggerData = context.triggerData;
        }

        // Adicionar resultados de nós anteriores
        for (const [nodeId, result] of context.nodeResults) {
            inputs[nodeId] = result;
        }

        // Adicionar variáveis do contexto
        for (const [key, value] of context.variables) {
            inputs[key] = value;
        }

        return inputs;
    }

    /**
     * Adiciona um log ao contexto de execução
     */
    private addLog(
        executionId: string,
        level: "info" | "warn" | "error" | "debug",
        message: string,
        nodeId?: string,
        data?: Record<string, any>
    ): void {
        const context = this.executions.get(executionId);
        if (context) {
            const log: WorkflowLog = {
                id: `${executionId}-${Date.now()}`,
                timestamp: new Date(),
                level,
                message,
                nodeId,
                data,
            };
            context.logs.push(log);
        }
    }

    /**
     * Busca a definição de um workflow
     */
    private async getWorkflowDefinition(workflowId: string): Promise<any> {
        // TODO: Implementar busca no banco de dados
        // Por enquanto, retornar um workflow mock
        return {
            id: workflowId,
            name: "Test Workflow",
            nodes: [
                {
                    id: "trigger-1",
                    type: "manual_trigger",
                    data: { config: {} },
                },
                {
                    id: "action-1",
                    type: "http_request",
                    data: {
                        config: {
                            url: "https://api.example.com/test",
                            method: "GET",
                        },
                    },
                },
            ],
            edges: [],
        };
    }

    /**
     * Registra um processador de nó
     */
    public registerNodeProcessor(processor: NodeProcessor): void {
        this.nodeProcessors.set(processor.nodeType, processor);
        console.log(`📝 Registered node processor: ${processor.nodeType}`);
    }

    /**
     * Registra um trigger
     */
    public registerTrigger(trigger: WorkflowTrigger): void {
        this.triggers.set(trigger.triggerType, trigger);
        console.log(`🎯 Registered trigger: ${trigger.triggerType}`);
    }

    /**
     * Executa um workflow
     */
    public async executeWorkflow(input: WorkflowExecutionInput): Promise<string> {
        const job = await this.workflowQueue.add("workflow-execution", input, {
            priority: 5,
            removeOnComplete: 10,
            removeOnFail: 5,
        });

        return job.id as string;
    }

    /**
     * Obtém o status de uma execução
     */
    public async getExecutionStatus(executionId: string): Promise<WorkflowExecutionStatus | null> {
        const job = await this.workflowQueue.getJob(executionId);
        if (!job) return null;

        const state = await job.getState();
        switch (state) {
            case "waiting":
            case "delayed":
                return "pending";
            case "active":
                return "running";
            case "completed":
                return "completed";
            case "failed":
                return "failed";
            default:
                return "pending";
        }
    }

    /**
     * Cancela uma execução
     */
    public async cancelExecution(executionId: string): Promise<boolean> {
        const job = await this.workflowQueue.getJob(executionId);
        if (!job) return false;

        await job.remove();
        return true;
    }

    /**
     * Obtém logs de uma execução
     */
    public getExecutionLogs(executionId: string): WorkflowLog[] {
        const context = this.executions.get(executionId);
        return context?.logs || [];
    }

    /**
     * Obtém estatísticas das filas
     */
    public async getQueueStats(): Promise<any> {
        const workflowStats = await this.workflowQueue.getJobCounts();
        const nodeStats = await this.nodeQueue.getJobCounts();

        return {
            workflow: workflowStats,
            node: nodeStats,
        };
    }

    /**
     * Limpa as filas
     */
    public async clearQueues(): Promise<void> {
        await this.workflowQueue.obliterate({ force: true });
        await this.nodeQueue.obliterate({ force: true });
    }

    /**
     * Para o motor de execução
     */
    public async stop(): Promise<void> {
        await this.workflowWorker.close();
        await this.nodeWorker.close();
        await this.workflowQueue.close();
        await this.nodeQueue.close();
        await this.queueEvents.close();
    }
}
