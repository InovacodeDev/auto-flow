import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { FastifyInstance } from "fastify";
import { build } from "../../src/index";

describe("Auth Integration Tests", () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = build();
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        // Clean up database or reset state if needed
    });

    describe("POST /api/auth/login", () => {
        it("should login with valid credentials", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/api/auth/login",
                payload: {
                    email: "test@example.com",
                    password: "password123",
                },
            });

            expect(response.statusCode).toBe(200);
            const data = JSON.parse(response.body);
            expect(data).toHaveProperty("user");
            expect(data).toHaveProperty("accessToken");
            expect(data).toHaveProperty("refreshToken");
        });

        it("should return 401 for invalid credentials", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/api/auth/login",
                payload: {
                    email: "test@example.com",
                    password: "wrongpassword",
                },
            });

            expect(response.statusCode).toBe(401);
            const data = JSON.parse(response.body);
            expect(data).toHaveProperty("error");
        });

        it("should return 400 for missing fields", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/api/auth/login",
                payload: {
                    email: "test@example.com",
                },
            });

            expect(response.statusCode).toBe(400);
            const data = JSON.parse(response.body);
            expect(data).toHaveProperty("error");
        });

        it("should return 400 for invalid email format", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/api/auth/login",
                payload: {
                    email: "invalid-email",
                    password: "password123",
                },
            });

            expect(response.statusCode).toBe(400);
            const data = JSON.parse(response.body);
            expect(data).toHaveProperty("error");
        });
    });

    describe("POST /api/auth/register", () => {
        it("should register with valid data", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/api/auth/register",
                payload: {
                    name: "João Silva",
                    email: "joao@example.com",
                    password: "password123",
                    confirmPassword: "password123",
                },
            });

            expect(response.statusCode).toBe(201);
            const data = JSON.parse(response.body);
            expect(data).toHaveProperty("user");
            expect(data).toHaveProperty("accessToken");
            expect(data).toHaveProperty("refreshToken");
        });

        it("should return 400 for password mismatch", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/api/auth/register",
                payload: {
                    name: "João Silva",
                    email: "joao@example.com",
                    password: "password123",
                    confirmPassword: "differentpassword",
                },
            });

            expect(response.statusCode).toBe(400);
            const data = JSON.parse(response.body);
            expect(data).toHaveProperty("error");
        });

        it("should return 400 for short password", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/api/auth/register",
                payload: {
                    name: "João Silva",
                    email: "joao@example.com",
                    password: "123",
                    confirmPassword: "123",
                },
            });

            expect(response.statusCode).toBe(400);
            const data = JSON.parse(response.body);
            expect(data).toHaveProperty("error");
        });

        it("should return 409 for existing email", async () => {
            // First registration
            await app.inject({
                method: "POST",
                url: "/api/auth/register",
                payload: {
                    name: "João Silva",
                    email: "existing@example.com",
                    password: "password123",
                    confirmPassword: "password123",
                },
            });

            // Second registration with same email
            const response = await app.inject({
                method: "POST",
                url: "/api/auth/register",
                payload: {
                    name: "João Silva",
                    email: "existing@example.com",
                    password: "password123",
                    confirmPassword: "password123",
                },
            });

            expect(response.statusCode).toBe(409);
            const data = JSON.parse(response.body);
            expect(data).toHaveProperty("error");
        });
    });

    describe("POST /api/auth/refresh", () => {
        it("should refresh token with valid refresh token", async () => {
            // First login to get tokens
            const loginResponse = await app.inject({
                method: "POST",
                url: "/api/auth/login",
                payload: {
                    email: "test@example.com",
                    password: "password123",
                },
            });

            const loginData = JSON.parse(loginResponse.body);
            const refreshToken = loginData.refreshToken;

            // Refresh token
            const response = await app.inject({
                method: "POST",
                url: "/api/auth/refresh",
                payload: {
                    refreshToken,
                },
            });

            expect(response.statusCode).toBe(200);
            const data = JSON.parse(response.body);
            expect(data).toHaveProperty("accessToken");
            expect(data).toHaveProperty("refreshToken");
        });

        it("should return 401 for invalid refresh token", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/api/auth/refresh",
                payload: {
                    refreshToken: "invalid-token",
                },
            });

            expect(response.statusCode).toBe(401);
            const data = JSON.parse(response.body);
            expect(data).toHaveProperty("error");
        });
    });

    describe("GET /api/auth/me", () => {
        it("should return user data with valid token", async () => {
            // First login to get token
            const loginResponse = await app.inject({
                method: "POST",
                url: "/api/auth/login",
                payload: {
                    email: "test@example.com",
                    password: "password123",
                },
            });

            const loginData = JSON.parse(loginResponse.body);
            const accessToken = loginData.accessToken;

            // Get user data
            const response = await app.inject({
                method: "GET",
                url: "/api/auth/me",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            expect(response.statusCode).toBe(200);
            const data = JSON.parse(response.body);
            expect(data).toHaveProperty("id");
            expect(data).toHaveProperty("name");
            expect(data).toHaveProperty("email");
        });

        it("should return 401 without token", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/api/auth/me",
            });

            expect(response.statusCode).toBe(401);
            const data = JSON.parse(response.body);
            expect(data).toHaveProperty("error");
        });

        it("should return 401 with invalid token", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/api/auth/me",
                headers: {
                    Authorization: "Bearer invalid-token",
                },
            });

            expect(response.statusCode).toBe(401);
            const data = JSON.parse(response.body);
            expect(data).toHaveProperty("error");
        });
    });

    describe("POST /api/auth/logout", () => {
        it("should logout with valid token", async () => {
            // First login to get token
            const loginResponse = await app.inject({
                method: "POST",
                url: "/api/auth/login",
                payload: {
                    email: "test@example.com",
                    password: "password123",
                },
            });

            const loginData = JSON.parse(loginResponse.body);
            const accessToken = loginData.accessToken;

            // Logout
            const response = await app.inject({
                method: "POST",
                url: "/api/auth/logout",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            expect(response.statusCode).toBe(200);
            const data = JSON.parse(response.body);
            expect(data).toHaveProperty("message");
        });

        it("should return 401 without token", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/api/auth/logout",
            });

            expect(response.statusCode).toBe(401);
            const data = JSON.parse(response.body);
            expect(data).toHaveProperty("error");
        });
    });
});
