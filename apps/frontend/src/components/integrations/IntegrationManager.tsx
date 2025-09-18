import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CheckCircleIcon, ExclamationCircleIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";

interface Integration {
    id: string;
    name: string;
    category: string;
    description: string;
    status: "configured" | "requires_setup" | "error";
    configRequired: string[];
}

const IntegrationManager: React.FC = () => {
    const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
    const [showConfigModal, setShowConfigModal] = useState(false);
    const [configForm, setConfigForm] = useState<Record<string, string>>({});
    const [testingConnection, setTestingConnection] = useState(false);

    // Fetch available integrations
    const { data: integrationsData, isLoading } = useQuery({
        queryKey: ["integrations"],
        queryFn: async () => {
            const response = await fetch("/api/integrations");
            if (!response.ok) throw new Error("Failed to fetch integrations");
            return response.json();
        },
    });

    // Test integration connection
    const testConnectionMutation = useMutation({
        mutationFn: async ({ type, config }: { type: string; config: Record<string, string> }) => {
            const response = await fetch(`/api/integrations/test/${type}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ config }),
            });
            if (!response.ok) throw new Error("Failed to test connection");
            return response.json();
        },
        onSuccess: (data) => {
            if (data.connected) {
                alert("Conexão estabelecida com sucesso!");
            } else {
                alert(`Falha na conexão: ${data.message}`);
            }
        },
        onError: (error: Error) => {
            alert(`Erro ao testar conexão: ${error.message}`);
        },
        onSettled: () => {
            setTestingConnection(false);
        },
    });

    const handleConfigureIntegration = (integration: Integration) => {
        setSelectedIntegration(integration);
        setShowConfigModal(true);

        // Initialize form with required fields
        const initialForm: Record<string, string> = {};
        integration.configRequired.forEach((field) => {
            initialForm[field] = "";
        });
        setConfigForm(initialForm);
    };

    const handleTestConnection = async () => {
        if (!selectedIntegration) return;

        setTestingConnection(true);

        // Convert integration type to API format
        const typeMap: Record<string, string> = {
            whatsapp_business: "whatsapp",
            pix_mercado_pago: "pix",
            omie_erp: "omie",
            bling_erp: "bling",
        };

        const apiType = typeMap[selectedIntegration.id];
        if (!apiType) {
            alert("Tipo de integração não suportado");
            setTestingConnection(false);
            return;
        }

        // Convert form fields to API format
        const apiConfig: Record<string, string> = {};
        Object.entries(configForm).forEach(([key, value]) => {
            switch (key) {
                case "access_token":
                    apiConfig.apiKey = value;
                    apiConfig.accessToken = value;
                    break;
                case "phone_number_id":
                    apiConfig.phoneNumberId = value;
                    break;
                case "webhook_verify_token":
                    apiConfig.webhookVerifyToken = value;
                    break;
                case "user_id":
                    apiConfig.userId = value;
                    break;
                case "app_key":
                    apiConfig.apiKey = value;
                    break;
                case "app_secret":
                    apiConfig.appSecret = value;
                    break;
                case "api_key":
                    apiConfig.apiKey = value;
                    break;
                default:
                    apiConfig[key] = value;
            }
        });

        testConnectionMutation.mutate({
            type: apiType,
            config: apiConfig,
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "configured":
                return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
            case "error":
                return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
            default:
                return <Cog6ToothIcon className="h-5 w-5 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "configured":
                return "bg-green-50 text-green-800 border-green-200";
            case "error":
                return "bg-red-50 text-red-800 border-red-200";
            default:
                return "bg-gray-50 text-gray-800 border-gray-200";
        }
    };

    const getFieldLabel = (field: string) => {
        const labels: Record<string, string> = {
            access_token: "Token de Acesso",
            phone_number_id: "ID do Número de Telefone",
            webhook_verify_token: "Token de Verificação do Webhook",
            user_id: "ID do Usuário",
            app_key: "Chave da Aplicação",
            app_secret: "Secret da Aplicação",
            api_key: "Chave da API",
        };
        return labels[field] || field;
    };

    const getFieldPlaceholder = (integration: Integration, field: string) => {
        const placeholders: Record<string, Record<string, string>> = {
            whatsapp_business: {
                access_token: "EAAXXXxxxxx...",
                phone_number_id: "123456789012345",
                webhook_verify_token: "sua_token_verificacao",
            },
            pix_mercado_pago: {
                access_token: "APP_USR-xxx...",
                user_id: "123456789",
            },
            omie_erp: {
                app_key: "1234567890123",
                app_secret: "abc123def456...",
            },
            bling_erp: {
                api_key: "abc123def456...",
            },
        };
        return placeholders[integration.id]?.[field] || "";
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const integrations = integrationsData?.data?.available || [];

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="md3-surface-container rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Integrações</h1>
                        <p className="text-gray-600">Configure suas integrações com serviços externos</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {integrations.map((integration: Integration) => (
                        <div
                            key={integration.id}
                            className={`border rounded-lg p-6 transition-all hover:shadow-md ${getStatusColor(integration.status)}`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    {getStatusIcon(integration.status)}
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                                        <p className="text-sm text-gray-600">{integration.category}</p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-gray-700 mb-4">{integration.description}</p>

                            <div className="flex items-center justify-between">
                                <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        integration.status === "configured"
                                            ? "bg-green-100 text-green-800"
                                            : integration.status === "error"
                                              ? "bg-red-100 text-red-800"
                                              : "bg-gray-100 text-gray-800"
                                    }`}
                                >
                                    {integration.status === "configured"
                                        ? "Configurado"
                                        : integration.status === "error"
                                          ? "Erro"
                                          : "Requer configuração"}
                                </span>

                                <button
                                    onClick={() => handleConfigureIntegration(integration)}
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <Cog6ToothIcon className="h-4 w-4 mr-1" />
                                    Configurar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Configuration Modal */}
            {showConfigModal && selectedIntegration && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Configurar {selectedIntegration.name}</h2>
                            <button
                                onClick={() => setShowConfigModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            {selectedIntegration.configRequired.map((field) => (
                                <div key={field}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {getFieldLabel(field)}
                                    </label>
                                    <input
                                        type={field.includes("secret") || field.includes("token") ? "password" : "text"}
                                        value={configForm[field] || ""}
                                        onChange={(e) => setConfigForm({ ...configForm, [field]: e.target.value })}
                                        placeholder={getFieldPlaceholder(selectedIntegration, field)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="flex space-x-3 mt-6">
                            <button
                                onClick={handleTestConnection}
                                disabled={testingConnection}
                                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {testingConnection ? "Testando..." : "Testar Conexão"}
                            </button>
                            <button
                                onClick={() => setShowConfigModal(false)}
                                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IntegrationManager;
