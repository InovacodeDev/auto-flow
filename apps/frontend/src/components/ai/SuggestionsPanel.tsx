import React from "react";
import { MaterialIcon } from "../ui/MaterialIcon";

interface SuggestionsPanelProps {
    onSuggestionClick: (suggestion: string) => void;
}

export const SuggestionsPanel: React.FC<SuggestionsPanelProps> = ({ onSuggestionClick }) => {
    const suggestions = [
        {
            id: "workflow-1",
            title: "Criar workflow de vendas",
            description: "Automatize o processo de vendas desde o lead até o fechamento",
            icon: "auto_awesome",
            color: "bg-blue-500",
            textColor: "text-blue-600",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200",
        },
        {
            id: "integration-1",
            title: "Integrar com WhatsApp",
            description: "Configure notificações automáticas via WhatsApp Business",
            icon: "settings",
            color: "bg-green-500",
            textColor: "text-green-600",
            bgColor: "bg-green-50",
            borderColor: "border-green-200",
        },
        {
            id: "optimization-1",
            title: "Otimizar processos",
            description: "Analise e melhore a eficiência dos seus workflows",
            icon: "bar_chart",
            color: "bg-purple-500",
            textColor: "text-purple-600",
            bgColor: "bg-purple-50",
            borderColor: "border-purple-200",
        },
        {
            id: "workflow-2",
            title: "Automatizar emails",
            description: "Configure envio automático de emails de follow-up",
            icon: "auto_awesome",
            color: "bg-orange-500",
            textColor: "text-orange-600",
            bgColor: "bg-orange-50",
            borderColor: "border-orange-200",
        },
    ];

    const quickActions = [
        "Criar workflow de vendas",
        "Integrar com PIX",
        "Configurar notificações",
        "Otimizar processos existentes",
        "Gerar relatórios automáticos",
        "Sincronizar dados com CRM",
    ];

    return (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="space-y-4">
                {/* Quick Actions */}
                <div>
                    <div className="flex items-center space-x-2 mb-3">
                        <MaterialIcon icon="lightbulb" className="text-gray-600" size={20} />
                        <h3 className="text-sm font-medium text-gray-900">Ações Rápidas</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {quickActions.map((action, index) => (
                            <button
                                key={index}
                                onClick={() => onSuggestionClick(action)}
                                className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 hover:border-gray-400 transition-colors"
                            >
                                {action}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Detailed Suggestions */}
                <div>
                    <div className="flex items-center space-x-2 mb-3">
                        <MaterialIcon icon="auto_awesome" className="text-gray-600" size={20} />
                        <h3 className="text-sm font-medium text-gray-900">Sugestões Inteligentes</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {suggestions.map((suggestion) => (
                            <button
                                key={suggestion.id}
                                onClick={() => onSuggestionClick(suggestion.title)}
                                className={`p-4 text-left rounded-lg border ${suggestion.bgColor} ${suggestion.borderColor} hover:shadow-md transition-all duration-200 group`}
                            >
                                <div className="flex items-start space-x-3">
                                    <div
                                        className={`p-2 rounded-lg ${suggestion.color} group-hover:scale-110 transition-transform`}
                                    >
                                        <MaterialIcon icon={suggestion.icon} className="text-white" size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4
                                            className={`text-sm font-medium ${suggestion.textColor} group-hover:underline`}
                                        >
                                            {suggestion.title}
                                        </h4>
                                        <p className="text-xs text-gray-600 mt-1">{suggestion.description}</p>
                                    </div>
                                    <MaterialIcon
                                        icon="arrow_forward"
                                        className="text-gray-400 group-hover:text-gray-600 transition-colors"
                                        size={16}
                                    />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Help Text */}
                <div className="text-center">
                    <p className="text-xs text-gray-500">
                        Clique em qualquer sugestão para começar ou digite sua própria pergunta
                    </p>
                </div>
            </div>
        </div>
    );
};
