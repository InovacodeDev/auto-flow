import React, { useState, useRef, useEffect } from "react";
import {
    PaperAirplaneIcon,
    SparklesIcon,
    TrashIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useChatSession, useStartConversation, useAIHealth } from "../../services/aiService";
import { ChatMessage } from "../../services/aiService";
import { MessageBubble } from "./MessageBubble";
import { SuggestionsPanel } from "./SuggestionsPanel";
import { TypingIndicator } from "./TypingIndicator";

interface ChatInterfaceProps {
    userId: string;
    organizationId: string;
    industry?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
    userId,
    organizationId,
    industry,
}) => {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const startConversationMutation = useStartConversation();
    const { data: health } = useAIHealth();
    const { messages, isTyping, sendMessage, clearMessages, isLoading, error } =
        useChatSession(sessionId);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    // Start conversation on mount
    useEffect(() => {
        if (!sessionId && !startConversationMutation.isPending) {
            handleStartConversation();
        }
    }, [sessionId]);

    const handleStartConversation = async () => {
        try {
            const response = await startConversationMutation.mutateAsync({
                userId,
                organizationId,
                industry,
            });
            setSessionId(response.sessionId);
            setShowSuggestions(true);
        } catch (error) {
            console.error("Failed to start conversation:", error);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || !sessionId || isLoading) return;

        const message = inputValue.trim();
        setInputValue("");
        setShowSuggestions(false);

        await sendMessage(message);
    };

    const handleSuggestionClick = (suggestion: string) => {
        setInputValue(suggestion);
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    const handleClearChat = () => {
        clearMessages();
        setShowSuggestions(true);
    };

    const handleRestartConversation = async () => {
        setSessionId(null);
        clearMessages();
        await handleStartConversation();
    };

    const isConnected = health?.status === "healthy" && health?.openaiConfigured;

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <SparklesIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Alex - Assistente IA
                        </h2>
                        <div className="flex items-center space-x-2">
                            <div
                                className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
                            />
                            <span className="text-sm text-gray-600">
                                {isConnected ? "Conectado" : "Desconectado"}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleClearChat}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="Limpar conversa"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleRestartConversation}
                        disabled={startConversationMutation.isPending}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                        title="Reiniciar conversa"
                    >
                        <ArrowPathIcon
                            className={`w-5 h-5 ${startConversationMutation.isPending ? "animate-spin" : ""}`}
                        />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && !isTyping && (
                    <div className="text-center py-8">
                        <SparklesIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Olá! Sou o Alex</h3>
                        <p className="text-gray-600">
                            Seu assistente de automação. Como posso ajudá-lo hoje?
                        </p>
                    </div>
                )}

                {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                ))}

                {isTyping && <TypingIndicator />}

                {error && (
                    <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <span className="text-sm text-red-700">
                            Erro ao processar mensagem. Tente novamente.
                        </span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Suggestions Panel */}
            {showSuggestions && messages.length === 0 && (
                <SuggestionsPanel onSuggestionClick={handleSuggestionClick} />
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                    <div className="flex-1 relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Digite sua mensagem..."
                            disabled={!sessionId || isLoading}
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim() || !sessionId || isLoading}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <PaperAirplaneIcon className="w-5 h-5" />
                        </button>
                    </div>
                </form>

                {!isConnected && (
                    <div className="mt-2 flex items-center space-x-2 text-sm text-amber-600">
                        <ExclamationTriangleIcon className="w-4 h-4" />
                        <span>Serviço de IA temporariamente indisponível</span>
                    </div>
                )}
            </div>
        </div>
    );
};
