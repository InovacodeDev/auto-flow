import React, { useState } from "react";
import { TemplateLibrary } from "../components/templates/TemplateLibrary";
import { TemplatePreviewModal } from "../components/templates/TemplatePreviewModal";

interface WorkflowTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    tags: string[];
    complexity: "Simples" | "Intermediário" | "Avançado";
    estimatedTime: string;
    usageCount: number;
    rating: number;
    isPopular: boolean;
    isFeatured: boolean;
    triggers: string[];
    actions: string[];
    integrations: string[];
    author: string;
    lastUpdated: string;
    version: string;
}

export const TemplatesPage: React.FC = () => {
    const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const handleUseTemplate = (template: WorkflowTemplate) => {
        console.log("Using template:", template.name);
        // Here we would integrate with the workflow builder
        // Navigate to workflow builder with template data
        alert(`Template "${template.name}" será carregado no construtor de workflows!`);
    };

    const handlePreviewTemplate = (template: WorkflowTemplate) => {
        setSelectedTemplate(template);
        setIsPreviewOpen(true);
    };

    const handleClosePreview = () => {
        setIsPreviewOpen(false);
        setSelectedTemplate(null);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <TemplateLibrary onUseTemplate={handleUseTemplate} onPreviewTemplate={handlePreviewTemplate} />

            <TemplatePreviewModal
                template={selectedTemplate}
                isOpen={isPreviewOpen}
                onClose={handleClosePreview}
                onUseTemplate={handleUseTemplate}
            />
        </div>
    );
};
