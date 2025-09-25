import React, { useState } from "react";
import { MaterialIcon } from "../ui/MaterialIcon";
import {
    useExecuteWorkflow,
    useWorkflowExecutions,
    useExecutionLogs,
    WorkflowExecution,
} from "../../services/executionService";

interface ExecutionPanelProps {
    workflowId: string;
    isOpen: boolean;
    onClose: () => void;
}

export const ExecutionPanel: React.FC<ExecutionPanelProps> = ({ workflowId, isOpen, onClose }) => {
    const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);
    const [showLogs, setShowLogs] = useState(false);

    const executeWorkflow = useExecuteWorkflow();
    const {
        data: executionsData,
        isLoading: executionsLoading,
        refetch: refetchExecutions,
    } = useWorkflowExecutions(workflowId, { enabled: isOpen });

    const { data: logsData, isLoading: logsLoading } = useExecutionLogs(selectedExecution?.id || "", {
        enabled: !!selectedExecution && showLogs,
    });

    const handleExecute = async () => {
        try {
            await executeWorkflow.mutateAsync({
                workflowId,
                request: { triggerType: "manual" },
            });
            // Recarregar lista de execuções
            setTimeout(() => refetchExecutions(), 1000);
        } catch (error) {
            console.error("Erro ao executar workflow:", error);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "running":
                return <MaterialIcon icon="schedule" className="text-blue-500 animate-spin" size={20} />;
            case "success":
                return <MaterialIcon icon="check_circle" className="text-green-500" size={20} />;
            case "failed":
                return <MaterialIcon icon="cancel" className="text-red-500" size={20} />;
            case "cancelled":
                return <MaterialIcon icon="warning" className="text-yellow-500" size={20} />;
            default:
                return <MaterialIcon icon="schedule" className="text-gray-500" size={20} />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "running":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "success":
                return "bg-green-100 text-green-800 border-green-200";
            case "failed":
                return "bg-red-100 text-red-800 border-red-200";
            case "cancelled":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const formatDuration = (duration?: number) => {
        if (!duration) return "-";
        if (duration < 1000) return `${duration}ms`;
        if (duration < 60000) return `${(duration / 1000).toFixed(1)}s`;
        return `${(duration / 60000).toFixed(1)}m`;
    };

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleString("pt-BR");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[80vh] flex flex-col">
                {/* Header */}
                <div className="border-b border-gray-200 p-6 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Execuções do Workflow</h2>
                            <p className="text-gray-600 mt-1">Histórico e logs de execução</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={handleExecute}
                                disabled={executeWorkflow.isPending}
                                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <MaterialIcon icon="play_arrow" size={16} />
                                <span>{executeWorkflow.isPending ? "Executando..." : "Executar Agora"}</span>
                            </button>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Executions List */}
                    <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Execuções Recentes</h3>

                            {executionsLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : executionsData?.executions?.length ? (
                                <div className="space-y-3">
                                    {executionsData.executions.map((execution) => (
                                        <div
                                            key={execution.id}
                                            onClick={() => {
                                                setSelectedExecution(execution);
                                                setShowLogs(true);
                                            }}
                                            className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                                                selectedExecution?.id === execution.id
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "border-gray-200 hover:border-gray-300"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center space-x-2">
                                                    {getStatusIcon(execution.status)}
                                                    <span
                                                        className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(execution.status)}`}
                                                    >
                                                        {execution.status.toUpperCase()}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {formatDuration(execution.duration)}
                                                </span>
                                            </div>

                                            <div className="text-sm text-gray-600">
                                                <div>Iniciado: {formatTimestamp(execution.startedAt)}</div>
                                                {execution.completedAt && (
                                                    <div>Concluído: {formatTimestamp(execution.completedAt)}</div>
                                                )}
                                                {execution.errorMessage && (
                                                    <div className="text-red-600 mt-1 truncate">
                                                        Erro: {execution.errorMessage}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <MaterialIcon icon="play_arrow" className="mx-auto mb-3 text-gray-300" size={48} />
                                    <p>Nenhuma execução encontrada</p>
                                    <p className="text-sm">Execute o workflow para ver o histórico</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Logs Panel */}
                    <div className="w-1/2 overflow-y-auto">
                        {selectedExecution ? (
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Logs da Execução</h3>
                                    <div className="flex items-center space-x-2">
                                        {getStatusIcon(selectedExecution.status)}
                                        <span
                                            className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(selectedExecution.status)}`}
                                        >
                                            {selectedExecution.status.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                {logsLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                    </div>
                                ) : logsData?.logs?.length ? (
                                    <div className="space-y-2">
                                        {logsData.logs.map((log) => (
                                            <div
                                                key={log.id}
                                                className={`p-3 rounded border-l-4 ${
                                                    log.level === "error"
                                                        ? "border-red-500 bg-red-50"
                                                        : log.level === "warn"
                                                          ? "border-yellow-500 bg-yellow-50"
                                                          : log.level === "debug"
                                                            ? "border-gray-500 bg-gray-50"
                                                            : "border-blue-500 bg-blue-50"
                                                }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <span
                                                                className={`px-1.5 py-0.5 text-xs font-medium rounded ${
                                                                    log.level === "error"
                                                                        ? "bg-red-200 text-red-800"
                                                                        : log.level === "warn"
                                                                          ? "bg-yellow-200 text-yellow-800"
                                                                          : log.level === "debug"
                                                                            ? "bg-gray-200 text-gray-800"
                                                                            : "bg-blue-200 text-blue-800"
                                                                }`}
                                                            >
                                                                {log.level.toUpperCase()}
                                                            </span>
                                                            <span className="text-xs text-gray-600">
                                                                {log.component}
                                                            </span>
                                                            {log.nodeId && (
                                                                <span className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                                                                    {log.nodeId}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-800">{log.message}</p>
                                                        {log.data && (
                                                            <details className="mt-2">
                                                                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                                                                    Ver dados
                                                                </summary>
                                                                <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                                                                    {JSON.stringify(log.data, null, 2)}
                                                                </pre>
                                                            </details>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-gray-500 ml-2">
                                                        {formatTimestamp(log.timestamp)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <p>Nenhum log encontrado para esta execução</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                <div className="text-center">
                                    <MaterialIcon icon="schedule" className="mx-auto mb-4 text-gray-300" size={64} />
                                    <p>Selecione uma execução para ver os logs</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExecutionPanel;
