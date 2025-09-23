import React from "react";
import { NodeProps } from "reactflow";
import {
    FunnelIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    QuestionMarkCircleIcon,
    ScaleIcon,
    CpuChipIcon,
    DocumentCheckIcon,
} from "@heroicons/react/24/outline";
import BaseNode, { NodeStatus } from "./BaseNode";

// Basic Condition Node
export const ConditionNode: React.FC<NodeProps> = (props) => {
    const getSubtitle = () => {
        const operator = props.data?.config?.operator || "equals";
        const field = props.data?.config?.field || "value";
        return `${field} ${operator}`;
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
            icon={FunnelIcon}
            color="bg-yellow-500"
            title="Condição"
            subtitle={getSubtitle()}
            status={getStatus()}
            inputs={[
                { id: "input", label: "Dados", type: "object", required: true },
                { id: "condition", label: "Condição", type: "string", required: true },
            ]}
            outputs={[
                { id: "true", label: "Verdadeiro", type: "object" },
                { id: "false", label: "Falso", type: "object" },
            ]}
            showStatus={true}
            isConfigurable={true}
        />
    );
};

// Switch Node
export const SwitchNode: React.FC<NodeProps> = (props) => {
    const getSubtitle = () => {
        const cases = props.data?.config?.cases?.length || 0;
        return `${cases} casos`;
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
            icon={ScaleIcon}
            color="bg-indigo-500"
            title="Switch"
            subtitle={getSubtitle()}
            status={getStatus()}
            inputs={[{ id: "input", label: "Valor", type: "any", required: true }]}
            outputs={[
                { id: "case1", label: "Caso 1", type: "object" },
                { id: "case2", label: "Caso 2", type: "object" },
                { id: "default", label: "Padrão", type: "object" },
            ]}
            showStatus={true}
            isConfigurable={true}
        />
    );
};

// Validation Node
export const ValidationNode: React.FC<NodeProps> = (props) => {
    const getSubtitle = () => {
        const rules = props.data?.config?.rules?.length || 0;
        return `${rules} regras de validação`;
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
            icon={DocumentCheckIcon}
            color="bg-green-500"
            title="Validação"
            subtitle={getSubtitle()}
            status={getStatus()}
            inputs={[
                { id: "input", label: "Dados", type: "object", required: true },
                { id: "rules", label: "Regras", type: "object", required: true },
            ]}
            outputs={[
                { id: "valid", label: "Válido", type: "object" },
                { id: "invalid", label: "Inválido", type: "object" },
                { id: "errors", label: "Erros", type: "array" },
            ]}
            showStatus={true}
            isConfigurable={true}
        />
    );
};

// Error Handler Node
export const ErrorHandlerNode: React.FC<NodeProps> = (props) => {
    const getSubtitle = () => {
        const type = props.data?.config?.type || "catch";
        return `Tratamento de Erro • ${type}`;
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
            icon={ExclamationTriangleIcon}
            color="bg-red-500"
            title="Tratamento de Erro"
            subtitle={getSubtitle()}
            status={getStatus()}
            inputs={[
                { id: "input", label: "Entrada", type: "any", required: true },
                { id: "error", label: "Erro", type: "object", required: false },
            ]}
            outputs={[
                { id: "success", label: "Sucesso", type: "object" },
                { id: "handled", label: "Tratado", type: "object" },
            ]}
            showStatus={true}
            isConfigurable={true}
        />
    );
};

// Retry Node
export const RetryNode: React.FC<NodeProps> = (props) => {
    const getSubtitle = () => {
        const attempts = props.data?.config?.attempts || 3;
        const delay = props.data?.config?.delay || 1000;
        return `${attempts} tentativas • ${delay}ms`;
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
            title="Tentar Novamente"
            subtitle={getSubtitle()}
            status={getStatus()}
            inputs={[
                { id: "input", label: "Entrada", type: "any", required: true },
                { id: "condition", label: "Condição", type: "string", required: false },
            ]}
            outputs={[
                { id: "success", label: "Sucesso", type: "object" },
                { id: "failed", label: "Falhou", type: "object" },
            ]}
            showStatus={true}
            isConfigurable={true}
        />
    );
};

// Gate Node
export const GateNode: React.FC<NodeProps> = (props) => {
    const getSubtitle = () => {
        const condition = props.data?.config?.condition || "always";
        return `Portão • ${condition}`;
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
            icon={QuestionMarkCircleIcon}
            color="bg-gray-500"
            title="Portão"
            subtitle={getSubtitle()}
            status={getStatus()}
            inputs={[
                { id: "input", label: "Entrada", type: "any", required: true },
                { id: "condition", label: "Condição", type: "boolean", required: true },
            ]}
            outputs={[{ id: "output", label: "Saída", type: "object" }]}
            showStatus={true}
            isConfigurable={true}
        />
    );
};
