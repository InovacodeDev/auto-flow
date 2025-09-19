import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { BrazilianWorkflowTemplateManager } from "../core/engine/templates/BrazilianWorkflowTemplateManager";

const templateManager = new BrazilianWorkflowTemplateManager();

export async function workflowBuilderRoutes(fastify: FastifyInstance) {
    // Lista todos os templates (usa searchTemplates sem filtros)
    fastify.get("/api/workflows/templates", async (_request: FastifyRequest, reply: FastifyReply) => {
        try {
            const templates = templateManager.searchTemplates({});
            return reply.send(templates);
        } catch (err) {
            fastify.log.error(err);
            return reply.status(500).send({ error: "Erro ao listar templates" });
        }
    });

    // Pega um template por id
    fastify.get(
        "/api/workflows/templates/:id",
        async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
            try {
                const { id } = request.params;
                const template = templateManager.getTemplate(id);
                if (!template) {
                    return reply.status(404).send({ error: "Template não encontrado" });
                }
                return reply.send(template);
            } catch (err) {
                fastify.log.error(err);
                return reply.status(500).send({ error: "Erro ao obter template" });
            }
        }
    );

    // Instancia um template para a organização/usuário
    fastify.post(
        "/api/workflows/templates/:id/instantiate",
        async (
            request: FastifyRequest<{
                Params: { id: string };
                Body: { organizationId: string; userId: string; customizations?: any };
            }>,
            reply: FastifyReply
        ) => {
            try {
                const { id } = request.params;
                const { organizationId, userId, customizations } = request.body;
                const workflow = templateManager.instantiateTemplate(id, organizationId, userId, customizations);
                return reply.status(201).send({ workflow });
            } catch (err: any) {
                fastify.log.error(err);
                if (err.message && err.message.includes("Template não encontrado")) {
                    return reply.status(404).send({ error: err.message });
                }
                return reply.status(500).send({ error: "Erro ao instanciar template" });
            }
        }
    );
}

export default workflowBuilderRoutes;
