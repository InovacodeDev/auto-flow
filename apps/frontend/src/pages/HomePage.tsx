import React from "react";
import {
    ArrowRightIcon,
    CogIcon,
    ChatBubbleLeftRightIcon,
    ChartBarIcon,
    CloudArrowUpIcon,
    ShieldCheckIcon,
    PlayIcon,
    SparklesIcon,
    RocketLaunchIcon,
} from "@heroicons/react/24/outline";

const HomePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">AF</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">AutoFlow</span>
                        </div>
                        <nav className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                                Recursos
                            </a>
                            <a href="#integrations" className="text-gray-600 hover:text-gray-900 transition-colors">
                                Integrações
                            </a>
                            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
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
            <section className="pt-20 pb-32 relative overflow-hidden">
                {/* Background decorations */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl">
                        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute top-40 right-10 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-8 animate-bounce">
                            <SparklesIcon className="h-4 w-4" />
                            Novo: IA que cria automações conversando com você!
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                            Pare de fazer o mesmo
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                {" "}
                                trabalho
                            </span>
                            <br />
                            todo dia
                        </h1>

                        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                            AutoFlow automatiza seus processos chatos para você focar no que realmente importa:
                            <span className="font-semibold text-gray-900"> fazer sua empresa crescer</span>
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                            <a
                                href="/register"
                                className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl inline-flex items-center justify-center gap-2"
                            >
                                <RocketLaunchIcon className="h-5 w-5" />
                                Comece Grátis Agora
                                <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </a>
                            <button className="group border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 inline-flex items-center justify-center gap-2">
                                <PlayIcon className="h-5 w-5" />
                                Ver Demo (2 min)
                            </button>
                        </div>

                        <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                Teste grátis por 14 dias
                            </div>
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                Sem cartão de crédito
                            </div>
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                Suporte em português
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Chega de trabalho repetitivo</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Deixe a tecnologia trabalhar para você enquanto você foca em crescer seu negócio
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="group p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 hover:from-blue-100 hover:to-indigo-200 transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-blue-200">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <ChatBubbleLeftRightIcon className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Fale e pronto</h3>
                            <p className="text-gray-600">
                                Converse com nossa IA como se fosse um assistente. Diga o que você quer automatizar e
                                ela cria tudo para você.
                            </p>
                            <div className="mt-4 text-indigo-600 font-medium text-sm">
                                🤖 IA em português brasileiro
                            </div>
                        </div>

                        <div className="group p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 hover:from-green-100 hover:to-emerald-200 transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-green-200">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <CogIcon className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Conecta com tudo</h3>
                            <p className="text-gray-600">
                                WhatsApp, Email, PIX, seu ERP, planilhas... Tudo funcionando junto sem você precisar
                                mexer em nada.
                            </p>
                            <div className="mt-4 text-emerald-600 font-medium text-sm">
                                📱 +50 integrações nacionais
                            </div>
                        </div>

                        <div className="group p-6 rounded-xl bg-gradient-to-br from-purple-50 to-violet-100 hover:from-purple-100 hover:to-violet-200 transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-purple-200">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <ChartBarIcon className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Economiza seu tempo</h3>
                            <p className="text-gray-600">
                                Veja exatamente quantas horas você ganhou de volta e quanto dinheiro está economizando.
                                Resultados que você pode medir.
                            </p>
                            <div className="mt-4 text-violet-600 font-medium text-sm">
                                📊 Em média 20h/semana economizadas
                            </div>
                        </div>

                        <div className="group p-6 rounded-xl bg-gradient-to-br from-orange-50 to-red-100 hover:from-orange-100 hover:to-red-200 transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-orange-200">
                            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <CloudArrowUpIcon className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Só arrastar e soltar</h3>
                            <p className="text-gray-600">
                                Não precisa ser programador. Interface visual simples: arraste, solte, conecte e sua
                                automação está pronta.
                            </p>
                            <div className="mt-4 text-red-600 font-medium text-sm">🖱️ Zero código necessário</div>
                        </div>

                        <div className="group p-6 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-100 hover:from-teal-100 hover:to-cyan-200 transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-teal-200">
                            <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <ShieldCheckIcon className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Protege seus dados</h3>
                            <p className="text-gray-600">
                                Seus dados ficam seguros no Brasil, com criptografia de ponta e backup automático. Durma
                                tranquilo.
                            </p>
                            <div className="mt-4 text-cyan-600 font-medium text-sm">🔒 Certificado ISO 27001</div>
                        </div>

                        <div className="group p-6 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-100 hover:from-indigo-100 hover:to-blue-200 transition-all duration-300 transform hover:scale-105 hover:shadow-lg border border-indigo-200">
                            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <RocketLaunchIcon className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Nunca sai do ar</h3>
                            <p className="text-gray-600">
                                Sua empresa não para, e o AutoFlow também não. Sistema robusto que funciona 24/7, mesmo
                                nos picos de movimento.
                            </p>
                            <div className="mt-4 text-indigo-600 font-medium text-sm">⚡ 99.9% de disponibilidade</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-black/10"></div>
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
                    <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-white/5 rounded-full blur-2xl"></div>
                </div>

                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative">
                    <div className="animate-pulse">
                        <SparklesIcon className="h-16 w-16 text-white mx-auto mb-6 opacity-80" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Pare de perder tempo com tarefas repetitivas!
                    </h2>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        Mais de <span className="font-bold text-white">5.000 empresários</span> já economizam
                        <span className="font-bold text-white"> 20+ horas por semana</span> com o AutoFlow
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                        <a
                            href="/register"
                            className="group bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-xl inline-flex items-center justify-center gap-2"
                        >
                            Começar Grátis Agora
                            <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </a>
                        <a
                            href="/login"
                            className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105"
                        >
                            Já tenho conta
                        </a>
                    </div>

                    <div className="flex items-center justify-center space-x-8 text-sm text-blue-100">
                        <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                            Sem compromisso
                        </div>
                        <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                            Suporte em português
                        </div>
                        <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                            Resultados em 24h
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">AF</span>
                                </div>
                                <span className="text-xl font-bold">AutoFlow</span>
                            </div>
                            <p className="text-gray-400 mb-4 max-w-md">
                                A plataforma de automação mais completa para PMEs brasileiras. Transforme processos
                                manuais em fluxos inteligentes.
                            </p>
                            <div className="text-sm text-gray-500">© 2024 AutoFlow. Todos os direitos reservados.</div>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Produto</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        Central de Ajuda
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        Contato
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        WhatsApp
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        Status
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
