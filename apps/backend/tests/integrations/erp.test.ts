import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";
import { ERPIntegrationService } from "../../src/integrations/erp/ERPIntegrationService";

// Mock fetch
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

// Helper to create a Response-like mock compatible with fetch usage in service
function makeMockResponse({ ok = true, status = 200, statusText = 'OK', jsonBody = null, textBody = '' } : { ok?: boolean; status?: number; statusText?: string; jsonBody?: any; textBody?: string }) {
    return {
        ok,
        status,
        statusText,
        json: async () => jsonBody,
        text: async () => (textBody ?? (jsonBody ? JSON.stringify(jsonBody) : '')),
    } as unknown as Response;
}

describe("ERPIntegrationService", () => {
    let erpService: ERPIntegrationService;

    beforeEach(() => {
        const config = {
            platform: "omie" as const,
            apiKey: "test-api-key",
            apiSecret: "test-api-secret",
            apiUrl: "https://app.omie.com.br/api/v1/",
            companyId: "test-company",
            taxConfiguration: {
                defaultCfop: "5102",
                icmsRate: 18,
                ipiRate: 0,
                pisRate: 1.65,
                cofinsRate: 7.6,
            },
        };

        erpService = new ERPIntegrationService(config);
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("Product Management", () => {
        it("should create a product successfully", async () => {
            const mockResponse = {
                codigo_produto: "PROD-001",
                descricao: "Produto Teste",
                valor_unitario: 99.9,
                estoque: 100,
            };

            mockFetch.mockResolvedValueOnce(makeMockResponse({ ok: true, jsonBody: mockResponse }));

            const productData = {
                name: "Produto Teste",
                sku: "PROD-001",
                price: 99.9,
                cost: 50.0,
                category: "Eletrônicos",
                stockQuantity: 100,
                unit: "UN",
                ncm: "85171100",
                cfop: "5102",
                icmsRate: 18,
            };

            const result = await erpService.createProduct(productData);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining("produtos"),
                expect.objectContaining({
                    method: "POST",
                    headers: expect.objectContaining({
                        "Content-Type": "application/json",
                    }),
                    body: expect.any(String),
                })
            );

            expect(result).toMatchObject({
                id: expect.any(String),
                name: productData.name,
                sku: productData.sku,
                price: productData.price,
                stockQuantity: productData.stockQuantity,
            });
        });

        it("should find product by SKU", async () => {
            const mockResponse = {
                codigo_produto: "PROD-001",
                descricao: "Produto Teste",
                valor_unitario: 99.9,
                estoque: 100,
            };

            mockFetch.mockResolvedValueOnce(makeMockResponse({ ok: true, jsonBody: { produtos: [mockResponse] } }));

            const result = await erpService.findProductBySKU("PROD-001");

            expect(result).toMatchObject({
                id: expect.any(String),
                name: "Produto Teste",
                sku: "PROD-001",
                price: 99.9,
                stockQuantity: 100,
            });
        });

        it("should return null for non-existent product", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse({ ok: true, jsonBody: { produtos: [] } }));

            const result = await erpService.findProductBySKU("NON-EXISTENT");

            expect(result).toBeNull();
        });

        it("should update stock successfully", async () => {
            const mockResponse = {
                movimento_id: "MOV-123",
                produto_id: "PROD-001",
                tipo: "entrada",
                quantidade: 10,
            };

            mockFetch.mockResolvedValueOnce(makeMockResponse({ ok: true, jsonBody: mockResponse }));

            const result = await erpService.updateStock("PROD-001", 10, "add");

            expect(result).toMatchObject({
                id: expect.any(String),
                productId: "PROD-001",
                type: "entrada",
                quantity: 10,
                reason: "Ajuste manual",
            });
        });
    });

    describe("Customer Management", () => {
        it("should create customer successfully", async () => {
            const mockResponse = {
                codigo_cliente: "CLI-001",
                nome_fantasia: "João Silva",
                email: "joao@email.com",
                telefone1: "11999999999",
                cnpj_cpf: "12345678901",
            };

            mockFetch.mockResolvedValueOnce(makeMockResponse({ ok: true, jsonBody: mockResponse }));

            const customerData = {
                name: "João Silva",
                email: "joao@email.com",
                phone: "(11) 99999-9999",
                document: "123.456.789-01",
                address: {
                    street: "Rua das Flores",
                    number: "123",
                    neighborhood: "Centro",
                    city: "São Paulo",
                    state: "SP",
                    zipCode: "01234-567",
                },
                customerType: "individual" as const,
            };

            const result = await erpService.createCustomer(customerData);

            expect(result).toMatchObject({
                id: expect.any(String),
                name: customerData.name,
                email: customerData.email,
                document: expect.any(String),
                customerType: "individual",
            });
        });

        it("should handle customer creation errors", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse({ ok: false, status: 400, statusText: 'Bad Request', jsonBody: { error: 'Invalid data' } }));

            const customerData = {
                name: "João Silva",
                document: "123.456.789-01",
                address: {
                    street: "Rua das Flores",
                    number: "123",
                    neighborhood: "Centro",
                    city: "São Paulo",
                    state: "SP",
                    zipCode: "01234-567",
                },
                customerType: "individual" as const,
            };

            await expect(erpService.createCustomer(customerData)).rejects.toThrow();
        });
    });

    describe("Invoice Management", () => {
        it("should create invoice successfully", async () => {
            const mockResponse = {
                numero_nf: "NF-001",
                codigo_cliente: "CLI-001",
                valor_total: 199.8,
                status: "pendente",
            };

            mockFetch.mockResolvedValueOnce(makeMockResponse({ ok: true, jsonBody: mockResponse }));

            const invoiceData = {
                customerId: "CLI-001",
                items: [
                    {
                        productId: "PROD-001",
                        quantity: 2,
                        unitPrice: 99.9,
                    },
                ],
                dueDate: new Date("2024-12-31"),
                paymentMethod: "PIX",
                observations: "Teste de fatura",
            };

            const result = await erpService.createInvoice(invoiceData);

            expect(result).toMatchObject({
                id: expect.any(String),
                number: "NF-001",
                customerId: "CLI-001",
                totalAmount: 199.8,
                status: "pendente",
            });
        });

        it("should calculate invoice totals with taxes", async () => {
            const mockResponse = {
                numero_nf: "NF-001",
                codigo_cliente: "CLI-001",
                valor_total: 236.76, // With taxes
                status: "pendente",
            };

            mockFetch.mockResolvedValueOnce(makeMockResponse({ ok: true, jsonBody: mockResponse }));

            const invoiceData = {
                customerId: "CLI-001",
                items: [
                    {
                        productId: "PROD-001",
                        quantity: 2,
                        unitPrice: 100.0,
                    },
                ],
                dueDate: new Date("2024-12-31"),
            };

            const result = await erpService.createInvoice(invoiceData);

            // Should include Brazilian taxes (ICMS 18%, PIS 1.65%, COFINS 7.6%)
            expect(result.totalAmount).toBeGreaterThan(200); // Base amount + taxes
        });
    });

    describe("Bank Reconciliation", () => {
        it("should process bank reconciliation successfully", async () => {
            const mockResponse = {
                matched: true,
                lancamento_id: "LANC-001",
                numero_nf: "NF-001",
            };

            mockFetch.mockResolvedValueOnce(makeMockResponse({ ok: true, jsonBody: mockResponse }));

            const reconciliationData = {
                date: new Date("2024-01-15"),
                amount: 199.8,
                description: "PIX recebido",
                reference: "PIX-123456",
            };

            const result = await erpService.processBankReconciliation(reconciliationData);

            expect(result).toMatchObject({
                matched: true,
                entryId: "LANC-001",
                invoiceId: "NF-001",
            });
        });

        it("should handle unmatched transactions", async () => {
            const mockResponse = {
                matched: false,
                lancamento_id: "LANC-002",
            };

            mockFetch.mockResolvedValueOnce(makeMockResponse({ ok: true, jsonBody: mockResponse }));

            const reconciliationData = {
                date: new Date("2024-01-15"),
                amount: 50.0,
                description: "Transferência bancária",
            };

            const result = await erpService.processBankReconciliation(reconciliationData);

            expect(result.matched).toBe(false);
            expect(result.entryId).toBe("LANC-002");
        });
    });

    describe("Webhook Processing", () => {
        it("should process webhook successfully", async () => {
            const webhookData = {
                event: "produto.incluido",
                data: {
                    codigo_produto: "PROD-002",
                    descricao: "Novo Produto",
                },
                timestamp: new Date().toISOString(),
                source: "omie" as const,
            };

            const result = await erpService.processWebhook(webhookData);

            expect(result).toMatchObject({
                processed: true,
                event: "produto.incluido",
                action: expect.any(String),
            });
        });

        it("should handle unknown webhook events", async () => {
            const webhookData = {
                event: "unknown.event",
                data: {},
                timestamp: new Date().toISOString(),
                source: "omie" as const,
            };

            const result = await erpService.processWebhook(webhookData);

            expect(result.processed).toBe(false);
        });
    });

    describe("Synchronization", () => {
        it("should sync with ERP successfully", async () => {
            // Mock multiple API responses for different entities
            mockFetch
                .mockResolvedValueOnce(makeMockResponse({ ok: true, jsonBody: { produtos: [] } }))
                .mockResolvedValueOnce(makeMockResponse({ ok: true, jsonBody: { clientes: [] } }))
                .mockResolvedValueOnce(makeMockResponse({ ok: true, jsonBody: { notas_fiscais: [] } }))
                .mockResolvedValueOnce(makeMockResponse({ ok: true, jsonBody: { lancamentos: [] } }));

            const result = await erpService.syncWithERP();

            expect(result).toMatchObject({
                synchronized: expect.any(Number),
                errors: 0,
                details: expect.objectContaining({
                    products: expect.any(Number),
                    customers: expect.any(Number),
                    invoices: expect.any(Number),
                    financialEntries: expect.any(Number),
                }),
            });
        });

        it("should handle sync errors gracefully", async () => {
            mockFetch.mockRejectedValueOnce(new Error("API Error"));

            const result = await erpService.syncWithERP();

            expect(result.errors).toBeGreaterThan(0);
        });
    });

    describe("Error Handling", () => {
        it("should handle API errors properly", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse({ ok: false, status: 400, statusText: 'Bad Request', jsonBody: { error: 'Invalid data' } }));

            await expect(
                erpService.createProduct({
                    name: "Test Product",
                    sku: "TEST-001",
                    price: 99.9,
                    category: "Test",
                    stockQuantity: 10,
                    unit: "UN",
                })
            ).rejects.toThrow();
        });

        it("should handle network errors", async () => {
            mockFetch.mockRejectedValueOnce(new Error("Network error"));

            await expect(
                erpService.createProduct({
                    name: "Test Product",
                    sku: "TEST-001",
                    price: 99.9,
                    category: "Test",
                    stockQuantity: 10,
                    unit: "UN",
                })
            ).rejects.toThrow("Network error");
        });
    });

    describe("Platform-Specific Tests", () => {
        describe("Omie Integration", () => {
            it("should use correct Omie API endpoints", async () => {
                mockFetch.mockResolvedValueOnce(makeMockResponse({ ok: true, jsonBody: { codigo_produto: 'PROD-001' } }));

                await erpService.createProduct({
                    name: "Test Product",
                    sku: "TEST-001",
                    price: 99.9,
                    category: "Test",
                    stockQuantity: 10,
                    unit: "UN",
                });

                expect(mockFetch).toHaveBeenCalledWith(
                    expect.stringContaining("omie.com.br/api/v1/"),
                    expect.any(Object)
                );
            });
        });

        describe("ContaAzul Integration", () => {
            beforeEach(() => {
                const config = {
                    platform: "contaazul" as const,
                    apiKey: "test-api-key",
                    apiUrl: "https://api.contaazul.com/v1/",
                };

                erpService = new ERPIntegrationService(config);
            });

            it("should use correct ContaAzul API format", async () => {
                mockFetch.mockResolvedValueOnce(makeMockResponse({ ok: true, jsonBody: { id: 'PROD-001' } }));

                await erpService.createProduct({
                    name: "Test Product",
                    sku: "TEST-001",
                    price: 99.9,
                    category: "Test",
                    stockQuantity: 10,
                    unit: "UN",
                });

                expect(mockFetch).toHaveBeenCalledWith(
                    expect.stringContaining("contaazul.com"),
                    expect.objectContaining({
                        headers: expect.objectContaining({
                            Authorization: expect.stringContaining("test-api-key"),
                        }),
                    })
                );
            });
        });

        describe("Bling Integration", () => {
            beforeEach(() => {
                const config = {
                    platform: "bling" as const,
                    apiKey: "test-api-key",
                    apiUrl: "https://bling.com.br/Api/v2/",
                };

                erpService = new ERPIntegrationService(config);
            });

            it("should use correct Bling API format", async () => {
                mockFetch.mockResolvedValueOnce(makeMockResponse({ ok: true, jsonBody: { retorno: { produtos: [{ produto: { id: 'PROD-001' } }] } } }));

                await erpService.createProduct({
                    name: "Test Product",
                    sku: "TEST-001",
                    price: 99.9,
                    category: "Test",
                    stockQuantity: 10,
                    unit: "UN",
                });

                expect(mockFetch).toHaveBeenCalledWith(
                    expect.stringContaining("bling.com.br/Api/v2/"),
                    expect.any(Object)
                );
            });
        });
    });

    describe("Health Check", () => {
        it("should check ERP service connectivity", async () => {
            mockFetch.mockResolvedValueOnce(makeMockResponse({ ok: true, jsonBody: { status: 'ok' } }));

            // Test basic connectivity by calling a simple API endpoint
            await erpService.findProductBySKU("test-connectivity");

            expect(mockFetch).toHaveBeenCalled();
        });

        it("should handle API connectivity issues", async () => {
            mockFetch.mockRejectedValueOnce(new Error("Connection failed"));

            await expect(erpService.findProductBySKU("test-connectivity")).rejects.toThrow();
        });
    });
});
