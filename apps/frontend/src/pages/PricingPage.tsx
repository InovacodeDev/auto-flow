import React from "react";
import { MaterialIcon } from "../components/ui/MaterialIcon";
import { FullLogo } from "../assets/logo";
import { MDiv, fadeUp } from "../lib/motion";

const PricingPage: React.FC = () => {
    const plans = [
        {
            name: "Gratuito",
            price: "R$ 0",
            period: "/mês",
            description: "Perfeito para começar e testar",
            features: [
                { text: "Até 100 execuções/mês", included: true },
                { text: "3 fluxos ativos", included: true },
                { text: "Integrações básicas", included: true },
                { text: "Suporte por email", included: true },
                { text: "Dashboard básico", included: true },
                { text: "Histórico de 7 dias", included: true },
                { text: "Suporte prioritário", included: false },
                { text: "IA conversacional", included: false },
                { text: "Integrações premium", included: false },
                { text: "API avançada", included: false },
            ],
        },
        {
            name: "Profissional",
            price: "R$ 97",
            period: "/mês",
            description: "Ideal para pequenas empresas",
            popular: true,
            features: [
                { text: "Até 5.000 execuções/mês", included: true },
                { text: "Fluxos ilimitados", included: true },
                { text: "Todas as integrações", included: true },
                { text: "IA conversacional", included: true },
                { text: "Suporte prioritário", included: true },
                { text: "Dashboard avançado", included: true },
                { text: "Histórico de 90 dias", included: true },
                { text: "Webhooks personalizados", included: true },
                { text: "Agendamento avançado", included: true },
                { text: "Backup automático", included: true },
            ],
        },
        {
            name: "Empresarial",
            price: "R$ 297",
            period: "/mês",
            description: "Para médias empresas em crescimento",
            popular: false,
            features: [
                { text: "Execuções ilimitadas", included: true },
                { text: "Fluxos ilimitados", included: true },
                { text: "Todas as integrações + custom", included: true },
                { text: "IA conversacional avançada", included: true },
                { text: "Suporte 24/7 por WhatsApp", included: true },
                { text: "Dashboard personalizado", included: true },
                { text: "Histórico ilimitado", included: true },
                { text: "API completa", included: true },
                { text: "Múltiplos usuários", included: true },
                { text: "SLA 99.9%", included: true },
            ],
        },
    ];

    const faqs = [
        {
            question: "Posso mudar de plano a qualquer momento?",
            answer: "Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As mudanças são aplicadas no próximo ciclo de cobrança.",
        },
        {
            question: "O que acontece se eu exceder o limite de execuções?",
            answer: "No plano Gratuito, as execuções param temporariamente. Nos planos pagos, você pode comprar execuções extras por R$ 0,05 cada ou fazer upgrade automático.",
        },
        {
            question: "Vocês oferecem desconto anual?",
            answer: "Sim! Pagando anualmente você ganha 2 meses grátis (desconto de 17%). Entre em contato para ativar.",
        },
        {
            question: "Como funciona o suporte?",
            answer: "Plano Gratuito: email com resposta em até 48h. Profissional: email prioritário em até 24h. Empresarial: WhatsApp 24/7 com resposta em até 2h.",
        },
        {
            question: "Posso cancelar a qualquer momento?",
            answer: "Claro! Não há contrato de fidelidade. Você pode cancelar quando quiser e continuar usando até o fim do período pago.",
        },
        {
            question: "Os dados ficam seguros?",
            answer: "Absolutamente! Usamos criptografia de nível bancário, conformidade LGPD e backup triplo. Seus dados nunca saem do Brasil.",
        },
    ];

    return (
        <MDiv className="h-screen md:min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50" {...fadeUp}>
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
                            <a href="/integrations" className="text-gray-600 hover:text-gray-900 transition-colors">
                                Integrações
                            </a>
                            <a
                                href="/pricing"
                                className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-1 transition-colors"
                            >
                                Preços
                            </a>
                            <a href="/support" className="text-gray-600 hover:text-gray-900 transition-colors">
                                Suporte
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
                        Preços que cabem no seu
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            {" "}
                            bolso
                        </span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        Comece grátis e escale conforme sua empresa cresce. Sem surpresas, sem taxas escondidas.
                    </p>
                    <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                        <MaterialIcon icon="check_circle" className="text-green-500" size={16} />
                        14 dias grátis em qualquer plano • Cancele quando quiser
                    </div>
                </div>
            </section>

            {/* Pricing Plans */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8">
                        {plans.map((plan, index) => (
                            <div
                                key={index}
                                className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ${plan.popular ? "ring-2 ring-blue-500 transform scale-105" : ""}`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                                            <MaterialIcon icon="star" className="text-white" size={16} />
                                            Mais Popular
                                        </div>
                                    </div>
                                )}

                                <div className="p-8">
                                    <div className="text-center mb-8">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                        <p className="text-gray-600 mb-4">{plan.description}</p>
                                        <div className="flex items-baseline justify-center">
                                            <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                                            <span className="text-xl text-gray-500 ml-2">{plan.period}</span>
                                        </div>
                                    </div>

                                    <ul className="space-y-4 mb-8">
                                        {plan.features.map((feature, featureIndex) => (
                                            <li key={featureIndex} className="flex items-center gap-3">
                                                {feature.included ? (
                                                    <MaterialIcon
                                                        icon="check_circle"
                                                        className="text-green-500 flex-shrink-0"
                                                        size={20}
                                                    />
                                                ) : (
                                                    <MaterialIcon
                                                        icon="close"
                                                        className="text-gray-300 flex-shrink-0"
                                                        size={20}
                                                    />
                                                )}
                                                <span className={feature.included ? "text-gray-700" : "text-gray-400"}>
                                                    {feature.text}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="text-center">
                                        <a
                                            href="/register"
                                            className={`block w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                                                plan.popular
                                                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                                                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                                            }`}
                                        >
                                            {plan.name === "Gratuito" ? "Começar Grátis" : "Testar 14 Dias Grátis"}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Enterprise Contact */}
                    <div className="mt-16 text-center">
                        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
                            <h3 className="text-3xl font-bold mb-4">Empresa de Grande Porte?</h3>
                            <p className="text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
                                Oferecemos soluções customizadas com SLA dedicado, implementação assistida e suporte
                                exclusivo
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a
                                    href="/contact"
                                    className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                                >
                                    <MaterialIcon icon="chat" className="text-gray-900" size={20} />
                                    Falar com Especialista
                                </a>
                                <a
                                    href="tel:+5511999999999"
                                    className="inline-flex items-center gap-2 border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
                                >
                                    <MaterialIcon icon="phone" className="text-white" size={20} />
                                    (11) 9999-9999
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Value Proposition */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Por que o AutoFlow vale cada centavo?</h2>
                        <p className="text-xl text-gray-600">
                            Veja quanto você economiza automatizando processos manuais
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-xl shadow-sm text-center">
                            <div className="text-4xl font-bold text-blue-600 mb-2">20h</div>
                            <div className="text-xl font-semibold text-gray-900 mb-2">por semana economizadas</div>
                            <p className="text-gray-600">
                                Tempo médio que nossos clientes economizam automatizando tarefas repetitivas
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-sm text-center">
                            <div className="text-4xl font-bold text-green-600 mb-2">R$ 8.000</div>
                            <div className="text-xl font-semibold text-gray-900 mb-2">economizados por mês</div>
                            <p className="text-gray-600">
                                Valor médio economizado em mão de obra e otimização de processos
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-sm text-center">
                            <div className="text-4xl font-bold text-purple-600 mb-2">ROI 400%</div>
                            <div className="text-xl font-semibold text-gray-900 mb-2">retorno em 3 meses</div>
                            <p className="text-gray-600">
                                Retorno médio do investimento dos nossos clientes em automação
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Perguntas Frequentes</h2>
                        <p className="text-xl text-gray-600">Tire suas dúvidas sobre nossos planos e funcionalidades</p>
                    </div>

                    <div className="space-y-6">
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-gray-50 rounded-xl p-6">
                                <div className="flex items-start gap-4">
                                    <MaterialIcon icon="help" className="text-blue-600 flex-shrink-0 mt-1" size={24} />
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                                        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <p className="text-gray-600 mb-4">Ainda tem dúvidas?</p>
                        <a
                            href="/contact"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                        >
                            Entre em contato conosco
                            <MaterialIcon icon="arrow_forward" className="text-blue-600" size={16} />
                        </a>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Pronto para automatizar sua empresa?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Comece gratuitamente e veja os resultados em poucos dias
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
                            href="/features"
                            className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105"
                        >
                            Ver Todos os Recursos
                        </a>
                    </div>
                </div>
            </section>
        </MDiv>
    );
};

export default PricingPage;
