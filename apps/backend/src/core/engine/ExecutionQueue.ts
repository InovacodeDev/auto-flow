import { WorkflowEngine } from "./WorkflowEngine";
import { WorkflowDefinition, ExecutionContext } from "./types";

/**
 * ExecutionQueue - Sistema de fila para execução de workflows
 * Gerencia execução assíncrona e paralela de workflows
 */
export class ExecutionQueue {
    private queue: QueueItem[] = [];
    private processing = false;
    private maxConcurrent = 10;
    private currentExecutions = 0;
    private engine: WorkflowEngine;

    constructor(engine: WorkflowEngine, config: QueueConfig = {}) {
        this.engine = engine;
        this.maxConcurrent = config.maxConcurrent || 10;
    }

    /**
     * Adiciona workflow à fila de execução
     */
    async enqueue(
        workflow: WorkflowDefinition,
        input: Record<string, any> = {},
        priority: Priority = "normal",
        userId?: string
    ): Promise<string> {
        const item: QueueItem = {
            id: this.generateId(),
            workflow,
            input,
            priority,
            enqueuedAt: new Date(),
            retryCount: 0,
            status: "queued",
            ...(userId && { userId }),
        };

        // Inserir baseado na prioridade
        this.insertByPriority(item);

        // Iniciar processamento se não estiver rodando
        if (!this.processing) {
            this.startProcessing();
        }

        return item.id;
    }

    /**
     * Processa fila de execução
     */
    private async startProcessing(): Promise<void> {
        if (this.processing) return;

        this.processing = true;

        while (this.queue.length > 0 && this.currentExecutions < this.maxConcurrent) {
            const item = this.queue.shift();
            if (!item) break;

            this.executeItem(item);
        }

        if (this.currentExecutions === 0) {
            this.processing = false;
        }
    }

    /**
     * Executa item da fila
     */
    private async executeItem(item: QueueItem): Promise<void> {
        this.currentExecutions++;
        item.status = "running";
        item.startedAt = new Date();

        try {
            // Usar método correto do WorkflowEngine
            await this.engine.executeWorkflow(item.workflow.id, item.input, item.userId);

            item.status = "completed";
            item.completedAt = new Date();

            this.emit("item.completed", item);
        } catch (error) {
            item.status = "failed";
            item.completedAt = new Date();
            item.error = error instanceof Error ? error.message : "Unknown error";

            // Implementar retry logic
            if (this.shouldRetry(item)) {
                await this.retryItem(item);
            } else {
                this.emit("item.failed", item);
            }
        } finally {
            this.currentExecutions--;

            // Continuar processando fila
            if (this.queue.length > 0) {
                setTimeout(() => this.startProcessing(), 100);
            } else {
                this.processing = false;
            }
        }
    }

    /**
     * Insere item na fila baseado na prioridade
     */
    private insertByPriority(item: QueueItem): void {
        const priorities = { urgent: 0, high: 1, normal: 2, low: 3 };
        const itemPriority = priorities[item.priority];

        let insertIndex = 0;
        for (let i = 0; i < this.queue.length; i++) {
            const queuePriority = priorities[this.queue[i].priority];
            if (itemPriority <= queuePriority) {
                break;
            }
            insertIndex = i + 1;
        }

        this.queue.splice(insertIndex, 0, item);
    }

    /**
     * Verifica se item deve ser reprocessado
     */
    private shouldRetry(item: QueueItem): boolean {
        return item.retryCount < 3; // Max 3 tentativas
    }

    /**
     * Reprocessa item com delay
     */
    private async retryItem(item: QueueItem): Promise<void> {
        item.retryCount++;
        item.status = "retrying";

        const delay = Math.pow(2, item.retryCount) * 1000; // Exponential backoff

        setTimeout(() => {
            item.status = "queued";
            this.insertByPriority(item);
            this.startProcessing();
        }, delay);

        this.emit("item.retry", item);
    }

    /**
     * Cancela item da fila
     */
    cancelItem(itemId: string): boolean {
        const index = this.queue.findIndex((item) => item.id === itemId);
        if (index !== -1) {
            const item = this.queue[index];
            item.status = "cancelled";
            this.queue.splice(index, 1);
            this.emit("item.cancelled", item);
            return true;
        }
        return false;
    }

    /**
     * Obtém status da fila
     */
    getQueueStatus() {
        return {
            total: this.queue.length,
            running: this.currentExecutions,
            byPriority: {
                urgent: this.queue.filter((item) => item.priority === "urgent").length,
                high: this.queue.filter((item) => item.priority === "high").length,
                normal: this.queue.filter((item) => item.priority === "normal").length,
                low: this.queue.filter((item) => item.priority === "low").length,
            },
            processing: this.processing,
        };
    }

    /**
     * Pausa processamento da fila
     */
    pause(): void {
        this.processing = false;
    }

    /**
     * Resume processamento da fila
     */
    resume(): void {
        if (!this.processing && this.queue.length > 0) {
            this.startProcessing();
        }
    }

    /**
     * Limpa fila de execução
     */
    clear(): void {
        this.queue.length = 0;
        this.processing = false;
    }

    private generateId(): string {
        return `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private emit(event: string, data: any): void {
        // Implementar emissão de eventos
        console.log(`Queue Event: ${event}`, data);
    }
}

interface QueueItem {
    id: string;
    workflow: WorkflowDefinition;
    input: Record<string, any>;
    priority: Priority;
    enqueuedAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    retryCount: number;
    status: "queued" | "running" | "completed" | "failed" | "cancelled" | "retrying";
    userId?: string;
    error?: string;
}

interface QueueConfig {
    maxConcurrent?: number;
    retryAttempts?: number;
    retryDelay?: number;
}

type Priority = "urgent" | "high" | "normal" | "low";
