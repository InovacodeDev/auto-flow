# IA Conversacional - Sistema Completo

## Visão Geral

O sistema de IA Conversacional permite que usuários criem automações através de linguagem natural em português, conversando com Alex, o assistente inteligente do AutoFlow.

## Arquitetura do Sistema

### Backend - Serviços de IA

#### 1. IntelligentPromptSystem

- **Localização**: `apps/backend/src/ai/IntelligentPromptSystem.ts`
- **Responsabilidade**: Sistema de prompts especializados para diferentes contextos
- **Funcionalidades**:
  - Prompts para criação de workflows
  - Prompts para otimização
  - Prompts para troubleshooting
  - Contextos específicos por indústria (e-commerce, serviços, educação)

#### 2. NaturalLanguageWorkflowParser

- **Localização**: `apps/backend/src/ai/NaturalLanguageWorkflowParser.ts`
- **Responsabilidade**: Parser para converter linguagem natural em estruturas de workflow
- **Funcionalidades**:
  - Detecção de intenções (criar, modificar, perguntar, ajuda)
  - Extração de entidades (tempo, integrações, valores, contatos)
  - Identificação de triggers, actions e conditions
  - Cálculo de confiança das interpretações

#### 3. AIConversationalService

- **Localização**: `apps/backend/src/ai/AIConversationalService.ts`
- **Responsabilidade**: Serviço principal de conversação com integração OpenAI
- **Funcionalidades**:
  - Gerenciamento de contexto de conversas
  - Integração com OpenAI GPT-4
  - Processamento de mensagens
  - Geração de sugestões inteligentes
  - Estatísticas de conversação

### API Endpoints

#### POST /api/ai/start-conversation

- **Descrição**: Inicia nova conversa com IA
- **Body**: `{ userId: string, organizationId: string, industry?: string }`
- **Response**: `{ sessionId: string, message: string, suggestions: string[] }`

#### POST /api/ai/message

- **Descrição**: Processa mensagem do usuário
- **Body**: `{ sessionId: string, message: string }`
- **Response**: `{ content: string, metadata: { confidence, suggestions, nextSteps } }`

### Frontend - Interface de Chat

#### AIChatInterface

- **Localização**: `apps/frontend/src/components/ai-chat/AIChatInterface.tsx`
- **Funcionalidades**:
  - Interface de chat em tempo real
  - Sugestões inteligentes contextuais
  - Indicadores de confiança
  - Avaliação de respostas (thumbs up/down)
  - Próximos passos sugeridos
  - Badges para workflows criados

#### AIChatPage

- **Localização**: `apps/frontend/src/pages/AIChatPage.tsx`
- **Funcionalidades**:
  - Página dedicada para chat com IA
  - Layout responsivo
  - Integração com roteador

## Funcionalidades Implementadas

### 1. Processamento de Linguagem Natural

- ✅ Detecção automática de intenções em português
- ✅ Extração de entidades (tempo, valores, contatos, integrações)
- ✅ Identificação de triggers de automação
- ✅ Reconhecimento de ações a serem executadas
- ✅ Análise de condições e regras

### 2. Contexto Inteligente

- ✅ Contextos específicos por indústria
- ✅ Prompts especializados para diferentes necessidades
- ✅ Histórico de conversação mantido
- ✅ Preferências do usuário (complexidade, estilo)

### 3. Interface Conversacional

- ✅ Chat em tempo real
- ✅ Sugestões contextuais
- ✅ Indicadores visuais de confiança
- ✅ Próximos passos sugeridos
- ✅ Avaliação de respostas

## Exemplos de Uso

### Cenário 1: Automação de WhatsApp

**Usuário**: "Quero automatizar atendimento no WhatsApp quando receber mensagem"

**Parser identifica**:

- Intent: create_workflow
- Trigger: whatsapp_received
- Action: send_whatsapp
- Integration: whatsapp_business

**IA responde**: Cria workflow com trigger para mensagem WhatsApp e sugere templates de resposta automática.

### Cenário 2: Cobrança PIX

**Usuário**: "Gerar PIX de R$ 150 toda vez que criar um pedido"

**Parser identifica**:

- Intent: create_workflow
- Trigger: form_submitted (pedido)
- Action: generate_pix
- Amount: 150
- Integration: mercado_pago

**IA responde**: Configura automação PIX com valor fixo e sugere integrações de pagamento.

### Cenário 3: Follow-up de Vendas

**Usuário**: "Enviar email de follow-up 3 dias após venda"

**Parser identifica**:

- Intent: create_workflow
- Trigger: schedule (3 dias)
- Action: send_email
- Condition: delay (3 days)

**IA responde**: Cria workflow com delay e sugere templates de email para follow-up.

## Configuração Técnica

### Variáveis de Ambiente

```bash
OPENAI_API_KEY=sk-... # API Key do OpenAI
```

### Dependências

- `openai`: Cliente oficial OpenAI
- `lucide-react`: Ícones para interface
- Integração com Fastify (backend) e React (frontend)

## Métricas de Qualidade

### Confiança do Parser

- **Alta** (>80%): Intenção e entidades claras
- **Média** (60-80%): Algumas clarificações necessárias
- **Baixa** (<60%): Muitas informações faltando

### Tipos de Intenção

1. **create_workflow**: Criar nova automação
2. **modify_workflow**: Modificar automação existente
3. **ask_question**: Pergunta sobre funcionalidades
4. **get_help**: Pedido de ajuda ou tutorial

## Limitações Atuais

1. **Idioma**: Apenas português brasileiro
2. **Integrações**: Limited às configuradas no sistema
3. **Complexidade**: Workflows muito complexos podem precisar de múltiplas interações
4. **Contexto**: Histórico limitado a sessão atual

## Melhorias Futuras

1. **Múltiplos Idiomas**: Suporte para inglês e espanhol
2. **Memória Persistente**: Histórico entre sessões
3. **Aprendizado**: Machine learning para melhorar parser
4. **Integração Visual**: Mostrar workflow sendo criado em tempo real
5. **Templates Dinâmicos**: Sugestões baseadas no histórico do usuário

## Testes e Validação

### Cenários de Teste

- ✅ Criação de workflows simples
- ✅ Identificação de integrações brasileiras
- ✅ Extração de valores e tempos
- ✅ Sugestões contextuais
- ✅ Tratamento de erros e clarificações

### Métricas de Sucesso

- Tempo médio para criar automação: < 3 minutos
- Taxa de sucesso na primeira tentativa: > 70%
- Satisfação do usuário: > 4.0/5.0

## Documentação Técnica

Para desenvolvedores que queiram estender o sistema:

1. **Adicionar novo contexto de indústria**: Editar `IntelligentPromptSystem.ts`
2. **Melhorar parser**: Adicionar patterns em `NaturalLanguageWorkflowParser.ts`
3. **Novas funcionalidades de chat**: Estender `AIChatInterface.tsx`
4. **Integrar novas APIs**: Adicionar endpoints em `ai.ts`

O sistema é modular e extensível, permitindo fácil adição de novas funcionalidades e melhorias na experiência conversacional.
