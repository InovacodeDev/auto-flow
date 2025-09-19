import { OpenAI } from "openai";
import { IntelligentPromptSystem } from "./IntelligentPromptSystem";
import { NaturalLanguageWorkflowParser, ParsedWorkflow, ParserContext } from "./NaturalLanguageWorkflowParser";

/**
 * Serviço principal para conversação inteligente com IA
 * Integra OpenAI GPT-4 com sistema de prompts inteligentes e parser de natural language
 */

export interface ConversationContext {
    userId: string;
    organizationId: string;
    industry?: string;
    userHistory: ConversationMessage[];
    currentWorkflow?: any;
    availableIntegrations: string[];
    organizationSize: "micro" | "small" | "medium";
    preferences: {
        language: string;
        complexity: "beginner" | "intermediate" | "advanced";
        communicationStyle: "formal" | "casual" | "technical";
    };
}

export interface ConversationMessage {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: Date;
    metadata?: {
        intent?: string;
        entities?: any[];
        confidence?: number;
        workflowGenerated?: boolean;
    };
}

export interface AIResponse {
    message: string;
    suggestions: string[];
    workflowGenerated?: ParsedWorkflow;
    nextSteps: string[];
    confidence: number;
    requiresUserInput?: {
        type: "confirmation" | "additional_info" | "clarification";
        prompt: string;
        options?: string[];
    };
}

export interface WorkflowGenerationRequest {
    instruction: string;
    context: ConversationContext;
    existingWorkflow?: any;
    mode: "create" | "modify" | "optimize";
}

class AIConversationalService {
    private openai: OpenAI;
    private promptSystem: IntelligentPromptSystem;
    private parser: NaturalLanguageWorkflowParser;
    private conversations: Map<string, ConversationContext> = new Map();

    constructor() {
        const openaiKey = process.env["OPENAI_API_KEY"];

        if (!openaiKey && process.env["NODE_ENV"] === "production") {
            throw new Error("OPENAI_API_KEY environment variable is required in production");
        }

        this.openai = new OpenAI({
            apiKey: openaiKey || "sk-fake-key-for-development",
        });

        this.promptSystem = new IntelligentPromptSystem();
        this.parser = new NaturalLanguageWorkflowParser();
    }

    /**
     * Inicia ou continua uma conversa com o usuário
     */
    async processMessage(userId: string, message: string, context?: Partial<ConversationContext>): Promise<AIResponse> {
        try {
            // Recuperar ou criar contexto da conversa
            const conversationContext = this.getOrCreateContext(userId, context);

            // Processar mensagem com parser
            const parserContext: ParserContext = {
                industry: conversationContext.industry || "geral",
                userHistory: conversationContext.userHistory.map((m) => m.content),
                availableIntegrations: conversationContext.availableIntegrations,
                organizationSize: conversationContext.organizationSize,
            };

            const parsedMessage = await this.parser.parseWorkflowInstruction(message, parserContext);

            // Adicionar mensagem do usuário ao histórico
            const userMessage: ConversationMessage = {
                id: this.generateMessageId(),
                role: "user",
                content: message,
                timestamp: new Date(),
                metadata: {
                    intent: parsedMessage.intent,
                    entities: parsedMessage.entities,
                    confidence: parsedMessage.confidence,
                },
            };

            conversationContext.userHistory.push(userMessage);

            // Gerar resposta baseada no intent
            const response = await this.generateResponse(parsedMessage, conversationContext);

            // Adicionar resposta da IA ao histórico
            const assistantMessage: ConversationMessage = {
                id: this.generateMessageId(),
                role: "assistant",
                content: response.message,
                timestamp: new Date(),
                metadata: {
                    workflowGenerated: !!response.workflowGenerated,
                    confidence: response.confidence,
                },
            };

            conversationContext.userHistory.push(assistantMessage);

            // Atualizar contexto
            this.conversations.set(userId, conversationContext);

            return response;
        } catch (error) {
            console.error("Error processing message:", error);
            return {
                message: "Desculpe, tive um problema ao processar sua mensagem. Pode tentar novamente?",
                suggestions: ["Reformule sua pergunta", "Seja mais específico sobre o que deseja automatizar"],
                nextSteps: ["Tentar novamente com informações mais claras"],
                confidence: 0.1,
            };
        }
    }

    /**
     * Gera resposta inteligente baseada no intent parsed
     */
    private async generateResponse(parsedMessage: ParsedWorkflow, context: ConversationContext): Promise<AIResponse> {
        switch (parsedMessage.intent) {
            case "create_workflow":
                return await this.handleWorkflowCreation(parsedMessage, context);

            case "modify_workflow":
                return await this.handleWorkflowModification(parsedMessage, context);

            case "ask_question":
                return await this.handleQuestion(parsedMessage, context);

            case "get_help":
                return await this.handleHelpRequest(parsedMessage, context);

            default:
                return await this.handleGenericConversation(parsedMessage, context);
        }
    }

    /**
     * Manipula criação de workflow
     */
    private async handleWorkflowCreation(
        parsedMessage: ParsedWorkflow,
        context: ConversationContext
    ): Promise<AIResponse> {
        if (!parsedMessage.workflow) {
            return {
                message:
                    "Entendi que você quer criar uma automação, mas preciso de mais detalhes. Pode me explicar melhor o que deseja automatizar?",
                suggestions: parsedMessage.suggestions,
                nextSteps: ["Descrever o processo que deseja automatizar", "Especificar quando deve ser executado"],
                confidence: 0.3,
                requiresUserInput: {
                    type: "additional_info",
                    prompt: "Descreva detalhadamente o processo que gostaria de automatizar:",
                },
            };
        }

        // Gerar prompt contextual para criação
        const workflowConfig: any = {
            userPrompt: parsedMessage.workflow.description,
            industry: context.industry || "geral",
            complexity:
                context.preferences.complexity === "beginner"
                    ? "simple"
                    : context.preferences.complexity === "advanced"
                      ? "advanced"
                      : "intermediate",
            existingIntegrations: context.availableIntegrations,
            organizationSize: context.organizationSize,
        };

        const systemPrompt = this.promptSystem.generateWorkflowPrompt(workflowConfig);

        // Buscar resposta do OpenAI
        const openaiResponse = await this.callOpenAI(systemPrompt, context);

        // Verificar se o workflow precisa de mais informações
        const needsMoreInfo = parsedMessage.confidence < 0.7;

        if (needsMoreInfo) {
            return {
                message: `${openaiResponse}\n\nPara criar um workflow mais preciso, preciso de algumas informações adicionais:`,
                suggestions: parsedMessage.suggestions,
                nextSteps: [
                    "Confirmar os detalhes do workflow",
                    "Especificar integrações necessárias",
                    "Definir condições e regras",
                ],
                confidence: parsedMessage.confidence,
                workflowGenerated: parsedMessage,
                requiresUserInput: {
                    type: "clarification",
                    prompt: "Pode esclarecer estes pontos para eu criar o workflow perfeito?",
                    options: parsedMessage.suggestions,
                },
            };
        }

        return {
            message: `${openaiResponse}\n\nWorkflow criado com sucesso! Gostaria de testá-lo ou fazer algum ajuste?`,
            suggestions: ["Testar o workflow", "Ajustar condições", "Adicionar mais ações", "Criar outro workflow"],
            nextSteps: ["Testar e validar", "Implementar no sistema", "Monitorar execução"],
            confidence: parsedMessage.confidence,
            workflowGenerated: parsedMessage,
        };
    }

    /**
     * Manipula modificação de workflow
     */
    private async handleWorkflowModification(
        _parsedMessage: ParsedWorkflow,
        context: ConversationContext
    ): Promise<AIResponse> {
        const systemPrompt = this.promptSystem.generateOptimizationPrompt(context.currentWorkflow || "workflow atual", [
            "melhorar performance",
            "reduzir erros",
            "adicionar automações",
        ]);

        const openaiResponse = await this.callOpenAI(systemPrompt, context);

        return {
            message: openaiResponse,
            suggestions: ["Aplicar modificações sugeridas", "Ver outras otimizações", "Testar mudanças"],
            nextSteps: ["Implementar melhorias", "Testar modificações", "Validar resultados"],
            confidence: 0.8,
        };
    }

    /**
     * Manipula perguntas gerais
     */
    private async handleQuestion(_parsedMessage: ParsedWorkflow, context: ConversationContext): Promise<AIResponse> {
        const lastUserMessage = context.userHistory.filter((m) => m.role === "user").slice(-1)[0]?.content || "";

        const systemPrompt = `Você é um especialista em automação para PMEs brasileiras. 
        Responda esta pergunta de forma clara e prática: "${lastUserMessage}"
        
        Contexto do usuário:
        - Setor: ${context.industry || "geral"}
        - Porte: ${context.organizationSize}
        - Integrações disponíveis: ${context.availableIntegrations.join(", ")}
        
        Forneça uma resposta útil e sugira automações relacionadas quando relevante.`;

        const openaiResponse = await this.callOpenAI(systemPrompt, context);

        return {
            message: openaiResponse,
            suggestions: ["Criar automação relacionada", "Ver exemplos práticos", "Fazer outra pergunta"],
            nextSteps: ["Explorar automações relacionadas", "Implementar sugestões"],
            confidence: 0.8,
        };
    }

    /**
     * Manipula pedidos de ajuda
     */
    private async handleHelpRequest(_parsedMessage: ParsedWorkflow, context: ConversationContext): Promise<AIResponse> {
        const helpPrompt = this.promptSystem.generateTroubleshootingPrompt("pedido de ajuda geral", {
            industry: context.industry || "geral",
            organizationSize: context.organizationSize,
            availableIntegrations: context.availableIntegrations,
        });

        const openaiResponse = await this.callOpenAI(helpPrompt, context);

        return {
            message: openaiResponse,
            suggestions: ["Ver tutoriais", "Exemplos de automações", "Falar com suporte", "Começar com template"],
            nextSteps: ["Escolher por onde começar", "Seguir tutorial guiado", "Usar template pronto"],
            confidence: 0.9,
        };
    }

    /**
     * Manipula conversação genérica
     */
    private async handleGenericConversation(
        _parsedMessage: ParsedWorkflow,
        context: ConversationContext
    ): Promise<AIResponse> {
        const lastUserMessage = context.userHistory.filter((m) => m.role === "user").slice(-1)[0]?.content || "";

        const systemPrompt = `Você é um assistente de automação amigável para PMEs brasileiras.
        O usuário disse: "${lastUserMessage}"
        
        Responda de forma conversacional e tente direcioná-lo para criar automações úteis.
        Seja proativo em sugerir automações baseadas no contexto.`;

        const openaiResponse = await this.callOpenAI(systemPrompt, context);

        return {
            message: openaiResponse,
            suggestions: [
                "Criar minha primeira automação",
                "Ver templates disponíveis",
                "Integrar com WhatsApp",
                "Configurar PIX automático",
            ],
            nextSteps: ["Explorar possibilidades", "Começar com automação simples"],
            confidence: 0.6,
        };
    }

    /**
     * Chama a API do OpenAI
     */
    private async callOpenAI(systemPrompt: string, context: ConversationContext): Promise<string> {
        try {
            const messages: any[] = [
                {
                    role: "system",
                    content: systemPrompt,
                },
            ];

            // Adicionar histórico recente da conversa (últimas 5 mensagens)
            const recentHistory = context.userHistory.slice(-5);
            recentHistory.forEach((msg) => {
                messages.push({
                    role: msg.role,
                    content: msg.content,
                });
            });

            const completion = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages,
                max_tokens: 500,
                temperature: 0.7,
                presence_penalty: 0.1,
                frequency_penalty: 0.1,
            });

            return (
                completion.choices[0]?.message?.content ||
                "Desculpe, não consegui gerar uma resposta adequada. Pode tentar reformular sua pergunta?"
            );
        } catch (error) {
            console.error("OpenAI API error:", error);
            return "Estou com dificuldades para processar sua solicitação no momento. Pode tentar novamente em alguns instantes?";
        }
    }

    /**
     * Obtém ou cria contexto de conversa
     */
    private getOrCreateContext(userId: string, partialContext?: Partial<ConversationContext>): ConversationContext {
        let context = this.conversations.get(userId);

        if (!context) {
            context = {
                userId,
                organizationId: partialContext?.organizationId || "default",
                industry: partialContext?.industry || "geral",
                userHistory: [],
                availableIntegrations: partialContext?.availableIntegrations || [
                    "whatsapp_business",
                    "email",
                    "pix_mercado_pago",
                    "google_sheets",
                ],
                organizationSize: partialContext?.organizationSize || "small",
                preferences: {
                    language: "pt-BR",
                    complexity: "intermediate",
                    communicationStyle: "casual",
                    ...partialContext?.preferences,
                },
            };

            this.conversations.set(userId, context);
        }

        // Atualizar contexto com informações parciais se fornecidas
        if (partialContext && context) {
            Object.assign(context, partialContext);
        }

        return context;
    }

    /**
     * Gera ID único para mensagens
     */
    private generateMessageId(): string {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Obtém sugestões inteligentes baseadas no contexto
     */
    async getIntelligentSuggestions(userId: string): Promise<string[]> {
        const context = this.conversations.get(userId);
        if (!context) {
            return [
                "Automatizar atendimento no WhatsApp",
                "Criar cobrança automática via PIX",
                "Integrar com planilhas do Google",
                "Agendar envio de emails",
            ];
        }

        // Sugestões baseadas no histórico e contexto
        const suggestions: string[] = [];

        if (context.industry === "ecommerce") {
            suggestions.push(
                "Automatizar follow-up de carrinho abandonado",
                "Notificar sobre produtos em falta",
                "Enviar confirmação de pedido via WhatsApp"
            );
        } else if (context.industry === "servicos") {
            suggestions.push(
                "Confirmar agendamentos automaticamente",
                "Enviar lembretes de consulta",
                "Coletar feedback pós-atendimento"
            );
        } else {
            suggestions.push(
                "Automatizar resposta inicial no WhatsApp",
                "Criar workflow de boas-vindas",
                "Integrar com sistema de vendas"
            );
        }

        return suggestions;
    }

    /**
     * Limpa contexto de conversa
     */
    clearConversation(userId: string): boolean {
        return this.conversations.delete(userId);
    }

    /**
     * Obtém estatísticas da conversa
     */
    getConversationStats(userId: string) {
        const context = this.conversations.get(userId);
        if (!context) return null;

        return {
            messageCount: context.userHistory.length,
            workflowsCreated: context.userHistory.filter((m) => m.metadata?.workflowGenerated).length,
            lastActivity: context.userHistory[context.userHistory.length - 1]?.timestamp,
            averageConfidence:
                context.userHistory
                    .filter((m) => m.metadata?.confidence)
                    .reduce((sum, m) => sum + (m.metadata?.confidence || 0), 0) /
                    context.userHistory.filter((m) => m.metadata?.confidence).length || 0,
        };
    }
}

export { AIConversationalService };
