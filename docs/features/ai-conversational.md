# IA Conversacional Assistant

## Overview

Sistema de IA conversacional integrado ao AutoFlow que permite criar workflows complexos através de linguagem natural, democratizando a automação empresarial para usuários sem conhecimento técnico.

## Core Functionality

### 1. Chat Conversacional com GPT-4

- **Integração OpenAI**: Utiliza GPT-4 para entendimento avançado de linguagem natural
- **Context-aware**: Mantém contexto da organização e conversas anteriores
- **Linguagem brasileira**: Otimizado para PMEs brasileiras e terminologia local
- **Prompts especializados**: Sistema de prompts focado em automação empresarial

### 2. Geração Automática de Workflows

- **Parser inteligente**: Converte descrições em texto para estruturas de workflow
- **Validação automática**: Verificação de workflows gerados antes da execução
- **Refinamento iterativo**: Permite ajustes baseados em feedback do usuário
- **Templates inteligentes**: Sugestões baseadas em padrões comuns da organização

### 3. Sistema de Contexto Organizacional

- **Análise de workflows existentes**: Aprende com automações já criadas
- **Conhecimento de integrações**: Sabe quais APIs estão disponíveis
- **Padrões de negócio**: Identifica necessidades específicas por setor
- **Histórico conversacional**: Mantém memória de interações anteriores

### 4. Interface de Chat Integrada

- **Chat flutuante**: Botão de acesso rápido no WorkflowCanvas
- **Histórico persistente**: Conversas salvas e recuperáveis
- **Sugestões dinâmicas**: Recomendações contextuais em tempo real
- **Indicadores visuais**: Status de geração de workflows e execução

## Technical Implementation

### Backend Architecture

#### AIService

```typescript
class AIService {
    // Integração com OpenAI GPT-4
    private openai: OpenAI;

    // Histórico de conversas por organização
    private conversationHistory: Map<string, ChatMessage[]>;

    // Processamento de mensagens com contexto
    async processUserMessage(
        userId: string,
        organizationId: string,
        message: string,
        context?: OrganizationContext
    ): Promise<ChatResponse>;

    // Conversão de função GPT para WorkflowDefinition
    private convertToWorkflowDefinition(functionArgs: any, organizationId: string): Promise<WorkflowDefinition>;
}
```

#### API Endpoints

##### Chat Conversacional

```typescript
POST /api/ai/chat
Content-Type: application/json

{
    "message": "Quero automatizar envio de mensagens de boas-vindas",
    "organizationContext": {
        "businessType": "E-commerce",
        "availableIntegrations": ["WhatsApp Business", "PIX"],
        "existingWorkflows": ["follow-up-vendas"],
        "commonPatterns": ["atendimento-cliente"]
    }
}

// Response
{
    "success": true,
    "data": {
        "response": "Perfeito! Criei um workflow que...",
        "workflowGenerated": {
            "id": "wf_12345",
            "name": "Boas-vindas WhatsApp",
            "description": "Envio automático de mensagem...",
            // ... WorkflowDefinition completa
        },
        "suggestions": [
            "Adicionar follow-up após 24h",
            "Integrar com sistema de cupons",
            "Configurar horário comercial"
        ]
    }
}
```

##### Histórico de Conversa

```typescript
GET /api/ai/chat/history

// Response
{
    "success": true,
    "data": {
        "messages": [
            {
                "id": "msg_123",
                "role": "user",
                "content": "Quero automatizar vendas",
                "timestamp": "2024-09-18T15:30:00Z",
                "metadata": {
                    "organizationId": "org_456"
                }
            },
            {
                "id": "msg_124",
                "role": "assistant",
                "content": "Vou criar um workflow de vendas...",
                "timestamp": "2024-09-18T15:30:15Z",
                "metadata": {
                    "workflowGenerated": true,
                    "workflowId": "wf_789"
                }
            }
        ]
    }
}
```

### Frontend Architecture

#### AIChat Component

```typescript
interface AIChatProps {
    isOpen: boolean;
    onClose: () => void;
    onWorkflowGenerated?: (workflowId: string) => void;
}

// Features implementadas:
// - Chat em tempo real com IA
// - Histórico de conversas
// - Sugestões contextuais
// - Indicadores de workflows gerados
// - Interface responsiva e acessível
```

#### React Query Hooks

```typescript
// Hook para enviar mensagens
const sendMessage = useSendChatMessage();

// Hook para histórico
const { data: messages } = useChatHistory();

// Hook para limpar histórico
const clearHistory = useClearChatHistory();
```

### Prompt Engineering

#### System Prompt Structure

```text
Você é um assistente especializado em automação empresarial para a plataforma AutoFlow.

CONTEXTO AUTOFLOW:
- Plataforma SaaS para automação empresarial no Brasil
- Foco em PMEs (pequenas e médias empresas)
- Integrações com WhatsApp Business, PIX, ERPs brasileiros

CAPACIDADES DE AUTOMAÇÃO:
1. TRIGGERS: manual, webhook, schedule
2. ACTIONS: send_message, api_call, save_data, send_notification
3. CONDITIONS: comparações, validações, lógica condicional

INSTRUÇÕES:
- Use linguagem clara e acessível
- Foque em casos de uso práticos para PMEs brasileiras
- Sempre explique o benefício da automação proposta
- Gere workflows com nomenclatura em português
```

#### Function Calling

```typescript
{
    name: 'generate_workflow',
    description: 'Gerar um workflow baseado na descrição do usuário',
    parameters: {
        type: 'object',
        properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            trigger: {
                type: 'object',
                properties: {
                    type: { enum: ['manual', 'webhook', 'schedule'] },
                    config: { type: 'object' }
                }
            },
            actions: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        type: { type: 'string' },
                        name: { type: 'string' },
                        config: { type: 'object' }
                    }
                }
            }
        }
    }
}
```

## Dependencies

### Backend

- **OpenAI**: ^4.0.0 - Integração GPT-4
- **Fastify**: Framework web para endpoints
- **TypeScript**: Tipagem estática
- **Drizzle ORM**: Persistência opcional de conversas

### Frontend

- **React Query**: Gerenciamento de estado servidor
- **Heroicons**: Ícones para interface
- **Tailwind CSS**: Estilização responsiva

## Testing Strategy

### Backend Testing

- **Unit Tests**: Testes para AIService e parsing
- **Integration Tests**: Endpoints de chat e histórico
- **OpenAI Mock Tests**: Simulação de respostas GPT-4

### Frontend Testing

- **Component Tests**: AIChat e interações
- **Hook Tests**: React Query hooks
- **E2E Tests**: Fluxo completo de criação de workflow

### Manual Testing Scenarios

1. **Criação de Workflow Simples**
    - Input: "Quero enviar mensagem de boas-vindas"
    - Expected: Workflow gerado com trigger manual + send_message

2. **Workflow Complexo com Condições**
    - Input: "Enviar cobrança via PIX se cliente não pagou em 3 dias"
    - Expected: Workflow com schedule trigger + conditions + PIX integration

3. **Refinamento Iterativo**
    - Input inicial → Workflow gerado → Feedback → Workflow refinado

## Future Considerations

### Performance & Scaling

- **Caching de respostas**: Redis para respostas comuns
- **Rate limiting**: Controle de uso por organização
- **Streaming responses**: Respostas em tempo real via WebSocket

### Advanced Features

- **Voice Interface**: Integração speech-to-text
- **Multimodal Input**: Suporte a imagens e documentos
- **Fine-tuning**: Modelo específico para domínio AutoFlow
- **Collaborative AI**: Múltiplos assistentes especializados

### Analytics & Learning

- **Usage Analytics**: Métricas de efetividade da IA
- **A/B Testing**: Otimização de prompts
- **Feedback Loop**: Aprendizado contínuo baseado em uso
- **Success Metrics**: Taxa de workflows gerados e executados

### Enterprise Features

- **Custom Prompts**: Personalização por organização
- **Knowledge Base**: Integração com documentação empresarial
- **Compliance**: Auditoria de interações com IA
- **White-label**: Customização da personalidade da IA

---

**Status**: ✅ **Implementado na Fase 8**  
**Priority**: Alta - Diferencial competitivo crucial  
**Dependencies**: Workflow Engine, Execution System, OpenAI API Key
