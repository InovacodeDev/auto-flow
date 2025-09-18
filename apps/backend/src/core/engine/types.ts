// Workflow Engine Core Types
// Interfaces fundamentais para o sistema de workflows

// Tipos base de dados
export type NodeDataType = "string" | "number" | "boolean" | "object" | "array" | "any";

// Status de execução
export type ExecutionStatus = "pending" | "running" | "completed" | "failed" | "cancelled" | "timeout";

// Tipos de trigger
export type TriggerType = "webhook" | "schedule" | "manual" | "database";

// Níveis de log
export type LogLevel = "info" | "warn" | "error" | "fatal" | "debug";

// Estratégias de retry
export type BackoffStrategy = "fixed" | "exponential" | "linear";

// Interface para entrada de node
export interface NodeInput {
    name: string;
    type: NodeDataType;
    required: boolean;
    description?: string;
    default?: any;
    validation?: {
        min?: number;
        max?: number;
        pattern?: string;
        enum?: any[];
    };
}

// Interface para saída de node
export interface NodeOutput {
    name: string;
    type: NodeDataType;
    description?: string;
}

// Definição de um node no workflow
export interface WorkflowNode {
    id: string;
    type: string;
    name: string;
    description?: string;
    position: {
        x: number;
        y: number;
    };
    config: Record<string, any>;
    inputs: NodeInput[];
    outputs: NodeOutput[];
    enabled?: boolean;
}

// Conexão entre nodes
export interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
    condition?: string; // Expressão para avaliação condicional
    label?: string;
}

// Configuração de trigger
export interface TriggerConfig {
    type: TriggerType;
    config: Record<string, any>;
    enabled: boolean;

    // Webhook specific
    webhook?: {
        method: "GET" | "POST" | "PUT" | "DELETE";
        path: string;
        authentication?: {
            type: "bearer" | "basic" | "api-key";
            config: Record<string, any>;
        };
    };

    // Schedule specific
    schedule?: {
        cron: string;
        timezone: string;
        enabled?: boolean;
        startDate?: Date;
        endDate?: Date;
        metadata?: Record<string, any>;
    }; // Manual specific
    manual?: {
        requireConfirmation: boolean;
        allowedRoles: string[];
        parameters?: NodeInput[];
    };
}

// Política de retry
export interface RetryPolicy {
    enabled: boolean;
    maxAttempts: number;
    backoffStrategy: BackoffStrategy;
    baseDelay: number; // em milissegundos
    maxDelay: number;
    exponentialBase?: number;
    retryableErrors?: string[];
}

// Definição completa de um workflow
export interface WorkflowDefinition {
    id: string;
    name: string;
    description?: string;
    organizationId: string;
    version: number;
    status: "active" | "inactive" | "draft";
    triggers: TriggerConfig[]; // Mudando de trigger para triggers (plural)
    nodes: WorkflowNode[];
    variables?: Record<string, any>;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
}

// Log de execução
export interface ExecutionLog {
    timestamp: Date;
    level: LogLevel;
    component: string; // Adicionando campo component
    message: string;
    data?: any;
    nodeId?: string;
    executionId?: string;
}

// Contexto de execução
export interface ExecutionContext {
    id: string;
    workflowId: string;
    status: ExecutionStatus;
    startTime: Date;
    endTime?: Date;
    triggerData: any;
    userId?: string;
    data: Record<string, any>;
    logs: ExecutionLog[];
    currentNodeId?: string;
    error?: WorkflowError;
    completedNodes: string[];
    metrics: {
        nodesExecuted: number;
        totalExecutionTime: number;
        nodeExecutionTimes: Record<string, number>;
        memoryUsage: number;
    };
}

// Resultado de execução de node
export interface NodeExecutionResult {
    success: boolean;
    data?: Record<string, any>;
    error?: string;
    logs?: ExecutionLog[];
    nextNodeId?: string; // Para controle de fluxo simples
    nextNodeIds?: string[]; // para nodes que podem ter múltiplas saídas
}

// Interface para implementação de nodes
export interface NodeExecutor {
    type: string;
    name: string;
    description: string;
    category: string;
    inputs: NodeInput[];
    outputs: NodeOutput[];

    // Validação da configuração
    validateConfig(config: Record<string, any>): {
        valid: boolean;
        errors?: string[];
    };

    // Execução do node
    execute(
        config: Record<string, any>,
        inputs: Record<string, any>,
        context: ExecutionContext
    ): Promise<NodeExecutionResult>;

    // Metadados
    icon?: string;
    color?: string;
    version: string;
}

// Interface para trigger handlers
export interface TriggerHandler {
    type: TriggerType;

    // Registrar trigger
    register(workflowId: string, config: TriggerConfig): Promise<void>;

    // Remover trigger
    unregister(workflowId: string): Promise<void>;

    // Atualizar trigger
    update(workflowId: string, config: TriggerConfig): Promise<void>;

    // Verificar se trigger está ativo
    isActive(workflowId: string): Promise<boolean>;
}

// Eventos do workflow engine
export interface WorkflowEngineEvents {
    "execution.started": (context: ExecutionContext) => void;
    "execution.completed": (context: ExecutionContext) => void;
    "execution.failed": (context: ExecutionContext, error: Error) => void;
    "execution.cancelled": (context: ExecutionContext) => void;
    "node.started": (nodeId: string, context: ExecutionContext) => void;
    "node.completed": (nodeId: string, result: NodeExecutionResult, context: ExecutionContext) => void;
    "node.failed": (nodeId: string, error: Error, context: ExecutionContext) => void;
    "workflow.triggered": (workflowId: string, triggerData: any) => void;
}

// Configuração do engine
export interface EngineConfig {
    // Limites
    maxConcurrentExecutions: number;
    defaultTimeout: number;
    maxLogsPerExecution: number;
    maxExecutionDataSize: number; // em bytes

    // Performance
    nodeExecutionPoolSize: number;
    cacheEnabled: boolean;
    cacheTTL: number;

    // Monitoring
    metricsEnabled: boolean;
    detailedLogging: boolean;

    // Segurança
    sandboxEnabled: boolean;
    allowedDomains?: string[];
    maxApiCalls?: number;
}

// Métricas de execução
export interface ExecutionMetrics {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageExecutionTime: number;
    totalExecutionTime: number; // Adicionando campo que estava sendo usado
    executionsPerHour: number;
    peakConcurrentExecutions: number; // Adicionando campo que estava sendo usado
    currentConcurrentExecutions: number; // Adicionando campo que estava sendo usado
    queueSize: number; // Adicionando campo que estava sendo usado
    errorRate: number; // Adicionando campo que estava sendo usado
    lastExecution: Date | null; // Adicionando campo que estava sendo usado
    startTime: Date; // Adicionando campo que estava sendo usado
    uptime: number; // Adicionando campo que estava sendo usado

    // Por node
    nodeExecutionCounts: Record<string, number>;
    nodeAverageExecutionTimes: Record<string, number>;
    nodeErrorRates: Record<string, number>;

    // Recursos
    memoryUsage: number;
    cpuUsage: number;
}

// Interface principal do Workflow Engine
export interface IWorkflowEngine {
    // Configuração
    config: EngineConfig;

    // Gerenciamento de workflows
    registerWorkflow(definition: WorkflowDefinition): Promise<void>;
    unregisterWorkflow(workflowId: string): Promise<void>;
    updateWorkflow(definition: WorkflowDefinition): Promise<void>;

    // Execução
    executeWorkflow(workflowId: string, triggerData: any, userId?: string): Promise<void>; // mudando para void

    cancelExecution(executionId: string): Promise<void>;

    // Monitoring
    getExecution(executionId: string): Promise<ExecutionContext | null>;
    getExecutionLogs(executionId: string): Promise<ExecutionLog[]>;
    getMetrics(): ExecutionMetrics; // removendo Promise

    // Node management
    registerNodeExecutor(nodeType: string, executor: NodeExecutor): void; // adicionando nodeType parameter
    getAvailableNodes(): NodeExecutor[];

    // Trigger management
    registerTriggerHandler(handler: TriggerHandler): void;

    // Events
    on<K extends keyof WorkflowEngineEvents>(event: K, listener: WorkflowEngineEvents[K]): void;

    off<K extends keyof WorkflowEngineEvents>(event: K, listener: WorkflowEngineEvents[K]): void;

    // Lifecycle
    start(): Promise<void>;
    stop(): Promise<void>;
}

// Erros específicos do workflow engine
export class WorkflowError extends Error {
    constructor(
        message: string,
        public code: string,
        public nodeId?: string,
        public retryable: boolean = false
    ) {
        super(message);
        this.name = "WorkflowError";
    }
}

export class NodeError extends WorkflowError {
    constructor(message: string, nodeId: string, code: string = "NODE_EXECUTION_ERROR", retryable: boolean = false) {
        super(message, code, nodeId, retryable);
        this.name = "NodeError";
    }
}

export class TriggerError extends WorkflowError {
    constructor(message: string, code: string = "TRIGGER_ERROR", retryable: boolean = false) {
        super(message, code, undefined, retryable);
        this.name = "TriggerError";
    }
}

export class ValidationError extends WorkflowError {
    constructor(
        message: string,
        public field?: string
    ) {
        super(message, "VALIDATION_ERROR");
        this.name = "ValidationError";
    }
}

export class TimeoutError extends Error {
    public code: string = "TIMEOUT_ERROR";
    public timeout: number;

    constructor(message: string, timeout?: number) {
        super(message);
        this.name = "TimeoutError";
        this.timeout = timeout || 0;
    }
}
