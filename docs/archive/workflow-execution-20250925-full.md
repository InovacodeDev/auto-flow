````````markdown
# Execução de Workflows — Arquivo completo (2025-09-25)

Esta é uma cópia arquivada da versão atual de `docs/features/workflow-execution.md` criada em 2025-09-25.

---

COPY OF ORIGINAL CONTENT BELOW:

```````markdown
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

``````sql
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
`````markdown

    # Execução de Workflows (Consolidado)

    Este arquivo foi consolidado. O resumo canônico e os detalhes de implementação estão em:

    - ../consolidated/workflow-engine-summary.md

    A versão completa e não editada está arquivada em:

    - ../../archive/workflow-execution-full.md

    Resumo rápido:

    - Fluxo de execução gerenciado pelo WorkflowEngine.
    - Endpoints principais: `POST /api/workflows/:id/execute`, `GET /api/workflows/:id/executions`, `GET /api/workflows/executions/:executionId/logs`.
    - UI: ExecutionPanel, integração com WorkflowCanvas e botões de execução.
    - Banco: tabelas `workflow_executions` e `workflow_execution_logs` (ver arquivo arquivado para DDL completa).
    - Testes e monitoração: unit/integration/e2e, métricas e alertas.

    Para informações técnicas completas, consulte a cópia arquivada.

    ````
{
``````
```````
````````

```

```

````

```

```
````
