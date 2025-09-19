import React from "react";

interface NodeTypeConfig {
    id: string;
    label: string;
    icon: string;
    category: string;
    color: string;
    description: string;
}

const nodeTypes: NodeTypeConfig[] = [
    // Triggers
    {
        id: "webhook-trigger",
        label: "Webhook",
        icon: "🔗",
        category: "Triggers",
        color: "#4caf50",
        description: "Disparado por chamada HTTP",
    },
    {
        id: "schedule-trigger",
        label: "Agendamento",
        icon: "⏰",
        category: "Triggers",
        color: "#2196f3",
        description: "Executar em horário específico",
    },
    {
        id: "manual-trigger",
        label: "Manual",
        icon: "▶️",
        category: "Triggers",
        color: "#ff9800",
        description: "Execução manual",
    },

    // Actions
    {
        id: "whatsapp-send",
        label: "WhatsApp",
        icon: "💬",
        category: "Ações",
        color: "#25d366",
        description: "Enviar mensagem WhatsApp",
    },
    {
        id: "email-send",
        label: "Email",
        icon: "📧",
        category: "Ações",
        color: "#ea4335",
        description: "Enviar email",
    },
    {
        id: "http-request",
        label: "HTTP Request",
        icon: "🌐",
        category: "Ações",
        color: "#673ab7",
        description: "Fazer requisição HTTP",
    },
    {
        id: "database-insert",
        label: "Inserir Dados",
        icon: "💾",
        category: "Ações",
        color: "#795548",
        description: "Inserir dados no banco",
    },

    // Logic
    {
        id: "condition",
        label: "Condição",
        icon: "❓",
        category: "Lógica",
        color: "#ff9800",
        description: "Avaliar condição",
    },
    {
        id: "loop",
        label: "Loop",
        icon: "🔄",
        category: "Lógica",
        color: "#607d8b",
        description: "Repetir ações",
    },
    {
        id: "switch",
        label: "Switch",
        icon: "🔀",
        category: "Lógica",
        color: "#9c27b0",
        description: "Múltiplas condições",
    },

    // Utilities
    {
        id: "delay",
        label: "Aguardar",
        icon: "⏱️",
        category: "Utilitários",
        color: "#9c27b0",
        description: "Aguardar tempo específico",
    },
    {
        id: "variable-set",
        label: "Definir Variável",
        icon: "📝",
        category: "Utilitários",
        color: "#607d8b",
        description: "Definir valor de variável",
    },
    {
        id: "log",
        label: "Log",
        icon: "📋",
        category: "Utilitários",
        color: "#757575",
        description: "Registrar log",
    },
];

const categories = Array.from(new Set(nodeTypes.map((node) => node.category)));

export const NodePalette: React.FC = () => {
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData("application/reactflow", nodeType);
        event.dataTransfer.effectAllowed = "move";
    };

    return (
        <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Componentes</h3>

            {categories.map((category) => (
                <div key={category} className="mb-6">
                    <h4 className="text-sm font-medium text-gray-600 mb-2 uppercase tracking-wide">{category}</h4>

                    <div className="space-y-2">
                        {nodeTypes
                            .filter((node) => node.category === category)
                            .map((node) => (
                                <div
                                    key={node.id}
                                    draggable
                                    onDragStart={(e) => onDragStart(e, node.id)}
                                    className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-move hover:bg-gray-100 hover:border-gray-300 transition-colors group"
                                    style={{ borderLeftColor: node.color, borderLeftWidth: "4px" }}
                                >
                                    <span className="text-2xl mr-3">{node.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-gray-900 truncate">{node.label}</div>
                                        <div className="text-xs text-gray-500 truncate">{node.description}</div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            ))}

            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Como usar</h4>
                <p className="text-xs text-blue-700">
                    Arraste os componentes para o canvas para criar seu workflow. Conecte os nós clicando e arrastando
                    entre as conexões.
                </p>
            </div>
        </div>
    );
};
