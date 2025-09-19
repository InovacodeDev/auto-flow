import { IntelligentPromptSystem } from "./IntelligentPromptSystem";

/**
 * Parser para converter instruções em português para estruturas de workflow
 */

export interface ParsedWorkflow {
    intent: "create_workflow" | "modify_workflow" | "ask_question" | "get_help";
    workflow?: {
        name: string;
        description: string;
        triggers: ParsedTrigger[];
        actions: ParsedAction[];
        conditions: ParsedCondition[];
    };
    entities: ParsedEntity[];
    confidence: number;
    suggestions: string[];
}

export interface ParsedTrigger {
    type: "schedule" | "webhook" | "email_received" | "form_submitted" | "whatsapp_received" | "manual";
    config: Record<string, any>;
    confidence: number;
}

export interface ParsedAction {
    type:
        | "send_email"
        | "send_whatsapp"
        | "save_data"
        | "create_task"
        | "send_notification"
        | "api_call"
        | "generate_pix";
    config: Record<string, any>;
    confidence: number;
}

export interface ParsedCondition {
    type: "if_then" | "loop" | "delay" | "filter";
    config: Record<string, any>;
    confidence: number;
}

export interface ParsedEntity {
    type: "integration" | "time" | "data_field" | "contact" | "amount" | "condition";
    value: string;
    originalText: string;
    confidence: number;
}

export interface ParserContext {
    industry?: string;
    userHistory: string[];
    availableIntegrations: string[];
    organizationSize: "micro" | "small" | "medium";
}

class NaturalLanguageWorkflowParser {
    private promptSystem: IntelligentPromptSystem;

    // Regex patterns para reconhecimento de entidades
    private timePatterns = [
        /(\d+)\s*(hora|horas|minuto|minutos|dia|dias|semana|semanas)/gi,
        /(todo|toda|a cada)\s*(dia|semana|mês|hora)/gi,
        /(às|as)\s*(\d{1,2}):?(\d{2})?/gi,
    ];

    private integrationPatterns = [
        /whatsapp/gi,
        /email|e-mail/gi,
        /pix/gi,
        /(mercado pago|pagbank)/gi,
        /(rd station|pipedrive|hubspot)/gi,
        /(omie|contaazul|bling)/gi,
        /(vtex|shopify|woocommerce)/gi,
    ];

    private actionPatterns = [
        /enviar|mandar|disparar/gi,
        /salvar|armazenar|guardar/gi,
        /notificar|avisar|alertar/gi,
        /agendar|programar/gi,
        /criar|gerar/gi,
    ];

    private triggerPatterns = [
        /quando|assim que|toda vez que/gi,
        /se.*receber|ao receber/gi,
        /após|depois de/gi,
        /a cada|todo/gi,
    ];

    constructor() {
        this.promptSystem = new IntelligentPromptSystem();
    }

    /**
     * Parse principal - converte texto em português para estrutura de workflow
     */
    async parseWorkflowInstruction(text: string, context: ParserContext): Promise<ParsedWorkflow> {
        try {
            // 1. Detectar intenção principal
            const intent = this.detectIntent(text);

            if (intent !== "create_workflow") {
                return {
                    intent,
                    entities: this.extractEntities(text),
                    confidence: 0.9,
                    suggestions: this.generateSuggestions(text, context),
                };
            }

            // 2. Extrair entidades do texto
            const entities = this.extractEntities(text);

            // 3. Identificar triggers, actions e conditions
            const triggers = this.identifyTriggers(text, entities);
            const actions = this.identifyActions(text, entities);
            const conditions = this.identifyConditions(text, entities);

            // 4. Gerar nome e descrição do workflow
            const { name, description } = this.generateWorkflowMetadata(text);

            // 5. Calcular confiança geral
            const confidence = this.calculateConfidence(triggers, actions, conditions);

            // 6. Gerar sugestões para melhorar o workflow
            const suggestions = this.generateOptimizationSuggestions(text, context);

            return {
                intent: "create_workflow",
                workflow: {
                    name,
                    description,
                    triggers,
                    actions,
                    conditions,
                },
                entities,
                confidence,
                suggestions,
            };
        } catch (error) {
            console.error("Error parsing workflow instruction:", error);
            return {
                intent: "ask_question",
                entities: [],
                confidence: 0.1,
                suggestions: ["Não consegui entender. Pode reformular?"],
            };
        }
    }

    /**
     * Detecta a intenção principal do usuário
     */
    private detectIntent(text: string): ParsedWorkflow["intent"] {
        const lowerText = text.toLowerCase();

        // Palavras-chave para criação de workflow
        const createKeywords = [
            "criar",
            "fazer",
            "automatizar",
            "automação",
            "workflow",
            "quando",
            "toda vez que",
            "assim que",
            "gostaria",
            "quero",
            "preciso",
            "como fazer",
            "disparar",
        ];

        // Palavras-chave para modificação
        const modifyKeywords = [
            "alterar",
            "modificar",
            "mudar",
            "ajustar",
            "editar",
            "melhorar",
            "otimizar",
            "corrigir",
        ];

        // Palavras-chave para perguntas
        const questionKeywords = ["como", "por que", "o que", "qual", "onde", "quando", "?", "dúvida", "pergunta"];

        // Palavras-chave para ajuda
        const helpKeywords = ["ajuda", "help", "socorro", "não sei", "não entendo", "tutorial", "exemplo"];

        if (createKeywords.some((keyword) => lowerText.includes(keyword))) {
            return "create_workflow";
        }

        if (modifyKeywords.some((keyword) => lowerText.includes(keyword))) {
            return "modify_workflow";
        }

        if (questionKeywords.some((keyword) => lowerText.includes(keyword))) {
            return "ask_question";
        }

        if (helpKeywords.some((keyword) => lowerText.includes(keyword))) {
            return "get_help";
        }

        // Default para criação se contém triggers ou actions
        if (
            this.triggerPatterns.some((pattern) => pattern.test(text)) ||
            this.actionPatterns.some((pattern) => pattern.test(text))
        ) {
            return "create_workflow";
        }

        return "ask_question";
    }

    /**
     * Extrai entidades do texto (integrações, tempos, dados, etc.)
     */
    private extractEntities(text: string): ParsedEntity[] {
        const entities: ParsedEntity[] = [];

        // Extrair tempos
        this.timePatterns.forEach((pattern) => {
            const matches = [...text.matchAll(pattern)];
            matches.forEach((match) => {
                entities.push({
                    type: "time",
                    value: match[0],
                    originalText: match[0],
                    confidence: 0.9,
                });
            });
        });

        // Extrair integrações
        this.integrationPatterns.forEach((pattern) => {
            const matches = [...text.matchAll(pattern)];
            matches.forEach((match) => {
                entities.push({
                    type: "integration",
                    value: match[0].toLowerCase(),
                    originalText: match[0],
                    confidence: 0.95,
                });
            });
        });

        // Extrair valores monetários
        const moneyPattern = /R\$?\s*(\d+[.,]?\d*)/gi;
        const moneyMatches = [...text.matchAll(moneyPattern)];
        moneyMatches.forEach((match) => {
            entities.push({
                type: "amount",
                value: match[1],
                originalText: match[0],
                confidence: 0.9,
            });
        });

        // Extrair emails
        const emailPattern = /[\w.-]+@[\w.-]+\.\w+/g;
        const emailMatches = [...text.matchAll(emailPattern)];
        emailMatches.forEach((match) => {
            entities.push({
                type: "contact",
                value: match[0],
                originalText: match[0],
                confidence: 0.95,
            });
        });

        return entities;
    }

    /**
     * Identifica triggers no texto
     */
    private identifyTriggers(text: string, entities: ParsedEntity[]): ParsedTrigger[] {
        const triggers: ParsedTrigger[] = [];

        // Trigger de tempo/agendamento
        if (/todo|toda|a cada|às|diariamente|semanalmente/gi.test(text)) {
            const timeEntity = entities.find((e) => e.type === "time");
            triggers.push({
                type: "schedule",
                config: {
                    schedule: timeEntity?.value || "daily",
                    timezone: "America/Sao_Paulo",
                },
                confidence: 0.8,
            });
        }

        // Trigger de WhatsApp
        if (/whatsapp.*receb|receb.*whatsapp|mensagem.*whatsapp/gi.test(text)) {
            triggers.push({
                type: "whatsapp_received",
                config: {
                    integration: "whatsapp_business",
                    filters: {},
                },
                confidence: 0.9,
            });
        }

        // Trigger de email
        if (/email.*receb|receb.*email|e-mail.*receb/gi.test(text)) {
            triggers.push({
                type: "email_received",
                config: {
                    integration: "email",
                    filters: {},
                },
                confidence: 0.9,
            });
        }

        // Trigger de formulário
        if (/formulário|form|cadastro.*enviado|formulario.*preenchido/gi.test(text)) {
            triggers.push({
                type: "form_submitted",
                config: {
                    formId: "detect_from_context",
                },
                confidence: 0.8,
            });
        }

        // Trigger manual (padrão se nenhum outro for identificado)
        if (triggers.length === 0 && /criar|fazer|executar/gi.test(text)) {
            triggers.push({
                type: "manual",
                config: {},
                confidence: 0.6,
            });
        }

        return triggers;
    }

    /**
     * Identifica actions no texto
     */
    private identifyActions(text: string, entities: ParsedEntity[]): ParsedAction[] {
        const actions: ParsedAction[] = [];

        // Action de enviar WhatsApp
        if (/enviar.*whatsapp|mandar.*whatsapp|disparar.*whatsapp/gi.test(text)) {
            actions.push({
                type: "send_whatsapp",
                config: {
                    integration: "whatsapp_business",
                    template: "detect_from_context",
                    recipient: "detect_from_context",
                },
                confidence: 0.9,
            });
        }

        // Action de enviar email
        if (/enviar.*email|mandar.*email|disparar.*email/gi.test(text)) {
            const emailEntity = entities.find((e) => e.type === "contact");
            actions.push({
                type: "send_email",
                config: {
                    to: emailEntity?.value || "detect_from_context",
                    subject: "detect_from_context",
                    template: "detect_from_context",
                },
                confidence: 0.9,
            });
        }

        // Action de gerar PIX
        if (/gerar.*pix|criar.*pix|enviar.*cobrança|cobrar.*pix/gi.test(text)) {
            const amountEntity = entities.find((e) => e.type === "amount");
            actions.push({
                type: "generate_pix",
                config: {
                    integration: "mercado_pago",
                    amount: amountEntity?.value || "detect_from_context",
                    description: "detect_from_context",
                },
                confidence: 0.85,
            });
        }

        // Action de salvar dados
        if (/salvar|armazenar|guardar.*dados|registrar/gi.test(text)) {
            actions.push({
                type: "save_data",
                config: {
                    database: "default",
                    table: "detect_from_context",
                    fields: "detect_from_context",
                },
                confidence: 0.8,
            });
        }

        // Action de notificação
        if (/notificar|avisar|alertar|notificação/gi.test(text)) {
            actions.push({
                type: "send_notification",
                config: {
                    type: "detect_from_context",
                    message: "detect_from_context",
                    recipients: "detect_from_context",
                },
                confidence: 0.8,
            });
        }

        return actions;
    }

    /**
     * Identifica condições no texto
     */
    private identifyConditions(text: string, entities: ParsedEntity[]): ParsedCondition[] {
        const conditions: ParsedCondition[] = [];

        // Condição if/then
        if (/se.*então|se.*enviar|se.*for|caso/gi.test(text)) {
            conditions.push({
                type: "if_then",
                config: {
                    condition: "detect_from_context",
                    trueAction: "detect_from_context",
                    falseAction: null,
                },
                confidence: 0.8,
            });
        }

        // Delay/Aguardar
        if (/(aguardar|esperar|após|depois de).*(\d+)/gi.test(text)) {
            const timeEntity = entities.find((e) => e.type === "time");
            conditions.push({
                type: "delay",
                config: {
                    duration: timeEntity?.value || "1 hour",
                    unit: "detect_from_context",
                },
                confidence: 0.9,
            });
        }

        // Loop/Repetição
        if (/repetir|loop|para cada|até que/gi.test(text)) {
            conditions.push({
                type: "loop",
                config: {
                    condition: "detect_from_context",
                    maxIterations: 10,
                },
                confidence: 0.7,
            });
        }

        return conditions;
    }

    /**
     * Gera nome e descrição para o workflow
     */
    private generateWorkflowMetadata(text: string): { name: string; description: string } {
        // Extrair primeira frase como base para o nome
        const firstSentence = text.split(".")[0].trim();

        // Gerar nome baseado nas palavras-chave
        let name = "Automação Personalizada";

        if (/whatsapp/gi.test(text)) {
            name = "Automação WhatsApp";
        } else if (/email/gi.test(text)) {
            name = "Automação Email";
        } else if (/pix|cobrança/gi.test(text)) {
            name = "Automação de Cobrança";
        } else if (/cliente|atendimento/gi.test(text)) {
            name = "Automação de Atendimento";
        }

        const description = `Workflow criado automaticamente: ${firstSentence}`;

        return { name, description };
    }

    /**
     * Calcula confiança geral baseada na qualidade dos componentes identificados
     */
    private calculateConfidence(
        triggers: ParsedTrigger[],
        actions: ParsedAction[],
        conditions: ParsedCondition[]
    ): number {
        if (triggers.length === 0 && actions.length === 0) {
            return 0.2;
        }

        if (triggers.length === 0 || actions.length === 0) {
            return 0.5;
        }

        const avgTriggerConfidence = triggers.reduce((sum, t) => sum + t.confidence, 0) / triggers.length;
        const avgActionConfidence = actions.reduce((sum, a) => sum + a.confidence, 0) / actions.length;
        const avgConditionConfidence =
            conditions.length > 0 ? conditions.reduce((sum, c) => sum + c.confidence, 0) / conditions.length : 0.8;

        return Math.min(0.95, (avgTriggerConfidence + avgActionConfidence + avgConditionConfidence) / 3);
    }

    /**
     * Gera sugestões para melhorar o workflow
     */
    private generateSuggestions(text: string, _context: ParserContext): string[] {
        const suggestions: string[] = [];

        if (!this.triggerPatterns.some((pattern) => pattern.test(text))) {
            suggestions.push('Especifique quando o workflow deve ser executado (ex: "quando receber um email")');
        }

        if (!this.actionPatterns.some((pattern) => pattern.test(text))) {
            suggestions.push('Defina que ação deve ser realizada (ex: "enviar WhatsApp", "salvar dados")');
        }

        if (!this.integrationPatterns.some((pattern) => pattern.test(text))) {
            suggestions.push("Mencione quais integrações usar (WhatsApp, Email, PIX, etc.)");
        }

        return suggestions;
    }

    /**
     * Gera sugestões de otimização específicas
     */
    private generateOptimizationSuggestions(_text: string, context: ParserContext): string[] {
        const suggestions: string[] = [];

        // Sugestões baseadas no setor
        if (context.industry === "ecommerce") {
            suggestions.push("Considere adicionar follow-up para carrinho abandonado");
            suggestions.push("Integre com sistema de estoque para avisos automáticos");
        }

        if (context.industry === "servicos") {
            suggestions.push("Adicione confirmação automática de agendamentos");
            suggestions.push("Configure lembretes para reduzir no-shows");
        }

        return suggestions;
    }
}

export { NaturalLanguageWorkflowParser };
