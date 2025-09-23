import React, { useState } from "react";
import {
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    FunnelIcon,
    CalendarIcon,
    ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useIntegrationsOperations } from "../../services/integrationsService";

export const IntegrationsOperations: React.FC = () => {
    const [filters, setFilters] = useState<{
        type?: string;
        platform?: string;
        status?: string;
        startDate?: string;
        endDate?: string;
        limit?: number;
    }>({
        limit: 50,
    });

    const { data, isLoading, error } = useIntegrationsOperations(filters);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "success":
                return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
            case "error":
                return <XCircleIcon className="w-4 h-4 text-red-500" />;
            case "pending":
                return <ClockIcon className="w-4 h-4 text-yellow-500" />;
            default:
                return <ExclamationTriangleIcon className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "success":
                return "text-green-600 bg-green-100";
            case "error":
                return "text-red-600 bg-red-100";
            case "pending":
                return "text-yellow-600 bg-yellow-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "success":
                return "Sucesso";
            case "error":
                return "Erro";
            case "pending":
                return "Pendente";
            default:
                return "Desconhecido";
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "whatsapp":
                return "💬";
            case "pix":
                return "💰";
            case "crm":
                return "👥";
            case "erp":
                return "🏢";
            default:
                return "🔗";
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center space-x-2">
                    <ArrowPathIcon className="w-6 h-6 animate-spin text-blue-500" />
                    <span className="text-gray-600">Carregando operações...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Erro ao carregar operações
                    </h3>
                    <p className="text-gray-600">Tente recarregar a página</p>
                </div>
            </div>
        );
    }

    const operations = data?.data || [];

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <FunnelIcon className="w-5 h-5 text-gray-500" />
                        <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                        <select
                            value={filters.type || ""}
                            onChange={(e) =>
                                setFilters({ ...filters, type: e.target.value || undefined })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Todos os tipos</option>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="pix">PIX</option>
                            <option value="crm">CRM</option>
                            <option value="erp">ERP</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            value={filters.status || ""}
                            onChange={(e) =>
                                setFilters({ ...filters, status: e.target.value || undefined })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Todos os status</option>
                            <option value="success">Sucesso</option>
                            <option value="error">Erro</option>
                            <option value="pending">Pendente</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Data Início
                        </label>
                        <input
                            type="date"
                            value={filters.startDate || ""}
                            onChange={(e) =>
                                setFilters({ ...filters, startDate: e.target.value || undefined })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Data Fim
                        </label>
                        <input
                            type="date"
                            value={filters.endDate || ""}
                            onChange={(e) =>
                                setFilters({ ...filters, endDate: e.target.value || undefined })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Operations List */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Histórico de Operações</h3>
                    <p className="text-sm text-gray-600">
                        {operations.length} operações encontradas
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tipo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Plataforma
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Operação
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Data/Hora
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Detalhes
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {operations.map((operation) => (
                                <tr key={operation.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <span className="text-lg mr-2">
                                                {getTypeIcon(operation.integrationType)}
                                            </span>
                                            <span className="text-sm font-medium text-gray-900 capitalize">
                                                {operation.integrationType}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-900">
                                            {operation.platform}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-900">
                                            {operation.operation}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {getStatusIcon(operation.status)}
                                            <span
                                                className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(operation.status)}`}
                                            >
                                                {getStatusText(operation.status)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center text-sm text-gray-900">
                                            <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                                            {new Date(operation.timestamp).toLocaleString("pt-BR")}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {operation.error ? (
                                            <div
                                                className="text-sm text-red-600 max-w-xs truncate"
                                                title={operation.error}
                                            >
                                                {operation.error}
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-500">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {operations.length === 0 && (
                    <div className="text-center py-12">
                        <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Nenhuma operação encontrada
                        </h3>
                        <p className="text-gray-600">
                            Ajuste os filtros ou aguarde novas operações
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
