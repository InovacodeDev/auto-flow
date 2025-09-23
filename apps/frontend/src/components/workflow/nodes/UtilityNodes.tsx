import React from "react";
import { NodeProps } from "reactflow";
import {
    ClockIcon,
    ArrowPathIcon,
    DocumentDuplicateIcon,
    CpuChipIcon,
    VariableIcon,
    CalculatorIcon,
    LinkIcon,
    QueueListIcon,
    ChartBarIcon,
    CogIcon,
    ShieldCheckIcon,
    EyeIcon,
} from "@heroicons/react/24/outline";
import BaseNode, { NodeStatus } from "./BaseNode";

// Delay Node
export const DelayNode: React.FC<NodeProps> = (props) => {
    const getSubtitle = () => {
        const duration = props.data?.config?.duration || 5000;
        const unit = props.data?.config?.unit || "milliseconds";
        return `${duration}${unit === "milliseconds" ? "ms" : unit === "seconds" ? "s" : unit}`;
    };

    const getStatus = (): NodeStatus | undefined => {
        if (props.data?.status) {
            return props.data.status;
        }
        return undefined;
    };

    return (
        <BaseNode
            {...props}
            icon={ClockIcon}
            color="bg-gray-500"
            title="Aguardar"
            subtitle={getSubtitle()}
            status={getStatus()}
            inputs={[{ id: "input", label: "Entrada", type: "any", required: false }]}
            outputs={[{ id: "output", label: "Saída", type: "object" }]}
            showStatus={true}
            isConfigurable={true}
        />
    );
};

// Data Transform Node
export const DataTransformNode: React.FC<NodeProps> = (props) => {
    const getSubtitle = () => {
        const operation = props.data?.config?.operation || "map";
        return `Transformação • ${operation}`;
    };

    const getStatus = (): NodeStatus | undefined => {
        if (props.data?.status) {
            return props.data.status;
        }
        return undefined;
    };

    return (
        <BaseNode
            {...props}
            icon={ArrowPathIcon}
            color="bg-blue-500"
            title="Transformar Dados"
            subtitle={getSubtitle()}
            status={getStatus()}
            inputs={[
                { id: "input", label: "Dados de Entrada", type: "object", required: true },
                { id: "mapping", label: "Mapeamento", type: "object", required: true },
            ]}
            outputs={[{ id: "output", label: "Dados Transformados", type: "object" }]}
            showStatus={true}
            isConfigurable={true}
        />
    );
};

// Clone Node
export const CloneNode: React.FC<NodeProps> = (props) => {
    const getSubtitle = () => {
        const copies = props.data?.config?.copies || 1;
        return `${copies} cópias`;
    };

    const getStatus = (): NodeStatus | undefined => {
        if (props.data?.status) {
            return props.data.status;
        }
        return undefined;
    };

    return (
        <BaseNode
            {...props}
            icon={DocumentDuplicateIcon}
            color="bg-green-500"
            title="Clonar"
            subtitle={getSubtitle()}
            status={getStatus()}
            inputs={[{ id: "input", label: "Entrada", type: "any", required: true }]}
            outputs={[
                { id: "output1", label: "Cópia 1", type: "object" },
                { id: "output2", label: "Cópia 2", type: "object" },
                { id: "output3", label: "Cópia 3", type: "object" },
            ]}
            showStatus={true}
            isConfigurable={true}
        />
    );
};

// Code Execution Node
export const CodeExecutionNode: React.FC<NodeProps> = (props) => {
    const getSubtitle = () => {
        const language = props.data?.config?.language || "javascript";
        return `Código • ${language}`;
    };

    const getStatus = (): NodeStatus | undefined => {
        if (props.data?.status) {
            return props.data.status;
        }
        return undefined;
    };

    return (
        <BaseNode
            {...props}
            icon={CpuChipIcon}
            color="bg-purple-500"
            title="Executar Código"
            subtitle={getSubtitle()}
            status={getStatus()}
            inputs={[
                { id: "input", label: "Dados", type: "object", required: true },
                { id: "code", label: "Código", type: "string", required: true },
            ]}
            outputs={[
                { id: "output", label: "Resultado", type: "any" },
                { id: "error", label: "Erro", type: "object" },
            ]}
            showStatus={true}
            isConfigurable={true}
        />
    );
};

// Variable Node
export const VariableNode: React.FC<NodeProps> = (props) => {
    const getSubtitle = () => {
        const name = props.data?.config?.name || "var";
        const type = props.data?.config?.type || "string";
        return `${name} • ${type}`;
    };

    const getStatus = (): NodeStatus | undefined => {
        if (props.data?.status) {
            return props.data.status;
        }
        return undefined;
    };

    return (
        <BaseNode
            {...props}
            icon={VariableIcon}
            color="bg-orange-500"
            title="Variável"
            subtitle={getSubtitle()}
            status={getStatus()}
            inputs={[{ id: "input", label: "Valor", type: "any", required: true }]}
            outputs={[{ id: "output", label: "Variável", type: "any" }]}
            showStatus={true}
            isConfigurable={true}
        />
    );
};

// Calculator Node
export const CalculatorNode: React.FC<NodeProps> = (props) => {
    const getSubtitle = () => {
        const operation = props.data?.config?.operation || "add";
        return `Calculadora • ${operation}`;
    };

    const getStatus = (): NodeStatus | undefined => {
        if (props.data?.status) {
            return props.data.status;
        }
        return undefined;
    };

    return (
        <BaseNode
            {...props}
            icon={CalculatorIcon}
            color="bg-teal-500"
            title="Calculadora"
            subtitle={getSubtitle()}
            status={getStatus()}
            inputs={[
                { id: "a", label: "Valor A", type: "number", required: true },
                { id: "b", label: "Valor B", type: "number", required: true },
                { id: "operation", label: "Operação", type: "string", required: true },
            ]}
            outputs={[{ id: "result", label: "Resultado", type: "number" }]}
            showStatus={true}
            isConfigurable={true}
        />
    );
};

// URL Builder Node
export const UrlBuilderNode: React.FC<NodeProps> = (props) => {
    const getSubtitle = () => {
        const baseUrl = props.data?.config?.baseUrl || "https://api.example.com";
        return `URL • ${baseUrl.length > 20 ? baseUrl.substring(0, 20) + "..." : baseUrl}`;
    };

    const getStatus = (): NodeStatus | undefined => {
        if (props.data?.status) {
            return props.data.status;
        }
        return undefined;
    };

    return (
        <BaseNode
            {...props}
            icon={LinkIcon}
            color="bg-cyan-500"
            title="Construtor de URL"
            subtitle={getSubtitle()}
            status={getStatus()}
            inputs={[
                { id: "baseUrl", label: "URL Base", type: "string", required: true },
                { id: "path", label: "Caminho", type: "string", required: false },
                { id: "params", label: "Parâmetros", type: "object", required: false },
            ]}
            outputs={[{ id: "url", label: "URL Final", type: "string" }]}
            showStatus={true}
            isConfigurable={true}
        />
    );
};

// Queue Node
export const QueueNode: React.FC<NodeProps> = (props) => {
    const getSubtitle = () => {
        const operation = props.data?.config?.operation || "enqueue";
        const queue = props.data?.config?.queue || "default";
        return `${operation} • ${queue}`;
    };

    const getStatus = (): NodeStatus | undefined => {
        if (props.data?.status) {
            return props.data.status;
        }
        return undefined;
    };

    return (
        <BaseNode
            {...props}
            icon={QueueListIcon}
            color="bg-indigo-500"
            title="Fila"
            subtitle={getSubtitle()}
            status={getStatus()}
            inputs={[
                { id: "input", label: "Item", type: "any", required: true },
                { id: "queue", label: "Nome da Fila", type: "string", required: true },
            ]}
            outputs={[
                { id: "output", label: "Item Processado", type: "object" },
                { id: "position", label: "Posição", type: "number" },
            ]}
            showStatus={true}
            isConfigurable={true}
        />
    );
};

// Aggregator Node
export const AggregatorNode: React.FC<NodeProps> = (props) => {
    const getSubtitle = () => {
        const operation = props.data?.config?.operation || "sum";
        const field = props.data?.config?.field || "value";
        return `${operation} • ${field}`;
    };

    const getStatus = (): NodeStatus | undefined => {
        if (props.data?.status) {
            return props.data.status;
        }
        return undefined;
    };

    return (
        <BaseNode
            {...props}
            icon={ChartBarIcon}
            color="bg-pink-500"
            title="Agregador"
            subtitle={getSubtitle()}
            status={getStatus()}
            inputs={[
                { id: "input", label: "Dados", type: "array", required: true },
                { id: "field", label: "Campo", type: "string", required: true },
            ]}
            outputs={[
                { id: "result", label: "Resultado", type: "number" },
                { id: "count", label: "Contagem", type: "number" },
            ]}
            showStatus={true}
            isConfigurable={true}
        />
    );
};

// Logger Node
export const LoggerNode: React.FC<NodeProps> = (props) => {
    const getSubtitle = () => {
        const level = props.data?.config?.level || "info";
        return `Log • ${level}`;
    };

    const getStatus = (): NodeStatus | undefined => {
        if (props.data?.status) {
            return props.data.status;
        }
        return undefined;
    };

    return (
        <BaseNode
            {...props}
            icon={EyeIcon}
            color="bg-gray-600"
            title="Logger"
            subtitle={getSubtitle()}
            status={getStatus()}
            inputs={[
                { id: "input", label: "Dados", type: "any", required: true },
                { id: "message", label: "Mensagem", type: "string", required: true },
            ]}
            outputs={[
                { id: "output", label: "Dados Originais", type: "object" },
                { id: "logId", label: "ID do Log", type: "string" },
            ]}
            showStatus={true}
            isConfigurable={true}
        />
    );
};

// Configuration Node
export const ConfigurationNode: React.FC<NodeProps> = (props) => {
    const getSubtitle = () => {
        const configs = Object.keys(props.data?.config || {}).length;
        return `${configs} configurações`;
    };

    const getStatus = (): NodeStatus | undefined => {
        if (props.data?.status) {
            return props.data.status;
        }
        return undefined;
    };

    return (
        <BaseNode
            {...props}
            icon={CogIcon}
            color="bg-slate-500"
            title="Configuração"
            subtitle={getSubtitle()}
            status={getStatus()}
            inputs={[{ id: "input", label: "Entrada", type: "any", required: false }]}
            outputs={[{ id: "config", label: "Configuração", type: "object" }]}
            showStatus={true}
            isConfigurable={true}
        />
    );
};

// Security Node
export const SecurityNode: React.FC<NodeProps> = (props) => {
    const getSubtitle = () => {
        const action = props.data?.config?.action || "encrypt";
        return `Segurança • ${action}`;
    };

    const getStatus = (): NodeStatus | undefined => {
        if (props.data?.status) {
            return props.data.status;
        }
        return undefined;
    };

    return (
        <BaseNode
            {...props}
            icon={ShieldCheckIcon}
            color="bg-red-600"
            title="Segurança"
            subtitle={getSubtitle()}
            status={getStatus()}
            inputs={[
                { id: "input", label: "Dados", type: "any", required: true },
                { id: "key", label: "Chave", type: "string", required: true },
            ]}
            outputs={[
                { id: "output", label: "Dados Seguros", type: "object" },
                { id: "status", label: "Status", type: "string" },
            ]}
            showStatus={true}
            isConfigurable={true}
        />
    );
};
