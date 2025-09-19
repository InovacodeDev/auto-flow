import React, { useState, useEffect } from "react";
import {
    HelpCircle,
    Search,
    BookOpen,
    Video,
    FileText,
    MessageCircle,
    ChevronRight,
    Star,
    X,
    ExternalLink,
} from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

interface HelpArticle {
    id: string;
    title: string;
    content: string;
    category: HelpCategory;
    type: "article" | "video" | "tutorial" | "faq";
    difficulty: "Iniciante" | "Intermediário" | "Avançado";
    readTime: string;
    isPopular: boolean;
    tags: string[];
    lastUpdated: string;
    helpful: number;
    notHelpful: number;
}

type HelpCategory =
    | "Primeiros Passos"
    | "Workflows"
    | "Integrações"
    | "Automações"
    | "Templates"
    | "Analytics"
    | "Solução de Problemas"
    | "API"
    | "Billing";

interface HelpSystemProps {
    isOpen: boolean;
    onClose: () => void;
    context?: string; // Context for contextual help
}

const helpArticles: HelpArticle[] = [
    {
        id: "getting-started",
        title: "Como criar seu primeiro workflow",
        content: "Aprenda a criar um workflow do zero usando o construtor visual...",
        category: "Primeiros Passos",
        type: "tutorial",
        difficulty: "Iniciante",
        readTime: "5 min",
        isPopular: true,
        tags: ["workflow", "iniciante", "tutorial"],
        lastUpdated: "2024-01-15",
        helpful: 245,
        notHelpful: 12,
    },
    {
        id: "whatsapp-integration",
        title: "Configurando WhatsApp Business",
        content: "Passo a passo para integrar o WhatsApp Business API...",
        category: "Integrações",
        type: "tutorial",
        difficulty: "Intermediário",
        readTime: "10 min",
        isPopular: true,
        tags: ["whatsapp", "integração", "api"],
        lastUpdated: "2024-01-12",
        helpful: 189,
        notHelpful: 8,
    },
    {
        id: "pix-automation",
        title: "Automação de cobrança via PIX",
        content: "Como configurar cobranças automáticas usando PIX...",
        category: "Automações",
        type: "article",
        difficulty: "Intermediário",
        readTime: "8 min",
        isPopular: true,
        tags: ["pix", "cobrança", "mercado pago"],
        lastUpdated: "2024-01-10",
        helpful: 156,
        notHelpful: 5,
    },
    {
        id: "analytics-dashboard",
        title: "Entendendo o dashboard de analytics",
        content: "Como interpretar as métricas do seu dashboard...",
        category: "Analytics",
        type: "article",
        difficulty: "Iniciante",
        readTime: "6 min",
        isPopular: false,
        tags: ["analytics", "dashboard", "métricas"],
        lastUpdated: "2024-01-08",
        helpful: 98,
        notHelpful: 3,
    },
];

const categories: HelpCategory[] = [
    "Primeiros Passos",
    "Workflows",
    "Integrações",
    "Automações",
    "Templates",
    "Analytics",
    "Solução de Problemas",
    "API",
    "Billing",
];

export const HelpSystem: React.FC<HelpSystemProps> = ({ isOpen, onClose, context }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<HelpCategory | "Todas">("Todas");
    const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
    const [filteredArticles, setFilteredArticles] = useState<HelpArticle[]>(helpArticles);

    useEffect(() => {
        let filtered = helpArticles;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(
                (article) =>
                    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    article.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // Filter by category
        if (selectedCategory !== "Todas") {
            filtered = filtered.filter((article) => article.category === selectedCategory);
        }

        // If context is provided, prioritize relevant articles
        if (context) {
            filtered.sort((a, b) => {
                const aRelevant = a.tags.some((tag) => tag.toLowerCase().includes(context.toLowerCase()));
                const bRelevant = b.tags.some((tag) => tag.toLowerCase().includes(context.toLowerCase()));
                if (aRelevant && !bRelevant) return -1;
                if (!aRelevant && bRelevant) return 1;
                return 0;
            });
        }

        setFilteredArticles(filtered);
    }, [searchTerm, selectedCategory, context]);

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "Iniciante":
                return "bg-green-100 text-green-800";
            case "Intermediário":
                return "bg-yellow-100 text-yellow-800";
            case "Avançado":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "article":
                return <FileText className="h-4 w-4" />;
            case "video":
                return <Video className="h-4 w-4" />;
            case "tutorial":
                return <BookOpen className="h-4 w-4" />;
            case "faq":
                return <HelpCircle className="h-4 w-4" />;
            default:
                return <FileText className="h-4 w-4" />;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex">
                {/* Sidebar */}
                <div className="w-1/3 border-r p-6 overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Central de Ajuda</h2>
                        <Button variant="ghost" onClick={onClose}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Search */}
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Buscar ajuda..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Categories */}
                    <div className="mb-6">
                        <h3 className="font-semibold mb-3">Categorias</h3>
                        <div className="space-y-1">
                            <button
                                onClick={() => setSelectedCategory("Todas")}
                                className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 ${
                                    selectedCategory === "Todas" ? "bg-blue-100 text-blue-700" : ""
                                }`}
                            >
                                Todas
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 ${
                                        selectedCategory === category ? "bg-blue-100 text-blue-700" : ""
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-2">
                        <h3 className="font-semibold mb-3">Ações Rápidas</h3>
                        <Button variant="outline" className="w-full justify-start">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Falar com Suporte
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                            <Video className="h-4 w-4 mr-2" />
                            Tutoriais em Vídeo
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Documentação API
                        </Button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                    {selectedArticle ? (
                        /* Article View */
                        <div>
                            <div className="flex items-center mb-6">
                                <button
                                    onClick={() => setSelectedArticle(null)}
                                    className="text-blue-600 hover:text-blue-800 mr-4"
                                >
                                    ← Voltar
                                </button>
                                <div className="flex items-center space-x-2">
                                    {getTypeIcon(selectedArticle.type)}
                                    <Badge className={getDifficultyColor(selectedArticle.difficulty)}>
                                        {selectedArticle.difficulty}
                                    </Badge>
                                    <span className="text-gray-500">{selectedArticle.readTime}</span>
                                </div>
                            </div>

                            <h1 className="text-2xl font-bold mb-4">{selectedArticle.title}</h1>

                            <div className="prose max-w-none mb-8">
                                <p>{selectedArticle.content}</p>
                                {/* Here you would render the full article content */}
                            </div>

                            <div className="border-t pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex flex-wrap gap-2">
                                        {selectedArticle.tags.map((tag, index) => (
                                            <Badge key={index} variant="secondary">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Atualizado em{" "}
                                        {new Date(selectedArticle.lastUpdated).toLocaleDateString("pt-BR")}
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <span className="text-sm text-gray-600">Este artigo foi útil?</span>
                                    <div className="flex space-x-2">
                                        <Button variant="outline" size="sm">
                                            👍 Sim ({selectedArticle.helpful})
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            👎 Não ({selectedArticle.notHelpful})
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Articles List */
                        <div>
                            {context && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                    <h3 className="font-semibold text-blue-900 mb-2">Ajuda Contextual: {context}</h3>
                                    <p className="text-blue-700 text-sm">
                                        Artigos relacionados ao que você está fazendo agora.
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold">
                                    {selectedCategory === "Todas" ? "Todos os Artigos" : selectedCategory}
                                </h2>
                                <div className="text-sm text-gray-500">
                                    {filteredArticles.length} artigos encontrados
                                </div>
                            </div>

                            {/* Popular Articles */}
                            {selectedCategory === "Todas" && !searchTerm && (
                                <div className="mb-8">
                                    <h3 className="font-semibold mb-4 flex items-center">
                                        <Star className="h-4 w-4 mr-2 text-yellow-500" />
                                        Artigos Populares
                                    </h3>
                                    <div className="grid gap-4">
                                        {helpArticles
                                            .filter((a) => a.isPopular)
                                            .map((article) => (
                                                <Card
                                                    key={article.id}
                                                    className="p-4 hover:shadow-md cursor-pointer transition-shadow"
                                                    onClick={() => setSelectedArticle(article)}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-2 mb-2">
                                                                {getTypeIcon(article.type)}
                                                                <h4 className="font-medium">{article.title}</h4>
                                                            </div>
                                                            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                                                                {article.content}
                                                            </p>
                                                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                                                <Badge
                                                                    className={getDifficultyColor(article.difficulty)}
                                                                >
                                                                    {article.difficulty}
                                                                </Badge>
                                                                <span>{article.readTime}</span>
                                                                <span>👍 {article.helpful}</span>
                                                            </div>
                                                        </div>
                                                        <ChevronRight className="h-5 w-5 text-gray-400" />
                                                    </div>
                                                </Card>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {/* All Articles */}
                            <div className="space-y-4">
                                {filteredArticles.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="text-gray-400 mb-4">
                                            <Search className="h-12 w-12 mx-auto" />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            Nenhum artigo encontrado
                                        </h3>
                                        <p className="text-gray-500">
                                            Tente usar outros termos de busca ou entre em contato com o suporte
                                        </p>
                                    </div>
                                ) : (
                                    filteredArticles.map((article) => (
                                        <Card
                                            key={article.id}
                                            className="p-4 hover:shadow-md cursor-pointer transition-shadow"
                                            onClick={() => setSelectedArticle(article)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        {getTypeIcon(article.type)}
                                                        <h4 className="font-medium">{article.title}</h4>
                                                        <Badge variant="outline">{article.category}</Badge>
                                                    </div>
                                                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                                                        {article.content}
                                                    </p>
                                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                                        <Badge className={getDifficultyColor(article.difficulty)}>
                                                            {article.difficulty}
                                                        </Badge>
                                                        <span>{article.readTime}</span>
                                                        <span>👍 {article.helpful}</span>
                                                    </div>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-gray-400" />
                                            </div>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
