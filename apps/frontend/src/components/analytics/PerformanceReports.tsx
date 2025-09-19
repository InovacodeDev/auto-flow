import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
    FileText,
    Download,
    Calendar,
    Filter,
    TrendingUp,
    TrendingDown,
    BarChart3,
    Clock,
    Target,
    AlertCircle,
    CheckCircle,
    RefreshCw,
} from "lucide-react";

interface PerformanceReport {
    id: string;
    organizationId: string;
    reportType: "summary" | "detailed" | "comparison";
    dateRange: {
        start: Date;
        end: Date;
    };

    // Métricas gerais
    totalWorkflows: number;
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    avgExecutionTime: number;

    // Análise temporal
    dailyMetrics: Array<{
        date: string;
        executions: number;
        successRate: number;
        avgDuration: number;
    }>;

    // Top performers
    topWorkflows: Array<{
        id: string;
        name: string;
        executions: number;
        successRate: number;
        avgDuration: number;
        trend: "up" | "down" | "stable";
    }>;

    // Problemas identificados
    issues: Array<{
        workflowId: string;
        workflowName: string;
        type: "high_failure_rate" | "slow_execution" | "low_usage";
        severity: "low" | "medium" | "high";
        description: string;
        suggestion: string;
    }>;

    // ROI consolidado
    totalROI: number;
    totalTimeSaved: number;
    totalCostSaved: number;

    // Tendências
    trends: {
        executionsTrend: number;
        successRateTrend: number;
        performanceTrend: number;
        roiTrend: number;
    };

    generatedAt: Date;
}

interface ReportFilters {
    startDate: string;
    endDate: string;
    workflowIds: string[];
    reportType: "summary" | "detailed" | "comparison";
    includeROI: boolean;
    includeIssues: boolean;
}

export const PerformanceReports: React.FC = () => {
    const [reports, setReports] = useState<PerformanceReport[]>([]);
    const [currentReport, setCurrentReport] = useState<PerformanceReport | null>(null);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [filters, setFilters] = useState<ReportFilters>({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
        workflowIds: [],
        reportType: "summary",
        includeROI: true,
        includeIssues: true,
    });

    // Carregar relatórios existentes
    const loadReports = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // TODO: Implementar endpoint para listar relatórios
            // const response = await fetch('/api/analytics/reports');

            // Mock data para desenvolvimento
            const mockReports: PerformanceReport[] = [
                {
                    id: "report-1",
                    organizationId: "org-1",
                    reportType: "summary",
                    dateRange: {
                        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                        end: new Date(),
                    },
                    totalWorkflows: 15,
                    totalExecutions: 1245,
                    successfulExecutions: 1178,
                    failedExecutions: 67,
                    avgExecutionTime: 42.5,
                    dailyMetrics: [
                        { date: "2024-01-15", executions: 45, successRate: 95.6, avgDuration: 41.2 },
                        { date: "2024-01-16", executions: 52, successRate: 94.2, avgDuration: 43.1 },
                        { date: "2024-01-17", executions: 38, successRate: 97.4, avgDuration: 39.8 },
                    ],
                    topWorkflows: [
                        {
                            id: "wf-1",
                            name: "WhatsApp Automático",
                            executions: 345,
                            successRate: 98.2,
                            avgDuration: 12.5,
                            trend: "up",
                        },
                        {
                            id: "wf-2",
                            name: "Processamento PIX",
                            executions: 234,
                            successRate: 99.1,
                            avgDuration: 8.3,
                            trend: "stable",
                        },
                        {
                            id: "wf-3",
                            name: "Sync CRM",
                            executions: 156,
                            successRate: 89.7,
                            avgDuration: 67.2,
                            trend: "down",
                        },
                    ],
                    issues: [
                        {
                            workflowId: "wf-3",
                            workflowName: "Sync CRM",
                            type: "high_failure_rate",
                            severity: "medium",
                            description: "Taxa de falha acima de 10%",
                            suggestion: "Revisar configurações de timeout e validações de entrada",
                        },
                    ],
                    totalROI: 15750,
                    totalTimeSaved: 120,
                    totalCostSaved: 8900,
                    trends: {
                        executionsTrend: 12.5,
                        successRateTrend: 2.1,
                        performanceTrend: -8.3,
                        roiTrend: 25.4,
                    },
                    generatedAt: new Date(),
                },
            ];

            setReports(mockReports);
        } catch (err) {
            console.error("Erro ao carregar relatórios:", err);
            setError(err instanceof Error ? err.message : "Erro desconhecido");
        } finally {
            setLoading(false);
        }
    }, []);

    // Gerar novo relatório
    const generateReport = async () => {
        try {
            setGenerating(true);
            setError(null);

            const response = await fetch("/api/analytics/report", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    startDate: filters.startDate,
                    endDate: filters.endDate,
                    workflowIds: filters.workflowIds,
                    reportType: filters.reportType,
                    includeROI: filters.includeROI,
                    includeIssues: filters.includeIssues,
                }),
            });

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success) {
                setCurrentReport(data.data);
                await loadReports(); // Recarregar lista
            } else {
                throw new Error(data.error || "Erro ao gerar relatório");
            }
        } catch (err) {
            console.error("Erro ao gerar relatório:", err);
            setError(err instanceof Error ? err.message : "Erro desconhecido");
        } finally {
            setGenerating(false);
        }
    };

    useEffect(() => {
        loadReports();
    }, [loadReports]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };

    const formatPercentage = (value: number) => {
        return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
    };

    const downloadReport = (report: PerformanceReport) => {
        // TODO: Implementar download real
        const reportData = {
            ...report,
            downloadedAt: new Date().toISOString(),
        };

        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `performance-report-${report.id}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Relatórios de Performance</h1>
                    <p className="text-sm text-gray-600">Análises detalhadas de performance e ROI dos workflows</p>
                </div>

                <Button onClick={generateReport} disabled={generating}>
                    {generating ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <FileText className="h-4 w-4 mr-2" />
                    )}
                    {generating ? "Gerando..." : "Gerar Relatório"}
                </Button>
            </div>

            {/* Filtros */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Filter className="h-5 w-5" />
                        <span>Filtros do Relatório</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Relatório</label>
                            <select
                                value={filters.reportType}
                                onChange={(e) => setFilters({ ...filters, reportType: e.target.value as any })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            >
                                <option value="summary">Resumo</option>
                                <option value="detailed">Detalhado</option>
                                <option value="comparison">Comparativo</option>
                            </select>
                        </div>

                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-medium text-gray-700">Opções</label>
                            <div className="space-y-1">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={filters.includeROI}
                                        onChange={(e) => setFilters({ ...filters, includeROI: e.target.checked })}
                                        className="mr-2"
                                    />
                                    <span className="text-sm">Incluir ROI</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={filters.includeIssues}
                                        onChange={(e) => setFilters({ ...filters, includeIssues: e.target.checked })}
                                        className="mr-2"
                                    />
                                    <span className="text-sm">Incluir Problemas</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Relatório Atual */}
            {currentReport && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Relatório Atual</span>
                                <Button variant="outline" size="sm" onClick={() => downloadReport(currentReport)}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Métricas Principais */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <BarChart3 className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-blue-900">{currentReport.totalExecutions}</p>
                                    <p className="text-sm text-blue-600">Total Execuções</p>
                                    <Badge variant="outline" className="mt-1">
                                        <TrendingUp className="h-3 w-3 mr-1" />
                                        {formatPercentage(currentReport.trends.executionsTrend)}
                                    </Badge>
                                </div>

                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-green-900">
                                        {(
                                            (currentReport.successfulExecutions / currentReport.totalExecutions) *
                                            100
                                        ).toFixed(1)}
                                        %
                                    </p>
                                    <p className="text-sm text-green-600">Taxa de Sucesso</p>
                                    <Badge variant="outline" className="mt-1">
                                        <TrendingUp className="h-3 w-3 mr-1" />
                                        {formatPercentage(currentReport.trends.successRateTrend)}
                                    </Badge>
                                </div>

                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <Clock className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-purple-900">
                                        {currentReport.avgExecutionTime.toFixed(1)}s
                                    </p>
                                    <p className="text-sm text-purple-600">Tempo Médio</p>
                                    <Badge variant="outline" className="mt-1">
                                        <TrendingDown className="h-3 w-3 mr-1" />
                                        {formatPercentage(currentReport.trends.performanceTrend)}
                                    </Badge>
                                </div>

                                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                    <Target className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-yellow-900">
                                        {formatCurrency(currentReport.totalROI)}
                                    </p>
                                    <p className="text-sm text-yellow-600">ROI Total</p>
                                    <Badge variant="outline" className="mt-1">
                                        <TrendingUp className="h-3 w-3 mr-1" />
                                        {formatPercentage(currentReport.trends.roiTrend)}
                                    </Badge>
                                </div>
                            </div>

                            {/* Top Workflows */}
                            <div className="mb-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-3">Top Workflows</h3>
                                <div className="space-y-2">
                                    {currentReport.topWorkflows.map((workflow, index) => (
                                        <div
                                            key={workflow.id}
                                            className="flex items-center justify-between p-3 border rounded-lg"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                                                <div>
                                                    <p className="font-medium">{workflow.name}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {workflow.executions} execuções • {workflow.successRate}%
                                                        sucesso
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm text-gray-600">
                                                    {workflow.avgDuration.toFixed(1)}s
                                                </span>
                                                {workflow.trend === "up" && (
                                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                                )}
                                                {workflow.trend === "down" && (
                                                    <TrendingDown className="h-4 w-4 text-red-500" />
                                                )}
                                                {workflow.trend === "stable" && (
                                                    <div className="h-4 w-4 rounded bg-gray-400" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Problemas Identificados */}
                            {currentReport.issues.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-3">Problemas Identificados</h3>
                                    <div className="space-y-3">
                                        {currentReport.issues.map((issue, index) => (
                                            <div
                                                key={index}
                                                className={`p-4 rounded-lg border-l-4 ${
                                                    issue.severity === "high"
                                                        ? "border-red-500 bg-red-50"
                                                        : issue.severity === "medium"
                                                          ? "border-yellow-500 bg-yellow-50"
                                                          : "border-blue-500 bg-blue-50"
                                                }`}
                                            >
                                                <div className="flex items-start space-x-3">
                                                    <AlertCircle
                                                        className={`h-5 w-5 mt-0.5 ${
                                                            issue.severity === "high"
                                                                ? "text-red-500"
                                                                : issue.severity === "medium"
                                                                  ? "text-yellow-500"
                                                                  : "text-blue-500"
                                                        }`}
                                                    />
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900">
                                                            {issue.workflowName}
                                                        </p>
                                                        <p className="text-sm text-gray-600 mb-2">
                                                            {issue.description}
                                                        </p>
                                                        <p className="text-sm text-gray-800 bg-white p-2 rounded border">
                                                            <strong>Sugestão:</strong> {issue.suggestion}
                                                        </p>
                                                    </div>
                                                    <Badge
                                                        variant={
                                                            issue.severity === "high"
                                                                ? "destructive"
                                                                : issue.severity === "medium"
                                                                  ? "secondary"
                                                                  : "outline"
                                                        }
                                                    >
                                                        {issue.severity === "high"
                                                            ? "Alto"
                                                            : issue.severity === "medium"
                                                              ? "Médio"
                                                              : "Baixo"}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Histórico de Relatórios */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5" />
                        <span>Histórico de Relatórios</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                            <span>Carregando relatórios...</span>
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>Nenhum relatório encontrado</p>
                            <p className="text-sm">Gere seu primeiro relatório usando os filtros acima</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {reports.map((report) => (
                                <div
                                    key={report.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                                >
                                    <div>
                                        <p className="font-medium">Relatório {report.reportType}</p>
                                        <p className="text-sm text-gray-600">
                                            {report.dateRange.start.toLocaleDateString("pt-BR")} -{" "}
                                            {report.dateRange.end.toLocaleDateString("pt-BR")}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Gerado em {report.generatedAt.toLocaleDateString("pt-BR")}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Badge variant="outline">{report.totalExecutions} execuções</Badge>
                                        <Button variant="outline" size="sm" onClick={() => setCurrentReport(report)}>
                                            Visualizar
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => downloadReport(report)}>
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-4">
                        <div className="flex items-center space-x-2">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            <span className="font-medium text-red-800">Erro</span>
                        </div>
                        <p className="text-sm text-red-600 mt-1">{error}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
