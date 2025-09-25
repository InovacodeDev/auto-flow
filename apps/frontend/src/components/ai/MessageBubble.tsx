import React from "react";
import { MaterialIcon } from "../ui/MaterialIcon";
import { ChatMessage } from "../../services/aiService";

interface MessageBubbleProps {
    message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const isUser = message.role === "user";
    const isAssistant = message.role === "assistant";
    // system role currently unused visually; keep detection inline if needed later

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getMessageIcon = () => {
        if (isUser) return <MaterialIcon icon="person" className="text-current" size={16} />;
        if (isAssistant) return <MaterialIcon icon="auto_awesome" className="text-current" size={16} />;
        return <MaterialIcon icon="check_circle" className="text-current" size={16} />;
    };

    const getMessageIconColor = () => {
        if (isUser) return "text-blue-600";
        if (isAssistant) return "text-purple-600";
        return "text-green-600";
    };

    const getMessageBgColor = () => {
        if (isUser) return "bg-blue-50";
        if (isAssistant) return "bg-gray-50";
        return "bg-green-50";
    };

    const getMessageTextColor = () => {
        if (isUser) return "text-blue-900";
        if (isAssistant) return "text-gray-900";
        return "text-green-900";
    };

    const getMessageBorderColor = () => {
        if (isUser) return "border-blue-200";
        if (isAssistant) return "border-gray-200";
        return "border-green-200";
    };

    const renderMetadata = () => {
        if (!message.metadata) return null;

        const { workflowGenerated, suggestions, nextSteps, confidence } = message.metadata;

        return (
            <div className="mt-3 space-y-2">
                {workflowGenerated && (
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                        <MaterialIcon icon="check_circle" className="text-current" size={16} />
                        <span>Workflow gerado com sucesso!</span>
                    </div>
                )}

                {confidence && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                        <span>Confiança: {Math.round(confidence * 100)}%</span>
                    </div>
                )}

                {suggestions && suggestions.length > 0 && (
                    <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                            <MaterialIcon icon="lightbulb" className="text-current" size={16} />
                            <span>Sugestões:</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 ml-6">
                            {suggestions.map((suggestion, index) => (
                                <li key={index} className="text-sm text-gray-600">
                                    {suggestion}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {nextSteps && nextSteps.length > 0 && (
                    <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                            <MaterialIcon icon="arrow_forward" className="text-current" size={16} />
                            <span>Próximos passos:</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1 ml-6">
                            {nextSteps.map((step, index) => (
                                <li key={index} className="text-sm text-gray-600">
                                    {step}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
            <div className={`flex items-start space-x-3 max-w-3xl ${isUser ? "flex-row-reverse space-x-reverse" : ""}`}>
                {/* Avatar */}
                <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getMessageBgColor()} ${getMessageBorderColor()} border`}
                >
                    <div className={getMessageIconColor()}>{getMessageIcon()}</div>
                </div>

                {/* Message Content */}
                <div className={`flex-1 ${isUser ? "text-right" : "text-left"}`}>
                    <div
                        className={`inline-block px-4 py-3 rounded-lg ${getMessageBgColor()} ${getMessageBorderColor()} border`}
                    >
                        <div className={`text-sm ${getMessageTextColor()}`}>{message.content}</div>

                        {renderMetadata()}
                    </div>

                    <div className={`mt-1 text-xs text-gray-500 ${isUser ? "text-right" : "text-left"}`}>
                        {formatTimestamp(message.timestamp)}
                    </div>
                </div>
            </div>
        </div>
    );
};
