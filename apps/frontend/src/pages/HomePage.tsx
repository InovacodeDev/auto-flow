import React from "react";
import { motion } from "framer-motion";

// Workaround: create typed aliases for motion primitives to avoid generic inference issues
// with the project's TypeScript/react versions. These keep typing loose for UI components.
const MDiv = motion.div as unknown as any;
const MH1 = motion.h1 as unknown as any;
const MP = motion.p as unknown as any;
const MA = motion.a as unknown as any;
const MButton = motion.button as unknown as any;
import { MaterialIcon } from "../components/ui/MaterialIcon";
import CompanyLogo from "../components/ui/CompanyLogo";
import { FullLogo } from "../assets/logo";

const HomePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center">
                            <FullLogo className="h-8 w-auto" color="#1f2937" />
                        </div>
                        <nav className="hidden md:flex items-center space-x-8">
                            <a href="/features" className="text-gray-600 hover:text-gray-900 transition-colors">
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
            <section className="pt-20 pb-32 relative overflow-hidden">
                {/* Background decorations (animated via framer-motion) */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl">
                        <MDiv
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl"
                        />
                        <MDiv
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1.4, ease: "easeOut", delay: 0.1 }}
                            className="absolute top-40 right-10 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl"
                        />
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center max-w-4xl mx-auto">
                        <MDiv
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-8"
                        >
                            <MaterialIcon icon="auto_awesome" className="text-blue-800" size={16} />
                            Novo: IA que cria automações conversando com você!
                        </MDiv>

                        <MH1
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.05 }}
                            className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight"
                        >
                            Pare de fazer o mesmo
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                {" "}
                                trabalho
                            </span>
                            <br />
                            todo dia
                        </MH1>

                        <MP
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.12 }}
                            className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
                        >
                            AutoFlow automatiza seus processos chatos para você focar no que realmente importa:
                            <span className="font-semibold text-gray-900"> fazer sua empresa crescer</span>
                        </MP>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                            <MA
                                href="/register"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.18 }}
                                className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 hover:shadow-xl inline-flex items-center justify-center gap-2"
                            >
                                <MaterialIcon icon="rocket_launch" className="text-white" size={20} />
                                Comece Grátis Agora
                                <MaterialIcon
                                    icon="arrow_forward"
                                    className="text-white group-hover:translate-x-1 transition-transform"
                                    size={20}
                                />
                            </MA>
                            <MButton
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.22 }}
                                className="group border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 inline-flex items-center justify-center gap-2"
                            >
                                <MaterialIcon icon="play_arrow" className="text-gray-700" size={20} />
                                Ver Demo (2 min)
                            </MButton>
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
                                <MaterialIcon icon="smart_toy" className="text-white" size={24} />
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
                                <MaterialIcon icon="hub" className="text-white" size={24} />
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
                                <MaterialIcon icon="analytics" className="text-white" size={24} />
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
                                <MaterialIcon icon="cloud_upload" className="text-white" size={24} />
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
                                <MaterialIcon icon="security" className="text-white" size={24} />
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
                                <MaterialIcon icon="rocket_launch" className="text-white" size={24} />
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

            {/* Integrations Preview */}
            <section id="integrations" className="py-20 bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Conecta com tudo que você já usa</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Mais de 100 integrações nativas com WhatsApp, PIX, ERPs e muito mais
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
                        {[
                            { name: "WhatsApp", logo: "whatsapp" },
                            { name: "PIX", logo: "pix" },
                            { name: "Omie", logo: "omie" },
                            { name: "Google", logo: "google" },
                            { name: "Google Sheets", logo: "google" },
                            { name: "Bling", logo: "bling" },
                            { name: "Mercado Pago", logo: "mercadopago" },
                            { name: "Shopify", logo: "shopify" },
                            { name: "Slack", logo: "slack" },
                            { name: "Trello", logo: "trello" },
                            { name: "MySQL", logo: "mysql" },
                            { name: "Telegram", logo: "telegram" },
                        ].map((integration, index) => (
                            <div key={index} className="flex flex-col items-center group">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-md border border-gray-100">
                                    <CompanyLogo company={integration.logo as any} size={40} />
                                </div>
                                <span className="text-sm text-gray-600 font-medium">{integration.name}</span>
                            </div>
                        ))}
                    </div>

                    <div className="text-center">
                        <p className="text-gray-600 mb-6">E muito mais! Veja todas as integrações disponíveis</p>
                        <a
                            href="/integrations"
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
                        >
                            Ver Todas as Integrações
                            <MaterialIcon icon="arrow_forward" size={20} />
                        </a>
                    </div>
                </div>
            </section>

            {/* Pricing Preview */}
            <section id="pricing" className="py-20 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Preços transparentes e justos</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Comece grátis e pague apenas pelo que usar. Sem surpresas, sem taxas escondidas.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        {/* Free Plan */}
                        <div className="bg-gray-50 rounded-2xl p-8 text-center">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Gratuito</h3>
                            <div className="text-4xl font-bold text-gray-900 mb-4">
                                R$ 0<span className="text-lg text-gray-500">/mês</span>
                            </div>
                            <ul className="space-y-3 mb-8 text-left">
                                <li className="flex items-center gap-3">
                                    <MaterialIcon icon="check_circle" className="text-green-500" size={20} />
                                    <span>100 execuções/mês</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <MaterialIcon icon="check_circle" className="text-green-500" size={20} />
                                    <span>3 fluxos ativos</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <MaterialIcon icon="check_circle" className="text-green-500" size={20} />
                                    <span>Integrações básicas</span>
                                </li>
                            </ul>
                            <a
                                href="/register"
                                className="block w-full bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                            >
                                Começar Grátis
                            </a>
                        </div>

                        {/* Pro Plan - Featured */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8 text-center relative border-2 border-blue-500 transform scale-105">
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-6 py-2 rounded-full text-sm font-medium">
                                Mais Popular
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Profissional</h3>
                            <div className="text-4xl font-bold text-gray-900 mb-4">
                                R$ 97<span className="text-lg text-gray-500">/mês</span>
                            </div>
                            <ul className="space-y-3 mb-8 text-left">
                                <li className="flex items-center gap-3">
                                    <MaterialIcon icon="check_circle" className="text-green-500" size={20} />
                                    <span>5.000 execuções/mês</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <MaterialIcon icon="check_circle" className="text-green-500" size={20} />
                                    <span>Fluxos ilimitados</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <MaterialIcon icon="check_circle" className="text-green-500" size={20} />
                                    <span>IA conversacional</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <MaterialIcon icon="check_circle" className="text-green-500" size={20} />
                                    <span>Todas as integrações</span>
                                </li>
                            </ul>
                            <a
                                href="/register"
                                className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Testar 14 Dias Grátis
                            </a>
                        </div>

                        {/* Enterprise Plan */}
                        <div className="bg-gray-900 rounded-2xl p-8 text-center text-white">
                            <h3 className="text-2xl font-bold mb-2">Empresarial</h3>
                            <div className="text-4xl font-bold mb-4">
                                R$ 297<span className="text-lg text-gray-400">/mês</span>
                            </div>
                            <ul className="space-y-3 mb-8 text-left">
                                <li className="flex items-center gap-3">
                                    <MaterialIcon icon="check_circle" className="text-green-500" size={20} />
                                    <span>Execuções ilimitadas</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <MaterialIcon icon="check_circle" className="text-green-500" size={20} />
                                    <span>Integrações customizadas</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <MaterialIcon icon="check_circle" className="text-green-500" size={20} />
                                    <span>Suporte prioritário 24/7</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <MaterialIcon icon="check_circle" className="text-green-500" size={20} />
                                    <span>SLA 99.9%</span>
                                </li>
                            </ul>
                            <a
                                href="/register"
                                className="block w-full bg-white text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                            >
                                Falar com Especialista
                            </a>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-gray-600 mb-6">Quer conhecer todos os detalhes dos nossos planos?</p>
                        <a
                            href="/pricing"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                        >
                            Ver Comparação Completa dos Planos
                            <MaterialIcon icon="arrow_forward" size={16} />
                        </a>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-black/10"></div>
                    <MDiv
                        initial={{ scale: 0.95, opacity: 0.08 }}
                        animate={{ scale: 1, opacity: 0.12 }}
                        transition={{ duration: 1.2 }}
                        className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-xl"
                    />
                    <MDiv
                        initial={{ scale: 0.95, opacity: 0.04 }}
                        animate={{ scale: 1, opacity: 0.06 }}
                        transition={{ duration: 1.4, delay: 0.06 }}
                        className="absolute -bottom-10 -left-10 w-60 h-60 bg-white/5 rounded-full blur-2xl"
                    />
                </div>

                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative">
                    <MDiv
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.7 }}
                        className="mb-6"
                    >
                        <MaterialIcon icon="auto_awesome" className="text-white mx-auto mb-6 opacity-80" size={64} />
                    </MDiv>

                    <MH1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="text-4xl md:text-5xl font-bold text-white mb-6"
                    >
                        Pare de perder tempo com tarefas repetitivas!
                    </MH1>

                    <MP
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.06 }}
                        className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto"
                    >
                        Mais de <span className="font-bold text-white">5.000 empresários</span> já economizam
                        <span className="font-bold text-white"> 20+ horas por semana</span> com o AutoFlow
                    </MP>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                        <MA
                            href="/register"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ y: 8, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="group bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-xl inline-flex items-center justify-center gap-2"
                        >
                            Começar Grátis Agora
                            <MaterialIcon
                                icon="arrow_forward"
                                className="group-hover:translate-x-1 transition-transform"
                                size={20}
                            />
                        </MA>
                        <MButton
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.08 }}
                            className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105"
                        >
                            Já tenho conta
                        </MButton>
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
                            <div className="flex items-center mb-4">
                                <FullLogo className="h-8 w-auto" fill="#6A7282" />
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
                                    <a href="/features" className="hover:text-white transition-colors">
                                        Recursos
                                    </a>
                                </li>
                                <li>
                                    <a href="/integrations" className="hover:text-white transition-colors">
                                        Integrações
                                    </a>
                                </li>
                                <li>
                                    <a href="/pricing" className="hover:text-white transition-colors">
                                        Preços
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        Suporte
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Suporte</h4>
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
