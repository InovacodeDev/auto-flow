import React, { useCallback, useState, useRef, useEffect } from "react";
import ReactFlow, {
    Node,
    Edge,
    Connection,
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
import { WorkflowStatus } from "./WorkflowStatus";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { WorkflowHelp, HelpButton } from "./WorkflowHelp";
import { NodeShowcase } from "./NodeShowcase";
import { ExecutionMonitor } from "./ExecutionMonitor";
import { nodeTypes } from "./nodeTypes";

// Hooks customizados
import { useWorkflowCanvas } from "../../hooks/useWorkflowCanvas";

// Componente de execução
import ExecutionPanel from "./ExecutionPanel";

interface WorkflowCanvasProps {
    workflowId?: string;
    readOnly?: boolean;
    onSave?: (nodes: Node[], edges: Edge[]) => void;
}

const WorkflowCanvasInner: React.FC<WorkflowCanvasProps> = ({
    workflowId,
    readOnly = false,
    onSave,
}) => {
    const reactFlowInstance = useReactFlow();
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [isShowcaseOpen, setIsShowcaseOpen] = useState(false);
    const [isExecutionMonitorOpen, setIsExecutionMonitorOpen] = useState(false);

    // Hook customizado para gerenciar o canvas
    const {
        nodes,
        edges,
        selectedNode,
        workflowName,
        setWorkflowName,
        isLibraryOpen,
        setIsLibraryOpen,
        isInspectorOpen,
        setIsInspectorOpen,
        isTemplatesOpen,
        setIsTemplatesOpen,
        isExecutionPanelOpen,
        setIsExecutionPanelOpen,
        onNodesChange,
        onEdgesChange,
        onConnect,
        onNodeClick,
        addNode,
        updateNodeConfig,
        deleteNode,
        duplicateNode,
        saveWorkflow,
        clearCanvas,
        loadTemplate,
        isLoading,
        error,
        isSaving,
        saveError,
        canExecute,
        hasChanges,
    } = useWorkflowCanvas(workflowId);

    // Handlers simplificados
    const handleSave = useCallback(async () => {
        try {
            await saveWorkflow();
            if (onSave) {
                onSave(nodes, edges);
            }
        } catch (error) {
            console.error("Erro ao salvar workflow:", error);
        }
    }, [saveWorkflow, onSave, nodes, edges]);

    const handleExecute = useCallback(async () => {
        if (!workflowId) {
            await handleSave();
            return;
        }
        setIsExecutionMonitorOpen(true);
    }, [workflowId, handleSave, setIsExecutionMonitorOpen]);

    const handleFitView = useCallback(() => {
        reactFlowInstance.fitView();
    }, [reactFlowInstance]);

    return (
        <div className="h-full w-full relative bg-gray-50">
            {/* Atalhos de teclado */}
            <KeyboardShortcuts workflowId={workflowId} />

            {/* Toolbar superior */}
            <WorkflowToolbar
                onSave={handleSave}
                onExecute={handleExecute}
                onClear={clearCanvas}
                onFitView={handleFitView}
                onToggleLibrary={() => setIsLibraryOpen(!isLibraryOpen)}
                onToggleInspector={() => setIsInspectorOpen(!isInspectorOpen)}
                onOpenTemplates={() => setIsTemplatesOpen(true)}
                onOpenShowcase={() => setIsShowcaseOpen(true)}
                canExecute={canExecute}
                readOnly={readOnly}
            />

            <div className="flex h-full pt-16">
                {/* Biblioteca de nodes */}
                {isLibraryOpen && (
                    <NodeLibrary onAddNode={addNode} onClose={() => setIsLibraryOpen(false)} />
                )}

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
                        <Background
                            variant={BackgroundVariant.Dots}
                            gap={20}
                            size={1}
                            color="#d1d5db"
                        />

                        {/* Panel de informações */}
                        <Panel
                            position="top-center"
                            className="bg-white px-4 py-2 rounded-lg shadow-md border"
                        >
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span>Nodes: {nodes.length}</span>
                                <span>Conexões: {edges.length}</span>
                                {workflowId && <span>ID: {workflowId}</span>}
                            </div>
                        </Panel>

                        {/* Status do workflow */}
                        <Panel
                            position="top-left"
                            className="bg-white px-4 py-2 rounded-lg shadow-md border"
                        >
                            <WorkflowStatus
                                status="draft"
                                hasChanges={hasChanges}
                                isSaving={isSaving}
                            />
                        </Panel>
                    </ReactFlow>
                </div>

                {/* Inspector de configuração */}
                {isInspectorOpen && selectedNode && (
                    <NodeInspector
                        selectedNode={selectedNode}
                        onUpdateNode={updateNodeConfig}
                        onDeleteNode={() => deleteNode(selectedNode.id)}
                        onDuplicateNode={() => duplicateNode(selectedNode.id)}
                        onClose={() => {
                            setIsInspectorOpen(false);
                        }}
                    />
                )}
            </div>

            {/* Templates Selector Modal */}
            <TemplatesSelector
                isOpen={isTemplatesOpen}
                onSelectTemplate={loadTemplate}
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

            {/* Botão de ajuda */}
            <HelpButton onClick={() => setIsHelpOpen(true)} />

            {/* Modal de ajuda */}
            <WorkflowHelp isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

            {/* Galeria de nós */}
            <NodeShowcase
                isOpen={isShowcaseOpen}
                onClose={() => setIsShowcaseOpen(false)}
                onAddNode={addNode}
            />

            {/* Monitor de execução */}
            <ExecutionMonitor
                workflowId={workflowId}
                isOpen={isExecutionMonitorOpen}
                onClose={() => setIsExecutionMonitorOpen(false)}
            />
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
