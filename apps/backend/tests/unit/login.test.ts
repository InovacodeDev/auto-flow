import { AuthService } from "../../src/auth/AuthService";
import bcrypt from "bcrypt";

// Use CommonJS require to avoid dynamic import issues in the test runner
jest.mock("../../src/core/database", () => {
    return {
        db: {
            select: jest.fn().mockReturnThis(),
            from: jest.fn().mockReturnThis(),
            innerJoin: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue([]),
            update: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
        },
    };
});

import * as dbModule from "../../src/core/database";

describe("AuthService.login", () => {
    it("should login successfully with valid credentials", async () => {
        const db = (dbModule as any).db;

        // simulate db.select(...).from(...).innerJoin(...).where(...).limit(1) returning a user record
        db.select.mockReturnThis();
        db.from.mockReturnThis();
        db.innerJoin.mockReturnThis();
        db.where.mockReturnThis();
        db.limit.mockResolvedValueOnce([
            {
                id: "user-1",
                email: "bob@example.com",
                name: "Bob",
                role: "user",
                passwordHash: await bcrypt.hash("P@ssw0rd!", 1),
                isActive: true,
                organizationId: "org-1",
                organization: { id: "org-1", name: "Org", plan: "free" },
            },
        ]);

        const authService = new AuthService();

        const result = await authService.login({ email: "bob@example.com", password: "P@ssw0rd!" });

        expect(result).toHaveProperty("user");
        expect(result).toHaveProperty("tokens");
        expect(result.user.email).toBe("bob@example.com");
    });

    it("should throw on invalid credentials", async () => {
        const db = (dbModule as any).db;

        // simulate no user found
        db.select.mockReturnThis();
        db.from.mockReturnThis();
        db.innerJoin.mockReturnThis();
        db.where.mockReturnThis();
        db.limit.mockResolvedValueOnce([]);

        const authService = new AuthService();

        await expect(authService.login({ email: "doesnotexist@example.com", password: "x" })).rejects.toThrow();
    });
});
