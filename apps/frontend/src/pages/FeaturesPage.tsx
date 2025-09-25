import React from "react";
import { MaterialIcon } from "../components/ui/MaterialIcon";
import { FullLogo } from "../assets/logo";

const FeaturesPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <a href="/" className="flex items-center hover:opacity-80 transition-opacity">
                            <FullLogo className="h-8 w-auto" color="#1f2937" />
                        </a>
                        <nav className="hidden md:flex items-center space-x-8">
                            <a
                                href="/features"
                                className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-1 transition-colors"
                            >
                                Recursos
                            </a>
                            <a href="/integrations" className="text-gray-600 hover:text-gray-900 transition-colors">
                                Integrações
                            </a>
                            <a href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                                Preços
                            </a>
                            <a
                                href="/login"
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
                            >
                                Entrar
                            </a>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-20 pb-16 relative overflow-hidden">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                        Todos os recursos que sua
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            {" "}
                            empresa precisa
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        Descubra como o AutoFlow pode transformar sua operação com ferramentas poderosas e intuitivas
                    </p>
                </div>
            </section>

            {/* Core Features */}
            <section className="py-20 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Funcionalidades Principais</h2>
                        <p className="text-xl text-gray-600">
                            Tudo que você precisa para automatizar e escalar seu negócio
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Visual Workflow Builder */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                    <MaterialIcon icon="settings" className="text-white" size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">Constructor Visual</h3>
                                    <p className="text-gray-500">Drag & Drop intuitivo</p>
                                </div>
                            </div>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                Crie automações complexas sem código. Nossa interface visual permite que você construa
                                fluxos profissionais apenas arrastando e conectando blocos.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3">
                                    <MaterialIcon icon="check_circle" className="text-green-500" size={20} />
                                    <span>Interface drag-and-drop intuitiva</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <MaterialIcon icon="check_circle" className="text-green-500" size={20} />
                                    <span>Visualização em tempo real do fluxo</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <MaterialIcon icon="check_circle" className="text-green-500" size={20} />
                                    <span>Templates prontos para usar</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <MaterialIcon icon="check_circle" className="text-green-500" size={20} />
                                    <span>Conectores para 100+ serviços</span>
                                </li>
                            </ul>
                        </div>

                        {/* AI Assistant */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                                    <MaterialIcon icon="smart_toy" className="text-white" size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">Assistente IA</h3>
                                    <p className="text-gray-500">Conversação em português</p>
                                </div>
                            </div>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                Nossa IA entende português brasileiro e cria automações baseadas em conversas naturais.
                                Simplesmente descreva o que você quer e ela constrói para você.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3">
                                    <MaterialIcon icon="check_circle" className="text-green-500" size={20} />
                                    <span>Processamento de linguagem natural</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <MaterialIcon icon="check_circle" className="text-green-500" size={20} />
                                    <span>Sugestões inteligentes de otimização</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <MaterialIcon icon="check_circle" className="text-green-500" size={20} />
                                    <span>Correção automática de erros</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <MaterialIcon icon="check_circle" className="text-green-500" size={20} />
                                    <span>Documentação automática</span>
                                </li>
                            </ul>
                        </div>

                        {/* Analytics & Monitoring */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                    <MaterialIcon icon="analytics" className="text-white" size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">Analytics Avançado</h3>
                                    <p className="text-gray-500">Métricas em tempo real</p>
                                </div>
                            </div>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                Acompanhe o desempenho dos seus fluxos com dashboards interativos e relatórios
                                detalhados. Identifique gargalos e otimize continuamente.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3">
                                    <MaterialIcon icon="check_circle" className="text-green-500" size={20} />
                                    <span>Dashboards personalizáveis</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <MaterialIcon icon="check_circle" className="text-green-500" size={20} />
                                    <span>Relatórios automáticos por email</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <MaterialIcon icon="check_circle" className="text-green-500" size={20} />
                                    <span>Alertas inteligentes</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <MaterialIcon icon="check_circle" className="text-green-500" size={20} />
                                    <span>Histórico completo de execuções</span>
                                </li>
                            </ul>
                        </div>

                        {/* Security & Compliance */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
                                    <MaterialIcon icon="security" className="text-white" size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">Segurança & Compliance</h3>
                                    <p className="text-gray-500">LGPD e ISO 27001</p>
                                </div>
                            </div>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                Seus dados e os dos seus clientes ficam protegidos com criptografia de nível bancário e
                                conformidade total com regulamentações brasileiras.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3">
                                    <MaterialIcon icon="check_circle" className="text-green-500" size={20} />
                                    <span>Criptografia AES-256</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <MaterialIcon icon="check_circle" className="text-green-500" size={20} />
                                    <span>Conformidade LGPD</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <MaterialIcon icon="check_circle" className="text-green-500" size={20} />
                                    <span>Auditoria completa de acessos</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <MaterialIcon icon="check_circle" className="text-green-500" size={20} />
                                    <span>Backup automático 3x ao dia</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Additional Features */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">E muito mais...</h2>
                        <p className="text-xl text-gray-600">
                            Recursos adicionais que fazem a diferença no seu dia a dia
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <MaterialIcon icon="flash_on" className="text-yellow-500 mb-4" size={48} />
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Performance Otimizada</h3>
                            <p className="text-gray-600">
                                Execução ultra-rápida com cache inteligente e processamento distribuído.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <MaterialIcon icon="group" className="text-blue-500 mb-4" size={48} />
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Colaboração em Equipe</h3>
                            <p className="text-gray-600">
                                Trabalhe em equipe com controle de permissões granular e versionamento.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <MaterialIcon icon="schedule" className="text-green-500 mb-4" size={48} />
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Agendamento Flexível</h3>
                            <p className="text-gray-600">
                                Programe execuções com cron jobs avançados e triggers personalizados.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <MaterialIcon icon="description" className="text-purple-500 mb-4" size={48} />
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Documentação Automática</h3>
                            <p className="text-gray-600">
                                Gere documentação técnica e de negócio automaticamente dos seus fluxos.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <MaterialIcon icon="developer_mode" className="text-indigo-500 mb-4" size={48} />
                            <h3 className="text-xl font-bold text-gray-900 mb-3">API Poderosa</h3>
                            <p className="text-gray-600">
                                REST API completa para integrar com qualquer sistema existente.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <MaterialIcon icon="language" className="text-teal-500 mb-4" size={48} />
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Multi-tenant</h3>
                            <p className="text-gray-600">
                                Isolamento completo entre clientes com escalabilidade empresarial.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Pronto para testar todos esses recursos?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Comece gratuitamente e veja como o AutoFlow pode transformar sua empresa
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="/register"
                            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-xl inline-flex items-center justify-center gap-2"
                        >
                            Começar Grátis Agora
                            <MaterialIcon icon="rocket_launch" className="text-blue-600" size={20} />
                        </a>
                        <a
                            href="/pricing"
                            className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105"
                        >
                            Ver Preços
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default FeaturesPage;
