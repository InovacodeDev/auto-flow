import React from "react";
import { MaterialIcon } from "../ui/MaterialIcon";
import { IntegrationHealth } from "../../services/integrationsService";

interface IntegrationsFiltersProps {
    filters: {
        type?: string;
        status?: string;
        platform?: string;
    };
    onFiltersChange: (filters: { type?: string; status?: string; platform?: string }) => void;
    integrations: IntegrationHealth[];
}

export const IntegrationsFilters: React.FC<IntegrationsFiltersProps> = ({ filters, onFiltersChange, integrations }) => {
    const typeOptions = [
        {
            value: "whatsapp",
            label: "WhatsApp",
            count: integrations.filter((i) => i.type === "whatsapp").length,
        },
        { value: "pix", label: "PIX", count: integrations.filter((i) => i.type === "pix").length },
        { value: "crm", label: "CRM", count: integrations.filter((i) => i.type === "crm").length },
        { value: "erp", label: "ERP", count: integrations.filter((i) => i.type === "erp").length },
    ];

    const statusOptions = [
        {
            value: "connected",
            label: "Conectado",
            count: integrations.filter((i) => i.status === "connected").length,
        },
        {
            value: "disconnected",
            label: "Desconectado",
            count: integrations.filter((i) => i.status === "disconnected").length,
        },
        {
            value: "error",
            label: "Erro",
            count: integrations.filter((i) => i.status === "error").length,
        },
        {
            value: "configuring",
            label: "Configurando",
            count: integrations.filter((i) => i.status === "configuring").length,
        },
    ];

    const platformOptions = Array.from(new Set(integrations.map((i) => i.platform).filter(Boolean))).map(
        (platform) => ({
            value: platform!,
            label: platform!,
            count: integrations.filter((i) => i.platform === platform).length,
        })
    );

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        if (value === "") {
            const newFilters = { ...filters };
            delete newFilters[key];
            onFiltersChange(newFilters);
        } else {
            onFiltersChange({ ...filters, [key]: value });
        }
    };

    const clearFilters = () => {
        onFiltersChange({});
    };

    const hasActiveFilters = Object.keys(filters).length > 0;

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <MaterialIcon icon="filter_list" className="text-gray-500" size={20} />
                    <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
                </div>
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                    >
                        <MaterialIcon icon="close" className="text-gray-600 mr-1" size={16} />
                        Limpar Filtros
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Tipo */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Integração</label>
                    <select
                        value={filters.type || ""}
                        onChange={(e) => handleFilterChange("type", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Todos os tipos</option>
                        {typeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label} ({option.count})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Status */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                        value={filters.status || ""}
                        onChange={(e) => handleFilterChange("status", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Todos os status</option>
                        {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label} ({option.count})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Plataforma */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Plataforma</label>
                    <select
                        value={filters.platform || ""}
                        onChange={(e) => handleFilterChange("platform", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">Todas as plataformas</option>
                        {platformOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label} ({option.count})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Filtros ativos:</span>
                        {filters.type && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Tipo: {typeOptions.find((o) => o.value === filters.type)?.label}
                                <button
                                    onClick={() => handleFilterChange("type", "")}
                                    className="ml-1 text-blue-600 hover:text-blue-800"
                                >
                                    <MaterialIcon icon="close" className="text-blue-600" size={12} />
                                </button>
                            </span>
                        )}
                        {filters.status && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Status: {statusOptions.find((o) => o.value === filters.status)?.label}
                                <button
                                    onClick={() => handleFilterChange("status", "")}
                                    className="ml-1 text-green-600 hover:text-green-800"
                                >
                                    <MaterialIcon icon="close" className="text-green-600" size={12} />
                                </button>
                            </span>
                        )}
                        {filters.platform && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                Plataforma: {filters.platform}
                                <button
                                    onClick={() => handleFilterChange("platform", "")}
                                    className="ml-1 text-purple-600 hover:text-purple-800"
                                >
                                    <MaterialIcon icon="close" className="text-purple-600" size={12} />
                                </button>
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
