import React, { useState } from "react";
import { MaterialIcon } from "../ui/MaterialIcon";
import {
    useIntegrationsOverview,
    useIntegrationsHealth,
    useIntegrationsStats,
    useSyncIntegrations,
    useCleanupIntegrations,
    useExportIntegrations,
} from "../../services/integrationsService";
import { IntegrationCard } from "./IntegrationCard";
import { IntegrationsStats } from "./IntegrationsStats";
import { IntegrationsOperations } from "./IntegrationsOperations";
import { IntegrationsAlerts } from "./IntegrationsAlerts";
import { IntegrationsFilters } from "./IntegrationsFilters";

export const IntegrationsDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<"overview" | "integrations" | "operations" | "alerts">("overview");
    const [filters, setFilters] = useState<{
        type?: string;
        status?: string;
        platform?: string;
    }>({});

    const { data: overview, isLoading: overviewLoading, error: overviewError } = useIntegrationsOverview();
    const { data: health, isLoading: healthLoading, error: healthError } = useIntegrationsHealth();
    const { data: stats, isLoading: statsLoading, error: statsError } = useIntegrationsStats();

    const syncMutation = useSyncIntegrations();
    const cleanupMutation = useCleanupIntegrations();
    const exportMutation = useExportIntegrations();

    const handleSyncAll = async () => {
        try {
            await syncMutation.mutateAsync();
        } catch (error) {
            console.error("Failed to sync integrations:", error);
        }
    };

    const handleCleanup = async () => {
        try {
            await cleanupMutation.mutateAsync();
        } catch (error) {
            console.error("Failed to cleanup integrations:", error);
        }
    };

    const handleExport = async () => {
        try {
            const data = await exportMutation.mutateAsync();
            // Create and download file
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `integrations-export-${new Date().toISOString().split("T")[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to export integrations:", error);
        }
    };

    const filteredIntegrations =
        health?.filter((integration) => {
            if (filters.type && integration.type !== filters.type) return false;
            if (filters.status && integration.status !== filters.status) return false;
            if (filters.platform && !integration.platform?.toLowerCase().includes(filters.platform.toLowerCase()))
                return false;
            return true;
        }) || [];

    if (overviewLoading || healthLoading || statsLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center space-x-2">
                    <MaterialIcon icon="refresh" className="animate-spin text-blue-500" size={24} />
                    <span className="text-gray-600">Carregando dashboard...</span>
                </div>
            </div>
        );
    }

    if (overviewError || healthError || statsError) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <MaterialIcon icon="cancel" className="text-red-500 mx-auto mb-4" size={48} />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar dashboard</h3>
                    <p className="text-gray-600">Tente recarregar a página</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard de Integrações</h1>
                    <p className="text-gray-600">Monitore e gerencie todas as suas integrações</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleSyncAll}
                        disabled={syncMutation.isPending}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        <MaterialIcon
                            icon="refresh"
                            className={`mr-2 ${syncMutation.isPending ? "animate-spin" : ""}`}
                            size={16}
                        />
                        Sincronizar Todas
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={exportMutation.isPending}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                        <MaterialIcon icon="download" className="mr-2" size={16} />
                        Exportar
                    </button>
                    <button
                        onClick={handleCleanup}
                        disabled={cleanupMutation.isPending}
                        className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                    >
                        <MaterialIcon icon="delete" className="mr-2" size={16} />
                        Limpar Dados
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { id: "overview", name: "Visão Geral", icon: "bar_chart" },
                        { id: "integrations", name: "Integrações", icon: "cloud" },
                        { id: "operations", name: "Operações", icon: "schedule" },
                        { id: "alerts", name: "Alertas", icon: "warning" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === tab.id
                                    ? "border-blue-500 text-blue-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                        >
                            <MaterialIcon icon={tab.icon} className="mr-2" size={16} />
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="space-y-6">
                {activeTab === "overview" && overview && (
                    <div className="space-y-6">
                        <IntegrationsStats stats={stats} overview={overview} />
                        <IntegrationsAlerts alerts={overview.alerts} />
                    </div>
                )}

                {activeTab === "integrations" && (
                    <div className="space-y-6">
                        <IntegrationsFilters
                            filters={filters}
                            onFiltersChange={setFilters}
                            integrations={health || []}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredIntegrations.map((integration) => (
                                <IntegrationCard key={integration.id} integration={integration} />
                            ))}
                        </div>
                        {filteredIntegrations.length === 0 && (
                            <div className="text-center py-12">
                                <MaterialIcon icon="cloud" className="text-gray-400 mx-auto mb-4" size={48} />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Nenhuma integração encontrada
                                </h3>
                                <p className="text-gray-600">Ajuste os filtros ou adicione novas integrações</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "operations" && <IntegrationsOperations />}

                {activeTab === "alerts" && overview && <IntegrationsAlerts alerts={overview.alerts} />}
            </div>
        </div>
    );
};
