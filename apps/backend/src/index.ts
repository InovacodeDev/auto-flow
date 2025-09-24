import dotenv from "dotenv";

// Carrega variáveis de ambiente
dotenv.config();

import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import swagger from "@fastify/swagger";
// import swaggerUi from "@fastify/swagger-ui";
import rateLimit from "@fastify/rate-limit";

import { authRoutes } from "./routes/auth";
import { workflowRoutes } from "./routes/workflows";
import workflowBuilderRoutes from "./routes/workflow-builder";
import { integrationRoutes } from "./routes/integrations";
import { aiRoutes } from "./routes/ai";
import { analyticsRoutes } from "./routes/analytics";
import whatsappRoutes from "./routes/whatsapp";
import pixRoutes from "./routes/pix";
import crmRoutes from "./routes/crm";
import erpRoutes from "./routes/erp";
import integrationsUnifiedRoutes from "./routes/integrations-unified";
import { executionRoutes } from "./routes/executions";

export function build(): FastifyInstance {
    const server = Fastify({
        logger: process.env["NODE_ENV"] !== "production",
    });

    // Register plugins and routes synchronously
    server.register(async function (fastify) {
        await fastify.register(cors, {
            origin: process.env["FRONTEND_URL"] || "http://localhost:3000",
            credentials: true,
        });

        await fastify.register(jwt, {
            secret: process.env["JWT_SECRET"] || "supersecret",
        });

        await fastify.register(rateLimit, {
            max: 100,
            timeWindow: "1 minute",
        });

        // Swagger documentation
        await fastify.register(swagger, {
            swagger: {
                info: {
                    title: "AutoFlow API",
                    description: "API for AutoFlow SaaS platform",
                    version: "1.0.0",
                },
                schemes: ["http", "https"],
                consumes: ["application/json"],
                produces: ["application/json"],
            },
        });

        // Temporarily disabled swagger-ui due to plugin error
        // await fastify.register(swaggerUi, {
        //     routePrefix: "/docs",
        //     uiConfig: {
        //         docExpansion: "full",
        //         deepLinking: false,
        //     },
        // });

        // Register routes
        await fastify.register(authRoutes, { prefix: "/api/auth" });
        await fastify.register(workflowRoutes, { prefix: "/api/workflows" });
        await fastify.register(workflowBuilderRoutes);
        await fastify.register(integrationRoutes, { prefix: "/api/integrations" });
        await fastify.register(aiRoutes, { prefix: "/api/ai" });
        await fastify.register(analyticsRoutes, { prefix: "/api/analytics" });
        await fastify.register(whatsappRoutes, { prefix: "/api/whatsapp" });
        await fastify.register(pixRoutes, { prefix: "/api/pix" });
        await fastify.register(crmRoutes, { prefix: "/api/crm" });
        await fastify.register(erpRoutes, { prefix: "/api/erp" });
        await fastify.register(integrationsUnifiedRoutes, { prefix: "/api/integrations-unified" });
        await fastify.register(executionRoutes, { prefix: "/api/executions" });

        // Health check
        fastify.get("/health", async () => {
            return { status: "ok", timestamp: new Date().toISOString() };
        });
    });

    return server;
}

async function start() {
    try {
        const server = build();
        await server.ready();

        const port = Number(process.env["PORT"]) || 3001;
        const host = process.env["HOST"] || "0.0.0.0";

        await server.listen({ port, host });
        server.log.info(`🚀 AutoFlow API running on http://${host}:${port}`);
        server.log.info(`📚 API Documentation: http://${host}:${port}/docs`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

// Only start the server if this file is run directly, not when imported
if (require.main === module) {
    start();
}
