import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
    Bell,
    AlertTriangle,
    Clock,
    Settings,
    Plus,
    Edit,
    Trash2,
    CheckCircle,
    RefreshCw,
    Eye,
    EyeOff,
} from "lucide-react";

interface Alert {
    id: string;
    organizationId: string;
    workflowId?: string;
    workflowName?: string;

    type: "high_failure_rate" | "slow_execution" | "low_usage" | "high_volume" | "custom";
    severity: "low" | "medium" | "high" | "critical";

    title: string;
    message: string;

    // Condições
    condition: {
        metric: "failure_rate" | "execution_time" | "execution_count" | "success_rate";
        operator: "greater_than" | "less_than" | "equals";
        threshold: number;
        timeWindow: number; // em minutos
    };

    // Status
    status: "active" | "triggered" | "resolved" | "disabled";
    isRead: boolean;

    // Notificações
    notifications: {
        email: boolean;
        push: boolean;
        webhook?: string;
    };

    // Timestamps
    createdAt: Date;
    triggeredAt?: Date;
    resolvedAt?: Date;
    lastChecked: Date;

    // Dados adicionais
    triggerCount: number;
    currentValue?: number;
}

interface AlertRule {
    id?: string;
    name: string;
    workflowId?: string;
    type: Alert["type"];
    severity: Alert["severity"];
    condition: Alert["condition"];
    notifications: Alert["notifications"];
    enabled: boolean;
}

export const AlertsNotifications: React.FC = () => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
    const [newRule, setNewRule] = useState<AlertRule>({
        name: "",
        type: "high_failure_rate",
        severity: "medium",
        condition: {
            metric: "failure_rate",
            operator: "greater_than",
            threshold: 10,
            timeWindow: 60,
        },
        notifications: {
            email: true,
            push: true,
        },
        enabled: true,
    });

    // Carregar alertas e regras
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // TODO: Implementar endpoints reais
            // const [alertsResponse, rulesResponse] = await Promise.all([
            //     fetch('/api/analytics/alerts'),
            //     fetch('/api/analytics/alert-rules')
            // ]);

            // Mock data para desenvolvimento
            const mockAlerts: Alert[] = [
                {
                    id: "alert-1",
                    organizationId: "org-1",
                    workflowId: "wf-3",
                    workflowName: "Sync CRM Leads",
                    type: "high_failure_rate",
                    severity: "medium",
                    title: "Taxa de falha elevada",
                    message: "O workflow 'Sync CRM Leads' apresenta taxa de falha de 15% nas últimas 2 horas",
                    condition: {
                        metric: "failure_rate",
                        operator: "greater_than",
                        threshold: 10,
                        timeWindow: 120,
                    },
                    status: "triggered",
                    isRead: false,
                    notifications: {
                        email: true,
                        push: true,
                    },
                    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
                    triggeredAt: new Date(Date.now() - 30 * 60 * 1000),
                    lastChecked: new Date(),
                    triggerCount: 3,
                    currentValue: 15,
                },
                {
                    id: "alert-2",
                    organizationId: "org-1",
                    workflowId: "wf-1",
                    workflowName: "WhatsApp Automático",
                    type: "slow_execution",
                    severity: "low",
                    title: "Execução lenta detectada",
                    message: "Tempo médio de execução aumentou para 45s",
                    condition: {
                        metric: "execution_time",
                        operator: "greater_than",
                        threshold: 30,
                        timeWindow: 60,
                    },
                    status: "resolved",
                    isRead: true,
                    notifications: {
                        email: false,
                        push: true,
                    },
                    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
                    triggeredAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
                    resolvedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
                    lastChecked: new Date(),
                    triggerCount: 1,
                    currentValue: 25,
                },
            ];

            const mockRules: AlertRule[] = [
                {
                    id: "rule-1",
                    name: "Alta Taxa de Falha",
                    type: "high_failure_rate",
                    severity: "medium",
                    condition: {
                        metric: "failure_rate",
                        operator: "greater_than",
                        threshold: 10,
                        timeWindow: 120,
                    },
                    notifications: {
                        email: true,
                        push: true,
                    },
                    enabled: true,
                },
                {
                    id: "rule-2",
                    name: "Execução Lenta",
                    workflowId: "wf-1",
                    type: "slow_execution",
                    severity: "low",
                    condition: {
                        metric: "execution_time",
                        operator: "greater_than",
                        threshold: 30,
                        timeWindow: 60,
                    },
                    notifications: {
                        email: false,
                        push: true,
                    },
                    enabled: true,
                },
            ];

            setAlerts(mockAlerts);
            setAlertRules(mockRules);
        } catch (err) {
            console.error("Erro ao carregar dados:", err);
            setError(err instanceof Error ? err.message : "Erro desconhecido");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();

        // Auto-refresh a cada 30 segundos
        const interval = setInterval(loadData, 30000);

        return () => clearInterval(interval);
    }, [loadData]);

    // Marcar alerta como lido
    const markAsRead = async (alertId: string) => {
        try {
            // TODO: Implementar endpoint real
            // await fetch(`/api/analytics/alerts/${alertId}/read`, { method: 'POST' });

            setAlerts(alerts.map((alert) => (alert.id === alertId ? { ...alert, isRead: true } : alert)));
        } catch (err) {
            console.error("Erro ao marcar como lido:", err);
        }
    };

    // Resolver alerta
    const resolveAlert = async (alertId: string) => {
        try {
            // TODO: Implementar endpoint real
            // await fetch(`/api/analytics/alerts/${alertId}/resolve`, { method: 'POST' });

            setAlerts(
                alerts.map((alert) =>
                    alert.id === alertId
                        ? {
                              ...alert,
                              status: "resolved",
                              resolvedAt: new Date(),
                              isRead: true,
                          }
                        : alert
                )
            );
        } catch (err) {
            console.error("Erro ao resolver alerta:", err);
        }
    };

    // Criar/Editar regra
    const saveRule = async () => {
        try {
            if (editingRule) {
                // TODO: Implementar endpoint de edição
                setAlertRules(
                    alertRules.map((rule) => (rule.id === editingRule.id ? { ...newRule, id: editingRule.id } : rule))
                );
            } else {
                // TODO: Implementar endpoint de criação
                const id = `rule-${Date.now()}`;
                setAlertRules([...alertRules, { ...newRule, id }]);
            }

            setShowCreateModal(false);
            setEditingRule(null);
            resetForm();
        } catch (err) {
            console.error("Erro ao salvar regra:", err);
        }
    };

    // Deletar regra
    const deleteRule = async (ruleId: string) => {
        try {
            // TODO: Implementar endpoint real
            // await fetch(`/api/analytics/alert-rules/${ruleId}`, { method: 'DELETE' });

            setAlertRules(alertRules.filter((rule) => rule.id !== ruleId));
        } catch (err) {
            console.error("Erro ao deletar regra:", err);
        }
    };

    // Toggle regra
    const toggleRule = async (ruleId: string) => {
        try {
            // TODO: Implementar endpoint real
            setAlertRules(alertRules.map((rule) => (rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule)));
        } catch (err) {
            console.error("Erro ao alterar regra:", err);
        }
    };

    const resetForm = () => {
        setNewRule({
            name: "",
            type: "high_failure_rate",
            severity: "medium",
            condition: {
                metric: "failure_rate",
                operator: "greater_than",
                threshold: 10,
                timeWindow: 60,
            },
            notifications: {
                email: true,
                push: true,
            },
            enabled: true,
        });
    };

    const getSeverityColor = (severity: Alert["severity"]) => {
        switch (severity) {
            case "critical":
                return "text-red-600 bg-red-100";
            case "high":
                return "text-orange-600 bg-orange-100";
            case "medium":
                return "text-yellow-600 bg-yellow-100";
            case "low":
                return "text-blue-600 bg-blue-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };

    const formatRelativeTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d atrás`;
        if (hours > 0) return `${hours}h atrás`;
        if (minutes > 0) return `${minutes}min atrás`;
        return "Agora mesmo";
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Carregando alertas...</span>
                </div>
            </div>
        );
    }

    const activeAlerts = alerts.filter((alert) => alert.status === "triggered");
    const unreadAlerts = alerts.filter((alert) => !alert.isRead);

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Alertas e Notificações</h1>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{activeAlerts.length} alertas ativos</span>
                        <span>{unreadAlerts.length} não lidos</span>
                        <span>{alertRules.filter((r) => r.enabled).length} regras ativas</span>
                    </div>
                </div>

                <div className="flex space-x-2">
                    <Button variant="outline" onClick={loadData}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Atualizar
                    </Button>
                    <Button onClick={() => setShowCreateModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Regra
                    </Button>
                </div>
            </div>

            {/* Alertas Ativos */}
            {activeAlerts.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-red-800">
                            <AlertTriangle className="h-5 w-5" />
                            <span>Alertas Ativos ({activeAlerts.length})</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {activeAlerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    className="flex items-start justify-between p-3 bg-white rounded-lg border"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <Badge className={getSeverityColor(alert.severity)}>
                                                {alert.severity === "critical"
                                                    ? "Crítico"
                                                    : alert.severity === "high"
                                                      ? "Alto"
                                                      : alert.severity === "medium"
                                                        ? "Médio"
                                                        : "Baixo"}
                                            </Badge>
                                            {!alert.isRead && <div className="w-2 h-2 bg-red-500 rounded-full"></div>}
                                        </div>
                                        <p className="font-medium text-gray-900">{alert.title}</p>
                                        <p className="text-sm text-gray-600">{alert.message}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {alert.workflowName && `${alert.workflowName} • `}
                                            Disparado {formatRelativeTime(alert.triggeredAt!)}
                                            {alert.currentValue && (
                                                <span>
                                                    {" "}
                                                    • Valor atual: {alert.currentValue}
                                                    {alert.condition.metric === "failure_rate" ||
                                                    alert.condition.metric === "success_rate"
                                                        ? "%"
                                                        : alert.condition.metric === "execution_time"
                                                          ? "s"
                                                          : ""}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2 ml-4">
                                        {!alert.isRead && (
                                            <Button variant="ghost" size="sm" onClick={() => markAsRead(alert.id)}>
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button variant="outline" size="sm" onClick={() => resolveAlert(alert.id)}>
                                            <CheckCircle className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Regras de Alerta */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Settings className="h-5 w-5" />
                        <span>Regras de Alerta</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {alertRules.map((rule) => (
                            <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <p className="font-medium">{rule.name}</p>
                                        <Badge className={getSeverityColor(rule.severity)}>
                                            {rule.severity === "critical"
                                                ? "Crítico"
                                                : rule.severity === "high"
                                                  ? "Alto"
                                                  : rule.severity === "medium"
                                                    ? "Médio"
                                                    : "Baixo"}
                                        </Badge>
                                        {rule.enabled ? (
                                            <Badge variant="default">Ativo</Badge>
                                        ) : (
                                            <Badge variant="secondary">Inativo</Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {rule.condition.metric === "failure_rate"
                                            ? "Taxa de falha"
                                            : rule.condition.metric === "success_rate"
                                              ? "Taxa de sucesso"
                                              : rule.condition.metric === "execution_time"
                                                ? "Tempo de execução"
                                                : "Contagem de execuções"}{" "}
                                        {rule.condition.operator === "greater_than"
                                            ? ">"
                                            : rule.condition.operator === "less_than"
                                              ? "<"
                                              : "="}{" "}
                                        {rule.condition.threshold}
                                        {rule.condition.metric.includes("rate")
                                            ? "%"
                                            : rule.condition.metric === "execution_time"
                                              ? "s"
                                              : ""}{" "}
                                        em {rule.condition.timeWindow} min
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Notificações:{" "}
                                        {[
                                            rule.notifications.email && "Email",
                                            rule.notifications.push && "Push",
                                            rule.notifications.webhook && "Webhook",
                                        ]
                                            .filter(Boolean)
                                            .join(", ")}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button variant="ghost" size="sm" onClick={() => toggleRule(rule.id!)}>
                                        {rule.enabled ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setEditingRule(rule);
                                            setNewRule(rule);
                                            setShowCreateModal(true);
                                        }}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => deleteRule(rule.id!)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}

                        {alertRules.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p>Nenhuma regra de alerta configurada</p>
                                <p className="text-sm">Crie sua primeira regra para receber notificações automáticas</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Histórico de Alertas */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Clock className="h-5 w-5" />
                        <span>Histórico de Alertas</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {alerts
                            .filter((alert) => alert.status !== "triggered")
                            .map((alert) => (
                                <div
                                    key={alert.id}
                                    className="flex items-start justify-between p-3 border rounded-lg opacity-75"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <Badge variant="outline" className={getSeverityColor(alert.severity)}>
                                                {alert.severity === "critical"
                                                    ? "Crítico"
                                                    : alert.severity === "high"
                                                      ? "Alto"
                                                      : alert.severity === "medium"
                                                        ? "Médio"
                                                        : "Baixo"}
                                            </Badge>
                                            <Badge variant={alert.status === "resolved" ? "default" : "secondary"}>
                                                {alert.status === "resolved"
                                                    ? "Resolvido"
                                                    : alert.status === "disabled"
                                                      ? "Desabilitado"
                                                      : "Ativo"}
                                            </Badge>
                                        </div>
                                        <p className="font-medium text-gray-900">{alert.title}</p>
                                        <p className="text-sm text-gray-600">{alert.message}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {alert.workflowName && `${alert.workflowName} • `}
                                            {alert.triggeredAt && `Disparado ${formatRelativeTime(alert.triggeredAt)}`}
                                            {alert.resolvedAt && ` • Resolvido ${formatRelativeTime(alert.resolvedAt)}`}
                                        </p>
                                    </div>
                                    <div className="text-right text-xs text-gray-500">
                                        {alert.triggerCount > 1 && <span>{alert.triggerCount} vezes</span>}
                                    </div>
                                </div>
                            ))}
                    </div>
                </CardContent>
            </Card>

            {/* Modal de Criação/Edição */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h2 className="text-lg font-bold mb-4">
                            {editingRule ? "Editar Regra" : "Nova Regra de Alerta"}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Regra</label>
                                <input
                                    type="text"
                                    value={newRule.name}
                                    onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Métrica</label>
                                <select
                                    value={newRule.condition.metric}
                                    onChange={(e) =>
                                        setNewRule({
                                            ...newRule,
                                            condition: { ...newRule.condition, metric: e.target.value as any },
                                        })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                >
                                    <option value="failure_rate">Taxa de Falha</option>
                                    <option value="success_rate">Taxa de Sucesso</option>
                                    <option value="execution_time">Tempo de Execução</option>
                                    <option value="execution_count">Contagem de Execuções</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Operador</label>
                                    <select
                                        value={newRule.condition.operator}
                                        onChange={(e) =>
                                            setNewRule({
                                                ...newRule,
                                                condition: { ...newRule.condition, operator: e.target.value as any },
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    >
                                        <option value="greater_than">Maior que</option>
                                        <option value="less_than">Menor que</option>
                                        <option value="equals">Igual a</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                                    <input
                                        type="number"
                                        value={newRule.condition.threshold}
                                        onChange={(e) =>
                                            setNewRule({
                                                ...newRule,
                                                condition: { ...newRule.condition, threshold: Number(e.target.value) },
                                            })
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Severidade</label>
                                <select
                                    value={newRule.severity}
                                    onChange={(e) => setNewRule({ ...newRule, severity: e.target.value as any })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                >
                                    <option value="low">Baixa</option>
                                    <option value="medium">Média</option>
                                    <option value="high">Alta</option>
                                    <option value="critical">Crítica</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Notificações</label>
                                <div className="space-y-2">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={newRule.notifications.email}
                                            onChange={(e) =>
                                                setNewRule({
                                                    ...newRule,
                                                    notifications: {
                                                        ...newRule.notifications,
                                                        email: e.target.checked,
                                                    },
                                                })
                                            }
                                            className="mr-2"
                                        />
                                        <span className="text-sm">Email</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={newRule.notifications.push}
                                            onChange={(e) =>
                                                setNewRule({
                                                    ...newRule,
                                                    notifications: { ...newRule.notifications, push: e.target.checked },
                                                })
                                            }
                                            className="mr-2"
                                        />
                                        <span className="text-sm">Push</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setEditingRule(null);
                                    resetForm();
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button onClick={saveRule}>{editingRule ? "Salvar" : "Criar"}</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-4">
                        <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            <span className="font-medium text-red-800">Erro</span>
                        </div>
                        <p className="text-sm text-red-600 mt-1">{error}</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
