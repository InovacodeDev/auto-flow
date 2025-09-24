import { FastifyPluginAsync } from "fastify";
import { db } from "../core/database";
import {
    workflows,
    workflowNodes,
    workflowEdges,
    workflowExecutions,
    workflowExecutionLogs,
} from "../core/database/schema";
import { WorkflowEngine } from "../core/engine/WorkflowEngine";
import { AuthMiddleware } from "../auth/AuthMiddleware";
import { WorkflowDefinition } from "../core/engine/types";
import WorkflowConverter from "../core/engine/WorkflowConverter";
import { eq, desc, and, sql } from "drizzle-orm";
import { z } from "zod";

// Initialize workflow engine instance
const workflowEngine = new WorkflowEngine();
// Auth middleware
const authMiddleware = new AuthMiddleware();

export const workflowRoutes: FastifyPluginAsync = async (fastify) => {
    // Zod schemas
    const createWorkflowSchema = z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        triggers: z.array(z.any()),
        actions: z.array(z.any()),
        conditions: z.array(z.any()).optional(),
        metadata: z.record(z.any()).optional(),
    });

    const updateWorkflowSchema = z.object({
        name: z.string().min(1),
        description: z.string().optional(),
    });

    const canvasSaveSchema = z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        canvasData: z.record(z.any()).optional(),
        nodes: z.array(z.any()),
        edges: z.array(z.any()),
    });
    // GET /api/workflows - List workflows for organization
    fastify.get(
        "/",
        {
            preHandler: authMiddleware.requireUser(),
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
                                        isTemplate: { type: "boolean" },
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
        async (request) => {
            // Extract organizationId from JWT token (Fastify jwt stores payload in request.user)
            const user = (request as any).user as any;
            const organizationId = user?.organizationId || process.env["DEV_ORG_ID"] || "temp-org-id";

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
        async (request, reply) => {
            const parsed = createWorkflowSchema.safeParse(request.body);
            if (!parsed.success) {
                return reply.status(400).send({ error: "INVALID_PAYLOAD", message: parsed.error.message });
            }

            const { name, description, triggers, actions, conditions = [], metadata = {} } = parsed.data as any;

            const user = (request as any).user as any;
            const organizationId = user?.organizationId || process.env["DEV_ORG_ID"] || "temp-org-id";
            const userId = user?.userId || process.env["DEV_USER_ID"] || "temp-user-id";

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
                const workflowData: WorkflowDefinition = {
                    id: newWorkflow.id,
                    name: newWorkflow.name,
                    organizationId: newWorkflow.organizationId,
                    version: 1,
                    status: "active",
                    triggers: newWorkflow.triggers ? (newWorkflow.triggers as any) : [],
                    nodes: [],
                    description: "",
                    variables: {},
                    createdBy: "system",
                    createdAt: new Date(),
                    updatedAt: new Date(),
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
        async (request, reply) => {
            const user = (request as any).user as any;
            const organizationId = user?.organizationId || process.env["DEV_ORG_ID"] || "temp-org-id";
            const { id } = request.params as { id: string };

            const [wf] = await db
                .select()
                .from(workflows)
                .where(and(eq(workflows.id, id), eq(workflows.organizationId, organizationId)))
                .limit(1);

            if (!wf) {
                return reply.status(404).send({ error: "NOT_FOUND", message: "Workflow not found" });
            }

            return reply.status(200).send({ workflow: wf });
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
        async (request, reply) => {
            const parsed = updateWorkflowSchema.safeParse(request.body);
            if (!parsed.success) {
                return reply.status(400).send({ error: "INVALID_PAYLOAD", message: parsed.error.message });
            }

            const user = (request as any).user as any;
            const organizationId = user?.organizationId || process.env["DEV_ORG_ID"] || "temp-org-id";
            const { id } = request.params as { id: string };
            const body = parsed.data as any;

            const [updated] = await db
                .update(workflows)
                .set({ name: body.name, description: body.description, updatedAt: new Date() })
                .where(and(eq(workflows.id, id), eq(workflows.organizationId, organizationId)))
                .returning();

            if (!updated) {
                return reply.status(404).send({ error: "NOT_FOUND", message: "Workflow not found or access denied" });
            }

            return reply.status(200).send({ workflow: updated });
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
        async (request, reply) => {
            const user = (request as any).user as any;
            const organizationId = user?.organizationId || process.env["DEV_ORG_ID"] || "temp-org-id";
            const { id } = request.params as { id: string };

            const result = await db
                .delete(workflows)
                .where(and(eq(workflows.id, id), eq(workflows.organizationId, organizationId)));

            // Drizzle returns number of deleted rows in different shapes; attempt to read common properties
            const deletedCount =
                (result as any)?.rowCount ?? (result as any)?.length ?? (result as any)?.affectedRows ?? 0;

            return reply.status(200).send({ deleted: deletedCount });
        }
    );

    // POST /api/workflows/:id/execute
    fastify.post(
        "/:id/execute",
        {
            schema: {
                tags: ["workflows"],
                description: "Execute a workflow",
                security: [{ bearerAuth: [] }],
                params: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                    },
                    required: ["id"],
                },
                body: {
                    type: "object",
                    properties: {
                        triggerData: { type: "object" },
                        triggerType: { type: "string", enum: ["manual", "webhook", "schedule"] },
                    },
                    additionalProperties: false,
                },
                response: {
                    200: {
                        type: "object",
                        properties: {
                            executionId: { type: "string" },
                            status: { type: "string" },
                            message: { type: "string" },
                        },
                    },
                    404: {
                        type: "object",
                        properties: {
                            error: { type: "string" },
                            message: { type: "string" },
                        },
                    },
                    400: {
                        type: "object",
                        properties: {
                            error: { type: "string" },
                            message: { type: "string" },
                        },
                    },
                },
            },
        },
        async (request, reply) => {
            try {
                const { id } = request.params as { id: string };
                const { triggerData = {} } = request.body as {
                    triggerData?: any;
                };

                // TODO: Extract organizationId from JWT token
                const organizationId = "temp-org-id";

                // Buscar workflow completo com nodes e edges
                const workflow = await db
                    .select()
                    .from(workflows)
                    .where(and(eq(workflows.id, id), eq(workflows.organizationId, organizationId)))
                    .limit(1);

                if (workflow.length === 0) {
                    return reply.status(404).send({
                        error: "NOT_FOUND",
                        message: "Workflow não encontrado",
                    });
                }

                const workflowData = workflow[0];

                // Verificar se o workflow está ativo
                if (workflowData.status !== "active") {
                    return reply.status(400).send({
                        error: "WORKFLOW_INACTIVE",
                        message: "Apenas workflows ativos podem ser executados",
                    });
                }

                // Buscar nodes do workflow
                const nodes = await db.select().from(workflowNodes).where(eq(workflowNodes.workflowId, id));

                // Buscar edges do workflow
                const edges = await db.select().from(workflowEdges).where(eq(workflowEdges.workflowId, id));

                // Converter para formato do engine
                const dbWorkflowWithVisualData = {
                    id: workflowData.id,
                    name: workflowData.name,
                    description: workflowData.description || null,
                    organizationId: workflowData.organizationId,
                    status: workflowData.status,
                    version: workflowData.version,
                    nodes: nodes.map((node) => ({
                        id: node.id,
                        type: node.type as "trigger" | "action" | "condition" | "utility",
                        nodeType: node.nodeType,
                        position: node.position as { x: number; y: number },
                        data: {
                            name: (node.data as any)?.name || node.nodeType,
                            nodeType: node.nodeType,
                            description: (node.data as any)?.description,
                            config: (node.data as any)?.config || {},
                            ...(node.data as any),
                        },
                    })),
                    edges: edges.map((edge) => ({
                        id: edge.id,
                        source: edge.source,
                        target: edge.target,
                        sourceHandle: edge.sourceHandle,
                        targetHandle: edge.targetHandle,
                        type: edge.type,
                        data: edge.data as Record<string, any>,
                    })),
                };

                // Converter para formato do WorkflowEngine
                const engineWorkflow = WorkflowConverter.convertToEngineFormat(dbWorkflowWithVisualData);

                // Registrar workflow no engine
                await workflowEngine.registerWorkflow(engineWorkflow);
                fastify.log.info(`Workflow ${engineWorkflow.id} registrado no engine`);

                // Executar workflow
                const executionId = await workflowEngine.executeWorkflow(
                    engineWorkflow.id,
                    triggerData,
                    "temp-user-id" // TODO: Extract from JWT
                );

                fastify.log.info(`Workflow ${engineWorkflow.id} iniciado. Execution ID: ${executionId}`);

                return {
                    executionId,
                    status: "started",
                    message: "Workflow iniciado com sucesso",
                };
            } catch (error) {
                fastify.log.error(`Erro ao executar workflow: ${error}`);
                return reply.status(500).send({
                    error: "EXECUTION_ERROR",
                    message: error instanceof Error ? error.message : "Erro interno do servidor",
                });
            }
        }
    );

    // === VISUAL CONSTRUCTOR ENDPOINTS ===

    // GET /api/workflows/:id/canvas - Get workflow with visual data
    fastify.get(
        "/:id/canvas",
        {
            schema: {
                tags: ["workflows"],
                description: "Get workflow with visual constructor data (nodes and edges)",
                security: [{ bearerAuth: [] }],
                params: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                    },
                    required: ["id"],
                },
                response: {
                    200: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            name: { type: "string" },
                            description: { type: "string" },
                            status: { type: "string" },
                            canvasData: { type: "object" },
                            nodes: { type: "array" },
                            edges: { type: "array" },
                            version: { type: "number" },
                            createdAt: { type: "string" },
                            updatedAt: { type: "string" },
                        },
                    },
                },
            },
        },
        async (request) => {
            const { id } = request.params as { id: string };

            // TODO: Extract organizationId from JWT token
            const organizationId = "temp-org-id";

            // Get workflow
            const [workflow] = await db
                .select()
                .from(workflows)
                .where(and(eq(workflows.id, id), eq(workflows.organizationId, organizationId)));

            if (!workflow) {
                throw new Error("Workflow not found");
            }

            // Get nodes
            const nodes = await db.select().from(workflowNodes).where(eq(workflowNodes.workflowId, id));

            // Get edges
            const edges = await db.select().from(workflowEdges).where(eq(workflowEdges.workflowId, id));

            return {
                ...workflow,
                nodes,
                edges,
            };
        }
    );

    // PUT /api/workflows/:id/canvas - Save workflow with visual data
    fastify.put(
        "/:id/canvas",
        {
            schema: {
                tags: ["workflows"],
                description: "Save workflow with visual constructor data",
                security: [{ bearerAuth: [] }],
                params: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                    },
                    required: ["id"],
                },
                body: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        description: { type: "string" },
                        canvasData: { type: "object" },
                        nodes: { type: "array" },
                        edges: { type: "array" },
                    },
                    required: ["name", "nodes", "edges"],
                },
            },
        },
        async (request) => {
            const { id } = request.params as { id: string };
            const { name, description, canvasData = {}, nodes, edges } = request.body as any;

            // TODO: Extract organizationId from JWT token
            const organizationId = "temp-org-id";

            // Start transaction
            return await db.transaction(async (tx) => {
                // Update workflow
                const [updatedWorkflow] = await tx
                    .update(workflows)
                    .set({
                        name,
                        description,
                        canvasData,
                        updatedAt: new Date(),
                    })
                    .where(and(eq(workflows.id, id), eq(workflows.organizationId, organizationId)))
                    .returning();

                if (!updatedWorkflow) {
                    throw new Error("Workflow not found");
                }

                // Delete existing nodes and edges
                await tx.delete(workflowNodes).where(eq(workflowNodes.workflowId, id));
                await tx.delete(workflowEdges).where(eq(workflowEdges.workflowId, id));

                // Insert new nodes
                if (nodes.length > 0) {
                    await tx.insert(workflowNodes).values(
                        nodes.map((node: any) => ({
                            id: node.id,
                            workflowId: id,
                            type: node.type,
                            nodeType: node.data?.nodeType || "unknown",
                            position: node.position,
                            data: node.data,
                            style: node.style || {},
                        }))
                    );
                }

                // Insert new edges
                if (edges.length > 0) {
                    await tx.insert(workflowEdges).values(
                        edges.map((edge: any) => ({
                            id: edge.id,
                            workflowId: id,
                            source: edge.source,
                            target: edge.target,
                            sourceHandle: edge.sourceHandle,
                            targetHandle: edge.targetHandle,
                            type: edge.type || "default",
                            data: edge.data || {},
                            style: edge.style || {},
                            animated: edge.animated || false,
                        }))
                    );
                }

                return {
                    ...updatedWorkflow,
                    nodes,
                    edges,
                };
            });
        }
    );

    // POST /api/workflows/canvas - Create new workflow with visual data
    fastify.post(
        "/canvas",
        {
            schema: {
                tags: ["workflows"],
                description: "Create new workflow with visual constructor data",
                security: [{ bearerAuth: [] }],
                body: {
                    type: "object",
                    properties: {
                        name: { type: "string" },
                        description: { type: "string" },
                        canvasData: { type: "object" },
                        nodes: { type: "array" },
                        edges: { type: "array" },
                    },
                    required: ["name"],
                },
            },
        },
        async (request) => {
            const { name, description, canvasData = {}, nodes = [], edges = [] } = request.body as any;

            // TODO: Extract organizationId and userId from JWT token
            const organizationId = "temp-org-id";
            const userId = "temp-user-id";

            // Start transaction
            return await db.transaction(async (tx) => {
                // Create workflow
                const [newWorkflow] = await tx
                    .insert(workflows)
                    .values({
                        organizationId,
                        createdBy: userId,
                        name,
                        description,
                        canvasData,
                        status: "draft",
                    })
                    .returning();

                // Insert nodes
                if (nodes.length > 0) {
                    await tx.insert(workflowNodes).values(
                        nodes.map((node: any) => ({
                            id: node.id,
                            workflowId: newWorkflow.id,
                            type: node.type,
                            nodeType: node.data?.nodeType || "unknown",
                            position: node.position,
                            data: node.data,
                            style: node.style || {},
                        }))
                    );
                }

                // Insert edges
                if (edges.length > 0) {
                    await tx.insert(workflowEdges).values(
                        edges.map((edge: any) => ({
                            id: edge.id,
                            workflowId: newWorkflow.id,
                            source: edge.source,
                            target: edge.target,
                            sourceHandle: edge.sourceHandle,
                            targetHandle: edge.targetHandle,
                            type: edge.type || "default",
                            data: edge.data || {},
                            style: edge.style || {},
                            animated: edge.animated || false,
                        }))
                    );
                }

                return {
                    ...newWorkflow,
                    nodes,
                    edges,
                };
            });
        }
    );

    // === EXECUTION ENDPOINTS ===

    // GET /api/workflows/:id/executions - List executions for workflow
    fastify.get(
        "/:id/executions",
        {
            schema: {
                tags: ["workflows"],
                description: "List executions for a workflow",
                security: [{ bearerAuth: [] }],
                params: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                    },
                    required: ["id"],
                },
                querystring: {
                    type: "object",
                    properties: {
                        limit: { type: "number", default: 50 },
                        offset: { type: "number", default: 0 },
                        status: { type: "string" },
                    },
                },
                response: {
                    200: {
                        type: "object",
                        properties: {
                            executions: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        id: { type: "string" },
                                        status: { type: "string" },
                                        startedAt: { type: "string" },
                                        completedAt: { type: "string" },
                                        duration: { type: "number" },
                                        errorMessage: { type: "string" },
                                    },
                                },
                            },
                            total: { type: "number" },
                        },
                    },
                },
            },
        },
        async (request) => {
            const { id } = request.params as { id: string };
            const { limit = 50, offset = 0, status } = request.query as any;

            // TODO: Extract organizationId from JWT token
            const organizationId = "temp-org-id";

            // Base query
            let query = db
                .select({
                    id: workflowExecutions.id,
                    status: workflowExecutions.status,
                    startedAt: workflowExecutions.startedAt,
                    completedAt: workflowExecutions.completedAt,
                    duration: workflowExecutions.duration,
                    errorMessage: workflowExecutions.errorMessage,
                })
                .from(workflowExecutions)
                .where(
                    and(eq(workflowExecutions.workflowId, id), eq(workflowExecutions.organizationId, organizationId))
                );

            // Add status filter if provided
            if (status) {
                query = query.where(
                    and(
                        eq(workflowExecutions.workflowId, id),
                        eq(workflowExecutions.organizationId, organizationId),
                        eq(workflowExecutions.status, status)
                    )
                );
            }

            // Get executions with pagination
            const executions = await query.orderBy(desc(workflowExecutions.startedAt)).limit(limit).offset(offset);

            // Get total count
            const totalResult = await db
                .select({ count: sql<number>`count(*)` })
                .from(workflowExecutions)
                .where(
                    and(
                        eq(workflowExecutions.workflowId, id),
                        eq(workflowExecutions.organizationId, organizationId),
                        ...(status ? [eq(workflowExecutions.status, status)] : [])
                    )
                );

            return {
                executions,
                total: totalResult[0]?.count || 0,
            };
        }
    );

    // GET /api/workflows/executions/:executionId/logs - Get logs for execution
    fastify.get(
        "/executions/:executionId/logs",
        {
            schema: {
                tags: ["workflows"],
                description: "Get logs for a workflow execution",
                security: [{ bearerAuth: [] }],
                params: {
                    type: "object",
                    properties: {
                        executionId: { type: "string" },
                    },
                    required: ["executionId"],
                },
                querystring: {
                    type: "object",
                    properties: {
                        limit: { type: "number", default: 100 },
                        offset: { type: "number", default: 0 },
                        level: { type: "string" },
                        nodeId: { type: "string" },
                    },
                },
                response: {
                    200: {
                        type: "object",
                        properties: {
                            logs: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        id: { type: "string" },
                                        nodeId: { type: "string" },
                                        level: { type: "string" },
                                        component: { type: "string" },
                                        message: { type: "string" },
                                        data: { type: "object" },
                                        timestamp: { type: "string" },
                                    },
                                },
                            },
                            total: { type: "number" },
                        },
                    },
                },
            },
        },
        async (request) => {
            const { executionId } = request.params as { executionId: string };
            const { limit = 100, offset = 0, level, nodeId } = request.query as any;

            // Build query conditions
            const conditions = [eq(workflowExecutionLogs.executionId, executionId)];

            if (level) {
                conditions.push(eq(workflowExecutionLogs.level, level));
            }

            if (nodeId) {
                conditions.push(eq(workflowExecutionLogs.nodeId, nodeId));
            }

            // Get logs with pagination
            const logs = await db
                .select({
                    id: workflowExecutionLogs.id,
                    nodeId: workflowExecutionLogs.nodeId,
                    level: workflowExecutionLogs.level,
                    component: workflowExecutionLogs.component,
                    message: workflowExecutionLogs.message,
                    data: workflowExecutionLogs.data,
                    timestamp: workflowExecutionLogs.timestamp,
                })
                .from(workflowExecutionLogs)
                .where(and(...conditions))
                .orderBy(workflowExecutionLogs.timestamp)
                .limit(limit)
                .offset(offset);

            // Get total count
            const totalResult = await db
                .select({ count: sql<number>`count(*)` })
                .from(workflowExecutionLogs)
                .where(and(...conditions));

            return {
                logs,
                total: totalResult[0]?.count || 0,
            };
        }
    );

    // GET /api/workflows/queue/stats - Queue statistics
    fastify.get(
        "/queue/stats",
        {
            schema: {
                tags: ["workflows"],
                description: "Get queue statistics",
                security: [{ bearerAuth: [] }],
                response: {
                    200: {
                        type: "object",
                        properties: {
                            queueType: { type: "string" },
                            stats: {
                                type: "object",
                                properties: {
                                    waiting: { type: "number" },
                                    active: { type: "number" },
                                    completed: { type: "number" },
                                    failed: { type: "number" },
                                    delayed: { type: "number" },
                                },
                            },
                            engineMetrics: {
                                type: "object",
                                properties: {
                                    totalExecutions: { type: "number" },
                                    successfulExecutions: { type: "number" },
                                    failedExecutions: { type: "number" },
                                    currentConcurrentExecutions: { type: "number" },
                                },
                            },
                        },
                    },
                },
            },
        },
        async (_request) => {
            try {
                const engineMetrics = workflowEngine.getMetrics();

                // Se usando Redis Queue, obter estatísticas
                let queueStats = null;
                let queueType = "memory";

                // @ts-expect-error - Accessing private property for demonstration
                if (workflowEngine.workflowQueue) {
                    try {
                        // @ts-expect-error - accessing property for debug output
                        queueStats = await workflowEngine.workflowQueue.getStats();
                        queueType = "redis";
                    } catch (error) {
                        fastify.log.warn(`Failed to get Redis queue stats: ${error}`);
                    }
                }

                return {
                    queueType,
                    stats: queueStats || {
                        waiting: engineMetrics.queueSize,
                        active: engineMetrics.currentConcurrentExecutions,
                        completed: engineMetrics.successfulExecutions,
                        failed: engineMetrics.failedExecutions,
                        delayed: 0,
                    },
                    engineMetrics: {
                        totalExecutions: engineMetrics.totalExecutions,
                        successfulExecutions: engineMetrics.successfulExecutions,
                        failedExecutions: engineMetrics.failedExecutions,
                        currentConcurrentExecutions: engineMetrics.currentConcurrentExecutions,
                    },
                };
            } catch (error) {
                fastify.log.error(`Error getting queue stats: ${error}`);
                throw new Error("Failed to get queue statistics");
            }
        }
    );
};
