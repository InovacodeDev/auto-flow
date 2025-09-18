import React, { useCallback, useState, useRef, useEffect } from "react";
import ReactFlow, {
    Node,
    Edge,
    Connection,
    useNodesState,
    useEdgesState,
    addEdge,
    Controls,
    MiniMap,
    Background,
    BackgroundVariant,
    Panel,
    useReactFlow,
    ReactFlowProvider,
} from "reactflow";

import "reactflow/dist/style.css";

// Componentes do constructor
import { NodeLibrary } from "./NodeLibrary";
import { NodeInspector } from "./NodeInspector";
import WorkflowToolbar from "./WorkflowToolbar";
import TemplatesSelector from "./TemplatesSelector";
import { nodeTypes } from "./nodeTypes";

// Serviços de persistência
import {
    useWorkflowCanvas,
    useUpdateWorkflow,
    useCreateWorkflow,
    useAutoSaveWorkflow,
} from "../../services/workflowService";

// Componente de execução
import ExecutionPanel from "./ExecutionPanel";
// import WorkflowVersioning from "./WorkflowVersioning"; // Descomentado quando integrado

interface WorkflowCanvasProps {
    workflowId?: string;
    readOnly?: boolean;
    onSave?: (nodes: Node[], edges: Edge[]) => void;
}

const WorkflowCanvasInner: React.FC<WorkflowCanvasProps> = ({ workflowId, readOnly = false, onSave }) => {
    const reactFlowInstance = useReactFlow();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [isLibraryOpen, setIsLibraryOpen] = useState(true);
    const [isInspectorOpen, setIsInspectorOpen] = useState(false);
    const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
    const [isExecutionPanelOpen, setIsExecutionPanelOpen] = useState(false);
    // const [isVersioningOpen, setIsVersioningOpen] = useState(false); // Para integração futura
    const [workflowName, setWorkflowName] = useState("Novo Workflow");

    // Persistência hooks
    const { data: workflowData } = useWorkflowCanvas(workflowId);
    const updateWorkflow = useUpdateWorkflow();
    const createWorkflow = useCreateWorkflow();
    const { autoSave } = useAutoSaveWorkflow(workflowId || "");

    // Contador para IDs únicos
    const nodeIdRef = useRef(1);

    // Função para converter ReactFlow nodes para WorkflowNode
    const convertNodesToWorkflowNodes = (reactFlowNodes: Node[]) => {
        return reactFlowNodes.map((node) => ({
            id: node.id,
            type: node.type as "trigger" | "action" | "condition" | "utility",
            nodeType: node.data?.nodeType || "unknown",
            position: node.position,
            data: node.data || {},
            style: node.style || {},
        }));
    };

    // Função para converter ReactFlow edges para WorkflowEdge
    const convertEdgesToWorkflowEdges = (reactFlowEdges: Edge[]) => {
        return reactFlowEdges.map((edge) => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.sourceHandle || undefined,
            targetHandle: edge.targetHandle || undefined,
            type: edge.type || "default",
            data: edge.data || {},
            style: edge.style || {},
            animated: edge.animated || false,
        }));
    };

    // Carregar dados do workflow quando disponível
    useEffect(() => {
        if (workflowData) {
            setNodes(workflowData.nodes);
            setEdges(workflowData.edges);
            setWorkflowName(workflowData.name);

            // Restaurar viewport se disponível
            if (workflowData.canvasData?.viewport) {
                const { x, y, zoom } = workflowData.canvasData.viewport;
                reactFlowInstance.setViewport({ x, y, zoom });
            }
        }
    }, [workflowData, setNodes, setEdges, reactFlowInstance]);

    // Auto-save a cada 30 segundos
    useEffect(() => {
        if (!workflowId || readOnly || nodes.length === 0) return;

        const autoSaveInterval = setInterval(() => {
            const viewport = reactFlowInstance.getViewport();
            autoSave({
                name: workflowName,
                nodes: convertNodesToWorkflowNodes(nodes),
                edges: convertEdgesToWorkflowEdges(edges),
                canvasData: { viewport },
            });
        }, 30000); // 30 segundos

        return () => clearInterval(autoSaveInterval);
    }, [workflowId, readOnly, nodes, edges, workflowName, reactFlowInstance, autoSave]);

    const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    // Função para carregar template
    const handleSelectTemplate = useCallback(
        (template: any) => {
            // Converter template nodes para ReactFlow nodes
            const templateNodes = template.nodes.map((node: any) => ({
                id: node.id,
                type: node.type,
                position: node.position,
                data: {
                    ...node.data,
                    label: node.data.name || node.data.nodeType,
                },
            }));

            // Converter template edges para ReactFlow edges
            const templateEdges = template.edges.map((edge: any) => ({
                id: edge.id,
                source: edge.source,
                target: edge.target,
                sourceHandle: edge.sourceHandle,
                targetHandle: edge.targetHandle,
                type: edge.type || "default",
            }));

            // Aplicar template ao canvas
            setNodes(templateNodes);
            setEdges(templateEdges);
            setWorkflowName(template.name);

            // Restaurar viewport se disponível
            if (template.canvasData?.viewport) {
                const { x, y, zoom } = template.canvasData.viewport;
                reactFlowInstance.setViewport({ x, y, zoom });
            }

            setIsTemplatesOpen(false);
        },
        [setNodes, setEdges, reactFlowInstance]
    );

    // Adicionar novo node ao canvas
    const addNode = useCallback(
        (nodeType: string, nodeConfig: any) => {
            const newNode: Node = {
                id: `node_${nodeIdRef.current++}`,
                type: nodeType,
                position: {
                    x: Math.random() * 400 + 100,
                    y: Math.random() * 300 + 100,
                },
                data: {
                    label: nodeConfig.name || nodeType,
                    config: nodeConfig,
                    inputs: nodeConfig.inputs || [],
                    outputs: nodeConfig.outputs || [],
                },
            };

            setNodes((nds) => nds.concat(newNode));
            setIsLibraryOpen(false);
        },
        [setNodes]
    );

    // Selecionar node para edição
    const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
        setIsInspectorOpen(true);
    }, []);

    // Atualizar configuração do node
    const updateNodeConfig = useCallback(
        (nodeId: string, newConfig: any) => {
            setNodes((nds) =>
                nds.map((node) =>
                    node.id === nodeId
                        ? {
                              ...node,
                              data: {
                                  ...node.data,
                                  config: { ...node.data.config, ...newConfig },
                              },
                          }
                        : node
                )
            );
        },
        [setNodes]
    );

    // Deletar node selecionado
    const deleteSelectedNode = useCallback(() => {
        if (selectedNode) {
            setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
            setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
            setSelectedNode(null);
            setIsInspectorOpen(false);
        }
    }, [selectedNode, setNodes, setEdges]);

    // Duplicar node
    const duplicateNode = useCallback(
        (nodeId: string) => {
            const nodeToDuplicate = nodes.find((node) => node.id === nodeId);
            if (nodeToDuplicate) {
                const newNode: Node = {
                    ...nodeToDuplicate,
                    id: `${nodeToDuplicate.id}_copy_${Date.now()}`,
                    position: {
                        x: nodeToDuplicate.position.x + 50,
                        y: nodeToDuplicate.position.y + 50,
                    },
                    data: {
                        ...nodeToDuplicate.data,
                        name: `${nodeToDuplicate.data?.name || "Node"} (Copy)`,
                    },
                };
                setNodes((nodes) => [...nodes, newNode]);
            }
        },
        [nodes, setNodes]
    );

    // Salvar workflow
    const handleSave = useCallback(async () => {
        try {
            const viewport = reactFlowInstance.getViewport();

            if (workflowId) {
                // Atualizar workflow existente
                await updateWorkflow.mutateAsync({
                    id: workflowId,
                    name: workflowName,
                    nodes: convertNodesToWorkflowNodes(nodes),
                    edges: convertEdgesToWorkflowEdges(edges),
                    canvasData: { viewport },
                });
            } else {
                // Criar novo workflow
                const newWorkflow = await createWorkflow.mutateAsync({
                    name: workflowName,
                    nodes: convertNodesToWorkflowNodes(nodes),
                    edges: convertEdgesToWorkflowEdges(edges),
                    canvasData: { viewport },
                });

                // Redirecionar para o novo workflow
                window.history.pushState({}, "", `/workflow-builder/${newWorkflow.id}`);
            }

            console.log("Workflow salvo com sucesso!");

            // Callback opcional
            if (onSave) {
                onSave(nodes, edges);
            }
        } catch (error) {
            console.error("Erro ao salvar workflow:", error);
            // TODO: Mostrar toast de erro
        }
    }, [workflowId, workflowName, nodes, edges, reactFlowInstance, updateWorkflow, createWorkflow, onSave]);

    // Executar workflow
    const handleExecute = useCallback(async () => {
        if (!workflowId) {
            // Salvar antes de executar se for novo workflow
            await handleSave();
            return;
        }

        // Abrir painel de execução
        setIsExecutionPanelOpen(true);
    }, [workflowId, handleSave]);

    // Limpar canvas
    const handleClear = useCallback(() => {
        setNodes([]);
        setEdges([]);
        setSelectedNode(null);
        setIsInspectorOpen(false);
    }, [setNodes, setEdges]);

    // Zoom para fit
    const handleFitView = useCallback(() => {
        reactFlowInstance.fitView();
    }, [reactFlowInstance]);

    return (
        <div className="h-full w-full relative bg-gray-50">
            {/* Toolbar superior */}
            <WorkflowToolbar
                onSave={handleSave}
                onExecute={handleExecute}
                onClear={handleClear}
                onFitView={handleFitView}
                onToggleLibrary={() => setIsLibraryOpen(!isLibraryOpen)}
                onToggleInspector={() => setIsInspectorOpen(!isInspectorOpen)}
                onOpenTemplates={() => setIsTemplatesOpen(true)}
                canExecute={nodes.length > 0}
                readOnly={readOnly}
            />

            <div className="flex h-full pt-16">
                {" "}
                {/* pt-16 para compensar toolbar */}
                {/* Biblioteca de nodes */}
                {isLibraryOpen && <NodeLibrary onAddNode={addNode} onClose={() => setIsLibraryOpen(false)} />}
                {/* Canvas principal */}
                <div className="flex-1 relative">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onNodeClick={onNodeClick}
                        nodeTypes={nodeTypes}
                        fitView
                        className="bg-gray-100"
                        connectionMode={"loose" as any}
                        snapToGrid
                        snapGrid={[20, 20]}
                    >
                        {/* Controles de zoom e navegação */}
                        <Controls
                            className="bg-white shadow-lg border border-gray-200 rounded-lg"
                            showZoom
                            showFitView
                            showInteractive
                        />

                        {/* Minimap */}
                        <MiniMap
                            className="bg-white border border-gray-200 rounded-lg shadow-lg"
                            nodeColor="#e2e8f0"
                            maskColor="rgba(0, 0, 0, 0.1)"
                            position="bottom-right"
                        />

                        {/* Background pattern */}
                        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#d1d5db" />

                        {/* Panel de informações */}
                        <Panel position="top-center" className="bg-white px-4 py-2 rounded-lg shadow-md border">
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span>Nodes: {nodes.length}</span>
                                <span>Conexões: {edges.length}</span>
                                {workflowId && <span>ID: {workflowId}</span>}
                            </div>
                        </Panel>
                    </ReactFlow>
                </div>
                {/* Inspector de configuração */}
                {isInspectorOpen && selectedNode && (
                    <NodeInspector
                        selectedNode={selectedNode}
                        onUpdateNode={(nodeId: string, updates: any) => updateNodeConfig(nodeId, updates)}
                        onDeleteNode={deleteSelectedNode}
                        onDuplicateNode={(nodeId: string) => duplicateNode(nodeId)}
                        onClose={() => {
                            setIsInspectorOpen(false);
                            setSelectedNode(null);
                        }}
                    />
                )}
            </div>

            {/* Templates Selector Modal */}
            <TemplatesSelector
                isOpen={isTemplatesOpen}
                onSelectTemplate={handleSelectTemplate}
                onClose={() => setIsTemplatesOpen(false)}
            />

            {/* Execution Panel */}
            {workflowId && (
                <ExecutionPanel
                    workflowId={workflowId}
                    isOpen={isExecutionPanelOpen}
                    onClose={() => setIsExecutionPanelOpen(false)}
                />
            )}
        </div>
    );
};

// Wrapper com ReactFlowProvider
export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = (props) => {
    return (
        <ReactFlowProvider>
            <WorkflowCanvasInner {...props} />
        </ReactFlowProvider>
    );
};

export default WorkflowCanvas;
