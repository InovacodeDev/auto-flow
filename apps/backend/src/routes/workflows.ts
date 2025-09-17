import { FastifyPluginAsync } from "fastify";
import { db } from "../core/database";
import { workflows } from "../core/database/schema";
import { WorkflowEngine } from "../core/engine/WorkflowEngine";
import { eq, desc } from "drizzle-orm";

// Initialize workflow engine instance
const workflowEngine = new WorkflowEngine();

export const workflowRoutes: FastifyPluginAsync = async (fastify) => {
    // GET /api/workflows - List workflows for organization
    fastify.get(
        "/",
        {
            schema: {
                tags: ["workflows"],
                description: "List all workflows for the organization",
                security: [{ bearerAuth: [] }],
                response: {
                    200: {
                        type: "object",
                        properties: {
                            workflows: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        id: { type: "string" },
                                        name: { type: "string" },
                                        description: { type: "string" },
                                        status: { type: "string" },
                                        createdAt: { type: "string" },
                                        updatedAt: { type: "string" },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        async (_request) => {
            // TODO: Extract organizationId from JWT token
            const organizationId = "temp-org-id";

            const orgWorkflows = await db
                .select({
                    id: workflows.id,
                    name: workflows.name,
                    description: workflows.description,
                    status: workflows.status,
                    isTemplate: workflows.isTemplate,
                    createdAt: workflows.createdAt,
                    updatedAt: workflows.updatedAt,
                })
                .from(workflows)
                .where(eq(workflows.organizationId, organizationId))
                .orderBy(desc(workflows.updatedAt));

            return { workflows: orgWorkflows };
        }
    );

    // POST /api/workflows - Create new workflow
    fastify.post(
        "/",
        {
            schema: {
                tags: ["workflows"],
                description: "Create a new workflow",
                security: [{ bearerAuth: [] }],
                body: {
                    type: "object",
                    required: ["name", "triggers", "actions"],
                    properties: {
                        name: { type: "string" },
                        description: { type: "string" },
                        triggers: { type: "array" },
                        actions: { type: "array" },
                        conditions: { type: "array" },
                        metadata: { type: "object" },
                    },
                },
            },
        },
        async (request) => {
            const { name, description, triggers, actions, conditions = [], metadata = {} } = request.body as any;

            // TODO: Extract organizationId and userId from JWT token
            const organizationId = "temp-org-id";
            const userId = "temp-user-id";

            // Create workflow in database
            const [newWorkflow] = await db
                .insert(workflows)
                .values({
                    organizationId,
                    createdBy: userId,
                    name,
                    description,
                    triggers,
                    actions,
                    conditions,
                    metadata: {
                        ...metadata,
                        language: "pt-BR",
                        createdBy: userId,
                    },
                    status: "draft",
                })
                .returning();

            // Register with workflow engine if active
            if (newWorkflow.status === "active") {
                const workflowData = {
                    id: newWorkflow.id,
                    name: newWorkflow.name,
                    triggers: newWorkflow.triggers as any,
                    actions: newWorkflow.actions as any,
                    conditions: newWorkflow.conditions as any,
                    metadata: newWorkflow.metadata as any,
                };

                await workflowEngine.registerWorkflow(workflowData);
            }

            return { workflow: newWorkflow, message: "Workflow criado com sucesso" };
        }
    );

    // GET /api/workflows/:id
    fastify.get(
        "/:id",
        {
            schema: {
                tags: ["workflows"],
            },
        },
        async () => {
            return { message: "Detalhes do workflow - em desenvolvimento" };
        }
    );

    // PUT /api/workflows/:id
    fastify.put(
        "/:id",
        {
            schema: {
                tags: ["workflows"],
            },
        },
        async () => {
            return { message: "Atualizar workflow - em desenvolvimento" };
        }
    );

    // DELETE /api/workflows/:id
    fastify.delete(
        "/:id",
        {
            schema: {
                tags: ["workflows"],
            },
        },
        async () => {
            return { message: "Deletar workflow - em desenvolvimento" };
        }
    );

    // POST /api/workflows/:id/execute
    fastify.post(
        "/:id/execute",
        {
            schema: {
                tags: ["workflows"],
            },
        },
        async () => {
            return { message: "Executar workflow - em desenvolvimento" };
        }
    );
};
