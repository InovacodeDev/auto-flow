import { TriggerHandler, TriggerConfig, TriggerType } from "../types";

/**
 * Schedule Trigger Handler - Versão Simplificada
 * Permite execução de workflows em horários programados
 * Nota: Esta é uma implementação básica usando setTimeout/setInterval
 */
export class ScheduleTriggerHandler implements TriggerHandler {
    type: TriggerType = "schedule";
    private schedules = new Map<
        string,
        {
            config: TriggerConfig;
            intervalId: NodeJS.Timeout | undefined;
            isActive: boolean;
        }
    >();
    private executeCallback?: (workflowId: string, triggerData: any) => Promise<void>;

    setExecuteCallback(callback: (workflowId: string, triggerData: any) => Promise<void>): void {
        this.executeCallback = callback;
    }

    async register(workflowId: string, config: TriggerConfig): Promise<void> {
        if (config.type !== "schedule") {
            throw new Error(`Invalid trigger type for ScheduleTriggerHandler: ${config.type}`);
        }

        const scheduleConfig = config.schedule;
        if (!scheduleConfig) {
            throw new Error("Schedule configuration is required");
        }

        const interval = this.parseCronToInterval(scheduleConfig.cron);
        if (!interval) {
            throw new Error(`Unsupported cron expression: ${scheduleConfig.cron}`);
        }

        await this.unregister(workflowId);

        const schedule = {
            config,
            isActive: scheduleConfig.enabled !== false,
            intervalId: undefined as NodeJS.Timeout | undefined,
        };

        if (schedule.isActive) {
            schedule.intervalId = setInterval(async () => {
                await this.executeScheduledWorkflow(workflowId, scheduleConfig);
            }, interval);

            console.log(`Schedule started for workflow ${workflowId}: ${scheduleConfig.cron}`);
        }

        this.schedules.set(workflowId, schedule);
    }

    async unregister(workflowId: string): Promise<void> {
        const schedule = this.schedules.get(workflowId);

        if (schedule) {
            if (schedule.intervalId) {
                clearInterval(schedule.intervalId);
            }
            this.schedules.delete(workflowId);
            console.log(`Schedule unregistered for workflow: ${workflowId}`);
        }
    }

    async update(workflowId: string, config: TriggerConfig): Promise<void> {
        await this.unregister(workflowId);
        await this.register(workflowId, config);
    }

    async isActive(workflowId: string): Promise<boolean> {
        const schedule = this.schedules.get(workflowId);
        return schedule ? schedule.isActive : false;
    }

    private async executeScheduledWorkflow(
        workflowId: string,
        scheduleConfig: NonNullable<TriggerConfig["schedule"]>
    ): Promise<void> {
        if (!this.executeCallback) {
            console.error(`No execute callback configured for workflow ${workflowId}`);
            return;
        }

        const now = new Date();
        console.log(`Executing scheduled workflow ${workflowId} at ${now.toISOString()}`);

        try {
            const triggerData = {
                schedule: {
                    executedAt: now.toISOString(),
                    cron: scheduleConfig.cron,
                    timezone: scheduleConfig.timezone || "America/Sao_Paulo",
                    metadata: scheduleConfig.metadata || {},
                },
            };

            await this.executeCallback(workflowId, triggerData);
            console.log(`Scheduled workflow ${workflowId} executed successfully`);
        } catch (error) {
            console.error(`Failed to execute scheduled workflow ${workflowId}:`, error);
        }
    }

    private parseCronToInterval(cron: string): number | null {
        const minutePattern = /^\*\/(\d+) \* \* \* \*$/;
        const match = cron.match(minutePattern);

        if (match) {
            const minutes = parseInt(match[1]);
            return minutes * 60 * 1000;
        }

        switch (cron) {
            case "0 * * * *":
                return 60 * 60 * 1000;
            case "0 0 * * *":
                return 24 * 60 * 60 * 1000;
            case "* * * * *":
                return 60 * 1000;
            default:
                return null;
        }
    }

    async pause(workflowId: string): Promise<void> {
        const schedule = this.schedules.get(workflowId);

        if (schedule && schedule.isActive && schedule.intervalId) {
            clearInterval(schedule.intervalId);
            schedule.intervalId = undefined;
            schedule.isActive = false;
            console.log(`Schedule paused for workflow: ${workflowId}`);
        }
    }

    async resume(workflowId: string): Promise<void> {
        const schedule = this.schedules.get(workflowId);

        if (schedule && !schedule.isActive) {
            const scheduleConfig = schedule.config.schedule;
            if (scheduleConfig) {
                const interval = this.parseCronToInterval(scheduleConfig.cron);
                if (interval) {
                    schedule.intervalId = setInterval(async () => {
                        await this.executeScheduledWorkflow(workflowId, scheduleConfig);
                    }, interval);
                    schedule.isActive = true;
                    console.log(`Schedule resumed for workflow: ${workflowId}`);
                }
            }
        }
    }

    getScheduleInfo(workflowId: string) {
        const schedule = this.schedules.get(workflowId);

        if (!schedule || !schedule.config.schedule) {
            return null;
        }

        const scheduleConfig = schedule.config.schedule;
        const interval = this.parseCronToInterval(scheduleConfig.cron);

        return {
            cron: scheduleConfig.cron,
            timezone: scheduleConfig.timezone || "America/Sao_Paulo",
            isRunning: schedule.isActive,
            nextRun: interval && schedule.isActive ? new Date(Date.now() + interval).toISOString() : undefined,
        };
    }

    listSchedules() {
        const schedules = [];

        for (const [workflowId, schedule] of this.schedules) {
            const scheduleConfig = schedule.config.schedule;
            if (scheduleConfig) {
                const interval = this.parseCronToInterval(scheduleConfig.cron);

                schedules.push({
                    workflowId,
                    cron: scheduleConfig.cron,
                    timezone: scheduleConfig.timezone || "America/Sao_Paulo",
                    isRunning: schedule.isActive,
                    nextRun: interval && schedule.isActive ? new Date(Date.now() + interval).toISOString() : undefined,
                });
            }
        }

        return schedules;
    }

    async cleanup(): Promise<void> {
        console.log("Cleaning up schedule triggers...");

        for (const [workflowId, schedule] of this.schedules) {
            if (schedule.intervalId) {
                clearInterval(schedule.intervalId);
            }
            console.log(`Stopped schedule for workflow: ${workflowId}`);
        }

        this.schedules.clear();
        console.log("Schedule cleanup completed");
    }
}
