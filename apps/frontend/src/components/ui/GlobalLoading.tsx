import React from "react";
import { useGlobalLoading } from "../../hooks/useGlobalLoading";

/**
 * Componente de loading global
 * Mostra indicador de loading quando há operações em andamento
 */
export const GlobalLoading: React.FC = () => {
    const { isLoading } = useGlobalLoading();

    if (!isLoading) {
        return null;
    }

    return (
        <div className="fixed top-4 right-4 z-50">
            <div className="bg-white rounded-lg shadow-lg p-4 flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">Carregando...</span>
            </div>
        </div>
    );
};
