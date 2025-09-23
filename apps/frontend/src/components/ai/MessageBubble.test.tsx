import React from "react";
import { screen } from "@testing-library/react";
import { renderWithProviders, mockChatMessage, testHelpers } from "../../test/utils";
import { MessageBubble } from "./MessageBubble";

describe("MessageBubble", () => {
    it("renders user message correctly", () => {
        const userMessage = {
            ...mockChatMessage,
            role: "user" as const,
            content: "Hello, how are you?",
        };

        renderWithProviders(<MessageBubble message={userMessage} />);

        expect(screen.getByText("Hello, how are you?")).toBeInTheDocument();
        expect(screen.getByText("Usuário")).toBeInTheDocument();
    });

    it("renders assistant message correctly", () => {
        const assistantMessage = {
            ...mockChatMessage,
            role: "assistant" as const,
            content: "I'm doing well, thank you!",
        };

        renderWithProviders(<MessageBubble message={assistantMessage} />);

        expect(screen.getByText("I'm doing well, thank you!")).toBeInTheDocument();
        expect(screen.getByText("Assistente")).toBeInTheDocument();
    });

    it("renders system message correctly", () => {
        const systemMessage = {
            ...mockChatMessage,
            role: "system" as const,
            content: "System notification",
        };

        renderWithProviders(<MessageBubble message={systemMessage} />);

        expect(screen.getByText("System notification")).toBeInTheDocument();
        expect(screen.getByText("Sistema")).toBeInTheDocument();
    });

    it("renders timestamp correctly", () => {
        const message = {
            ...mockChatMessage,
            timestamp: "2024-01-15T10:30:00Z",
        };

        renderWithProviders(<MessageBubble message={message} />);

        // Timestamp should be formatted in Portuguese
        expect(screen.getByText("10:30")).toBeInTheDocument();
    });

    it("renders workflow generated metadata", () => {
        const message = {
            ...mockChatMessage,
            metadata: {
                workflowGenerated: true,
                confidence: 0.95,
                suggestions: ["Configure integration"],
                nextSteps: ["Test workflow"],
            },
        };

        renderWithProviders(<MessageBubble message={message} />);

        expect(screen.getByText("Workflow gerado com sucesso!")).toBeInTheDocument();
        expect(screen.getByText("Confiança: 95%")).toBeInTheDocument();
        expect(screen.getByText("Sugestões:")).toBeInTheDocument();
        expect(screen.getByText("Próximos passos:")).toBeInTheDocument();
    });

    it("renders suggestions in metadata", () => {
        const message = {
            ...mockChatMessage,
            metadata: {
                suggestions: ["Configure integration", "Test workflow"],
            },
        };

        renderWithProviders(<MessageBubble message={message} />);

        expect(screen.getByText("Sugestões:")).toBeInTheDocument();
        expect(screen.getByText("Configure integration")).toBeInTheDocument();
        expect(screen.getByText("Test workflow")).toBeInTheDocument();
    });

    it("renders next steps in metadata", () => {
        const message = {
            ...mockChatMessage,
            metadata: {
                nextSteps: ["Configure integration", "Test workflow"],
            },
        };

        renderWithProviders(<MessageBubble message={message} />);

        expect(screen.getByText("Próximos passos:")).toBeInTheDocument();
        expect(screen.getByText("Configure integration")).toBeInTheDocument();
        expect(screen.getByText("Test workflow")).toBeInTheDocument();
    });

    it("renders confidence in metadata", () => {
        const message = {
            ...mockChatMessage,
            metadata: {
                confidence: 0.87,
            },
        };

        renderWithProviders(<MessageBubble message={message} />);

        expect(screen.getByText("Confiança: 87%")).toBeInTheDocument();
    });

    it("does not render metadata when not present", () => {
        const message = {
            ...mockChatMessage,
            metadata: undefined,
        };

        renderWithProviders(<MessageBubble message={message} />);

        expect(screen.queryByText("Workflow gerado com sucesso!")).not.toBeInTheDocument();
        expect(screen.queryByText("Confiança:")).not.toBeInTheDocument();
        expect(screen.queryByText("Sugestões:")).not.toBeInTheDocument();
        expect(screen.queryByText("Próximos passos:")).not.toBeInTheDocument();
    });

    it("applies correct styling for user message", () => {
        const userMessage = {
            ...mockChatMessage,
            role: "user" as const,
        };

        renderWithProviders(<MessageBubble message={userMessage} />);

        const messageContainer = screen.getByText("Hello, how are you?").closest("div");
        expect(messageContainer).toHaveClass("bg-blue-50");
        expect(messageContainer).toHaveClass("border-blue-200");
    });

    it("applies correct styling for assistant message", () => {
        const assistantMessage = {
            ...mockChatMessage,
            role: "assistant" as const,
        };

        renderWithProviders(<MessageBubble message={assistantMessage} />);

        const messageContainer = screen.getByText("Hello, how are you?").closest("div");
        expect(messageContainer).toHaveClass("bg-gray-50");
        expect(messageContainer).toHaveClass("border-gray-200");
    });

    it("applies correct styling for system message", () => {
        const systemMessage = {
            ...mockChatMessage,
            role: "system" as const,
        };

        renderWithProviders(<MessageBubble message={systemMessage} />);

        const messageContainer = screen.getByText("Hello, how are you?").closest("div");
        expect(messageContainer).toHaveClass("bg-green-50");
        expect(messageContainer).toHaveClass("border-green-200");
    });

    it("renders correct icon for user message", () => {
        const userMessage = {
            ...mockChatMessage,
            role: "user" as const,
        };

        renderWithProviders(<MessageBubble message={userMessage} />);

        // User icon should be present
        expect(screen.getByTestId("user-icon")).toBeInTheDocument();
    });

    it("renders correct icon for assistant message", () => {
        const assistantMessage = {
            ...mockChatMessage,
            role: "assistant" as const,
        };

        renderWithProviders(<MessageBubble message={assistantMessage} />);

        // Assistant icon should be present
        expect(screen.getByTestId("assistant-icon")).toBeInTheDocument();
    });

    it("renders correct icon for system message", () => {
        const systemMessage = {
            ...mockChatMessage,
            role: "system" as const,
        };

        renderWithProviders(<MessageBubble message={systemMessage} />);

        // System icon should be present
        expect(screen.getByTestId("system-icon")).toBeInTheDocument();
    });
});
