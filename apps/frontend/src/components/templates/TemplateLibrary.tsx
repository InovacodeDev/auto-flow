import React, { useState, useEffect } from "react";
import { Search, Filter, Star, Clock, Users, Zap, Copy, Play, MoreVertical, Tag } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

// Template interfaces
interface WorkflowTemplate {
    id: string;
    name: string;
    description: string;
    category: TemplateCategory;
    tags: string[];
    complexity: "Simples" | "Intermediário" | "Avançado";
    estimatedTime: string;
    usageCount: number;
    rating: number;
    isPopular: boolean;
    isFeatured: boolean;
    previewImage?: string;
    triggers: string[];
    actions: string[];
    integrations: string[];
    author: string;
    lastUpdated: string;
    version: string;
}

type TemplateCategory =
    | "Vendas"
    | "Marketing"
    | "Atendimento"
    | "Financeiro"
    | "RH"
    | "Operações"
    | "E-commerce"
    | "Lead Generation"
    | "Customer Success"
    | "Automação PIX"
    | "WhatsApp Business";

interface TemplateLibraryProps {
    onUseTemplate: (template: WorkflowTemplate) => void;
    onPreviewTemplate: (template: WorkflowTemplate) => void;
}

// Mock template data
const templates: WorkflowTemplate[] = [
    {
        id: "template-1",
        name: "Cobrança Automática via PIX",
        description: "Automação completa para envio de cobranças via PIX com follow-up no WhatsApp",
        category: "Financeiro",
        tags: ["PIX", "Cobrança", "WhatsApp", "Follow-up"],
        complexity: "Intermediário",
        estimatedTime: "15 min",
        usageCount: 1247,
        rating: 4.8,
        isPopular: true,
        isFeatured: true,
        triggers: ["Data de vencimento", "Status pendente"],
        actions: ["Gerar PIX", "Enviar WhatsApp", "Agendar follow-up"],
        integrations: ["Mercado Pago", "WhatsApp Business"],
        author: "AutoFlow Team",
        lastUpdated: "2024-01-15",
        version: "2.1",
    },
    {
        id: "template-2",
        name: "Lead Qualification Bot",
        description: "Bot inteligente para qualificação automática de leads via WhatsApp",
        category: "Marketing",
        tags: ["Lead", "WhatsApp", "Qualificação", "Chatbot"],
        complexity: "Avançado",
        estimatedTime: "25 min",
        usageCount: 892,
        rating: 4.9,
        isPopular: true,
        isFeatured: false,
        triggers: ["Novo lead", "Mensagem WhatsApp"],
        actions: ["Enviar questionário", "Classificar lead", "Notificar vendas"],
        integrations: ["WhatsApp Business", "CRM"],
        author: "Marketing Pro",
        lastUpdated: "2024-01-10",
        version: "1.5",
    },
    {
        id: "template-3",
        name: "Follow-up Pós-Venda",
        description: "Sequência automática de follow-up para aumentar satisfação e fidelização",
        category: "Customer Success",
        tags: ["Pós-venda", "Satisfação", "NPS", "Fidelização"],
        complexity: "Simples",
        estimatedTime: "10 min",
        usageCount: 654,
        rating: 4.6,
        isPopular: false,
        isFeatured: false,
        triggers: ["Venda concluída", "Produto entregue"],
        actions: ["Enviar pesquisa NPS", "Oferecer suporte", "Cross-sell"],
        integrations: ["E-mail", "WhatsApp Business"],
        author: "Success Team",
        lastUpdated: "2024-01-08",
        version: "1.2",
    },
    {
        id: "template-4",
        name: "Abandono de Carrinho E-commerce",
        description: "Recuperação automática de carrinhos abandonados com ofertas personalizadas",
        category: "E-commerce",
        tags: ["Carrinho", "Abandono", "Recuperação", "Ofertas"],
        complexity: "Intermediário",
        estimatedTime: "20 min",
        usageCount: 1058,
        rating: 4.7,
        isPopular: true,
        isFeatured: true,
        triggers: ["Carrinho abandonado", "Tempo limite"],
        actions: ["E-mail recuperação", "Desconto progressivo", "WhatsApp follow-up"],
        integrations: ["E-commerce", "E-mail", "WhatsApp"],
        author: "E-commerce Expert",
        lastUpdated: "2024-01-12",
        version: "3.0",
    },
];

const categories: TemplateCategory[] = [
    "Vendas",
    "Marketing",
    "Atendimento",
    "Financeiro",
    "RH",
    "Operações",
    "E-commerce",
    "Lead Generation",
    "Customer Success",
    "Automação PIX",
    "WhatsApp Business",
];

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ onUseTemplate, onPreviewTemplate }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | "Todas">("Todas");
    const [sortBy, setSortBy] = useState<"popular" | "rating" | "recent" | "usage">("popular");
    const [filteredTemplates, setFilteredTemplates] = useState<WorkflowTemplate[]>(templates);

    useEffect(() => {
        let filtered = templates;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(
                (template) =>
                    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    template.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Filter by category
        if (selectedCategory !== "Todas") {
            filtered = filtered.filter((template) => template.category === selectedCategory);
        }

        // Sort templates
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "popular":
                    return b.usageCount - a.usageCount;
                case "rating":
                    return b.rating - a.rating;
                case "recent":
                    return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
                case "usage":
                    return b.usageCount - a.usageCount;
                default:
                    return 0;
            }
        });

        setFilteredTemplates(filtered);
    }, [searchTerm, selectedCategory, sortBy]);

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

    const TemplateCard: React.FC<{ template: WorkflowTemplate }> = ({ template }) => (
        <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
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
                <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </div>

            <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{template.description}</p>

            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {template.estimatedTime}
                    </div>
                    <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {template.usageCount.toLocaleString()}
                    </div>
                    <div className="flex items-center">
                        {renderStars(template.rating)}
                        <span className="ml-1">{template.rating}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between mb-4">
                <Badge className={getComplexityColor(template.complexity)}>{template.complexity}</Badge>
                <Badge variant="outline">
                    <Tag className="h-3 w-3 mr-1" />
                    {template.category}
                </Badge>
            </div>

            <div className="flex flex-wrap gap-1 mb-4">
                {template.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                    </Badge>
                ))}
                {template.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                        +{template.tags.length - 3}
                    </Badge>
                )}
            </div>

            <div className="flex space-x-2">
                <Button onClick={() => onUseTemplate(template)} className="flex-1">
                    <Copy className="h-4 w-4 mr-2" />
                    Usar Template
                </Button>
                <Button variant="outline" onClick={() => onPreviewTemplate(template)}>
                    <Play className="h-4 w-4" />
                </Button>
            </div>
        </Card>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Biblioteca de Templates</h1>
                    <p className="text-gray-600">Templates prontos para acelerar suas automações</p>
                </div>
                <Button>
                    <Zap className="h-4 w-4 mr-2" />
                    Criar Template
                </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Buscar templates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as TemplateCategory | "Todas")}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="Todas">Todas as categorias</option>
                    {categories.map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>

                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="popular">Mais populares</option>
                    <option value="rating">Melhor avaliados</option>
                    <option value="recent">Mais recentes</option>
                    <option value="usage">Mais utilizados</option>
                </select>

                <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                </Button>
            </div>

            {/* Featured Templates */}
            {selectedCategory === "Todas" && !searchTerm && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Templates em Destaque</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates
                            .filter((t) => t.isFeatured)
                            .map((template) => (
                                <TemplateCard key={template.id} template={template} />
                            ))}
                    </div>
                </div>
            )}

            {/* Results */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">
                        {selectedCategory === "Todas" ? "Todos os Templates" : `Templates - ${selectedCategory}`}
                    </h2>
                    <div className="text-sm text-gray-500">{filteredTemplates.length} templates encontrados</div>
                </div>

                {filteredTemplates.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <Search className="h-12 w-12 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum template encontrado</h3>
                        <p className="text-gray-500">Tente ajustar os filtros ou buscar por outros termos</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTemplates.map((template) => (
                            <TemplateCard key={template.id} template={template} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
