import React, { useEffect } from "react";
import { useWorkflowCanvas } from "../../hooks/useWorkflowCanvas";

interface KeyboardShortcutsProps {
    workflowId?: string;
}

/**
 * Componente que gerencia atalhos de teclado para o canvas do workflow
 */
export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ workflowId }) => {
    const {
        saveWorkflow,
        clearCanvas,
        selectedNode,
        deleteNode,
        duplicateNode,
        isLibraryOpen,
        setIsLibraryOpen,
        isInspectorOpen,
        setIsInspectorOpen,
    } = useWorkflowCanvas(workflowId);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Ignorar se estiver digitando em um input
            if (
                event.target instanceof HTMLInputElement ||
                event.target instanceof HTMLTextAreaElement ||
                event.target instanceof HTMLSelectElement
            ) {
                return;
            }

            // Ctrl/Cmd + S - Salvar
            if ((event.ctrlKey || event.metaKey) && event.key === "s") {
                event.preventDefault();
                saveWorkflow();
                return;
            }

            // Ctrl/Cmd + N - Nova biblioteca
            if ((event.ctrlKey || event.metaKey) && event.key === "n") {
                event.preventDefault();
                setIsLibraryOpen(!isLibraryOpen);
                return;
            }

            // Ctrl/Cmd + I - Inspector
            if ((event.ctrlKey || event.metaKey) && event.key === "i") {
                event.preventDefault();
                setIsInspectorOpen(!isInspectorOpen);
                return;
            }

            // Delete - Deletar nó selecionado
            if (event.key === "Delete" && selectedNode) {
                event.preventDefault();
                deleteNode(selectedNode.id);
                return;
            }

            // Ctrl/Cmd + D - Duplicar nó selecionado
            if ((event.ctrlKey || event.metaKey) && event.key === "d" && selectedNode) {
                event.preventDefault();
                duplicateNode(selectedNode.id);
                return;
            }

            // Ctrl/Cmd + A - Selecionar todos os nós
            if ((event.ctrlKey || event.metaKey) && event.key === "a") {
                event.preventDefault();
                // TODO: Implementar seleção de todos os nós
                return;
            }

            // Escape - Fechar painéis
            if (event.key === "Escape") {
                setIsLibraryOpen(false);
                setIsInspectorOpen(false);
                return;
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [
        saveWorkflow,
        clearCanvas,
        selectedNode,
        deleteNode,
        duplicateNode,
        isLibraryOpen,
        setIsLibraryOpen,
        isInspectorOpen,
        setIsInspectorOpen,
    ]);

    return null; // Este componente não renderiza nada
};

/**
 * Hook para mostrar atalhos de teclado disponíveis
 */
export const useKeyboardShortcuts = () => {
    const shortcuts = [
        { key: "Ctrl/Cmd + S", description: "Salvar workflow" },
        { key: "Ctrl/Cmd + N", description: "Abrir/fechar biblioteca" },
        { key: "Ctrl/Cmd + I", description: "Abrir/fechar inspector" },
        { key: "Delete", description: "Deletar nó selecionado" },
        { key: "Ctrl/Cmd + D", description: "Duplicar nó selecionado" },
        { key: "Escape", description: "Fechar painéis" },
    ];

    return shortcuts;
};
