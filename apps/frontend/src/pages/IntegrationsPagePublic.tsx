import React from "react";
import { MaterialIcon } from "../components/ui/MaterialIcon";
import CompanyLogo from "../components/ui/CompanyLogo";
import { FullLogo } from "../assets/logo";

const IntegrationsPage: React.FC = () => {
    const integrations = [
        {
            category: "Comunicação",
            color: "green",
            icon: "chat",
            items: [
                {
                    name: "WhatsApp Business",
                    description: "Atendimento automatizado e marketing",
                    verified: true,
                    logo: "whatsapp",
                },
                { name: "Telegram", description: "Bots e notificações automáticas", verified: true, logo: "telegram" },
                {
                    name: "Email Marketing",
                    description: "Mailchimp, SendGrid, Amazon SES",
                    verified: true,
                    logo: "mailchimp",
                },
                { name: "SMS", description: "Zenvia, Twilio, Total Voice", verified: true },
                { name: "Slack", description: "Notificações e colaboração", verified: true },
                { name: "Microsoft Teams", description: "Comunicação empresarial", verified: true, logo: "microsoft" },
            ],
        },
        {
            category: "Pagamentos",
            color: "blue",
            icon: "credit_card",
            items: [
                { name: "PIX", description: "Todos os bancos brasileiros", verified: true, logo: "pix" },
                { name: "Mercado Pago", description: "Pagamentos e cobranças", verified: true, logo: "mercadopago" },
                { name: "PagSeguro", description: "Gateway de pagamento completo", verified: true },
                { name: "Stripe", description: "Pagamentos internacionais", verified: true },
                { name: "PayPal", description: "Pagamentos globais", verified: true },
                { name: "Cielo", description: "Processamento de cartões", verified: true },
            ],
        },
        {
            category: "ERP & Gestão",
            color: "purple",
            icon: "business",
            items: [
                { name: "Omie", description: "ERP completo para PMEs", verified: true, logo: "omie" },
                { name: "Bling", description: "Gestão de vendas e estoque", verified: true },
                { name: "Tiny ERP", description: "Sistema de gestão integrado", verified: true },
                { name: "SAP", description: "Sistema empresarial", verified: true },
                { name: "Protheus", description: "ERP Totvs", verified: true, logo: "protheus" },
                { name: "Senior", description: "Gestão empresarial", verified: true },
            ],
        },
        {
            category: "Planilhas & Dados",
            color: "orange",
            icon: "table_chart",
            items: [
                { name: "Google Sheets", description: "Planilhas colaborativas", verified: true, logo: "google" },
                { name: "Microsoft Excel", description: "Excel Online e Desktop", verified: true, logo: "microsoft" },
                { name: "Airtable", description: "Base de dados visual", verified: true },
                { name: "MySQL", description: "Banco de dados relacional", verified: true },
                { name: "PostgreSQL", description: "Banco de dados avançado", verified: true },
                { name: "MongoDB", description: "Banco de dados NoSQL", verified: true },
            ],
        },
        {
            category: "E-commerce",
            color: "indigo",
            icon: "shopping_cart",
            items: [
                { name: "Shopify", description: "Loja virtual completa", verified: true, logo: "shopify" },
                { name: "WooCommerce", description: "WordPress e-commerce", verified: true },
                { name: "Magento", description: "Plataforma de comércio", verified: true },
                { name: "Mercado Livre", description: "Marketplace brasileiro", verified: true },
                { name: "Amazon", description: "Marketplace global", verified: true },
                { name: "VTEX", description: "E-commerce brasileiro", verified: true, logo: "vtex" },
            ],
        },
        {
            category: "Produtividade",
            color: "teal",
            icon: "description",
            items: [
                { name: "Google Workspace", description: "Gmail, Drive, Calendar", verified: true, logo: "google" },
                { name: "Microsoft 365", description: "Office, Outlook, OneDrive", verified: true, logo: "microsoft" },
                { name: "Notion", description: "Workspace colaborativo", verified: true },
                { name: "Trello", description: "Gestão de projetos", verified: true },
                { name: "Asana", description: "Organização de tarefas", verified: true },
                { name: "Monday.com", description: "Plataforma de trabalho", verified: true },
            ],
        },
    ];

    const getColorClasses = (color: string) => {
        const colors: { [key: string]: string } = {
            green: "from-green-500 to-emerald-600",
            blue: "from-blue-500 to-cyan-600",
            purple: "from-purple-500 to-violet-600",
            orange: "from-orange-500 to-red-600",
            indigo: "from-indigo-500 to-blue-600",
            teal: "from-teal-500 to-cyan-600",
        };
        return colors[color] || "from-gray-500 to-gray-600";
    };

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
                            <a href="/features" className="text-gray-600 hover:text-gray-900 transition-colors">
                                Recursos
                            </a>
                            <a
                                href="/integrations"
                                className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-1 transition-colors"
                            >
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
                        Conecte tudo que você
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            {" "}
                            já usa
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        Mais de 100 integrações nativas com as principais ferramentas do mercado brasileiro e
                        internacional
                    </p>
                    <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                        <MaterialIcon icon="check" className="h-4 w-4" />
                        Todas as integrações são plug-and-play
                    </div>
                </div>
            </section>

            {/* Integration Categories */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="space-y-16">
                        {integrations.map((category, categoryIndex) => (
                            <div key={categoryIndex} className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`w-16 h-16 bg-gradient-to-r ${getColorClasses(category.color)} rounded-xl flex items-center justify-center`}
                                    >
                                        <MaterialIcon icon={category.icon} className="text-white" size={32} />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold text-gray-900">{category.category}</h2>
                                        <p className="text-gray-600">{category.items.length} integrações disponíveis</p>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {category.items.map((integration, integrationIndex) => (
                                        <div
                                            key={integrationIndex}
                                            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
                                        >
                                            <div className="flex items-start gap-3 mb-3">
                                                {integration.logo && (
                                                    <div className="flex-shrink-0">
                                                        <CompanyLogo company={integration.logo} size={32} />
                                                    </div>
                                                )}
                                                <div className="flex-grow">
                                                    <div className="flex items-start justify-between">
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {integration.name}
                                                        </h3>
                                                        {integration.verified && (
                                                            <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                                                <MaterialIcon
                                                                    icon="check_circle"
                                                                    className="text-green-500"
                                                                    size={12}
                                                                />
                                                                Verificado
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-gray-600 text-sm leading-relaxed mt-1">
                                                        {integration.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Custom Integration */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="max-w-3xl mx-auto">
                        <MaterialIcon icon="dns" className="text-blue-600 mx-auto mb-6" size={64} />
                        <h2 className="text-4xl font-bold text-gray-900 mb-6">Não encontrou sua ferramenta?</h2>
                        <p className="text-xl text-gray-600 mb-8">
                            Nossa API REST permite integrar qualquer sistema. Se você usa uma ferramenta específica,
                            podemos criar uma integração personalizada para você.
                        </p>
                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <MaterialIcon icon="language" className="text-blue-600 mx-auto mb-3" size={32} />
                                <h3 className="font-semibold text-gray-900 mb-2">API REST Completa</h3>
                                <p className="text-gray-600 text-sm">Documentação completa e SDKs disponíveis</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <MaterialIcon icon="support_agent" className="text-blue-600 mx-auto mb-3" size={32} />
                                <h3 className="font-semibold text-gray-900 mb-2">Suporte Técnico</h3>
                                <p className="text-gray-600 text-sm">Nossa equipe te ajuda com a integração</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <MaterialIcon icon="schedule" className="text-blue-600 mx-auto mb-3" size={32} />
                                <h3 className="font-semibold text-gray-900 mb-2">Desenvolvimento Rápido</h3>
                                <p className="text-gray-600 text-sm">Integração customizada em até 15 dias</p>
                            </div>
                        </div>
                        <a
                            href="/contact"
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Solicitar Integração Customizada
                            <MaterialIcon icon="arrow_forward" className="text-white" size={20} />
                        </a>
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-20 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Por que nossas integrações são diferentes?
                        </h2>
                        <p className="text-xl text-gray-600">Desenvolvidas especialmente para o mercado brasileiro</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <MaterialIcon icon="check_circle" className="text-white" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Setup em 1 Clique</h3>
                            <p className="text-gray-600">
                                Configuração automática sem necessidade de conhecimento técnico
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <MaterialIcon icon="rocket_launch" className="text-white" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Sincronização Real-time</h3>
                            <p className="text-gray-600">Dados sempre atualizados entre todas as suas ferramentas</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <MaterialIcon icon="support_agent" className="text-white" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Suporte em Português</h3>
                            <p className="text-gray-600">Atendimento especializado para resolver qualquer dúvida</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <MaterialIcon icon="dns" className="text-white" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">99.9% Uptime</h3>
                            <p className="text-gray-600">Infraestrutura robusta que garante funcionamento contínuo</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Conecte suas ferramentas hoje mesmo
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Teste gratuitamente e veja como é fácil integrar tudo que você já usa
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

export default IntegrationsPage;
