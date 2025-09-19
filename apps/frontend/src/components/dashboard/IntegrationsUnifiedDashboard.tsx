import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
    CheckCircle,
    XCircle,
    Settings,
    Activity,
    TrendingUp,
    AlertTriangle,
    Zap,
    MessageSquare,
    CreditCard,
    Users,
    FileSpreadsheet,
    RefreshCw,
    ExternalLink,
} from "lucide-react";

interface IntegrationStatus {
    id: string;
    name: string;
    type: "whatsapp" | "pix" | "crm" | "erp";
    status: "connected" | "disconnected" | "error" | "configuring";
    platform?: string;
    lastSync?: string;
    errorMessage?: string;
    metrics: {
        totalOperations: number;
        successRate: number;
        monthlyVolume: number;
        lastActivity: string;
    };
}

interface IntegrationStats {
    totalIntegrations: number;
    activeIntegrations: number;
    monthlyOperations: number;
    successRate: number;
    totalRevenue: number;
}

const integrationIcons = {
    whatsapp: MessageSquare,
    pix: CreditCard,
    crm: Users,
    erp: FileSpreadsheet,
};

const statusColors = {
    connected: "text-green-600 bg-green-50 border-green-200",
    disconnected: "text-gray-600 bg-gray-50 border-gray-200",
    error: "text-red-600 bg-red-50 border-red-200",
    configuring: "text-yellow-600 bg-yellow-50 border-yellow-200",
};

const typeLabels = {
    whatsapp: "WhatsApp Business",
    pix: "Pagamentos PIX",
    crm: "CRM",
    erp: "ERP",
};

const Alert: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
    <div className={`p-4 rounded-lg border ${className}`}>{children}</div>
);

const Tabs: React.FC<{
    value: string;
    onValueChange: (value: string) => void;
    children: React.ReactNode;
    className?: string;
}> = ({ children, className = "" }) => <div className={className}>{children}</div>;

const TabsList: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">{children}</div>
);

const TabsTrigger: React.FC<{
    value: string;
    children: React.ReactNode;
    onClick?: () => void;
    active?: boolean;
}> = ({ children, onClick, active = false }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            active ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
        }`}
    >
        {children}
    </button>
);

const TabsContent: React.FC<{
    value: string;
    activeValue: string;
    children: React.ReactNode;
    className?: string;
}> = ({ value, activeValue, children, className = "" }) => {
    if (value !== activeValue) return null;
    return <div className={className}>{children}</div>;
};

export const IntegrationsUnifiedDashboard: React.FC = () => {
    const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
    const [stats, setStats] = useState<IntegrationStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState("overview");
    const [refreshing, setRefreshing] = useState(false);

    // Simulated data - Replace with actual API calls
    useEffect(() => {
        loadIntegrationsData();
    }, []);

    const loadIntegrationsData = async () => {
        setIsLoading(true);
        try {
            // Simulate API calls to each integration service
            const mockIntegrations: IntegrationStatus[] = [
                {
                    id: "whatsapp-meta",
                    name: "WhatsApp Business API",
                    type: "whatsapp",
                    platform: "Meta",
                    status: "connected",
                    lastSync: "2024-01-15T10:30:00Z",
                    metrics: {
                        totalOperations: 1250,
                        successRate: 98.5,
                        monthlyVolume: 850,
                        lastActivity: "2024-01-15T10:25:00Z",
                    },
                },
                {
                    id: "pix-mercadopago",
                    name: "PIX - Mercado Pago",
                    type: "pix",
                    platform: "Mercado Pago",
                    status: "connected",
                    lastSync: "2024-01-15T10:28:00Z",
                    metrics: {
                        totalOperations: 340,
                        successRate: 99.2,
                        monthlyVolume: 285,
                        lastActivity: "2024-01-15T10:20:00Z",
                    },
                },
                {
                    id: "pix-pagbank",
                    name: "PIX - PagBank",
                    type: "pix",
                    platform: "PagBank",
                    status: "disconnected",
                    metrics: {
                        totalOperations: 0,
                        successRate: 0,
                        monthlyVolume: 0,
                        lastActivity: "Never",
                    },
                },
                {
                    id: "crm-rdstation",
                    name: "RD Station",
                    type: "crm",
                    platform: "RD Station",
                    status: "connected",
                    lastSync: "2024-01-15T10:32:00Z",
                    metrics: {
                        totalOperations: 520,
                        successRate: 97.8,
                        monthlyVolume: 450,
                        lastActivity: "2024-01-15T10:15:00Z",
                    },
                },
                {
                    id: "crm-pipedrive",
                    name: "Pipedrive",
                    type: "crm",
                    platform: "Pipedrive",
                    status: "error",
                    errorMessage: "API token expirado",
                    lastSync: "2024-01-14T15:20:00Z",
                    metrics: {
                        totalOperations: 180,
                        successRate: 85.2,
                        monthlyVolume: 120,
                        lastActivity: "2024-01-14T15:20:00Z",
                    },
                },
                {
                    id: "crm-hubspot",
                    name: "HubSpot",
                    type: "crm",
                    platform: "HubSpot",
                    status: "connected",
                    lastSync: "2024-01-15T10:30:00Z",
                    metrics: {
                        totalOperations: 690,
                        successRate: 96.5,
                        monthlyVolume: 580,
                        lastActivity: "2024-01-15T10:10:00Z",
                    },
                },
                {
                    id: "erp-omie",
                    name: "Omie ERP",
                    type: "erp",
                    platform: "Omie",
                    status: "connected",
                    lastSync: "2024-01-15T10:35:00Z",
                    metrics: {
                        totalOperations: 420,
                        successRate: 94.8,
                        monthlyVolume: 350,
                        lastActivity: "2024-01-15T10:30:00Z",
                    },
                },
                {
                    id: "erp-contaazul",
                    name: "ContaAzul",
                    type: "erp",
                    platform: "ContaAzul",
                    status: "configuring",
                    metrics: {
                        totalOperations: 0,
                        successRate: 0,
                        monthlyVolume: 0,
                        lastActivity: "Never",
                    },
                },
                {
                    id: "erp-bling",
                    name: "Bling",
                    type: "erp",
                    platform: "Bling",
                    status: "disconnected",
                    metrics: {
                        totalOperations: 0,
                        successRate: 0,
                        monthlyVolume: 0,
                        lastActivity: "Never",
                    },
                },
            ];

            const mockStats: IntegrationStats = {
                totalIntegrations: mockIntegrations.length,
                activeIntegrations: mockIntegrations.filter((i) => i.status === "connected").length,
                monthlyOperations: mockIntegrations.reduce((sum, i) => sum + i.metrics.monthlyVolume, 0),
                successRate:
                    mockIntegrations
                        .filter((i) => i.status === "connected")
                        .reduce((sum, i) => sum + i.metrics.successRate, 0) /
                    mockIntegrations.filter((i) => i.status === "connected").length,
                totalRevenue: 45890.75,
            };

            setIntegrations(mockIntegrations);
            setStats(mockStats);
        } catch (error) {
            console.error("Erro ao carregar dados das integrações:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadIntegrationsData();
        setRefreshing(false);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "connected":
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case "error":
                return <XCircle className="w-5 h-5 text-red-600" />;
            case "configuring":
                return <Settings className="w-5 h-5 text-yellow-600 animate-spin" />;
            default:
                return <XCircle className="w-5 h-5 text-gray-400" />;
        }
    };

    const formatDate = (dateString: string) => {
        if (dateString === "Never") return "Nunca";
        return new Date(dateString).toLocaleString("pt-BR");
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };

    const tabs = [
        { value: "overview", label: "Visão Geral" },
        { value: "whatsapp", label: "WhatsApp" },
        { value: "pix", label: "PIX" },
        { value: "crm", label: "CRM" },
        { value: "erp", label: "ERP" },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Carregando integrações...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard de Integrações</h1>
                    <p className="text-gray-600 mt-1">
                        Monitore e gerencie todas as integrações brasileiras do AutoFlow
                    </p>
                </div>
                <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                    Atualizar
                </Button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Zap className="w-8 h-8 text-blue-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total de Integrações</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalIntegrations}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Ativas</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.activeIntegrations}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Activity className="w-8 h-8 text-purple-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Operações/Mês</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.monthlyOperations.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <TrendingUp className="w-8 h-8 text-green-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Taxa de Sucesso</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.successRate.toFixed(1)}%</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <CreditCard className="w-8 h-8 text-emerald-600" />
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Receita/Mês</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatCurrency(stats.totalRevenue)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Main Content */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
                <TabsList>
                    {tabs.map((tab) => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            onClick={() => setSelectedTab(tab.value)}
                            active={selectedTab === tab.value}
                        >
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <TabsContent value="overview" activeValue={selectedTab} className="space-y-4">
                    {/* Alerts */}
                    <div className="space-y-2">
                        {integrations.filter((i) => i.status === "error").length > 0 && (
                            <Alert className="border-red-200 bg-red-50">
                                <div className="flex items-center">
                                    <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                                    <p className="text-red-800">
                                        {integrations.filter((i) => i.status === "error").length} integração(ões) com
                                        erro. Verifique as configurações.
                                    </p>
                                </div>
                            </Alert>
                        )}

                        {integrations.filter((i) => i.status === "configuring").length > 0 && (
                            <Alert className="border-yellow-200 bg-yellow-50">
                                <div className="flex items-center">
                                    <Settings className="h-4 w-4 text-yellow-600 mr-2" />
                                    <p className="text-yellow-800">
                                        {integrations.filter((i) => i.status === "configuring").length} integração(ões)
                                        sendo configurada(s).
                                    </p>
                                </div>
                            </Alert>
                        )}
                    </div>

                    {/* All Integrations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {integrations.map((integration) => {
                            const Icon = integrationIcons[integration.type];

                            return (
                                <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <Icon className="w-6 h-6 text-blue-600" />
                                                <div>
                                                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                                                    <p className="text-sm text-gray-600">
                                                        {typeLabels[integration.type]}
                                                    </p>
                                                </div>
                                            </div>
                                            {getStatusIcon(integration.status)}
                                        </div>
                                    </CardHeader>

                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Status</span>
                                                <Badge variant="secondary" className={statusColors[integration.status]}>
                                                    {integration.status === "connected" && "Conectado"}
                                                    {integration.status === "disconnected" && "Desconectado"}
                                                    {integration.status === "error" && "Erro"}
                                                    {integration.status === "configuring" && "Configurando"}
                                                </Badge>
                                            </div>

                                            {integration.errorMessage && (
                                                <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                                                    {integration.errorMessage}
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-600">Operações</p>
                                                    <p className="font-semibold">
                                                        {integration.metrics.totalOperations}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">Taxa Sucesso</p>
                                                    <p className="font-semibold">{integration.metrics.successRate}%</p>
                                                </div>
                                            </div>

                                            <div className="text-sm">
                                                <p className="text-gray-600">Última sincronização</p>
                                                <p className="font-medium">
                                                    {formatDate(integration.lastSync || "Never")}
                                                </p>
                                            </div>

                                            <div className="flex space-x-2 pt-2">
                                                <Button size="sm" variant="outline" className="flex-1">
                                                    <Settings className="w-4 h-4 mr-1" />
                                                    Configurar
                                                </Button>
                                                {integration.status === "connected" && (
                                                    <Button size="sm" variant="outline">
                                                        <ExternalLink className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>

                {/* Individual tabs for each integration type */}
                {["whatsapp", "pix", "crm", "erp"].map((type) => (
                    <TabsContent key={type} value={type} activeValue={selectedTab} className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {integrations
                                .filter((i) => i.type === type)
                                .map((integration) => (
                                    <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    {React.createElement(integrationIcons[integration.type], {
                                                        className: "w-6 h-6 text-blue-600",
                                                    })}
                                                    <div>
                                                        <CardTitle>{integration.name}</CardTitle>
                                                        {integration.platform && (
                                                            <p className="text-sm text-gray-600">
                                                                {integration.platform}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                {getStatusIcon(integration.status)}
                                            </div>
                                        </CardHeader>

                                        <CardContent>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                                                        <p className="text-2xl font-bold text-blue-600">
                                                            {integration.metrics.totalOperations}
                                                        </p>
                                                        <p className="text-sm text-gray-600">Total de Operações</p>
                                                    </div>
                                                    <div className="text-center p-3 bg-green-50 rounded-lg">
                                                        <p className="text-2xl font-bold text-green-600">
                                                            {integration.metrics.successRate}%
                                                        </p>
                                                        <p className="text-sm text-gray-600">Taxa de Sucesso</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-gray-600">Volume Mensal</span>
                                                        <span className="text-sm font-medium">
                                                            {integration.metrics.monthlyVolume}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-gray-600">Última Atividade</span>
                                                        <span className="text-sm font-medium">
                                                            {formatDate(integration.metrics.lastActivity)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex space-x-2">
                                                    <Button variant="outline" className="flex-1">
                                                        <Settings className="w-4 h-4 mr-2" />
                                                        Configurações
                                                    </Button>
                                                    <Button variant="outline" className="flex-1">
                                                        <Activity className="w-4 h-4 mr-2" />
                                                        Logs
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
};
