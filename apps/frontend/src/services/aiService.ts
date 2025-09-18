import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Tipos para IA Conversacional
export interface ChatMessage {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: string;
    metadata?: {
        workflowGenerated?: boolean;
        workflowId?: string;
        organizationId?: string;
    };
}

export interface ChatRequest {
    message: string;
    organizationContext?: {
        businessType?: string;
        existingWorkflows?: string[];
        availableIntegrations?: string[];
        commonPatterns?: string[];
    };
}

export interface ChatResponse {
    success: boolean;
    data?: {
        response: string;
        workflowGenerated?: any; // WorkflowDefinition
        suggestions?: string[];
    };
    error?: string;
}

export interface ChatHistoryResponse {
    success: boolean;
    data?: {
        messages: ChatMessage[];
    };
    error?: string;
}

// API functions
const sendChatMessage = async (request: ChatRequest): Promise<ChatResponse> => {
    const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken") || "mock-token"}`,
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao enviar mensagem");
    }

    return response.json();
};

const getChatHistory = async (): Promise<ChatHistoryResponse> => {
    const response = await fetch("/api/ai/chat/history", {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken") || "mock-token"}`,
        },
    });

    if (!response.ok) {
        throw new Error("Erro ao buscar histórico de chat");
    }

    return response.json();
};

const clearChatHistory = async (): Promise<void> => {
    const response = await fetch("/api/ai/chat/history", {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken") || "mock-token"}`,
        },
    });

    if (!response.ok) {
        throw new Error("Erro ao limpar histórico");
    }
};

// React Query hooks

/**
 * Hook para enviar mensagem de chat para IA
 */
export const useSendChatMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: sendChatMessage,
        onSuccess: () => {
            // Invalidar histórico para recarregar
            queryClient.invalidateQueries({ queryKey: ["chat-history"] });
        },
        onError: (error) => {
            console.error("Erro ao enviar mensagem:", error);
        },
    });
};

/**
 * Hook para buscar histórico de chat
 */
export const useChatHistory = (options: { enabled?: boolean } = {}) => {
    return useQuery({
        queryKey: ["chat-history"],
        queryFn: getChatHistory,
        enabled: options.enabled !== false,
        refetchOnWindowFocus: false,
        staleTime: 1000 * 60 * 5, // 5 minutos
    });
};

/**
 * Hook para limpar histórico de chat
 */
export const useClearChatHistory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: clearChatHistory,
        onSuccess: () => {
            // Invalidar histórico para recarregar
            queryClient.invalidateQueries({ queryKey: ["chat-history"] });
        },
        onError: (error) => {
            console.error("Erro ao limpar histórico:", error);
        },
    });
};

/**
 * Utility function para formatar mensagens
 */
export const formatChatMessage = (message: ChatMessage): string => {
    const date = new Date(message.timestamp);
    const timeString = date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
    });

    return `[${timeString}] ${message.role === "user" ? "Você" : "AutoFlow IA"}: ${message.content}`;
};

/**
 * Utility function para obter sugestões padrão
 */
export const getDefaultSuggestions = (): string[] => {
    return [
        "Como automatizar atendimento via WhatsApp?",
        "Criar workflow de follow-up de vendas",
        "Automatizar cobrança com PIX",
        "Integrar com meu CRM",
        "Configurar lembretes automáticos",
        "Workflow para leads de e-commerce",
        "Automatizar relatórios diários",
        "Sistema de aprovação de documentos",
    ];
};

/**
 * Utility function para detectar se uma mensagem gerou workflow
 */
export const hasWorkflowGenerated = (message: ChatMessage): boolean => {
    return message.metadata?.workflowGenerated === true;
};

/**
 * Utility function para extrair ID do workflow gerado
 */
export const getGeneratedWorkflowId = (message: ChatMessage): string | null => {
    return message.metadata?.workflowId || null;
};

export default {
    useSendChatMessage,
    useChatHistory,
    useClearChatHistory,
    formatChatMessage,
    getDefaultSuggestions,
    hasWorkflowGenerated,
    getGeneratedWorkflowId,
};
