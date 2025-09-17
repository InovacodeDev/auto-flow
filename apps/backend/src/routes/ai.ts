import { FastifyPluginAsync } from "fastify";

export const aiRoutes: FastifyPluginAsync = async (fastify) => {
    // POST /api/ai/create-workflow
    fastify.post(
        "/create-workflow",
        {
            schema: {
                tags: ["ai"],
                body: {
                    type: "object",
                    required: ["message", "context"],
                    properties: {
                        message: { type: "string", minLength: 10 },
                        context: {
                            type: "object",
                            properties: {
                                industry: { type: "string" },
                                businessSize: { type: "string" },
                                currentTools: { type: "array", items: { type: "string" } },
                            },
                        },
                    },
                },
            },
        },
        async () => {
            return { message: "Criar workflow via IA - em desenvolvimento" };
        }
    );

    // POST /api/ai/optimize-workflow
    fastify.post(
        "/optimize-workflow",
        {
            schema: {
                tags: ["ai"],
            },
        },
        async () => {
            return { message: "Otimizar workflow via IA - em desenvolvimento" };
        }
    );

    // POST /api/ai/chat
    fastify.post(
        "/chat",
        {
            schema: {
                tags: ["ai"],
            },
        },
        async () => {
            return { message: "Chat com IA assistente - em desenvolvimento" };
        }
    );
};
