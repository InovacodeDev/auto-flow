import { AutoFlowWorkflow, WorkflowAction, WorkflowCondition, WorkflowResult, AutoFlowError } from "../types";

/**
 * AutoFlow Workflow Engine
 * Core execution engine for automating business processes
 */
export class WorkflowEngine {
    private activeWorkflows = new Map<string, AutoFlowWorkflow>();
    private executionQueue: Array<{ workflowId: string; payload: any }> = [];
    private isProcessing = false;

    constructor() {
        // Start the execution queue processor
        this.startQueueProcessor();
    }

    /**
     * Register a workflow for execution
     */
    async registerWorkflow(workflow: AutoFlowWorkflow): Promise<void> {
        this.validateWorkflow(workflow);
        this.activeWorkflows.set(workflow.id, workflow);
        console.log(`✅ Workflow registered: ${workflow.name} (${workflow.id})`);
    }

    /**
     * Unregister a workflow
     */
    async unregisterWorkflow(workflowId: string): Promise<void> {
        if (this.activeWorkflows.has(workflowId)) {
            this.activeWorkflows.delete(workflowId);
            console.log(`🗑️ Workflow unregistered: ${workflowId}`);
        }
    }

    /**
     * Trigger workflow execution
     */
    async triggerWorkflow(workflowId: string, triggerType: string, payload: any): Promise<void> {
        const workflow = this.activeWorkflows.get(workflowId);
        if (!workflow) {
            throw new AutoFlowError(`Workflow not found: ${workflowId}`, "WORKFLOW_NOT_FOUND");
        }

        // Check if trigger matches
        const trigger = workflow.triggers.find((t) => t.type === triggerType && t.enabled);

        if (!trigger) {
            console.log(`⚠️ No matching trigger for ${triggerType} in workflow ${workflowId}`);
            return;
        }

        // Add to execution queue
        this.executionQueue.push({ workflowId, payload });
        console.log(`📥 Workflow queued for execution: ${workflow.name}`);
    }

    /**
     * Execute a workflow with given payload
     */
    async execute(workflow: AutoFlowWorkflow, payload: any): Promise<WorkflowResult> {
        console.log(`🚀 Executing workflow: ${workflow.name}`);

        const result: WorkflowResult = {
            status: "success",
            executedActions: [],
            errors: [],
            data: { ...payload },
        };

        try {
            // Execute actions in sequence
            for (const action of workflow.actions) {
                await this.executeAction(action, result);
            }

            // Process conditions if any
            for (const condition of workflow.conditions) {
                await this.processCondition(condition, workflow, result);
            }

            console.log(`✅ Workflow completed: ${workflow.name}`);
            return result;
        } catch (error) {
            console.error(`❌ Workflow failed: ${workflow.name}`, error);

            result.status = "error";
            result.errors?.push({
                actionId: "unknown",
                message: error instanceof Error ? error.message : "Unknown error",
                details: error,
            });

            return result;
        }
    }

    /**
     * Execute a single workflow action
     */
    private async executeAction(action: WorkflowAction, result: WorkflowResult): Promise<void> {
        console.log(`🔧 Executing action: ${action.type} (${action.id})`);

        try {
            switch (action.type) {
                case "whatsapp_send":
                    await this.executeWhatsAppAction(action, result);
                    break;

                case "email_send":
                    await this.executeEmailAction(action, result);
                    break;

                case "http_request":
                    await this.executeHttpAction(action, result);
                    break;

                case "database_save":
                    await this.executeDatabaseAction(action, result);
                    break;

                case "ai_process":
                    await this.executeAIAction(action, result);
                    break;

                case "delay":
                    await this.executeDelayAction(action, result);
                    break;

                default:
                    throw new AutoFlowError(`Unsupported action type: ${action.type}`, "UNSUPPORTED_ACTION_TYPE");
            }

            result.executedActions.push(action.id);
            console.log(`✅ Action completed: ${action.type} (${action.id})`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            console.error(`❌ Action failed: ${action.type} (${action.id})`, error);

            result.errors?.push({
                actionId: action.id,
                message: errorMessage,
                details: error,
            });

            // Set status to partial if some actions succeeded
            if (result.executedActions.length > 0) {
                result.status = "partial";
            } else {
                result.status = "error";
            }
        }
    }

    /**
     * Process workflow conditions
     */
    private async processCondition(
        condition: WorkflowCondition,
        workflow: AutoFlowWorkflow,
        result: WorkflowResult
    ): Promise<void> {
        console.log(`🔍 Processing condition: ${condition.type} (${condition.id})`);

        try {
            const conditionResult = await this.evaluateCondition(condition, result.data);

            const actionsToExecute = conditionResult ? condition.trueActions : condition.falseActions || [];

            for (const actionId of actionsToExecute) {
                const action = workflow.actions.find((a) => a.id === actionId);
                if (action) {
                    await this.executeAction(action, result);
                }
            }
        } catch (error) {
            console.error(`❌ Condition failed: ${condition.id}`, error);

            result.errors?.push({
                actionId: condition.id,
                message: error instanceof Error ? error.message : "Condition evaluation failed",
                details: error,
            });
        }
    }

    /**
     * Evaluate a condition expression
     */
    private async evaluateCondition(condition: WorkflowCondition, data: any): Promise<boolean> {
        // Simple condition evaluation - can be extended with more complex logic
        try {
            // For now, use a simple string-based evaluation
            // In production, use a safe expression evaluator
            const expression = condition.condition.replace(/\$\{(\w+)\}/g, (_, key) => {
                const value = data[key];
                return typeof value === "string" ? `"${value}"` : String(value);
            });

            // WARNING: eval is used here for simplicity
            // In production, use a proper expression parser like JSEval or similar
            return eval(expression);
        } catch (error) {
            console.error("Condition evaluation error:", error);
            return false;
        }
    }

    // Action executors (placeholder implementations)
    private async executeWhatsAppAction(action: WorkflowAction, result: WorkflowResult): Promise<void> {
        // TODO: Implement WhatsApp integration
        console.log("📱 WhatsApp action:", action.config);
        result.data = { ...result.data, whatsappSent: true };
    }

    private async executeEmailAction(action: WorkflowAction, result: WorkflowResult): Promise<void> {
        // TODO: Implement email integration
        console.log("📧 Email action:", action.config);
        result.data = { ...result.data, emailSent: true };
    }

    private async executeHttpAction(action: WorkflowAction, result: WorkflowResult): Promise<void> {
        // TODO: Implement HTTP request
        console.log("🌐 HTTP action:", action.config);
        result.data = { ...result.data, httpRequestMade: true };
    }

    private async executeDatabaseAction(action: WorkflowAction, result: WorkflowResult): Promise<void> {
        // TODO: Implement database save
        console.log("💾 Database action:", action.config);
        result.data = { ...result.data, dataSaved: true };
    }

    private async executeAIAction(action: WorkflowAction, result: WorkflowResult): Promise<void> {
        // TODO: Implement AI processing
        console.log("🤖 AI action:", action.config);
        result.data = { ...result.data, aiProcessed: true };
    }

    private async executeDelayAction(action: WorkflowAction, _result: WorkflowResult): Promise<void> {
        const delayMs = action.config["delay"] || 1000;
        console.log(`⏱️ Delay action: ${delayMs}ms`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    /**
     * Validate workflow structure
     */
    private validateWorkflow(workflow: AutoFlowWorkflow): void {
        if (!workflow.id || !workflow.name) {
            throw new AutoFlowError("Workflow must have id and name", "INVALID_WORKFLOW");
        }

        if (!workflow.triggers || workflow.triggers.length === 0) {
            throw new AutoFlowError("Workflow must have at least one trigger", "NO_TRIGGERS");
        }

        if (!workflow.actions || workflow.actions.length === 0) {
            throw new AutoFlowError("Workflow must have at least one action", "NO_ACTIONS");
        }
    }

    /**
     * Start the queue processor
     */
    private startQueueProcessor(): void {
        setInterval(async () => {
            if (this.isProcessing || this.executionQueue.length === 0) {
                return;
            }

            this.isProcessing = true;
            const item = this.executionQueue.shift();

            if (item) {
                const workflow = this.activeWorkflows.get(item.workflowId);
                if (workflow) {
                    try {
                        await this.execute(workflow, item.payload);
                    } catch (error) {
                        console.error("Queue processing error:", error);
                    }
                }
            }

            this.isProcessing = false;
        }, 1000); // Process queue every second
    }

    /**
     * Get workflow statistics
     */
    getStats(): { activeWorkflows: number; queueLength: number } {
        return {
            activeWorkflows: this.activeWorkflows.size,
            queueLength: this.executionQueue.length,
        };
    }
}
