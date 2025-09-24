/**
 * Setup para testes Jest
 * Configura ambiente de teste e mocks necessários
 */

// Mock do AuthMiddleware - DEVE ser primeiro antes de qualquer import
jest.mock("../src/auth/AuthMiddleware", () => ({
    AuthMiddleware: jest.fn().mockImplementation(() => ({
        requireUser: () => {
            return async (request: any, reply: any) => {
                // Mock user data in request
                request.user = {
                    id: "temp-user-id",
                    email: "test@example.com",
                    organizationId: "temp-org-id",
                };
                return;
            };
        },
        ipRateLimit: (maxRequests = 5, windowMs = 60000) => {
            return async (request: any, reply: any) => {
                // Mock rate limiting - just pass through without any limiting
                return;
            };
        },
    })),
}));

import dotenv from "dotenv";
import path from "path";

// Carregar variáveis de ambiente específicas para testes

// Mock do Redis para evitar dependência externa nos testes
jest.mock("redis", () => ({
    createClient: () => ({
        connect: jest.fn().mockResolvedValue(true),
        disconnect: jest.fn().mockResolvedValue(true),
        ping: jest.fn().mockResolvedValue("PONG"),
        get: jest.fn().mockResolvedValue(null),
        set: jest.fn().mockResolvedValue("OK"),
        del: jest.fn().mockResolvedValue(1),
        exists: jest.fn().mockResolvedValue(0),
        expire: jest.fn().mockResolvedValue(1),
        flushall: jest.fn().mockResolvedValue("OK"),
        isReady: true,
        on: jest.fn(),
        off: jest.fn(),
    }),
}));

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
        sendTemplateMessage: jest.fn().mockResolvedValue({ success: true }),
        getMessageStatus: jest.fn().mockResolvedValue({ status: "delivered" }),
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

    const mockWorkflows: any[] = [
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
                from: (table: any) => ({
                    where: () => ({
                        orderBy: () => {
                            const tableName = table?.name || table?._?.name || table?.toString?.() || "unknown";
                            if (tableName && typeof tableName === "string") {
                                if (tableName.includes("user")) return mockUsers;
                                if (tableName.includes("organization")) return mockOrganizations;
                                if (tableName.includes("workflow")) return mockWorkflows;
                            }
                            // Return workflows array for list endpoint
                            return mockWorkflows;
                        },
                        limit: () => {
                            const tableName = table?.name || table?._?.name || table?.toString?.() || "unknown";
                            if (tableName && typeof tableName === "string") {
                                if (tableName.includes("user")) return mockUsers;
                                if (tableName.includes("organization")) return mockOrganizations;
                                if (tableName.includes("workflow")) return mockWorkflows;
                            }
                            // Return workflows array for list endpoint
                            return mockWorkflows;
                        },
                    }),
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
                values: (data: any) => ({
                    returning: () => [
                        {
                            id: "test-workflow-id",
                            name: data?.name || data[0]?.name || "Test Workflow",
                            description: data?.description || data[0]?.description || "Test Description",
                            organizationId: "temp-org-id",
                            status: "draft",
                            triggers: data?.triggers || data[0]?.triggers || [],
                            actions: data?.actions || data[0]?.actions || [],
                            conditions: data?.conditions || data[0]?.conditions || [],
                            metadata: data?.metadata || data[0]?.metadata || {},
                            createdAt: new Date(),
                            updatedAt: new Date(),
                        },
                    ],
                }),
            }),
            update: () => ({
                set: (data: any) => ({
                    where: () => ({
                        returning: () => [
                            {
                                id: "test-workflow-id",
                                name: data.name || "Updated Workflow",
                                description: data.description || "Updated Description",
                                organizationId: "temp-org-id",
                                status: "draft",
                                triggers: data.triggers || [],
                                actions: data.actions || [],
                                conditions: data.conditions || [],
                                metadata: data.metadata || {},
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
            if (email === "doesnotexist@example.com" || password === "x") {
                throw new Error("Invalid credentials");
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
            if (data.user?.email === "alice@example.com" && data.organization?.name === "Existing Org") {
                throw new Error("Email already exists");
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
        verifyToken: jest.fn().mockResolvedValue({
            id: "temp-user-id",
            email: "test@example.com",
            organization_id: "temp-org-id",
        }),
        hashPassword: jest.fn().mockResolvedValue("$2b$10$rH0UJK8PO8n8W8Q8eQZr/.N8oO9K7dBQkzY7jCGKP8k9qPp2zRb2S"),
        verifyPassword: jest.fn().mockResolvedValue(true),
        refreshToken: jest.fn().mockResolvedValue({
            tokens: {
                accessToken: "new-test-jwt-token",
                refreshToken: "new-test-refresh-token",
            },
        }),
        logout: jest.fn().mockResolvedValue(undefined),
    })),
}));

// Mock do AuthMiddleware
jest.mock("../src/auth/AuthMiddleware", () => ({
    AuthMiddleware: jest.fn().mockImplementation(() => ({
        requireUser: () => (request: any, reply: any, done: any) => {
            // Mock user data in request
            request.user = {
                id: "temp-user-id",
                email: "test@example.com",
                organizationId: "temp-org-id",
            };
            done();
        },
        ipRateLimit: (maxRequests: number, windowMs: number) => (request: any, reply: any, done: any) => {
            // Mock rate limiting - always allow in tests
            done();
        },
        authenticate: () => (request: any, reply: any, done: any) => {
            // Mock authentication - always allow in tests
            request.user = {
                id: "temp-user-id",
                email: "test@example.com",
                organizationId: "temp-org-id",
            };
            done();
        },
    })),
}));

// Mock de serviços externos

// Configurações globais para testes
global.fetch = jest.fn();

// Cleanup after each test
afterEach(() => {
    jest.clearAllMocks();
});

// Configurar timeout para testes mais longos
jest.setTimeout(30000);

console.log("🧪 Test environment setup completed");
