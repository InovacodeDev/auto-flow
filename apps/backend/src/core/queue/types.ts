import { Job } from "bullmq";

/**
 * Status de execução do workflow
 */
export type WorkflowExecutionStatus =
    | "pending"
    | "running"
    | "completed"
    | "failed"
    | "cancelled"
    | "paused";

/**
 * Status de execução de um nó
 */
export type NodeExecutionStatus = "pending" | "running" | "completed" | "failed" | "skipped";

/**
 * Dados de entrada para execução do workflow
 */
export interface WorkflowExecutionInput {
    workflowId: string;
    triggerData?: Record<string, any>;
    userId?: string;
    organizationId?: string;
    context?: Record<string, any>;
}

/**
 * Dados de saída da execução do workflow
 */
export interface WorkflowExecutionOutput {
    executionId: string;
    status: WorkflowExecutionStatus;
    result?: Record<string, any>;
    error?: string;
    startedAt: Date;
    completedAt?: Date;
    duration?: number;
}

/**
 * Dados de execução de um nó
 */
export interface NodeExecutionData {
    nodeId: string;
    nodeType: string;
    config: Record<string, any>;
    inputs: Record<string, any>;
    status: NodeExecutionStatus;
    result?: any;
    error?: string;
    startedAt: Date;
    completedAt?: Date;
    duration?: number;
}

/**
 * Contexto de execução do workflow
 */
export interface WorkflowExecutionContext {
    executionId: string;
    workflowId: string;
    userId?: string;
    organizationId?: string;
    triggerData: Record<string, any>;
    nodeResults: Map<string, any>;
    variables: Map<string, any>;
    logs: WorkflowLog[];
    startTime: Date;
    currentNodeId?: string;
}

/**
 * Log de execução do workflow
 */
export interface WorkflowLog {
    id: string;
    timestamp: Date;
    level: "info" | "warn" | "error" | "debug";
    message: string;
    nodeId?: string;
    data?: Record<string, any>;
}

/**
 * Configuração de retry para jobs
 */
export interface RetryConfig {
    attempts: number;
    delay: number;
    backoff?: {
        type: "fixed" | "exponential";
        delay: number;
    };
}

/**
 * Configuração de prioridade para jobs
 */
export interface JobPriority {
    priority: number; // 1-10, onde 10 é a maior prioridade
    delay?: number; // Delay em ms
}

/**
 * Dados do job de execução do workflow
 */
export interface WorkflowJobData extends WorkflowExecutionInput {
    retryConfig?: RetryConfig;
    priority?: JobPriority;
}

/**
 * Dados do job de execução de nó
 */
export interface NodeJobData {
    executionId: string;
    nodeId: string;
    nodeType: string;
    config: Record<string, any>;
    inputs: Record<string, any>;
    context: WorkflowExecutionContext;
    retryConfig?: RetryConfig;
    priority?: JobPriority;
}

/**
 * Resultado da execução de um nó
 */
export interface NodeExecutionResult {
    success: boolean;
    data?: any;
    error?: string;
    logs?: WorkflowLog[];
    nextNodes?: string[];
}

/**
 * Configuração de filas
 */
export interface QueueConfig {
    name: string;
    concurrency: number;
    removeOnComplete: number;
    removeOnFail: number;
    defaultJobOptions: {
        removeOnComplete: number;
        removeOnFail: number;
        attempts: number;
        backoff: {
            type: "exponential";
            delay: number;
        };
    };
}

/**
 * Estatísticas de execução
 */
export interface ExecutionStats {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageDuration: number;
    lastExecution?: Date;
}

/**
 * Eventos do motor de execução
 */
export interface WorkflowExecutionEvents {
    "workflow:started": { executionId: string; workflowId: string };
    "workflow:completed": { executionId: string; result: any };
    "workflow:failed": { executionId: string; error: string };
    "node:started": { executionId: string; nodeId: string };
    "node:completed": { executionId: string; nodeId: string; result: any };
    "node:failed": { executionId: string; nodeId: string; error: string };
    "execution:progress": { executionId: string; progress: number };
}

/**
 * Interface para processadores de nós
 */
export interface NodeProcessor {
    nodeType: string;
    process: (data: NodeJobData) => Promise<NodeExecutionResult>;
    validate?: (config: Record<string, any>) => boolean;
}

/**
 * Interface para triggers
 */
export interface WorkflowTrigger {
    triggerType: string;
    execute: (data: any) => Promise<WorkflowExecutionInput>;
    validate?: (data: any) => boolean;
}

/**
 * Configuração do motor de execução
 */
export interface ExecutionEngineConfig {
    redis: {
        host: string;
        port: number;
        password?: string;
        db: number;
    };
    queues: {
        workflow: QueueConfig;
        node: QueueConfig;
    };
    concurrency: {
        workflow: number;
        node: number;
    };
    retry: {
        maxAttempts: number;
        delay: number;
    };
    monitoring: {
        enabled: boolean;
        port?: number;
    };
}
