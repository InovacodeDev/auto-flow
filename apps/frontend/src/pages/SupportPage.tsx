import React from "react";
import { FullLogo } from "../assets/logo";
import { MDiv, fadeUp } from "../lib/motion";

const SupportPage: React.FC = () => {
    // return (
    //     <MDiv className="h-screen md:min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50" {...fadeUp}>
    //         {/* Header */}
    //         <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
    //             <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    //                 <div className="flex justify-between items-center py-4">
    //                     <a href="/" className="flex items-center hover:opacity-80 transition-opacity">
    //                         <FullLogo className="h-8 w-auto" color="#1f2937" />
    //                     </a>
    //                     <nav className="hidden md:flex items-center space-x-8">
    //                         <a href="/features" className="text-gray-600 hover:text-gray-900 transition-colors">
    //                             Recursos
    //                         </a>
    //                         <a href="/integrations" className="text-gray-600 hover:text-gray-900 transition-colors">
    //                             Integrações
    //                         </a>
    //                         <a href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
    //                             Preços
    //                         </a>
    //                         <a href="/support" className="text-blue-600 font-semibold transition-colors">
    //                             Suporte
    //                         </a>
    //                         <a
    //                             href="/login"
    //                             className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
    //                         >
    //                             Entrar
    //                         </a>
    //                     </nav>
    //                 </div>
    //             </div>
    //         </header>

    //         {/* Hero */}
    //         <section className="pt-20 pb-16 relative overflow-hidden">
    //             <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    //                 <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">Suporte</h1>
    //                 <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
    //                     Como podemos ajudar hoje? Veja as opções abaixo ou envie uma solicitação para nossa equipe.
    //                 </p>
    //             </div>
    //         </section>

    //         {/* Main bands */}
    //         <section className="py-20">
    //             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    //                 <div className="space-y-12">
    //                     {/* Intro band */}
    //                     <div className="text-center">
    //                         <div className="max-w-4xl mx-auto">
    //                             <MaterialIcon icon="support_agent" className="text-blue-600 mx-auto mb-4" size={48} />
    //                             <h2 className="text-3xl font-bold text-gray-900 mb-4">Precisa de ajuda?</h2>
    //                             <p className="text-gray-600 text-lg">
    //                                 Escolha uma opção abaixo ou descreva seu problema rapidamente — responderemos em
    //                                 breve.
    //                             </p>
    //                             <div className="mt-6 flex flex-col sm:flex-row gap-3 items-center justify-center">
    //                                 <a
    //                                     href="#central"
    //                                     className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg"
    //                                 >
    //                                     Central de Ajuda
    //                                 </a>
    //                                 <a
    //                                     href="#form"
    //                                     className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
    //                                 >
    //                                     Abrir um ticket
    //                                 </a>
    //                                 <a
    //                                     href="#whatsapp"
    //                                     className="inline-flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-lg"
    //                                 >
    //                                     Abrir WhatsApp
    //                                 </a>
    //                             </div>
    //                         </div>
    //                     </div>

    //                     {/* Central de Ajuda */}
    //                     <section id="central" className="py-12">
    //                         <div className="max-w-7xl mx-auto px-4">
    //                             <div className="flex items-start justify-between gap-8">
    //                                 <div className="max-w-3xl">
    //                                     <h3 className="text-3xl font-semibold mb-4">Central de Ajuda</h3>
    //                                     <p className="text-gray-600 mb-6">
    //                                         Encontre respostas rápidas nas nossas perguntas frequentes.
    //                                     </p>
    //                                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    //                                         <a href="/help/getting-started" className="block p-6 hover:shadow-md">
    //                                             <div className="font-semibold">Como começar</div>
    //                                             <div className="text-sm text-gray-500 mt-1">
    //                                                 Guia passo-a-passo para criar seu primeiro fluxo.
    //                                             </div>
    //                                         </a>
    //                                         <a href="/help/integrations" className="block p-6 hover:shadow-md">
    //                                             <div className="font-semibold">Integrações</div>
    //                                             <div className="text-sm text-gray-500 mt-1">
    //                                                 Como conectar WhatsApp, ERP e outros serviços.
    //                                             </div>
    //                                         </a>
    //                                         <a href="/help/billing" className="block p-6 hover:shadow-md">
    //                                             <div className="font-semibold">Faturamento</div>
    //                                             <div className="text-sm text-gray-500 mt-1">
    //                                                 Perguntas sobre planos, cobranças e testes.
    //                                             </div>
    //                                         </a>
    //                                     </div>
    //                                 </div>
    //                                 <div className="hidden lg:block w-80">
    //                                     <div>
    //                                         <h4 className="font-semibold mb-2">Tópicos populares</h4>
    //                                         <ul className="space-y-2 text-sm text-gray-600">
    //                                             <li>
    //                                                 <a href="/help/getting-started" className="hover:underline">
    //                                                     Como começar
    //                                                 </a>
    //                                             </li>
    //                                             <li>
    //                                                 <a href="/help/integrations" className="hover:underline">
    //                                                     Conectar WhatsApp
    //                                                 </a>
    //                                             </li>
    //                                             <li>
    //                                                 <a href="/help/billing" className="hover:underline">
    //                                                     Faturamento e cobranças
    //                                                 </a>
    //                                             </li>
    //                                             <li>
    //                                                 <a href="/help/faq" className="hover:underline">
    //                                                     Perguntas frequentes
    //                                                 </a>
    //                                             </li>
    //                                         </ul>
    //                                     </div>
    //                                 </div>
    //                             </div>
    //                         </div>
    //                     </section>

    //                     {/* Contato */}
    //                     <section id="contato" className="py-12">
    //                         <div className="max-w-7xl mx-auto px-4">
    //                             <div className="grid md:grid-cols-2 gap-8 items-start">
    //                                 <div>
    //                                     <h3 className="text-3xl font-semibold mb-4">Contato</h3>
    //                                     <p className="text-gray-600 mb-6">
    //                                         Você também pode nos contatar por email ou telefone:
    //                                     </p>
    //                                     <div className="space-y-4">
    //                                         <div>
    //                                             <div className="font-medium">Email</div>
    //                                             <a href="mailto:suporte@autoflow.com.br" className="text-blue-600">
    //                                                 suporte@autoflow.com.br
    //                                             </a>
    //                                         </div>
    //                                         <div>
    //                                             <div className="font-medium">Telefone</div>
    //                                             <div className="text-gray-700">+55 (11) 4000-0000</div>
    //                                         </div>
    //                                     </div>
    //                                 </div>
    //                                 <div>
    //                                     <div>
    //                                         <h4 className="font-semibold mb-2">Suporte empresarial</h4>
    //                                         <p className="text-gray-600 text-sm mb-4">
    //                                             Atendimento prioritário para clientes Enterprise
    //                                         </p>
    //                                         <a
    //                                             href="/contact"
    //                                             className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
    //                                         >
    //                                             Solicitar suporte dedicado
    //                                         </a>
    //                                     </div>
    //                                 </div>
    //                             </div>
    //                         </div>
    //                     </section>

    //                     {/* WhatsApp & Status */}
    //                     <section id="whatsapp" className="py-12">
    //                         <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
    //                             <div className="max-w-3xl">
    //                                 <h3 className="text-3xl font-semibold">WhatsApp</h3>
    //                                 <p className="text-gray-600">
    //                                     Converse com nossa equipe no WhatsApp para respostas rápidas.
    //                                 </p>
    //                                 <div className="mt-4">
    //                                     <a
    //                                         href="https://wa.me/551140000000"
    //                                         target="_blank"
    //                                         rel="noreferrer"
    //                                         className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg"
    //                                     >
    //                                         Abrir WhatsApp
    //                                     </a>
    //                                 </div>
    //                             </div>
    //                             <div className="text-sm text-gray-600">
    //                                 <h4 className="font-semibold mb-2">Status do sistema</h4>
    //                                 <p className="mb-3">Acompanhe interrupções e manutenção.</p>
    //                                 <a href="/status" className="text-blue-600 hover:underline">
    //                                     Ver status do sistema
    //                                 </a>
    //                             </div>
    //                         </div>
    //                     </section>

    //                     {/* Form */}
    //                     <section id="form" className="py-12">
    //                         <div className="max-w-7xl mx-auto px-4">
    //                             <div className="grid md:grid-cols-2 gap-8 items-start">
    //                                 {/* Left: instructions and email CTA */}
    //                                 <div>
    //                                     <h3 className="text-3xl font-semibold mb-4">Enviar solicitação</h3>
    //                                     <p className="text-gray-600 mb-6">
    //                                         Descreva seu problema e nossa equipe entrará em contato.
    //                                     </p>
    //                                     <p className="text-sm text-gray-500 mb-4">
    //                                         Preencha o formulário ao lado ou envie um email para suporte.
    //                                     </p>
    //                                     <a
    //                                         href="mailto:suporte@autoflow.com.br"
    //                                         className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
    //                                     >
    //                                         Enviar por email
    //                                     </a>
    //                                 </div>

    //                                 {/* Right: form */}
    //                                 <div>
    //                                     <form className="grid grid-cols-1 gap-4" onSubmit={(e) => e.preventDefault()}>
    //                                         <input placeholder="Seu nome" className="border p-3 rounded-lg" />
    //                                         <input placeholder="Seu email" className="border p-3 rounded-lg" />
    //                                         <input placeholder="Assunto" className="border p-3 rounded-lg" />
    //                                         <textarea placeholder="Mensagem" className="border p-3 rounded-lg h-36" />
    //                                         <div className="flex items-center justify-end">
    //                                             <button
    //                                                 type="submit"
    //                                                 className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
    //                                             >
    //                                                 Enviar solicitação
    //                                             </button>
    //                                         </div>
    //                                     </form>
    //                                 </div>
    //                             </div>
    //                         </div>
    //                     </section>
    //                 </div>
    //             </div>
    //         </section>

    //         {/* CTA band */}
    //         <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
    //             <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
    //                 <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ainda precisa de ajuda?</h2>
    //                 <p className="text-xl text-blue-100 mb-8">
    //                     Abra um ticket com nossa equipe ou fale diretamente com um especialista.
    //                 </p>
    //                 <div className="flex flex-col sm:flex-row gap-4 justify-center">
    //                     <a
    //                         href="/register"
    //                         className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-2"
    //                     >
    //                         Abrir ticket
    //                     </a>
    //                     <a
    //                         href="/contact"
    //                         className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105"
    //                     >
    //                         Falar com especialista
    //                     </a>
    //                 </div>
    //             </div>
    //         </section>
    //     </MDiv>
    // );
    return (
        <MDiv
            className="h-screen md:min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center"
            {...fadeUp}
        >
            <div className="max-w-2xl mx-auto text-center px-6">
                <FullLogo className="h-10 w-auto mx-auto mb-6" color="#1f2937" />
                <h1 className="text-3xl font-bold mb-4">Suporte temporariamente indisponível</h1>
                <p className="text-gray-600 mb-6">
                    Estamos fazendo umas melhorias rápidas. A página de suporte está desabilitada por enquanto.
                </p>
                <div className="flex items-center justify-center gap-3">
                    <a href="/" className="text-blue-600 hover:underline">
                        Voltar para Home
                    </a>
                    <a
                        href="mailto:suporte@autoflow.com.br"
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                        Enviar email
                    </a>
                </div>
            </div>
        </MDiv>
    );
};

export default SupportPage;
