import React from "react";
import {
    PlayIcon,
    DocumentDuplicateIcon,
    TrashIcon,
    ArrowsPointingOutIcon,
    Bars3Icon,
    Cog6ToothIcon,
    DocumentTextIcon,
    Squares2X2Icon,
} from "@heroicons/react/24/outline";

interface WorkflowToolbarProps {
    onSave: () => void;
    onExecute: () => void;
    onClear: () => void;
    onFitView: () => void;
    onToggleLibrary: () => void;
    onToggleInspector: () => void;
    onToggleVersioning?: () => void;
    onOpenTemplates?: () => void;
    onOpenShowcase?: () => void;
    canExecute: boolean;
    readOnly: boolean;
}

export const WorkflowToolbar: React.FC<WorkflowToolbarProps> = ({
    onSave,
    onExecute,
    onClear,
    onFitView,
    onToggleLibrary,
    onToggleInspector,
    onOpenTemplates,
    onOpenShowcase,
    canExecute,
    readOnly,
}) => {
    return (
        <div className="absolute top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 shadow-sm z-10">
            <div className="flex items-center justify-between h-full px-4">
                {/* Lado esquerdo - Controles principais */}
                <div className="flex items-center space-x-3">
                    <button
                        onClick={onToggleLibrary}
                        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Biblioteca de Nodes"
                    >
                        <Bars3Icon className="w-4 h-4" />
                        <span>Nodes</span>
                    </button>

                    {onOpenTemplates && (
                        <button
                            onClick={onOpenTemplates}
                            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
                            title="Templates de Workflow"
                        >
                            <DocumentTextIcon className="w-4 h-4" />
                            <span>Templates</span>
                        </button>
                    )}

                    {onOpenShowcase && (
                        <button
                            onClick={onOpenShowcase}
                            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition-colors"
                            title="Galeria de Nós"
                        >
                            <Squares2X2Icon className="w-4 h-4" />
                            <span>Galeria</span>
                        </button>
                    )}

                    {!readOnly && (
                        <>
                            <button
                                onClick={onSave}
                                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                                title="Salvar Workflow"
                            >
                                <DocumentDuplicateIcon className="w-4 h-4" />
                                <span>Salvar</span>
                            </button>

                            <button
                                onClick={onExecute}
                                disabled={!canExecute}
                                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                    canExecute
                                        ? "text-white bg-green-600 hover:bg-green-700"
                                        : "text-gray-400 bg-gray-200 cursor-not-allowed"
                                }`}
                                title="Gerenciar Execuções"
                            >
                                <PlayIcon className="w-4 h-4" />
                                <span>Execuções</span>
                            </button>
                        </>
                    )}
                </div>

                {/* Centro - Título */}
                <div className="flex-1 text-center">
                    <h1 className="text-lg font-semibold text-gray-900">
                        Constructor Visual de Workflows
                    </h1>
                </div>

                {/* Lado direito - Controles de visualização */}
                <div className="flex items-center space-x-3">
                    <button
                        onClick={onFitView}
                        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Ajustar Visualização"
                    >
                        <ArrowsPointingOutIcon className="w-4 h-4" />
                        <span>Fit View</span>
                    </button>

                    <button
                        onClick={onToggleInspector}
                        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Inspector de Propriedades"
                    >
                        <Cog6ToothIcon className="w-4 h-4" />
                        <span>Inspector</span>
                    </button>

                    {!readOnly && (
                        <button
                            onClick={onClear}
                            className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            title="Limpar Canvas"
                        >
                            <TrashIcon className="w-4 h-4" />
                            <span>Limpar</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorkflowToolbar;
