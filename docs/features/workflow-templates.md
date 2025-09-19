# Sistema de Templates de Workflow

## Overview

O sistema de templates permite que os usuários comecem rapidamente com workflows pré-configurados para casos de uso comuns. Esta funcionalidade acelera o processo de criação de automações fornecendo estruturas prontas que podem ser personalizadas conforme necessário.

## Core Functionality

### Templates Disponíveis

1. **Template de Onboarding de Cliente**
    - Automatiza o processo de boas-vindas para novos clientes
    - Inclui emails de boas-vindas e dicas de uso
    - Registra histórico do processo no banco de dados

2. **Template de Cobrança Automática**
    - Verifica faturas em atraso diariamente
    - Envia lembretes por email e WhatsApp
    - Sistema de condições para verificar existência de faturas

3. **Template de Lead Nurturing**
    - Cultiva leads através de sequência de emails educativos
    - Inclui delays configuráveis entre envios
    - Progressão estruturada de conteúdo

### Seletor de Templates

O componente `TemplatesSelector` oferece:

- **Interface Modal**: Overlay sobre o canvas para seleção de templates
- **Categorização**: Templates organizados por área (Atendimento, Financeiro, Marketing)
- **Preview Detalhado**: Visualização da estrutura e fluxo do template
- **Aplicação Instantânea**: Carregamento direto do template no canvas

## Technical Implementation

### Arquivos Principais

#### 1. Template Data (`/apps/frontend/src/data/workflowTemplates.ts`)

```typescript
export const onboardingClienteTemplate: WorkflowCanvas = {
  id: 'template-onboarding-cliente',
  name: 'Onboarding Cliente - Template',
  description: 'Automatiza o processo de boas-vindas para novos clientes',
  nodes: [...], // Definição dos nós
  edges: [...], // Conexões entre nós
  canvasData: { viewport: { x: 0, y: 0, zoom: 1 } }
};
```

#### 2. Seletor de Templates (`/apps/frontend/src/components/workflow/TemplatesSelector.tsx`)

- Modal responsivo com layout dividido (lista + preview)
- Validação de seleção antes de aplicação
- Conversão de template para estrutura de workflow editável

#### 3. Integração no Canvas (`/apps/frontend/src/components/workflow/WorkflowCanvas.tsx`)

```typescript
const handleSelectTemplate = useCallback((template: any) => {
  // Converte nodes do template para ReactFlow
  const templateNodes = template.nodes.map(node => ({...}));

  // Aplica template ao canvas
  setNodes(templateNodes);
  setEdges(templateEdges);
  setWorkflowName(template.name);
}, []);
```

#### 4. Toolbar Integration (`/apps/frontend/src/components/workflow/WorkflowToolbar.tsx`)

- Botão "Templates" com ícone distintivo
- Integração opcional (só aparece quando callback fornecido)
- Styling consistente com outros botões da toolbar

### Estrutura dos Templates

Cada template contém:

```typescript
interface WorkflowTemplate {
    id: string; // Identificador único
    name: string; // Nome para exibição
    description: string; // Descrição do propósito
    status: "draft" | "active"; // Status do template
    nodes: WorkflowNode[]; // Nós do workflow
    edges: WorkflowEdge[]; // Conexões entre nós
    canvasData: {
        // Dados do canvas
        viewport: { x: number; y: number; zoom: number };
    };
    version: number; // Versão do template
    createdAt: string; // Timestamp de criação
    updatedAt: string; // Timestamp de atualização
}
```

### Tipos de Nós Utilizados

1. **Trigger Nodes**:
    - `webhook_trigger`: Para capturas via API
    - `schedule_trigger`: Para execução programada (cron)

2. **Action Nodes**:
    - `send_email`: Envio de emails com templates
    - `http_request`: Requisições para APIs externas
    - `database_save`: Persistência de dados

3. **Utility Nodes**:
    - `delay`: Pausas entre ações
    - `condition`: Lógica condicional

4. **Condition Nodes**:
    - Validação de dados e fluxo condicional

## Dependencies

### Internas

- `/types/workflow.ts`: Definições TypeScript
- `/services/workflowService.ts`: Hooks de persistência
- Componentes do construtor visual (NodeLibrary, NodeInspector)

### Externas

- React 18+ (hooks, callbacks)
- @heroicons/react (ícones da interface)
- Tailwind CSS (estilização)
- ReactFlow (estrutura de canvas)

## Testing Strategy

### Testes de Unidade

1. **Validação de Templates**:

    ```typescript
    describe("WorkflowTemplates", () => {
        test("should have valid structure for all templates", () => {
            workflowTemplates.forEach((template) => {
                expect(template).toHaveProperty("id");
                expect(template).toHaveProperty("nodes");
                expect(template).toHaveProperty("edges");
            });
        });
    });
    ```

2. **Aplicação de Templates**:
    ```typescript
    test("should apply template to canvas correctly", () => {
        const template = onboardingClienteTemplate;
        const result = applyTemplate(template);
        expect(result.nodes).toHaveLength(template.nodes.length);
    });
    ```

### Testes de Integração

1. Abertura do modal de templates
2. Seleção e preview de template
3. Aplicação no canvas
4. Preservação do estado após aplicação

### Testes de UI

1. Responsividade do modal em diferentes tamanhos
2. Navegação entre categorias
3. Visualização de preview
4. Feedback visual de seleção

## Future Considerations

### Melhorias Planejadas

1. **Templates Personalizados**:
    - Permitir usuários salvarem seus próprios templates
    - Sistema de compartilhamento entre organizações
    - Versionamento de templates customizados

2. **Template Marketplace**:
    - Biblioteca de templates da comunidade
    - Sistema de avaliação e comentários
    - Templates premium com funcionalidades avançadas

3. **Edição de Templates**:
    - Interface para modificar templates existentes
    - Validação de estrutura e dependências
    - Preview em tempo real de alterações

4. **Categorização Avançada**:
    - Tags para melhor organização
    - Filtros por complexidade e setor
    - Busca textual em templates

5. **Integração com IA**:
    - Sugestão de templates baseada no contexto
    - Geração automática de templates via IA conversacional
    - Otimização de templates existentes

### Considerações Técnicas

1. **Performance**:
    - Lazy loading de templates grandes
    - Cache de templates frequentemente usados
    - Otimização de renderização do preview

2. **Escalabilidade**:
    - Suporte a centenas de templates
    - Paginação na interface de seleção
    - Indexação para busca rápida

3. **Validação**:
    - Schema validation para estrutura de templates
    - Verificação de compatibilidade de versões
    - Detecção de dependências em falta

## Usage Examples

### Aplicação de Template no Canvas

```typescript
// No WorkflowCanvas component
const handleSelectTemplate = (template: WorkflowCanvas) => {
    // Template é automaticamente convertido e aplicado
    setNodes(convertTemplateNodes(template.nodes));
    setEdges(convertTemplateEdges(template.edges));
    setWorkflowName(template.name.replace(" - Template", ""));
};
```

### Criação de Novo Template

```typescript
const createCustomTemplate = (currentNodes, currentEdges) => {
    const newTemplate: WorkflowCanvas = {
        id: `template-${Date.now()}`,
        name: "Meu Template Personalizado",
        description: "Template criado pelo usuário",
        nodes: convertNodesToWorkflowNodes(currentNodes),
        edges: convertEdgesToWorkflowEdges(currentEdges),
        canvasData: { viewport: reactFlowInstance.getViewport() },
        version: 1,
        status: "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    return newTemplate;
};
```

## API Endpoints (Workflow Builder)

O backend expõe endpoints mínimos para listar e instanciar templates de workflow através do `BrazilianWorkflowTemplateManager`.

- `GET /api/workflows/templates`
    - Retorna a lista de templates disponíveis.
    - Exemplo:
        ```bash
        curl http://localhost:3001/api/workflows/templates
        ```

- `GET /api/workflows/templates/:id`
    - Retorna o template identificado por `:id`.
    - Exemplo:
        ```bash
        curl http://localhost:3001/api/workflows/templates/pix_payment_template
        ```

- `POST /api/workflows/templates/:id/instantiate`
    - Instancia um workflow a partir do template especificado.
    - Body (JSON): `{ "organizationId": "org123", "userId": "user123", "customizations": { ... } }`
    - Exemplo:
        ```bash
        curl -X POST http://localhost:3001/api/workflows/templates/pix_payment_template/instantiate \
            -H "Content-Type: application/json" \
            -d '{"organizationId":"org_test","userId":"user_test","customizations":{"name":"Cobrança PIX - Loja X"}}'
        ```

Responses will return a JSON object with the instantiated `workflow` on success (HTTP 201) or an error message.

---

Esta implementação fornece uma base sólida para o sistema de templates, com estrutura extensível para futuras melhorias e integração completa com o sistema de persistência existente.
