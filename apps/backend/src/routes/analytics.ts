import { FastifyPluginAsync } from "fastify";

export const analyticsRoutes: FastifyPluginAsync = async (fastify) => {
    // GET /api/analytics/dashboard
    fastify.get(
        "/dashboard",
        {
            schema: {
                tags: ["analytics"],
            },
        },
        async () => {
            return {
                message: "Dashboard analytics - em desenvolvimento",
                data: {
                    totalWorkflows: 0,
                    executionsToday: 0,
                    timeSaved: 0,
                    roi: 0,
                },
            };
        }
    );

    // GET /api/analytics/workflows/:id/metrics
    fastify.get(
        "/workflows/:id/metrics",
        {
            schema: {
                tags: ["analytics"],
            },
        },
        async () => {
            return { message: "Métricas de workflow específico - em desenvolvimento" };
        }
    );

    // GET /api/analytics/roi-report
    fastify.get(
        "/roi-report",
        {
            schema: {
                tags: ["analytics"],
            },
        },
        async () => {
            return { message: "Relatório de ROI - em desenvolvimento" };
        }
    );
};
