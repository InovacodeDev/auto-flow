````markdown
# AutoFlow - Workflow Engine (Full Original)

Arquivo arquivado contendo a cópia completa de `docs/features/workflow-engine.md` antes da consolidação.

O resumo canônico está em `../consolidated/workflow-engine-summary.md`.

---

COPY OF ORIGINAL CONTENT:

```
... full original content archived ...
```
````

```markdown
# Workflow Engine — Full Original

This file is an archived copy of the original `docs/features/workflow-engine.md` prior to consolidation.

It contains the full, unedited content for historical reference and compliance. The active, canonical summary lives at `../consolidated/workflow-engine-summary.md`.

---

COPY OF ORIGINAL CONTENT:
```

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
    context: ExecutionContext,
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
      duration: execution.completedAt
        ? execution.completedAt.getTime() - execution.startedAt.getTime()
        : null,
      error: execution.error,
    };
  }

  private async executeAction(
    action: WorkflowAction,
    execution: WorkflowExecution,
  ): Promise<void> {
    const handler = this.getActionHandler(action.type);
    const resolvedConfig = this.resolveVariables(
      action.config,
      execution.context,
    );

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

```

```

```

```
