import React from "react";
import AIChatInterface from "../components/ai-chat/AIChatInterface";

const AIChatPage: React.FC = () => {
    return (
        <div className="p-6">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-900">Assistente IA</h1>
                <p className="text-gray-600 mt-1">Crie automações conversando com Alex, seu assistente inteligente</p>
            </div>

            <div>
                <AIChatInterface />
            </div>
        </div>
    );
};

export default AIChatPage;
