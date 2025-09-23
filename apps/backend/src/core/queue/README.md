# Motor de Execução de Workflows com BullMQ

Este módulo implementa um motor de execução de workflows robusto e escalável usando BullMQ e Redis.

## 🏗️ Arquitetura

```
ExecutionEngine
├── WorkflowQueue (BullMQ)
├── NodeQueue (BullMQ)
├── NodeProcessors (Plugins)
├── Triggers (Plugins)
└── Redis (Persistência)
```

## 🚀 Funcionalidades

### ✅ Motor de Execução

- **Execução Assíncrona**: Workflows executam em background
- **Escalabilidade**: Múltiplos workers processam jobs em paralelo
- **Retry Automático**: Tentativas automáticas em caso de falha
- **Monitoramento**: Logs detalhados e status em tempo real
- **Cancelamento**: Possibilidade de cancelar execuções

### ✅ Processadores de Nós

- **Triggers**: Manual, Webhook, Schedule, Database
- **Actions**: HTTP, Email, Database, WhatsApp, Payment
- **Conditions**: IF, Validation, Error Handler, Retry
- **Utilities**: Delay, Transform, Clone, Code Execution, Logger

### ✅ Sistema de Filas

- **Workflow Queue**: Execução de workflows completos
- **Node Queue**: Execução de nós individuais
- **Priorização**: Jobs com diferentes prioridades
- **Rate Limiting**: Controle de taxa de execução

## 📁 Estrutura de Arquivos

```
src/core/queue/
├── redis.ts                    # Configuração do Redis
├── types.ts                    # Tipos TypeScript
├── ExecutionEngine.ts          # Motor principal
├── WorkflowExecutionService.ts # Serviço singleton
├── processors/
│   ├── TriggerProcessors.ts   # Processadores de triggers
│   ├── ActionProcessors.ts    # Processadores de ações
│   ├── ConditionProcessors.ts # Processadores de condições
│   └── UtilityProcessors.ts   # Processadores de utilitários
└── README.md                   # Esta documentação
```

## 🔧 Configuração

### Variáveis de Ambiente

```bash
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Execução
WORKFLOW_CONCURRENCY=5
NODE_CONCURRENCY=10
MONITORING_ENABLED=true
MONITORING_PORT=3001
```

### Inicialização

```typescript
import { workflowExecutionService } from "./core/queue/WorkflowExecutionService";

// O serviço é inicializado automaticamente
// Verificar se está pronto
if (workflowExecutionService.isReady()) {
    // Executar workflow
    const executionId = await workflowExecutionService.executeWorkflow({
        workflowId: "workflow-123",
        triggerData: { manual: true },
    });
}
```

## 🎯 Uso da API

### Executar Workflow

```bash
POST /api/executions/execute
{
    "workflowId": "workflow-123",
    "triggerData": { "manual": true },
    "userId": "user-456",
    "organizationId": "org-789"
}
```

### Obter Status

```bash
GET /api/executions/{executionId}/status
```

### Obter Logs

```bash
GET /api/executions/{executionId}/logs
```

### Cancelar Execução

```bash
DELETE /api/executions/{executionId}
```

### Estatísticas das Filas

```bash
GET /api/executions/stats
```

## 🔌 Processadores de Nós

### Criar Processador Personalizado

```typescript
import { NodeProcessor } from "./types";

const CustomProcessor: NodeProcessor = {
    nodeType: "custom_node",

    process: async (data: NodeJobData): Promise<NodeExecutionResult> => {
        // Lógica do processador
        return {
            success: true,
            data: { result: "processed" },
        };
    },

    validate: (config: Record<string, any>): boolean => {
        // Validação da configuração
        return true;
    },
};

// Registrar processador
executionEngine.registerNodeProcessor(CustomProcessor);
```

### Tipos de Processadores

#### Triggers

- `manual_trigger`: Trigger manual
- `webhook_trigger`: Webhook HTTP
- `schedule_trigger`: Agendamento (cron)
- `database_trigger`: Mudanças no banco

#### Actions

- `http_request`: Requisição HTTP
- `send_email`: Envio de email
- `database_save`: Salvar no banco
- `whatsapp_send`: Enviar WhatsApp
- `payment_process`: Processar pagamento

#### Conditions

- `condition_if`: Condição IF
- `validation`: Validação de dados
- `error_handler`: Tratamento de erro
- `retry`: Tentar novamente

#### Utilities

- `delay`: Aguardar tempo
- `data_transform`: Transformar dados
- `clone`: Clonar dados
- `code_execution`: Executar código
- `logger`: Registrar logs

## 📊 Monitoramento

### Logs de Execução

```typescript
interface WorkflowLog {
    id: string;
    timestamp: Date;
    level: "info" | "warn" | "error" | "debug";
    message: string;
    nodeId?: string;
    data?: Record<string, any>;
}
```

### Status de Execução

```typescript
type WorkflowExecutionStatus =
    | "pending"
    | "running"
    | "completed"
    | "failed"
    | "cancelled"
    | "paused";
```

### Estatísticas das Filas

```typescript
interface QueueStats {
    workflow: {
        waiting: number;
        active: number;
        completed: number;
        failed: number;
    };
    node: {
        waiting: number;
        active: number;
        completed: number;
        failed: number;
    };
}
```

## 🚨 Tratamento de Erros

### Retry Automático

- **Máximo de tentativas**: 3 (configurável)
- **Backoff exponencial**: Delay crescente entre tentativas
- **Filtros de erro**: Diferentes estratégias por tipo de erro

### Logs de Erro

- **Logs estruturados**: JSON com contexto completo
- **Stack traces**: Rastreamento de erros
- **Contexto do nó**: Informações do nó que falhou

## 🔄 Escalabilidade

### Workers Múltiplos

- **Workflow Workers**: Processam workflows completos
- **Node Workers**: Processam nós individuais
- **Concorrência configurável**: Por tipo de worker

### Redis Clustering

- **Suporte a cluster**: Múltiplos nós Redis
- **Failover automático**: Alta disponibilidade
- **Persistência**: Jobs não são perdidos

## 🧪 Testes

### Testes Unitários

```bash
npm test -- --testPathPattern=queue
```

### Testes de Integração

```bash
npm test -- --testPathPattern=execution
```

## 📈 Performance

### Métricas

- **Throughput**: Workflows por minuto
- **Latência**: Tempo de execução
- **Taxa de erro**: Percentual de falhas
- **Utilização de recursos**: CPU, memória, Redis

### Otimizações

- **Batch processing**: Processamento em lote
- **Connection pooling**: Pool de conexões Redis
- **Memory management**: Gerenciamento de memória
- **Job prioritization**: Priorização de jobs

## 🔒 Segurança

### Autenticação

- **JWT tokens**: Autenticação via token
- **Rate limiting**: Limitação de taxa
- **Input validation**: Validação de entrada

### Isolamento

- **Sandbox execution**: Execução isolada
- **Resource limits**: Limites de recursos
- **Timeout protection**: Proteção contra timeout

## 🚀 Deploy

### Docker

```dockerfile
FROM node:18-alpine
COPY . .
RUN npm install
CMD ["npm", "start"]
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
    name: workflow-execution
spec:
    replicas: 3
    selector:
        matchLabels:
            app: workflow-execution
    template:
        metadata:
            labels:
                app: workflow-execution
        spec:
            containers:
                - name: workflow-execution
                  image: autoflow/workflow-execution:latest
                  ports:
                      - containerPort: 3001
                  env:
                      - name: REDIS_HOST
                        value: "redis-cluster"
```

## 📚 Recursos Adicionais

- [BullMQ Documentation](https://docs.bullmq.io/)
- [Redis Documentation](https://redis.io/docs/)
- [Node.js Worker Threads](https://nodejs.org/api/worker_threads.html)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 🤝 Contribuição

1. Fork o repositório
2. Crie uma branch para sua feature
3. Implemente os testes
4. Faça commit das mudanças
5. Abra um Pull Request

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.
