import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import rateLimit from "@fastify/rate-limit";

import { authRoutes } from "./routes/auth";
import { workflowRoutes } from "./routes/workflows";
import { integrationRoutes } from "./routes/integrations";
import { aiRoutes } from "./routes/ai";
import { analyticsRoutes } from "./routes/analytics";
import whatsappRoutes from "./routes/whatsapp";
import pixRoutes from "./routes/pix";
import crmRoutes from "./routes/crm";

const server = Fastify({
    logger: process.env["NODE_ENV"] !== "production",
});

async function start() {
    try {
        // Register plugins
        await server.register(cors, {
            origin: process.env["FRONTEND_URL"] || "http://localhost:3000",
            credentials: true,
        });

        await server.register(jwt, {
            secret: process.env["JWT_SECRET"] || "supersecret",
        });

        await server.register(rateLimit, {
            max: 100,
            timeWindow: "1 minute",
        });

        // Swagger documentation
        await server.register(swagger, {
            swagger: {
                info: {
                    title: "AutoFlow API",
                    description: "API para automação de processos empresariais",
                    version: "1.0.0",
                },
                host: "localhost:3001",
                schemes: ["http", "https"],
                consumes: ["application/json"],
                produces: ["application/json"],
                tags: [
                    { name: "auth", description: "Authentication endpoints" },
                    { name: "workflows", description: "Workflow management" },
                    { name: "integrations", description: "Integration management" },
                    { name: "ai", description: "AI assistant endpoints" },
                    { name: "analytics", description: "Analytics and metrics" },
                    { name: "whatsapp", description: "WhatsApp Business API integration" },
                    { name: "pix", description: "PIX payment integration with Mercado Pago" },
                    { name: "crm", description: "CRM integrations (RD Station, Pipedrive, HubSpot)" },
                ],
            },
        });

        await server.register(swaggerUi, {
            routePrefix: "/docs",
            uiConfig: {
                docExpansion: "full",
                deepLinking: false,
            },
        });

        // Register routes
        await server.register(authRoutes, { prefix: "/api/auth" });
        await server.register(workflowRoutes, { prefix: "/api/workflows" });
        await server.register(integrationRoutes, { prefix: "/api/integrations" });
        await server.register(aiRoutes, { prefix: "/api/ai" });
        await server.register(analyticsRoutes, { prefix: "/api/analytics" });
        await server.register(whatsappRoutes, { prefix: "/api/whatsapp" });
        await server.register(pixRoutes, { prefix: "/api/pix" });
        await server.register(crmRoutes, { prefix: "/api/crm" });

        // Health check
        server.get("/health", async () => {
            return { status: "ok", timestamp: new Date().toISOString() };
        });

        const port = Number(process.env["PORT"]) || 3001;
        const host = process.env["HOST"] || "0.0.0.0";

        await server.listen({ port, host });
        server.log.info(`🚀 AutoFlow API running on http://${host}:${port}`);
        server.log.info(`📚 API Documentation: http://${host}:${port}/docs`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
}

start();
