import React, { useState, useEffect } from "react";
import { useAuthEnhanced } from "../../hooks/useAuthEnhanced";
import { ChatInterface } from "./ChatInterface";
import { ConversationHistory } from "./ConversationHistory";
import { ConversationSession, mockConversations } from "../../services/aiService";

export const AIChatPage: React.FC = () => {
    const { user } = useAuthEnhanced();
    const [conversations, setConversations] = useState<ConversationSession[]>(mockConversations);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [showHistory, setShowHistory] = useState(true);

    // Get user info for chat
    const userId = user?.id || "user_1";
    const organizationId = user?.organizationId || "org_1";
    // `user` shape can vary; allow optional industry if present on the runtime object
    const industry = (user as any)?.industry || "technology";

    // Set first conversation as active on mount
    useEffect(() => {
        if (conversations.length > 0 && !activeConversationId) {
            setActiveConversationId(conversations[0].sessionId);
        }
    }, [conversations, activeConversationId]);

    const handleSelectConversation = (conversationId: string) => {
        setActiveConversationId(conversationId);
    };

    const handleNewConversation = () => {
        const newConversation: ConversationSession = {
            sessionId: `conv_${userId}_${Date.now()}`,
            userId,
            organizationId,
            industry,
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        setConversations((prev) => [newConversation, ...prev]);
        setActiveConversationId(newConversation.sessionId);
    };

    const handleDeleteConversation = (conversationId: string) => {
        setConversations((prev) => prev.filter((conv) => conv.sessionId !== conversationId));

        if (activeConversationId === conversationId) {
            const remainingConversations = conversations.filter((conv) => conv.sessionId !== conversationId);
            setActiveConversationId(remainingConversations.length > 0 ? remainingConversations[0].sessionId : null);
        }
    };

    const toggleHistory = () => {
        setShowHistory(!showHistory);
    };

    return (
        <div className="h-screen bg-gray-100 flex">
            {/* Conversation History Sidebar */}
            {showHistory && (
                <ConversationHistory
                    conversations={conversations}
                    activeConversationId={activeConversationId}
                    onSelectConversation={handleSelectConversation}
                    onNewConversation={handleNewConversation}
                    onDeleteConversation={handleDeleteConversation}
                />
            )}

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={toggleHistory}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg lg:hidden"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            </button>
                            <h1 className="text-xl font-semibold text-gray-900">Chat com IA</h1>
                        </div>

                        <div className="flex items-center space-x-2">
                            <div className="text-sm text-gray-500">{user?.name || "Usuário"}</div>
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">{user?.name?.charAt(0) || "U"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat Interface */}
                <div className="flex-1 overflow-hidden">
                    {activeConversationId ? (
                        <ChatInterface userId={userId} organizationId={organizationId} industry={industry} />
                    ) : (
                        <div className="h-full flex items-center justify-center bg-white">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg
                                        className="w-8 h-8 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione uma conversa</h3>
                                <p className="text-gray-600 mb-4">Escolha uma conversa existente ou crie uma nova</p>
                                <button
                                    onClick={handleNewConversation}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Nova Conversa
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
