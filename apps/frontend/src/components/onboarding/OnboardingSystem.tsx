import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import {
    ChevronRight,
    ChevronLeft,
    X,
    CheckCircle,
    Play,
    Target,
    Zap,
    Users,
    BookOpen,
    ArrowRight,
    SkipForward,
} from "lucide-react";

interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    content: React.ReactNode;
    targetElement?: string; // Seletor CSS do elemento alvo
    position?: "top" | "bottom" | "left" | "right";
    action?: {
        type: "navigate" | "click" | "highlight" | "modal";
        target?: string;
        data?: any;
    };
    skippable?: boolean;
    completed?: boolean;
}

interface OnboardingTour {
    id: string;
    name: string;
    description: string;
    category: "getting-started" | "workflows" | "analytics" | "integrations";
    estimatedTime: number; // em minutos
    steps: OnboardingStep[];
    prerequisites?: string[]; // IDs de outros tours
    icon: React.ReactNode;
}

interface OnboardingProps {
    isOpen: boolean;
    onClose: () => void;
    tourId?: string;
    autoStart?: boolean;
}

const ONBOARDING_TOURS: OnboardingTour[] = [
    {
        id: "welcome",
        name: "Bem-vindo ao AutoFlow",
        description: "Aprenda os conceitos básicos e navegue pela plataforma",
        category: "getting-started",
        estimatedTime: 3,
        icon: <Play className="h-5 w-5" />,
        steps: [
            {
                id: "welcome-intro",
                title: "Bem-vindo ao AutoFlow! 🎉",
                description: "Vamos fazer um tour rápido para você conhecer a plataforma",
                content: (
                    <div className="text-center p-6">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Zap className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Automatize seus processos com facilidade
                        </h3>
                        <p className="text-gray-600 mb-4">
                            O AutoFlow permite criar automações poderosas sem código, integrar sistemas e acompanhar o
                            ROI em tempo real.
                        </p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="p-3 bg-green-50 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-1" />
                                <p className="font-medium">Fácil de usar</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <Target className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                                <p className="font-medium">ROI mensurável</p>
                            </div>
                        </div>
                    </div>
                ),
                skippable: true,
            },
            {
                id: "navigation",
                title: "Navegação Principal",
                description: "Conheça as principais seções da plataforma",
                targetElement: "nav",
                position: "right",
                content: (
                    <div className="p-4">
                        <p className="mb-3">Estas são as principais seções do AutoFlow:</p>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                <strong>Workflows:</strong> Crie e gerencie automações
                            </li>
                            <li className="flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                <strong>Analytics:</strong> Monitore performance e ROI
                            </li>
                            <li className="flex items-center">
                                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                                <strong>Integrações:</strong> Conecte seus sistemas
                            </li>
                        </ul>
                    </div>
                ),
            },
            {
                id: "dashboard",
                title: "Dashboard Principal",
                description: "Visão geral dos seus workflows e métricas",
                targetElement: ".dashboard-overview",
                position: "bottom",
                content: (
                    <div className="p-4">
                        <p className="mb-3">No dashboard você encontra um resumo de todas as suas automações:</p>
                        <ul className="space-y-1 text-sm">
                            <li>• Workflows ativos e inativos</li>
                            <li>• Execuções recentes</li>
                            <li>• Métricas de performance</li>
                            <li>• Alertas importantes</li>
                        </ul>
                    </div>
                ),
            },
        ],
    },
    {
        id: "first-workflow",
        name: "Criar Primeiro Workflow",
        description: "Tutorial completo para criar sua primeira automação",
        category: "workflows",
        estimatedTime: 8,
        icon: <Zap className="h-5 w-5" />,
        prerequisites: ["welcome"],
        steps: [
            {
                id: "workflow-intro",
                title: "Vamos criar seu primeiro workflow!",
                description: "Aprenda a automatizar processos de forma visual",
                content: (
                    <div className="text-center p-6">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Zap className="h-8 w-8 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Workflows são a alma do AutoFlow</h3>
                        <p className="text-gray-600 mb-4">
                            Um workflow é uma sequência de ações automatizadas que são executadas quando certas
                            condições são atendidas.
                        </p>
                        <div className="bg-gray-50 p-4 rounded-lg text-left">
                            <p className="font-medium mb-2">Exemplo:</p>
                            <p className="text-sm text-gray-600">
                                "Quando receber um email com assunto 'Novo Lead', adicione o contato no CRM e envie uma
                                mensagem de boas-vindas via WhatsApp."
                            </p>
                        </div>
                    </div>
                ),
            },
            {
                id: "workflow-builder",
                title: "Constructor Visual",
                description: "Interface drag-and-drop para montar workflows",
                targetElement: ".workflow-canvas",
                position: "left",
                action: {
                    type: "navigate",
                    target: "/workflows/builder",
                },
                content: (
                    <div className="p-4">
                        <p className="mb-3">
                            O constructor visual permite criar workflows arrastando e conectando blocos:
                        </p>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <strong>Triggers:</strong> Eventos que iniciam o workflow
                            </li>
                            <li>
                                <strong>Actions:</strong> Ações que serão executadas
                            </li>
                            <li>
                                <strong>Conditions:</strong> Lógica condicional (if/else)
                            </li>
                            <li>
                                <strong>Integrations:</strong> Conexões com sistemas externos
                            </li>
                        </ul>
                    </div>
                ),
            },
        ],
    },
    {
        id: "analytics-tour",
        name: "Analytics e ROI",
        description: "Entenda como monitorar e otimizar suas automações",
        category: "analytics",
        estimatedTime: 5,
        icon: <Target className="h-5 w-5" />,
        steps: [
            {
                id: "analytics-dashboard",
                title: "Dashboard de Analytics",
                description: "Métricas em tempo real dos seus workflows",
                targetElement: ".analytics-dashboard",
                position: "top",
                action: {
                    type: "navigate",
                    target: "/analytics",
                },
                content: (
                    <div className="p-4">
                        <p className="mb-3">No Analytics você monitora:</p>
                        <ul className="space-y-1 text-sm">
                            <li>• Execuções por dia/semana/mês</li>
                            <li>• Taxa de sucesso vs falhas</li>
                            <li>• Tempo médio de execução</li>
                            <li>• ROI em tempo real</li>
                        </ul>
                    </div>
                ),
            },
            {
                id: "roi-calculation",
                title: "Cálculo de ROI",
                description: "Como medimos o retorno dos seus workflows",
                content: (
                    <div className="p-4">
                        <h4 className="font-medium mb-2">Cálculo automático de ROI:</h4>
                        <div className="space-y-3 text-sm">
                            <div className="bg-green-50 p-3 rounded">
                                <strong>Economia de tempo:</strong>
                                <br />
                                Tempo que seria gasto manualmente vs tempo da automação
                            </div>
                            <div className="bg-blue-50 p-3 rounded">
                                <strong>Redução de erros:</strong>
                                <br />
                                Menos retrabalho e problemas de qualidade
                            </div>
                            <div className="bg-purple-50 p-3 rounded">
                                <strong>Aumento de produtividade:</strong>
                                <br />
                                Equipe focada em atividades de maior valor
                            </div>
                        </div>
                    </div>
                ),
            },
        ],
    },
];

export const OnboardingSystem: React.FC<OnboardingProps> = ({ isOpen, onClose, tourId, autoStart = false }) => {
    const [currentTour, setCurrentTour] = useState<OnboardingTour | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [showTourSelector, setShowTourSelector] = useState(true);
    const [completedTours, setCompletedTours] = useState<string[]>([]);
    const [highlightElement, setHighlightElement] = useState<Element | null>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    // Carregar tours completados do localStorage
    useEffect(() => {
        const completed = localStorage.getItem("autoflow-completed-tours");
        if (completed) {
            setCompletedTours(JSON.parse(completed));
        }
    }, []);

    // Auto-iniciar tour específico
    useEffect(() => {
        if (isOpen && tourId && autoStart) {
            const tour = ONBOARDING_TOURS.find((t) => t.id === tourId);
            if (tour) {
                startTour(tour);
            }
        }
    }, [isOpen, tourId, autoStart]);

    // Destacar elemento alvo
    useEffect(() => {
        if (currentTour && currentStep < currentTour.steps.length) {
            const step = currentTour.steps[currentStep];
            if (step.targetElement) {
                const element = document.querySelector(step.targetElement);
                setHighlightElement(element);

                if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            } else {
                setHighlightElement(null);
            }
        }

        return () => setHighlightElement(null);
    }, [currentTour, currentStep]);

    const startTour = (tour: OnboardingTour) => {
        setCurrentTour(tour);
        setCurrentStep(0);
        setShowTourSelector(false);
    };

    const nextStep = () => {
        if (currentTour && currentStep < currentTour.steps.length - 1) {
            const step = currentTour.steps[currentStep];

            // Executar ação se definida
            if (step.action) {
                executeStepAction(step.action);
            }

            setCurrentStep(currentStep + 1);
        } else {
            completeTour();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const skipStep = () => {
        if (currentTour) {
            const step = currentTour.steps[currentStep];
            if (step.skippable) {
                nextStep();
            }
        }
    };

    const completeTour = () => {
        if (currentTour) {
            const newCompleted = [...completedTours, currentTour.id];
            setCompletedTours(newCompleted);
            localStorage.setItem("autoflow-completed-tours", JSON.stringify(newCompleted));
        }

        closeTour();
    };

    const closeTour = () => {
        setCurrentTour(null);
        setCurrentStep(0);
        setShowTourSelector(true);
        setHighlightElement(null);
        onClose();
    };

    const executeStepAction = (action: OnboardingStep["action"]) => {
        if (!action) return;

        switch (action.type) {
            case "navigate":
                if (action.target) {
                    // TODO: Integrar com router para navegação
                    console.log("Navigate to:", action.target);
                }
                break;
            case "click":
                if (action.target) {
                    const element = document.querySelector(action.target);
                    if (element) {
                        (element as HTMLElement).click();
                    }
                }
                break;
            case "highlight":
                if (action.target) {
                    const element = document.querySelector(action.target);
                    setHighlightElement(element);
                }
                break;
        }
    };

    const getAvailableTours = () => {
        return ONBOARDING_TOURS.filter((tour) => {
            if (!tour.prerequisites) return true;
            return tour.prerequisites.every((prereq) => completedTours.includes(prereq));
        });
    };

    const getCategoryIcon = (category: OnboardingTour["category"]) => {
        switch (category) {
            case "getting-started":
                return <Play className="h-4 w-4" />;
            case "workflows":
                return <Zap className="h-4 w-4" />;
            case "analytics":
                return <Target className="h-4 w-4" />;
            case "integrations":
                return <Users className="h-4 w-4" />;
            default:
                return <BookOpen className="h-4 w-4" />;
        }
    };

    const getCategoryName = (category: OnboardingTour["category"]) => {
        switch (category) {
            case "getting-started":
                return "Primeiros Passos";
            case "workflows":
                return "Workflows";
            case "analytics":
                return "Analytics";
            case "integrations":
                return "Integrações";
            default:
                return "Geral";
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay com destaque */}
            {highlightElement && (
                <div
                    ref={overlayRef}
                    className="fixed inset-0 z-40 pointer-events-none"
                    style={{
                        background: `radial-gradient(circle at ${
                            highlightElement.getBoundingClientRect().left +
                            highlightElement.getBoundingClientRect().width / 2
                        }px ${
                            highlightElement.getBoundingClientRect().top +
                            highlightElement.getBoundingClientRect().height / 2
                        }px, transparent 120px, rgba(0,0,0,0.6) 120px)`,
                    }}
                />
            )}

            {/* Modal principal */}
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                    {showTourSelector ? (
                        // Seletor de tours
                        <div>
                            <div className="flex items-center justify-between p-6 border-b">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Centro de Aprendizado</h2>
                                    <p className="text-sm text-gray-600">Escolha um tutorial para começar</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={closeTour}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="p-6 max-h-[60vh] overflow-y-auto">
                                <div className="space-y-4">
                                    {Object.entries(
                                        getAvailableTours().reduce(
                                            (acc, tour) => {
                                                if (!acc[tour.category]) acc[tour.category] = [];
                                                acc[tour.category].push(tour);
                                                return acc;
                                            },
                                            {} as Record<string, OnboardingTour[]>
                                        )
                                    ).map(([category, tours]) => (
                                        <div key={category}>
                                            <div className="flex items-center space-x-2 mb-3">
                                                {getCategoryIcon(category as OnboardingTour["category"])}
                                                <h3 className="font-medium text-gray-900">
                                                    {getCategoryName(category as OnboardingTour["category"])}
                                                </h3>
                                            </div>

                                            <div className="space-y-2 ml-6">
                                                {tours.map((tour) => (
                                                    <Card
                                                        key={tour.id}
                                                        className="cursor-pointer hover:shadow-md transition-shadow"
                                                        onClick={() => startTour(tour)}
                                                    >
                                                        <CardContent className="p-4">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center space-x-2 mb-1">
                                                                        {tour.icon}
                                                                        <h4 className="font-medium text-gray-900">
                                                                            {tour.name}
                                                                        </h4>
                                                                        {completedTours.includes(tour.id) && (
                                                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                                                        )}
                                                                    </div>
                                                                    <p className="text-sm text-gray-600 mb-2">
                                                                        {tour.description}
                                                                    </p>
                                                                    <div className="flex items-center text-xs text-gray-500">
                                                                        <span>⏱️ {tour.estimatedTime} min</span>
                                                                        <span className="mx-2">•</span>
                                                                        <span>{tour.steps.length} passos</span>
                                                                    </div>
                                                                </div>
                                                                <ArrowRight className="h-4 w-4 text-gray-400" />
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {getAvailableTours().length === 0 && (
                                    <div className="text-center py-8">
                                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Parabéns! 🎉</h3>
                                        <p className="text-gray-600">Você completou todos os tutoriais disponíveis!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : currentTour ? (
                        // Tour ativo
                        <div>
                            <div className="flex items-center justify-between p-6 border-b">
                                <div className="flex items-center space-x-3">
                                    {currentTour.icon}
                                    <div>
                                        <h2 className="font-bold text-gray-900">{currentTour.name}</h2>
                                        <p className="text-sm text-gray-600">
                                            Passo {currentStep + 1} de {currentTour.steps.length}
                                        </p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={closeTour}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Progresso */}
                            <div className="px-6 py-3 bg-gray-50 border-b">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700">Progresso</span>
                                    <span className="text-sm text-gray-600">
                                        {Math.round(((currentStep + 1) / currentTour.steps.length) * 100)}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{
                                            width: `${((currentStep + 1) / currentTour.steps.length) * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Conteúdo do passo */}
                            <div className="p-6">
                                {currentTour.steps[currentStep] && (
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                                            {currentTour.steps[currentStep].title}
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            {currentTour.steps[currentStep].description}
                                        </p>
                                        {currentTour.steps[currentStep].content}
                                    </div>
                                )}
                            </div>

                            {/* Controles */}
                            <div className="flex items-center justify-between p-6 border-t bg-gray-50">
                                <div className="flex space-x-2">
                                    <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
                                        <ChevronLeft className="h-4 w-4 mr-2" />
                                        Anterior
                                    </Button>

                                    {currentTour.steps[currentStep]?.skippable && (
                                        <Button variant="ghost" onClick={skipStep}>
                                            <SkipForward className="h-4 w-4 mr-2" />
                                            Pular
                                        </Button>
                                    )}
                                </div>

                                <Button onClick={nextStep}>
                                    {currentStep === currentTour.steps.length - 1 ? "Finalizar" : "Próximo"}
                                    <ChevronRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </>
    );
};
