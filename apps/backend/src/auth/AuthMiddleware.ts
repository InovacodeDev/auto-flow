import { FastifyRequest, FastifyReply } from "fastify";
import { AuthService, AuthUser } from "./AuthService";
import { AutoFlowError } from "../core/types";

export interface AuthMiddlewareOptions {
    requiredRole?: string[];
    requiredPermissions?: string[];
    skipAuthentication?: boolean;
}

export class AuthMiddleware {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    /**
     * Main authentication middleware
     */
    authenticate = (options: AuthMiddlewareOptions = {}) => {
        return async (request: FastifyRequest, reply: FastifyReply) => {
            // Skip authentication if explicitly requested
            if (options.skipAuthentication) {
                return;
            }

            try {
                // Extract token from Authorization header
                const authHeader = request.headers.authorization;
                if (!authHeader || !authHeader.startsWith("Bearer ")) {
                    throw new AutoFlowError("Missing or invalid authorization header", "MISSING_AUTH_HEADER");
                }

                const token = authHeader.substring(7); // Remove "Bearer " prefix

                // Verify token and get user
                const user = await this.authService.verifyToken(token);

                // Check role requirements
                if (options.requiredRole && options.requiredRole.length > 0) {
                    if (!options.requiredRole.includes(user.role)) {
                        throw new AutoFlowError("Insufficient role permissions", "INSUFFICIENT_ROLE", {
                            userRole: user.role,
                            requiredRoles: options.requiredRole,
                        });
                    }
                }

                // Check permission requirements (for future implementation)
                if (options.requiredPermissions && options.requiredPermissions.length > 0) {
                    // TODO: Implement permission checking when RBAC is fully implemented
                    console.log("Permission checking not yet implemented:", options.requiredPermissions);
                }

                // Add user to request context
                (request as any).user = user;
            } catch (error) {
                if (error instanceof AutoFlowError) {
                    return reply.status(401).send({
                        error: error.code,
                        message: error.message,
                        timestamp: new Date().toISOString(),
                    });
                }

                return reply.status(401).send({
                    error: "AUTHENTICATION_FAILED",
                    message: "Authentication failed",
                    timestamp: new Date().toISOString(),
                });
            }
        };
    };

    /**
     * Middleware for admin-only routes
     */
    requireAdmin = () => {
        return this.authenticate({ requiredRole: ["admin", "super_admin"] });
    };

    /**
     * Middleware for user-level routes (includes admin)
     */
    requireUser = () => {
        return this.authenticate({ requiredRole: ["user", "admin", "super_admin"] });
    };

    /**
     * Middleware for viewer-level routes (includes all roles)
     */
    requireViewer = () => {
        return this.authenticate({ requiredRole: ["viewer", "user", "admin", "super_admin"] });
    };

    /**
     * Optional authentication - adds user to request if token is valid
     */
    optionalAuth = () => {
        return async (request: FastifyRequest, _reply: FastifyReply) => {
            try {
                const authHeader = request.headers.authorization;
                if (authHeader && authHeader.startsWith("Bearer ")) {
                    const token = authHeader.substring(7);
                    const user = await this.authService.verifyToken(token);
                    (request as any).user = user;
                }
            } catch (error) {
                // Optional auth - ignore errors
                console.log("Optional auth failed:", error);
            }
        };
    };

    /**
     * Organization isolation middleware
     * Ensures users can only access data from their organization
     */
    ensureOrganizationAccess = (organizationIdParam = "organizationId") => {
        return async (request: FastifyRequest, reply: FastifyReply) => {
            const user = (request as any).user as AuthUser;

            if (!user) {
                return reply.status(401).send({
                    error: "AUTHENTICATION_REQUIRED",
                    message: "Authentication required for organization access",
                    timestamp: new Date().toISOString(),
                });
            }

            const requestedOrgId = (request.params as any)[organizationIdParam];

            if (requestedOrgId && requestedOrgId !== user.organizationId) {
                return reply.status(403).send({
                    error: "ORGANIZATION_ACCESS_DENIED",
                    message: "Access denied to this organization",
                    timestamp: new Date().toISOString(),
                });
            }
        };
    };

    /**
     * Rate limiting by organization
     */
    organizationRateLimit = (maxRequests = 100, windowMs = 60000) => {
        const orgRequestCounts = new Map<string, { count: number; resetTime: number }>();

        return async (request: FastifyRequest, reply: FastifyReply) => {
            const user = (request as any).user as AuthUser;

            if (!user) {
                return; // Skip if no user (should be handled by auth middleware)
            }

            const orgId = user.organizationId;
            const now = Date.now();
            const windowStart = now - windowMs;

            // Clean up old entries
            for (const [key, value] of orgRequestCounts.entries()) {
                if (value.resetTime < windowStart) {
                    orgRequestCounts.delete(key);
                }
            }

            // Get or create org request count
            let orgData = orgRequestCounts.get(orgId);
            if (!orgData || orgData.resetTime < windowStart) {
                orgData = { count: 0, resetTime: now + windowMs };
                orgRequestCounts.set(orgId, orgData);
            }

            // Check rate limit
            if (orgData.count >= maxRequests) {
                return reply.status(429).send({
                    error: "RATE_LIMIT_EXCEEDED",
                    message: "Too many requests for this organization",
                    retryAfter: Math.ceil((orgData.resetTime - now) / 1000),
                    timestamp: new Date().toISOString(),
                });
            }

            // Increment count
            orgData.count++;
        };
    };

    /**
     * Simple rate limiting by IP address (in-memory)
     * Useful for endpoints like login to prevent brute force attacks
     */
    ipRateLimit = (maxRequests = 5, windowMs = 60000) => {
        const ipCounts = new Map<string, { count: number; resetTime: number }>();

        return async (request: FastifyRequest, reply: FastifyReply) => {
            const ip = request.ip || (request.headers["x-forwarded-for"] as string) || "unknown";
            const now = Date.now();
            const windowStart = now - windowMs;

            // Clean up old entries
            for (const [key, value] of ipCounts.entries()) {
                if (value.resetTime < windowStart) {
                    ipCounts.delete(key);
                }
            }

            let data = ipCounts.get(ip);
            if (!data || data.resetTime < windowStart) {
                data = { count: 0, resetTime: now + windowMs };
                ipCounts.set(ip, data);
            }

            if (data.count >= maxRequests) {
                return reply.status(429).send({
                    error: "TOO_MANY_REQUESTS",
                    message: "Too many requests from this IP, please try again later",
                    retryAfter: Math.ceil((data.resetTime - now) / 1000),
                    timestamp: new Date().toISOString(),
                });
            }

            data.count++;
        };
    };

    /**
     * Audit logging middleware
     */
    auditLog = (action: string) => {
        return async (request: FastifyRequest, _reply: FastifyReply) => {
            const user = (request as any).user as AuthUser;

            if (user) {
                // TODO: Implement audit logging to database
                console.log("AUDIT:", {
                    action,
                    userId: user.id,
                    organizationId: user.organizationId,
                    method: request.method,
                    url: request.url,
                    ip: request.ip,
                    timestamp: new Date().toISOString(),
                });
            }
        };
    };

    /**
     * Helper function to get authenticated user from request
     */
    static getUser(request: FastifyRequest): AuthUser | undefined {
        return (request as any).user as AuthUser;
    }
}
