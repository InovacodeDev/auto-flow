import React, { useState, useEffect } from "react";
import { Node } from "reactflow";

interface WorkflowPropertiesPanelProps {
    node: Node;
    onConfigChange: (config: Record<string, any>) => void;
    onDelete: () => void;
    onClose: () => void;
}

export const WorkflowPropertiesPanel: React.FC<WorkflowPropertiesPanelProps> = ({
    node,
    onConfigChange,
    onDelete,
    onClose,
}) => {
    const [config, setConfig] = useState<Record<string, any>>(node.data?.config || {});
    const [activeTab, setActiveTab] = useState<"config" | "advanced">("config");

    useEffect(() => {
        setConfig(node.data?.config || {});
    }, [node]);

    const handleConfigChange = (key: string, value: any) => {
        const newConfig = { ...config, [key]: value };
        setConfig(newConfig);
        onConfigChange(newConfig);
    };

    const renderConfigFields = () => {
        const nodeType = node.data?.type;

        switch (nodeType) {
            case "webhook-trigger":
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Path do Webhook</label>
                            <input
                                type="text"
                                value={config.path || ""}
                                onChange={(e) => handleConfigChange("path", e.target.value)}
                                placeholder="/webhook/meu-trigger"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Método HTTP</label>
                            <select
                                value={config.method || "POST"}
                                onChange={(e) => handleConfigChange("method", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="POST">POST</option>
                                <option value="GET">GET</option>
                                <option value="PUT">PUT</option>
                                <option value="DELETE">DELETE</option>
                            </select>
                        </div>
                        <div>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={config.requireAuth || false}
                                    onChange={(e) => handleConfigChange("requireAuth", e.target.checked)}
                                    className="mr-2"
                                />
                                <span className="text-sm text-gray-700">Requer Autenticação</span>
                            </label>
                        </div>
                    </div>
                );

            case "schedule-trigger":
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Agendamento</label>
                            <select
                                value={config.scheduleType || "cron"}
                                onChange={(e) => handleConfigChange("scheduleType", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="cron">Expressão Cron</option>
                                <option value="interval">Intervalo</option>
                                <option value="once">Uma vez</option>
                            </select>
                        </div>

                        {config.scheduleType === "cron" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Expressão Cron</label>
                                <input
                                    type="text"
                                    value={config.cronExpression || ""}
                                    onChange={(e) => handleConfigChange("cronExpression", e.target.value)}
                                    placeholder="0 9 * * 1-5"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">Ex: 0 9 * * 1-5 (Segunda a Sexta às 9h)</p>
                            </div>
                        )}

                        {config.scheduleType === "interval" && (
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Intervalo</label>
                                    <input
                                        type="number"
                                        value={config.intervalValue || 1}
                                        onChange={(e) => handleConfigChange("intervalValue", parseInt(e.target.value))}
                                        min="1"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Unidade</label>
                                    <select
                                        value={config.intervalUnit || "minutes"}
                                        onChange={(e) => handleConfigChange("intervalUnit", e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="minutes">Minutos</option>
                                        <option value="hours">Horas</option>
                                        <option value="days">Dias</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                );

            case "whatsapp-send":
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Número de Destino</label>
                            <input
                                type="text"
                                value={config.phoneNumber || ""}
                                onChange={(e) => handleConfigChange("phoneNumber", e.target.value)}
                                placeholder="5511999999999"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mensagem</label>
                            <textarea
                                value={config.message || ""}
                                onChange={(e) => handleConfigChange("message", e.target.value)}
                                placeholder="Digite sua mensagem..."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Template (opcional)</label>
                            <select
                                value={config.template || ""}
                                onChange={(e) => handleConfigChange("template", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Sem template</option>
                                <option value="welcome">Mensagem de Boas-vindas</option>
                                <option value="order_confirmation">Confirmação de Pedido</option>
                                <option value="payment_reminder">Lembrete de Pagamento</option>
                            </select>
                        </div>
                    </div>
                );

            case "email-send":
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Para (Email)</label>
                            <input
                                type="email"
                                value={config.to || ""}
                                onChange={(e) => handleConfigChange("to", e.target.value)}
                                placeholder="cliente@exemplo.com"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Assunto</label>
                            <input
                                type="text"
                                value={config.subject || ""}
                                onChange={(e) => handleConfigChange("subject", e.target.value)}
                                placeholder="Assunto do email"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Conteúdo</label>
                            <textarea
                                value={config.content || ""}
                                onChange={(e) => handleConfigChange("content", e.target.value)}
                                placeholder="Conteúdo do email..."
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                );

            case "condition":
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Condição</label>
                            <select
                                value={config.conditionType || "equals"}
                                onChange={(e) => handleConfigChange("conditionType", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="equals">Igual a</option>
                                <option value="not_equals">Diferente de</option>
                                <option value="contains">Contém</option>
                                <option value="greater_than">Maior que</option>
                                <option value="less_than">Menor que</option>
                                <option value="exists">Existe</option>
                                <option value="not_exists">Não existe</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Variável</label>
                            <input
                                type="text"
                                value={config.variable || ""}
                                onChange={(e) => handleConfigChange("variable", e.target.value)}
                                placeholder="nome_da_variavel"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Valor de Comparação</label>
                            <input
                                type="text"
                                value={config.value || ""}
                                onChange={(e) => handleConfigChange("value", e.target.value)}
                                placeholder="valor"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                );

            case "delay":
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tempo</label>
                                <input
                                    type="number"
                                    value={config.duration || 1}
                                    onChange={(e) => handleConfigChange("duration", parseInt(e.target.value))}
                                    min="1"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Unidade</label>
                                <select
                                    value={config.unit || "seconds"}
                                    onChange={(e) => handleConfigChange("unit", e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="seconds">Segundos</option>
                                    <option value="minutes">Minutos</option>
                                    <option value="hours">Horas</option>
                                    <option value="days">Dias</option>
                                </select>
                            </div>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="text-center py-8 text-gray-500">
                        <p>Nenhuma configuração disponível para este tipo de node.</p>
                    </div>
                );
        }
    };

    return (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">Propriedades</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                </div>

                <div className="mt-2">
                    <div className="flex items-center space-x-3">
                        <span className="text-2xl">{node.data?.icon}</span>
                        <div>
                            <div className="font-medium text-gray-900">{node.data?.label}</div>
                            <div className="text-sm text-gray-500 capitalize">{node.data?.category}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex">
                    <button
                        onClick={() => setActiveTab("config")}
                        className={`px-4 py-2 text-sm font-medium border-b-2 ${
                            activeTab === "config"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        Configuração
                    </button>
                    <button
                        onClick={() => setActiveTab("advanced")}
                        className={`px-4 py-2 text-sm font-medium border-b-2 ${
                            activeTab === "advanced"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        Avançado
                    </button>
                </nav>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {activeTab === "config" ? (
                    renderConfigFields()
                ) : (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">ID do Node</label>
                            <input
                                type="text"
                                value={node.id}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                            <input
                                type="text"
                                value={node.data?.type || ""}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Posição</label>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="number"
                                    value={Math.round(node.position.x)}
                                    readOnly
                                    placeholder="X"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                                />
                                <input
                                    type="number"
                                    value={Math.round(node.position.y)}
                                    readOnly
                                    placeholder="Y"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={onDelete}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                    Excluir Node
                </button>
            </div>
        </div>
    );
};
