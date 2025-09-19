import React from "react";
import { WorkflowBuilder } from "../components/workflow-builder/WorkflowBuilder";

export const WorkflowBuilderPage: React.FC = () => {
    const handleSave = (workflowData: any) => {
        console.log("Salvando workflow:", workflowData);
        // TODO: Implementar salvamento via API
        alert("Workflow salvo com sucesso! (Mock)");
    };

    const handleTest = (workflowData: any) => {
        console.log("Testando workflow:", workflowData);
        // TODO: Implementar teste via API
        alert("Teste do workflow iniciado! (Mock)");
    };

    return (
        <div className="h-screen">
            <WorkflowBuilder onSave={handleSave} onTest={handleTest} />
        </div>
    );
};
