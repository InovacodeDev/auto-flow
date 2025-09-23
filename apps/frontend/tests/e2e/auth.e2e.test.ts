import { describe, it, expect } from "vitest";
import { page } from "./setup";

describe("Authentication E2E Tests", () => {
    it("should complete login flow", async () => {
        // Navigate to login page
        await page.goto("/auth/login");

        // Wait for login form to load
        await page.waitForSelector("form");

        // Fill in login form
        await page.fill('input[placeholder="Email"]', "test@example.com");
        await page.fill('input[placeholder="Senha"]', "password123");

        // Submit form
        await page.click('button[type="submit"]');

        // Wait for redirect to dashboard
        await page.waitForURL("/dashboard");

        // Verify user is logged in
        expect(await page.textContent("h1")).toContain("Dashboard");
    });

    it("should complete registration flow", async () => {
        // Navigate to register page
        await page.goto("/auth/register");

        // Wait for register form to load
        await page.waitForSelector("form");

        // Fill in register form
        await page.fill('input[placeholder="Nome completo"]', "João Silva");
        await page.fill('input[placeholder="Email"]', "joao@example.com");
        await page.fill('input[placeholder="Senha"]', "password123");
        await page.fill('input[placeholder="Confirmar senha"]', "password123");

        // Submit form
        await page.click('button[type="submit"]');

        // Wait for redirect to dashboard
        await page.waitForURL("/dashboard");

        // Verify user is logged in
        expect(await page.textContent("h1")).toContain("Dashboard");
    });

    it("should show validation errors for invalid login", async () => {
        // Navigate to login page
        await page.goto("/auth/login");

        // Wait for login form to load
        await page.waitForSelector("form");

        // Submit form without filling fields
        await page.click('button[type="submit"]');

        // Wait for validation errors
        await page.waitForSelector(".text-red-600");

        // Verify validation errors are shown
        expect(await page.textContent(".text-red-600")).toContain("Email é obrigatório");
        expect(await page.textContent(".text-red-600")).toContain("Senha é obrigatória");
    });

    it("should show validation errors for invalid registration", async () => {
        // Navigate to register page
        await page.goto("/auth/register");

        // Wait for register form to load
        await page.waitForSelector("form");

        // Fill in invalid data
        await page.fill('input[placeholder="Nome completo"]', "");
        await page.fill('input[placeholder="Email"]', "invalid-email");
        await page.fill('input[placeholder="Senha"]', "123");
        await page.fill('input[placeholder="Confirmar senha"]', "456");

        // Submit form
        await page.click('button[type="submit"]');

        // Wait for validation errors
        await page.waitForSelector(".text-red-600");

        // Verify validation errors are shown
        expect(await page.textContent(".text-red-600")).toContain("Nome é obrigatório");
        expect(await page.textContent(".text-red-600")).toContain("Email inválido");
        expect(await page.textContent(".text-red-600")).toContain(
            "Senha deve ter pelo menos 6 caracteres"
        );
        expect(await page.textContent(".text-red-600")).toContain("Senhas não coincidem");
    });

    it("should logout successfully", async () => {
        // First login
        await page.goto("/auth/login");
        await page.fill('input[placeholder="Email"]', "test@example.com");
        await page.fill('input[placeholder="Senha"]', "password123");
        await page.click('button[type="submit"]');
        await page.waitForURL("/dashboard");

        // Click logout button
        await page.click('button[data-testid="logout-button"]');

        // Wait for redirect to login page
        await page.waitForURL("/auth/login");

        // Verify user is logged out
        expect(await page.textContent("h1")).toContain("Entrar");
    });

    it("should redirect to login when accessing protected route without authentication", async () => {
        // Navigate to protected route without being logged in
        await page.goto("/dashboard");

        // Should be redirected to login page
        await page.waitForURL("/auth/login");

        // Verify redirect
        expect(await page.textContent("h1")).toContain("Entrar");
    });

    it("should redirect to dashboard when accessing login page while authenticated", async () => {
        // First login
        await page.goto("/auth/login");
        await page.fill('input[placeholder="Email"]', "test@example.com");
        await page.fill('input[placeholder="Senha"]', "password123");
        await page.click('button[type="submit"]');
        await page.waitForURL("/dashboard");

        // Try to access login page again
        await page.goto("/auth/login");

        // Should be redirected to dashboard
        await page.waitForURL("/dashboard");

        // Verify redirect
        expect(await page.textContent("h1")).toContain("Dashboard");
    });

    it("should toggle password visibility", async () => {
        // Navigate to login page
        await page.goto("/auth/login");

        // Wait for login form to load
        await page.waitForSelector("form");

        // Fill in password
        await page.fill('input[placeholder="Senha"]', "password123");

        // Verify password is hidden by default
        expect(await page.getAttribute('input[placeholder="Senha"]', "type")).toBe("password");

        // Click toggle button
        await page.click('button[aria-label="Mostrar senha"]');

        // Verify password is now visible
        expect(await page.getAttribute('input[placeholder="Senha"]', "type")).toBe("text");

        // Click toggle button again
        await page.click('button[aria-label="Ocultar senha"]');

        // Verify password is hidden again
        expect(await page.getAttribute('input[placeholder="Senha"]', "type")).toBe("password");
    });

    it("should navigate between login and register pages", async () => {
        // Start at login page
        await page.goto("/auth/login");

        // Click register link
        await page.click('a[href="/auth/register"]');

        // Should be on register page
        await page.waitForURL("/auth/register");
        expect(await page.textContent("h1")).toContain("Criar Conta");

        // Click login link
        await page.click('a[href="/auth/login"]');

        // Should be on login page
        await page.waitForURL("/auth/login");
        expect(await page.textContent("h1")).toContain("Entrar");
    });
});
