import React, { useCallback, useState, useRef, useEffect } from "react";
import ReactFlow, {
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    Background,
    Connection,
    Controls,
    Edge,
    EdgeChange,
    Node,
    NodeChange,
    Panel,
    useReactFlow,
    ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";

import { WorkflowNode as WorkflowNodeType } from "../../types/workflow";
import { WorkflowNodeComponent } from "./WorkflowNodeComponent";
import { NodePalette } from "./NodePalette";
import { WorkflowPropertiesPanel } from "./WorkflowPropertiesPanel";
import { WorkflowToolbar } from "./WorkflowToolbar";

interface WorkflowBuilderProps {
    workflowId?: string;
    onSave?: (workflowData: any) => void;
    onTest?: (workflowData: any) => void;
    readOnly?: boolean;
}

const nodeTypes = {
    workflowNode: WorkflowNodeComponent,
};

const WorkflowBuilderComponent: React.FC<WorkflowBuilderProps> = ({ workflowId, onSave, onTest, readOnly = false }) => {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [workflowName, setWorkflowName] = useState("Novo Workflow");
    const [isValid, setIsValid] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const { project } = useReactFlow();

    // Carregar workflow existente
    useEffect(() => {
        if (workflowId) {
            loadWorkflow(workflowId);
        }
    }, [workflowId]);

    const loadWorkflow = async (id: string) => {
        try {
            // TODO: Implementar carregamento do workflow da API
            console.log("Loading workflow:", id);
        } catch (error) {
            console.error("Erro ao carregar workflow:", error);
        }
    };

    const validateWorkflow = useCallback(() => {
        const newErrors: string[] = [];

        // Verificar se há pelo menos um trigger node
        const triggerNodes = nodes.filter((node) => node.data?.category === "trigger");

        if (triggerNodes.length === 0) {
            newErrors.push("Workflow deve ter pelo menos um trigger");
        }

        // Verificar se há nodes desconectados (exceto triggers)
        const nonTriggerNodes = nodes.filter((node) => node.data?.category !== "trigger");

        for (const node of nonTriggerNodes) {
            const hasIncomingEdge = edges.some((edge) => edge.target === node.id);
            if (!hasIncomingEdge) {
                newErrors.push(`Node "${node.data?.label || node.id}" não está conectado`);
            }
        }

        // Verificar configurações obrigatórias
        for (const node of nodes) {
            if (node.data?.required && !node.data?.configured) {
                newErrors.push(`Node "${node.data?.label || node.id}" precisa ser configurado`);
            }
        }

        setErrors(newErrors);
        setIsValid(newErrors.length === 0 && nodes.length > 0);
    }, [nodes, edges]);

    // Validar workflow quando nodes ou edges mudarem
    useEffect(() => {
        validateWorkflow();
    }, [validateWorkflow]);

    const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), []);

    const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);

    const isValidConnection = useCallback(
        (connection: Connection): boolean => {
            const sourceNode = nodes.find((n) => n.id === connection.source);
            const targetNode = nodes.find((n) => n.id === connection.target);

            if (!sourceNode || !targetNode) return false;

            // Triggers não podem ter entrada
            if (targetNode.data?.category === "trigger") {
                return false;
            }

            // Verificar se já existe conexão
            const existingEdge = edges.find(
                (edge) => edge.source === connection.source && edge.target === connection.target
            );

            if (existingEdge) return false;

            return true;
        },
        [nodes, edges]
    );

    const onConnect = useCallback(
        (connection: Connection) => {
            // Validar conexão
            if (!isValidConnection(connection) || !connection.source || !connection.target) {
                return;
            }

            const edge: Edge = {
                id: `edge-${connection.source}-${connection.target}`,
                source: connection.source,
                target: connection.target,
                type: "smoothstep",
                animated: true,
                style: { stroke: "#1976d2", strokeWidth: 2 },
            };

            setEdges((eds) => addEdge(edge, eds));
        },
        [isValidConnection]
    );

    const createNode = useCallback((type: string, position: { x: number; y: number }): Node => {
        const id = `${type}-${Date.now()}`;

        // Definir propriedades baseadas no tipo
        const nodeConfig = getNodeConfig(type);

        return {
            id,
            type: "workflowNode",
            position,
            data: {
                ...nodeConfig,
                id,
                configured: false,
                config: {},
            },
        };
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
            if (!reactFlowBounds) return;

            const nodeType = event.dataTransfer.getData("application/reactflow");
            if (!nodeType) return;

            const position = project({
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
            });

            const newNode = createNode(nodeType, position);
            setNodes((nds) => nds.concat(newNode));
        },
        [project, createNode]
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, []);

    const getNodeConfig = (type: string) => {
        const configs: Record<string, any> = {
            "webhook-trigger": {
                label: "Webhook Trigger",
                category: "trigger",
                type: "webhook",
                icon: "🔗",
                color: "#4caf50",
                required: true,
            },
            "schedule-trigger": {
                label: "Agendamento",
                category: "trigger",
                type: "schedule",
                icon: "⏰",
                color: "#2196f3",
                required: true,
            },
            "whatsapp-send": {
                label: "Enviar WhatsApp",
                category: "action",
                type: "whatsapp-send",
                icon: "💬",
                color: "#25d366",
                required: true,
            },
            "email-send": {
                label: "Enviar Email",
                category: "action",
                type: "email-send",
                icon: "📧",
                color: "#ea4335",
                required: true,
            },
            condition: {
                label: "Condição",
                category: "logic",
                type: "condition",
                icon: "❓",
                color: "#ff9800",
                required: true,
            },
            delay: {
                label: "Aguardar",
                category: "utility",
                type: "delay",
                icon: "⏱️",
                color: "#9c27b0",
                required: true,
            },
        };

        return (
            configs[type] || {
                label: type,
                category: "unknown",
                type,
                icon: "⚙️",
                color: "#757575",
                required: false,
            }
        );
    };

    const onNodeClick = useCallback(
        (_: React.MouseEvent, node: Node) => {
            if (!readOnly) {
                setSelectedNode(node);
            }
        },
        [readOnly]
    );

    const updateNodeConfig = (nodeId: string, config: Record<string, any>) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === nodeId) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            config,
                            configured: true,
                        },
                    };
                }
                return node;
            })
        );
    };

    const deleteNode = (nodeId: string) => {
        setNodes((nds) => nds.filter((node) => node.id !== nodeId));
        setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
        setSelectedNode(null);
    };

    const saveWorkflow = () => {
        if (!isValid) {
            alert("Workflow contém erros que devem ser corrigidos antes de salvar");
            return;
        }

        const workflowData = {
            id: workflowId || `workflow-${Date.now()}`,
            name: workflowName,
            nodes: convertNodesToWorkflowNodes(),
            metadata: {
                visual: {
                    nodes: nodes.map((node) => ({
                        id: node.id,
                        position: node.position,
                    })),
                    edges: edges.map((edge) => ({
                        id: edge.id,
                        source: edge.source,
                        target: edge.target,
                    })),
                },
            },
        };

        onSave?.(workflowData);
    };

    const testWorkflow = () => {
        if (!isValid) {
            alert("Workflow contém erros que devem ser corrigidos antes de testar");
            return;
        }

        const workflowData = {
            id: workflowId || `test-workflow-${Date.now()}`,
            name: workflowName,
            nodes: convertNodesToWorkflowNodes(),
        };

        onTest?.(workflowData);
    };

    const convertNodesToWorkflowNodes = (): WorkflowNodeType[] => {
        return nodes.map((node) => ({
            id: node.id,
            type: "action", // Simplificado por enquanto
            nodeType: node.data.type,
            position: node.position,
            data: {
                name: node.data.label,
                nodeType: node.data.type,
                description: node.data.description || "",
                config: node.data.config || {},
            },
        }));
    };

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Toolbar */}
            <WorkflowToolbar
                workflowName={workflowName}
                onNameChange={setWorkflowName}
                isValid={isValid}
                errors={errors}
                onSave={saveWorkflow}
                onTest={testWorkflow}
                readOnly={readOnly}
            />

            <div className="flex-1 flex">
                {/* Node Palette */}
                {!readOnly && <NodePalette />}

                {/* Main Canvas */}
                <div className="flex-1 relative" ref={reactFlowWrapper}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onNodeClick={onNodeClick}
                        nodeTypes={nodeTypes}
                        fitView
                        snapToGrid
                        snapGrid={[15, 15]}
                        deleteKeyCode="Delete"
                        multiSelectionKeyCode="Shift"
                        panOnScroll
                        selectionOnDrag
                        className="bg-gray-100"
                    >
                        <Background />
                        <Controls />

                        {/* Status Panel */}
                        <Panel position="top-right" className="bg-white p-4 rounded-lg shadow-lg">
                            <div className="text-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <div
                                        className={`w-3 h-3 rounded-full ${isValid ? "bg-green-500" : "bg-red-500"}`}
                                    />
                                    <span className="font-medium">
                                        {isValid ? "Workflow Válido" : "Workflow Inválido"}
                                    </span>
                                </div>
                                <div className="text-gray-600">
                                    {nodes.length} nodes, {edges.length} conexões
                                </div>
                                {errors.length > 0 && (
                                    <div className="mt-2 p-2 bg-red-50 rounded border border-red-200">
                                        <div className="text-red-800 font-medium mb-1">Erros:</div>
                                        <ul className="text-red-700 text-xs space-y-1">
                                            {errors.map((error, index) => (
                                                <li key={index}>• {error}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </Panel>
                    </ReactFlow>
                </div>

                {/* Properties Panel */}
                {selectedNode && !readOnly && (
                    <WorkflowPropertiesPanel
                        node={selectedNode}
                        onConfigChange={(config: Record<string, any>) => updateNodeConfig(selectedNode.id, config)}
                        onDelete={() => deleteNode(selectedNode.id)}
                        onClose={() => setSelectedNode(null)}
                    />
                )}
            </div>
        </div>
    );
};

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = (props) => {
    return (
        <ReactFlowProvider>
            <WorkflowBuilderComponent {...props} />
        </ReactFlowProvider>
    );
};
