/// <reference types="jest" />
import { PIXIntegration } from "../../src/integrations/pix/PIXIntegration";
import { PIXConfig } from "../../src/core/types";

// Mock the base Integration class
jest.mock("../../src/core/integrations/base");

describe("PIXIntegration", () => {
    let pixIntegration: PIXIntegration;
    let mockConfig: PIXConfig;

    beforeEach(() => {
        mockConfig = {
            accessToken: "TEST-1234567890",
            userId: "123456789",
            webhookUrl: "https://example.com/webhook",
        };

        pixIntegration = new PIXIntegration(mockConfig, "test-org");
    });

    describe("constructor", () => {
        it("should create instance with correct configuration", () => {
            expect(pixIntegration).toBeInstanceOf(PIXIntegration);
        });
    });

    describe("getAvailableActions", () => {
        it("should return correct available actions", () => {
            const actions = pixIntegration.getAvailableActions();
            expect(actions).toContain("create_pix_payment");
            expect(actions).toContain("check_payment_status");
            expect(actions).toContain("refund_payment");
        });
    });

    describe("validateConfig", () => {
        it("should validate required fields", async () => {
            const mockValidateRequiredFields = jest.fn().mockReturnValue({ isValid: true });
            (pixIntegration as any).validateRequiredFields = mockValidateRequiredFields;

            jest.spyOn(pixIntegration, "testConnection").mockResolvedValue(true);

            const result = await pixIntegration.validateConfig();

            expect(mockValidateRequiredFields).toHaveBeenCalledWith(mockConfig, ["accessToken", "userId"]);
            expect(result.isValid).toBe(true);
        });
    });

    describe("execute", () => {
        it("should handle create_pix_payment action", async () => {
            const mockCreatePixPayment = jest.fn().mockResolvedValue({
                success: true,
                data: {
                    paymentId: "payment-123",
                    qrCode: "pix-qr-code",
                    status: "pending",
                },
            });
            (pixIntegration as any).createPixPayment = mockCreatePixPayment;

            const action = {
                type: "create_pix_payment",
                config: {},
                payload: {
                    amount: 100.5,
                    description: "Test payment",
                    externalReference: "order-123",
                },
            };

            await pixIntegration.execute(action);

            expect(mockCreatePixPayment).toHaveBeenCalledWith(100.5, "Test payment", "order-123");
        });

        it("should handle check_payment_status action", async () => {
            const mockCheckPaymentStatus = jest.fn().mockResolvedValue({
                success: true,
                data: {
                    paymentId: "payment-123",
                    status: "approved",
                },
            });
            (pixIntegration as any).checkPaymentStatus = mockCheckPaymentStatus;

            const action = {
                type: "check_payment_status",
                config: {},
                payload: { paymentId: "payment-123" },
            };

            await pixIntegration.execute(action);

            expect(mockCheckPaymentStatus).toHaveBeenCalledWith("payment-123");
        });

        it("should handle refund_payment action", async () => {
            const mockRefundPayment = jest.fn().mockResolvedValue({
                success: true,
                data: {
                    refundId: "refund-123",
                    status: "approved",
                },
            });
            (pixIntegration as any).refundPayment = mockRefundPayment;

            const action = {
                type: "refund_payment",
                config: {},
                payload: { paymentId: "payment-123" },
            };

            await pixIntegration.execute(action);

            expect(mockRefundPayment).toHaveBeenCalledWith("payment-123");
        });
    });

    describe("processWebhook", () => {
        it("should process payment webhook correctly", async () => {
            const mockCheckPaymentStatus = jest.fn().mockResolvedValue({
                success: true,
                data: {
                    paymentId: "payment-123",
                    status: "approved",
                    amount: 100.5,
                    statusDetail: "accredited",
                },
            });
            (pixIntegration as any).checkPaymentStatus = mockCheckPaymentStatus;

            const mockLogActivity = jest.fn();
            (pixIntegration as any).logActivity = mockLogActivity;

            const webhookPayload = {
                type: "payment",
                data: { id: "payment-123" },
            };

            const results = await pixIntegration.processWebhook(webhookPayload);

            expect(results).toHaveLength(1);
            expect(results[0]).toEqual({
                paymentId: "payment-123",
                status: "approved",
                amount: 100.5,
                statusDetail: "accredited",
            });

            expect(mockLogActivity).toHaveBeenCalledWith("process_webhook", true, {
                paymentsProcessed: 1,
            });
        });

        it("should handle webhook with no payment data", async () => {
            const mockLogActivity = jest.fn();
            (pixIntegration as any).logActivity = mockLogActivity;

            const webhookPayload = {
                type: "other",
                data: {},
            };

            const results = await pixIntegration.processWebhook(webhookPayload);

            expect(results).toHaveLength(0);
            expect(mockLogActivity).toHaveBeenCalledWith("process_webhook", true, {
                paymentsProcessed: 0,
            });
        });
    });
});
