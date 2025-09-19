import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Lightbulb, ChevronDown, Copy, ThumbsUp, ThumbsDown } from "lucide-react";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    metadata?: {
        workflowGenerated?: boolean;
        confidence?: number;
        suggestions?: string[];
        nextSteps?: string[];
    };
}

// interface AIResponse {
//     message: string;
//     suggestions: string[];
//     nextSteps: string[];
//     confidence: number;
//     workflowGenerated?: any;
//     requiresUserInput?: {
//         type: "confirmation" | "additional_info" | "clarification";
//         prompt: string;
//         options?: string[];
//     };
// }

const AIChatInterface: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sugestões iniciais personalizadas
    const [quickSuggestions] = useState([
        "Automatizar atendimento no WhatsApp",
        "Criar cobrança automática via PIX",
        "Agendar envio de emails",
        "Integrar com planilhas do Google",
        "Configurar follow-up de vendas",
        "Notificar sobre produtos em falta",
    ]);

    // Scroll para última mensagem
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Inicializar conversa
    useEffect(() => {
        const initializeChat = async () => {
            try {
                const response = await fetch("/api/ai/start-conversation", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        userId: "user_demo", // TODO: Usar ID real do usuário
                        organizationId: "org_demo",
                        industry: "geral",
                    }),
                });

                const data = await response.json();
                if (data.sessionId) {
                    setSessionId(data.sessionId);

                    // Adicionar mensagem de boas-vindas
                    const welcomeMessage: Message = {
                        id: "welcome",
                        role: "assistant",
                        content: data.message || "Olá! Como posso ajudar você a criar automações incríveis?",
                        timestamp: new Date(),
                        metadata: {
                            suggestions: data.suggestions || quickSuggestions,
                        },
                    };

                    setMessages([welcomeMessage]);
                }
            } catch (error) {
                console.error("Error initializing chat:", error);
            }
        };

        initializeChat();
    }, []);

    // Enviar mensagem
    const handleSendMessage = async (content?: string) => {
        const messageContent = content || inputValue.trim();
        if (!messageContent || !sessionId || isLoading) return;

        // Adicionar mensagem do usuário
        const userMessage: Message = {
            id: `user_${Date.now()}`,
            role: "user",
            content: messageContent,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue("");
        setIsLoading(true);
        setShowSuggestions(false);

        try {
            const response = await fetch("/api/ai/message", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    sessionId,
                    message: messageContent,
                }),
            });

            const data = await response.json();

            // Adicionar resposta da IA
            const assistantMessage: Message = {
                id: `assistant_${Date.now()}`,
                role: "assistant",
                content: data.content || data.message || "Desculpe, não consegui processar sua mensagem.",
                timestamp: new Date(),
                metadata: data.metadata || {
                    confidence: data.confidence || 0.8,
                    suggestions: data.suggestions || [],
                    nextSteps: data.nextSteps || [],
                    workflowGenerated: data.workflowGenerated,
                },
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Error sending message:", error);

            // Adicionar mensagem de erro
            const errorMessage: Message = {
                id: `error_${Date.now()}`,
                role: "assistant",
                content: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    // Usar sugestão
    const handleSuggestionClick = (suggestion: string) => {
        setInputValue(suggestion);
        inputRef.current?.focus();
    };

    // Copiar mensagem
    const handleCopyMessage = (content: string) => {
        navigator.clipboard.writeText(content);
        // TODO: Mostrar toast de confirmação
    };

    // Avaliar resposta
    const handleRateMessage = (messageId: string, positive: boolean) => {
        // TODO: Enviar feedback para API
        console.log(`Rating for ${messageId}: ${positive ? "positive" : "negative"}`);
    };

    return (
        <div className="flex flex-col h-full bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-gray-900">Alex - Assistente de Automação</h1>
                        <p className="text-sm text-gray-500">Pronto para criar automações incríveis</p>
                    </div>
                </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        {message.role === "assistant" && (
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                        )}

                        <div
                            className={`max-w-2xl rounded-lg px-4 py-3 ${
                                message.role === "user"
                                    ? "bg-blue-500 text-white"
                                    : "bg-white border border-gray-200 text-gray-900"
                            }`}
                        >
                            <div className="prose prose-sm max-w-none">
                                <p className="whitespace-pre-wrap">{message.content}</p>
                            </div>

                            {/* Workflow Generated Badge */}
                            {message.metadata?.workflowGenerated && (
                                <div className="mt-3 inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                    <Lightbulb className="w-3 h-3" />
                                    Workflow Criado
                                </div>
                            )}

                            {/* Message Actions */}
                            {message.role === "assistant" && (
                                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100">
                                    <button
                                        onClick={() => handleCopyMessage(message.content)}
                                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                                        title="Copiar mensagem"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleRateMessage(message.id, true)}
                                        className="p-1 text-gray-400 hover:text-green-600 rounded"
                                        title="Resposta útil"
                                    >
                                        <ThumbsUp className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleRateMessage(message.id, false)}
                                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                                        title="Resposta não útil"
                                    >
                                        <ThumbsDown className="w-4 h-4" />
                                    </button>

                                    {/* Confidence Score */}
                                    {message.metadata?.confidence && (
                                        <span className="ml-auto text-xs text-gray-400">
                                            {Math.round(message.metadata.confidence * 100)}% confiança
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Suggestions */}
                            {message.metadata?.suggestions && message.metadata.suggestions.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    <p className="text-xs text-gray-500 mb-2">Sugestões:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {message.metadata.suggestions.map((suggestion, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Next Steps */}
                            {message.metadata?.nextSteps && message.metadata.nextSteps.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    <p className="text-xs text-gray-500 mb-2">Próximos passos:</p>
                                    <ul className="text-sm text-gray-700 space-y-1">
                                        {message.metadata.nextSteps.map((step, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <span className="w-4 h-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5 flex-shrink-0">
                                                    {index + 1}
                                                </span>
                                                {step}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {message.role === "user" && (
                            <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 text-white" />
                            </div>
                        )}
                    </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                    <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div
                                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                    style={{ animationDelay: "0.1s" }}
                                ></div>
                                <div
                                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                    style={{ animationDelay: "0.2s" }}
                                ></div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            {showSuggestions && messages.length <= 1 && (
                <div className="px-6 py-4 bg-white border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-700">Sugestões para começar:</span>
                        <button
                            onClick={() => setShowSuggestions(false)}
                            className="ml-auto p-1 text-gray-400 hover:text-gray-600"
                        >
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {quickSuggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm rounded-lg text-left transition-colors"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 px-6 py-4">
                <div className="flex gap-3 items-end">
                    <div className="flex-1">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            placeholder="Digite sua mensagem... (Ex: 'Quero automatizar atendimento no WhatsApp')"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            disabled={isLoading}
                        />
                    </div>
                    <button
                        onClick={() => handleSendMessage()}
                        disabled={!inputValue.trim() || isLoading}
                        className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>Pressione Enter para enviar, Shift+Enter para nova linha</span>
                    {sessionId && <span>Sessão: {sessionId.slice(-8)}</span>}
                </div>
            </div>
        </div>
    );
};

export default AIChatInterface;
