import React from "react";
import { Navigate } from "@tanstack/react-router";
import { useAuthEnhanced } from "../../hooks/useAuthEnhanced";

/**
 * Componente que redireciona usuários baseado no status de autenticação
 */
export const AuthRedirect: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuthEnhanced();

    // Aguarda verificação de autenticação
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando...</p>
                </div>
            </div>
        );
    }

    // Redireciona baseado no status de autenticação
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    } else {
        return <Navigate to="/auth/login" replace />;
    }
};
