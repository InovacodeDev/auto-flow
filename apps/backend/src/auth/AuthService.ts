import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../core/database";
import { users, organizations } from "../core/database/schema";
import { eq, and } from "drizzle-orm";
import { AutoFlowError } from "../core/types";

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    organization: {
        name: string;
        industry: string;
        size: "micro" | "pequena" | "media";
        country: "BR";
    };
    user: {
        name: string;
        email: string;
        password: string;
        phone?: string;
    };
    acceptedTerms: boolean;
    acceptedPrivacy: boolean;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: string;
    organizationId: string;
    organization: {
        id: string;
        name: string;
        plan: string;
    };
}

export class AuthService {
    private readonly JWT_SECRET = process.env["JWT_SECRET"] || "dev-secret-key";
    private readonly JWT_REFRESH_SECRET = process.env["JWT_REFRESH_SECRET"] || "dev-refresh-secret";
    private readonly ACCESS_TOKEN_EXPIRES = "15m";
    private readonly REFRESH_TOKEN_EXPIRES = "7d";
    private readonly SALT_ROUNDS = 12;

    /**
     * Register new organization and admin user
     */
    async register(data: RegisterData): Promise<{ user: AuthUser; tokens: AuthTokens }> {
        // Validate terms acceptance
        if (!data.acceptedTerms || !data.acceptedPrivacy) {
            throw new AutoFlowError("Terms of service and privacy policy must be accepted", "TERMS_NOT_ACCEPTED");
        }

        // Check if email already exists
        const existingUser = await db.select().from(users).where(eq(users.email, data.user.email)).limit(1);

        if (existingUser.length > 0) {
            throw new AutoFlowError("Email already registered", "EMAIL_ALREADY_EXISTS");
        }

        // Hash password
        const passwordHash = await bcrypt.hash(data.user.password, this.SALT_ROUNDS);

        // Create organization slug from name
        const slug = this.createSlug(data.organization.name);

        // Check if organization slug already exists
        const existingOrg = await db.select().from(organizations).where(eq(organizations.slug, slug)).limit(1);

        if (existingOrg.length > 0) {
            throw new AutoFlowError("Organization name already taken", "ORGANIZATION_NAME_TAKEN");
        }

        try {
            // Create organization
            const [newOrganization] = await db
                .insert(organizations)
                .values({
                    name: data.organization.name,
                    slug,
                    plan: "free",
                    settings: {
                        industry: data.organization.industry,
                        size: data.organization.size,
                        country: data.organization.country,
                        onboardingCompleted: false,
                    },
                })
                .returning();

            // Create admin user
            const [newUser] = await db
                .insert(users)
                .values({
                    organizationId: newOrganization.id,
                    email: data.user.email,
                    name: data.user.name,
                    passwordHash,
                    role: "admin", // First user is always admin
                    isActive: true,
                })
                .returning();

            // Generate tokens
            const authUser: AuthUser = {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role,
                organizationId: newOrganization.id,
                organization: {
                    id: newOrganization.id,
                    name: newOrganization.name,
                    plan: newOrganization.plan,
                },
            };

            const tokens = this.generateTokens(authUser);

            return { user: authUser, tokens };
        } catch (error) {
            throw new AutoFlowError("Failed to create organization and user", "REGISTRATION_FAILED", {
                originalError: error,
            });
        }
    }

    /**
     * Authenticate user with email and password
     */
    async login(credentials: LoginCredentials): Promise<{ user: AuthUser; tokens: AuthTokens }> {
        // Find user by email
        const [userRecord] = await db
            .select({
                id: users.id,
                email: users.email,
                name: users.name,
                role: users.role,
                passwordHash: users.passwordHash,
                isActive: users.isActive,
                organizationId: users.organizationId,
                lastLoginAt: users.lastLoginAt,
                organization: {
                    id: organizations.id,
                    name: organizations.name,
                    plan: organizations.plan,
                },
            })
            .from(users)
            .innerJoin(organizations, eq(users.organizationId, organizations.id))
            .where(eq(users.email, credentials.email))
            .limit(1);

        if (!userRecord) {
            throw new AutoFlowError("Invalid email or password", "INVALID_CREDENTIALS");
        }

        if (!userRecord.isActive) {
            throw new AutoFlowError("Account is deactivated", "ACCOUNT_DEACTIVATED");
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(credentials.password, userRecord.passwordHash);
        if (!isPasswordValid) {
            throw new AutoFlowError("Invalid email or password", "INVALID_CREDENTIALS");
        }

        // Update last login
        await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, userRecord.id));

        // Create auth user object
        const authUser: AuthUser = {
            id: userRecord.id,
            email: userRecord.email,
            name: userRecord.name,
            role: userRecord.role,
            organizationId: userRecord.organizationId,
            organization: userRecord.organization,
        };

        // Generate tokens
        const tokens = this.generateTokens(authUser);

        return { user: authUser, tokens };
    }

    /**
     * Refresh access token using refresh token
     */
    async refreshToken(refreshToken: string): Promise<AuthTokens> {
        try {
            const payload = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as any;

            // Verify user still exists and is active
            const [userRecord] = await db
                .select({
                    id: users.id,
                    email: users.email,
                    name: users.name,
                    role: users.role,
                    isActive: users.isActive,
                    organizationId: users.organizationId,
                    organization: {
                        id: organizations.id,
                        name: organizations.name,
                        plan: organizations.plan,
                    },
                })
                .from(users)
                .innerJoin(organizations, eq(users.organizationId, organizations.id))
                .where(and(eq(users.id, payload.userId), eq(users.isActive, true)))
                .limit(1);

            if (!userRecord) {
                throw new AutoFlowError("Invalid refresh token", "INVALID_REFRESH_TOKEN");
            }

            const authUser: AuthUser = {
                id: userRecord.id,
                email: userRecord.email,
                name: userRecord.name,
                role: userRecord.role,
                organizationId: userRecord.organizationId,
                organization: userRecord.organization,
            };

            return this.generateTokens(authUser);
        } catch (error) {
            throw new AutoFlowError("Invalid or expired refresh token", "INVALID_REFRESH_TOKEN", {
                originalError: error,
            });
        }
    }

    /**
     * Verify and decode access token
     */
    async verifyToken(token: string): Promise<AuthUser> {
        try {
            const payload = jwt.verify(token, this.JWT_SECRET) as any;

            // Verify user still exists and is active
            const [userRecord] = await db
                .select({
                    id: users.id,
                    email: users.email,
                    name: users.name,
                    role: users.role,
                    isActive: users.isActive,
                    organizationId: users.organizationId,
                    organization: {
                        id: organizations.id,
                        name: organizations.name,
                        plan: organizations.plan,
                    },
                })
                .from(users)
                .innerJoin(organizations, eq(users.organizationId, organizations.id))
                .where(and(eq(users.id, payload.userId), eq(users.isActive, true)))
                .limit(1);

            if (!userRecord) {
                throw new AutoFlowError("Invalid token - user not found", "INVALID_TOKEN");
            }

            return {
                id: userRecord.id,
                email: userRecord.email,
                name: userRecord.name,
                role: userRecord.role,
                organizationId: userRecord.organizationId,
                organization: userRecord.organization,
            };
        } catch (error) {
            throw new AutoFlowError("Invalid or expired token", "INVALID_TOKEN", { originalError: error });
        }
    }

    /**
     * Generate access and refresh tokens
     */
    private generateTokens(user: AuthUser): AuthTokens {
        const accessTokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId,
        };

        const refreshTokenPayload = {
            userId: user.id,
            organizationId: user.organizationId,
        };

        const accessToken = jwt.sign(accessTokenPayload, this.JWT_SECRET, {
            expiresIn: this.ACCESS_TOKEN_EXPIRES,
        });

        const refreshToken = jwt.sign(refreshTokenPayload, this.JWT_REFRESH_SECRET, {
            expiresIn: this.REFRESH_TOKEN_EXPIRES,
        });

        return {
            accessToken,
            refreshToken,
            expiresIn: 15 * 60, // 15 minutes in seconds
        };
    }

    /**
     * Create URL-friendly slug from organization name
     */
    private createSlug(name: string): string {
        return name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Remove accents
            .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
            .replace(/\s+/g, "-") // Replace spaces with hyphens
            .replace(/-+/g, "-") // Replace multiple hyphens with single
            .trim()
            .substring(0, 50); // Limit length
    }

    /**
     * Validate password strength
     */
    validatePassword(password: string): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (password.length < 8) {
            errors.push("Password must be at least 8 characters long");
        }

        if (!/[A-Z]/.test(password)) {
            errors.push("Password must contain at least one uppercase letter");
        }

        if (!/[a-z]/.test(password)) {
            errors.push("Password must contain at least one lowercase letter");
        }

        if (!/[0-9]/.test(password)) {
            errors.push("Password must contain at least one number");
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push("Password must contain at least one special character");
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }
}
