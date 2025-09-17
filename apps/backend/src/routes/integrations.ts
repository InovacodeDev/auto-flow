import { FastifyPluginAsync } from "fastify";

export const integrationRoutes: FastifyPluginAsync = async (fastify) => {
    // GET /api/integrations
    fastify.get(
        "/",
        {
            schema: {
                tags: ["integrations"],
            },
        },
        async () => {
            return { message: "Lista de integrações disponíveis - em desenvolvimento" };
        }
    );

    // POST /api/integrations/whatsapp/webhook
    fastify.post(
        "/whatsapp/webhook",
        {
            schema: {
                tags: ["integrations"],
            },
        },
        async () => {
            return { message: "WhatsApp webhook - em desenvolvimento" };
        }
    );

    // GET /api/integrations/whatsapp/status
    fastify.get(
        "/whatsapp/status",
        {
            schema: {
                tags: ["integrations"],
            },
        },
        async () => {
            return { message: "Status WhatsApp - em desenvolvimento" };
        }
    );
};
