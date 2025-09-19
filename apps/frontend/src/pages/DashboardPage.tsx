import React from "react";

const DashboardPage: React.FC = () => {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
            <p className="text-neutral-600">Visão geral do sistema: métricas, status dos workflows e alertas.</p>
        </div>
    );
};

export default DashboardPage;
