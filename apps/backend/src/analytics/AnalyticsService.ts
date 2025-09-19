import { EventEmitter } from "events";
import { WorkflowExecution, WorkflowMetrics, ROICalculation, PerformanceReport } from "../core/types";

/**
 * AutoFlowAnalyticsService - Sistema de métricas e analytics em tempo real
 * Coleta, processa e disponibiliza dados para dashboards e relatórios
 */
export class AnalyticsService extends EventEmitter {
    private metricsCache: Map<string, WorkflowMetrics> = new Map();
    private executionHistory: WorkflowExecution[] = [];
    private roiCalculations: Map<string, ROICalculation> = new Map();

    constructor() {
        super();
        this.setupMetricsCollection();
    }

    /**
     * Registra execução de workflow para analytics
     */
    async recordWorkflowExecution(execution: WorkflowExecution): Promise<void> {
        try {
            // Adicionar ao histórico
            this.executionHistory.push(execution);

            // Manter apenas últimos 10.000 registros para performance
            if (this.executionHistory.length > 10000) {
                this.executionHistory = this.executionHistory.slice(-10000);
            }

            // Atualizar métricas em cache
            await this.updateWorkflowMetrics(execution);

            // Calcular ROI atualizado
            await this.updateROICalculation(execution.workflowId, execution.organizationId);

            // Emitir evento para updates em tempo real
            this.emit("execution-recorded", {
                workflowId: execution.workflowId,
                organizationId: execution.organizationId,
                status: execution.status,
                duration: execution.duration,
                timestamp: execution.startTime,
            });

            // Verificar alertas
            await this.checkAlerts(execution);

            console.log(`[Analytics] Recorded execution for workflow ${execution.workflowId}`);
        } catch (error) {
            console.error("[Analytics] Error recording execution:", error);
        }
    }

    /**
     * Obter métricas consolidadas de uma organização
     */
    async getOrganizationMetrics(organizationId: string, timeRange?: string): Promise<any> {
        const range = this.parseTimeRange(timeRange || "7d");
        const executions = this.getExecutionsInRange(organizationId, range);

        const totalExecutions = executions.length;
        const successfulExecutions = executions.filter((e) => e.status === "success").length;
        const failedExecutions = executions.filter((e) => e.status === "failed").length;
        const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;

        const totalDuration = executions.reduce((sum, e) => sum + (e.duration || 0), 0);
        const avgDuration = totalExecutions > 0 ? totalDuration / totalExecutions : 0;

        const timeSaved = this.calculateTimeSaved(executions);
        const costSavings = this.calculateCostSavings(timeSaved);

        return {
            overview: {
                totalExecutions,
                successfulExecutions,
                failedExecutions,
                successRate: Math.round(successRate * 100) / 100,
                avgDuration: Math.round(avgDuration),
                timeSavedHours: Math.round(timeSaved * 100) / 100,
                costSavingsReais: Math.round(costSavings * 100) / 100,
            },
            trends: this.calculateTrends(executions),
            topWorkflows: this.getTopWorkflows(organizationId, range),
            recentExecutions: executions.slice(-10).reverse(),
        };
    }

    /**
     * Obter métricas específicas de um workflow
     */
    async getWorkflowMetrics(workflowId: string, organizationId: string): Promise<WorkflowMetrics> {
        const cacheKey = `${organizationId}_${workflowId}`;

        if (this.metricsCache.has(cacheKey)) {
            return this.metricsCache.get(cacheKey)!;
        }

        // Calcular métricas se não estiver em cache
        const executions = this.executionHistory.filter(
            (e) => e.workflowId === workflowId && e.organizationId === organizationId
        );

        const metrics = this.calculateWorkflowMetrics(workflowId, organizationId, executions);
        this.metricsCache.set(cacheKey, metrics);

        return metrics;
    }

    /**
     * Calcular ROI de um workflow
     */
    async calculateWorkflowROI(workflowId: string, organizationId: string): Promise<ROICalculation> {
        const cacheKey = `${organizationId}_${workflowId}`;

        if (this.roiCalculations.has(cacheKey)) {
            return this.roiCalculations.get(cacheKey)!;
        }

        const executions = this.executionHistory.filter(
            (e) => e.workflowId === workflowId && e.organizationId === organizationId
        );

        const roi = this.calculateROI(executions);
        this.roiCalculations.set(cacheKey, roi);

        return roi;
    }

    /**
     * Gerar relatório de performance detalhado
     */
    async generatePerformanceReport(
        organizationId: string,
        startDate: Date,
        endDate: Date
    ): Promise<PerformanceReport> {
        const executions = this.executionHistory.filter(
            (e) => e.organizationId === organizationId && e.startTime >= startDate && e.startTime <= endDate
        );

        const workflowBreakdown = this.getWorkflowBreakdown(executions);
        const timeAnalysis = this.getTimeAnalysis(executions);
        const errorAnalysis = this.getErrorAnalysis(executions);
        const integrationUsage = this.getIntegrationUsage(executions);

        return {
            organizationId,
            period: { startDate, endDate },
            summary: {
                totalExecutions: executions.length,
                successRate: this.calculateSuccessRate(executions),
                avgExecutionTime: this.calculateAvgExecutionTime(executions),
                totalTimeSaved: this.calculateTimeSaved(executions),
                totalCostSavings: this.calculateCostSavings(this.calculateTimeSaved(executions)),
            },
            workflowBreakdown,
            timeAnalysis,
            errorAnalysis,
            integrationUsage,
            recommendations: this.generateRecommendations(executions),
            generatedAt: new Date(),
        };
    }

    /**
     * Obter alertas ativos
     */
    async getActiveAlerts(organizationId: string): Promise<any[]> {
        const recentExecutions = this.executionHistory.filter((e) => e.organizationId === organizationId).slice(-100);

        const alerts = [];

        // Alert: Taxa de erro alta (>10% nas últimas 24h)
        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recent24h = recentExecutions.filter((e) => e.startTime >= last24h);

        if (recent24h.length > 10) {
            const errorRate = recent24h.filter((e) => e.status === "failed").length / recent24h.length;
            if (errorRate > 0.1) {
                alerts.push({
                    type: "high_error_rate",
                    severity: "warning",
                    message: `Taxa de erro de ${Math.round(errorRate * 100)}% nas últimas 24h`,
                    details: { errorRate, period: "24h", executions: recent24h.length },
                    timestamp: new Date(),
                });
            }
        }

        // Alert: Workflow lento (>5x tempo médio)
        const slowExecutions = recentExecutions.filter((e) => {
            const avgTime = this.calculateAvgExecutionTime(
                recentExecutions.filter((ex) => ex.workflowId === e.workflowId)
            );
            return e.duration && e.duration > avgTime * 5;
        });

        slowExecutions.forEach((execution) => {
            alerts.push({
                type: "slow_execution",
                severity: "info",
                message: `Workflow ${execution.workflowId} executou 5x mais lento que o normal`,
                details: { workflowId: execution.workflowId, duration: execution.duration },
                timestamp: execution.startTime,
            });
        });

        return alerts;
    }

    /**
     * Setup para coleta automática de métricas
     */
    private setupMetricsCollection(): void {
        // Limpar cache a cada hora
        setInterval(
            () => {
                this.cleanupCache();
            },
            60 * 60 * 1000
        );

        // Recalcular ROI a cada 6 horas
        setInterval(
            () => {
                this.recalculateAllROI();
            },
            6 * 60 * 60 * 1000
        );

        console.log("[Analytics] Metrics collection setup completed");
    }

    /**
     * Atualizar métricas de workflow
     */
    private async updateWorkflowMetrics(execution: WorkflowExecution): Promise<void> {
        const cacheKey = `${execution.organizationId}_${execution.workflowId}`;
        const executions = this.executionHistory.filter(
            (e) => e.workflowId === execution.workflowId && e.organizationId === execution.organizationId
        );

        const metrics = this.calculateWorkflowMetrics(execution.workflowId, execution.organizationId, executions);
        this.metricsCache.set(cacheKey, metrics);
    }

    /**
     * Calcular métricas de um workflow
     */
    private calculateWorkflowMetrics(
        workflowId: string,
        organizationId: string,
        executions: WorkflowExecution[]
    ): WorkflowMetrics {
        const totalExecutions = executions.length;
        const successfulExecutions = executions.filter((e) => e.status === "success").length;
        const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;

        const totalDuration = executions.reduce((sum, e) => sum + (e.duration || 0), 0);
        const avgDuration = totalExecutions > 0 ? totalDuration / totalExecutions : 0;

        const last24h = executions.filter((e) => e.startTime >= new Date(Date.now() - 24 * 60 * 60 * 1000));
        const last7d = executions.filter((e) => e.startTime >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

        return {
            workflowId,
            organizationId,
            totalExecutions,
            successfulExecutions,
            failedExecutions: totalExecutions - successfulExecutions,
            successRate: Math.round(successRate * 100) / 100,
            avgDuration: Math.round(avgDuration),
            executionsLast24h: last24h.length,
            executionsLast7d: last7d.length,
            lastExecution: executions[executions.length - 1]?.startTime || null,
            timeSaved: this.calculateTimeSaved(executions),
            updatedAt: new Date(),
        };
    }

    /**
     * Calcular ROI baseado em execuções
     */
    private calculateROI(executions: WorkflowExecution[]): ROICalculation {
        const timeSavedHours = this.calculateTimeSaved(executions);
        const hourlyRate = 25; // R$ 25/hora para PME brasileira
        const costSavings = timeSavedHours * hourlyRate;

        // Estimativa conservadora de revenue impact (10% do cost savings)
        const revenueImpact = costSavings * 0.1;

        const totalROI = costSavings + revenueImpact;
        const efficiency = executions.length > 0 ? this.calculateSuccessRate(executions) : 0;

        return {
            timeSavings: Math.round(timeSavedHours * 100) / 100,
            costSavings: Math.round(costSavings * 100) / 100,
            revenueImpact: Math.round(revenueImpact * 100) / 100,
            totalROI: Math.round(totalROI * 100) / 100,
            efficiency: Math.round(efficiency * 100) / 100,
            period: "monthly",
            calculatedAt: new Date(),
        };
    }

    /**
     * Calcular tempo economizado baseado em execuções
     */
    private calculateTimeSaved(executions: WorkflowExecution[]): number {
        // Estimativa: cada execução de workflow economiza 15 minutos de trabalho manual
        const manualTimePerExecution = 0.25; // 15 minutos = 0.25 horas
        const successfulExecutions = executions.filter((e) => e.status === "success").length;
        return successfulExecutions * manualTimePerExecution;
    }

    /**
     * Calcular economia de custo baseado em tempo economizado
     */
    private calculateCostSavings(timeSavedHours: number): number {
        const hourlyRate = 25; // R$ 25/hora (salário médio PME + encargos)
        return timeSavedHours * hourlyRate;
    }

    /**
     * Calcular taxa de sucesso
     */
    private calculateSuccessRate(executions: WorkflowExecution[]): number {
        if (executions.length === 0) return 0;
        const successful = executions.filter((e) => e.status === "success").length;
        return (successful / executions.length) * 100;
    }

    /**
     * Calcular tempo médio de execução
     */
    private calculateAvgExecutionTime(executions: WorkflowExecution[]): number {
        if (executions.length === 0) return 0;
        const totalDuration = executions.reduce((sum, e) => sum + (e.duration || 0), 0);
        return totalDuration / executions.length;
    }

    /**
     * Verificar alertas baseados em execução
     */
    private async checkAlerts(execution: WorkflowExecution): Promise<void> {
        // Alert para execução falha
        if (execution.status === "failed") {
            this.emit("alert", {
                type: "execution_failed",
                severity: "error",
                workflowId: execution.workflowId,
                organizationId: execution.organizationId,
                message: `Falha na execução do workflow ${execution.workflowId}`,
                details: execution,
                timestamp: new Date(),
            });
        }

        // Alert para execução muito lenta (>5 minutos)
        if (execution.duration && execution.duration > 300000) {
            this.emit("alert", {
                type: "slow_execution",
                severity: "warning",
                workflowId: execution.workflowId,
                organizationId: execution.organizationId,
                message: `Execução lenta detectada: ${Math.round(execution.duration / 1000)}s`,
                details: execution,
                timestamp: new Date(),
            });
        }
    }

    /**
     * Utilitários
     */
    private parseTimeRange(range: string): { start: Date; end: Date } {
        const end = new Date();
        let start: Date;

        switch (range) {
            case "1h":
                start = new Date(end.getTime() - 60 * 60 * 1000);
                break;
            case "24h":
                start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
                break;
            case "7d":
                start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case "30d":
                start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            default:
                start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
        }

        return { start, end };
    }

    private getExecutionsInRange(organizationId: string, range: { start: Date; end: Date }): WorkflowExecution[] {
        return this.executionHistory.filter(
            (e) => e.organizationId === organizationId && e.startTime >= range.start && e.startTime <= range.end
        );
    }

    private calculateTrends(_executions: WorkflowExecution[]): any {
        // Implementar cálculo de tendências
        return {
            executionsTrend: "stable",
            successRateTrend: "improving",
            performanceTrend: "stable",
        };
    }

    private getTopWorkflows(organizationId: string, range: { start: Date; end: Date }): any[] {
        const executions = this.getExecutionsInRange(organizationId, range);
        const workflowCounts = new Map<string, number>();

        executions.forEach((e) => {
            const count = workflowCounts.get(e.workflowId) || 0;
            workflowCounts.set(e.workflowId, count + 1);
        });

        return Array.from(workflowCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([workflowId, count]) => ({ workflowId, executions: count }));
    }

    private cleanupCache(): void {
        // Limpar cache antigo (>24h)
        console.log("[Analytics] Cleaning up cache...");
    }

    private async recalculateAllROI(): Promise<void> {
        console.log("[Analytics] Recalculating all ROI...");
        this.roiCalculations.clear();
    }

    private getWorkflowBreakdown(_executions: WorkflowExecution[]): any {
        return {};
    }

    private getTimeAnalysis(_executions: WorkflowExecution[]): any {
        return {};
    }

    private getErrorAnalysis(_executions: WorkflowExecution[]): any {
        return {};
    }

    private getIntegrationUsage(_executions: WorkflowExecution[]): any {
        return {};
    }

    private generateRecommendations(_executions: WorkflowExecution[]): string[] {
        return ["Optimize slow workflows", "Review failed executions"];
    }

    private async updateROICalculation(workflowId: string, organizationId: string): Promise<void> {
        const cacheKey = `${organizationId}_${workflowId}`;
        const executions = this.executionHistory.filter(
            (e) => e.workflowId === workflowId && e.organizationId === organizationId
        );
        const roi = this.calculateROI(executions);
        this.roiCalculations.set(cacheKey, roi);
    }
}

export default AnalyticsService;
