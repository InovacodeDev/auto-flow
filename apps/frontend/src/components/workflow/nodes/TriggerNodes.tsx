import React from "react";
import { NodeProps } from "reactflow";
import BaseNode, { NodeStatus } from "./BaseNode";

// Manual Trigger Node
export const ManualTriggerNode: React.FC<NodeProps> = (props) => {
    const getStatus = (): NodeStatus | undefined => {
        if (props.data?.status) {
            return props.data.status;
        }
        return undefined;
    };

    return (
        <BaseNode
            {...props}
            icon="play_arrow"
            color="bg-green-500"
            title="Trigger Manual"
            subtitle="Inicia o workflow manualmente"
            status={getStatus()}
            outputs={[
                { id: "output", label: "Dados", type: "object" },
                { id: "trigger", label: "Trigger", type: "event" },
            ]}
            showStatus={true}
            isConfigurable={true}
        />
    );
};

// Webhook Trigger Node
export const WebhookTriggerNode: React.FC<NodeProps> = (props) => {
    const getSubtitle = () => {
        const method = props.data?.config?.method || "POST";
        const auth = props.data?.config?.authentication || "none";
        return `${method} Webhook • ${auth === "none" ? "Sem Auth" : "Com Auth"}`;
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
            icon="public"
            color="bg-blue-500"
            title="Webhook"
            subtitle={getSubtitle()}
            status={getStatus()}
            outputs={[
                { id: "data", label: "Dados Recebidos", type: "object" },
                { id: "headers", label: "Headers", type: "object" },
                { id: "query", label: "Query Params", type: "object" },
            ]}
            showStatus={true}
            isConfigurable={true}
        />
    );
};

// Schedule Trigger Node
export const ScheduleTriggerNode: React.FC<NodeProps> = (props) => {
    const getSubtitle = () => {
        const cron = props.data?.config?.cron || "0 9 * * 1-5";
        const timezone = props.data?.config?.timezone || "America/Sao_Paulo";
        return `${cron} • ${timezone}`;
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
            icon="schedule"
            color="bg-purple-500"
            title="Agendamento"
            subtitle={getSubtitle()}
            status={getStatus()}
            outputs={[
                { id: "timestamp", label: "Timestamp", type: "string" },
                { id: "schedule", label: "Agendamento", type: "object" },
            ]}
            showStatus={true}
            isConfigurable={true}
        />
    );
};

// Calendar Trigger Node
export const CalendarTriggerNode: React.FC<NodeProps> = (props) => {
    const getSubtitle = () => {
        const event = props.data?.config?.event || "created";
        const calendar = props.data?.config?.calendar || "primary";
        return `${event} • ${calendar}`;
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
            icon="calendar_today"
            color="bg-indigo-500"
            title="Calendário"
            subtitle={getSubtitle()}
            status={getStatus()}
            outputs={[
                { id: "event", label: "Evento", type: "object" },
                { id: "calendar", label: "Calendário", type: "object" },
            ]}
            showStatus={true}
            isConfigurable={true}
        />
    );
};

// Form Trigger Node
export const FormTriggerNode: React.FC<NodeProps> = (props) => {
    const getSubtitle = () => {
        const formId = props.data?.config?.formId || "form-123";
        return `Form ID: ${formId}`;
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
            icon="touch_app"
            color="bg-orange-500"
            title="Formulário"
            subtitle={getSubtitle()}
            status={getStatus()}
            outputs={[
                { id: "submission", label: "Submissão", type: "object" },
                { id: "fields", label: "Campos", type: "object" },
            ]}
            showStatus={true}
            isConfigurable={true}
        />
    );
};

// Notification Trigger Node
export const NotificationTriggerNode: React.FC<NodeProps> = (props) => {
    const getSubtitle = () => {
        const type = props.data?.config?.type || "push";
        return `Notificação ${type}`;
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
            icon="notifications"
            color="bg-pink-500"
            title="Notificação"
            subtitle={getSubtitle()}
            status={getStatus()}
            outputs={[
                { id: "notification", label: "Notificação", type: "object" },
                { id: "user", label: "Usuário", type: "object" },
            ]}
            showStatus={true}
            isConfigurable={true}
        />
    );
};

// Database Trigger Node
export const DatabaseTriggerNode: React.FC<NodeProps> = (props) => {
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
            icon="storage"
            color="bg-teal-500"
            title="Banco de Dados"
            subtitle={getSubtitle()}
            status={getStatus()}
            outputs={[
                { id: "record", label: "Registro", type: "object" },
                { id: "operation", label: "Operação", type: "string" },
            ]}
            showStatus={true}
            isConfigurable={true}
        />
    );
};
