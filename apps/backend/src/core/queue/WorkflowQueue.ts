import Bull from "bull";
import { WorkflowEngine } from "../engine/WorkflowEngine";

export interface QueueJobData {
    workflowId: string;
    triggerData: any;
    userId?: string;
    executionId: string;
    priority?: number;
}

export interface QueueConfig {
    redis: {
        host: string;
        port: number;
        password?: string;
        db?: number;
    };
    defaultJobOptions: {
        removeOnComplete: number;
        removeOnFail: number;
        attempts: number;
        backoff: "exponential" | "fixed";
    };
    concurrency: number;
}

/**
 * Redis-based Queue System para AutoFlow
 * Substitui o array em memória por um sistema escalável
 */
export class WorkflowQueue {
    private queue: Bull.Queue<QueueJobData>;
    private workflowEngine?: WorkflowEngine;

    constructor(config: QueueConfig) {
        // Inicializar Bull Queue
        this.queue = new Bull("workflow-execution", {
            redis: config.redis,
        });

        // Configurar processamento
        this.setupProcessing(config.concurrency);
        this.setupEventListeners();
    }

    /**
     * Conectar com o WorkflowEngine
     */
    setWorkflowEngine(engine: WorkflowEngine): void {
        this.workflowEngine = engine;
    }

    /**
     * Adicionar job à fila
     */
    async addJob(data: Omit<QueueJobData, "executionId">, priority: number = 0): Promise<Bull.Job<QueueJobData>> {
        const jobData: QueueJobData = {
            ...data,
            executionId: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            priority,
        };

        return await this.queue.add("execute-workflow", jobData, {
            priority,
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 2000,
            },
        });
    }

    /**
     * Configurar processamento de jobs
     */
    private setupProcessing(concurrency: number): void {
        this.queue.process("execute-workflow", concurrency, async (job: Bull.Job<QueueJobData>) => {
            const { workflowId, triggerData, userId, executionId } = job.data;

            if (!this.workflowEngine) {
                throw new Error("WorkflowEngine not initialized");
            }

            try {
                // Log início do job
                console.log(`[Queue] Starting job ${job.id} for workflow ${workflowId}`);

                // Executar workflow via método público
                await this.workflowEngine.executeWorkflow(workflowId, triggerData, userId);

                // Log sucesso
                console.log(`[Queue] Job ${job.id} completed successfully`);

                return { success: true, executionId };
            } catch (error) {
                console.error(`[Queue] Job ${job.id} failed:`, error);
                throw error;
            }
        });
    }

    /**
     * Configurar event listeners
     */
    private setupEventListeners(): void {
        this.queue.on("completed", (job: Bull.Job, result) => {
            console.log(`[Queue] Job ${job.id} completed with result:`, result);
        });

        this.queue.on("failed", (job: Bull.Job, error: Error) => {
            console.error(`[Queue] Job ${job.id} failed with error:`, error.message);
        });

        this.queue.on("stalled", (job: Bull.Job) => {
            console.warn(`[Queue] Job ${job.id} stalled`);
        });

        this.queue.on("progress", (job: Bull.Job, progress: number) => {
            console.log(`[Queue] Job ${job.id} progress: ${progress}%`);
        });
    }

    /**
     * Obter estatísticas da fila
     */
    async getStats(): Promise<{
        waiting: number;
        active: number;
        completed: number;
        failed: number;
        delayed: number;
    }> {
        const [waiting, active, completed, failed, delayed] = await Promise.all([
            this.queue.getWaiting(),
            this.queue.getActive(),
            this.queue.getCompleted(),
            this.queue.getFailed(),
            this.queue.getDelayed(),
        ]);

        return {
            waiting: waiting.length,
            active: active.length,
            completed: completed.length,
            failed: failed.length,
            delayed: delayed.length,
        };
    }

    /**
     * Pausar processamento da fila
     */
    async pause(): Promise<void> {
        await this.queue.pause();
    }

    /**
     * Retomar processamento da fila
     */
    async resume(): Promise<void> {
        await this.queue.resume();
    }

    /**
     * Limpar jobs completados e falhos
     */
    async clean(grace: number = 0): Promise<void> {
        await this.queue.clean(grace, "completed");
        await this.queue.clean(grace, "failed");
    }

    /**
     * Obter job por ID
     */
    async getJob(jobId: Bull.JobId): Promise<Bull.Job<QueueJobData> | null> {
        return await this.queue.getJob(jobId);
    }

    /**
     * Cancelar job
     */
    async removeJob(jobId: Bull.JobId): Promise<void> {
        const job = await this.getJob(jobId);
        if (job) {
            await job.remove();
        }
    }

    /**
     * Fechar conexões
     */
    async close(): Promise<void> {
        await this.queue.close();
    }

    /**
     * Configuração padrão para desenvolvimento
     */
    static getDefaultConfig(): QueueConfig {
        const redisPassword = process.env["REDIS_PASSWORD"];
        return {
            redis: {
                host: process.env["REDIS_HOST"] || "localhost",
                port: parseInt(process.env["REDIS_PORT"] || "6379"),
                ...(redisPassword && { password: redisPassword }),
                db: parseInt(process.env["REDIS_DB"] || "0"),
            },
            defaultJobOptions: {
                removeOnComplete: 100,
                removeOnFail: 50,
                attempts: 3,
                backoff: "exponential",
            },
            concurrency: parseInt(process.env["QUEUE_CONCURRENCY"] || "10"),
        };
    }
}
