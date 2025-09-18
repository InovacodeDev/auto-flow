import { TriggerHandler, TriggerConfig, TriggerType } from "../types";
import crypto from "crypto";

/**
 * Manual Trigger Handler
 * Permite execução manual de workflows via API ou interface
 */
export class ManualTriggerHandler implements TriggerHandler {
    type: TriggerType = "manual";
    private registeredWorkflows = new Set<string>();
    private executeCallback?: (workflowId: string, triggerData: any, userId?: string) => Promise<void>;

    setExecuteCallback(callback: (workflowId: string, triggerData: any, userId?: string) => Promise<void>): void {
        this.executeCallback = callback;
    }

    async register(workflowId: string, config: TriggerConfig): Promise<void> {
        if (config.type !== "manual") {
            throw new Error(`Invalid trigger type for ManualTriggerHandler: ${config.type}`);
        }

        this.registeredWorkflows.add(workflowId);
        console.log(`✅ Manual trigger registered for workflow: ${workflowId}`);
    }

    async unregister(workflowId: string): Promise<void> {
        this.registeredWorkflows.delete(workflowId);
        console.log(`❌ Manual trigger unregistered for workflow: ${workflowId}`);
    }

    async update(workflowId: string, config: TriggerConfig): Promise<void> {
        if (config.type !== "manual") {
            throw new Error(`Invalid trigger type for ManualTriggerHandler: ${config.type}`);
        }

        // Para manual trigger, não há muito a atualizar
        console.log(`🔄 Manual trigger updated for workflow: ${workflowId}`);
    }

    async isActive(workflowId: string): Promise<boolean> {
        return this.registeredWorkflows.has(workflowId);
    }

    /**
     * Executar workflow manualmente
     */
    async execute(workflowId: string, triggerData: any = {}, userId?: string): Promise<string> {
        if (!this.registeredWorkflows.has(workflowId)) {
            throw new Error(`Workflow not registered for manual execution: ${workflowId}`);
        }

        if (!this.executeCallback) {
            throw new Error("Execute callback not configured");
        }

        // Gerar execution ID usando crypto
        const executionId = crypto.randomUUID();

        // Validar se o usuário pode executar este workflow
        if (userId && !this.canExecute(userId)) {
            throw new Error(`User ${userId} does not have permission to execute workflow ${workflowId}`);
        }

        // Preparar dados do trigger
        const enrichedTriggerData = {
            ...triggerData,
            trigger: {
                type: "manual",
                executedBy: userId,
                executedAt: new Date().toISOString(),
                executionId,
            },
        };

        // Executar via callback
        try {
            await this.executeCallback(workflowId, enrichedTriggerData, userId);
            console.log(`🚀 Manual execution started for workflow ${workflowId} by user ${userId || "system"}`);
            return executionId;
        } catch (error) {
            console.error(`❌ Failed to execute workflow ${workflowId}:`, error);
            throw error;
        }
    }

    /**
     * Verificar se usuário pode executar o workflow
     */
    private canExecute(userId: string): boolean {
        // Por enquanto, todos os usuários autenticados podem executar
        // Implementar RBAC aqui conforme necessário
        return !!userId;
    }

    /**
     * Validar dados de entrada manual
     */
    validateManualInputs(
        workflowId: string,
        inputs: Record<string, any>
    ): {
        valid: boolean;
        errors?: string[];
    } {
        if (!this.registeredWorkflows.has(workflowId)) {
            return {
                valid: false,
                errors: [`Workflow not registered: ${workflowId}`],
            };
        }

        // Validação básica - expandir conforme necessário
        const errors: string[] = [];

        // Verificar tipos básicos se necessário
        if (inputs && typeof inputs !== "object") {
            errors.push("Inputs must be an object");
        }

        return {
            valid: errors.length === 0,
            ...(errors.length > 0 && { errors }),
        };
    }

    /**
     * Listar workflows registrados para execução manual
     */
    getRegisteredWorkflows(): string[] {
        return Array.from(this.registeredWorkflows);
    }
}
