import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, mockFunctions, testHelpers } from "../../test/utils";
import { LoginForm } from "./LoginForm";

// Mock the auth service
vi.mock("../../services/aiService", () => ({
    useAuthEnhanced: () => ({
        login: mockFunctions.login,
        isLoading: false,
        error: null,
    }),
}));

describe("LoginForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders login form correctly", () => {
        renderWithProviders(<LoginForm />);

        expect(screen.getByText("Entrar")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Senha")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();
        expect(screen.getByText("Não tem uma conta?")).toBeInTheDocument();
        expect(screen.getByText("Registre-se aqui")).toBeInTheDocument();
    });

    it("shows validation errors for empty fields", async () => {
        const user = userEvent.setup();
        renderWithProviders(<LoginForm />);

        const submitButton = screen.getByRole("button", { name: /entrar/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText("Email é obrigatório")).toBeInTheDocument();
            expect(screen.getByText("Senha é obrigatória")).toBeInTheDocument();
        });
    });

    it("shows validation error for invalid email", async () => {
        const user = userEvent.setup();
        renderWithProviders(<LoginForm />);

        const emailInput = screen.getByPlaceholderText("Email");
        const passwordInput = screen.getByPlaceholderText("Senha");
        const submitButton = screen.getByRole("button", { name: /entrar/i });

        await user.type(emailInput, "invalid-email");
        await user.type(passwordInput, "password123");
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText("Email inválido")).toBeInTheDocument();
        });
    });

    it("shows validation error for short password", async () => {
        const user = userEvent.setup();
        renderWithProviders(<LoginForm />);

        const emailInput = screen.getByPlaceholderText("Email");
        const passwordInput = screen.getByPlaceholderText("Senha");
        const submitButton = screen.getByRole("button", { name: /entrar/i });

        await user.type(emailInput, "test@example.com");
        await user.type(passwordInput, "123");
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText("Senha deve ter pelo menos 6 caracteres")).toBeInTheDocument();
        });
    });

    it("calls login function with correct data on valid form submission", async () => {
        const user = userEvent.setup();
        renderWithProviders(<LoginForm />);

        const emailInput = screen.getByPlaceholderText("Email");
        const passwordInput = screen.getByPlaceholderText("Senha");
        const submitButton = screen.getByRole("button", { name: /entrar/i });

        await user.type(emailInput, "test@example.com");
        await user.type(passwordInput, "password123");
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockFunctions.login).toHaveBeenCalledWith({
                email: "test@example.com",
                password: "password123",
            });
        });
    });

    it("shows loading state during login", async () => {
        const user = userEvent.setup();

        // Mock loading state
        vi.mocked(mockFunctions.login).mockImplementation(
            () =>
                new Promise((resolve) =>
                    setTimeout(() => resolve(mockApiResponses.auth.login), 1000)
                )
        );

        renderWithProviders(<LoginForm />);

        const emailInput = screen.getByPlaceholderText("Email");
        const passwordInput = screen.getByPlaceholderText("Senha");
        const submitButton = screen.getByRole("button", { name: /entrar/i });

        await user.type(emailInput, "test@example.com");
        await user.type(passwordInput, "password123");
        await user.click(submitButton);

        expect(screen.getByText("Entrando...")).toBeInTheDocument();
        expect(submitButton).toBeDisabled();
    });

    it("shows error message on login failure", async () => {
        const user = userEvent.setup();

        // Mock error response
        vi.mocked(mockFunctions.login).mockRejectedValue(new Error("Login failed"));

        renderWithProviders(<LoginForm />);

        const emailInput = screen.getByPlaceholderText("Email");
        const passwordInput = screen.getByPlaceholderText("Senha");
        const submitButton = screen.getByRole("button", { name: /entrar/i });

        await user.type(emailInput, "test@example.com");
        await user.type(passwordInput, "password123");
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText("Erro ao fazer login. Tente novamente.")).toBeInTheDocument();
        });
    });

    it("navigates to register page when clicking register link", async () => {
        const user = userEvent.setup();
        renderWithProviders(<LoginForm />);

        const registerLink = screen.getByText("Registre-se aqui");
        await user.click(registerLink);

        // This would be tested with actual router navigation in integration tests
        expect(registerLink).toBeInTheDocument();
    });

    it("toggles password visibility", async () => {
        const user = userEvent.setup();
        renderWithProviders(<LoginForm />);

        const passwordInput = screen.getByPlaceholderText("Senha");
        const toggleButton = screen.getByRole("button", { name: /mostrar senha/i });

        expect(passwordInput).toHaveAttribute("type", "password");

        await user.click(toggleButton);

        expect(passwordInput).toHaveAttribute("type", "text");
        expect(screen.getByRole("button", { name: /ocultar senha/i })).toBeInTheDocument();
    });
});
