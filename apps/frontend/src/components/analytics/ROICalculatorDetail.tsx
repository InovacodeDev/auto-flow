import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
    DollarSign,
    Clock,
    TrendingUp,
    Calculator,
    Target,
    Zap,
    RefreshCw,
    AlertCircle,
    CheckCircle,
} from "lucide-react";

interface ROICalculation {
    workflowId: string;
    workflowName: string;
    totalExecutions: number;
    timeRange: string;

    // Métricas de tempo
    avgExecutionTime: number;
    manualExecutionTime: number;
    timeSavedPerExecution: number;
    totalTimeSaved: number;

    // Métricas financeiras
    hourlyRate: number;
    totalCostSaved: number;
    implementationCost: number;
    maintenanceCost: number;
    netROI: number;
    roiPercentage: number;

    // Métricas de impacto
    revenueImpact: number;
    productivityGain: number;
    errorReduction: number;

    // Análise temporal
    paybackPeriod: number; // em dias
    monthlyROI: number;
    yearlyROI: number;

    // Status
    status: "positive" | "negative" | "break-even";
    confidence: number; // 0-100%
}

interface ROIDetailProps {
    workflowId: string;
    timeRange?: "7d" | "30d" | "90d" | "1y";
}

interface ROIInputs {
    hourlyRate: number;
    implementationHours: number;
    maintenanceHoursPerMonth: number;
    manualExecutionMinutes: number;
    revenueImpactPerExecution: number;
}

export const ROICalculatorDetail: React.FC<ROIDetailProps> = ({ workflowId, timeRange = "30d" }) => {
    const [roiData, setRoiData] = useState<ROICalculation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [customInputs, setCustomInputs] = useState<ROIInputs>({
        hourlyRate: 50,
        implementationHours: 8,
        maintenanceHoursPerMonth: 2,
        manualExecutionMinutes: 15,
        revenueImpactPerExecution: 0,
    });
    const [showCustomCalculator, setShowCustomCalculator] = useState(false);

    // Carregar dados de ROI
    const loadROIData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/analytics/workflows/${workflowId}/roi?timeRange=${timeRange}`);

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.success) {
                setRoiData(data.data);
            } else {
                throw new Error(data.error || "Erro ao carregar ROI");
            }
        } catch (err) {
            console.error("Erro ao carregar ROI:", err);
            setError(err instanceof Error ? err.message : "Erro desconhecido");

            // Dados mock para desenvolvimento
            setRoiData({
                workflowId,
                workflowName: "Envio WhatsApp Automático",
                totalExecutions: 345,
                timeRange,

                avgExecutionTime: 12, // segundos
                manualExecutionTime: 900, // 15 minutos em segundos
                timeSavedPerExecution: 888, // segundos
                totalTimeSaved: 306360, // segundos

                hourlyRate: 50,
                totalCostSaved: 4254,
                implementationCost: 400,
                maintenanceCost: 100,
                netROI: 3754,
                roiPercentage: 751,

                revenueImpact: 8500,
                productivityGain: 85.1,
                errorReduction: 92.3,

                paybackPeriod: 2.8,
                monthlyROI: 1251,
                yearlyROI: 15012,

                status: "positive",
                confidence: 87,
            });
        } finally {
            setLoading(false);
        }
    }, [workflowId, timeRange]);

    useEffect(() => {
        loadROIData();
    }, [loadROIData]);

    // Calcular ROI customizado
    const calculateCustomROI = () => {
        if (!roiData) return;

        const totalExecutions = roiData.totalExecutions;
        const timeSavedPerExecution = customInputs.manualExecutionMinutes * 60 - roiData.avgExecutionTime;
        const totalTimeSaved = timeSavedPerExecution * totalExecutions;
        const timeSavedHours = totalTimeSaved / 3600;

        const totalCostSaved = timeSavedHours * customInputs.hourlyRate;
        const implementationCost = customInputs.implementationHours * customInputs.hourlyRate;
        const maintenanceCost = (customInputs.maintenanceHoursPerMonth * customInputs.hourlyRate * 12) / 12; // Anual para mensal

        const netROI = totalCostSaved - implementationCost - maintenanceCost;
        const roiPercentage = (netROI / (implementationCost + maintenanceCost)) * 100;

        const updatedROI: ROICalculation = {
            ...roiData,
            timeSavedPerExecution,
            totalTimeSaved,
            hourlyRate: customInputs.hourlyRate,
            totalCostSaved,
            implementationCost,
            maintenanceCost,
            netROI,
            roiPercentage,
            revenueImpact: customInputs.revenueImpactPerExecution * totalExecutions,
            status: netROI > 0 ? "positive" : netROI < 0 ? "negative" : "break-even",
        };

        setRoiData(updatedROI);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };

    const formatTime = (seconds: number) => {
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.round(seconds / 60)}min`;
        return `${Math.round(seconds / 3600)}h`;
    };

    const formatPercentage = (value: number) => {
        return `${value.toFixed(1)}%`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Calculando ROI...</span>
                </div>
            </div>
        );
    }

    if (error && !roiData) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
                <div className="text-center">
                    <p className="text-red-600 font-medium">Erro ao calcular ROI</p>
                    <p className="text-sm text-gray-600">{error}</p>
                </div>
                <Button onClick={loadROIData} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tentar Novamente
                </Button>
            </div>
        );
    }

    if (!roiData) return null;

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Análise de ROI</h1>
                    <p className="text-sm text-gray-600">
                        {roiData.workflowName} • {roiData.totalExecutions} execuções • {timeRange}
                    </p>
                </div>

                <div className="flex space-x-2">
                    <Button
                        variant={showCustomCalculator ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowCustomCalculator(!showCustomCalculator)}
                    >
                        <Calculator className="h-4 w-4 mr-2" />
                        Calculadora Personalizada
                    </Button>
                    <Button variant="outline" size="sm" onClick={loadROIData}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Status ROI */}
            <Card
                className={
                    roiData.status === "positive"
                        ? "border-green-200 bg-green-50"
                        : roiData.status === "negative"
                          ? "border-red-200 bg-red-50"
                          : "border-yellow-200 bg-yellow-50"
                }
            >
                <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            {roiData.status === "positive" ? (
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            ) : roiData.status === "negative" ? (
                                <AlertCircle className="h-6 w-6 text-red-600" />
                            ) : (
                                <Target className="h-6 w-6 text-yellow-600" />
                            )}
                            <div>
                                <p className="font-semibold text-lg">
                                    {roiData.status === "positive"
                                        ? "ROI Positivo"
                                        : roiData.status === "negative"
                                          ? "ROI Negativo"
                                          : "Ponto de Equilíbrio"}
                                </p>
                                <p className="text-sm text-gray-600">Confiança: {roiData.confidence}%</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(roiData.netROI)}</p>
                            <Badge variant={roiData.status === "positive" ? "default" : "secondary"}>
                                {formatPercentage(roiData.roiPercentage)} ROI
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Calculadora Personalizada */}
            {showCustomCalculator && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Calculator className="h-5 w-5" />
                            <span>Calculadora Personalizada</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Valor Hora (R$)</label>
                                <input
                                    type="number"
                                    value={customInputs.hourlyRate}
                                    onChange={(e) =>
                                        setCustomInputs({ ...customInputs, hourlyRate: Number(e.target.value) })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Horas de Implementação
                                </label>
                                <input
                                    type="number"
                                    value={customInputs.implementationHours}
                                    onChange={(e) =>
                                        setCustomInputs({
                                            ...customInputs,
                                            implementationHours: Number(e.target.value),
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Manutenção/Mês (horas)
                                </label>
                                <input
                                    type="number"
                                    value={customInputs.maintenanceHoursPerMonth}
                                    onChange={(e) =>
                                        setCustomInputs({
                                            ...customInputs,
                                            maintenanceHoursPerMonth: Number(e.target.value),
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tempo Manual (minutos)
                                </label>
                                <input
                                    type="number"
                                    value={customInputs.manualExecutionMinutes}
                                    onChange={(e) =>
                                        setCustomInputs({
                                            ...customInputs,
                                            manualExecutionMinutes: Number(e.target.value),
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Impacto Receita/Execução (R$)
                                </label>
                                <input
                                    type="number"
                                    value={customInputs.revenueImpactPerExecution}
                                    onChange={(e) =>
                                        setCustomInputs({
                                            ...customInputs,
                                            revenueImpactPerExecution: Number(e.target.value),
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div className="flex items-end">
                                <Button onClick={calculateCustomROI} className="w-full">
                                    Recalcular ROI
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Métricas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between pb-2">
                            <p className="text-sm font-medium text-gray-600">Economia Total</p>
                            <DollarSign className="h-4 w-4 text-gray-400" />
                        </div>
                        <p className="text-2xl font-bold">{formatCurrency(roiData.totalCostSaved)}</p>
                        <p className="text-xs text-gray-500">Últimos {timeRange}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between pb-2">
                            <p className="text-sm font-medium text-gray-600">Tempo Poupado</p>
                            <Clock className="h-4 w-4 text-gray-400" />
                        </div>
                        <p className="text-2xl font-bold">{formatTime(roiData.totalTimeSaved)}</p>
                        <p className="text-xs text-gray-500">
                            {formatTime(roiData.timeSavedPerExecution)} por execução
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between pb-2">
                            <p className="text-sm font-medium text-gray-600">Ganho Produtividade</p>
                            <TrendingUp className="h-4 w-4 text-gray-400" />
                        </div>
                        <p className="text-2xl font-bold">{formatPercentage(roiData.productivityGain)}</p>
                        <p className="text-xs text-gray-500">vs processo manual</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between pb-2">
                            <p className="text-sm font-medium text-gray-600">Payback</p>
                            <Target className="h-4 w-4 text-gray-400" />
                        </div>
                        <p className="text-2xl font-bold">{roiData.paybackPeriod.toFixed(1)} dias</p>
                        <p className="text-xs text-gray-500">Retorno do investimento</p>
                    </CardContent>
                </Card>
            </div>

            {/* Análise Detalhada */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Breakdown de Custos */}
                <Card>
                    <CardHeader>
                        <CardTitle>Breakdown de Custos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Implementação</span>
                                <span className="font-medium">{formatCurrency(roiData.implementationCost)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Manutenção ({timeRange})</span>
                                <span className="font-medium">{formatCurrency(roiData.maintenanceCost)}</span>
                            </div>
                            <hr />
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Economia Obtida</span>
                                <span className="font-medium text-green-600">
                                    {formatCurrency(roiData.totalCostSaved)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center border-t pt-2">
                                <span className="font-medium">ROI Líquido</span>
                                <span className={`font-bold ${roiData.netROI > 0 ? "text-green-600" : "text-red-600"}`}>
                                    {formatCurrency(roiData.netROI)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Impacto no Negócio */}
                <Card>
                    <CardHeader>
                        <CardTitle>Impacto no Negócio</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Redução de Erros</span>
                                <Badge variant="default">{formatPercentage(roiData.errorReduction)}</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Impacto na Receita</span>
                                <span className="font-medium text-blue-600">
                                    {formatCurrency(roiData.revenueImpact)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">ROI Mensal</span>
                                <span className="font-medium">{formatCurrency(roiData.monthlyROI)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">ROI Anual Projetado</span>
                                <span className="font-medium text-green-600">{formatCurrency(roiData.yearlyROI)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recomendações */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Zap className="h-5 w-5" />
                        <span>Recomendações</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {roiData.status === "positive" && (
                            <div className="flex items-start space-x-2">
                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                <div>
                                    <p className="font-medium text-green-800">Workflow Altamente Rentável</p>
                                    <p className="text-sm text-gray-600">
                                        Este workflow está gerando excelente retorno. Considere replicar esta automação
                                        em outros processos similares.
                                    </p>
                                </div>
                            </div>
                        )}

                        {roiData.paybackPeriod < 30 && (
                            <div className="flex items-start space-x-2">
                                <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5" />
                                <div>
                                    <p className="font-medium text-blue-800">Payback Rápido</p>
                                    <p className="text-sm text-gray-600">
                                        O retorno do investimento em menos de 30 dias indica alta eficiência da
                                        automação.
                                    </p>
                                </div>
                            </div>
                        )}

                        {roiData.errorReduction > 80 && (
                            <div className="flex items-start space-x-2">
                                <Target className="h-5 w-5 text-purple-500 mt-0.5" />
                                <div>
                                    <p className="font-medium text-purple-800">Alta Redução de Erros</p>
                                    <p className="text-sm text-gray-600">
                                        A automação está reduzindo significativamente erros manuais, melhorando a
                                        qualidade dos processos.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
