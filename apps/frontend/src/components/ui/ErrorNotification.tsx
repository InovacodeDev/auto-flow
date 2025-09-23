import React, { useEffect, useState } from "react";
import { useGlobalError } from "../../hooks/useGlobalError";

/**
 * Componente de notificação de erros
 * Mostra erros globais de forma não intrusiva
 */
export const ErrorNotification: React.FC = () => {
    const { authError, clearError } = useGlobalError();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (authError) {
            setIsVisible(true);

            // Auto-hide após 5 segundos
            const timer = setTimeout(() => {
                setIsVisible(false);
                clearError();
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [authError, clearError]);

    const handleClose = () => {
        setIsVisible(false);
        clearError();
    };

    if (!isVisible || !authError) {
        return null;
    }

    return (
        <div className="fixed top-4 left-4 z-50 max-w-md">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <div className="text-red-400 text-xl">⚠️</div>
                    </div>
                    <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium text-red-800">Erro</h3>
                        <p className="mt-1 text-sm text-red-700">{authError}</p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                        <button
                            onClick={handleClose}
                            className="text-red-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-md"
                        >
                            <span className="sr-only">Fechar</span>
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
