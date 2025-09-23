import React from "react";
import {
    ExclamationTriangleIcon,
    XCircleIcon,
    InformationCircleIcon,
    CheckCircleIcon,
    ClockIcon,
} from "@heroicons/react/24/outline";

interface Alert {
    type: "error" | "warning" | "info";
    message: string;
    integrationId: string;
}

interface IntegrationsAlertsProps {
    alerts: Alert[];
}

export const IntegrationsAlerts: React.FC<IntegrationsAlertsProps> = ({ alerts }) => {
    const getAlertIcon = (type: string) => {
        switch (type) {
            case "error":
                return <XCircleIcon className="w-5 h-5 text-red-500" />;
            case "warning":
                return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
            case "info":
                return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
            default:
                return <InformationCircleIcon className="w-5 h-5 text-gray-500" />;
        }
    };

    const getAlertColor = (type: string) => {
        switch (type) {
            case "error":
                return "border-red-200 bg-red-50";
            case "warning":
                return "border-yellow-200 bg-yellow-50";
            case "info":
                return "border-blue-200 bg-blue-50";
            default:
                return "border-gray-200 bg-gray-50";
        }
    };

    const getAlertTextColor = (type: string) => {
        switch (type) {
            case "error":
                return "text-red-800";
            case "warning":
                return "text-yellow-800";
            case "info":
                return "text-blue-800";
            default:
                return "text-gray-800";
        }
    };

    const getAlertTitle = (type: string) => {
        switch (type) {
            case "error":
                return "Erro";
            case "warning":
                return "Aviso";
            case "info":
                return "Informação";
            default:
                return "Alerta";
        }
    };

    if (alerts.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center">
                    <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum alerta</h3>
                    <p className="text-gray-600">
                        Todas as integrações estão funcionando normalmente
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Alertas do Sistema</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {alerts.length} alerta{alerts.length !== 1 ? "s" : ""}
                </span>
            </div>

            <div className="space-y-3">
                {alerts.map((alert, index) => (
                    <div
                        key={index}
                        className={`border rounded-lg p-4 ${getAlertColor(alert.type)}`}
                    >
                        <div className="flex items-start">
                            <div className="flex-shrink-0">{getAlertIcon(alert.type)}</div>
                            <div className="ml-3 flex-1">
                                <div className="flex items-center justify-between">
                                    <h4
                                        className={`text-sm font-medium ${getAlertTextColor(alert.type)}`}
                                    >
                                        {getAlertTitle(alert.type)}
                                    </h4>
                                    <span className="text-xs text-gray-500">
                                        ID: {alert.integrationId}
                                    </span>
                                </div>
                                <p className={`mt-1 text-sm ${getAlertTextColor(alert.type)}`}>
                                    {alert.message}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold text-red-600">
                            {alerts.filter((a) => a.type === "error").length}
                        </div>
                        <div className="text-sm text-gray-600">Erros</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-yellow-600">
                            {alerts.filter((a) => a.type === "warning").length}
                        </div>
                        <div className="text-sm text-gray-600">Avisos</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-blue-600">
                            {alerts.filter((a) => a.type === "info").length}
                        </div>
                        <div className="text-sm text-gray-600">Informações</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
