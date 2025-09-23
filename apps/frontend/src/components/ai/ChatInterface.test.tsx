import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChatInterface } from "./ChatInterface";

// Mock the services
jest.mock("../../services/aiService", () => ({
    useChatSession: () => ({
        messages: [
            {
                id: "msg_1",
                role: "assistant",
                content: "Olá! Como posso ajudá-lo hoje?",
                timestamp: "2024-01-15T10:30:00Z",
            },
        ],
        isTyping: false,
        sendMessage: jest.fn(),
        clearMessages: jest.fn(),
        isLoading: false,
        error: null,
    }),
    useStartConversation: () => ({
        mutateAsync: jest.fn().mockResolvedValue({
            sessionId: "conv_1",
            message: "Conversa iniciada",
            suggestions: [],
        }),
        isPending: false,
    }),
    useAIHealth: () => ({
        data: {
            status: "healthy",
            aiService: "operational",
            openaiConfigured: true,
        },
        isLoading: false,
        error: null,
    }),
}));

const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const queryClient = createTestQueryClient();
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe("ChatInterface", () => {
    it("renders chat interface with header", () => {
        render(
            <TestWrapper>
                <ChatInterface userId="user_1" organizationId="org_1" />
            </TestWrapper>
        );

        expect(screen.getByText("Alex - Assistente IA")).toBeInTheDocument();
        expect(screen.getByText("Conectado")).toBeInTheDocument();
    });

    it("renders messages correctly", () => {
        render(
            <TestWrapper>
                <ChatInterface userId="user_1" organizationId="org_1" />
            </TestWrapper>
        );

        expect(screen.getByText("Olá! Como posso ajudá-lo hoje?")).toBeInTheDocument();
    });

    it("renders input field and send button", () => {
        render(
            <TestWrapper>
                <ChatInterface userId="user_1" organizationId="org_1" />
            </TestWrapper>
        );

        expect(screen.getByPlaceholderText("Digite sua mensagem...")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /enviar/i })).toBeInTheDocument();
    });

    it("allows typing in input field", () => {
        render(
            <TestWrapper>
                <ChatInterface userId="user_1" organizationId="org_1" />
            </TestWrapper>
        );

        const input = screen.getByPlaceholderText("Digite sua mensagem...");
        fireEvent.change(input, { target: { value: "Test message" } });

        expect(input).toHaveValue("Test message");
    });

    it("shows suggestions panel when no messages", () => {
        render(
            <TestWrapper>
                <ChatInterface userId="user_1" organizationId="org_1" />
            </TestWrapper>
        );

        expect(screen.getByText("Ações Rápidas")).toBeInTheDocument();
        expect(screen.getByText("Sugestões Inteligentes")).toBeInTheDocument();
    });

    it("renders action buttons in header", () => {
        render(
            <TestWrapper>
                <ChatInterface userId="user_1" organizationId="org_1" />
            </TestWrapper>
        );

        expect(screen.getByTitle("Limpar conversa")).toBeInTheDocument();
        expect(screen.getByTitle("Reiniciar conversa")).toBeInTheDocument();
    });
});
