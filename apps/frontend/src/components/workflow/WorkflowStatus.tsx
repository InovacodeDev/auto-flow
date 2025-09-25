import React from "react";
import { MaterialIcon } from "../ui/MaterialIcon";

interface WorkflowStatusProps {
    status: "draft" | "active" | "paused" | "archived";
    lastSaved?: Date;
    hasChanges?: boolean;
    isSaving?: boolean;
}

/**
 * Componente que mostra o status atual do workflow
 */
export const WorkflowStatus: React.FC<WorkflowStatusProps> = ({ status, lastSaved, hasChanges, isSaving }) => {
    const getStatusConfig = () => {
        switch (status) {
            case "draft":
                return {
                    icon: "schedule",
                    color: "text-yellow-600",
                    bgColor: "bg-yellow-100",
                    label: "Rascunho",
                };
            case "active":
                return {
                    icon: "check_circle",
                    color: "text-green-600",
                    bgColor: "bg-green-100",
                    label: "Ativo",
                };
            case "paused":
                return {
                    icon: "pause_circle",
                    color: "text-orange-600",
                    bgColor: "bg-orange-100",
                    label: "Pausado",
                };
            case "archived":
                return {
                    icon: "archive",
                    color: "text-gray-600",
                    bgColor: "bg-gray-100",
                    label: "Arquivado",
                };
            default:
                return {
                    icon: "schedule",
                    color: "text-gray-600",
                    bgColor: "bg-gray-100",
                    label: "Desconhecido",
                };
        }
    };

    const statusConfig = getStatusConfig();

    return (
        <div className="flex items-center space-x-3">
            {/* Status do workflow */}
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${statusConfig.bgColor}`}>
                <MaterialIcon icon={statusConfig.icon} className={statusConfig.color} size={16} />
                <span className={`text-sm font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
            </div>

            {/* Indicador de salvamento */}
            {isSaving && (
                <div className="flex items-center space-x-2 text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm">Salvando...</span>
                </div>
            )}

            {/* Indicador de mudanças não salvas */}
            {hasChanges && !isSaving && (
                <div className="flex items-center space-x-2 text-orange-600">
                    <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                    <span className="text-sm">Mudanças não salvas</span>
                </div>
            )}

            {/* Último salvamento */}
            {lastSaved && !hasChanges && !isSaving && (
                <div className="text-sm text-gray-500">Salvo em {lastSaved.toLocaleTimeString()}</div>
            )}
        </div>
    );
};
