# AutoFlow - IA Conversacional Assistant

## Overview

A IA Conversacional é o diferencial competitivo do AutoFlow, permitindo que usuários criem automações complexas através de linguagem natural em português, sem necessidade de conhecimento técnico.

## Core Functionality

- **Criação de Workflows**: Geração automática de workflows baseada em descrição natural
- **Otimização Inteligente**: Sugestões de melhorias para workflows existentes
- **Troubleshooting**: Diagnóstico e correção automática de problemas
- **Templates Contextuais**: Recomendação de templates baseada no contexto empresarial
- **Aprendizado Contínuo**: Melhoria baseada em feedback e uso real

## Technical Implementation

### AI Assistant Architecture

```typescript
class AutoFlowAIAssistant {
    private openai: OpenAI;
    private promptTemplates: PromptTemplateRepository;
    private businessContext: BusinessContextAnalyzer;
    private workflowGenerator: WorkflowGenerator;

    async createWorkflowFromNaturalLanguage(
        userMessage: string,
        organizationContext: OrganizationContext
    ): Promise<WorkflowSuggestion> {
        // 1. Analyze business context
        const context = await this.businessContext.analyze(organizationContext);

        // 2. Process natural language intent
        const intent = await this.processUserIntent(userMessage, context);

        // 3. Generate workflow structure
        const workflow = await this.workflowGenerator.generate(intent, context);

        // 4. Validate and optimize
        const optimizedWorkflow = await this.optimizeWorkflow(workflow);

        return {
            workflow: optimizedWorkflow,
            confidence: intent.confidence,
            explanation: this.generateExplanation(workflow, userMessage),
            alternatives: await this.generateAlternatives(intent, context),
        };
    }

    private async processUserIntent(message: string, context: BusinessContext): Promise<UserIntent> {
        const prompt = this.promptTemplates.getAutomationCreationPrompt({
            userMessage: message,
            businessType: context.industry,
            existingIntegrations: context.availableIntegrations,
            language: "pt-BR",
        });

        const response = await this.openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [
                { role: "system", content: prompt.systemMessage },
                { role: "user", content: message },
            ],
            functions: [
                {
                    name: "create_automation_intent",
                    description: "Extract automation intent from user message",
                    parameters: {
                        type: "object",
                        properties: {
                            triggerType: {
                                type: "string",
                                enum: ["webhook", "schedule", "whatsapp_received", "email_received"],
                            },
                            actions: { type: "array", items: { type: "string" } },
                            conditions: { type: "array", items: { type: "object" } },
                            confidence: { type: "number", minimum: 0, maximum: 1 },
                            clarificationNeeded: { type: "array", items: { type: "string" } },
                        },
                    },
                },
            ],
            function_call: { name: "create_automation_intent" },
        });

        return JSON.parse(response.choices[0].message.function_call.arguments);
    }
}
```

### Prompt Templates System

```typescript
interface AIPromptTemplate {
    id: string;
    name: string;
    context: "automation_creation" | "optimization" | "troubleshooting" | "explanation";

    systemMessage: string;
    userMessageTemplate: string;
    variables: string[];

    expectedOutput: "workflow_json" | "suggestion" | "analysis" | "explanation";

    // Brazilian business context
    businessContext: {
        industries: string[];
        commonIntegrations: string[];
        regulations: string[];
    };
}

class PromptTemplateRepository {
    // Template para criação de automações
    getAutomationCreationPrompt(context: PromptContext): AIPromptTemplate {
        return {
            id: "automation_creation_v1",
            name: "Criação de Automação",
            context: "automation_creation",

            systemMessage: `
Você é um especialista em automação empresarial para PMEs brasileiras.
Seu objetivo é criar workflows de automação baseados em descrições em linguagem natural.

CONTEXTO EMPRESARIAL:
- Segmento: ${context.businessType}
- Integrações disponíveis: ${context.existingIntegrations.join(", ")}
- Regulamentações: LGPD, PIX, WhatsApp Business Policy

DIRETRIZES:
1. Priorize simplicidade e clareza para usuários não-técnicos
2. Sugira integrações brasileiras relevantes (WhatsApp, PIX, ERPs nacionais)
3. Considere compliance com LGPD em todas as automações
4. Forneça explicações em português claro
5. Identifique oportunidades de ROI mensurável

FORMATO DE RESPOSTA:
Use a função create_automation_intent para estruturar a resposta.
      `,

            userMessageTemplate: context.userMessage,
            variables: ["businessType", "existingIntegrations", "userMessage"],
            expectedOutput: "workflow_json",
        };
    }

    // Template para otimização de workflows
    getOptimizationPrompt(workflow: AutoFlowWorkflow): AIPromptTemplate {
        return {
            id: "workflow_optimization_v1",
            name: "Otimização de Workflow",
            context: "optimization",

            systemMessage: `
Analise o workflow fornecido e sugira otimizações específicas para PMEs brasileiras.

CRITÉRIOS DE OTIMIZAÇÃO:
1. Performance: Reduzir tempo de execução
2. Confiabilidade: Minimizar pontos de falha
3. ROI: Maximizar retorno sobre investimento
4. Compliance: Garantir aderência à LGPD
5. UX: Melhorar experiência do usuário final

FOQUE EM:
- Parallelização de actions quando possível
- Retry strategies inteligentes
- Validação de dados robusta
- Integração com ferramentas brasileiras
- Métricas de sucesso mensuráveis
      `,

            userMessageTemplate: JSON.stringify(workflow, null, 2),
            variables: ["workflow"],
            expectedOutput: "suggestion",
        };
    }
}
```

### Business Context Analyzer

```typescript
class BusinessContextAnalyzer {
    async analyze(org: OrganizationContext): Promise<BusinessContext> {
        return {
            industry: org.industry,
            size: org.employeeCount,

            // Analyze current integrations
            availableIntegrations: await this.getAvailableIntegrations(org),

            // Identify pain points based on industry
            commonPainPoints: this.getIndustryPainPoints(org.industry),

            // Suggest relevant automations
            recommendedAutomations: await this.getRecommendations(org),

            // Compliance requirements
            complianceRequirements: this.getComplianceRequirements(org.industry),

            // ROI opportunities
            roiOpportunities: this.calculateROIOpportunities(org),
        };
    }

    private getIndustryPainPoints(industry: string): string[] {
        const painPointsMap: Record<string, string[]> = {
            ecommerce: [
                "Gestão de pedidos manual",
                "Atendimento WhatsApp não automatizado",
                "Acompanhamento de entrega manual",
                "Recuperação de carrinho abandono",
            ],
            servicos: [
                "Agendamento manual",
                "Follow-up de clientes manual",
                "Cobrança e faturamento manual",
                "Relatórios de produtividade manuais",
            ],
            retail: [
                "Controle de estoque manual",
                "Promoções e campanhas manuais",
                "Atendimento pós-venda não sistematizado",
                "Análise de vendas manual",
            ],
        };

        return painPointsMap[industry] || [];
    }
}
```

### Conversation Flow Management

```typescript
interface ConversationContext {
    sessionId: string;
    userId: string;
    organizationId: string;

    currentWorkflow?: Partial<AutoFlowWorkflow>;
    clarificationQueue: string[];
    conversationHistory: ConversationMessage[];

    state: "initial" | "clarifying" | "generating" | "reviewing" | "completed";
}

class ConversationManager {
    async handleUserMessage(message: string, context: ConversationContext): Promise<ConversationResponse> {
        switch (context.state) {
            case "initial":
                return await this.handleInitialRequest(message, context);

            case "clarifying":
                return await this.handleClarification(message, context);

            case "reviewing":
                return await this.handleReview(message, context);

            default:
                throw new Error(`Invalid conversation state: ${context.state}`);
        }
    }

    private async handleInitialRequest(message: string, context: ConversationContext): Promise<ConversationResponse> {
        const suggestion = await this.aiAssistant.createWorkflowFromNaturalLanguage(message, {
            organizationId: context.organizationId,
        });

        if (suggestion.confidence < 0.7) {
            // Need clarification
            context.state = "clarifying";
            context.clarificationQueue = suggestion.clarificationNeeded || [];

            return {
                type: "clarification_needed",
                message: "Entendi que você quer criar uma automação, mas preciso de mais detalhes:",
                questions: context.clarificationQueue,
                partialWorkflow: suggestion.workflow,
            };
        }

        // High confidence - present workflow for review
        context.state = "reviewing";
        context.currentWorkflow = suggestion.workflow;

        return {
            type: "workflow_generated",
            message: suggestion.explanation,
            workflow: suggestion.workflow,
            alternatives: suggestion.alternatives,
        };
    }
}
```

## Dependencies

- **OpenAI GPT-4**: Processamento de linguagem natural
- **Prompt Templates**: Sistema de templates contextuais
- **Business Context**: Análise de contexto empresarial
- **Workflow Generator**: Geração automática de workflows
- **Conversation Manager**: Gestão de conversas multi-turn

## Testing Strategy

- **Prompt Testing**: Validação de qualidade dos prompts
- **Intent Recognition**: Testes de precisão de interpretação
- **Workflow Generation**: Validação de workflows gerados
- **Conversation Flow**: Testes de fluxos conversacionais
- **Performance Testing**: Latência e throughput das chamadas de IA

## Future Considerations

- **Fine-tuning**: Modelo específico para domínio de automação
- **Multimodal Input**: Suporte a imagens e documentos
- **Voice Interface**: Integração com speech-to-text
- **Collaborative AI**: Múltiplos assistentes especializados
- **Learning Loop**: Feedback automático para melhoria contínua

---

**Status**: 🔄 A ser implementado na Sprint 5-6
**Dependencies**: Workflow engine, integration system, business context analyzer
