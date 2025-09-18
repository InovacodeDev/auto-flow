import React, { useState } from "react";
import App from "./App";
import WorkflowBuilder from "./pages/WorkflowBuilder";
import IntegrationsPage from "./pages/IntegrationsPage";

export const AppRouter: React.FC = () => {
    const [currentPath] = useState(() => {
        return window.location.pathname;
    });

    // Simple state-based routing for testing
    const renderPage = () => {
        switch (currentPath) {
            case "/workflow-builder":
                return <WorkflowBuilder />;
            case "/integrations":
                return <IntegrationsPage />;
            default:
                return <App />;
        }
    };

    return renderPage();
};
