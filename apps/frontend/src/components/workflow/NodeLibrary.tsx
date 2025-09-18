import React from "react";
import {
    XMarkIcon,
    BoltIcon,
    PlayIcon,
    DocumentTextIcon,
    ClockIcon,
    EnvelopeIcon,
    GlobeAltIcon,
    FunnelIcon,
} from "@heroicons/react/24/outline";

interface NodeDefinition {
    id: string;
    name: string;
    description: string;
    category: "trigger" | "action" | "condition" | "utility";
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    inputs: Array<{ name: string; type: string; required: boolean }>;
    outputs: Array<{ name: string; type: string }>;
    config: Record<string, any>;
}

const NODE_DEFINITIONS: NodeDefinition[] = [
    // TRIGGERS
    {
        id: "manual_trigger",
        name: "Trigger Manual",
        description: "Inicia o workflow manualmente via botão ou API",
        category: "trigger",
        icon: PlayIcon,
        color: "bg-green-500",
        inputs: [],
        outputs: [{ name: "output", type: "any" }],
        config: {
            name: "Manual Trigger",
            description: "Trigger executado manualmente",
        },
    },
    {
        id: "webhook_trigger",
        name: "Webhook",
        description: "Recebe dados via requisição HTTP POST",
        category: "trigger",
        icon: GlobeAltIcon,
        color: "bg-blue-500",
        inputs: [],
        outputs: [{ name: "data", type: "object" }],
        config: {
            name: "Webhook Trigger",
            method: "POST",
            authentication: "none",
        },
    },
    {
        id: "schedule_trigger",
        name: "Agendamento",
        description: "Executa em horários programados (cron)",
        category: "trigger",
        icon: ClockIcon,
        color: "bg-purple-500",
        inputs: [],
        outputs: [{ name: "timestamp", type: "string" }],
        config: {
            name: "Schedule Trigger",
            cron: "0 9 * * 1-5", // 9h todos os dias úteis
            timezone: "America/Sao_Paulo",
        },
    },

    // ACTIONS
    {
        id: "http_request",
        name: "Requisição HTTP",
        description: "Faz chamada para API externa",
        category: "action",
        icon: GlobeAltIcon,
        color: "bg-orange-500",
        inputs: [
            { name: "url", type: "string", required: true },
            { name: "data", type: "object", required: false },
        ],
        outputs: [
            { name: "response", type: "object" },
            { name: "status", type: "number" },
        ],
        config: {
            name: "HTTP Request",
            method: "GET",
            url: "",
            headers: {},
            timeout: 30000,
        },
    },
    {
        id: "send_email",
        name: "Enviar Email",
        description: "Envia email através do provedor configurado",
        category: "action",
        icon: EnvelopeIcon,
        color: "bg-red-500",
        inputs: [
            { name: "to", type: "string", required: true },
            { name: "subject", type: "string", required: true },
            { name: "body", type: "string", required: true },
        ],
        outputs: [{ name: "messageId", type: "string" }],
        config: {
            name: "Send Email",
            from: "",
            provider: "smtp",
        },
    },
    {
        id: "database_save",
        name: "Salvar no Banco",
        description: "Armazena dados no banco de dados",
        category: "action",
        icon: DocumentTextIcon,
        color: "bg-teal-500",
        inputs: [{ name: "data", type: "object", required: true }],
        outputs: [{ name: "id", type: "string" }],
        config: {
            name: "Database Save",
            table: "",
            operation: "insert",
        },
    },

    // CONDITIONS
    {
        id: "condition",
        name: "Condição IF",
        description: "Avalia condição e direciona fluxo",
        category: "condition",
        icon: FunnelIcon,
        color: "bg-yellow-500",
        inputs: [{ name: "input", type: "any", required: true }],
        outputs: [
            { name: "true", type: "any" },
            { name: "false", type: "any" },
        ],
        config: {
            name: "Condition",
            condition: "input.value > 0",
            operator: "javascript",
        },
    },

    // UTILITIES
    {
        id: "delay",
        name: "Aguardar",
        description: "Pausa a execução por tempo determinado",
        category: "utility",
        icon: ClockIcon,
        color: "bg-gray-500",
        inputs: [{ name: "input", type: "any", required: false }],
        outputs: [{ name: "output", type: "any" }],
        config: {
            name: "Delay",
            duration: 5000, // 5 segundos em ms
            unit: "milliseconds",
        },
    },
];

interface NodeLibraryProps {
    onAddNode: (nodeType: string, nodeConfig: any) => void;
    onClose: () => void;
}

export const NodeLibrary: React.FC<NodeLibraryProps> = ({ onAddNode, onClose }) => {
    const categories = {
        trigger: { name: "Triggers", color: "text-green-700" },
        action: { name: "Ações", color: "text-blue-700" },
        condition: { name: "Condições", color: "text-yellow-700" },
        utility: { name: "Utilidades", color: "text-gray-700" },
    };

    const groupedNodes = NODE_DEFINITIONS.reduce(
        (acc, node) => {
            if (!acc[node.category]) {
                acc[node.category] = [];
            }
            acc[node.category].push(node);
            return acc;
        },
        {} as Record<string, NodeDefinition[]>
    );

    const handleNodeClick = (node: NodeDefinition) => {
        onAddNode(node.category, {
            ...node.config,
            nodeType: node.id,
            inputs: node.inputs,
            outputs: node.outputs,
        });
    };

    return (
        <div className="w-80 bg-white border-r border-gray-200 shadow-lg h-full overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Biblioteca de Nodes</h2>
                <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                    <XMarkIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-6">
                {Object.entries(categories).map(([categoryKey, category]) => {
                    const nodes = groupedNodes[categoryKey] || [];

                    return (
                        <div key={categoryKey}>
                            <h3 className={`text-sm font-medium ${category.color} mb-3`}>{category.name}</h3>

                            <div className="space-y-2">
                                {nodes.map((node) => {
                                    const IconComponent = node.icon;

                                    return (
                                        <button
                                            key={node.id}
                                            onClick={() => handleNodeClick(node)}
                                            className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors group"
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div className={`p-2 ${node.color} text-white rounded-lg`}>
                                                    <IconComponent className="w-4 h-4" />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                                                        {node.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                        {node.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer com dica */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-blue-50 border-t border-blue-200">
                <div className="flex items-start space-x-2">
                    <BoltIcon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-blue-900">Dica</p>
                        <p className="text-xs text-blue-700">
                            Clique em um node para adicioná-lo ao canvas. Conecte-os arrastando das saídas para as
                            entradas.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NodeLibrary;
