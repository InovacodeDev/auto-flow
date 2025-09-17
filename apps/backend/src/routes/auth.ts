import { FastifyPluginAsync } from "fastify";

export const authRoutes: FastifyPluginAsync = async (fastify) => {
    // POST /api/auth/login
    fastify.post(
        "/login",
        {
            schema: {
                tags: ["auth"],
                body: {
                    type: "object",
                    required: ["email", "password"],
                    properties: {
                        email: { type: "string", format: "email" },
                        password: { type: "string", minLength: 6 },
                    },
                },
            },
        },
        async () => {
            return { message: "Login endpoint - em desenvolvimento" };
        }
    );

    // POST /api/auth/register
    fastify.post(
        "/register",
        {
            schema: {
                tags: ["auth"],
                body: {
                    type: "object",
                    required: ["email", "password", "name", "organization"],
                    properties: {
                        email: { type: "string", format: "email" },
                        password: { type: "string", minLength: 6 },
                        name: { type: "string", minLength: 2 },
                        organization: { type: "string", minLength: 2 },
                    },
                },
            },
        },
        async () => {
            return { message: "Register endpoint - em desenvolvimento" };
        }
    );

    // GET /api/auth/me
    fastify.get(
        "/me",
        {
            schema: {
                tags: ["auth"],
            },
        },
        async () => {
            return { message: "User profile endpoint - em desenvolvimento" };
        }
    );
};
