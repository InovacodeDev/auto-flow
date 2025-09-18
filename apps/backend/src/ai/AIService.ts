import OpenAI from "openai";
import { WorkflowDefinition } from "../core/engine/types";

export interface ChatMessage {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: Date;
    metadata?: {
        workflowGenerated?: boolean;
        workflowId?: string;
        organizationId?: string;
    };
}

export interface WorkflowGenerationResult {
    success: boolean;
    workflow?: WorkflowDefinition;
    explanation?: string;
    suggestions?: string[];
    errors?: string[];
}

export interface OrganizationContext {
    id: string;
    existingWorkflows: string[];
    availableIntegrations: string[];
    businessType?: string;
    commonPatterns?: string[];
}

/**
 * Serviço de IA Conversacional para AutoFlow
 * Integra OpenAI GPT-4 para criação de workflows via linguagem natural
 */
export class AIService {
    private openai: OpenAI;
    private conversationHistory: Map<string, ChatMessage[]> = new Map();

    constructor() {
        const apiKey = process.env["OPENAI_API_KEY"];
        if (!apiKey) {
            throw new Error("OPENAI_API_KEY environment variable is required");
        }

        this.openai = new OpenAI({
            apiKey: apiKey,
        });
    }

    /**
     * Processar mensagem do usuário e gerar resposta
     */
    async processUserMessage(
        userId: string,
        organizationId: string,
        message: string,
        context?: OrganizationContext
    ): Promise<{
        response: string;
        workflowGenerated?: WorkflowDefinition;
        suggestions?: string[];
    }> {
        try {
            // Obter histórico da conversa
            const conversationKey = `${userId}_${organizationId}`;
            const history = this.conversationHistory.get(conversationKey) || [];

            // Adicionar mensagem do usuário ao histórico
            const userMessage: ChatMessage = {
                id: this.generateMessageId(),
                role: "user",
                content: message,
                timestamp: new Date(),
                metadata: { organizationId },
            };
            history.push(userMessage);

            // Construir prompt do sistema com contexto
            const systemPrompt = this.buildSystemPrompt(context);

            // Preparar mensagens para OpenAI
            const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
                { role: "system", content: systemPrompt },
                ...history.slice(-10).map((msg) => ({
                    role: msg.role as "user" | "assistant",
                    content: msg.content,
                })),
            ];

            // Chamar OpenAI
            const completion = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages,
                temperature: 0.7,
                max_tokens: 2000,
                functions: [
                    {
                        name: "generate_workflow",
                        description: "Gerar um workflow baseado na descrição do usuário",
                        parameters: {
                            type: "object",
                            properties: {
                                name: { type: "string", description: "Nome do workflow" },
                                description: { type: "string", description: "Descrição do workflow" },
                                trigger: {
                                    type: "object",
                                    properties: {
                                        type: { type: "string", enum: ["manual", "webhook", "schedule"] },
                                        config: { type: "object" },
                                    },
                                },
                                actions: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            type: { type: "string" },
                                            name: { type: "string" },
                                            config: { type: "object" },
                                        },
                                    },
                                },
                            },
                            required: ["name", "description", "trigger", "actions"],
                        },
                    },
                ],
                function_call: "auto",
            });

            const choice = completion.choices[0];
            let response = choice.message?.content || "";
            let workflowGenerated: WorkflowDefinition | undefined;

            // Verificar se foi gerado um workflow
            if (choice.message?.function_call?.name === "generate_workflow") {
                try {
                    const functionArgs = JSON.parse(choice.message.function_call.arguments || "{}");
                    workflowGenerated = await this.convertToWorkflowDefinition(functionArgs, organizationId);
                    response =
                        `Workflow "${functionArgs.name}" gerado com sucesso! ` +
                        `Este workflow ${functionArgs.description.toLowerCase()}. ` +
                        `Você pode revisar e executar o workflow no canvas.`;
                } catch (error) {
                    response = "Desculpe, houve um erro ao gerar o workflow. Pode tentar reformular sua solicitação?";
                }
            }

            // Adicionar resposta ao histórico
            const assistantMessage: ChatMessage = {
                id: this.generateMessageId(),
                role: "assistant",
                content: response,
                timestamp: new Date(),
                metadata: {
                    organizationId,
                    workflowGenerated: !!workflowGenerated,
                    ...(workflowGenerated ? { workflowId: workflowGenerated.id } : {}),
                },
            };
            history.push(assistantMessage);

            // Atualizar histórico
            this.conversationHistory.set(conversationKey, history);

            // Gerar sugestões para próximas ações
            const suggestions = await this.generateSuggestions(message, context);

            return {
                response,
                ...(workflowGenerated ? { workflowGenerated } : {}),
                suggestions,
            };
        } catch (error) {
            console.error("Erro no AIService:", error);
            return {
                response: "Desculpe, houve um erro interno. Tente novamente em alguns momentos.",
                suggestions: ["Como posso automatizar envio de mensagens?", "Criar workflow de vendas"],
            };
        }
    }

    /**
     * Construir prompt do sistema com contexto organizacional
     */
    private buildSystemPrompt(context?: OrganizationContext): string {
        let systemPrompt = `Você é um assistente especializado em automação empresarial para a plataforma AutoFlow. 
Sua função é ajudar usuários brasileiros a criar workflows de automação de forma conversacional.

CONTEXTO AUTOFLOW:
- Plataforma SaaS para automação empresarial no Brasil
- Foco em PMEs (pequenas e médias empresas)
- Integrações com WhatsApp Business, PIX, ERPs brasileiros
- Workflows podem incluir: triggers, actions, conditions, loops

CAPACIDADES DE AUTOMAÇÃO:
1. TRIGGERS disponíveis:
   - Manual: Executado manualmente pelo usuário
   - Webhook: Disparado por API externa
   - Schedule: Executado em horários programados

2. ACTIONS disponíveis:
   - send_message: Enviar mensagem (WhatsApp, email, SMS)
   - api_call: Chamar API externa
   - save_data: Salvar dados no sistema
   - send_notification: Enviar notificação
   - delay: Aguardar período de tempo

3. CONDITIONS:
   - Comparações (igual, diferente, maior, menor)
   - Verificar existência de dados
   - Validações customizadas

INSTRUÇÕES:
- Seja proativo em sugerir automações relevantes para PMEs brasileiras
- Use linguagem clara e acessível
- Sempre explique o benefício da automação proposta
- Quando gerar workflows, use nomenclatura em português
- Foque em casos de uso práticos e realistas`;

        if (context) {
            systemPrompt += `\n\nCONTEXTO DA ORGANIZAÇÃO:`;

            if (context.businessType) {
                systemPrompt += `\n- Tipo de negócio: ${context.businessType}`;
            }

            if (context.existingWorkflows.length > 0) {
                systemPrompt += `\n- Workflows existentes: ${context.existingWorkflows.join(", ")}`;
            }

            if (context.availableIntegrations.length > 0) {
                systemPrompt += `\n- Integrações disponíveis: ${context.availableIntegrations.join(", ")}`;
            }

            if (context.commonPatterns && context.commonPatterns.length > 0) {
                systemPrompt += `\n- Padrões comuns: ${context.commonPatterns.join(", ")}`;
            }
        }

        return systemPrompt;
    }

    /**
     * Converter função gerada pelo GPT em WorkflowDefinition
     */
    private async convertToWorkflowDefinition(functionArgs: any, organizationId: string): Promise<WorkflowDefinition> {
        const workflowId = this.generateWorkflowId();

        return {
            id: workflowId,
            name: functionArgs.name,
            description: functionArgs.description,
            organizationId,
            version: 1,
            status: "draft",
            triggers: [
                {
                    type: functionArgs.trigger.type,
                    enabled: true,
                    config: functionArgs.trigger.config || {},
                },
            ],
            nodes: functionArgs.actions.map((action: any, index: number) => ({
                id: `node_${index + 1}`,
                type: "action",
                name: action.name,
                executor: action.type,
                config: action.config || {},
                inputs: {},
                outputs: {},
                position: { x: 100, y: 100 + index * 150 },
            })),
            metadata: {
                generatedByAI: true,
                aiGenerationTimestamp: new Date().toISOString(),
                originalPrompt: functionArgs.originalPrompt || "",
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: "ai-assistant",
        };
    }

    /**
     * Gerar sugestões para próximas ações
     */
    private async generateSuggestions(_lastMessage: string, _context?: OrganizationContext): Promise<string[]> {
        const baseSuggestions = [
            "Como automatizar atendimento via WhatsApp?",
            "Criar workflow de follow-up de vendas",
            "Automatizar cobrança com PIX",
            "Integrar com meu CRM",
            "Configurar lembretes automáticos",
        ];

        // TODO: Implementar lógica mais sofisticada baseada no contexto
        return baseSuggestions.slice(0, 3);
    }

    /**
     * Obter histórico de conversa
     */
    getConversationHistory(userId: string, organizationId: string): ChatMessage[] {
        const conversationKey = `${userId}_${organizationId}`;
        return this.conversationHistory.get(conversationKey) || [];
    }

    /**
     * Limpar histórico de conversa
     */
    clearConversationHistory(userId: string, organizationId: string): void {
        const conversationKey = `${userId}_${organizationId}`;
        this.conversationHistory.delete(conversationKey);
    }

    /**
     * Gerar ID único para mensagem
     */
    private generateMessageId(): string {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Gerar ID único para workflow
     */
    private generateWorkflowId(): string {
        return `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Validar se o serviço está configurado corretamente
     */
    async validateConfiguration(): Promise<boolean> {
        try {
            // Teste simples para verificar se a API está funcionando
            await this.openai.chat.completions.create({
                model: "gpt-4",
                messages: [{ role: "user", content: "Hello" }],
                max_tokens: 5,
            });
            return true;
        } catch (error) {
            console.error("Erro na configuração da OpenAI:", error);
            return false;
        }
    }
}

export default AIService;
