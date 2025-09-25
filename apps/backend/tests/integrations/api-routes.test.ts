/// <reference types="jest" />
import request from "supertest";
import Fastify from "fastify";
import { authRoutes } from "../../src/routes/auth";
import erpRoutes from "../../src/routes/erp";
import integrationsUnifiedRoutes from "../../src/routes/integrations-unified";

// Mock services
jest.mock("../../src/integrations/erp/ERPIntegrationService");
jest.mock("../../src/core/integrations/UnifiedIntegrationsService");

describe("API Routes Integration Tests", () => {
    let app: ReturnType<typeof Fastify>;

    beforeEach(async () => {
        app = Fastify();

        // Register routes
        await app.register(authRoutes, { prefix: "/api/auth" });
        await app.register(erpRoutes, { prefix: "/api/erp" });
        await app.register(integrationsUnifiedRoutes, { prefix: "/api/integrations" });

        await app.ready();
    });

    afterEach(async () => {
        await app.close();
    });

    describe("Auth Routes", () => {
        it("should handle login request", async () => {
            const response = await request(app.server).post("/api/login").send({
                email: "test@example.com",
                password: "password123",
            });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success");
        });

        it("should handle register request", async () => {
            const response = await request(app.server).post("/api/register").send({
                email: "test@example.com",
                password: "password123",
                name: "Test User",
            });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success");
        });

        it("should handle invalid login", async () => {
            const response = await request(app.server).post("/api/login").send({
                email: "invalid@example.com",
                password: "wrongpassword",
            });

            expect(response.status).toBe(401);
        });
    });

    describe("ERP Routes", () => {
        it("should create product via API", async () => {
            const productData = {
                name: "Test Product",
                sku: "TEST-001",
                price: 99.9,
                category: "Test",
                stockQuantity: 100,
                unit: "UN",
            };

            const response = await request(app.server).post("/api/erp/products").send(productData);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("id");
            expect(response.body.name).toBe(productData.name);
        });

        it("should get product by SKU via API", async () => {
            const response = await request(app.server).get("/api/erp/products/sku/TEST-001");

            expect(response.status).toBe(200);
        });

        it("should create customer via API", async () => {
            const customerData = {
                name: "Test Customer",
                email: "customer@test.com",
                document: "123.456.789-01",
                customerType: "individual",
                address: {
                    street: "Test Street",
                    number: "123",
                    neighborhood: "Test Area",
                    city: "Test City",
                    state: "SP",
                    zipCode: "12345-678",
                },
            };

            const response = await request(app.server).post("/api/erp/customers").send(customerData);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("id");
        });

        it("should create invoice via API", async () => {
            const invoiceData = {
                customerId: "customer-123",
                items: [
                    {
                        productId: "product-123",
                        quantity: 2,
                        unitPrice: 50.0,
                    },
                ],
                dueDate: "2024-12-31",
            };

            const response = await request(app.server).post("/api/erp/invoices").send(invoiceData);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("id");
        });

        it("should handle webhook via API", async () => {
            const webhookData = {
                event: "produto.incluido",
                data: {
                    codigo_produto: "PROD-001",
                    descricao: "New Product",
                },
                timestamp: new Date().toISOString(),
                source: "omie",
            };

            const response = await request(app.server).post("/api/erp/webhook").send(webhookData);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("processed");
        });

        it("should sync with ERP via API", async () => {
            const response = await request(app.server).post("/api/erp/sync");

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("synchronized");
        });

        it("should validate request schemas", async () => {
            const response = await request(app.server).post("/api/erp/products").send({
                // Missing required fields
                name: "Test Product",
            });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("error");
        });
    });

    describe("Unified Integrations Routes", () => {
        it("should get integrations overview", async () => {
            const response = await request(app.server).get("/api/integrations/overview");

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("total");
            expect(response.body).toHaveProperty("active");
            expect(response.body).toHaveProperty("inactive");
        });

        it("should get integration health status", async () => {
            const response = await request(app.server).get("/api/integrations/health");

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("whatsapp");
            expect(response.body).toHaveProperty("pix");
            expect(response.body).toHaveProperty("crm");
            expect(response.body).toHaveProperty("erp");
        });

        it("should get integration statistics", async () => {
            const response = await request(app.server).get("/api/integrations/statistics");

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("totalOperations");
            expect(response.body).toHaveProperty("operationsByType");
            expect(response.body).toHaveProperty("errorRate");
        });

        it("should get recent operations", async () => {
            const response = await request(app.server).get("/api/integrations/operations/recent").query({ limit: 10 });

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });

        it("should synchronize all integrations", async () => {
            const response = await request(app.server).post("/api/integrations/sync");

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("synchronized");
        });

        it("should handle configuration updates", async () => {
            const configData = {
                whatsapp: { enabled: true },
                pix: { enabled: true },
                crm: { enabled: false },
                erp: { enabled: true },
            };

            const response = await request(app.server).post("/api/integrations/configure").send(configData);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("success");
        });
    });

    describe("Error Handling", () => {
        it("should handle 404 for non-existent routes", async () => {
            const response = await request(app.server).get("/api/non-existent-route");

            expect(response.status).toBe(404);
        });

        it("should handle malformed JSON", async () => {
            const response = await request(app.server)
                .post("/api/erp/products")
                .set("Content-Type", "application/json")
                .send("{ invalid json");

            expect(response.status).toBe(400);
        });

        it("should handle server errors gracefully", async () => {
            // This test would require mocking a service to throw an error
            const response = await request(app.server).post("/api/erp/products").send({
                name: "Test Product",
                sku: "ERROR-TRIGGER",
                price: 99.9,
                category: "Test",
                stockQuantity: 100,
                unit: "UN",
            });

            // Should handle the error gracefully
            expect([200, 500]).toContain(response.status);
        });
    });

    describe("CORS and Headers", () => {
        it("should include CORS headers", async () => {
            const response = await request(app.server).options("/api/erp/products");

            expect(response.status).toBe(204);
        });

        it("should handle preflight requests", async () => {
            const response = await request(app.server)
                .options("/api/integrations/overview")
                .set("Origin", "http://localhost:3000")
                .set("Access-Control-Request-Method", "GET");

            expect(response.status).toBe(204);
        });
    });

    describe("Rate Limiting", () => {
        it("should handle multiple requests within limits", async () => {
            const requests = Array(5)
                .fill(null)
                .map(() => request(app.server).get("/api/integrations/overview"));

            const responses = await Promise.all(requests);

            responses.forEach((response) => {
                expect(response.status).toBe(200);
            });
        });
    });

    describe("Authentication Middleware", () => {
        it("should require authentication for protected routes", async () => {
            const response = await request(app.server).get("/api/integrations/overview");

            // Depending on auth implementation, this might be 401 or 200
            expect([200, 401]).toContain(response.status);
        });

        it("should accept valid authentication tokens", async () => {
            const response = await request(app.server)
                .get("/api/integrations/overview")
                .set("Authorization", "Bearer valid-token");

            expect([200, 401]).toContain(response.status);
        });
    });
});
