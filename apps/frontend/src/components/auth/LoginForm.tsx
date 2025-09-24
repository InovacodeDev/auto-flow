import React, { useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useAuthEnhanced } from "../../hooks/useAuthEnhanced";
import type { LoginCredentials } from "../../stores/authStore";

interface LoginSearchParams {
    redirect?: string;
}

/**
 * Componente de login do AutoFlow
 */
export const LoginForm: React.FC = () => {
    const navigate = useNavigate();
    const searchParams = useSearch({ from: "/login" }) as LoginSearchParams;
    const { login, isLoading, error, clearError } = useAuthEnhanced();

    const [formData, setFormData] = useState<LoginCredentials>({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        try {
            await login(formData);

            // Redireciona para a página solicitada ou dashboard
            const redirectTo = searchParams.redirect || "/dashboard";
            navigate({ to: redirectTo });
        } catch (err) {
            // Error já está sendo tratado no store
            console.error("Login error:", err);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="max-w-md w-full space-y-8 p-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">AutoFlow</h1>
                    <h2 className="text-xl text-gray-600 mb-8">Entre na sua conta</h2>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex">
                                <div className="text-red-400 text-xl mr-3">⚠️</div>
                                <div>
                                    <h3 className="text-sm font-medium text-red-800">Erro de autenticação</h3>
                                    <p className="mt-1 text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="seu@email.com"
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Senha
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Sua senha"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    disabled={isLoading}
                                >
                                    {showPassword ? "🙈" : "👁️"}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                    Lembrar de mim
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                                    Esqueceu a senha?
                                </a>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Entrando...
                                </div>
                            ) : (
                                "Entrar"
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Não tem uma conta?{" "}
                            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                                Registre-se gratuitamente
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="text-center text-sm text-gray-500">
                    <p>AutoFlow - Automação inteligente para PMEs brasileiras</p>
                </div>
            </div>
        </div>
    );
};
