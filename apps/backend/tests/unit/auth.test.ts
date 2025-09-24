import { AuthService, RegisterData } from "../../src/auth/AuthService";

// Mock the database module used by AuthService
jest.mock("../../src/core/database", () => {
    return {
        db: {
            select: jest.fn().mockReturnThis(),
            from: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue([]),
            insert: jest.fn().mockReturnThis(),
            values: jest.fn().mockReturnThis(),
            returning: jest.fn().mockResolvedValue([{ id: "org-1", name: "Org", plan: "free" }]),
            update: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
        },
    };
});

import * as dbModule from "../../src/core/database";

describe("AuthService.register", () => {
    it("should register a new organization and admin user (happy path)", async () => {
        const authService = new AuthService();

        const data: RegisterData = {
            organization: { name: "Test Org", industry: "saas", size: "micro", country: "BR" },
            user: { name: "Alice", email: "alice@example.com", password: "P@ssw0rd!" },
            acceptedTerms: true,
            acceptedPrivacy: true,
        };

        // Ensure the mocked returning() yields the organization first, then the user
        const db = (dbModule as any).db;
        db.returning.mockResolvedValueOnce([{ id: "org-1", name: "Test Org", plan: "free" }]);
        db.returning.mockResolvedValueOnce([
            { id: "user-1", email: "alice@example.com", name: "Alice", role: "admin" },
        ]);

        const result = await authService.register(data);

        expect(result).toHaveProperty("user");
        expect(result).toHaveProperty("tokens");
        expect(result.user.email).toBe("alice@example.com");
    });

    it("should throw when email already exists", async () => {
        // Override the mock to simulate existing user
        const db = (dbModule as any).db;
        // simulate select().from(...).where(...).limit(1) returning a non-empty array
        db.select.mockReturnThis();
        db.from.mockReturnThis();
        db.where.mockReturnThis();
        db.limit.mockResolvedValueOnce([{ id: "user-1" }]);

        const authService = new AuthService();

        const data: RegisterData = {
            organization: { name: "Existing Org", industry: "saas", size: "micro", country: "BR" },
            user: { name: "Alice", email: "alice@example.com", password: "P@ssw0rd!" },
            acceptedTerms: true,
            acceptedPrivacy: true,
        };

        await expect(authService.register(data)).rejects.toThrow();
    });
});
