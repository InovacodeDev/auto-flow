import React, { useState } from "react";
import { MaterialIcon } from "../ui/MaterialIcon";
import { useExecuteWorkflow, useExecutionMonitor, useCancelExecution } from "../../services/executionService";

interface ExecutionMonitorProps {
    workflowId?: string;
    isOpen: boolean;
    onClose: () => void;
}

export const ExecutionMonitor: React.FC<ExecutionMonitorProps> = ({ workflowId, isOpen, onClose }) => {
    const [executionId, setExecutionId] = useState<string | null>(null);
    const [showLogs, setShowLogs] = useState(false);

    const executeWorkflowMutation = useExecuteWorkflow();
    const cancelExecutionMutation = useCancelExecution();
    const { status, logs, isLoading, isRunning, isCompleted, isFailed, isPending } = useExecutionMonitor(executionId);

    const handleExecute = async () => {
        if (!workflowId) return;

        try {
            const result = await executeWorkflowMutation.mutateAsync({
                workflowId,
                triggerData: { manual: true },
            });
            setExecutionId(result.executionId);
            setShowLogs(true);
        } catch (error) {
            console.error("Failed to execute workflow:", error);
        }
    };

    const handleCancel = async () => {
        if (!executionId) return;

        try {
            await cancelExecutionMutation.mutateAsync(executionId);
            setExecutionId(null);
            setShowLogs(false);
        } catch (error) {
            console.error("Failed to cancel execution:", error);
        }
    };

    const handleClose = () => {
        setExecutionId(null);
        setShowLogs(false);
        onClose();
    };

    const getStatusIcon = () => {
        if (isLoading) return <MaterialIcon icon="schedule" className="animate-spin text-blue-500" size={20} />;
        if (isCompleted) return <MaterialIcon icon="check_circle" className="text-green-500" size={20} />;
        if (isFailed) return <MaterialIcon icon="cancel" className="text-red-500" size={20} />;
        if (isRunning) return <MaterialIcon icon="play_arrow" className="text-blue-500" size={20} />;
        if (isPending) return <MaterialIcon icon="schedule" className="text-yellow-500" size={20} />;
        return null;
    };

    const getStatusColor = () => {
        if (isCompleted) return "text-green-600 bg-green-100";
        if (isFailed) return "text-red-600 bg-red-100";
        if (isRunning) return "text-blue-600 bg-blue-100";
        if (isPending) return "text-yellow-600 bg-yellow-100";
        return "text-gray-600 bg-gray-100";
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                        <MaterialIcon icon="play_arrow" className="mr-2 text-blue-500" size={24} />
                        Monitor de Execução
                    </h2>
                    <button
                        onClick={handleClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        <MaterialIcon icon="close" size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto">
                    {!executionId ? (
                        /* Start Execution */
                        <div className="text-center">
                            <div className="mb-6">
                                <MaterialIcon icon="play_arrow" className="text-gray-400 mx-auto mb-4" size={64} />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Executar Workflow</h3>
                                <p className="text-gray-600">
                                    Clique no botão abaixo para iniciar a execução do workflow
                                </p>
                            </div>

                            <button
                                onClick={handleExecute}
                                disabled={executeWorkflowMutation.isPending || !workflowId}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto"
                            >
                                {executeWorkflowMutation.isPending ? (
                                    <>
                                        <MaterialIcon icon="schedule" className="mr-2 animate-spin" size={20} />
                                        Iniciando...
                                    </>
                                ) : (
                                    <>
                                        <MaterialIcon icon="play_arrow" className="mr-2" size={20} />
                                        Executar Workflow
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        /* Execution Status */
                        <div className="space-y-6">
                            {/* Status */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">Status da Execução</h3>
                                    <div className="flex items-center space-x-2">
                                        {getStatusIcon()}
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}
                                        >
                                            {status || "Unknown"}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">ID da Execução:</span>
                                        <p className="font-mono text-gray-900">{executionId}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Workflow ID:</span>
                                        <p className="font-mono text-gray-900">{workflowId}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setShowLogs(!showLogs)}
                                    className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                    <MaterialIcon icon="visibility" className="mr-2" size={16} />
                                    {showLogs ? "Ocultar" : "Mostrar"} Logs
                                </button>

                                {(isRunning || isPending) && (
                                    <button
                                        onClick={handleCancel}
                                        disabled={cancelExecutionMutation.isPending}
                                        className="flex items-center px-4 py-2 text-red-700 bg-red-100 rounded-lg hover:bg-red-200 disabled:opacity-50"
                                    >
                                        <MaterialIcon icon="stop" className="mr-2" size={16} />
                                        Cancelar
                                    </button>
                                )}

                                {(isCompleted || isFailed) && (
                                    <button
                                        onClick={() => setExecutionId(null)}
                                        className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                    >
                                        <MaterialIcon icon="delete" className="mr-2" size={16} />
                                        Nova Execução
                                    </button>
                                )}
                            </div>

                            {/* Logs */}
                            {showLogs && (
                                <div className="bg-gray-900 rounded-lg p-4">
                                    <h4 className="text-white font-medium mb-3">Logs de Execução</h4>
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {logs.length === 0 ? (
                                            <p className="text-gray-400 text-sm">Nenhum log disponível</p>
                                        ) : (
                                            logs.map((log) => (
                                                <div key={log.id} className="flex items-start space-x-3 text-sm">
                                                    <span className="text-gray-500 font-mono text-xs">
                                                        {new Date(log.timestamp).toLocaleTimeString()}
                                                    </span>
                                                    <span
                                                        className={`font-medium ${
                                                            log.level === "error"
                                                                ? "text-red-400"
                                                                : log.level === "warn"
                                                                  ? "text-yellow-400"
                                                                  : log.level === "info"
                                                                    ? "text-blue-400"
                                                                    : "text-gray-400"
                                                        }`}
                                                    >
                                                        [{log.level.toUpperCase()}]
                                                    </span>
                                                    <span className="text-white">{log.message}</span>
                                                    {log.nodeId && (
                                                        <span className="text-gray-500">(Node: {log.nodeId})</span>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 flex justify-end">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};
