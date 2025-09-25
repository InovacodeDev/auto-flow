import React, { useState, useRef, useEffect } from "react";
import { MaterialIcon } from "../ui/MaterialIcon";
import {
    useSendChatMessage,
    useChatHistory,
    useClearChatHistory,
    getDefaultSuggestions,
    ChatMessage,
} from "../../services/aiService";

interface AIChatProps {
    isOpen: boolean;
    onClose: () => void;
    onWorkflowGenerated?: (workflowId: string) => void;
}

export const AIChat: React.FC<AIChatProps> = ({ isOpen, onClose, onWorkflowGenerated }) => {
    const [message, setMessage] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>(getDefaultSuggestions());
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const sendMessage = useSendChatMessage();
    const { data: historyData, isLoading: historyLoading } = useChatHistory();
    const clearHistory = useClearChatHistory();

    const messages: ChatMessage[] = (historyData || []) as ChatMessage[];

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!message.trim() || sendMessage.isPending) return;

        const messageText = message.trim();
        setMessage("");

        try {
            // useSendChatMessage expects a string message (mutationFn signature)
            const response = await sendMessage.mutateAsync(messageText);

            // Update suggestions if provided in metadata
            if ((response as any).metadata?.suggestions) {
                setSuggestions((response as any).metadata.suggestions as string[]);
            }

            // Handle workflow generation if metadata contains an optional workflow id
            if ((response as any).metadata?.workflowGenerated && onWorkflowGenerated) {
                const workflowId = (response as any).metadata?.workflowId || (response as any).workflowId;
                if (workflowId) onWorkflowGenerated(workflowId);
            }
        } catch (error) {
            console.error("Erro ao enviar mensagem:", error);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setMessage(suggestion);
    };

    const handleClearHistory = async () => {
        if (window.confirm("Tem certeza que deseja limpar todo o histórico de conversa?")) {
            try {
                await clearHistory.mutateAsync();
                setSuggestions(getDefaultSuggestions());
            } catch (error) {
                console.error("Erro ao limpar histórico:", error);
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
                {/* Header */}
                <div className="border-b border-gray-200 p-4 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <MaterialIcon icon="auto_awesome" className="text-white" size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">AutoFlow IA Assistant</h2>
                                <p className="text-sm text-gray-600">Crie workflows através de linguagem natural</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handleClearHistory}
                                disabled={clearHistory.isPending || messages.length === 0}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                                title="Limpar histórico"
                            >
                                <MaterialIcon icon="delete" size={20} />
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                title="Fechar"
                            >
                                <MaterialIcon icon="close" size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {historyLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-8">
                            <MaterialIcon icon="smart_toy" className="mx-auto mb-4 text-gray-300" size={64} />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Bem-vindo ao AutoFlow IA!</h3>
                            <p className="text-gray-600 mb-6">
                                Descreva o que você gostaria de automatizar e eu ajudo você a criar o workflow perfeito.
                            </p>
                            <div className="text-left max-w-md mx-auto">
                                <h4 className="font-medium text-gray-900 mb-2">Exemplos do que posso fazer:</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• "Quero automatizar o envio de mensagens de boas-vindas via WhatsApp"</li>
                                    <li>• "Criar workflow para follow-up de vendas após 3 dias"</li>
                                    <li>• "Automatizar cobrança via PIX para clientes em atraso"</li>
                                    <li>• "Integrar leads do site com meu CRM automaticamente"</li>
                                </ul>
                            </div>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                        msg.role === "user"
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-100 text-gray-900 border"
                                    }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <span
                                            className={`text-xs ${
                                                msg.role === "user" ? "text-blue-100" : "text-gray-500"
                                            }`}
                                        >
                                            {formatTimestamp(msg.timestamp)}
                                        </span>
                                        {msg.metadata?.workflowGenerated && (
                                            <div className="flex items-center space-x-1">
                                                <MaterialIcon
                                                    icon="check_circle"
                                                    className="text-green-500"
                                                    size={16}
                                                />
                                                <span className="text-xs text-green-600 font-medium">
                                                    Workflow Gerado
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    {sendMessage.isPending && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 border rounded-lg px-4 py-2 max-w-xs">
                                <div className="flex items-center space-x-2">
                                    <MaterialIcon icon="schedule" className="text-gray-500 animate-spin" size={16} />
                                    <span className="text-sm text-gray-600">AutoFlow IA está pensando...</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Suggestions */}
                {suggestions.length > 0 && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Sugestões:</h4>
                        <div className="flex flex-wrap gap-2">
                            {suggestions.slice(0, 3).map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div className="border-t border-gray-200 p-4 flex-shrink-0">
                    <div className="flex space-x-3">
                        <div className="flex-1">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Descreva o que você gostaria de automatizar..."
                                className="w-full resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={2}
                                disabled={sendMessage.isPending}
                            />
                        </div>
                        <button
                            onClick={handleSendMessage}
                            disabled={!message.trim() || sendMessage.isPending}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                        >
                            <MaterialIcon icon="send" size={16} />
                            <span className="hidden sm:inline">Enviar</span>
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Pressione Enter para enviar, Shift+Enter para nova linha
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AIChat;
