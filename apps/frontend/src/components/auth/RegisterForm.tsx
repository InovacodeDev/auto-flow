import React, { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuthEnhanced } from "../../hooks/useAuthEnhanced";
import type { RegisterData } from "../../stores/authStore";

/**
 * Componente de registro do AutoFlow
 */
export const RegisterForm: React.FC = () => {
    const navigate = useNavigate();
    const { register, isLoading, error, clearError } = useAuthEnhanced();

    const [formData, setFormData] = useState<RegisterData>({
        organization: {
            name: "",
            industry: "",
            size: "pequena",
            country: "BR",
        },
        user: {
            name: "",
            email: "",
            password: "",
            phone: "",
        },
        acceptedTerms: false,
        acceptedPrivacy: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

    // Validação de senha forte
    const validatePassword = (password: string): string[] => {
        const errors: string[] = [];

        if (password.length < 8) {
            errors.push("Mínimo de 8 caracteres");
        }
        if (!/[A-Z]/.test(password)) {
            errors.push("Pelo menos uma letra maiúscula");
        }
        if (!/[a-z]/.test(password)) {
            errors.push("Pelo menos uma letra minúscula");
        }
        if (!/\d/.test(password)) {
            errors.push("Pelo menos um número");
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push("Pelo menos um caractere especial");
        }

        return errors;
    };

    const handlePasswordChange = (password: string) => {
        setFormData((prev) => ({
            ...prev,
            user: { ...prev.user, password },
        }));

        const errors = validatePassword(password);
        setPasswordErrors(errors);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        // Validações
        if (passwordErrors.length > 0) {
            setPasswordErrors(["Senha não atende aos critérios de segurança"]);
            return;
        }

        if (formData.user.password !== confirmPassword) {
            setPasswordErrors(["As senhas não coincidem"]);
            return;
        }

        if (!formData.acceptedTerms || !formData.acceptedPrivacy) {
            setPasswordErrors(["Você deve aceitar os termos e a política de privacidade"]);
            return;
        }

        try {
            await register(formData);
            navigate({ to: "/dashboard" });
        } catch (err) {
            console.error("Registration error:", err);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData((prev) => ({
                ...prev,
                [name]: checked,
            }));
        } else if (name.startsWith("organization.")) {
            const field = name.split(".")[1];
            setFormData((prev) => ({
                ...prev,
                organization: {
                    ...prev.organization,
                    [field]: value,
                },
            }));
        } else if (name.startsWith("user.")) {
            const field = name.split(".")[1];
            setFormData((prev) => ({
                ...prev,
                user: {
                    ...prev.user,
                    [field]: value,
                },
            }));
        }
    };

    const industries = [
        "Tecnologia",
        "Varejo",
        "Serviços",
        "Educação",
        "Saúde",
        "Financeiro",
        "E-commerce",
        "Manufatura",
        "Consultoria",
        "Outros",
    ];

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">AutoFlow</h1>
                    <h2 className="text-xl text-gray-600 mb-8">Crie sua conta gratuitamente</h2>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex">
                                <div className="text-red-400 text-xl mr-3">⚠️</div>
                                <div>
                                    <h3 className="text-sm font-medium text-red-800">Erro no registro</h3>
                                    <p className="mt-1 text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {passwordErrors.length > 0 && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex">
                                <div className="text-red-400 text-xl mr-3">🔒</div>
                                <div>
                                    <h3 className="text-sm font-medium text-red-800">Problemas com a senha</h3>
                                    <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                                        {passwordErrors.map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Informações da Organização */}
                        <div className="border-b border-gray-200 pb-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Informações da Empresa</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label
                                        htmlFor="organization.name"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Nome da Empresa *
                                    </label>
                                    <input
                                        id="organization.name"
                                        name="organization.name"
                                        type="text"
                                        required
                                        value={formData.organization.name}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Minha Empresa Ltda"
                                        disabled={isLoading}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="organization.industry"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Setor *
                                    </label>
                                    <select
                                        id="organization.industry"
                                        name="organization.industry"
                                        required
                                        value={formData.organization.industry}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={isLoading}
                                    >
                                        <option value="">Selecione o setor</option>
                                        {industries.map((industry) => (
                                            <option key={industry} value={industry}>
                                                {industry}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="organization.size"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Tamanho *
                                    </label>
                                    <select
                                        id="organization.size"
                                        name="organization.size"
                                        required
                                        value={formData.organization.size}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        disabled={isLoading}
                                    >
                                        <option value="micro">Micro (até 9 funcionários)</option>
                                        <option value="pequena">Pequena (10-49 funcionários)</option>
                                        <option value="media">Média (50-249 funcionários)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Informações do Usuário */}
                        <div className="border-b border-gray-200 pb-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Seus Dados</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="user.name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Nome Completo *
                                    </label>
                                    <input
                                        id="user.name"
                                        name="user.name"
                                        type="text"
                                        required
                                        value={formData.user.name}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="João Silva"
                                        disabled={isLoading}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="user.email"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Email *
                                    </label>
                                    <input
                                        id="user.email"
                                        name="user.email"
                                        type="email"
                                        required
                                        value={formData.user.email}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="joao@empresa.com"
                                        disabled={isLoading}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="user.phone"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Telefone
                                    </label>
                                    <input
                                        id="user.phone"
                                        name="user.phone"
                                        type="tel"
                                        value={formData.user.phone}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="(11) 99999-9999"
                                        disabled={isLoading}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="user.password"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Senha *
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="user.password"
                                            name="user.password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={formData.user.password}
                                            onChange={(e) => handlePasswordChange(e.target.value)}
                                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Sua senha segura"
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

                                    {/* Indicador de força da senha */}
                                    {formData.user.password && (
                                        <div className="mt-2">
                                            <div className="flex items-center space-x-2">
                                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-300 ${
                                                            passwordErrors.length === 0
                                                                ? "bg-green-500"
                                                                : passwordErrors.length <= 2
                                                                  ? "bg-yellow-500"
                                                                  : "bg-red-500"
                                                        }`}
                                                        style={{
                                                            width: `${Math.max(0, 100 - passwordErrors.length * 20)}%`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {passwordErrors.length === 0
                                                        ? "Forte"
                                                        : passwordErrors.length <= 2
                                                          ? "Média"
                                                          : "Fraca"}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="confirmPassword"
                                        className="block text-sm font-medium text-gray-700 mb-2"
                                    >
                                        Confirmar Senha *
                                    </label>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Confirme sua senha"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Termos e Privacidade */}
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <input
                                    id="acceptedTerms"
                                    name="acceptedTerms"
                                    type="checkbox"
                                    checked={formData.acceptedTerms}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                                    disabled={isLoading}
                                />
                                <label htmlFor="acceptedTerms" className="ml-2 block text-sm text-gray-700">
                                    Aceito os{" "}
                                    <a href="#" className="text-blue-600 hover:text-blue-500 underline">
                                        Termos de Uso
                                    </a>{" "}
                                    do AutoFlow *
                                </label>
                            </div>

                            <div className="flex items-start">
                                <input
                                    id="acceptedPrivacy"
                                    name="acceptedPrivacy"
                                    type="checkbox"
                                    checked={formData.acceptedPrivacy}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                                    disabled={isLoading}
                                />
                                <label htmlFor="acceptedPrivacy" className="ml-2 block text-sm text-gray-700">
                                    Aceito a{" "}
                                    <a href="#" className="text-blue-600 hover:text-blue-500 underline">
                                        Política de Privacidade
                                    </a>{" "}
                                    e autorizo o tratamento dos meus dados *
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={
                                isLoading ||
                                passwordErrors.length > 0 ||
                                !formData.acceptedTerms ||
                                !formData.acceptedPrivacy
                            }
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Criando conta...
                                </div>
                            ) : (
                                "Criar conta gratuitamente"
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Já tem uma conta?{" "}
                            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                                Faça login aqui
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
