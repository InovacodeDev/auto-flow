import React, { useState } from "react";
import { MaterialIcon } from "../ui/MaterialIcon";
import { ConversationSession } from "../../services/aiService";

interface ConversationHistoryProps {
    conversations: ConversationSession[];
    // allow null because callers may pass null when nothing is selected
    activeConversationId?: string | null;
    onSelectConversation: (conversationId: string) => void;
    onNewConversation: () => void;
    onDeleteConversation: (conversationId: string) => void;
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({
    conversations,
    activeConversationId,
    onSelectConversation,
    onNewConversation,
    onDeleteConversation,
}) => {
    const [hoveredConversation, setHoveredConversation] = useState<string | null>(null);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
            });
        } else if (diffInHours < 168) {
            // 7 days
            return date.toLocaleDateString("pt-BR", {
                weekday: "short",
                hour: "2-digit",
                minute: "2-digit",
            });
        } else {
            return date.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
            });
        }
    };

    const getLastMessage = (conversation: ConversationSession) => {
        const lastMessage = conversation.messages[conversation.messages.length - 1];
        if (!lastMessage) return "Nova conversa";

        const content = lastMessage.content;
        return content.length > 50 ? `${content.substring(0, 50)}...` : content;
    };

    const getConversationIcon = (conversation: ConversationSession) => {
        const hasWorkflow = conversation.messages.some((msg) => msg.metadata?.workflowGenerated);
        return hasWorkflow ? "auto_awesome" : "chat";
    };

    return (
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Conversas</h2>
                    <button
                        onClick={onNewConversation}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Nova conversa"
                    >
                        <MaterialIcon icon="add" className="text-current" size={20} />
                    </button>
                </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                    <div className="p-4 text-center">
                        <MaterialIcon icon="chat" className="text-gray-400 mx-auto mb-3" size={48} />
                        <p className="text-sm text-gray-600 mb-4">Nenhuma conversa ainda</p>
                        <button
                            onClick={onNewConversation}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Começar conversa
                        </button>
                    </div>
                ) : (
                    <div className="p-2 space-y-1">
                        {conversations.map((conversation) => {
                            const isActive = conversation.sessionId === activeConversationId;
                            const isHovered = hoveredConversation === conversation.sessionId;
                            const iconName = getConversationIcon(conversation);

                            return (
                                <div
                                    key={conversation.sessionId}
                                    className={`relative group p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                        isActive
                                            ? "bg-blue-50 border border-blue-200"
                                            : "hover:bg-gray-50 border border-transparent"
                                    }`}
                                    onClick={() => onSelectConversation(conversation.sessionId)}
                                    onMouseEnter={() => setHoveredConversation(conversation.sessionId)}
                                    onMouseLeave={() => setHoveredConversation(null)}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div
                                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                                isActive ? "bg-blue-100" : "bg-gray-100"
                                            }`}
                                        >
                                            <MaterialIcon
                                                icon={iconName}
                                                className={`${isActive ? "text-blue-600" : "text-gray-600"}`}
                                                size={16}
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h3
                                                    className={`text-sm font-medium truncate ${
                                                        isActive ? "text-blue-900" : "text-gray-900"
                                                    }`}
                                                >
                                                    Conversa {conversation.sessionId.split("_")[2]?.slice(-4) || "Nova"}
                                                </h3>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-xs text-gray-500">
                                                        {formatDate(conversation.updatedAt)}
                                                    </span>
                                                    {(isHovered || isActive) && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDeleteConversation(conversation.sessionId);
                                                            }}
                                                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                            title="Excluir conversa"
                                                        >
                                                            <MaterialIcon
                                                                icon="delete"
                                                                className="text-current"
                                                                size={12}
                                                            />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <p
                                                className={`text-xs mt-1 truncate ${
                                                    isActive ? "text-blue-700" : "text-gray-600"
                                                }`}
                                            >
                                                {getLastMessage(conversation)}
                                            </p>

                                            <div className="flex items-center space-x-2 mt-2">
                                                <div className="flex items-center space-x-1 text-xs text-gray-500">
                                                    <MaterialIcon icon="schedule" className="text-current" size={12} />
                                                    <span>{conversation.messages.length} mensagens</span>
                                                </div>

                                                {conversation.messages.some(
                                                    (msg) => msg.metadata?.workflowGenerated
                                                ) && (
                                                    <div className="flex items-center space-x-1 text-xs text-green-600">
                                                        <MaterialIcon
                                                            icon="auto_awesome"
                                                            className="text-current"
                                                            size={12}
                                                        />
                                                        <span>Workflow</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 text-center">
                    {conversations.length} conversa{conversations.length !== 1 ? "s" : ""}
                </div>
            </div>
        </div>
    );
};
