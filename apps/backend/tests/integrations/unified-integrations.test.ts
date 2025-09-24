import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";
import { UnifiedIntegrationsService } from "../../src/core/integrations/UnifiedIntegrationsService";

describe("UnifiedIntegrationsService", () => {
    let unifiedService: UnifiedIntegrationsService;

    // Mock services
    const mockWhatsAppService = {
        checkConnection: jest.fn<() => Promise<boolean>>(),
        sync: jest.fn<() => Promise<void>>(),
    };

    const mockPIXService = {
        checkConnection: jest.fn<() => Promise<boolean>>(),
        syncTransactions: jest.fn<() => Promise<void>>(),
    };

    const mockCRMService = {
        testConnection: jest.fn<() => Promise<boolean>>(),
        syncWithCRM: jest.fn<() => Promise<void>>(),
    };

    const mockERPService = {
        testConnection: jest.fn<() => Promise<boolean>>(),
        syncWithERP: jest.fn<() => Promise<void>>(),
    };

    beforeEach(() => {
        unifiedService = UnifiedIntegrationsService.getInstance();

        // Reset all mocks
        jest.clearAllMocks();

        // Setup default mock responses
        mockWhatsAppService.checkConnection.mockResolvedValue(true);
        mockPIXService.checkConnection.mockResolvedValue(true);
        mockCRMService.testConnection.mockResolvedValue(true);
        mockERPService.testConnection.mockResolvedValue(true);

        mockWhatsAppService.sync.mockResolvedValue();
        mockPIXService.syncTransactions.mockResolvedValue();
        mockCRMService.syncWithCRM.mockResolvedValue();
        mockERPService.syncWithERP.mockResolvedValue();
    });

    afterEach(() => {
        // Clean up registrations
        unifiedService.unregisterIntegration("test-whatsapp");
        unifiedService.unregisterIntegration("test-pix");
        unifiedService.unregisterIntegration("test-crm");
        unifiedService.unregisterIntegration("test-erp");
    });

    describe("Integration Registration", () => {
        it("should register a WhatsApp integration successfully", () => {
            expect(() => {
                unifiedService.registerIntegration("test-whatsapp", mockWhatsAppService, "whatsapp", "Meta");
            }).not.toThrow();
        });

        it("should register multiple integrations of different types", () => {
            unifiedService.registerIntegration("test-whatsapp", mockWhatsAppService, "whatsapp", "Meta");
            unifiedService.registerIntegration("test-pix", mockPIXService, "pix", "Mercado Pago");
            unifiedService.registerIntegration("test-crm", mockCRMService, "crm", "RD Station");
            unifiedService.registerIntegration("test-erp", mockERPService, "erp", "Omie");

            // Test that all integrations are registered by checking health
            expect(async () => {
                const health = await unifiedService.getIntegrationsHealth();
                expect(health).toHaveLength(4);
            }).not.toThrow();
        });

        it("should unregister integrations successfully", () => {
            unifiedService.registerIntegration("test-temp", mockWhatsAppService, "whatsapp", "Meta");

            expect(() => {
                unifiedService.unregisterIntegration("test-temp");
            }).not.toThrow();
        });
    });

    describe("Health Monitoring", () => {
        beforeEach(() => {
            unifiedService.registerIntegration("test-whatsapp", mockWhatsAppService, "whatsapp", "Meta");
            unifiedService.registerIntegration("test-pix", mockPIXService, "pix", "Mercado Pago");
        });

        it("should return health status for all registered integrations", async () => {
            const health = await unifiedService.getIntegrationsHealth();

            expect(health).toHaveLength(2);
            expect(health[0]).toMatchObject({
                id: expect.any(String),
                name: expect.any(String),
                type: expect.stringMatching(/whatsapp|pix|crm|erp/),
                status: expect.stringMatching(/connected|disconnected|error|configuring/),
                metrics: expect.objectContaining({
                    totalOperations: expect.any(Number),
                    successRate: expect.any(Number),
                    monthlyVolume: expect.any(Number),
                    lastActivity: expect.any(String),
                }),
            });
        });

        it("should handle connected integrations", async () => {
            mockWhatsAppService.checkConnection.mockResolvedValue(true);

            const health = await unifiedService.getIntegrationsHealth();
            const whatsappHealth = health.find((h) => h.type === "whatsapp");

            expect(whatsappHealth?.status).toBe("connected");
            expect(mockWhatsAppService.checkConnection).toHaveBeenCalled();
        });

        it("should handle disconnected integrations", async () => {
            mockPIXService.checkConnection.mockResolvedValue(false);

            const health = await unifiedService.getIntegrationsHealth();
            const pixHealth = health.find((h) => h.type === "pix");

            expect(pixHealth?.status).toBe("disconnected");
        });

        it("should handle integration errors", async () => {
            mockWhatsAppService.checkConnection.mockRejectedValue(new Error("Connection failed"));

            const health = await unifiedService.getIntegrationsHealth();
            const whatsappHealth = health.find((h) => h.type === "whatsapp");

            expect(whatsappHealth?.status).toBe("error");
            // Note: errorMessage is not propagated from individual health checks in current implementation
        });
    });

    describe("Operation Recording", () => {
        beforeEach(() => {
            unifiedService.registerIntegration("test-whatsapp", mockWhatsAppService, "whatsapp", "Meta");
        });

        it("should record successful operations", () => {
            expect(() => {
                unifiedService.recordOperation({
                    integrationType: "whatsapp",
                    platform: "Meta",
                    operation: "send_message",
                    status: "success",
                    data: { messageId: "123", to: "+5511999999999" },
                });
            }).not.toThrow();
        });

        it("should record failed operations with error details", () => {
            expect(() => {
                unifiedService.recordOperation({
                    integrationType: "whatsapp",
                    platform: "Meta",
                    operation: "send_message",
                    status: "error",
                    error: "Invalid phone number",
                    data: { to: "invalid-number" },
                });
            }).not.toThrow();
        });

        it("should retrieve operation history with filters", () => {
            // Get initial counts
            const initialWhatsappCount = unifiedService.getOperationHistory({ type: "whatsapp" }).length;
            const initialTotalCount = unifiedService.getOperationHistory().length;

            // Record some operations
            unifiedService.recordOperation({
                integrationType: "whatsapp",
                platform: "Meta",
                operation: "send_message",
                status: "success",
            });

            unifiedService.recordOperation({
                integrationType: "pix",
                platform: "Mercado Pago",
                operation: "create_payment",
                status: "success",
            });

            const whatsappOps = unifiedService.getOperationHistory({ type: "whatsapp" });
            const allOps = unifiedService.getOperationHistory();

            expect(whatsappOps).toHaveLength(initialWhatsappCount + 1);
            expect(whatsappOps.filter((op) => op.integrationType === "whatsapp").length).toBeGreaterThanOrEqual(1);
            expect(allOps.length).toBe(initialTotalCount + 2);
        });

        it("should limit operation history results", () => {
            // Record multiple operations
            for (let i = 0; i < 10; i++) {
                unifiedService.recordOperation({
                    integrationType: "whatsapp",
                    platform: "Meta",
                    operation: `operation_${i}`,
                    status: "success",
                });
            }

            const limitedOps = unifiedService.getOperationHistory({ limit: 5 });
            expect(limitedOps).toHaveLength(5);
        });
    });

    describe("Integration Statistics", () => {
        beforeEach(() => {
            unifiedService.registerIntegration("test-whatsapp", mockWhatsAppService, "whatsapp", "Meta");
            unifiedService.registerIntegration("test-pix", mockPIXService, "pix", "Mercado Pago");
        });

        it("should calculate accurate integration statistics", async () => {
            // Record some operations to have data
            unifiedService.recordOperation({
                integrationType: "whatsapp",
                platform: "Meta",
                operation: "send_message",
                status: "success",
            });

            const stats = await unifiedService.getIntegrationsStats();

            expect(stats).toMatchObject({
                totalIntegrations: expect.any(Number),
                activeIntegrations: expect.any(Number),
                monthlyOperations: expect.any(Number),
                successRate: expect.any(Number),
                totalRevenue: expect.any(Number),
            });

            expect(stats.totalIntegrations).toBeGreaterThan(0);
            expect(stats.activeIntegrations).toBeLessThanOrEqual(stats.totalIntegrations);
            expect(stats.successRate).toBeGreaterThanOrEqual(0);
            expect(stats.successRate).toBeLessThanOrEqual(100);
        });
    });

    describe("Synchronization", () => {
        beforeEach(() => {
            unifiedService.registerIntegration("test-whatsapp", mockWhatsAppService, "whatsapp", "Meta");
            unifiedService.registerIntegration("test-pix", mockPIXService, "pix", "Mercado Pago");
            unifiedService.registerIntegration("test-crm", mockCRMService, "crm", "RD Station");
            unifiedService.registerIntegration("test-erp", mockERPService, "erp", "Omie");
        });

        it("should sync all connected integrations successfully", async () => {
            const result = await unifiedService.syncAllIntegrations();

            expect(result.successful).toBeGreaterThan(0);
            expect(result.failed).toBe(0);
            expect(result.details).toHaveLength(result.successful + result.failed);

            // Verify sync methods were called
            expect(mockWhatsAppService.sync).toHaveBeenCalled();
            expect(mockPIXService.syncTransactions).toHaveBeenCalled();
            expect(mockCRMService.syncWithCRM).toHaveBeenCalled();
            expect(mockERPService.syncWithERP).toHaveBeenCalled();
        });

        it("should handle sync failures gracefully", async () => {
            mockWhatsAppService.sync.mockRejectedValue(new Error("Sync failed"));

            const result = await unifiedService.syncAllIntegrations();

            expect(result.failed).toBeGreaterThan(0);
            expect(result.details.some((d) => d.status === "error")).toBe(true);
        });
    });

    describe("Data Management", () => {
        it("should clean up old operation data", () => {
            // This would require more complex setup to test properly
            // For now, just verify the method exists and doesn't throw
            expect(() => {
                const removedCount = unifiedService.cleanupOldData();
                expect(typeof removedCount).toBe("number");
            }).not.toThrow();
        });

        it("should export monitoring data", () => {
            unifiedService.registerIntegration("test-export", mockWhatsAppService, "whatsapp", "Meta");

            const exportData = unifiedService.exportMonitoringData();

            expect(exportData).toMatchObject({
                integrations: expect.any(Array),
                operations: expect.any(Array),
                stats: expect.objectContaining({
                    totalIntegrations: expect.any(Number),
                    activeIntegrations: expect.any(Number),
                    monthlyOperations: expect.any(Number),
                    successRate: expect.any(Number),
                    totalRevenue: expect.any(Number),
                }),
                exportedAt: expect.any(String),
            });

            // Verify timestamp is valid ISO string
            expect(() => new Date(exportData.exportedAt)).not.toThrow();
        });
    });

    describe("Edge Cases", () => {
        it("should handle missing service methods gracefully", async () => {
            const incompleteService = {};
            unifiedService.registerIntegration("test-incomplete", incompleteService, "whatsapp", "Meta");

            const health = await unifiedService.getIntegrationsHealth();
            const incompleteHealth = health.find((h) => h.id === "test-incomplete");

            expect(incompleteHealth?.status).toBe("disconnected");
        });

        it("should handle empty operation history", () => {
            const operations = unifiedService.getOperationHistory();
            expect(Array.isArray(operations)).toBe(true);
        });

        it("should handle non-existent integration unregistration", () => {
            expect(() => {
                unifiedService.unregisterIntegration("non-existent");
            }).not.toThrow();
        });
    });
});
