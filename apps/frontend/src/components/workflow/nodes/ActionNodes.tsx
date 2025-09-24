import React from "react";
import { NodeProps } from "reactflow";
import {
    GlobeAltIcon,
    EnvelopeIcon,
    DocumentTextIcon,
    CircleStackIcon,
    ChatBubbleLeftRightIcon,
    CloudIcon,
    CurrencyDollarIcon,
    UserIcon,
    ChartBarIcon,
    CogIcon,
    DocumentArrowDownIcon,
    BellIcon,
    ShieldCheckIcon,
    ArrowPathIcon,
} from "@heroicons/react/24/outline";
import BaseNode, { NodeStatus } from "./BaseNode";

// HTTP Request Action Node
export const HttpRequestActionNode: React.FC<NodeProps> = (props) => {
    const getSubtitle = () => {
        const method = props.data?.config?.method || "GET";
        const url = props.data?.config?.url || "https://api.example.com";
        return `${method} • ${url.length > 30 ? url.substring(0, 30) + "..." : url}`;
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
            icon={GlobeAltIcon}
            color="bg-orange-500"
            title="Requisição HTTP"
            subtitle={getSubtitle()}
            status={getStatus()}
            inputs={[
                { id: "input", label: "Dados", type: "object", required: false },
                { id: "url", label: "URL", type: "string", required: true },
            ]}
            outputs={[
                { id: "response", label: "Resposta", type: "object" },
                { id: "status", label: "Status Code", type: "number" },
                { id: "headers", label: "Headers", type: "object" },
            ]}
            showStatus={true}
            isConfigurable={true}
        />
    );
};

// Email Action Node
export const EmailActionNode: React.FC<NodeProps> = (props) => {
    const getSubtitle = () => {
        const provider = props.data?.config?.provider || "smtp";
        const to = props.data?.config?.to || "user@example.com";
        return `${provider} • ${to}`;
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
            icon={EnvelopeIcon}
            color="bg-red-500"
            title="Enviar Email"
            subtitle={getSubtitle()}
            status={getStatus()}
            inputs={[
                { id: "to", label: "Para", type: "string", required: true },
                { id: "subject", label: "Assunto", type: "string", required: true },
                { id: "body", label: "Corpo", type: "string", required: true },
            ]}
            outputs={[
                { id: "messageId", label: "ID da Mensagem", type: "string" },
                { id: "status", label: "Status", type: "string" },
            ]}
            showStatus={true}
            isConfigurable={true}
        />
    );
};

// Database Action Node
export const DatabaseActionNode: React.FC<NodeProps> = (props) => {
    const getSubtitle = () => {
        const table = props.data?.config?.table || "users";
        const operation = props.data?.config?.operation || "insert";
        return `${table} • ${operation}`;
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
            icon={CircleStackIcon}
            color="bg-teal-500"
            title="Banco de Dados"
            subtitle={getSubtitle()}
            status={getStatus()}
            inputs={[
                { id: "data", label: "Dados", type: "object", required: true },
                { id: "query", label: "Query", type: "string", required: false },
            ]}
            outputs={[
                { id: "result", label: "Resultado", type: "object" },
                { id: "id", label: "ID", type: "string" },
                { id: "count", label: "Contagem", type: "number" },
            ]}
            showStatus={true}
            isConfigurable={true}
        />
    );
};

// WhatsApp Action Node
export const WhatsAppActionNode: React.FC<NodeProps> = (props) => {
    const getSubtitle = () => {
        const type = props.data?.config?.type || "message";
        return `WhatsApp • ${type}`;
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
            icon={ChatBubbleLeftRightIcon}
            color="bg-green-600"
            title="WhatsApp"
            subtitle={getSubtitle()}
            status={getStatus()}
            inputs={[
                { id: "to", label: "Para", type: "string", required: true },
                { id: "message", label: "Mensagem", type: "string", required: true },
                { id: "media", label: "Mídia", type: "string", required: false },
            ]}
            outputs={[
                { id: "messageId", label: "ID da Mensagem", type: "string" },
                { id: "status", label: "Status", type: "string" },
            ]}
            showStatus={true}
            isConfigurable={true}
        />
    );
};

// Cloud Storage Action Node
export const CloudStorageActionNode: React.FC<NodeProps> = (props) => {
    const getSubtitle = () => {
        const provider = props.data?.config?.provider || "aws";
        const operation = props.data?.config?.operation || "upload";
        return `${provider} • ${operation}`;
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
            icon={CloudIcon}
            color="bg-blue-600"
            title="Armazenamento"
            subtitle={getSubtitle()}
            status={getStatus()}
            inputs={[
                { id: "file", label: "Arquivo", type: "object", required: true },
                { id: "path", label: "Caminho", type: "string", required: true },
            ]}
            outputs={[
                { id: "url", label: "URL", type: "string" },
                { id: "key", label: "Chave", type: "string" },
                { id: "size", label: "Tamanho", type: "number" },
            ]}
            showStatus={true}
            isConfigurable={true}
        />
    );
};

// Payment Action Node
export const PaymentActionNode: React.FC<NodeProps> = (props) => {
    const getSubtitle = () => {
        const provider = props.data?.config?.provider || "stripe";
        const amount = props.data?.config?.amount || "0.00";
        return `${provider} • R$ ${amount}`;
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
            icon={CurrencyDollarIcon}
            color="bg-emerald-500"
            title="Pagamento"
            subtitle={getSubtitle()}
            status={getStatus()}
            inputs={[
                { id: "amount", label: "Valor", type: "number", required: true },
                { id: "customer", label: "Cliente", type: "object", required: true },
                { id: "method", label: "Método", type: "string", required: true },
            ]}
            outputs={[
                { id: "transactionId", label: "ID da Transação", type: "string" },
                { id: "status", label: "Status", type: "string" },
                { id: "receipt", label: "Recibo", type: "object" },
            ]}
            showStatus={true}
            isConfigurable={true}
        />
    );
};

// User Management Action Node
export const UserManagementActionNode: React.FC<NodeProps> = (props) => {
    const getSubtitle = () => {
        const operation = props.data?.config?.operation || "create";
        return `Usuário • ${operation}`;
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
            icon={UserIcon}
            color="bg-indigo-500"
            title="Gerenciar Usuário"
            subtitle={getSubtitle()}
            status={getStatus()}
            inputs={[
                { id: "userData", label: "Dados do Usuário", type: "object", required: true },
                { id: "operation", label: "Operação", type: "string", required: true },
            ]}
            outputs={[
                { id: "user", label: "Usuário", type: "object" },
                { id: "status", label: "Status", type: "string" },
            ]}
            showStatus={true}
            isConfigurable={true}
        />
    );
};

// Analytics Action Node
export const AnalyticsActionNode: React.FC<NodeProps> = (props) => {
    const getSubtitle = () => {
        const event = props.data?.config?.event || "custom_event";
        return `Analytics • ${event}`;
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
            color="bg-purple-500"
            title="Analytics"
            subtitle={getSubtitle()}
            status={getStatus()}
            inputs={[
                { id: "event", label: "Evento", type: "string", required: true },
                { id: "properties", label: "Propriedades", type: "object", required: false },
            ]}
            outputs={[
                { id: "tracked", label: "Rastreado", type: "boolean" },
                { id: "eventId", label: "ID do Evento", type: "string" },
            ]}
            showStatus={true}
            isConfigurable={true}
        />
    );
};

// System Action Node
export const SystemActionNode: React.FC<NodeProps> = (props) => {
    const getSubtitle = () => {
        const action = props.data?.config?.action || "restart";
        return `Sistema • ${action}`;
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
            color="bg-gray-600"
            title="Sistema"
            subtitle={getSubtitle()}
            status={getStatus()}
            inputs={[
                { id: "command", label: "Comando", type: "string", required: true },
                { id: "parameters", label: "Parâmetros", type: "object", required: false },
            ]}
            outputs={[
                { id: "result", label: "Resultado", type: "object" },
                { id: "status", label: "Status", type: "string" },
            ]}
            showStatus={true}
            isConfigurable={true}
        />
    );
};

// File Download Action Node
export const FileDownloadActionNode: React.FC<NodeProps> = (props) => {
    const getSubtitle = () => {
        const url = props.data?.config?.url || "https://example.com/file.pdf";
        return `Download • ${url.length > 20 ? url.substring(0, 20) + "..." : url}`;
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
            icon={DocumentArrowDownIcon}
            color="bg-cyan-500"
            title="Download"
            subtitle={getSubtitle()}
            status={getStatus()}
            inputs={[
                { id: "url", label: "URL", type: "string", required: true },
                { id: "filename", label: "Nome do Arquivo", type: "string", required: false },
            ]}
            outputs={[
                { id: "file", label: "Arquivo", type: "object" },
                { id: "path", label: "Caminho", type: "string" },
                { id: "size", label: "Tamanho", type: "number" },
            ]}
            showStatus={true}
            isConfigurable={true}
        />
    );
};

// Notification Action Node
export const NotificationActionNode: React.FC<NodeProps> = (props) => {
    const getSubtitle = () => {
        const type = props.data?.config?.type || "push";
        return `Notificação • ${type}`;
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
            icon={BellIcon}
            color="bg-pink-500"
            title="Notificação"
            subtitle={getSubtitle()}
            status={getStatus()}
            inputs={[
                { id: "user", label: "Usuário", type: "object", required: true },
                { id: "message", label: "Mensagem", type: "string", required: true },
                { id: "type", label: "Tipo", type: "string", required: true },
            ]}
            outputs={[
                { id: "notificationId", label: "ID da Notificação", type: "string" },
                { id: "status", label: "Status", type: "string" },
            ]}
            showStatus={true}
            isConfigurable={true}
        />
    );
};

// Security Action Node
export const SecurityActionNode: React.FC<NodeProps> = (props) => {
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
                { id: "data", label: "Dados", type: "object", required: true },
                { id: "key", label: "Chave", type: "string", required: true },
            ]}
            outputs={[
                { id: "result", label: "Resultado", type: "object" },
                { id: "status", label: "Status", type: "string" },
            ]}
            showStatus={true}
            isConfigurable={true}
        />
    );
};

// Data Transform Action Node
export const DataTransformActionNode: React.FC<NodeProps> = (props) => {
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
            color="bg-yellow-500"
            title="Transformar Dados"
            subtitle={getSubtitle()}
            status={getStatus()}
            inputs={[
                { id: "input", label: "Dados de Entrada", type: "object", required: true },
                { id: "mapping", label: "Mapeamento", type: "object", required: true },
            ]}
            outputs={[
                { id: "output", label: "Dados Transformados", type: "object" },
                { id: "status", label: "Status", type: "string" },
            ]}
            showStatus={true}
            isConfigurable={true}
        />
    );
};
