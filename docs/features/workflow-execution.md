# Execução de Workflows

## Overview

Sistema completo de execução de workflows que permite executar workflows criados no constructor visual através do WorkflowEngine e monitorar o progresso em tempo real.

## Core Functionality

### 1. Conversão de Workflows

- **WorkflowConverter**: Classe que converte workflows salvos no formato do banco para o formato esperado pelo WorkflowEngine
- **Transformação de tipos**: Mapping entre tipos de nós visuais e componentes do engine
- **Extração de triggers**: Identificação automática de triggers baseada nos nós do workflow

### 2. Execução de Workflows

- **Endpoint de execução**: `POST /api/workflows/:id/execute`
- **Validação**: Verificação se o workflow existe e está válido para execução
- **Logging completo**: Registro detalhado de todas as etapas de execução
- **Tratamento de erros**: Captura e armazenamento de erros durante a execução

### 3. Monitoramento de Execuções

- **Histórico de execuções**: Lista de todas as execuções de um workflow
- **Status em tempo real**: Estados de execução (running, success, failed, cancelled)
- **Duração de execução**: Cálculo automático do tempo de execução
- **Logs detalhados**: Visualização de logs por nível (info, warn, error, debug)

### 4. Interface de Usuário

- **ExecutionPanel**: Modal completo para gerenciar execuções
- **Botão de execução**: Integrado ao WorkflowToolbar
- **Visualização de status**: Ícones e cores para diferentes estados
- **Logs interativos**: Expandir/recolher dados detalhados dos logs

## Technical Implementation

### Database Schema

```sql
-- Tabela de execuções
CREATE TABLE workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration INTEGER,
    error_message TEXT,
    trigger_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de logs de execução
CREATE TABLE workflow_execution_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    level TEXT NOT NULL,
    message TEXT NOT NULL,
    component TEXT NOT NULL,
    node_id TEXT,
    data JSONB
);
```

### API Endpoints

#### Executar Workflow

```typescript
POST /api/workflows/:id/execute
Content-Type: application/json

{
    "triggerType": "manual"
}

// Response
{
    "success": true,
    "data": {
        "executionId": "uuid",
        "status": "running"
    }
}
```

#### Listar Execuções

```typescript
GET /api/workflows/:id/executions

// Response
{
    "success": true,
    "data": {
        "executions": [
            {
                "id": "uuid",
                "status": "success",
                "startedAt": "2024-01-01T00:00:00Z",
                "completedAt": "2024-01-01T00:01:00Z",
                "duration": 60000,
                "errorMessage": null
            }
        ]
    }
}
```

#### Logs de Execução

```typescript
GET /api/workflows/executions/:executionId/logs

// Response
{
    "success": true,
    "data": {
        "logs": [
            {
                "id": "uuid",
                "timestamp": "2024-01-01T00:00:01Z",
                "level": "info",
                "message": "Workflow started",
                "component": "WorkflowEngine",
                "nodeId": null,
                "data": {}
            }
        ]
    }
}
```

### Frontend Components

#### ExecutionPanel

- **Props**: `workflowId`, `isOpen`, `onClose`
- **Features**:
    - Lista de execuções com paginação
    - Seleção de execução para ver logs
    - Botão para executar workflow diretamente
    - Visualização em tempo real do status

#### WorkflowCanvas (Atualizado)

- **Nova funcionalidade**: Botão "Execuções" no toolbar
- **Modal integrado**: ExecutionPanel como overlay
- **Estado local**: Controle de abertura/fechamento do painel

### React Query Hooks

#### useExecuteWorkflow

```typescript
const executeWorkflow = useExecuteWorkflow();

await executeWorkflow.mutateAsync({
    workflowId: "uuid",
    request: { triggerType: "manual" },
});
```

#### useWorkflowExecutions

```typescript
const { data, isLoading } = useWorkflowExecutions(workflowId, {
    enabled: isOpen,
});
```

#### useExecutionLogs

```typescript
const { data, isLoading } = useExecutionLogs(executionId, {
    enabled: !!selectedExecution,
});
```

## Dependencies

### Backend

- **Drizzle ORM**: Operações de banco de dados com tipagem
- **Fastify**: Framework web para endpoints REST
- **WorkflowEngine**: Engine de execução existente

### Frontend

- **React Query**: Gerenciamento de estado servidor
- **Heroicons**: Ícones para UI
- **Tailwind CSS**: Estilização responsiva

## Testing Strategy

### Backend Testing

- **Unit Tests**: Testes para WorkflowConverter
- **Integration Tests**: Testes para endpoints de execução
- **Database Tests**: Validação de schemas e relations

### Frontend Testing

- **Component Tests**: Testes para ExecutionPanel
- **Hook Tests**: Testes para React Query hooks
- **E2E Tests**: Fluxo completo de execução

### Manual Testing

1. Criar workflow no constructor visual
2. Salvar workflow
3. Abrir painel de execuções
4. Executar workflow
5. Verificar logs em tempo real
6. Validar estados de sucesso/erro

## Future Considerations

### Performance

- **Paginação**: Implementar paginação para grandes volumes de execuções
- **Real-time**: WebSockets para updates em tempo real
- **Caching**: Cache inteligente para execuções recentes

### Features Avançadas

- **Execução em lote**: Executar múltiplos workflows
- **Agendamento**: Execução programada de workflows
- **Retry logic**: Reexecução automática em caso de falha
- **Notificações**: Alertas de execução via email/webhook

### Monitoring

- **Métricas**: Dashboards de performance de workflows
- **Alertas**: Monitoramento proativo de falhas
- **Auditoria**: Trilha completa de execuções para compliance

### Integrações

- **CI/CD**: Execução de workflows em pipelines
- **External APIs**: Triggers via webhooks externos
- **Scheduled Jobs**: Integração com cron jobs do sistema
