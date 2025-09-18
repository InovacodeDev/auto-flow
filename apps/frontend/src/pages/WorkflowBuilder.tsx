import React, { useState } from "react";
import WorkflowCanvas from "../components/workflow/WorkflowCanvas";
import AIChat from "../components/ai-chat/AIChat";
import { SparklesIcon } from "@heroicons/react/24/outline";

const WorkflowBuilder: React.FC = () => {
    // Para teste, vamos usar um ID fixo
    const [workflowId] = useState<string | undefined>(undefined); // undefined = novo workflow
    const [isAIChatOpen, setIsAIChatOpen] = useState(false);

    const handleWorkflowGenerated = (generatedWorkflowId: string) => {
        console.log("Workflow gerado pela IA:", generatedWorkflowId);
        // TODO: Navegar para o workflow gerado ou atualizar o canvas
        setIsAIChatOpen(false);
    };

    return (
        <div className="h-screen bg-gray-50 relative">
            <WorkflowCanvas
                workflowId={workflowId}
                readOnly={false}
                onSave={(nodes, edges) => {
                    console.log("Workflow saved:", { nodes, edges });
                }}
            />

            {/* Botão flutuante da IA */}
            <button
                onClick={() => setIsAIChatOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center justify-center z-40"
                title="Assistente IA - Crie workflows com linguagem natural"
            >
                <SparklesIcon className="w-6 h-6" />
            </button>

            {/* Chat da IA */}
            <AIChat
                isOpen={isAIChatOpen}
                onClose={() => setIsAIChatOpen(false)}
                onWorkflowGenerated={handleWorkflowGenerated}
            />
        </div>
    );
};

export default WorkflowBuilder;
