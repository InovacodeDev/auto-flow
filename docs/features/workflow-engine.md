# AutoFlow - Workflow Engine

## Overview

O Workflow Engine é o núcleo do AutoFlow, responsável por executar automações definidas pelos usuários. Ele processa workflows compostos por nodes (nós) conectados por edges (arestas), suportando diferentes tipos de triggers e operações.

## Arquitetura do Sistema

### Componentes Principais

1. **Workflow Engine**: Executor principal que processa workflows
2. **Trigger System**: Sistema de gatilhos para iniciar workflows
3. **Node Library**: Biblioteca de nodes disponíveis
4. **Execution Context**: Contexto de execução com dados e variáveis
5. **Logger**: Sistema de logs detalhado para debugging

### Fluxo de Execução

```
Trigger → Engine → Node 1 → Node 2 → ... → Final Node
    ↓        ↓        ↓        ↓              ↓
 Webhook  Context  Process  Process     Complete/Error
```

## Core Functionality

- **Execução de Workflows**: Processamento assíncrono de automações personalizadas
- **Sistema de Triggers**: Webhook, agendamento, manual e baseados em eventos
- **Actions Flexíveis**: Envio de mensagens, chamadas API, manipulação de dados
- **Conditions Inteligentes**: Lógica condicional (if/else, loops, filtros)
- **Queue Management**: Execução ordenada e retry automático para falhas

## Technical Implementation

### Workflow Structure

```typescript
interface AutoFlowWorkflow {
    id: string;
    name: string;
    description: string;
    organizationId: string;

    // Execution configuration
    triggers: WorkflowTrigger[];
    actions: WorkflowAction[];
    conditions: WorkflowCondition[];

    // Metadata
    metadata: {
        createdBy: string;
        aiGenerated: boolean;
        language: "pt-BR";
        industry: string;
        version: number;
        tags: string[];
    };

    // Runtime settings
    settings: {
        timeout: number; // milliseconds
        retryAttempts: number;
        concurrentExecutions: number;
        enabled: boolean;
    };

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
    lastExecutedAt?: Date;
}
```

### Trigger System

```typescript
// Base trigger interface
interface WorkflowTrigger {
    id: string;
    type: TriggerType;
    config: Record<string, any>;
    conditions?: TriggerCondition[];
}

// Trigger types
type TriggerType =
    | "webhook" // HTTP webhooks
    | "schedule" // Cron-based scheduling
    | "manual" // User-initiated
    | "whatsapp_received" // WhatsApp message
    | "form_submission" // Form completed
    | "email_received" // Email trigger
    | "file_upload" // File system events
    | "database_change"; // Database triggers

// WhatsApp trigger example
interface WhatsAppTrigger extends WorkflowTrigger {
    type: "whatsapp_received";
    config: {
        phoneNumber: string;
        keywords?: string[];
        messageType?: "text" | "image" | "document" | "any";
    };
}
```

### Action System

```typescript
// Base action interface
interface WorkflowAction {
    id: string;
    type: ActionType;
    config: Record<string, any>;
    dependencies?: string[]; // Other action IDs
}

// Action types
type ActionType =
    | "send_whatsapp" // Send WhatsApp message
    | "send_email" // Send email
    | "api_call" // HTTP API call
    | "save_to_crm" // CRM integration
    | "generate_document" // PDF/document generation
    | "wait" // Delay execution
    | "condition" // Conditional logic
    | "loop" // Iteration logic
    | "webhook_call"; // Call external webhook

// WhatsApp send action example
interface SendWhatsAppAction extends WorkflowAction {
    type: "send_whatsapp";
    config: {
        to: string; // Phone number or template variable
        message: string; // Message text with variables
        mediaUrl?: string; // Optional media attachment
        integrationId: string; // WhatsApp integration ID
    };
}
```

### Execution Engine

```typescript
class WorkflowEngine {
    private queue: QueueManager;
    private integrations: IntegrationRegistry;
    private analytics: AnalyticsCollector;

    async executeWorkflow(
        workflow: AutoFlowWorkflow,
        triggerPayload: any,
        context: ExecutionContext
    ): Promise<WorkflowExecutionResult> {
        const execution: WorkflowExecution = {
            id: generateId(),
            workflowId: workflow.id,
            organizationId: workflow.organizationId,
            status: "running",
            startedAt: new Date(),
            context: {
                ...context,
                triggerPayload,
                variables: new Map(),
            },
        };

        try {
            // Execute actions in dependency order
            const sortedActions = this.resolveDependencies(workflow.actions);

            for (const action of sortedActions) {
                await this.executeAction(action, execution);
            }

            execution.status = "completed";
            execution.completedAt = new Date();
        } catch (error) {
            execution.status = "failed";
            execution.error = error.message;
            execution.failedAt = new Date();

            // Schedule retry if configured
            if (execution.retryCount < workflow.settings.retryAttempts) {
                await this.scheduleRetry(execution, workflow);
            }
        }

        // Save execution record and update analytics
        await this.saveExecution(execution);
        await this.analytics.recordExecution(execution);

        return {
            executionId: execution.id,
            status: execution.status,
            duration: execution.completedAt ? execution.completedAt.getTime() - execution.startedAt.getTime() : null,
            error: execution.error,
        };
    }

    private async executeAction(action: WorkflowAction, execution: WorkflowExecution): Promise<void> {
        const handler = this.getActionHandler(action.type);
        const resolvedConfig = this.resolveVariables(action.config, execution.context);

        const result = await handler.execute(resolvedConfig, execution.context);

        // Store action result for use in subsequent actions
        execution.context.variables.set(action.id, result);
    }
}
```

## Dependencies

- **Queue System**: Redis para execução assíncrona
- **Integration Registry**: Sistema de plugins para integrações
- **Variable Resolution**: Template engine para substituição de variáveis
- **Analytics Collector**: Coleta de métricas de execução

## Testing Strategy

- **Unit Tests**: Testes isolados para cada component do engine
- **Integration Tests**: Testes end-to-end de workflows completos
- **Performance Tests**: Load testing para high-volume scenarios
- **Chaos Testing**: Simulação de falhas para resiliência

## Future Considerations

- **Parallel Execution**: Actions paralelas quando não há dependências
- **Workflow Versioning**: Versionamento e rollback de workflows
- **Visual Debugging**: Interface para debug step-by-step
- **Performance Optimization**: Caching e otimizações de performance
- **Horizontal Scaling**: Distribuição de execução em múltiplos workers

---

**Status**: 🔄 A ser implementado na Sprint 3-4
**Dependencies**: Sistema de autenticação, database schema, integration registry
