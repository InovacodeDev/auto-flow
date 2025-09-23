import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

// Mock user data
export const mockUser = {
    id: "user_1",
    name: "João Silva",
    email: "joao@example.com",
    organizationId: "org_1",
    industry: "technology",
    role: "admin",
    avatar: "https://example.com/avatar.jpg",
};

// Mock organization data
export const mockOrganization = {
    id: "org_1",
    name: "AutoFlow Corp",
    industry: "technology",
    plan: "premium",
    createdAt: "2024-01-01T00:00:00Z",
};

// Mock workflow data
export const mockWorkflow = {
    id: "workflow_1",
    name: "Test Workflow",
    description: "A test workflow",
    nodes: [
        {
            id: "node_1",
            type: "manualTrigger",
            position: { x: 100, y: 100 },
            data: { label: "Start" },
        },
        {
            id: "node_2",
            type: "httpRequestAction",
            position: { x: 300, y: 100 },
            data: { label: "HTTP Request" },
        },
    ],
    edges: [
        {
            id: "edge_1",
            source: "node_1",
            target: "node_2",
        },
    ],
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
};

// Mock integration data
export const mockIntegration = {
    id: "integration_1",
    name: "WhatsApp Business",
    type: "whatsapp",
    status: "connected",
    platform: "Meta",
    lastSync: "2024-01-15T10:30:00Z",
    metrics: {
        totalOperations: 100,
        successRate: 95.5,
        monthlyVolume: 50,
        lastActivity: "2024-01-15T10:30:00Z",
    },
    configuration: {
        isConfigured: true,
        requiredFields: ["accessToken", "phoneNumberId"],
        optionalFields: ["webhookSecret"],
    },
};

// Mock chat message data
export const mockChatMessage = {
    id: "msg_1",
    role: "assistant" as const,
    content: "Olá! Como posso ajudá-lo hoje?",
    timestamp: "2024-01-15T10:30:00Z",
    metadata: {
        workflowGenerated: false,
        confidence: 0.95,
        suggestions: ["Criar workflow", "Integrar com PIX"],
        nextSteps: ["Configure as integrações"],
    },
};

// Mock conversation data
export const mockConversation = {
    sessionId: "conv_1",
    userId: "user_1",
    organizationId: "org_1",
    industry: "technology",
    messages: [mockChatMessage],
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
};

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
    queryClient?: QueryClient;
    initialEntries?: string[];
}

export function renderWithProviders(
    ui: React.ReactElement,
    {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        }),
        initialEntries = ["/"],
        ...renderOptions
    }: CustomRenderOptions = {}
) {
    function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <BrowserRouter>
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            </BrowserRouter>
        );
    }

    return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Mock API responses
export const mockApiResponses = {
    auth: {
        login: {
            user: mockUser,
            accessToken: "mock_access_token",
            refreshToken: "mock_refresh_token",
        },
        register: {
            user: mockUser,
            accessToken: "mock_access_token",
            refreshToken: "mock_refresh_token",
        },
        me: mockUser,
    },
    workflows: {
        list: [mockWorkflow],
        detail: mockWorkflow,
        create: mockWorkflow,
        update: mockWorkflow,
    },
    integrations: {
        health: [mockIntegration],
        stats: {
            totalIntegrations: 5,
            activeIntegrations: 4,
            monthlyOperations: 1000,
            successRate: 95.5,
            totalRevenue: 2500.5,
        },
        overview: {
            summary: {
                totalIntegrations: 5,
                activeIntegrations: 4,
                errorIntegrations: 1,
                configuringIntegrations: 0,
            },
            metrics: {
                monthlyOperations: 1000,
                successRate: 95.5,
                totalRevenue: 2500.5,
                avgResponseTime: 150,
            },
            byType: {
                whatsapp: 2,
                pix: 1,
                crm: 1,
                erp: 1,
            },
            alerts: [],
        },
    },
    ai: {
        startConversation: {
            sessionId: "conv_1",
            message: "Olá! Como posso ajudá-lo hoje?",
            suggestions: ["Criar workflow", "Integrar com PIX"],
        },
        processMessage: {
            id: "msg_1",
            role: "assistant",
            content: "Entendi sua solicitação!",
            timestamp: "2024-01-15T10:30:00Z",
            metadata: {
                workflowGenerated: false,
                confidence: 0.95,
                suggestions: ["Configurar integração"],
                nextSteps: ["Testar workflow"],
            },
        },
        health: {
            status: "healthy",
            aiService: "operational",
            openaiConfigured: true,
        },
    },
};

// Mock functions
export const mockFunctions = {
    login: vi.fn().mockResolvedValue(mockApiResponses.auth.login),
    register: vi.fn().mockResolvedValue(mockApiResponses.auth.register),
    logout: vi.fn().mockResolvedValue({}),
    refreshToken: vi.fn().mockResolvedValue({
        accessToken: "new_access_token",
        refreshToken: "new_refresh_token",
    }),
    getMe: vi.fn().mockResolvedValue(mockApiResponses.auth.me),
    getWorkflows: vi.fn().mockResolvedValue(mockApiResponses.workflows.list),
    getWorkflow: vi.fn().mockResolvedValue(mockApiResponses.workflows.detail),
    createWorkflow: vi.fn().mockResolvedValue(mockApiResponses.workflows.create),
    updateWorkflow: vi.fn().mockResolvedValue(mockApiResponses.workflows.update),
    deleteWorkflow: vi.fn().mockResolvedValue({}),
    getIntegrationsHealth: vi.fn().mockResolvedValue(mockApiResponses.integrations.health),
    getIntegrationsStats: vi.fn().mockResolvedValue(mockApiResponses.integrations.stats),
    getIntegrationsOverview: vi.fn().mockResolvedValue(mockApiResponses.integrations.overview),
    startConversation: vi.fn().mockResolvedValue(mockApiResponses.ai.startConversation),
    processMessage: vi.fn().mockResolvedValue(mockApiResponses.ai.processMessage),
    getAIHealth: vi.fn().mockResolvedValue(mockApiResponses.ai.health),
};

// Test helpers
export const testHelpers = {
    // Wait for async operations
    waitFor: async (ms: number = 100) => {
        await new Promise((resolve) => setTimeout(resolve, ms));
    },

    // Mock localStorage
    mockLocalStorage: () => {
        const store: Record<string, string> = {};
        return {
            getItem: vi.fn((key: string) => store[key] || null),
            setItem: vi.fn((key: string, value: string) => {
                store[key] = value;
            }),
            removeItem: vi.fn((key: string) => {
                delete store[key];
            }),
            clear: vi.fn(() => {
                Object.keys(store).forEach((key) => delete store[key]);
            }),
        };
    },

    // Mock sessionStorage
    mockSessionStorage: () => {
        const store: Record<string, string> = {};
        return {
            getItem: vi.fn((key: string) => store[key] || null),
            setItem: vi.fn((key: string, value: string) => {
                store[key] = value;
            }),
            removeItem: vi.fn((key: string) => {
                delete store[key];
            }),
            clear: vi.fn(() => {
                Object.keys(store).forEach((key) => delete store[key]);
            }),
        };
    },

    // Create mock query client
    createMockQueryClient: () => {
        return new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        });
    },

    // Mock router
    mockRouter: () => ({
        navigate: vi.fn(),
        location: { pathname: "/" },
        search: {},
        params: {},
    }),
};

// Re-export testing utilities
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
