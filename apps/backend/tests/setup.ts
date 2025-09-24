/**
 * Setup para testes Jest
 * Configura ambiente de teste e mocks necessários
 */

// Configurar variáveis de ambiente de teste
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-key";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-key";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.REDIS_URL = "redis://localhost:6379";

// Mock do Redis para evitar dependência do Redis nos testes
jest.mock("ioredis", () => {
    return jest.fn().mockImplementation(() => ({
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue("OK"),
        del: jest.fn().mockResolvedValue(1),
        flushall: jest.fn().mockResolvedValue("OK"),
        quit: jest.fn().mockResolvedValue("OK"),
        disconnect: jest.fn().mockResolvedValue(undefined),
        ping: jest.fn().mockResolvedValue("PONG"),
        on: jest.fn(),
        off: jest.fn(),
        status: "ready",
    }));
});

// Mock do BullMQ para evitar dependência do Redis nos testes
jest.mock("bullmq", () => ({
    Queue: jest.fn().mockImplementation(() => ({
        add: jest.fn().mockResolvedValue({ id: "test-job-id" }),
        getJobs: jest.fn().mockResolvedValue([]),
        clean: jest.fn().mockResolvedValue(0),
        close: jest.fn().mockResolvedValue(undefined),
        pause: jest.fn().mockResolvedValue(undefined),
        resume: jest.fn().mockResolvedValue(undefined),
        getWaiting: jest.fn().mockResolvedValue([]),
        getActive: jest.fn().mockResolvedValue([]),
        getCompleted: jest.fn().mockResolvedValue([]),
        getFailed: jest.fn().mockResolvedValue([]),
    })),
    Worker: jest.fn().mockImplementation(() => ({
        close: jest.fn().mockResolvedValue(undefined),
        pause: jest.fn().mockResolvedValue(undefined),
        resume: jest.fn().mockResolvedValue(undefined),
        on: jest.fn(),
        off: jest.fn(),
    })),
    QueueEvents: jest.fn().mockImplementation(() => ({
        close: jest.fn().mockResolvedValue(undefined),
        on: jest.fn(),
        off: jest.fn(),
    })),
}));

// Mock de serviços externos
jest.mock("../src/integrations/whatsapp/WhatsAppService", () => ({
    WhatsAppService: jest.fn().mockImplementation(() => ({
        sendMessage: jest.fn().mockResolvedValue({ success: true }),
        sendTemplate: jest.fn().mockResolvedValue({ success: true }),
        processWebhook: jest.fn().mockResolvedValue({ success: true }),
    })),
}));

jest.mock("../src/integrations/pix/PIXService", () => ({
    PIXService: jest.fn().mockImplementation(() => ({
        createPayment: jest.fn().mockResolvedValue({ id: "test-payment-id" }),
        getPaymentStatus: jest.fn().mockResolvedValue({ status: "pending" }),
    })),
}));

// Mock do banco de dados
jest.mock("../src/core/database", () => {
    const mockUsers = [
        {
            id: "temp-user-id",
            email: "test@example.com",
            name: "Test User",
            role: "admin",
            password_hash: "$2b$10$rH0UJK8PO8n8W8Q8eQZr/.N8oO9K7dBQkzY7jCGKP8k9qPp2zRb2S",
            is_active: true,
            organization_id: "temp-org-id",
            last_login_at: null,
            created_at: new Date(),
            updated_at: new Date(),
        },
    ];

    const mockOrganizations = [
        {
            id: "temp-org-id",
            name: "Test Organization",
            plan: "pro",
            created_at: new Date(),
            updated_at: new Date(),
        },
    ];

    const mockWorkflows = [
        {
            id: "test-workflow-1",
            name: "Test Workflow",
            description: "A test workflow",
            status: "draft",
            isTemplate: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    ];

    return {
        db: {
            select: () => ({
                from: () => ({
                    where: () => ({
                        orderBy: () => mockWorkflows,
                        limit: () => mockWorkflows,
                    }),
                    innerJoin: () => ({
                        where: () => ({
                            limit: () =>
                                mockUsers.map((user) => ({
                                    ...user,
                                    organizations: mockOrganizations[0],
                                })),
                        }),
                    }),
                }),
            }),
            insert: () => ({
                values: () => ({
                    returning: () => [
                        {
                            id: "test-workflow-id",
                            name: "Test Workflow",
                            description: "Test Description",
                            organizationId: "temp-org-id",
                            status: "draft",
                            triggers: [],
                            actions: [],
                            conditions: [],
                            metadata: {},
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        },
                    ],
                }),
            }),
            update: () => ({
                set: () => ({
                    where: () => ({
                        returning: () => [
                            {
                                id: "test-workflow-id",
                                name: "Updated Workflow",
                                description: "Updated Description",
                                organizationId: "temp-org-id",
                                status: "draft",
                                triggers: [],
                                actions: [],
                                conditions: [],
                                metadata: {},
                                createdAt: new Date(),
                                updatedAt: new Date(),
                            },
                        ],
                    }),
                }),
            }),
            delete: () => ({
                where: () => ({ rowCount: 1 }),
            }),
        },
        client: {
            end: jest.fn().mockResolvedValue(undefined),
        },
        migrateDatabase: jest.fn().mockResolvedValue(undefined),
    };
});

// Mock do AuthService
jest.mock("../src/auth/AuthService", () => ({
    AuthService: jest.fn().mockImplementation(() => ({
        login: jest.fn().mockImplementation(({ email, password }) => {
            // Simulate login failure for invalid credentials
            if (password === "wrongpassword" || password === "x") {
                const AutoFlowError = require("../src/core/types").AutoFlowError;
                throw new AutoFlowError("Invalid credentials", "INVALID_CREDENTIALS");
            }
            return Promise.resolve({
                user: {
                    id: "temp-user-id",
                    email: email,
                    name: "Test User",
                    role: "admin",
                    organization_id: "temp-org-id",
                },
                tokens: {
                    accessToken: "test-jwt-token",
                    refreshToken: "test-refresh-token",
                },
            });
        }),
        register: jest.fn().mockImplementation((data) => {
            // Simulate registration failure for existing email
            if (data.user?.email === "alice@example.com") {
                const AutoFlowError = require("../src/core/types").AutoFlowError;
                throw new AutoFlowError("Email already exists", "EMAIL_ALREADY_EXISTS");
            }
            return Promise.resolve({
                user: {
                    id: "temp-user-id",
                    email: data.user?.email,
                    name: data.user?.name,
                    role: "admin",
                    organization_id: "temp-org-id",
                },
                tokens: {
                    accessToken: "test-jwt-token",
                    refreshToken: "test-refresh-token",
                },
            });
        }),
        verifyToken: jest.fn().mockImplementation((token) => {
            // Mock invalid tokens
            if (token === "invalid-token" || token === "Bearer invalid-token") {
                throw new Error("Invalid token");
            }
            if (!token) {
                throw new Error("Token required");
            }
            return Promise.resolve({
                id: "temp-user-id",
                email: "test@example.com",
                organization_id: "temp-org-id",
            });
        }),
        hashPassword: jest.fn().mockResolvedValue("$2b$10$rH0UJK8PO8n8W8Q8eQZr/.N8oO9K7dBQkzY7jCGKP8k9qPp2zRb2S"),
        verifyPassword: jest.fn().mockResolvedValue(true),
        validatePassword: jest.fn().mockImplementation((password, confirmPassword) => {
            if (confirmPassword && password !== confirmPassword) {
                return { isValid: false, errors: ["Passwords do not match"] };
            }
            if (password.length < 8) {
                return { isValid: false, errors: ["Password must be at least 8 characters"] };
            }
            return { isValid: true, errors: [] };
        }),
        refreshToken: jest.fn().mockImplementation((refreshToken) => {
            // Mock invalid refresh token
            if (refreshToken === "invalid-refresh-token") {
                const AutoFlowError = require("../src/core/types").AutoFlowError;
                throw new AutoFlowError("Invalid refresh token", "INVALID_TOKEN");
            }
            return Promise.resolve({
                accessToken: "new-test-jwt-token",
                refreshToken: "new-test-refresh-token",
            });
        }),
        logout: jest.fn().mockResolvedValue(undefined),
    })),
}));

// Mock do AuthMiddleware
jest.mock("../src/auth/AuthMiddleware", () => ({
    AuthMiddleware: jest.fn().mockImplementation(() => ({
        requireUser: () => (request: any, reply: any, done: any) => {
            const authHeader = request.headers.authorization;

            // Check if token is provided and valid
            if (!authHeader || authHeader === "Bearer invalid-token") {
                return reply.code(401).send({ error: "Unauthorized" });
            }

            // Mock user data in request for valid tokens
            request.user = {
                id: "temp-user-id",
                email: "test@example.com",
                name: "Test User",
                organizationId: "temp-org-id",
            };
            done();
        },
        ipRateLimit: (maxRequests: number, windowMs: number) => (request: any, reply: any, done: any) => {
            // Mock rate limiting - always allow in tests
            done();
        },
        authenticate: () => (request: any, reply: any, done: any) => {
            const authHeader = request.headers.authorization;

            // Check if token is provided and valid
            if (!authHeader || authHeader === "Bearer invalid-token") {
                return reply.code(401).send({ error: "Unauthorized" });
            }

            // Mock authentication - set user for valid tokens
            request.user = {
                id: "temp-user-id",
                email: "test@example.com",
                name: "Test User",
                organizationId: "temp-org-id",
            };
            done();
        },
    })),
}));

console.log("🧪 Test environment setup completed");
