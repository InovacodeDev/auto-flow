import React from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { MaterialIcon } from "../../ui/MaterialIcon";

export interface NodeStatus {
    status: "idle" | "running" | "success" | "error" | "warning";
    message?: string;
}

export interface BaseNodeProps extends NodeProps {
    icon: string;
    color: string;
    title: string;
    subtitle?: string;
    status?: NodeStatus;
    inputs?: Array<{ id: string; label: string; type: string; required?: boolean }>;
    outputs?: Array<{ id: string; label: string; type: string }>;
    showStatus?: boolean;
    isConfigurable?: boolean;
    hasError?: boolean;
}

const BaseNode: React.FC<BaseNodeProps> = ({
    data,
    selected,
    icon,
    color,
    title,
    subtitle,
    status,
    inputs = [],
    outputs = [],
    showStatus = true,
    isConfigurable = true,
    hasError = false,
}) => {
    const getStatusIcon = () => {
        if (!status) return null;

        switch (status.status) {
            case "running":
                return <MaterialIcon icon="schedule" className="text-blue-500 animate-spin" size={12} />;
            case "success":
                return <MaterialIcon icon="check_circle" className="text-green-500" size={12} />;
            case "error":
                return <MaterialIcon icon="cancel" className="text-red-500" size={12} />;
            case "warning":
                return <MaterialIcon icon="warning" className="text-yellow-500" size={12} />;
            default:
                return null;
        }
    };

    const getStatusColor = () => {
        if (!status) return "";

        switch (status.status) {
            case "running":
                return "border-blue-300 bg-blue-50";
            case "success":
                return "border-green-300 bg-green-50";
            case "error":
                return "border-red-300 bg-red-50";
            case "warning":
                return "border-yellow-300 bg-yellow-50";
            default:
                return "";
        }
    };

    return (
        <div
            className={`relative bg-white border-2 rounded-lg shadow-lg min-w-48 transition-all duration-200 ${
                selected ? "border-blue-500 shadow-xl" : "border-gray-200"
            } ${hasError ? "border-red-400" : ""} ${status ? getStatusColor() : ""}`}
        >
            {/* Header */}
            <div className={`flex items-center space-x-2 p-3 ${color} text-white rounded-t-lg`}>
                <MaterialIcon icon={icon} size={16} />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{data?.name || title}</p>
                    {subtitle && <p className="text-xs opacity-90 truncate">{subtitle}</p>}
                </div>
                {showStatus && status && <div className="flex items-center space-x-1">{getStatusIcon()}</div>}
            </div>

            {/* Content */}
            <div className="p-3">
                {data?.description && <p className="text-xs text-gray-600 mb-2 line-clamp-2">{data.description}</p>}

                {/* Configuration Summary */}
                {data?.config && (
                    <div className="space-y-1 mb-2">
                        {Object.entries(data.config)
                            .slice(0, 3)
                            .map(([key, value]) => (
                                <div key={key} className="text-xs">
                                    <span className="text-gray-500 capitalize">{key}:</span>{" "}
                                    <span className="text-gray-700 font-mono">
                                        {typeof value === "string" && value.length > 15
                                            ? `${value.substring(0, 15)}...`
                                            : String(value)}
                                    </span>
                                </div>
                            ))}
                    </div>
                )}

                {/* Status Message */}
                {status?.message && (
                    <div className="text-xs text-gray-600 bg-gray-100 p-2 rounded">{status.message}</div>
                )}

                {/* Configuration Indicator */}
                {isConfigurable && (
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">Configurável</span>
                        {data?.config && Object.keys(data.config).length > 0 && (
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        )}
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
                        top: `${20 + index * 25}px`,
                        background: input.required ? "#ef4444" : "#64748b",
                        width: 8,
                        height: 8,
                        border: "2px solid white",
                    }}
                    title={`${input.label} (${input.type})${input.required ? " - Obrigatório" : ""}`}
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
                        top: `${20 + index * 25}px`,
                        background: "#3b82f6",
                        width: 8,
                        height: 8,
                        border: "2px solid white",
                    }}
                    title={`${output.label} (${output.type})`}
                />
            ))}
        </div>
    );
};

export default BaseNode;
