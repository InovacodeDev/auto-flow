import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { AIConversationalService } from "../ai/AIConversationalService";

// Request/Response types
interface StartConversationRequest {
    userId: string;
    organizationId: string;
    industry?: string;
}

interface ProcessMessageRequest {
    sessionId: string;
    message: string;
}

interface GetSuggestionsRequest {
    sessionId: string;
    type: "workflow" | "integration" | "optimization";
}

interface WorkflowGenerationRequest {
    prompt: string;
    organizationId: string;
    userId: string;
    context?: {
        industry?: string;
        existingWorkflows?: string[];
        integrations?: string[];
    };
}

// Global AI service instance
const aiService = new AIConversationalService();

// Event listeners for AI service (placeholder)
// TODO: Implement proper event handling when AIConversationalService supports events

export async function aiRoutes(fastify: FastifyInstance) {
    // Start new conversation
    fastify.post<{ Body: StartConversationRequest }>(
        "/start-conversation",
        {
            schema: {
                body: {
                    type: "object",
                    required: ["userId", "organizationId"],
                    properties: {
                        userId: { type: "string" },
                        organizationId: { type: "string" },
                        industry: { type: "string" },
                    },
                },
                response: {
                    200: {
                        type: "object",
                        properties: {
                            sessionId: { type: "string" },
                            message: { type: "string" },
                        },
                    },
                },
            },
        },
        async (request: FastifyRequest<{ Body: StartConversationRequest }>, reply: FastifyReply) => {
            try {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { userId, organizationId, industry } = request.body;

                // Initialize conversation with AI service
                const suggestions = await aiService.getIntelligentSuggestions(userId);
                const sessionId = `conv_${userId}_${Date.now()}`;

                return reply.send({
                    sessionId,
                    message: `Olá! Sou o Alex, seu assistente de automação. Como posso ajudá-lo a otimizar seus processos hoje?`,
                    suggestions,
                });
            } catch (error) {
                console.error("Error starting conversation:", error);
                return reply.status(500).send({
                    error: "Failed to start conversation",
                    message: "Não foi possível iniciar a conversa. Tente novamente.",
                });
            }
        }
    );

    // Process user message
    fastify.post<{ Body: ProcessMessageRequest }>(
        "/message",
        {
            schema: {
                body: {
                    type: "object",
                    required: ["sessionId", "message"],
                    properties: {
                        sessionId: { type: "string" },
                        message: { type: "string", minLength: 1 },
                    },
                },
                response: {
                    200: {
                        type: "object",
                        properties: {
                            id: { type: "string" },
                            role: { type: "string" },
                            content: { type: "string" },
                            timestamp: { type: "string" },
                            metadata: {
                                type: "object",
                                properties: {
                                    workflowGenerated: { type: "boolean" },
                                    suggestionType: { type: "string" },
                                },
                            },
                        },
                    },
                },
            },
        },
        async (request: FastifyRequest<{ Body: ProcessMessageRequest }>, reply: FastifyReply) => {
            try {
                const { sessionId, message } = request.body;

                // Extract userId from sessionId (format: conv_userId_timestamp)
                const userId = sessionId.split("_")[1] || sessionId;

                const response = await aiService.processMessage(userId, message);

                return reply.send({
                    id: `msg_${Date.now()}`,
                    role: "assistant",
                    content: response.message,
                    timestamp: new Date().toISOString(),
                    metadata: {
                        workflowGenerated: !!response.workflowGenerated,
                        confidence: response.confidence,
                        suggestions: response.suggestions,
                        nextSteps: response.nextSteps,
                    },
                });
            } catch (error) {
                console.error("Error processing message:", error);
                return reply.status(500).send({
                    error: "Failed to process message",
                    message: "Não foi possível processar sua mensagem. Tente novamente.",
                });
            }
        }
    );

    // Generate workflow from natural language
    fastify.post<{ Body: WorkflowGenerationRequest }>(
        "/generate-workflow",
        {
            schema: {
                body: {
                    type: "object",
                    required: ["prompt", "organizationId", "userId"],
                    properties: {
                        prompt: { type: "string", minLength: 1 },
                        organizationId: { type: "string" },
                        userId: { type: "string" },
                        context: {
                            type: "object",
                            properties: {
                                industry: { type: "string" },
                                existingWorkflows: {
                                    type: "array",
                                    items: { type: "string" },
                                },
                                integrations: {
                                    type: "array",
                                    items: { type: "string" },
                                },
                            },
                        },
                    },
                },
            },
        },
        async (request: FastifyRequest<{ Body: WorkflowGenerationRequest }>, reply: FastifyReply) => {
            try {
                const { prompt, organizationId, userId, context } = request.body;

                // Start a temporary session for workflow generation
                const sessionId = await aiService.startConversation(userId, organizationId, context?.industry);

                // Generate workflow
                const response = await aiService.generateWorkflowFromPrompt(sessionId, prompt);

                // Clean up session
                aiService.endConversation(sessionId);

                return reply.send({
                    workflow: response,
                    message: "Workflow gerado com sucesso!",
                });
            } catch (error) {
                console.error("Error generating workflow:", error);
                return reply.status(500).send({
                    error: "Failed to generate workflow",
                    message: "Não foi possível gerar o workflow. Verifique sua solicitação e tente novamente.",
                });
            }
        }
    );

    // Get intelligent suggestions
    fastify.post<{ Body: GetSuggestionsRequest }>(
        "/suggestions",
        {
            schema: {
                body: {
                    type: "object",
                    required: ["sessionId", "type"],
                    properties: {
                        sessionId: { type: "string" },
                        type: {
                            type: "string",
                            enum: ["workflow", "integration", "optimization"],
                        },
                    },
                },
                response: {
                    200: {
                        type: "object",
                        properties: {
                            suggestions: {
                                type: "array",
                                items: { type: "string" },
                            },
                        },
                    },
                },
            },
        },
        async (request: FastifyRequest<{ Body: GetSuggestionsRequest }>, reply: FastifyReply) => {
            try {
                const { sessionId, type } = request.body;

                const suggestions = await aiService.getSuggestions(sessionId, type);

                return reply.send({ suggestions });
            } catch (error) {
                console.error("Error getting suggestions:", error);
                return reply.status(500).send({
                    error: "Failed to get suggestions",
                    suggestions: [],
                });
            }
        }
    );

    // Health check for AI service
    fastify.get(
        "/health",
        {
            schema: {
                response: {
                    200: {
                        type: "object",
                        properties: {
                            status: { type: "string" },
                            aiService: { type: "string" },
                            openaiConfigured: { type: "boolean" },
                        },
                    },
                },
            },
        },
        async (_request: FastifyRequest, reply: FastifyReply) => {
            return reply.send({
                status: "healthy",
                aiService: "operational",
                openaiConfigured: !!process.env["OPENAI_API_KEY"],
            });
        }
    );
}
