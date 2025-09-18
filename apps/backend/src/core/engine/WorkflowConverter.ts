import {
    WorkflowDefinition,
    WorkflowNode as EngineNode,
    TriggerConfig,
    TriggerType,
    NodeInput,
    NodeOutput,
} from "../engine/types";

// Tipos dos nodes salvos no banco
interface DatabaseWorkflow {
    id: string;
    name: string;
    description?: string | null;
    organizationId: string;
    status: string;
    version: number;
    nodes: DatabaseNode[];
    edges: DatabaseEdge[];
}

interface DatabaseNode {
    id: string;
    type: "trigger" | "action" | "condition" | "utility";
    nodeType: string;
    position: { x: number; y: number };
    data: {
        name: string;
        nodeType: string;
        description?: string;
        config?: Record<string, any>;
        [key: string]: any;
    };
}

interface DatabaseEdge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
    type?: string | null;
    data?: Record<string, any>;
}

/**
 * Converte um workflow salvo no banco para o formato do WorkflowEngine
 */
export class WorkflowConverter {
    /**
     * Converte workflow do banco para WorkflowDefinition
     */
    static convertToEngineFormat(dbWorkflow: DatabaseWorkflow): WorkflowDefinition {
        // Extrair triggers dos nodes
        const triggers = this.extractTriggers(dbWorkflow.nodes);

        // Converter nodes (excluindo triggers)
        const engineNodes = this.convertNodes(dbWorkflow.nodes.filter((node) => node.type !== "trigger"));

        return {
            id: dbWorkflow.id,
            name: dbWorkflow.name,
            description: dbWorkflow.description || "",
            organizationId: dbWorkflow.organizationId,
            version: dbWorkflow.version,
            status: this.convertStatus(dbWorkflow.status),
            triggers,
            nodes: engineNodes,
            metadata: {
                convertedFromVisualConstructor: true,
                originalNodeCount: dbWorkflow.nodes.length,
                conversionTimestamp: new Date().toISOString(),
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: "system",
        };
    }

    /**
     * Extrai triggers dos nodes do tipo 'trigger'
     */
    private static extractTriggers(nodes: DatabaseNode[]): TriggerConfig[] {
        const triggerNodes = nodes.filter((node) => node.type === "trigger");

        return triggerNodes.map((node) => this.convertTriggerNode(node));
    }

    /**
     * Converte um node trigger para TriggerConfig
     */
    private static convertTriggerNode(node: DatabaseNode): TriggerConfig {
        const config = node.data.config || {};

        switch (node.data.nodeType) {
            case "webhook_trigger":
                const webhookConfig: TriggerConfig = {
                    type: "webhook" as TriggerType,
                    config: {
                        nodeId: node.id,
                        nodeName: node.data.name,
                    },
                    enabled: true,
                };

                if (config["method"] || config["authentication"]) {
                    webhookConfig.webhook = {
                        method: (config["method"] as "GET" | "POST" | "PUT" | "DELETE") || "POST",
                        path: `/webhook/${node.id}`,
                    };

                    if (config["authentication"]) {
                        webhookConfig.webhook.authentication = {
                            type: config["authentication"] as "bearer" | "basic" | "api-key",
                            config: {},
                        };
                    }
                }

                return webhookConfig;

            case "schedule_trigger":
                const scheduleConfig: TriggerConfig = {
                    type: "schedule" as TriggerType,
                    config: {
                        nodeId: node.id,
                        nodeName: node.data.name,
                    },
                    enabled: true,
                };

                if (config["cron"] || config["timezone"]) {
                    scheduleConfig.schedule = {
                        cron: (config["cron"] as string) || "0 9 * * *",
                        timezone: (config["timezone"] as string) || "America/Sao_Paulo",
                        enabled: true,
                    };
                }

                return scheduleConfig;

            case "manual_trigger":
                const manualConfig: TriggerConfig = {
                    type: "manual" as TriggerType,
                    config: {
                        nodeId: node.id,
                        nodeName: node.data.name,
                    },
                    enabled: true,
                };

                if (config["requireConfirmation"] !== undefined || config["allowedRoles"]) {
                    manualConfig.manual = {
                        requireConfirmation: (config["requireConfirmation"] as boolean) ?? true,
                        allowedRoles: (config["allowedRoles"] as string[]) || ["admin", "user"],
                    };
                }

                return manualConfig;

            default:
                throw new Error(`Tipo de trigger não suportado: ${node.data.nodeType}`);
        }
    }

    /**
     * Converte nodes do banco para formato do engine
     */
    private static convertNodes(nodes: DatabaseNode[]): EngineNode[] {
        return nodes.map((node) => this.convertNode(node));
    }

    /**
     * Converte um node individual
     */
    private static convertNode(node: DatabaseNode): EngineNode {
        const config = node.data.config || {};

        // Gerar inputs e outputs baseados no tipo do node
        const { inputs, outputs } = this.generateNodeInputsOutputs(node.data.nodeType);

        return {
            id: node.id,
            type: node.data.nodeType,
            name: node.data.name,
            description: node.data.description || "",
            position: node.position,
            config: {
                ...config,
                originalType: node.type,
                originalNodeType: node.data.nodeType,
            },
            inputs,
            outputs,
            enabled: true,
        };
    }

    /**
     * Gera inputs e outputs para diferentes tipos de nodes
     */
    private static generateNodeInputsOutputs(nodeType: string): { inputs: NodeInput[]; outputs: NodeOutput[] } {
        switch (nodeType) {
            case "send_email":
                return {
                    inputs: [
                        { name: "to", type: "string", required: true, description: "Email do destinatário" },
                        { name: "subject", type: "string", required: true, description: "Assunto do email" },
                        { name: "body", type: "string", required: true, description: "Corpo do email" },
                        { name: "from", type: "string", required: false, description: "Email do remetente" },
                    ],
                    outputs: [
                        { name: "messageId", type: "string", description: "ID da mensagem enviada" },
                        { name: "status", type: "string", description: "Status do envio" },
                    ],
                };

            case "http_request":
                return {
                    inputs: [
                        { name: "url", type: "string", required: true, description: "URL para requisição" },
                        { name: "method", type: "string", required: false, description: "Método HTTP" },
                        { name: "headers", type: "object", required: false, description: "Headers da requisição" },
                        { name: "body", type: "object", required: false, description: "Corpo da requisição" },
                    ],
                    outputs: [
                        { name: "response", type: "object", description: "Resposta da requisição" },
                        { name: "status", type: "number", description: "Status code HTTP" },
                        { name: "headers", type: "object", description: "Headers da resposta" },
                    ],
                };

            case "delay":
                return {
                    inputs: [
                        { name: "duration", type: "number", required: true, description: "Duração em milissegundos" },
                    ],
                    outputs: [{ name: "completed", type: "boolean", description: "Indica se o delay foi concluído" }],
                };

            case "condition":
                return {
                    inputs: [
                        { name: "condition", type: "string", required: true, description: "Expressão de condição" },
                        { name: "input", type: "any", required: true, description: "Dados para avaliação" },
                    ],
                    outputs: [
                        { name: "result", type: "boolean", description: "Resultado da condição" },
                        { name: "value", type: "any", description: "Valor processado" },
                    ],
                };

            case "database_save":
                return {
                    inputs: [
                        { name: "table", type: "string", required: true, description: "Nome da tabela" },
                        { name: "data", type: "object", required: true, description: "Dados para salvar" },
                        { name: "operation", type: "string", required: false, description: "Tipo de operação" },
                    ],
                    outputs: [
                        { name: "id", type: "string", description: "ID do registro criado" },
                        { name: "affected", type: "number", description: "Número de registros afetados" },
                    ],
                };

            default:
                return {
                    inputs: [{ name: "input", type: "any", required: false, description: "Entrada genérica" }],
                    outputs: [{ name: "output", type: "any", description: "Saída genérica" }],
                };
        }
    }

    /**
     * Converte status do banco para formato do engine
     */
    private static convertStatus(status: string): "active" | "inactive" | "draft" {
        switch (status) {
            case "active":
                return "active";
            case "paused":
            case "archived":
                return "inactive";
            case "draft":
            default:
                return "draft";
        }
    }
}

export default WorkflowConverter;
