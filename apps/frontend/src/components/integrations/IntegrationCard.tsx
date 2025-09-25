import React from "react";
import { MaterialIcon } from "../ui/MaterialIcon";
import { IntegrationHealth } from "../../services/integrationsService";

interface IntegrationCardProps {
    integration: IntegrationHealth;
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({ integration }) => {
    const getStatusIcon = () => {
        switch (integration.status) {
            case "connected":
                return <MaterialIcon icon="check_circle" className="text-green-500" size={20} />;
            case "error":
                return <MaterialIcon icon="cancel" className="text-red-500" size={20} />;
            case "configuring":
                return <MaterialIcon icon="schedule" className="text-yellow-500" size={20} />;
            case "disconnected":
                return <MaterialIcon icon="warning" className="text-gray-500" size={20} />;
            default:
                return <MaterialIcon icon="warning" className="text-gray-500" size={20} />;
        }
    };

    const getStatusColor = () => {
        switch (integration.status) {
            case "connected":
                return "text-green-600 bg-green-100";
            case "error":
                return "text-red-600 bg-red-100";
            case "configuring":
                return "text-yellow-600 bg-yellow-100";
            case "disconnected":
                return "text-gray-600 bg-gray-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };

    const getStatusText = () => {
        switch (integration.status) {
            case "connected":
                return "Conectado";
            case "error":
                return "Erro";
            case "configuring":
                return "Configurando";
            case "disconnected":
                return "Desconectado";
            default:
                return "Desconhecido";
        }
    };

    const getTypeIcon = () => {
        switch (integration.type) {
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

    const getTypeColor = () => {
        switch (integration.type) {
            case "whatsapp":
                return "bg-green-500";
            case "pix":
                return "bg-blue-500";
            case "crm":
                return "bg-purple-500";
            case "erp":
                return "bg-orange-500";
            default:
                return "bg-gray-500";
        }
    };

    return (
        <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div
                            className={`w-10 h-10 rounded-lg ${getTypeColor()} flex items-center justify-center text-white text-lg`}
                        >
                            {getTypeIcon()}
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">{integration.name}</h3>
                            <p className="text-sm text-gray-500">{integration.platform}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {getStatusIcon()}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                            {getStatusText()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">Operações Totais</p>
                        <p className="text-lg font-semibold text-gray-900">
                            {integration.metrics.totalOperations.toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Taxa de Sucesso</p>
                        <p className="text-lg font-semibold text-gray-900">{integration.metrics.successRate}%</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Volume Mensal</p>
                        <p className="text-lg font-semibold text-gray-900">
                            {integration.metrics.monthlyVolume.toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Última Atividade</p>
                        <p className="text-sm text-gray-900">
                            {new Date(integration.metrics.lastActivity).toLocaleDateString("pt-BR")}
                        </p>
                    </div>
                </div>

                {/* Configuration Status */}
                {integration.configuration && (
                    <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Configuração</span>
                            <div className="flex items-center space-x-2">
                                {integration.configuration.isConfigured ? (
                                    <MaterialIcon icon="check_circle" className="text-green-500" size={16} />
                                ) : (
                                    <MaterialIcon icon="warning" className="text-yellow-500" size={16} />
                                )}
                                <span
                                    className={`text-sm font-medium ${
                                        integration.configuration.isConfigured ? "text-green-600" : "text-yellow-600"
                                    }`}
                                >
                                    {integration.configuration.isConfigured ? "Configurado" : "Pendente"}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {integration.errorMessage && (
                    <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-start space-x-2">
                            <MaterialIcon icon="cancel" className="text-red-500 mt-0.5 flex-shrink-0" size={16} />
                            <div>
                                <p className="text-sm font-medium text-red-600">Erro</p>
                                <p className="text-sm text-red-500">{integration.errorMessage}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Last Sync */}
                {integration.lastSync && (
                    <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Última Sincronização</span>
                            <span className="text-sm text-gray-900">
                                {new Date(integration.lastSync).toLocaleString("pt-BR")}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <button className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-900">
                            <MaterialIcon icon="visibility" className="mr-1" size={16} />
                            Detalhes
                        </button>
                        <button className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-900">
                            <MaterialIcon icon="settings" className="mr-1" size={16} />
                            Configurar
                        </button>
                    </div>
                    <button className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700">
                        <MaterialIcon icon="refresh" className="mr-1" size={16} />
                        Sincronizar
                    </button>
                </div>
            </div>
        </div>
    );
};
