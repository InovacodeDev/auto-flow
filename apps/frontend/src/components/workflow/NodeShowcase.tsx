import React, { useState } from "react";
import { Node } from "reactflow";
import { MaterialIcon } from "../ui/MaterialIcon";
import { nodeTypes } from "./nodeTypes";

interface NodeShowcaseProps {
    isOpen: boolean;
    onClose: () => void;
    onAddNode: (nodeType: string, nodeConfig: any) => void;
}

/**
 * Componente que mostra uma galeria de todos os nós disponíveis
 * Útil para demonstração e seleção rápida
 */
export const NodeShowcase: React.FC<NodeShowcaseProps> = ({ isOpen, onClose, onAddNode }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    if (!isOpen) return null;

    // Categorias de nós
    const categories = {
        all: { name: "Todos", color: "text-gray-700" },
        trigger: { name: "Triggers", color: "text-green-700" },
        action: { name: "Ações", color: "text-blue-700" },
        condition: { name: "Condições", color: "text-yellow-700" },
        utility: { name: "Utilidades", color: "text-gray-700" },
    };

    // Nós de demonstração
    const demoNodes: Array<{
        id: string;
        name: string;
        category: string;
        type: string;
        config: any;
        description: string;
    }> = [
        // Triggers
        {
            id: "demo_manual_trigger",
            name: "Trigger Manual",
            category: "trigger",
            type: "manual_trigger",
            config: {
                name: "Manual Trigger",
                description: "Inicia o workflow manualmente",
            },
            description: "Dispara quando usuário clica em executar",
        },
        {
            id: "demo_webhook_trigger",
            name: "Webhook",
            category: "trigger",
            type: "webhook_trigger",
            config: {
                name: "Webhook Trigger",
                method: "POST",
                authentication: "none",
            },
            description: "Recebe dados via HTTP POST",
        },
        {
            id: "demo_schedule_trigger",
            name: "Agendamento",
            category: "trigger",
            type: "schedule_trigger",
            config: {
                name: "Schedule Trigger",
                cron: "0 9 * * 1-5",
                timezone: "America/Sao_Paulo",
            },
            description: "Executa todos os dias úteis às 9h",
        },

        // Actions
        {
            id: "demo_http_request",
            name: "Requisição HTTP",
            category: "action",
            type: "http_request",
            config: {
                name: "HTTP Request",
                method: "GET",
                url: "https://api.example.com/users",
            },
            description: "Faz chamada para API externa",
        },
        {
            id: "demo_send_email",
            name: "Enviar Email",
            category: "action",
            type: "send_email",
            config: {
                name: "Send Email",
                from: "noreply@example.com",
                provider: "smtp",
            },
            description: "Envia email via SMTP",
        },
        {
            id: "demo_whatsapp_send",
            name: "WhatsApp",
            category: "action",
            type: "whatsapp_send",
            config: {
                name: "WhatsApp Send",
                type: "message",
            },
            description: "Envia mensagem via WhatsApp Business",
        },
        {
            id: "demo_payment_process",
            name: "Pagamento",
            category: "action",
            type: "payment_process",
            config: {
                name: "Payment Process",
                provider: "stripe",
                amount: "29.90",
            },
            description: "Processa pagamento via Stripe",
        },

        // Conditions
        {
            id: "demo_condition_if",
            name: "Condição IF",
            category: "condition",
            type: "condition_if",
            config: {
                name: "Condition",
                condition: "input.value > 100",
                operator: "javascript",
            },
            description: "Avalia condição e direciona fluxo",
        },
        {
            id: "demo_validation",
            name: "Validação",
            category: "condition",
            type: "validation",
            config: {
                name: "Validation",
                rules: ["required", "email"],
            },
            description: "Valida dados de entrada",
        },
        {
            id: "demo_error_handler",
            name: "Tratamento de Erro",
            category: "condition",
            type: "error_handler",
            config: {
                name: "Error Handler",
                type: "catch",
            },
            description: "Captura e trata erros",
        },

        // Utilities
        {
            id: "demo_delay",
            name: "Aguardar",
            category: "utility",
            type: "delay",
            config: {
                name: "Delay",
                duration: 5000,
                unit: "milliseconds",
            },
            description: "Pausa execução por 5 segundos",
        },
        {
            id: "demo_data_transform",
            name: "Transformar Dados",
            category: "utility",
            type: "data_transform_util",
            config: {
                name: "Data Transform",
                operation: "map",
            },
            description: "Transforma dados de formato",
        },
        {
            id: "demo_calculator",
            name: "Calculadora",
            category: "utility",
            type: "calculator",
            config: {
                name: "Calculator",
                operation: "add",
            },
            description: "Executa operações matemáticas",
        },
        {
            id: "demo_logger",
            name: "Logger",
            category: "utility",
            type: "logger",
            config: {
                name: "Logger",
                level: "info",
            },
            description: "Registra logs de execução",
        },
    ];

    // Filtrar nós por categoria
    const filteredNodes =
        selectedCategory === "all" ? demoNodes : demoNodes.filter((node) => node.category === selectedCategory);

    const handleAddNode = (node: (typeof demoNodes)[0]) => {
        onAddNode(node.category, {
            ...node.config,
            nodeType: node.type,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">Galeria de Nós</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        <MaterialIcon icon="close" className="text-gray-400" size={24} />
                    </button>
                </div>

                {/* Category Filter */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(categories).map(([key, category]) => (
                            <button
                                key={key}
                                onClick={() => setSelectedCategory(key)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    selectedCategory === key
                                        ? "bg-blue-100 text-blue-700"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Nodes Grid */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredNodes.map((node) => {
                            const NodeComponent = nodeTypes[node.type as keyof typeof nodeTypes];

                            if (!NodeComponent) return null;

                            // Criar um nó de demonstração
                            const demoNode: Node = {
                                id: node.id,
                                type: node.type,
                                position: { x: 0, y: 0 },
                                data: node.config,
                            };

                            return (
                                <div
                                    key={node.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
                                    onClick={() => handleAddNode(node)}
                                >
                                    {/* Node Preview */}
                                    <div className="mb-3 transform scale-75 origin-top-left">
                                        {/* demoNode may lack some runtime props expected by the node wrapper; cast to any for preview */}
                                        <NodeComponent {...(demoNode as any)} selected={false} />
                                    </div>

                                    {/* Node Info */}
                                    <div>
                                        <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
                                            {node.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">{node.description}</p>
                                        <div className="mt-2">
                                            <span
                                                className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                                                    node.category === "trigger"
                                                        ? "bg-green-100 text-green-700"
                                                        : node.category === "action"
                                                          ? "bg-blue-100 text-blue-700"
                                                          : node.category === "condition"
                                                            ? "bg-yellow-100 text-yellow-700"
                                                            : "bg-gray-100 text-gray-700"
                                                }`}
                                            >
                                                {categories[node.category as keyof typeof categories].name}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                        Clique em um nó para adicioná-lo ao canvas. Use a biblioteca lateral para mais opções.
                    </p>
                </div>
            </div>
        </div>
    );
};
