import React from "react";
import { Handle, Position, NodeProps } from "reactflow";

interface WorkflowNodeData {
    label: string;
    type: string;
    category: string;
    icon: string;
    color: string;
    configured: boolean;
    required: boolean;
    config?: Record<string, any>;
}

export const WorkflowNodeComponent: React.FC<NodeProps<WorkflowNodeData>> = ({ data, selected }) => {
    const { label, icon, color, configured, required, category } = data;

    const getStatusColor = () => {
        if (required && !configured) return "border-red-400 bg-red-50";
        if (configured) return "border-green-400 bg-green-50";
        return "border-gray-300 bg-white";
    };

    const getStatusIcon = () => {
        if (required && !configured) return "⚠️";
        if (configured) return "✅";
        return "";
    };

    const showInputHandle = category !== "trigger";
    const showOutputHandle = true;

    return (
        <div
            className={`
      relative px-4 py-3 rounded-lg border-2 min-w-[160px] shadow-sm
      ${getStatusColor()}
      ${selected ? "ring-2 ring-blue-400 ring-offset-2" : ""}
      hover:shadow-md transition-shadow
    `}
        >
            {/* Input Handle - Only for non-trigger nodes */}
            {showInputHandle && (
                <Handle
                    type="target"
                    position={Position.Top}
                    className="w-3 h-3 bg-gray-400 border-2 border-white"
                    style={{ top: -6 }}
                />
            )}

            {/* Node Content */}
            <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                    <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                        style={{ backgroundColor: color }}
                    >
                        {icon}
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{label}</div>
                    <div className="text-xs text-gray-500 capitalize">{category}</div>
                </div>

                {/* Status Indicator */}
                {getStatusIcon() && (
                    <div className="flex-shrink-0">
                        <span className="text-sm">{getStatusIcon()}</span>
                    </div>
                )}
            </div>

            {/* Output Handle */}
            {showOutputHandle && (
                <Handle
                    type="source"
                    position={Position.Bottom}
                    className="w-3 h-3 bg-gray-400 border-2 border-white"
                    style={{ bottom: -6 }}
                />
            )}

            {/* Category Badge */}
            <div className="absolute -top-2 -left-2">
                <div
                    className="w-4 h-4 rounded-full border-2 border-white"
                    style={{ backgroundColor: color }}
                    title={category}
                />
            </div>
        </div>
    );
};
