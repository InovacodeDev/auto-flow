import React, { ReactNode } from "react";
import { Navigate, useLocation } from "@tanstack/react-router";
import { useAuthEnhanced } from "../../hooks/useAuthEnhanced";

interface ProtectedRouteProps {
    children: ReactNode;
    requiredRole?: "admin" | "manager" | "user";
    fallbackPath?: string;
}

/**
 * Componente que protege rotas baseado em autenticação e role
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole, fallbackPath = "/login" }) => {
    const { isAuthenticated, user, isLoading } = useAuthEnhanced();
    const location = useLocation();

    // Aguarda verificação de autenticação
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Verificando autenticação...</p>
                </div>
            </div>
        );
    }

    // Redireciona para login se não autenticado
    if (!isAuthenticated) {
        return (
            <Navigate
                to={fallbackPath}
                search={{
                    redirect: location.pathname,
                }}
                replace
            />
        );
    }

    // Verifica role se especificada
    if (requiredRole && user) {
        const roleHierarchy = {
            user: 1,
            manager: 2,
            admin: 3,
        };

        const userLevel = roleHierarchy[user.role];
        const requiredLevel = roleHierarchy[requiredRole];

        if (userLevel < requiredLevel) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center max-w-md mx-auto">
                        <div className="bg-white rounded-lg shadow-lg p-8">
                            <div className="text-red-500 text-5xl mb-4">🚫</div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
                            <p className="text-gray-600 mb-6">
                                Você não tem permissão para acessar esta página. É necessário ter o papel de{" "}
                                <strong>{requiredRole}</strong> ou superior.
                            </p>
                            <button
                                onClick={() => window.history.back()}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Voltar
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
    }

    return <>{children}</>;
};
