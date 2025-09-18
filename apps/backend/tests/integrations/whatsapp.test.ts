import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { WhatsAppIntegration } from "../../src/integrations/whatsapp/WhatsAppIntegration";
import { WhatsAppConfig } from "../../src/core/types";

// Mock the base Integration class
jest.mock("../../src/core/integrations/base");

describe("WhatsAppIntegration", () => {
    let whatsappIntegration: WhatsAppIntegration;
    let mockConfig: WhatsAppConfig;

    beforeEach(() => {
        mockConfig = {
            apiKey: "test-api-key",
            phoneNumberId: "test-phone-id",
            businessAccountId: "test-business-id",
            webhookVerifyToken: "test-webhook-token",
        };

        whatsappIntegration = new WhatsAppIntegration(mockConfig, "test-org");
    });

    describe("constructor", () => {
        it("should create instance with correct configuration", () => {
            expect(whatsappIntegration).toBeInstanceOf(WhatsAppIntegration);
        });
    });

    describe("getAvailableActions", () => {
        it("should return correct available actions", () => {
            const actions = whatsappIntegration.getAvailableActions();
            expect(actions).toContain("send_text_message");
            expect(actions).toContain("send_template_message");
            expect(actions).toContain("send_media_message");
            expect(actions).toContain("mark_as_read");
        });
    });

    describe("validateConfig", () => {
        it("should validate required fields", async () => {
            // Mock the validateRequiredFields method
            const mockValidateRequiredFields = jest.fn().mockReturnValue({ isValid: true });
            (whatsappIntegration as any).validateRequiredFields = mockValidateRequiredFields;

            // Mock testConnection
            jest.spyOn(whatsappIntegration, "testConnection").mockResolvedValue(true);

            const result = await whatsappIntegration.validateConfig();

            expect(mockValidateRequiredFields).toHaveBeenCalledWith(mockConfig, [
                "apiKey",
                "phoneNumberId",
                "businessAccountId",
            ]);
            expect(result.isValid).toBe(true);
        });

        it("should return invalid when required fields are missing", async () => {
            const mockValidateRequiredFields = jest.fn().mockReturnValue({
                isValid: false,
                errors: ["apiKey is required"],
            });
            (whatsappIntegration as any).validateRequiredFields = mockValidateRequiredFields;

            const result = await whatsappIntegration.validateConfig();

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("apiKey is required");
        });

        it("should return invalid when connection test fails", async () => {
            const mockValidateRequiredFields = jest.fn().mockReturnValue({ isValid: true });
            (whatsappIntegration as any).validateRequiredFields = mockValidateRequiredFields;

            jest.spyOn(whatsappIntegration, "testConnection").mockResolvedValue(false);

            const result = await whatsappIntegration.validateConfig();

            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Unable to connect to WhatsApp Business API");
        });
    });

    describe("execute", () => {
        it("should handle send_text_message action", async () => {
            const mockSendTextMessage = jest.fn().mockResolvedValue({
                success: true,
                data: { messages: [{ id: "msg-123" }] },
            });
            (whatsappIntegration as any).sendTextMessage = mockSendTextMessage;

            const action = {
                type: "send_text_message",
                config: {},
                payload: { to: "+5511999999999", message: "Test message" },
            };

            await whatsappIntegration.execute(action);

            expect(mockSendTextMessage).toHaveBeenCalledWith("+5511999999999", "Test message");
        });

        it("should handle send_template_message action", async () => {
            const mockSendTemplateMessage = jest.fn().mockResolvedValue({
                success: true,
                data: { messages: [{ id: "msg-123" }] },
            });
            (whatsappIntegration as any).sendTemplateMessage = mockSendTemplateMessage;

            const action = {
                type: "send_template_message",
                config: {},
                payload: {
                    to: "+5511999999999",
                    templateName: "welcome_message",
                    parameters: ["João"],
                },
            };

            await whatsappIntegration.execute(action);

            expect(mockSendTemplateMessage).toHaveBeenCalledWith("+5511999999999", "welcome_message", ["João"]);
        });

        it("should throw error for unsupported action", async () => {
            const mockLogActivity = jest.fn();
            (whatsappIntegration as any).logActivity = mockLogActivity;

            const action = {
                type: "unsupported_action",
                config: {},
                payload: {},
            };

            const result = await whatsappIntegration.execute(action);

            expect(result.success).toBe(false);
            expect(result.error).toContain("Unsupported WhatsApp action");
        });
    });

    describe("processWebhook", () => {
        it("should process incoming messages correctly", async () => {
            const mockLogActivity = jest.fn();
            (whatsappIntegration as any).logActivity = mockLogActivity;

            const webhookPayload = {
                entry: [
                    {
                        changes: [
                            {
                                value: {
                                    messages: [
                                        {
                                            from: "+5511999999999",
                                            text: { body: "Hello from customer" },
                                            type: "text",
                                            timestamp: 1234567890,
                                        },
                                    ],
                                },
                            },
                        ],
                    },
                ],
            };

            const messages = await whatsappIntegration.processWebhook(webhookPayload);

            expect(messages).toHaveLength(1);
            expect(messages[0]).toEqual({
                from: "+5511999999999",
                to: mockConfig.phoneNumberId,
                body: "Hello from customer",
                type: "text",
                timestamp: 1234567890,
            });

            expect(mockLogActivity).toHaveBeenCalledWith("process_webhook", true, {
                messagesCount: 1,
            });
        });

        it("should handle empty webhook payload", async () => {
            const mockLogActivity = jest.fn();
            (whatsappIntegration as any).logActivity = mockLogActivity;

            const messages = await whatsappIntegration.processWebhook({});

            expect(messages).toHaveLength(0);
            expect(mockLogActivity).toHaveBeenCalledWith("process_webhook", true, {
                messagesCount: 0,
            });
        });
    });

    describe("sendMessage", () => {
        it("should send message and return correct result", async () => {
            const mockSendTextMessage = jest.fn().mockResolvedValue({
                success: true,
                data: { messages: [{ id: "msg-123" }] },
            });
            (whatsappIntegration as any).sendTextMessage = mockSendTextMessage;

            const result = await whatsappIntegration.sendMessage("+5511999999999", "Test message");

            expect(result.success).toBe(true);
            expect(result.messageId).toBe("msg-123");
            expect(mockSendTextMessage).toHaveBeenCalledWith("+5511999999999", "Test message");
        });

        it("should handle send message failure", async () => {
            const mockSendTextMessage = jest.fn().mockResolvedValue({
                success: false,
                error: "API Error",
            });
            (whatsappIntegration as any).sendTextMessage = mockSendTextMessage;

            const result = await whatsappIntegration.sendMessage("+5511999999999", "Test message");

            expect(result.success).toBe(false);
            expect(result.error).toBe("API Error");
        });
    });
});
