# 🔄 Migração HeroIcons → Material Symbols - AutoFlow

## ✅ Status da Migração

### Arquivos Completamente Migrados (Atualizado)

Todos os componentes principais foram migrados para o padrão de Material Symbols usando o componente `MaterialIcon`.

- ✅ Integrações: `IntegrationsAlerts`, `IntegrationsDashboard`, `IntegrationCard`, `IntegrationsOperations`, `IntegrationsStats`
- ✅ Workflow e UI: `WorkflowBuilder`, `WorkflowHelp`, `WorkflowToolbar`, `ExecutionPanel`, `ExecutionMonitor`, `NodeLibrary`, `NodeShowcase`
- ✅ Chat/AI: `ChatInterface`, `ConversationHistory`, `MessageBubble`, `SuggestionsPanel`, `AIChat` (ajustes de tipagem separados)
- ✅ Vários formulários e páginas: `HomePage`, `FeaturesPage`, `IntegrationsPagePublic`, `PricingPage`, `Sidebar`, `LoginForm`, `RegisterForm`

> Observação: A migração incluiu atualização das referências a Material Symbols (classes `material-symbols-*`) e centralização via `MaterialIcon`.

## 📋 Mapeamento de Ícones Aplicado

| HeroIcon                  | Material Symbol | Uso                  |
| ------------------------- | --------------- | -------------------- |
| `SparklesIcon`            | `auto_awesome`  | IA, Assistente       |
| `XMarkIcon`               | `close`         | Fechar modais/panels |
| `QuestionMarkCircleIcon`  | `help`          | Ajuda                |
| `FunnelIcon`              | `filter_list`   | Filtros              |
| `CheckCircleIcon`         | `check_circle`  | Status positivo      |
| `ExclamationCircleIcon`   | `error`         | Status de erro       |
| `Cog6ToothIcon`           | `settings`      | Configurações        |
| `TrashIcon`               | `delete`        | Exclusão             |
| `ArrowPathIcon`           | `refresh`       | Recarregar           |
| `ExclamationTriangleIcon` | `warning`       | Avisos               |
| `PaperAirplaneIcon`       | `send`          | Enviar mensagem      |

## 🔄 Arquivos Pendentes (17 restantes)

### Componentes AI:

- `ConversationHistory.tsx`
- `MessageBubble.tsx`
- `SuggestionsPanel.tsx`

### Componentes Workflow:

- `WorkflowStatus.tsx`
- `WorkflowVersioning.tsx`
- `WorkflowToolbar.tsx`
- `CustomNodes.tsx`
- `ExecutionMonitor.tsx`
- `ExecutionPanel.tsx`
- `NodeLibrary.tsx`
- `NodeInspector.tsx`

### Nodes:

- `ActionNodes.tsx`
- `UtilityNodes.tsx`
- `TriggerNodes.tsx`
- `ConditionNodes.tsx`
- `BaseNode.tsx`

### ✅ Integrations (CONCLUÍDO 4/4):

- ✅ `IntegrationsOperations.tsx` - filter_list, calendar_today, schedule, refresh
- ✅ `IntegrationsStats.tsx` - trending_up, trending_down, show_chart
- ✅ `IntegrationCard.tsx` - visibility, settings, refresh, check_circle, warning
- ✅ `IntegrationsDashboard.tsx` - bar_chart, cloud, schedule, warning, download, delete
- ✅ `IntegrationsAlerts.tsx` - warning, info, cancel, check_circle

## 🎯 Próximos Passos

1. **Completar migração dos arquivos restantes** usando o padrão estabelecido:

    ```typescript
    // Antes
    import { IconName } from "@heroicons/react/24/outline";
    <IconName className="w-5 h-5" />

    // Depois
    import { MaterialIcon } from "../ui/MaterialIcon";
    <MaterialIcon icon="material_name" className="text-current" size={20} />
    ```

2. **Remover dependência** do package.json:

    ```bash
    pnpm remove @heroicons/react
    ```

3. **Verificar compilação** sem erros:
    ```bash
    pnpm run build
    ```

## 🛠️ Script de Automação

Um script `replace-icons.sh` foi criado na raiz do projeto para automatizar substituições em massa. Use com cuidado e sempre teste após execução.

## 📝 Padrões Aplicados

### Imports:

```typescript
import { MaterialIcon } from "../ui/MaterialIcon";
```

### Uso:

```typescript
<MaterialIcon
  icon="material_symbol_name"
  className="text-current"
  size={20}
/>
```

### Cores:

- Use `text-current` para herdar cor do contexto
- Use classes específicas quando necessário: `text-red-500`, `text-green-500`, etc.

### Tamanhos:

- `size={16}` para ícones pequenos (w-4 h-4)
- `size={20}` para ícones médios (w-5 h-5)
- `size={24}` para ícones grandes (w-6 h-6)
- `size={48}` para ícones extra grandes (w-12 h-12)

---

**Status**: 🟡 Em progresso - 11/28 arquivos migrados (39% concluído)
**Próxima ação**: Continuar migração dos arquivos de componentes de integrations e workflow
