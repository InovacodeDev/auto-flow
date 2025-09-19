import React from "react";
import { X, Play, Copy, Star, Clock, Users, Zap, ArrowRight, CheckCircle } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

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

interface TemplatePreviewModalProps {
    template: WorkflowTemplate | null;
    isOpen: boolean;
    onClose: () => void;
    onUseTemplate: (template: WorkflowTemplate) => void;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
    template,
    isOpen,
    onClose,
    onUseTemplate,
}) => {
    if (!isOpen || !template) return null;

    const getComplexityColor = (complexity: string) => {
        switch (complexity) {
            case "Simples":
                return "bg-green-100 text-green-800";
            case "Intermediário":
                return "bg-yellow-100 text-yellow-800";
            case "Avançado":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
            />
        ));
    };

    const workflowSteps = [
        {
            type: "trigger",
            title: "Gatilho: Data de vencimento",
            description: "Workflow é acionado quando uma fatura vence",
        },
        {
            type: "condition",
            title: "Condição: Cliente ativo",
            description: "Verifica se o cliente está com status ativo",
        },
        {
            type: "action",
            title: "Ação: Gerar PIX",
            description: "Cria cobrança PIX via Mercado Pago",
        },
        {
            type: "action",
            title: "Ação: Enviar WhatsApp",
            description: "Envia mensagem com link de pagamento",
        },
        {
            type: "delay",
            title: "Aguardar: 24 horas",
            description: "Espera pelo pagamento",
        },
        {
            type: "condition",
            title: "Condição: Pagamento pendente",
            description: "Verifica se ainda está pendente",
        },
        {
            type: "action",
            title: "Ação: Follow-up",
            description: "Envia lembrete via WhatsApp",
        },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-start p-6 border-b">
                    <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                            {template.isFeatured && (
                                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                                    <Star className="h-3 w-3 mr-1" />
                                    Destaque
                                </Badge>
                            )}
                            {template.isPopular && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                    <Zap className="h-3 w-3 mr-1" />
                                    Popular
                                </Badge>
                            )}
                        </div>
                        <h2 className="text-2xl font-bold mb-2">{template.name}</h2>
                        <p className="text-gray-600">{template.description}</p>
                    </div>
                    <Button variant="ghost" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Template Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="p-4">
                            <div className="flex items-center space-x-2 mb-2">
                                <Clock className="h-5 w-5 text-blue-500" />
                                <span className="font-medium">Tempo Estimado</span>
                            </div>
                            <p className="text-2xl font-bold">{template.estimatedTime}</p>
                            <p className="text-sm text-gray-500">para configurar</p>
                        </Card>

                        <Card className="p-4">
                            <div className="flex items-center space-x-2 mb-2">
                                <Users className="h-5 w-5 text-green-500" />
                                <span className="font-medium">Usos</span>
                            </div>
                            <p className="text-2xl font-bold">{template.usageCount.toLocaleString()}</p>
                            <p className="text-sm text-gray-500">empresas usam</p>
                        </Card>

                        <Card className="p-4">
                            <div className="flex items-center space-x-2 mb-2">
                                <Star className="h-5 w-5 text-yellow-500" />
                                <span className="font-medium">Avaliação</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <p className="text-2xl font-bold">{template.rating}</p>
                                <div className="flex">{renderStars(template.rating)}</div>
                            </div>
                        </Card>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="p-4">
                            <h3 className="font-semibold mb-3">Detalhes do Template</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Categoria:</span>
                                    <Badge variant="outline">{template.category}</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Complexidade:</span>
                                    <Badge className={getComplexityColor(template.complexity)}>
                                        {template.complexity}
                                    </Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Autor:</span>
                                    <span>{template.author}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Versão:</span>
                                    <span>{template.version}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Atualizado:</span>
                                    <span>{new Date(template.lastUpdated).toLocaleDateString("pt-BR")}</span>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-4">
                            <h3 className="font-semibold mb-3">Integrações Necessárias</h3>
                            <div className="space-y-2">
                                {template.integrations.map((integration, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span>{integration}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Tags */}
                    <div>
                        <h3 className="font-semibold mb-3">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                            {template.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Workflow Preview */}
                    <div>
                        <h3 className="font-semibold mb-3">Fluxo do Workflow</h3>
                        <Card className="p-4">
                            <div className="space-y-4">
                                {workflowSteps.map((step, index) => (
                                    <div key={index} className="flex items-start space-x-4">
                                        <div className="flex flex-col items-center">
                                            <div
                                                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                                                    step.type === "trigger"
                                                        ? "bg-blue-500"
                                                        : step.type === "condition"
                                                          ? "bg-yellow-500"
                                                          : step.type === "action"
                                                            ? "bg-green-500"
                                                            : "bg-gray-500"
                                                }`}
                                            >
                                                {index + 1}
                                            </div>
                                            {index < workflowSteps.length - 1 && (
                                                <div className="w-0.5 h-8 bg-gray-300 mt-2" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium">{step.title}</h4>
                                            <p className="text-gray-600 text-sm">{step.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-4 pt-6 border-t">
                        <Button onClick={() => onUseTemplate(template)} className="flex-1">
                            <Copy className="h-4 w-4 mr-2" />
                            Usar Este Template
                        </Button>
                        <Button variant="outline">
                            <Play className="h-4 w-4 mr-2" />
                            Visualizar Demo
                        </Button>
                        <Button variant="outline">
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Personalizar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
