// Tipos para o Visual Constructor
export interface WorkflowCanvas {
    id: string;
    name: string;
    description?: string;
    status: "draft" | "active" | "paused" | "archived";
    canvasData: {
        viewport?: { x: number; y: number; zoom: number };
        background?: any;
        settings?: any;
    };
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    version: number;
    createdAt: string;
    updatedAt: string;
}

export interface WorkflowNode {
    id: string;
    type: "trigger" | "action" | "condition" | "utility";
    nodeType: string; // manual_trigger, http_request, etc
    position: { x: number; y: number };
    data: {
        name: string;
        nodeType: string;
        description?: string;
        config?: Record<string, any>;
        [key: string]: any;
    };
    style?: Record<string, any>;
}

export interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
    type?: string;
    data?: Record<string, any>;
    style?: Record<string, any>;
    animated?: boolean;
}

// Request/Response tipos
export interface CreateWorkflowRequest {
    name: string;
    description?: string;
    canvasData?: any;
    nodes?: WorkflowNode[];
    edges?: WorkflowEdge[];
}

export interface UpdateWorkflowRequest {
    name?: string;
    description?: string;
    canvasData?: any;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
}

export interface WorkflowListItem {
    id: string;
    name: string;
    description?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}
