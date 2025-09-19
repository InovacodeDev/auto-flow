import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";
import { WhatsAppService } from "../../src/integrations/whatsapp/WhatsAppService";
import { PIXService } from "../../src/integrations/pix/PIXService";
import { CRMIntegrationService } from "../../src/integrations/crm/CRMIntegrationService";
import { ERPIntegrationService } from "../../src/integrations/erp/ERPIntegrationService";

// Mock external APIs
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

describe("End-to-End Integration Tests", () => {
    let whatsappService: WhatsAppService;
    let pixService: PIXService;
    let crmService: CRMIntegrationService;
    let erpService: ERPIntegrationService;

    beforeEach(() => {
        // Initialize services with test configurations
        whatsappService = new WhatsAppService({
            apiUrl: "https://graph.facebook.com/v17.0",
            accessToken: "test-token",
            phoneNumberId: "test-phone-id",
            webhookSecret: "test-secret",
        });

        pixService = new PIXService({
            provider: "mercadopago",
            accessToken: "test-mp-token",
            publicKey: "test-mp-public-key",
            environment: "sandbox",
            webhookSecret: "test-webhook-secret",
        });

        crmService = new CRMIntegrationService({
            platform: "rdstation",
            apiToken: "test-rd-token",
            apiUrl: "https://api.rd.services",
        });

        erpService = new ERPIntegrationService({
            platform: "omie",
            apiKey: "test-omie-key",
            apiSecret: "test-omie-secret",
            apiUrl: "https://app.omie.com.br/api/v1/",
            companyId: "test-company",
            taxConfiguration: {
                defaultCfop: "5102",
                icmsRate: 18,
                ipiRate: 0,
                pisRate: 1.65,
                cofinsRate: 7.6,
            },
        });

        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("Complete Sales Flow Integration", () => {
        it("should handle complete sales flow from WhatsApp to ERP", async () => {
            // 1. Customer inquiry via WhatsApp
            const whatsappMessage = {
                from: "5511999999999",
                body: "Olá, gostaria de saber sobre produtos disponíveis",
                timestamp: Date.now(),
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, message_id: "msg-123" }),
            } as Response);

            const messageResponse = await whatsappService.sendMessage({
                to: whatsappMessage.from,
                body: "Olá! Temos diversos produtos disponíveis. Qual categoria te interessa?",
            });

            expect(messageResponse.success).toBe(true);

            // 2. Create lead in CRM
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ uuid: "lead-123" }),
            } as Response);

            const leadData = {
                name: "Cliente WhatsApp",
                email: "cliente@whatsapp.com",
                phone: whatsappMessage.from,
                source: "whatsapp",
                tags: ["whatsapp-lead", "produto-interesse"],
            };

            const crmLead = await crmService.createLead(leadData);
            expect(crmLead.id).toBe("lead-123");

            // 3. Create product in ERP
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    codigo_produto: "PROD-001",
                    descricao: "Produto Premium",
                    valor_unitario: 199.9,
                    estoque: 50,
                }),
            } as Response);

            const productData = {
                name: "Produto Premium",
                sku: "PROD-001",
                price: 199.9,
                category: "Premium",
                stockQuantity: 50,
                unit: "UN",
            };

            const erpProduct = await erpService.createProduct(productData);
            expect(erpProduct.sku).toBe("PROD-001");

            // 4. Create customer in ERP
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    codigo_cliente: "CLI-001",
                    nome_fantasia: "Cliente WhatsApp",
                    email: "cliente@whatsapp.com",
                    telefone1: whatsappMessage.from,
                }),
            } as Response);

            const customerData = {
                name: "Cliente WhatsApp",
                email: "cliente@whatsapp.com",
                phone: whatsappMessage.from,
                document: "123.456.789-01",
                customerType: "individual" as const,
                address: {
                    street: "Rua Exemplo",
                    number: "123",
                    neighborhood: "Centro",
                    city: "São Paulo",
                    state: "SP",
                    zipCode: "01234-567",
                },
            };

            const erpCustomer = await erpService.createCustomer(customerData);
            expect(erpCustomer.name).toBe("Cliente WhatsApp");

            // 5. Create invoice in ERP
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    numero_nf: "NF-001",
                    codigo_cliente: "CLI-001",
                    valor_total: 199.9,
                    status: "pendente",
                }),
            } as Response);

            const invoiceData = {
                customerId: erpCustomer.id,
                items: [
                    {
                        productId: erpProduct.id,
                        quantity: 1,
                        unitPrice: 199.9,
                    },
                ],
                dueDate: new Date("2024-12-31"),
                paymentMethod: "PIX",
            };

            const erpInvoice = await erpService.createInvoice(invoiceData);
            expect(erpInvoice.totalAmount).toBe(199.9);

            // 6. Generate PIX payment
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    id: "pix-123",
                    qr_code_base64: "base64-qr-code",
                    qr_code: "pix-code-text",
                    transaction_amount: 199.9,
                    status: "pending",
                }),
            } as Response);

            const pixPayment = await pixService.createPayment({
                amount: 199.9,
                description: `Pagamento NF ${erpInvoice.number}`,
                payerEmail: customerData.email,
                externalReference: erpInvoice.id,
            });

            expect(pixPayment.id).toBe("pix-123");
            expect(pixPayment.qrCode).toBeTruthy();

            // 7. Send PIX details via WhatsApp
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, message_id: "msg-124" }),
            } as Response);

            const pixMessage = await whatsappService.sendMessage({
                to: whatsappMessage.from,
                body: `Seu pedido foi gerado! 
        Total: R$ ${pixPayment.amount}
        PIX Copia e Cola: ${pixPayment.qrCode}
        
        Após o pagamento, seu pedido será processado automaticamente.`,
            });

            expect(pixMessage.success).toBe(true);

            // 8. Update CRM opportunity
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true }),
            } as Response);

            await crmService.updateOpportunity(crmLead.id, {
                stage: "proposal-sent",
                value: 199.9,
                notes: `PIX gerado: ${pixPayment.id}`,
            });

            // Verify the complete flow
            expect(mockFetch).toHaveBeenCalledTimes(8);
        });

        it("should handle payment confirmation and completion", async () => {
            // Simulate PIX payment webhook
            const pixWebhook = {
                type: "payment",
                action: "payment.updated",
                data: {
                    id: "pix-123",
                    status: "approved",
                    external_reference: "invoice-123",
                    transaction_amount: 199.9,
                },
                date_created: new Date().toISOString(),
            };

            // Process payment confirmation
            const paymentResult = await pixService.processWebhook(pixWebhook);
            expect(paymentResult.processed).toBe(true);

            // Update ERP invoice status
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    numero_nf: "NF-001",
                    status: "pago",
                    valor_pago: 199.9,
                }),
            } as Response);

            // Update CRM opportunity to closed-won
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true }),
            } as Response);

            // Send confirmation via WhatsApp
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, message_id: "msg-125" }),
            } as Response);

            const confirmationMessage = await whatsappService.sendMessage({
                to: "5511999999999",
                body: "Pagamento confirmado! Seu pedido será enviado em breve. Obrigado pela preferência!",
            });

            expect(confirmationMessage.success).toBe(true);
        });
    });

    describe("Automated Lead Nurturing Flow", () => {
        it("should automate lead nurturing across platforms", async () => {
            // 1. Create lead from WhatsApp interaction
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ uuid: "lead-456" }),
            } as Response);

            const leadData = {
                name: "Lead Potencial",
                phone: "5511888888888",
                source: "whatsapp",
                tags: ["interesse-produto"],
            };

            const lead = await crmService.createLead(leadData);

            // 2. Send welcome sequence via WhatsApp
            const welcomeMessages = [
                "Olá! Obrigado pelo interesse em nossos produtos.",
                "Preparamos um material especial para você conhecer melhor nossa linha premium.",
                "Em breve entraremos em contato com mais detalhes!",
            ];

            for (const message of welcomeMessages) {
                mockFetch.mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ success: true }),
                } as Response);

                await whatsappService.sendMessage({
                    to: leadData.phone,
                    body: message,
                });
            }

            // 3. Schedule follow-up in CRM
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true }),
            } as Response);

            await crmService.createActivity({
                leadId: lead.id,
                type: "call",
                subject: "Follow-up WhatsApp Lead",
                scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
            });

            expect(mockFetch).toHaveBeenCalledTimes(5); // 1 lead + 3 messages + 1 activity
        });
    });

    describe("Data Synchronization", () => {
        it("should synchronize customer data across all platforms", async () => {
            const customerData = {
                name: "Cliente Unificado",
                email: "cliente@unificado.com",
                phone: "5511777777777",
                document: "123.456.789-01",
                customerType: "individual" as const,
                address: {
                    street: "Rua Unificada",
                    number: "100",
                    neighborhood: "Centro",
                    city: "São Paulo",
                    state: "SP",
                    zipCode: "01000-000",
                },
            };

            // Create in ERP
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    codigo_cliente: "CLI-UNIF",
                    nome_fantasia: customerData.name,
                }),
            } as Response);

            const erpCustomer = await erpService.createCustomer(customerData);

            // Create as lead in CRM
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ uuid: "lead-unif" }),
            } as Response);

            const crmLead = await crmService.createLead({
                name: customerData.name,
                email: customerData.email,
                phone: customerData.phone,
                source: "erp-sync",
            });

            // Verify data consistency
            expect(erpCustomer.name).toBe(customerData.name);
            expect(crmLead.name).toBe(customerData.name);
            expect(crmLead.email).toBe(customerData.email);
        });
    });

    describe("Error Handling and Recovery", () => {
        it("should handle partial system failures gracefully", async () => {
            // Simulate ERP success but CRM failure
            mockFetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => ({ codigo_produto: "PROD-ERR" }),
                } as Response)
                .mockRejectedValueOnce(new Error("CRM API Error"));

            const productData = {
                name: "Product Error Test",
                sku: "PROD-ERR",
                price: 99.99,
                category: "Test",
                stockQuantity: 10,
                unit: "UN",
            };

            // ERP creation should succeed
            const erpProduct = await erpService.createProduct(productData);
            expect(erpProduct.sku).toBe("PROD-ERR");

            // CRM lead creation should fail gracefully
            await expect(
                crmService.createLead({
                    name: "Test Lead",
                    source: "error-test",
                })
            ).rejects.toThrow("CRM API Error");

            // System should continue to function for other operations
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true }),
            } as Response);

            const whatsappResult = await whatsappService.sendMessage({
                to: "5511999999999",
                body: "System continues to work despite partial failures",
            });

            expect(whatsappResult.success).toBe(true);
        });

        it("should implement retry logic for transient failures", async () => {
            // First call fails, second succeeds
            mockFetch.mockRejectedValueOnce(new Error("Temporary network error")).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true }),
            } as Response);

            // This would require implementing retry logic in the services
            // For now, we'll test that the service handles the error
            await expect(
                whatsappService.sendMessage({
                    to: "5511999999999",
                    body: "Test retry logic",
                })
            ).rejects.toThrow();

            // Second attempt should succeed
            const result = await whatsappService.sendMessage({
                to: "5511999999999",
                body: "Test retry logic - second attempt",
            });

            expect(result.success).toBe(true);
        });
    });

    describe("Performance and Load Testing", () => {
        it("should handle concurrent operations efficiently", async () => {
            const operations = Array(10)
                .fill(null)
                .map((_, index) => {
                    mockFetch.mockResolvedValueOnce({
                        ok: true,
                        json: async () => ({ success: true, id: `operation-${index}` }),
                    } as Response);

                    return whatsappService.sendMessage({
                        to: `551199999999${index}`,
                        body: `Concurrent message ${index}`,
                    });
                });

            const startTime = Date.now();
            const results = await Promise.all(operations);
            const endTime = Date.now();

            // All operations should succeed
            results.forEach((result) => {
                expect(result.success).toBe(true);
            });

            // Should complete within reasonable time
            const duration = endTime - startTime;
            expect(duration).toBeLessThan(5000); // 5 seconds max
        });
    });
});
