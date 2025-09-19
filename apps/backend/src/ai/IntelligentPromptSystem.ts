/**
 * Sistema de Prompts Inteligentes para AutoFlow
 * Prompts especializados para conversão de linguagem natural em workflows
 */

export interface PromptTemplate {
    id: string;
    name: string;
    category: "workflow_generation" | "optimization" | "troubleshooting" | "integration";
    template: string;
    variables: string[];
    examples: string[];
}

export interface IndustryContext {
    industry: string;
    commonProcesses: string[];
    preferredIntegrations: string[];
    painPoints: string[];
    vocabulary: Record<string, string>;
}

export interface WorkflowPromptConfig {
    userPrompt: string;
    industry?: string;
    complexity: "simple" | "intermediate" | "advanced";
    existingIntegrations: string[];
    organizationSize: "micro" | "small" | "medium";
}

class IntelligentPromptSystem {
    private industryContexts: Map<string, IndustryContext> = new Map();
    private promptTemplates: Map<string, PromptTemplate> = new Map();

    constructor() {
        this.initializeIndustryContexts();
        this.initializePromptTemplates();
    }

    /**
     * Gera prompt otimizado para criação de workflow
     */
    generateWorkflowPrompt(config: WorkflowPromptConfig): string {
        const industryContext = this.industryContexts.get(config.industry || "geral");
        const template = this.promptTemplates.get("workflow_generation_main");

        if (!template) {
            throw new Error("Template de geração de workflow não encontrado");
        }

        const contextualInstructions = this.buildContextualInstructions(config, industryContext);
        const integrationGuidance = this.buildIntegrationGuidance(config.existingIntegrations);
        const complexityGuidance = this.buildComplexityGuidance(config.complexity);
        const outputFormat = this.getWorkflowOutputFormat();

        return `
${template.template}

CONTEXTO ESPECÍFICO:
${contextualInstructions}

INTEGRAÇÕES DISPONÍVEIS:
${integrationGuidance}

COMPLEXIDADE ALVO:
${complexityGuidance}

PROMPT DO USUÁRIO: "${config.userPrompt}"

FORMATO DE SAÍDA:
${outputFormat}
        `.trim();
    }

    /**
     * Gera prompt para otimização de workflow existente
     */
    generateOptimizationPrompt(workflowData: any, improvementGoals: string[]): string {
        const template = this.promptTemplates.get("workflow_optimization");

        if (!template) {
            throw new Error("Template de otimização não encontrado");
        }

        return `
${template.template}

WORKFLOW ATUAL:
${JSON.stringify(workflowData, null, 2)}

OBJETIVOS DE MELHORIA:
${improvementGoals.map((goal) => `- ${goal}`).join("\n")}

Analise o workflow e sugira melhorias específicas.
        `.trim();
    }

    /**
     * Gera prompt para resolução de problemas
     */
    generateTroubleshootingPrompt(error: string, workflowContext: any): string {
        const template = this.promptTemplates.get("troubleshooting");

        if (!template) {
            throw new Error("Template de troubleshooting não encontrado");
        }

        return `
${template.template}

ERRO REPORTADO:
${error}

CONTEXTO DO WORKFLOW:
${JSON.stringify(workflowContext, null, 2)}

Identifique a causa raiz e forneça soluções práticas.
        `.trim();
    }

    /**
     * Gera prompt para sugestão de integrações
     */
    generateIntegrationSuggestionPrompt(businessType: string, currentIntegrations: string[]): string {
        const template = this.promptTemplates.get("integration_suggestions");
        const industryContext = this.industryContexts.get(businessType);

        if (!template) {
            throw new Error("Template de sugestões de integração não encontrado");
        }

        const relevantIntegrations = industryContext?.preferredIntegrations || [];

        return `
${template.template}

TIPO DE NEGÓCIO: ${businessType}
INTEGRAÇÕES ATUAIS: ${currentIntegrations.join(", ")}
INTEGRAÇÕES RELEVANTES PARA O SETOR: ${relevantIntegrations.join(", ")}

Sugira 3-5 integrações prioritárias que agreguem mais valor.
        `.trim();
    }

    // Métodos privados para inicialização

    private initializeIndustryContexts(): void {
        // E-commerce
        this.industryContexts.set("ecommerce", {
            industry: "E-commerce",
            commonProcesses: [
                "Abandono de carrinho",
                "Pós-venda",
                "Gestão de estoque",
                "Atendimento ao cliente",
                "Marketing automation",
            ],
            preferredIntegrations: [
                "VTEX",
                "Shopify",
                "WooCommerce",
                "Mercado Livre",
                "WhatsApp Business",
                "E-mail Marketing",
                "PIX",
            ],
            painPoints: [
                "Abandono alto de carrinho",
                "Atendimento manual",
                "Gestão de múltiplos canais",
                "Controle de estoque",
            ],
            vocabulary: {
                carrinho: "carrinho de compras",
                checkout: "finalização de compra",
                upsell: "venda adicional",
                "cross-sell": "venda cruzada",
            },
        });

        // Serviços
        this.industryContexts.set("servicos", {
            industry: "Serviços",
            commonProcesses: [
                "Agendamento",
                "Follow-up cliente",
                "Cobrança",
                "Confirmação de serviços",
                "Coleta de feedback",
            ],
            preferredIntegrations: ["WhatsApp Business", "Google Calendar", "PIX", "RD Station", "Pipedrive", "E-mail"],
            painPoints: ["No-shows em agendamentos", "Cobrança manual", "Falta de follow-up", "Gestão de agenda"],
            vocabulary: {
                "no-show": "falta em agendamento",
                "follow-up": "acompanhamento",
                upsell: "venda adicional de serviços",
            },
        });

        // Educação
        this.industryContexts.set("educacao", {
            industry: "Educação",
            commonProcesses: [
                "Matrículas",
                "Comunicação com pais",
                "Acompanhamento acadêmico",
                "Cobrança mensalidades",
                "Eventos escolares",
            ],
            preferredIntegrations: [
                "WhatsApp Business",
                "E-mail",
                "SMS",
                "Sistema acadêmico",
                "PIX",
                "Google Classroom",
            ],
            painPoints: [
                "Comunicação com responsáveis",
                "Inadimplência",
                "Acompanhamento de faltas",
                "Organização de eventos",
            ],
            vocabulary: {
                responsável: "pai/mãe ou responsável legal",
                inadimplência: "atraso no pagamento",
                boletim: "relatório de notas",
            },
        });

        // Geral/Padrão
        this.industryContexts.set("geral", {
            industry: "Geral",
            commonProcesses: ["Atendimento ao cliente", "Cobrança", "Follow-up", "Notificações", "Relatórios"],
            preferredIntegrations: ["WhatsApp Business", "E-mail", "PIX", "CRM", "ERP"],
            painPoints: ["Processos manuais", "Falta de integração", "Retrabalho", "Perda de informações"],
            vocabulary: {},
        });
    }

    private initializePromptTemplates(): void {
        // Template principal para geração de workflows
        this.promptTemplates.set("workflow_generation_main", {
            id: "workflow_generation_main",
            name: "Geração Principal de Workflow",
            category: "workflow_generation",
            template: `
Você é Alex, especialista em automação para PMEs brasileiras.

Sua missão é converter solicitações em linguagem natural em workflows práticos e eficientes.

DIRETRIZES IMPORTANTES:
1. Foque em processos que geram ROI claro para PMEs
2. Priorize integrações brasileiras (WhatsApp, PIX, ERPs nacionais)
3. Mantenha a complexidade apropriada para o usuário
4. Calcule economia de tempo realista
5. Sugira melhorias baseadas em boas práticas

CARACTERÍSTICAS DO WORKFLOW:
- Deve ser prático e implementável
- Passos claros e sequenciais
- Integrações viáveis
- ROI mensurável
- Fácil manutenção
            `,
            variables: ["userPrompt", "industry", "complexity", "integrations"],
            examples: [
                "Criar automação para abandono de carrinho",
                "Automatizar cobrança via PIX",
                "Follow-up automático pós-venda",
            ],
        });

        // Template para otimização
        this.promptTemplates.set("workflow_optimization", {
            id: "workflow_optimization",
            name: "Otimização de Workflow",
            category: "optimization",
            template: `
Analise o workflow fornecido e identifique oportunidades de melhoria.

CRITÉRIOS DE OTIMIZAÇÃO:
1. Eficiência: redução de passos desnecessários
2. Confiabilidade: tratamento de erros
3. Performance: velocidade de execução
4. Custo: redução de recursos utilizados
5. Manutenibilidade: facilidade de atualização

Para cada melhoria sugerida, forneça:
- Problema identificado
- Solução proposta
- Impacto esperado
- Nível de dificuldade de implementação
            `,
            variables: ["workflowData", "improvementGoals"],
            examples: [],
        });

        // Template para troubleshooting
        this.promptTemplates.set("troubleshooting", {
            id: "troubleshooting",
            name: "Resolução de Problemas",
            category: "troubleshooting",
            template: `
Analise o erro reportado e forneça soluções práticas.

METODOLOGIA DE DIAGNÓSTICO:
1. Identifique a causa raiz do problema
2. Verifique configurações comuns que podem estar incorretas
3. Considere limitações de integrações externas
4. Avalie se é problema de dados ou lógica
5. Forneça soluções em ordem de prioridade

FORMATO DA RESPOSTA:
- Causa provável
- Soluções imediatas
- Prevenção futura
- Monitoramento recomendado
            `,
            variables: ["error", "workflowContext"],
            examples: [],
        });

        // Template para sugestões de integração
        this.promptTemplates.set("integration_suggestions", {
            id: "integration_suggestions",
            name: "Sugestões de Integração",
            category: "integration",
            template: `
Baseado no tipo de negócio e integrações atuais, sugira novas integrações que maximizem o valor.

CRITÉRIOS DE SELEÇÃO:
1. Relevância para o setor
2. Facilidade de implementação
3. ROI potencial
4. Sinergia com integrações existentes
5. Custo-benefício

Para cada integração sugerida, forneça:
- Nome da integração
- Benefício principal
- Casos de uso específicos
- Complexidade de implementação
- ROI estimado
            `,
            variables: ["businessType", "currentIntegrations"],
            examples: [],
        });
    }

    private buildContextualInstructions(config: WorkflowPromptConfig, industryContext?: IndustryContext): string {
        if (!industryContext) {
            return `
Negócio genérico - aplicar boas práticas gerais de automação.
Tamanho da organização: ${config.organizationSize}
            `.trim();
        }

        return `
Setor: ${industryContext.industry}
Processos comuns: ${industryContext.commonProcesses.join(", ")}
Dores principais: ${industryContext.painPoints.join(", ")}
Tamanho da organização: ${config.organizationSize}

Considere o vocabulário específico do setor:
${Object.entries(industryContext.vocabulary)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n")}
        `.trim();
    }

    private buildIntegrationGuidance(existingIntegrations: string[]): string {
        const available =
            existingIntegrations.length > 0 ? existingIntegrations.join(", ") : "Nenhuma integração configurada";

        return `
Integrações já configuradas: ${available}

Integrações brasileiras prioritárias:
- WhatsApp Business API (comunicação)
- PIX Mercado Pago/PagBank (pagamentos)
- RD Station/Pipedrive/HubSpot (CRM)
- Omie/ContaAzul/Bling (ERP)
- VTEX/Shopify (E-commerce)

Priorize integrações que não estão na lista atual.
        `.trim();
    }

    private buildComplexityGuidance(complexity: string): string {
        const guidance = {
            simple: `
COMPLEXIDADE SIMPLES:
- Máximo 5 passos no workflow
- Apenas integrações básicas
- Lógica linear sem condições complexas
- Fácil de entender e manter
            `,
            intermediate: `
COMPLEXIDADE INTERMEDIÁRIA:
- 5-15 passos no workflow
- Até 3 integrações diferentes
- Condicionais simples (if/else)
- Loops básicos se necessário
            `,
            advanced: `
COMPLEXIDADE AVANÇADA:
- 15+ passos permitidos
- Múltiplas integrações
- Lógica condicional complexa
- Processamento paralelo
- Tratamento robusto de erros
            `,
        };

        return guidance[complexity as keyof typeof guidance] || guidance.simple;
    }

    private getWorkflowOutputFormat(): string {
        return `
Retorne APENAS um JSON válido no seguinte formato:
{
  "id": "workflow_unique_id",
  "name": "Nome Descritivo do Workflow",
  "description": "Descrição clara do que o workflow faz",
  "nodes": [
    {
      "id": "node_1",
      "type": "trigger|action|condition|delay",
      "name": "Nome do Node",
      "description": "O que este node faz especificamente",
      "config": {
        "campo1": "valor1",
        "campo2": "valor2"
      },
      "position": {"x": 100, "y": 100}
    }
  ],
  "edges": [
    {
      "id": "edge_1",
      "source": "node_1",
      "target": "node_2",
      "type": "default|conditional",
      "condition": "condição se aplicável"
    }
  ],
  "estimatedROI": {
    "timeSaved": "X horas por semana",
    "costSaved": 1200,
    "complexity": "Simples|Intermediário|Avançado"
  },
  "suggestedIntegrations": ["integração1", "integração2"],
  "tags": ["tag1", "tag2", "tag3"]
}

NÃO inclua texto explicativo, apenas o JSON.
        `.trim();
    }
}

export { IntelligentPromptSystem };
