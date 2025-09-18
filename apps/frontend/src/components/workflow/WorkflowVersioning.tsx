import React, { useState, useEffect } from "react";
import {
    DocumentDuplicateIcon,
    ClockIcon,
    UserIcon,
    TagIcon,
    EyeIcon,
    ArrowPathIcon,
} from "@heroicons/react/24/outline";

interface WorkflowVersion {
    id: string;
    version: number;
    name: string;
    description?: string;
    createdAt: string;
    createdBy: string;
    status: "active" | "inactive" | "draft";
    nodeCount: number;
    changes?: string[];
}

interface WorkflowVersioningProps {
    workflowId: string;
    currentVersion: number;
    onVersionSelect: (version: WorkflowVersion) => void;
    onCreateVersion: () => void;
    onRestoreVersion: (versionId: string) => void;
}

export const WorkflowVersioning: React.FC<WorkflowVersioningProps> = ({
    workflowId,
    currentVersion,
    onVersionSelect,
    onCreateVersion,
    onRestoreVersion,
}) => {
    const [versions, setVersions] = useState<WorkflowVersion[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVersion, setSelectedVersion] = useState<WorkflowVersion | null>(null);

    // Mock data para demonstração - em produção, viria da API
    useEffect(() => {
        const mockVersions: WorkflowVersion[] = [
            {
                id: "v3",
                version: 3,
                name: "Versão Atual",
                description: "Adicionado trigger de WhatsApp e condição de horário comercial",
                createdAt: "2024-09-18T10:30:00Z",
                createdBy: "João Silva",
                status: "active",
                nodeCount: 8,
                changes: ["Novo trigger WhatsApp", "Condição horário comercial", "Ação PIX automático"],
            },
            {
                id: "v2",
                version: 2,
                name: "Integração PIX",
                description: "Adicionada integração com pagamentos PIX",
                createdAt: "2024-09-17T15:45:00Z",
                createdBy: "Maria Santos",
                status: "inactive",
                nodeCount: 6,
                changes: ["Integração PIX Mercado Pago", "Webhook de confirmação"],
            },
            {
                id: "v1",
                version: 1,
                name: "Versão Inicial",
                description: "Primeira versão do workflow de vendas",
                createdAt: "2024-09-16T09:15:00Z",
                createdBy: "João Silva",
                status: "inactive",
                nodeCount: 4,
                changes: ["Workflow básico criado"],
            },
        ];

        setTimeout(() => {
            setVersions(mockVersions);
            setLoading(false);
        }, 1000);
    }, [workflowId]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("pt-BR");
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-800";
            case "inactive":
                return "bg-gray-100 text-gray-800";
            case "draft":
                return "bg-yellow-100 text-yellow-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    if (loading) {
        return (
            <div className="bg-white border-l border-gray-200 w-80 h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-white border-l border-gray-200 w-80 h-full overflow-y-auto">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Versionamento</h3>
                    <button
                        onClick={onCreateVersion}
                        className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <DocumentDuplicateIcon className="w-4 h-4" />
                        <span>Nova Versão</span>
                    </button>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                    Versão atual: <span className="font-medium">v{currentVersion}</span>
                </p>
            </div>

            {/* Versions List */}
            <div className="p-4 space-y-3">
                {versions.map((version) => (
                    <div
                        key={version.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                            selectedVersion?.id === version.id
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => {
                            setSelectedVersion(version);
                            onVersionSelect(version);
                        }}
                    >
                        {/* Version Header */}
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                                <TagIcon className="w-4 h-4 text-gray-500" />
                                <span className="font-medium text-gray-900">v{version.version}</span>
                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(version.status)}`}>
                                    {version.status === "active"
                                        ? "Ativa"
                                        : version.status === "draft"
                                          ? "Rascunho"
                                          : "Inativa"}
                                </span>
                            </div>
                            {version.status !== "active" && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRestoreVersion(version.id);
                                    }}
                                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                    title="Restaurar esta versão"
                                >
                                    <ArrowPathIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Version Info */}
                        <h4 className="font-medium text-gray-900 mb-1">{version.name}</h4>
                        {version.description && <p className="text-sm text-gray-600 mb-3">{version.description}</p>}

                        {/* Metadata */}
                        <div className="space-y-1 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                                <ClockIcon className="w-3 h-3" />
                                <span>{formatDate(version.createdAt)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <UserIcon className="w-3 h-3" />
                                <span>{version.createdBy}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <EyeIcon className="w-3 h-3" />
                                <span>{version.nodeCount} nodes</span>
                            </div>
                        </div>

                        {/* Changes */}
                        {version.changes && version.changes.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs font-medium text-gray-700 mb-1">Alterações:</p>
                                <ul className="text-xs text-gray-600 space-y-1">
                                    {version.changes.slice(0, 3).map((change, index) => (
                                        <li key={index} className="flex items-start space-x-1">
                                            <span className="text-gray-400">•</span>
                                            <span>{change}</span>
                                        </li>
                                    ))}
                                    {version.changes.length > 3 && (
                                        <li className="text-gray-400 italic">
                                            +{version.changes.length - 3} outras alterações
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-500 text-center">
                    As versões são criadas automaticamente quando você salva alterações significativas no workflow.
                </p>
            </div>
        </div>
    );
};

export default WorkflowVersioning;
