import { describe, it, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
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

    describe("POST /api/login", () => {
        it("should login with valid credentials", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/api/login",
                payload: {
                    email: "test@example.com",
                    password: "password123",
                },
            });

            expect(response.statusCode).toBe(200);
            const data = JSON.parse(response.body);
            expect(data).toHaveProperty("user");
            expect(data).toHaveProperty("tokens");
            expect(data.tokens).toHaveProperty("accessToken");
            expect(data.tokens).toHaveProperty("refreshToken");
        });

        it("should return 401 for invalid credentials", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/api/login",
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
                url: "/api/login",
                payload: {
                    email: "test@example.com",
                    // password is missing
                },
            });

            expect(response.statusCode).toBe(400);
            const data = JSON.parse(response.body);
            expect(data).toHaveProperty("message");
        });

        it("should return 400 for invalid email format", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/api/login",
                payload: {
                    email: "invalid-email",
                    password: "password123",
                },
            });

            expect(response.statusCode).toBe(400);
            const data = JSON.parse(response.body);
            expect(data).toHaveProperty("message");
        });
    });

    describe("POST /api/register", () => {
        it("should register with valid data", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/api/register",
                payload: {
                    organization: {
                        name: "Test Company",
                        industry: "Tecnologia",
                        size: "pequena",
                        country: "BR",
                    },
                    user: {
                        name: "João Silva",
                        email: "joao@example.com",
                        password: "password123",
                    },
                    acceptedTerms: true,
                    acceptedPrivacy: true,
                },
            });

            expect(response.statusCode).toBe(201);
            const data = JSON.parse(response.body);
            expect(data).toHaveProperty("user");
            expect(data).toHaveProperty("tokens");
            expect(data.tokens).toHaveProperty("accessToken");
            expect(data.tokens).toHaveProperty("refreshToken");
        });

        it("should return 409 for existing email", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/api/register",
                payload: {
                    organization: {
                        name: "Existing Org",
                        industry: "Tecnologia",
                        size: "pequena",
                        country: "BR",
                    },
                    user: {
                        name: "Alice Santos",
                        email: "alice@example.com",
                        password: "password123",
                    },
                    acceptedTerms: true,
                    acceptedPrivacy: true,
                },
            });

            expect(response.statusCode).toBe(409);
            const data = JSON.parse(response.body);
            expect(data).toHaveProperty("error");
        });
    });

    describe("POST /api/auth/refresh", () => {
        it("should refresh token with valid refresh token", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/api/auth/refresh",
                payload: {
                    refreshToken: "valid-refresh-token",
                },
            });

            expect(response.statusCode).toBe(200);
            const data = JSON.parse(response.body);
            expect(data).toHaveProperty("tokens");
            expect(data.tokens).toHaveProperty("accessToken");
            expect(data.tokens).toHaveProperty("refreshToken");
        });

        it("should return 401 for invalid refresh token", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/api/auth/refresh",
                payload: {
                    refreshToken: "invalid-refresh-token",
                },
            });

            expect(response.statusCode).toBe(401);
            const data = JSON.parse(response.body);
            expect(data).toHaveProperty("error");
        });
    });

    describe("GET /api/auth/me", () => {
        it("should return user data with valid token", async () => {
            const response = await app.inject({
                method: "GET",
                url: "/api/auth/me",
                headers: {
                    authorization: "Bearer valid-jwt-token",
                },
            });

            expect(response.statusCode).toBe(200);
            const data = JSON.parse(response.body);
            expect(data.user).toHaveProperty("id");
            expect(data.user).toHaveProperty("name");
            expect(data.user).toHaveProperty("email");
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
                    authorization: "Bearer invalid-token",
                },
            });

            expect(response.statusCode).toBe(401);
            const data = JSON.parse(response.body);
            expect(data).toHaveProperty("error");
        });
    });

    describe("POST /api/auth/logout", () => {
        it("should logout with valid token", async () => {
            const response = await app.inject({
                method: "POST",
                url: "/api/auth/logout",
                headers: {
                    authorization: "Bearer valid-jwt-token",
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
