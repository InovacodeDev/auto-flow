import React from "react";
import { Handle, Position, NodeProps } from "reactflow";
import {
    PlayIcon,
    GlobeAltIcon,
    ClockIcon,
    EnvelopeIcon,
    DocumentTextIcon,
    FunnelIcon,
    BoltIcon,
} from "@heroicons/react/24/outline";

// Base Node Component
interface BaseNodeProps extends NodeProps {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    title: string;
    subtitle?: string;
    inputs?: Array<{ id: string; label: string; type: string }>;
    outputs?: Array<{ id: string; label: string; type: string }>;
}

const BaseNode: React.FC<BaseNodeProps> = ({
    data,
    selected,
    icon: Icon,
    color,
    title,
    subtitle,
    inputs = [],
    outputs = [],
}) => {
    return (
        <div
            className={`relative bg-white border-2 rounded-lg shadow-lg min-w-40 ${
                selected ? "border-blue-500" : "border-gray-200"
            }`}
        >
            {/* Header */}
            <div className={`flex items-center space-x-2 p-3 ${color} text-white rounded-t-lg`}>
                <Icon className="w-4 h-4" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{data?.name || title}</p>
                    {subtitle && <p className="text-xs opacity-90 truncate">{subtitle}</p>}
                </div>
            </div>

            {/* Content */}
            <div className="p-3">
                {data?.description && <p className="text-xs text-gray-600 mb-2 line-clamp-2">{data.description}</p>}

                {/* Configuration Summary */}
                {data?.config && (
                    <div className="space-y-1">
                        {Object.entries(data.config)
                            .slice(0, 2)
                            .map(([key, value]) => (
                                <div key={key} className="text-xs">
                                    <span className="text-gray-500 capitalize">{key}:</span>{" "}
                                    <span className="text-gray-700 font-mono">
                                        {typeof value === "string" && value.length > 20
                                            ? `${value.substring(0, 20)}...`
                                            : String(value)}
                                    </span>
                                </div>
                            ))}
                    </div>
                )}
            </div>

            {/* Input Handles */}
            {inputs.map((input, index) => (
                <Handle
                    key={input.id}
                    type="target"
                    position={Position.Left}
                    id={input.id}
                    style={{
                        top: `${20 + index * 20}px`,
                        background: "#64748b",
                        width: 8,
                        height: 8,
                    }}
                    title={input.label}
                />
            ))}

            {/* Output Handles */}
            {outputs.map((output, index) => (
                <Handle
                    key={output.id}
                    type="source"
                    position={Position.Right}
                    id={output.id}
                    style={{
                        top: `${20 + index * 20}px`,
                        background: "#3b82f6",
                        width: 8,
                        height: 8,
                    }}
                    title={output.label}
                />
            ))}
        </div>
    );
};

// Trigger Nodes
export const TriggerNode = ({ ...props }: NodeProps) => {
    const getIcon = () => {
        switch (props.data?.nodeType) {
            case "webhook_trigger":
                return GlobeAltIcon;
            case "schedule_trigger":
                return ClockIcon;
            default:
                return PlayIcon;
        }
    };

    const getSubtitle = () => {
        switch (props.data?.nodeType) {
            case "webhook_trigger":
                return `${props.data?.method || "POST"} Webhook`;
            case "schedule_trigger":
                return props.data?.cron || "Agendado";
            default:
                return "Trigger Manual";
        }
    };

    return (
        <BaseNode
            {...props}
            icon={getIcon()}
            color="bg-green-500"
            title="Trigger"
            subtitle={getSubtitle()}
            outputs={[{ id: "output", label: "Saída", type: "any" }]}
        />
    );
};

// Action Nodes
export const ActionNode = ({ ...props }: NodeProps) => {
    const getIcon = () => {
        switch (props.data?.nodeType) {
            case "http_request":
                return GlobeAltIcon;
            case "send_email":
                return EnvelopeIcon;
            case "database_save":
                return DocumentTextIcon;
            default:
                return BoltIcon;
        }
    };

    const getSubtitle = () => {
        switch (props.data?.nodeType) {
            case "http_request":
                return `${props.data?.method || "GET"} Request`;
            case "send_email":
                return `Email via ${props.data?.provider || "SMTP"}`;
            case "database_save":
                return `${props.data?.operation || "insert"} em ${props.data?.table || "tabela"}`;
            default:
                return "Ação";
        }
    };

    return (
        <BaseNode
            {...props}
            icon={getIcon()}
            color="bg-blue-500"
            title="Ação"
            subtitle={getSubtitle()}
            inputs={[{ id: "input", label: "Entrada", type: "any" }]}
            outputs={[{ id: "output", label: "Saída", type: "any" }]}
        />
    );
};

// Condition Nodes
export const ConditionNode = ({ ...props }: NodeProps) => {
    return (
        <BaseNode
            {...props}
            icon={FunnelIcon}
            color="bg-yellow-500"
            title="Condição"
            subtitle={props.data?.condition ? "IF/ELSE" : "Sem condição"}
            inputs={[{ id: "input", label: "Entrada", type: "any" }]}
            outputs={[
                { id: "true", label: "Verdadeiro", type: "any" },
                { id: "false", label: "Falso", type: "any" },
            ]}
        />
    );
};

// Utility Node
export const UtilityNode: React.FC<NodeProps> = (props) => {
    const getIcon = () => {
        switch (props.data?.nodeType) {
            case "delay":
                return ClockIcon;
            default:
                return BoltIcon;
        }
    };

    const getSubtitle = () => {
        switch (props.data?.nodeType) {
            case "delay": {
                const duration = props.data?.duration || 0;
                const unit = props.data?.unit || "ms";
                return `Aguardar ${duration}${unit}`;
            }
            default:
                return "Utilidade";
        }
    };

    return (
        <BaseNode
            {...props}
            icon={getIcon()}
            color="bg-gray-500"
            title="Utilidade"
            subtitle={getSubtitle()}
            inputs={[{ id: "input", label: "Entrada", type: "any" }]}
            outputs={[{ id: "output", label: "Saída", type: "any" }]}
        />
    );
};
