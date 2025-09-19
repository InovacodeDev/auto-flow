import { TriggerHandler, TriggerType } from "../types";

/**
 * Advanced Schedule Trigger Handler
 * Suporta agendamentos complexos, fusos horários e condições
 */
export class AdvancedScheduleTriggerHandler implements TriggerHandler {
    type: TriggerType = "schedule";
    private scheduledTasks = new Map<string, ScheduleConfig>();
    private timers = new Map<string, NodeJS.Timeout>();

    async register(workflowId: string, config: any): Promise<void> {
        const scheduleConfig: ScheduleConfig = {
            workflowId,
            type: config.type || "interval",
            expression: config.expression,
            timezone: config.timezone || "America/Sao_Paulo",
            enabled: config.enabled !== false,
            ...(config.startDate && { startDate: new Date(config.startDate) }),
            ...(config.endDate && { endDate: new Date(config.endDate) }),
            maxExecutions: config.maxExecutions,
            executionCount: 0,
            conditions: config.conditions || [],
            metadata: config.metadata || {},
        };

        // Validar configuração
        if (!this.validateScheduleConfig(scheduleConfig)) {
            throw new Error(`Invalid schedule configuration for workflow ${workflowId}`);
        }

        // Criar agendamento baseado no tipo
        switch (scheduleConfig.type) {
            case "interval":
                await this.createIntervalSchedule(scheduleConfig);
                break;
            case "once":
                await this.createOnceSchedule(scheduleConfig);
                break;
            case "daily":
                await this.createDailySchedule(scheduleConfig);
                break;
            default:
                throw new Error(`Unsupported schedule type: ${scheduleConfig.type}`);
        }

        this.scheduledTasks.set(workflowId, scheduleConfig);
        console.log(
            `Schedule registered for workflow ${workflowId}: ${scheduleConfig.type} - ${scheduleConfig.expression}`
        );
    }

    async unregister(workflowId: string): Promise<void> {
        const timer = this.timers.get(workflowId);
        if (timer) {
            clearTimeout(timer);
            this.timers.delete(workflowId);
        }

        this.scheduledTasks.delete(workflowId);
        console.log(`Schedule unregistered for workflow ${workflowId}`);
    }

    async update(workflowId: string, config: any): Promise<void> {
        await this.unregister(workflowId);
        await this.register(workflowId, config);
    }

    async isActive(workflowId: string): Promise<boolean> {
        const config = this.scheduledTasks.get(workflowId);
        if (!config) return false;

        return config.enabled && this.timers.has(workflowId);
    }

    private validateScheduleConfig(config: ScheduleConfig): boolean {
        // Validar datas
        if (config.startDate && config.endDate && config.startDate >= config.endDate) {
            console.error("Start date must be before end date");
            return false;
        }

        // Validar timezone
        try {
            new Intl.DateTimeFormat("en", { timeZone: config.timezone });
        } catch {
            console.error(`Invalid timezone: ${config.timezone}`);
            return false;
        }

        return true;
    }

    private async createIntervalSchedule(config: ScheduleConfig): Promise<void> {
        const intervalMs = this.parseInterval(config.expression);
        if (!intervalMs) {
            throw new Error("Invalid interval expression");
        }

        const intervalFunction = async () => {
            if (await this.shouldExecute(config)) {
                await this.executeScheduledWorkflow(config);
            }

            if (config.enabled && this.scheduledTasks.has(config.workflowId)) {
                const timer = setTimeout(intervalFunction, intervalMs);
                this.timers.set(config.workflowId, timer);
            }
        };

        if (config.enabled) {
            const timer = setTimeout(intervalFunction, intervalMs);
            this.timers.set(config.workflowId, timer);
        }
    }

    private async createOnceSchedule(config: ScheduleConfig): Promise<void> {
        const executeAt = config.startDate || new Date();
        const delay = executeAt.getTime() - Date.now();

        if (delay > 0) {
            const timer = setTimeout(async () => {
                if (await this.shouldExecute(config)) {
                    await this.executeScheduledWorkflow(config);
                }
                this.timers.delete(config.workflowId);
            }, delay);

            this.timers.set(config.workflowId, timer);
        }
    }

    private async createDailySchedule(config: ScheduleConfig): Promise<void> {
        // Executar diariamente no horário especificado
        const [hours, minutes] = config.expression.split(":").map(Number);

        const scheduleDaily = () => {
            const now = new Date();
            const targetTime = new Date(now);
            targetTime.setHours(hours, minutes, 0, 0);

            // Se já passou o horário hoje, agendar para amanhã
            if (targetTime <= now) {
                targetTime.setDate(targetTime.getDate() + 1);
            }

            const delay = targetTime.getTime() - now.getTime();

            const timer = setTimeout(async () => {
                if (await this.shouldExecute(config)) {
                    await this.executeScheduledWorkflow(config);
                }

                // Reagendar para o próximo dia
                if (config.enabled && this.scheduledTasks.has(config.workflowId)) {
                    scheduleDaily();
                }
            }, delay);

            this.timers.set(config.workflowId, timer);
        };

        if (config.enabled) {
            scheduleDaily();
        }
    }

    private parseInterval(expression: string): number | null {
        const regex = /^(\d+)(s|m|h|d)$/;
        const match = expression.match(regex);

        if (!match) return null;

        const value = parseInt(match[1]);
        const unit = match[2];

        switch (unit) {
            case "s":
                return value * 1000;
            case "m":
                return value * 60 * 1000;
            case "h":
                return value * 60 * 60 * 1000;
            case "d":
                return value * 24 * 60 * 60 * 1000;
            default:
                return null;
        }
    }

    private async shouldExecute(config: ScheduleConfig): Promise<boolean> {
        // Verificar se ainda está ativo
        if (!config.enabled) return false;

        // Verificar datas limite
        const now = new Date();
        if (config.startDate && now < config.startDate) return false;
        if (config.endDate && now > config.endDate) return false;

        // Verificar limite de execuções
        if (config.maxExecutions && config.executionCount >= config.maxExecutions) {
            return false;
        }

        // Avaliar condições personalizadas
        for (const condition of config.conditions) {
            if (!(await this.evaluateCondition(condition))) {
                return false;
            }
        }

        return true;
    }

    private async evaluateCondition(condition: ScheduleCondition): Promise<boolean> {
        switch (condition.type) {
            case "day_of_week": {
                const now = new Date();
                const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
                return condition.value.includes(dayOfWeek);
            }

            case "date_range": {
                const now = new Date();
                const start = new Date(condition.value.start);
                const end = new Date(condition.value.end);
                return now >= start && now <= end;
            }

            case "business_hours": {
                const now = new Date();
                const hour = now.getHours();
                return hour >= condition.value.start && hour <= condition.value.end;
            }

            case "holiday_check": {
                // Implementar verificação de feriados brasileiros
                return !(await this.isBrazilianHoliday(new Date()));
            }

            case "custom": {
                // Implementar avaliação de condição customizada
                return await this.evaluateCustomCondition(condition.value);
            }

            default:
                return true;
        }
    }

    private async isBrazilianHoliday(_date: Date): Promise<boolean> {
        // TODO: Implementar verificação de feriados brasileiros
        return false;
    }

    private async evaluateCustomCondition(_conditionData: any): Promise<boolean> {
        // TODO: Implementar avaliação de condições customizadas
        return true;
    }

    private async executeScheduledWorkflow(config: ScheduleConfig): Promise<void> {
        try {
            // Incrementar contador de execuções
            config.executionCount++;

            // Dados do trigger
            const triggerData = {
                scheduledAt: new Date(),
                scheduleType: config.type,
                expression: config.expression,
                executionCount: config.executionCount,
                timezone: config.timezone,
                metadata: config.metadata,
            };

            // Executar workflow
            await this.executeWorkflow(config.workflowId, triggerData);

            console.log(`Scheduled workflow executed: ${config.workflowId} (execution #${config.executionCount})`);

            // Verificar se deve parar após atingir limite
            if (config.maxExecutions && config.executionCount >= config.maxExecutions) {
                await this.unregister(config.workflowId);
                console.log(`Workflow ${config.workflowId} completed all scheduled executions`);
            }
        } catch (error) {
            console.error(`Error executing scheduled workflow ${config.workflowId}:`, error);
        }
    }

    private async executeWorkflow(workflowId: string, triggerData: any): Promise<void> {
        // Esta função será implementada pelo engine que usar este handler
        console.log(`Executing scheduled workflow ${workflowId} with trigger data:`, triggerData);
    }

    // Métodos utilitários para gerenciamento
    getScheduledWorkflows(): Map<string, ScheduleConfig> {
        return new Map(this.scheduledTasks);
    }

    async pauseSchedule(workflowId: string): Promise<void> {
        const config = this.scheduledTasks.get(workflowId);
        if (config) {
            config.enabled = false;
            const timer = this.timers.get(workflowId);
            if (timer) {
                clearTimeout(timer);
                this.timers.delete(workflowId);
            }
        }
    }

    async resumeSchedule(workflowId: string): Promise<void> {
        const config = this.scheduledTasks.get(workflowId);
        if (config) {
            config.enabled = true;
            await this.register(workflowId, config);
        }
    }
}

interface ScheduleConfig {
    workflowId: string;
    type: "interval" | "once" | "daily";
    expression: string;
    timezone: string;
    enabled: boolean;
    startDate?: Date;
    endDate?: Date;
    maxExecutions?: number;
    executionCount: number;
    conditions: ScheduleCondition[];
    metadata: Record<string, any>;
}

interface ScheduleCondition {
    type: "day_of_week" | "date_range" | "business_hours" | "holiday_check" | "custom";
    value: any;
}
