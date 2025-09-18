import React, { useState } from "react";
import { workflowTemplates } from "../../data/workflowTemplates";
import { WorkflowCanvas } from "../../types/workflow";

interface TemplatesSelectorProps {
    onSelectTemplate: (template: WorkflowCanvas) => void;
    onClose: () => void;
    isOpen: boolean;
}

export const TemplatesSelector: React.FC<TemplatesSelectorProps> = ({ onSelectTemplate, onClose, isOpen }) => {
    const [selectedTemplate, setSelectedTemplate] = useState<WorkflowCanvas | null>(null);

    if (!isOpen) return null;

    const handleSelectTemplate = (template: WorkflowCanvas) => {
        setSelectedTemplate(template);
    };

    const handleUseTemplate = () => {
        if (selectedTemplate) {
            // Cria uma nova instância do template com IDs únicos
            const newWorkflow: WorkflowCanvas = {
                ...selectedTemplate,
                id: `workflow-${Date.now()}`,
                name: selectedTemplate.name.replace(" - Template", ""),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            onSelectTemplate(newWorkflow);
            onClose();
        }
    };

    const templateCategories = [
        {
            name: "Atendimento ao Cliente",
            templates: [workflowTemplates[0]], // onboardingClienteTemplate
            description: "Automações para melhorar a experiência do cliente",
        },
        {
            name: "Financeiro",
            templates: [workflowTemplates[1]], // cobrancaAutomaticaTemplate
            description: "Automações para gestão financeira e cobrança",
        },
        {
            name: "Marketing",
            templates: [workflowTemplates[2]], // leadNurturingTemplate
            description: "Automações para geração e nutrição de leads",
        },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
                {/* Header */}
                <div className="border-b border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Templates de Workflow</h2>
                            <p className="text-gray-600 mt-1">Escolha um template para começar rapidamente</p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex h-[calc(80vh-140px)]">
                    {/* Templates List */}
                    <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
                        <div className="p-6">
                            {templateCategories.map((category) => (
                                <div key={category.name} className="mb-8">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                                    <p className="text-sm text-gray-600 mb-4">{category.description}</p>

                                    <div className="space-y-3">
                                        {category.templates.map((template) => (
                                            <div
                                                key={template.id}
                                                onClick={() => handleSelectTemplate(template)}
                                                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                                                    selectedTemplate?.id === template.id
                                                        ? "border-blue-500 bg-blue-50"
                                                        : "border-gray-200 hover:border-gray-300"
                                                }`}
                                            >
                                                <h4 className="font-medium text-gray-900">{template.name}</h4>
                                                <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                                                <div className="flex items-center justify-between mt-3">
                                                    <span className="text-xs text-gray-500">
                                                        {template.nodes.length} nós • {template.edges.length} conexões
                                                    </span>
                                                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                                        Template
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Template Preview */}
                    <div className="w-1/2 overflow-y-auto">
                        {selectedTemplate ? (
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">{selectedTemplate.name}</h3>
                                <p className="text-gray-600 mb-6">{selectedTemplate.description}</p>

                                {/* Workflow Steps */}
                                <div className="space-y-4">
                                    <h4 className="font-medium text-gray-900">Fluxo do Workflow:</h4>
                                    {selectedTemplate.nodes.map((node: any, index: number) => (
                                        <div key={node.id} className="flex items-start space-x-3">
                                            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h5 className="font-medium text-gray-900">{node.data.name}</h5>
                                                <p className="text-sm text-gray-600">{node.data.description}</p>
                                                <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                                    {node.data.nodeType}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Template Stats */}
                                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-2">Informações do Template</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600">Nós:</span>
                                            <span className="ml-2 font-medium">{selectedTemplate.nodes.length}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Conexões:</span>
                                            <span className="ml-2 font-medium">{selectedTemplate.edges.length}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Versão:</span>
                                            <span className="ml-2 font-medium">{selectedTemplate.version}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Status:</span>
                                            <span className="ml-2 font-medium capitalize">
                                                {selectedTemplate.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                <div className="text-center">
                                    <svg
                                        className="w-16 h-16 mx-auto mb-4 text-gray-300"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                    <p>Selecione um template para ver os detalhes</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleUseTemplate}
                            disabled={!selectedTemplate}
                            className={`px-6 py-2 rounded-md transition-colors ${
                                selectedTemplate
                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                        >
                            Usar Este Template
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TemplatesSelector;
