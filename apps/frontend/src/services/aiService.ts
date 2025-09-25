import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosClient } from "../lib/axiosClient";
import { queryKeys } from "../lib/queryClient";

// Types
export interface ChatMessage {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: string;
    metadata?: {
        workflowGenerated?: boolean;
        suggestionType?: string;
        confidence?: number;
        suggestions?: string[];
        nextSteps?: string[];
    };
}

export interface ConversationSession {
    sessionId: string;
    userId: string;
    organizationId: string;
    industry?: string;
    messages: ChatMessage[];
    createdAt: string;
    updatedAt: string;
}

export interface StartConversationRequest {
    userId: string;
    organizationId: string;
    industry?: string;
}

export interface ProcessMessageRequest {
    sessionId: string;
    message: string;
}

export interface WorkflowGenerationRequest {
    prompt: string;
    organizationId: string;
    userId: string;
    context?: {
        industry?: string;
        existingWorkflows?: string[];
        integrations?: string[];
    };
}

export interface GetSuggestionsRequest {
    sessionId: string;
    type: "workflow" | "integration" | "optimization";
}

export interface AIResponse {
    id: string;
    role: "assistant";
    content: string;
    timestamp: string;
    metadata: {
        workflowGenerated: boolean;
        confidence?: number;
        suggestions?: string[];
        nextSteps?: string[];
    };
}

export interface WorkflowGenerationResponse {
    workflow: {
        nodes: any[];
        edges: any[];
    };
    message: string;
}

export interface SuggestionsResponse {
    suggestions: string[];
}

export interface AIHealthResponse {
    status: string;
    aiService: string;
    openaiConfigured: boolean;
}

// API functions
const aiApi = {
    // Iniciar nova conversa
    async startConversation(data: StartConversationRequest): Promise<{
        sessionId: string;
        message: string;
        suggestions: string[];
    }> {
        const response = await axiosClient.post("/ai/start-conversation", data);
        return response.data;
    },

    // Processar mensagem
    async processMessage(data: ProcessMessageRequest): Promise<AIResponse> {
        const response = await axiosClient.post("/ai/message", data);
        return response.data;
    },

    // Gerar workflow
    async generateWorkflow(data: WorkflowGenerationRequest): Promise<WorkflowGenerationResponse> {
        const response = await axiosClient.post("/ai/generate-workflow", data);
        return response.data;
    },

    // Obter sugestões
    async getSuggestions(data: GetSuggestionsRequest): Promise<SuggestionsResponse> {
        const response = await axiosClient.post("/ai/suggestions", data);
        return response.data;
    },

    // Health check
    async getHealth(): Promise<AIHealthResponse> {
        const response = await axiosClient.get("/ai/health");
        return response.data;
    },
};

// React Query Hooks

export const useStartConversation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: aiApi.startConversation,
        onSuccess: (_data) => {
            // Invalidate conversations list
            queryClient.invalidateQueries({ queryKey: queryKeys.ai.conversations() });
        },
    });
};

export const useProcessMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: aiApi.processMessage,
        onSuccess: (_data, variables) => {
            // Invalidate specific conversation
            queryClient.invalidateQueries({
                queryKey: queryKeys.ai.conversation(variables.sessionId),
            });
        },
    });
};

export const useGenerateWorkflow = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: aiApi.generateWorkflow,
        onSuccess: () => {
            // Invalidate workflows list
            queryClient.invalidateQueries({ queryKey: queryKeys.workflows.list() });
        },
    });
};

export const useGetSuggestions = () => {
    return useMutation({
        mutationFn: aiApi.getSuggestions,
    });
};

export const useAIHealth = () => {
    return useQuery({
        queryKey: queryKeys.ai.health(),
        queryFn: aiApi.getHealth,
        refetchInterval: 30000, // Refetch every 30 seconds
        staleTime: 10000, // Consider data stale after 10 seconds
    });
};

// Helper hooks for chat functionality

export const useChatSession = (sessionId: string | null) => {
    const [messages, setMessages] = React.useState<ChatMessage[]>([]);
    const [isTyping, setIsTyping] = React.useState(false);

    const processMessageMutation = useProcessMessage();

    const sendMessage = async (content: string) => {
        if (!sessionId) return;

        // Add user message immediately
        const userMessage: ChatMessage = {
            id: `user_${Date.now()}`,
            role: "user",
            content,
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsTyping(true);

        try {
            const response = await processMessageMutation.mutateAsync({
                sessionId,
                message: content,
            });

            // Add assistant response
            const assistantMessage: ChatMessage = {
                id: response.id,
                role: "assistant",
                content: response.content,
                timestamp: response.timestamp,
                metadata: response.metadata,
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Failed to send message:", error);

            // Add error message
            const errorMessage: ChatMessage = {
                id: `error_${Date.now()}`,
                role: "assistant",
                content: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.",
                timestamp: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const clearMessages = () => {
        setMessages([]);
    };

    return {
        messages,
        isTyping,
        sendMessage,
        clearMessages,
        isLoading: processMessageMutation.isPending,
        error: processMessageMutation.error,
    };
};

// Mock data for development
export const mockConversations: ConversationSession[] = [
    {
        sessionId: "conv_1",
        userId: "user_1",
        organizationId: "org_1",
        industry: "ecommerce",
        messages: [
            {
                id: "msg_1",
                role: "assistant",
                content:
                    "Olá! Sou o Alex, seu assistente de automação. Como posso ajudá-lo a otimizar seus processos hoje?",
                timestamp: new Date(Date.now() - 60000).toISOString(),
            },
        ],
        createdAt: new Date(Date.now() - 60000).toISOString(),
        updatedAt: new Date(Date.now() - 60000).toISOString(),
    },
];

export const mockSuggestions = [
    "Criar workflow para processar pedidos automaticamente",
    "Integrar com sistema de pagamento PIX",
    "Configurar notificações por WhatsApp",
    "Otimizar processo de envio de emails",
    "Sincronizar dados com CRM",
];

// Additional exports needed by AIChat component
export const useSendChatMessage = () => {
    return useMutation({
        mutationFn: (message: string) => {
            // Mock implementation
            return Promise.resolve({
                id: Date.now().toString(),
                role: "assistant" as const,
                content: `Recebi sua mensagem: "${message}". Como posso ajudá-lo?`,
                timestamp: new Date().toISOString(),
            });
        },
    });
};

export const useChatHistory = () => {
    return useQuery({
        queryKey: ["chatHistory"],
        queryFn: () => Promise.resolve(mockConversations[0]?.messages || []),
    });
};

export const useClearChatHistory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => Promise.resolve(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["chatHistory"] });
        },
    });
};

export const getDefaultSuggestions = () => {
    return mockSuggestions;
};

export const hasWorkflowGenerated = (messages: ChatMessage[]) => {
    return messages.some((msg) => msg.metadata?.workflowGenerated);
};
