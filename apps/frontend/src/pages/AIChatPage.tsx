import React from "react";
import AIChatInterface from "../components/ai-chat/AIChatInterface";

const AIChatPage: React.FC = () => {
    return (
        <div className="h-screen flex flex-col">
            {/* Page Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl font-bold text-gray-900">Assistente IA</h1>
                    <p className="text-gray-600 mt-1">
                        Crie automações conversando com Alex, seu assistente inteligente
                    </p>
                </div>
            </div>

            {/* Chat Interface */}
            <div className="flex-1 max-w-7xl mx-auto w-full">
                <AIChatInterface />
            </div>
        </div>
    );
};

export default AIChatPage;
