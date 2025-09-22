import { FastifyPluginAsync } from "fastify";
import { AuthService, RegisterData, LoginCredentials } from "../auth/AuthService";
import { AuthMiddleware } from "../auth/AuthMiddleware";
import { AutoFlowError } from "../core/types";

export const authRoutes: FastifyPluginAsync = async (fastify) => {
    const authService = new AuthService();
    const authMiddleware = new AuthMiddleware();

    // POST /api/auth/register - Register new organization and admin user
    fastify.post(
        "/register",
        {
            schema: {
                tags: ["auth"],
                description: "Register new organization and admin user",
                body: {
                    type: "object",
                    required: ["organization", "user", "acceptedTerms", "acceptedPrivacy"],
                    properties: {
                        organization: {
                            type: "object",
                            required: ["name", "industry", "size", "country"],
                            properties: {
                                name: { type: "string", minLength: 2, maxLength: 100 },
                                industry: { type: "string", minLength: 2, maxLength: 50 },
                                size: { type: "string", enum: ["micro", "pequena", "media"] },
                                country: { type: "string", enum: ["BR"] },
                            },
                        },
                        user: {
                            type: "object",
                            required: ["name", "email", "password"],
                            properties: {
                                name: { type: "string", minLength: 2, maxLength: 100 },
                                email: { type: "string", format: "email" },
                                password: { type: "string", minLength: 8 },
                                phone: { type: "string" },
                            },
                        },
                        acceptedTerms: { type: "boolean" },
                        acceptedPrivacy: { type: "boolean" },
                    },
                },
                response: {
                    201: {
                        type: "object",
                        properties: {
                            user: {
                                type: "object",
                                properties: {
                                    id: { type: "string" },
                                    email: { type: "string" },
                                    name: { type: "string" },
                                    role: { type: "string" },
                                    organizationId: { type: "string" },
                                    organization: {
                                        type: "object",
                                        properties: {
                                            id: { type: "string" },
                                            name: { type: "string" },
                                            plan: { type: "string" },
                                        },
                                    },
                                },
                            },
                            tokens: {
                                type: "object",
                                properties: {
                                    accessToken: { type: "string" },
                                    refreshToken: { type: "string" },
                                    expiresIn: { type: "number" },
                                },
                            },
                        },
                    },
                },
            },
        },
        async (request, reply) => {
            try {
                const registerData = request.body as RegisterData;

                // Validate password strength
                const passwordValidation = authService.validatePassword(registerData.user.password);
                if (!passwordValidation.isValid) {
                    return reply.status(400).send({
                        error: "WEAK_PASSWORD",
                        message: "Password does not meet requirements",
                        details: passwordValidation.errors,
                        timestamp: new Date().toISOString(),
                    });
                }

                const result = await authService.register(registerData);

                return reply.status(201).send(result);
            } catch (error) {
                if (error instanceof AutoFlowError) {
                    const statusCode = error.code === "EMAIL_ALREADY_EXISTS" ? 409 : 400;
                    return reply.status(statusCode).send({
                        error: error.code,
                        message: error.message,
                        timestamp: new Date().toISOString(),
                    });
                }

                fastify.log.error(`Registration error: ${error}`);
                return reply.status(500).send({
                    error: "REGISTRATION_FAILED",
                    message: "Failed to register user",
                    timestamp: new Date().toISOString(),
                });
            }
        }
    );

    // POST /api/auth/login - Authenticate user
    fastify.post(
        "/login",
        {
            preHandler: authMiddleware.ipRateLimit(5, 60000),
            schema: {
                tags: ["auth"],
                description: "Authenticate user with email and password",
                body: {
                    type: "object",
                    required: ["email", "password"],
                    properties: {
                        email: { type: "string", format: "email" },
                        password: { type: "string", minLength: 1 },
                    },
                },
                response: {
                    200: {
                        type: "object",
                        properties: {
                            user: {
                                type: "object",
                                properties: {
                                    id: { type: "string" },
                                    email: { type: "string" },
                                    name: { type: "string" },
                                    role: { type: "string" },
                                    organizationId: { type: "string" },
                                    organization: {
                                        type: "object",
                                        properties: {
                                            id: { type: "string" },
                                            name: { type: "string" },
                                            plan: { type: "string" },
                                        },
                                    },
                                },
                            },
                            tokens: {
                                type: "object",
                                properties: {
                                    accessToken: { type: "string" },
                                    refreshToken: { type: "string" },
                                    expiresIn: { type: "number" },
                                },
                            },
                        },
                    },
                },
            },
        },
        async (request, reply) => {
            try {
                const credentials = request.body as LoginCredentials;
                const result = await authService.login(credentials);

                return reply.status(200).send(result);
            } catch (error) {
                if (error instanceof AutoFlowError) {
                    const statusCode = error.code === "INVALID_CREDENTIALS" ? 401 : 400;
                    return reply.status(statusCode).send({
                        error: error.code,
                        message: error.message,
                        timestamp: new Date().toISOString(),
                    });
                }

                fastify.log.error(`Login error: ${error}`);
                return reply.status(500).send({
                    error: "LOGIN_FAILED",
                    message: "Failed to authenticate user",
                    timestamp: new Date().toISOString(),
                });
            }
        }
    );

    // GET /api/auth/me - Get current user profile
    fastify.get(
        "/me",
        {
            preHandler: authMiddleware.authenticate(),
            schema: {
                tags: ["auth"],
                description: "Get current user profile",
                response: {
                    200: {
                        type: "object",
                        properties: {
                            user: {
                                type: "object",
                                properties: {
                                    id: { type: "string" },
                                    email: { type: "string" },
                                    name: { type: "string" },
                                    role: { type: "string" },
                                    organizationId: { type: "string" },
                                    organization: {
                                        type: "object",
                                        properties: {
                                            id: { type: "string" },
                                            name: { type: "string" },
                                            plan: { type: "string" },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        async (request, reply) => {
            try {
                // O usuário foi verificado pelo middleware
                const user = (request as any).user;
                return reply.status(200).send({ user });
            } catch (error) {
                fastify.log.error(`Profile error: ${error}`);
                return reply.status(500).send({
                    error: "PROFILE_FAILED",
                    message: "Failed to get user profile",
                    timestamp: new Date().toISOString(),
                });
            }
        }
    );

    // POST /api/auth/refresh - Refresh access token
    fastify.post(
        "/refresh",
        {
            schema: {
                tags: ["auth"],
                description: "Refresh access token using refresh token",
                body: {
                    type: "object",
                    required: ["refreshToken"],
                    properties: {
                        refreshToken: { type: "string" },
                    },
                },
                response: {
                    200: {
                        type: "object",
                        properties: {
                            tokens: {
                                type: "object",
                                properties: {
                                    accessToken: { type: "string" },
                                    refreshToken: { type: "string" },
                                    expiresIn: { type: "number" },
                                },
                            },
                        },
                    },
                },
            },
        },
        async (request, reply) => {
            try {
                const { refreshToken } = request.body as { refreshToken: string };
                const tokens = await authService.refreshToken(refreshToken);

                return reply.status(200).send({ tokens });
            } catch (error) {
                if (error instanceof AutoFlowError) {
                    const statusCode = error.code === "INVALID_TOKEN" ? 401 : 400;
                    return reply.status(statusCode).send({
                        error: error.code,
                        message: error.message,
                        timestamp: new Date().toISOString(),
                    });
                }

                fastify.log.error(`Refresh token error: ${error}`);
                return reply.status(500).send({
                    error: "REFRESH_FAILED",
                    message: "Failed to refresh token",
                    timestamp: new Date().toISOString(),
                });
            }
        }
    );

    // POST /api/auth/logout - Logout user (blacklist refresh token)
    fastify.post(
        "/logout",
        {
            preHandler: authMiddleware.authenticate(),
            schema: {
                tags: ["auth"],
                description: "Logout user and invalidate tokens",
                response: {
                    200: {
                        type: "object",
                        properties: {
                            message: { type: "string" },
                        },
                    },
                },
            },
        },
        async (_request, reply) => {
            try {
                // Para implementação futura: adicionar blacklist de tokens
                return reply.status(200).send({
                    message: "Logged out successfully",
                });
            } catch (error) {
                fastify.log.error(`Logout error: ${error}`);
                return reply.status(500).send({
                    error: "LOGOUT_FAILED",
                    message: "Failed to logout user",
                    timestamp: new Date().toISOString(),
                });
            }
        }
    );
};
