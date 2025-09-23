import { useState, useCallback, useEffect } from "react";
import { Node, Edge, useNodesState, useEdgesState, addEdge } from "reactflow";
import {
    useWorkflowCanvas as useWorkflowCanvasQuery,
    useUpdateWorkflow,
    useCreateWorkflow,
} from "../services/workflowService";
import { useAuthEnhanced } from "./useAuthEnhanced";

/**
 * Hook para gerenciar o estado do canvas do workflow
 * Integra ReactFlow com TanStack Query e autenticação
 */
export const useWorkflowCanvas = (workflowId?: string) => {
    const { isAuthenticated } = useAuthEnhanced();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [isLibraryOpen, setIsLibraryOpen] = useState(true);
    const [isInspectorOpen, setIsInspectorOpen] = useState(false);
    const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
    const [isExecutionPanelOpen, setIsExecutionPanelOpen] = useState(false);
    const [workflowName, setWorkflowName] = useState("Novo Workflow");

    // Queries e mutations
    const { data: workflowData, isLoading, error } = useWorkflowCanvasQuery(workflowId);
    const updateWorkflow = useUpdateWorkflow();
    const createWorkflow = useCreateWorkflow();

    // Carregar dados do workflow quando disponível
    useEffect(() => {
        if (workflowData) {
            setNodes(workflowData.nodes);
            setEdges(workflowData.edges);
            setWorkflowName(workflowData.name);
        }
    }, [workflowData]);

    // Função para conectar nós
    const onConnect = useCallback(
        (params: Edge | any) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    // Função para adicionar nó
    const addNode = useCallback(
        (nodeType: string, nodeConfig: any) => {
            const newNode: Node = {
                id: `node_${Date.now()}`,
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

    // Função para selecionar nó
    const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
        setIsInspectorOpen(true);
    }, []);

    // Função para atualizar configuração do nó
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

    // Função para deletar nó
    const deleteNode = useCallback(
        (nodeId: string) => {
            setNodes((nds) => nds.filter((node) => node.id !== nodeId));
            setEdges((eds) =>
                eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
            );
            setSelectedNode(null);
            setIsInspectorOpen(false);
        },
        [setNodes, setEdges]
    );

    // Função para duplicar nó
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

    // Função para salvar workflow
    const saveWorkflow = useCallback(async () => {
        if (!isAuthenticated) {
            throw new Error("Usuário não autenticado");
        }

        try {
            if (workflowId) {
                // Atualizar workflow existente
                await updateWorkflow.mutateAsync({
                    id: workflowId,
                    name: workflowName,
                    nodes: nodes.map((node) => ({
                        id: node.id,
                        type: node.type as "trigger" | "action" | "condition" | "utility",
                        nodeType: node.data?.nodeType || "unknown",
                        position: node.position,
                        data: node.data || {},
                        style: node.style || {},
                    })),
                    edges: edges.map((edge) => ({
                        id: edge.id,
                        source: edge.source,
                        target: edge.target,
                        sourceHandle: edge.sourceHandle || undefined,
                        targetHandle: edge.targetHandle || undefined,
                        type: edge.type || "default",
                        data: edge.data || {},
                        style: edge.style || {},
                        animated: edge.animated || false,
                    })),
                });
            } else {
                // Criar novo workflow
                const newWorkflow = await createWorkflow.mutateAsync({
                    name: workflowName,
                    nodes: nodes.map((node) => ({
                        id: node.id,
                        type: node.type as "trigger" | "action" | "condition" | "utility",
                        nodeType: node.data?.nodeType || "unknown",
                        position: node.position,
                        data: node.data || {},
                        style: node.style || {},
                    })),
                    edges: edges.map((edge) => ({
                        id: edge.id,
                        source: edge.source,
                        target: edge.target,
                        sourceHandle: edge.sourceHandle || undefined,
                        targetHandle: edge.targetHandle || undefined,
                        type: edge.type || "default",
                        data: edge.data || {},
                        style: edge.style || {},
                        animated: edge.animated || false,
                    })),
                });

                // Redirecionar para o novo workflow
                window.history.pushState({}, "", `/workflow-builder/${newWorkflow.id}`);
            }

            console.log("Workflow salvo com sucesso!");
        } catch (error) {
            console.error("Erro ao salvar workflow:", error);
            throw error;
        }
    }, [workflowId, workflowName, nodes, edges, isAuthenticated, updateWorkflow, createWorkflow]);

    // Função para limpar canvas
    const clearCanvas = useCallback(() => {
        setNodes([]);
        setEdges([]);
        setSelectedNode(null);
        setIsInspectorOpen(false);
    }, [setNodes, setEdges]);

    // Função para carregar template
    const loadTemplate = useCallback(
        (template: any) => {
            const templateNodes = template.nodes.map((node: any) => ({
                id: node.id,
                type: node.type,
                position: node.position,
                data: {
                    ...node.data,
                    label: node.data.name || node.data.nodeType,
                },
            }));

            const templateEdges = template.edges.map((edge: any) => ({
                id: edge.id,
                source: edge.source,
                target: edge.target,
                sourceHandle: edge.sourceHandle,
                targetHandle: edge.targetHandle,
                type: edge.type || "default",
            }));

            setNodes(templateNodes);
            setEdges(templateEdges);
            setWorkflowName(template.name);
            setIsTemplatesOpen(false);
        },
        [setNodes, setEdges]
    );

    return {
        // Estado do canvas
        nodes,
        edges,
        selectedNode,
        workflowName,
        setWorkflowName,

        // Estado da UI
        isLibraryOpen,
        setIsLibraryOpen,
        isInspectorOpen,
        setIsInspectorOpen,
        isTemplatesOpen,
        setIsTemplatesOpen,
        isExecutionPanelOpen,
        setIsExecutionPanelOpen,

        // Handlers do ReactFlow
        onNodesChange,
        onEdgesChange,
        onConnect,
        onNodeClick,

        // Ações do canvas
        addNode,
        updateNodeConfig,
        deleteNode,
        duplicateNode,
        saveWorkflow,
        clearCanvas,
        loadTemplate,

        // Estado das queries
        isLoading,
        error,
        isSaving: updateWorkflow.isPending || createWorkflow.isPending,
        saveError: updateWorkflow.error || createWorkflow.error,

        // Helpers
        canExecute: nodes.length > 0,
        hasChanges: nodes.length > 0 || edges.length > 0,
    };
};
