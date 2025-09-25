import React from "react";
import { MaterialIcon } from "../ui/MaterialIcon";
import { IntegrationStats, IntegrationOverview } from "../../services/integrationsService";

interface IntegrationsStatsProps {
    stats?: IntegrationStats;
    overview?: IntegrationOverview;
}

export const IntegrationsStats: React.FC<IntegrationsStatsProps> = ({ stats, overview }) => {
    if (!stats || !overview) return null;

    const statCards = [
        {
            name: "Total de Integrações",
            value: overview.summary.totalIntegrations,
            icon: "bar_chart",
            color: "text-blue-600",
            bgColor: "bg-blue-100",
        },
        {
            name: "Integrações Ativas",
            value: overview.summary.activeIntegrations,
            icon: "check_circle",
            color: "text-green-600",
            bgColor: "bg-green-100",
        },
        {
            name: "Com Erro",
            value: overview.summary.errorIntegrations,
            icon: "cancel",
            color: "text-red-600",
            bgColor: "bg-red-100",
        },
        {
            name: "Configurando",
            value: overview.summary.configuringIntegrations,
            icon: "schedule",
            color: "text-yellow-600",
            bgColor: "bg-yellow-100",
        },
    ];

    const metricCards = [
        {
            name: "Operações Mensais",
            value: stats.monthlyOperations.toLocaleString(),
            icon: "bar_chart",
            color: "text-blue-600",
            bgColor: "bg-blue-100",
            trend: "+12%",
            trendUp: true,
        },
        {
            name: "Taxa de Sucesso",
            value: `${stats.successRate}%`,
            icon: "check_circle",
            color: "text-green-600",
            bgColor: "bg-green-100",
            trend: "+2.1%",
            trendUp: true,
        },
        {
            name: "Receita Total",
            value: `R$ ${stats.totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
            icon: "attach_money",
            color: "text-emerald-600",
            bgColor: "bg-emerald-100",
            trend: "+8.5%",
            trendUp: true,
        },
        {
            name: "Tempo Médio de Resposta",
            value: `${overview.metrics.avgResponseTime}ms`,
            icon: "schedule",
            color: "text-purple-600",
            bgColor: "bg-purple-100",
            trend: "-15ms",
            trendUp: false,
        },
    ];

    const typeStats = [
        {
            name: "WhatsApp",
            count: overview.byType.whatsapp,
            color: "bg-green-500",
            percentage:
                overview.summary.totalIntegrations > 0
                    ? (overview.byType.whatsapp / overview.summary.totalIntegrations) * 100
                    : 0,
        },
        {
            name: "PIX",
            count: overview.byType.pix,
            color: "bg-blue-500",
            percentage:
                overview.summary.totalIntegrations > 0
                    ? (overview.byType.pix / overview.summary.totalIntegrations) * 100
                    : 0,
        },
        {
            name: "CRM",
            count: overview.byType.crm,
            color: "bg-purple-500",
            percentage:
                overview.summary.totalIntegrations > 0
                    ? (overview.byType.crm / overview.summary.totalIntegrations) * 100
                    : 0,
        },
        {
            name: "ERP",
            count: overview.byType.erp,
            color: "bg-orange-500",
            percentage:
                overview.summary.totalIntegrations > 0
                    ? (overview.byType.erp / overview.summary.totalIntegrations) * 100
                    : 0,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                    <div key={stat.name} className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                <MaterialIcon icon={stat.icon} className={stat.color} size={24} />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metricCards.map((metric) => (
                    <div key={metric.name} className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                                    <MaterialIcon icon={metric.icon} className={metric.color} size={24} />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                {metric.trendUp ? (
                                    <MaterialIcon icon="trending_up" className="text-green-500 mr-1" size={16} />
                                ) : (
                                    <MaterialIcon icon="trending_down" className="text-red-500 mr-1" size={16} />
                                )}
                                <span
                                    className={`text-sm font-medium ${metric.trendUp ? "text-green-600" : "text-red-600"}`}
                                >
                                    {metric.trend}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Distribution by Type */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Distribuição por Tipo</h3>
                <div className="space-y-4">
                    {typeStats.map((type) => (
                        <div key={type.name} className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className={`w-3 h-3 rounded-full ${type.color} mr-3`} />
                                <span className="text-sm font-medium text-gray-700">{type.name}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <span className="text-sm text-gray-600">{type.count} integrações</span>
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${type.color}`}
                                        style={{ width: `${type.percentage}%` }}
                                    />
                                </div>
                                <span className="text-sm text-gray-600 w-12 text-right">
                                    {type.percentage.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
