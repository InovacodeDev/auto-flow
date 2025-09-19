import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
    Activity,
    TrendingUp,
    Clock,
    DollarSign,
    AlertTriangle,
    CheckCircle,
    Zap,
    BarChart3,
    RefreshCw,
} from "lucide-react";

interface MetricCard {
    title: string;
    value: string | number;
    change?: string;
    trend?: "up" | "down" | "neutral";
    icon: React.ReactNode;
}

interface WorkflowMetrics {
    id: string;
    name: string;
    executions: number;
    successRate: number;
    avgDuration: number;
    roi: number;
}

interface AnalyticsDashboardProps {
    timeRange?: "1h" | "24h" | "7d" | "30d";
    onTimeRangeChange?: (range: "1h" | "24h" | "7d" | "30d") => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ timeRange = "7d", onTimeRangeChange }) => {
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    // Função para carregar métricas do backend
    const loadMetrics = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/analytics/dashboard?timeRange=${timeRange}`);

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success) {
                setMetrics(data.data);
                setLastUpdated(new Date());
            } else {
                throw new Error(data.error || "Erro ao carregar métricas");
            }
        } catch (err) {
            console.error("Erro ao carregar métricas:", err);
            setError(err instanceof Error ? err.message : "Erro desconhecido");

            // Dados mock para desenvolvimento
            setMetrics({
                overview: {
                    totalWorkflows: 15,
                    totalExecutions: 1234,
                    successRate: 94.5,
                    avgDuration: 45,
                    timeSaved: 120,
                    costSaved: 15750,
                    activeAlerts: 2,
                },
                trends: {
                    executionsChange: "+12%",
                    successRateChange: "+2.1%",
                    durationChange: "-8%",
                    roiChange: "+25%",
                },
                topWorkflows: [
                    {
                        id: "1",
                        name: "Envio WhatsApp Automático",
                        executions: 345,
                        successRate: 98.2,
                        avgDuration: 12,
                        roi: 4200,
                    },
                    {
                        id: "2",
                        name: "Processamento PIX",
                        executions: 234,
                        successRate: 99.1,
                        avgDuration: 8,
                        roi: 8900,
                    },
                    { id: "3", name: "Sync CRM Leads", executions: 156, successRate: 89.7, avgDuration: 67, roi: 2300 },
                    {
                        id: "4",
                        name: "Relatório Vendas",
                        executions: 89,
                        successRate: 95.5,
                        avgDuration: 34,
                        roi: 1800,
                    },
                ],
                recentExecutions: [
                    { date: "2024-01-15", success: 145, failed: 8, total: 153 },
                    { date: "2024-01-16", success: 167, failed: 12, total: 179 },
                    { date: "2024-01-17", success: 198, failed: 7, total: 205 },
                    { date: "2024-01-18", success: 223, failed: 15, total: 238 },
                    { date: "2024-01-19", success: 189, failed: 6, total: 195 },
                ],
                roiData: [
                    { workflow: "WhatsApp Auto", timeSaved: 45, costSaved: 4200, revenueImpact: 8500 },
                    { workflow: "PIX Process", timeSaved: 32, costSaved: 8900, revenueImpact: 12000 },
                    { workflow: "CRM Sync", timeSaved: 28, costSaved: 2300, revenueImpact: 4600 },
                    { workflow: "Reports", timeSaved: 15, costSaved: 1800, revenueImpact: 3200 },
                ],
            });
        } finally {
            setLoading(false);
        }
    }, [timeRange]);

    // Carregar dados inicialmente e configurar auto-refresh
    useEffect(() => {
        loadMetrics();

        // Auto-refresh a cada 30 segundos
        const interval = setInterval(loadMetrics, 30000);

        return () => clearInterval(interval);
    }, [loadMetrics]);

    const handleTimeRangeChange = (newRange: "1h" | "24h" | "7d" | "30d") => {
        onTimeRangeChange?.(newRange);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };

    const formatDuration = (seconds: number) => {
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.round(seconds / 60)}min`;
        return `${Math.round(seconds / 3600)}h`;
    };

    if (loading && !metrics) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Carregando métricas...</span>
                </div>
            </div>
        );
    }

    if (error && !metrics) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <div className="text-center">
                    <p className="text-red-600 font-medium">Erro ao carregar dashboard</p>
                    <p className="text-sm text-gray-600">{error}</p>
                </div>
                <Button onClick={loadMetrics} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tentar Novamente
                </Button>
            </div>
        );
    }

    const metricCards: MetricCard[] = [
        {
            title: "Total de Execuções",
            value: metrics?.overview?.totalExecutions || 0,
            change: metrics?.trends?.executionsChange,
            trend: "up",
            icon: <Activity className="h-4 w-4" />,
        },
        {
            title: "Taxa de Sucesso",
            value: `${metrics?.overview?.successRate || 0}%`,
            change: metrics?.trends?.successRateChange,
            trend: "up",
            icon: <CheckCircle className="h-4 w-4" />,
        },
        {
            title: "Tempo Médio",
            value: formatDuration(metrics?.overview?.avgDuration || 0),
            change: metrics?.trends?.durationChange,
            trend: "down",
            icon: <Clock className="h-4 w-4" />,
        },
        {
            title: "Economia Total",
            value: formatCurrency(metrics?.overview?.costSaved || 0),
            change: metrics?.trends?.roiChange,
            trend: "up",
            icon: <DollarSign className="h-4 w-4" />,
        },
    ];

    return (
        <div className="space-y-6 p-6">
            {/* Header com controles */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Analytics</h1>
                    <p className="text-sm text-gray-600">
                        Última atualização: {lastUpdated.toLocaleTimeString("pt-BR")}
                        {loading && (
                            <span className="ml-2 inline-flex items-center">
                                <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                                Atualizando...
                            </span>
                        )}
                    </p>
                </div>

                <div className="flex space-x-2">
                    {["1h", "24h", "7d", "30d"].map((range) => (
                        <Button
                            key={range}
                            variant={timeRange === range ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleTimeRangeChange(range as any)}
                        >
                            {range === "1h"
                                ? "1 Hora"
                                : range === "24h"
                                  ? "24 Horas"
                                  : range === "7d"
                                    ? "7 Dias"
                                    : "30 Dias"}
                        </Button>
                    ))}
                    <Button variant="outline" size="sm" onClick={loadMetrics}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Alertas ativos */}
            {metrics?.overview?.activeAlerts > 0 && (
                <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-4">
                        <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                            <span className="font-medium text-yellow-800">
                                {metrics.overview.activeAlerts} alerta{metrics.overview.activeAlerts > 1 ? "s" : ""}{" "}
                                ativo{metrics.overview.activeAlerts > 1 ? "s" : ""}
                            </span>
                            <Button variant="link" size="sm" className="text-yellow-700 p-0">
                                Ver detalhes
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Cards de métricas principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {metricCards.map((metric, index) => (
                    <Card key={index}>
                        <CardContent className="pt-4">
                            <div className="flex items-center justify-between space-y-0 pb-2">
                                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                                <div className="text-gray-400">{metric.icon}</div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <p className="text-2xl font-bold">{metric.value}</p>
                                {metric.change && (
                                    <Badge
                                        variant={
                                            metric.trend === "up"
                                                ? "default"
                                                : metric.trend === "down"
                                                  ? "secondary"
                                                  : "outline"
                                        }
                                        className={
                                            metric.trend === "up"
                                                ? "bg-green-100 text-green-800"
                                                : metric.trend === "down"
                                                  ? "bg-red-100 text-red-800"
                                                  : "bg-gray-100 text-gray-800"
                                        }
                                    >
                                        <TrendingUp
                                            className={`h-3 w-3 mr-1 ${metric.trend === "down" ? "rotate-180" : ""}`}
                                        />
                                        {metric.change}
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Placeholder para gráficos futuros */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <BarChart3 className="h-5 w-5" />
                            <span>Execuções por Dia</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                            <p className="text-gray-500">Gráfico será implementado com biblioteca de charts</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <DollarSign className="h-5 w-5" />
                            <span>ROI por Workflow</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                            <p className="text-gray-500">Gráfico será implementado com biblioteca de charts</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Workflows */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Zap className="h-5 w-5" />
                        <span>Top Workflows</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {metrics?.topWorkflows?.map((workflow: WorkflowMetrics, index: number) => (
                            <div key={workflow.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="text-sm font-medium text-gray-500">#{index + 1}</div>
                                    <div>
                                        <p className="font-medium">{workflow.name}</p>
                                        <p className="text-sm text-gray-600">
                                            {workflow.executions} execuções • {workflow.successRate}% sucesso
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">{formatCurrency(workflow.roi)}</p>
                                    <p className="text-sm text-gray-600">{formatDuration(workflow.avgDuration)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
