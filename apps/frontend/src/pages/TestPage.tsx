import React from "react";

const TestPage: React.FC = () => {
    return (
        <div className="p-8">
            <h1 className="text-4xl font-bold text-green-600">✅ Rota Funcionando!</h1>
            <p className="text-lg mt-4">Esta é uma página de teste para verificar se as rotas estão funcionando.</p>
            <div className="mt-6 p-4 bg-blue-100 rounded-lg">
                <h2 className="text-xl font-semibold">Informações:</h2>
                <ul className="mt-2 list-disc list-inside">
                    <li>URL atual: {window.location.pathname}</li>
                    <li>Timestamp: {new Date().toLocaleString()}</li>
                </ul>
            </div>
        </div>
    );
};

export default TestPage;
