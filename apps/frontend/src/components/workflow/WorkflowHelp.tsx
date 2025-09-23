import React, { useState } from "react";
import { QuestionMarkCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useKeyboardShortcuts } from "./KeyboardShortcuts";

interface WorkflowHelpProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Componente de ajuda e dicas para o construtor de workflows
 */
export const WorkflowHelp: React.FC<WorkflowHelpProps> = ({ isOpen, onClose }) => {
    const shortcuts = useKeyboardShortcuts();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Ajuda - Construtor de Workflows
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Atalhos de teclado */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Atalhos de Teclado
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {shortcuts.map((shortcut, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <span className="text-sm text-gray-600">
                                        {shortcut.description}
                                    </span>
                                    <kbd className="px-2 py-1 text-xs font-mono bg-gray-200 text-gray-700 rounded">
                                        {shortcut.key}
                                    </kbd>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Dicas de uso */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Dicas de Uso</h3>
                        <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                                    1
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        Adicionar Nós
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Clique em um nó na biblioteca para adicioná-lo ao canvas.
                                        Arraste para posicionar.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                                    2
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        Conectar Nós
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Arraste das saídas (círculos azuis) para as entradas
                                        (círculos cinzas) dos nós.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                                    3
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        Configurar Nós
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Clique em um nó para abrir o inspector e configurar suas
                                        propriedades.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                                    4
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        Salvar Workflow
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Use Ctrl+S para salvar ou clique no botão "Salvar" na
                                        toolbar.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tipos de nós */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Tipos de Nós</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-green-50 rounded-lg">
                                <h4 className="font-medium text-green-900 mb-2">Triggers</h4>
                                <p className="text-sm text-green-700">
                                    Iniciam o workflow. Podem ser manuais, webhooks ou agendados.
                                </p>
                            </div>

                            <div className="p-4 bg-blue-50 rounded-lg">
                                <h4 className="font-medium text-blue-900 mb-2">Ações</h4>
                                <p className="text-sm text-blue-700">
                                    Executam operações como requisições HTTP, envio de emails, etc.
                                </p>
                            </div>

                            <div className="p-4 bg-yellow-50 rounded-lg">
                                <h4 className="font-medium text-yellow-900 mb-2">Condições</h4>
                                <p className="text-sm text-yellow-700">
                                    Avaliam condições e direcionam o fluxo do workflow.
                                </p>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2">Utilidades</h4>
                                <p className="text-sm text-gray-700">
                                    Funções auxiliares como delays, transformações de dados, etc.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                    <p className="text-sm text-gray-600">
                        Precisa de mais ajuda? Entre em contato com o suporte.
                    </p>
                </div>
            </div>
        </div>
    );
};

/**
 * Botão flutuante de ajuda
 */
export const HelpButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-6 left-6 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center justify-center z-40"
            title="Ajuda e Dicas"
        >
            <QuestionMarkCircleIcon className="w-6 h-6" />
        </button>
    );
};
