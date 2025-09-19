import { NodeExecutor, NodeExecutionResult, ExecutionContext, NodeInput, NodeOutput } from "../types";

/**
 * Base class para todas as ações do AutoFlow
 * Padroniza comportamento e interfaces
 */
export abstract class BaseActionExecutor implements NodeExecutor {
    abstract type: string;
    abstract name: string;
    abstract description: string;
    abstract category: string;
    abstract inputs: NodeInput[];
    abstract outputs: NodeOutput[];
    abstract icon?: string;
    abstract color?: string;
    version = "1.0.0";

    // Validação da configuração
    validateConfig(config: Record<string, any>): { valid: boolean; errors?: string[] } {
        const errors: string[] = [];

        // Validação padrão - sobrescrever se necessário
        const requiredFields = this.getRequiredConfigFields();
        for (const field of requiredFields) {
            if (!config[field]) {
                errors.push(`Campo obrigatório ausente: ${field}`);
            }
        }

        // Validação específica da ação
        const customErrors = this.validateCustomConfig(config);
        errors.push(...customErrors);

        return {
            valid: errors.length === 0,
            ...(errors.length > 0 && { errors }),
        };
    }

    // Execução da ação
    async execute(
        config: Record<string, any>,
        inputs: Record<string, any>,
        context: ExecutionContext
    ): Promise<NodeExecutionResult> {
        try {
            // Log de início
            context.logs.push({
                timestamp: new Date(),
                level: "info",
                component: this.type,
                message: `Iniciando execução: ${this.name}`,
                data: { config, inputs },
            });

            // Validar configuração
            const validation = this.validateConfig(config);
            if (!validation.valid) {
                throw new Error(`Configuração inválida: ${validation.errors?.join(", ")}`);
            }

            // Processar inputs
            const processedInputs = await this.processInputs(inputs, context);

            // Executar ação específica
            const result = await this.executeAction(config, processedInputs, context);

            // Log de sucesso
            context.logs.push({
                timestamp: new Date(),
                level: "info",
                component: this.type,
                message: `Execução concluída com sucesso: ${this.name}`,
                data: result.data,
            });

            return {
                success: true,
                data: result.data || {},
                ...(result.logs && { logs: result.logs }),
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";

            // Log de erro
            context.logs.push({
                timestamp: new Date(),
                level: "error",
                component: this.type,
                message: `Erro na execução: ${this.name}`,
                data: { error: errorMessage, config, inputs },
            });

            return {
                success: false,
                error: errorMessage,
                logs: [
                    {
                        timestamp: new Date(),
                        level: "error",
                        component: this.type,
                        message: errorMessage,
                    },
                ],
            };
        }
    }

    // Métodos abstratos para implementação específica
    protected abstract getRequiredConfigFields(): string[];
    protected abstract validateCustomConfig(config: Record<string, any>): string[];
    protected abstract executeAction(
        config: Record<string, any>,
        inputs: Record<string, any>,
        context: ExecutionContext
    ): Promise<ActionResult>;

    // Processamento padrão de inputs
    protected async processInputs(
        inputs: Record<string, any>,
        context: ExecutionContext
    ): Promise<Record<string, any>> {
        const processed: Record<string, any> = {};

        for (const [key, value] of Object.entries(inputs)) {
            // Resolver variáveis de contexto
            if (typeof value === "string" && value.startsWith("{{") && value.endsWith("}}")) {
                const variable = value.slice(2, -2).trim();
                processed[key] = this.resolveVariable(variable, context);
            } else {
                processed[key] = value;
            }
        }

        return processed;
    }

    // Resolver variáveis do contexto
    protected resolveVariable(variable: string, context: ExecutionContext): any {
        // Suporte a variáveis aninhadas com dot notation
        const keys = variable.split(".");
        let value: any = context.data;

        for (const key of keys) {
            if (value && typeof value === "object" && key in value) {
                value = value[key];
            } else {
                return undefined;
            }
        }

        return value;
    }

    // Utilitários para formatação de dados brasileiros
    protected formatCPF(cpf: string): string {
        const cleaned = cpf.replace(/\D/g, "");
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }

    protected formatCNPJ(cnpj: string): string {
        const cleaned = cnpj.replace(/\D/g, "");
        return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
    }

    protected formatPhone(phone: string): string {
        const cleaned = phone.replace(/\D/g, "");
        if (cleaned.length === 11) {
            return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
        } else if (cleaned.length === 10) {
            return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
        }
        return phone;
    }

    protected formatCurrency(value: number): string {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    }

    protected validateCPF(cpf: string): boolean {
        const cleaned = cpf.replace(/\D/g, "");
        if (cleaned.length !== 11) return false;

        // Verificar se todos os dígitos são iguais
        if (/^(\d)\1{10}$/.test(cleaned)) return false;

        // Validar dígitos verificadores
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cleaned[i]) * (10 - i);
        }
        let digit1 = 11 - (sum % 11);
        if (digit1 > 9) digit1 = 0;

        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cleaned[i]) * (11 - i);
        }
        let digit2 = 11 - (sum % 11);
        if (digit2 > 9) digit2 = 0;

        return digit1 === parseInt(cleaned[9]) && digit2 === parseInt(cleaned[10]);
    }

    protected validateCNPJ(cnpj: string): boolean {
        const cleaned = cnpj.replace(/\D/g, "");
        if (cleaned.length !== 14) return false;

        // Verificar se todos os dígitos são iguais
        if (/^(\d)\1{13}$/.test(cleaned)) return false;

        // Validar primeiro dígito verificador
        const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        let sum = 0;
        for (let i = 0; i < 12; i++) {
            sum += parseInt(cleaned[i]) * weights1[i];
        }
        let digit1 = sum % 11;
        digit1 = digit1 < 2 ? 0 : 11 - digit1;

        // Validar segundo dígito verificador
        const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        sum = 0;
        for (let i = 0; i < 13; i++) {
            sum += parseInt(cleaned[i]) * weights2[i];
        }
        let digit2 = sum % 11;
        digit2 = digit2 < 2 ? 0 : 11 - digit2;

        return digit1 === parseInt(cleaned[12]) && digit2 === parseInt(cleaned[13]);
    }

    // Rate limiting simples
    protected async rateLimitCheck(key: string, limit: number, windowMs: number): Promise<boolean> {
        // TODO: Implementar com Redis ou cache em memória
        // Por agora, retornar true (sem limite)
        return true;
    }

    // Retry automático para requisições
    protected async retryWithBackoff<T>(
        operation: () => Promise<T>,
        maxRetries: number = 3,
        baseDelay: number = 1000
    ): Promise<T> {
        let lastError: Error;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error instanceof Error ? error : new Error("Unknown error");

                if (attempt === maxRetries) break;

                const delay = baseDelay * Math.pow(2, attempt);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }

        throw lastError!;
    }
}

// Interface para resultado de ação
export interface ActionResult {
    data?: Record<string, any>;
    logs?: Array<{
        timestamp: Date;
        level: "info" | "warn" | "error";
        component: string;
        message: string;
    }>;
}
