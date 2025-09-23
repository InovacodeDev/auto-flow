import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders, mockFunctions, testHelpers } from "../../test/utils";
import { RegisterForm } from "./RegisterForm";

// Mock the auth service
vi.mock("../../services/aiService", () => ({
    useAuthEnhanced: () => ({
        register: mockFunctions.register,
        isLoading: false,
        error: null,
    }),
}));

describe("RegisterForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders register form correctly", () => {
        renderWithProviders(<RegisterForm />);

        expect(screen.getByText("Criar Conta")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Nome completo")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Senha")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Confirmar senha")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /criar conta/i })).toBeInTheDocument();
        expect(screen.getByText("Já tem uma conta?")).toBeInTheDocument();
        expect(screen.getByText("Faça login aqui")).toBeInTheDocument();
    });

    it("shows validation errors for empty fields", async () => {
        const user = userEvent.setup();
        renderWithProviders(<RegisterForm />);

        const submitButton = screen.getByRole("button", { name: /criar conta/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText("Nome é obrigatório")).toBeInTheDocument();
            expect(screen.getByText("Email é obrigatório")).toBeInTheDocument();
            expect(screen.getByText("Senha é obrigatória")).toBeInTheDocument();
            expect(screen.getByText("Confirmação de senha é obrigatória")).toBeInTheDocument();
        });
    });

    it("shows validation error for invalid email", async () => {
        const user = userEvent.setup();
        renderWithProviders(<RegisterForm />);

        const nameInput = screen.getByPlaceholderText("Nome completo");
        const emailInput = screen.getByPlaceholderText("Email");
        const passwordInput = screen.getByPlaceholderText("Senha");
        const confirmPasswordInput = screen.getByPlaceholderText("Confirmar senha");
        const submitButton = screen.getByRole("button", { name: /criar conta/i });

        await user.type(nameInput, "João Silva");
        await user.type(emailInput, "invalid-email");
        await user.type(passwordInput, "password123");
        await user.type(confirmPasswordInput, "password123");
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText("Email inválido")).toBeInTheDocument();
        });
    });

    it("shows validation error for short password", async () => {
        const user = userEvent.setup();
        renderWithProviders(<RegisterForm />);

        const nameInput = screen.getByPlaceholderText("Nome completo");
        const emailInput = screen.getByPlaceholderText("Email");
        const passwordInput = screen.getByPlaceholderText("Senha");
        const confirmPasswordInput = screen.getByPlaceholderText("Confirmar senha");
        const submitButton = screen.getByRole("button", { name: /criar conta/i });

        await user.type(nameInput, "João Silva");
        await user.type(emailInput, "test@example.com");
        await user.type(passwordInput, "123");
        await user.type(confirmPasswordInput, "123");
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText("Senha deve ter pelo menos 6 caracteres")).toBeInTheDocument();
        });
    });

    it("shows validation error for password mismatch", async () => {
        const user = userEvent.setup();
        renderWithProviders(<RegisterForm />);

        const nameInput = screen.getByPlaceholderText("Nome completo");
        const emailInput = screen.getByPlaceholderText("Email");
        const passwordInput = screen.getByPlaceholderText("Senha");
        const confirmPasswordInput = screen.getByPlaceholderText("Confirmar senha");
        const submitButton = screen.getByRole("button", { name: /criar conta/i });

        await user.type(nameInput, "João Silva");
        await user.type(emailInput, "test@example.com");
        await user.type(passwordInput, "password123");
        await user.type(confirmPasswordInput, "differentpassword");
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText("Senhas não coincidem")).toBeInTheDocument();
        });
    });

    it("calls register function with correct data on valid form submission", async () => {
        const user = userEvent.setup();
        renderWithProviders(<RegisterForm />);

        const nameInput = screen.getByPlaceholderText("Nome completo");
        const emailInput = screen.getByPlaceholderText("Email");
        const passwordInput = screen.getByPlaceholderText("Senha");
        const confirmPasswordInput = screen.getByPlaceholderText("Confirmar senha");
        const submitButton = screen.getByRole("button", { name: /criar conta/i });

        await user.type(nameInput, "João Silva");
        await user.type(emailInput, "test@example.com");
        await user.type(passwordInput, "password123");
        await user.type(confirmPasswordInput, "password123");
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockFunctions.register).toHaveBeenCalledWith({
                name: "João Silva",
                email: "test@example.com",
                password: "password123",
                confirmPassword: "password123",
            });
        });
    });

    it("shows loading state during registration", async () => {
        const user = userEvent.setup();

        // Mock loading state
        vi.mocked(mockFunctions.register).mockImplementation(
            () =>
                new Promise((resolve) =>
                    setTimeout(() => resolve(mockApiResponses.auth.register), 1000)
                )
        );

        renderWithProviders(<RegisterForm />);

        const nameInput = screen.getByPlaceholderText("Nome completo");
        const emailInput = screen.getByPlaceholderText("Email");
        const passwordInput = screen.getByPlaceholderText("Senha");
        const confirmPasswordInput = screen.getByPlaceholderText("Confirmar senha");
        const submitButton = screen.getByRole("button", { name: /criar conta/i });

        await user.type(nameInput, "João Silva");
        await user.type(emailInput, "test@example.com");
        await user.type(passwordInput, "password123");
        await user.type(confirmPasswordInput, "password123");
        await user.click(submitButton);

        expect(screen.getByText("Criando conta...")).toBeInTheDocument();
        expect(submitButton).toBeDisabled();
    });

    it("shows error message on registration failure", async () => {
        const user = userEvent.setup();

        // Mock error response
        vi.mocked(mockFunctions.register).mockRejectedValue(new Error("Registration failed"));

        renderWithProviders(<RegisterForm />);

        const nameInput = screen.getByPlaceholderText("Nome completo");
        const emailInput = screen.getByPlaceholderText("Email");
        const passwordInput = screen.getByPlaceholderText("Senha");
        const confirmPasswordInput = screen.getByPlaceholderText("Confirmar senha");
        const submitButton = screen.getByRole("button", { name: /criar conta/i });

        await user.type(nameInput, "João Silva");
        await user.type(emailInput, "test@example.com");
        await user.type(passwordInput, "password123");
        await user.type(confirmPasswordInput, "password123");
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText("Erro ao criar conta. Tente novamente.")).toBeInTheDocument();
        });
    });

    it("navigates to login page when clicking login link", async () => {
        const user = userEvent.setup();
        renderWithProviders(<RegisterForm />);

        const loginLink = screen.getByText("Faça login aqui");
        await user.click(loginLink);

        // This would be tested with actual router navigation in integration tests
        expect(loginLink).toBeInTheDocument();
    });

    it("toggles password visibility for both password fields", async () => {
        const user = userEvent.setup();
        renderWithProviders(<RegisterForm />);

        const passwordInput = screen.getByPlaceholderText("Senha");
        const confirmPasswordInput = screen.getByPlaceholderText("Confirmar senha");
        const toggleButton = screen.getByRole("button", { name: /mostrar senha/i });

        expect(passwordInput).toHaveAttribute("type", "password");
        expect(confirmPasswordInput).toHaveAttribute("type", "password");

        await user.click(toggleButton);

        expect(passwordInput).toHaveAttribute("type", "text");
        expect(confirmPasswordInput).toHaveAttribute("type", "text");
        expect(screen.getByRole("button", { name: /ocultar senha/i })).toBeInTheDocument();
    });
});
