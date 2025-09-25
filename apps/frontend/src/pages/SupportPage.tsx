import React from "react";
import { FullLogo } from "../assets/logo";
import { MDiv, fadeUp } from "../lib/motion";

const SupportPage: React.FC = () => {
    return (
        <MDiv className="h-screen md:min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center" {...fadeUp}>
            <div className="max-w-2xl mx-auto text-center px-6">
                <FullLogo className="h-10 w-auto mx-auto mb-6" color="#1f2937" />
                <h1 className="text-3xl font-bold mb-4">Suporte temporariamente indisponível</h1>
                <p className="text-gray-600 mb-6">Estamos fazendo umas melhorias rápidas. A página de suporte está desabilitada por enquanto.</p>
                <div className="flex items-center justify-center gap-3">
                    <a href="/" className="text-blue-600 hover:underline">Voltar para Home</a>
                    <a href="mailto:suporte@autoflow.com.br" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg">Enviar email</a>
                </div>
            </div>
        </MDiv>
    );
};

export default SupportPage;
