import React, { useState, useEffect } from "react";
import { MaterialIcon } from "../ui/MaterialIcon";
import { Node } from "reactflow";

interface NodeInspectorProps {
    selectedNode: Node | null;
    onUpdateNode: (nodeId: string, updates: any) => void;
    onDeleteNode: (nodeId: string) => void;
    onDuplicateNode: (nodeId: string) => void;
    onClose: () => void;
}

interface FormField {
    key: string;
    label: string;
    type: "text" | "number" | "boolean" | "select" | "textarea" | "json";
    required?: boolean;
    options?: Array<{ value: string; label: string }>;
    placeholder?: string;
    description?: string;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({
    selectedNode,
    onUpdateNode,
    onDeleteNode,
    onDuplicateNode,
    onClose,
}) => {
    const [formData, setFormData] = useState<any>({});
    const [jsonError, setJsonError] = useState<string>("");

    // Reset form data when selected node changes
    useEffect(() => {
        if (selectedNode?.data) {
            setFormData({ ...selectedNode.data });
            setJsonError("");
        }
    }, [selectedNode]);

    if (!selectedNode) {
        return (
            <div className="w-80 bg-white border-l border-gray-200 shadow-lg h-full flex items-center justify-center">
                <div className="text-center p-6">
                    <MaterialIcon icon="info" className="text-gray-300 mx-auto mb-4" size={48} />
                    <p className="text-gray-500 text-sm">
                        Selecione um node no canvas para visualizar suas propriedades
                    </p>
                </div>
            </div>
        );
    }

    const getFormFields = (nodeType: string): FormField[] => {
        const baseFields: FormField[] = [
            {
                key: "name",
                label: "Nome",
                type: "text",
                required: true,
                placeholder: "Nome do node",
                description: "Nome descritivo para identificar este node",
            },
        ];

        switch (nodeType) {
            case "manual_trigger":
                return [
                    ...baseFields,
                    {
                        key: "description",
                        label: "Descrição",
                        type: "textarea",
                        placeholder: "Descreva quando este trigger deve ser executado",
                    },
                ];

            case "webhook_trigger":
                return [
                    ...baseFields,
                    {
                        key: "method",
                        label: "Método HTTP",
                        type: "select",
                        required: true,
                        options: [
                            { value: "GET", label: "GET" },
                            { value: "POST", label: "POST" },
                            { value: "PUT", label: "PUT" },
                            { value: "DELETE", label: "DELETE" },
                        ],
                    },
                    {
                        key: "authentication",
                        label: "Autenticação",
                        type: "select",
                        options: [
                            { value: "none", label: "Nenhuma" },
                            { value: "bearer", label: "Bearer Token" },
                            { value: "basic", label: "Basic Auth" },
                            { value: "api_key", label: "API Key" },
                        ],
                    },
                ];

            case "schedule_trigger":
                return [
                    ...baseFields,
                    {
                        key: "cron",
                        label: "Expressão Cron",
                        type: "text",
                        required: true,
                        placeholder: "0 9 * * 1-5",
                        description: "Formato: minuto hora dia mês dia-da-semana",
                    },
                    {
                        key: "timezone",
                        label: "Fuso Horário",
                        type: "select",
                        options: [
                            { value: "America/Sao_Paulo", label: "São Paulo (UTC-3)" },
                            { value: "America/New_York", label: "New York (UTC-5)" },
                            { value: "Europe/London", label: "London (UTC+0)" },
                            { value: "UTC", label: "UTC" },
                        ],
                    },
                ];

            case "http_request":
                return [
                    ...baseFields,
                    {
                        key: "method",
                        label: "Método HTTP",
                        type: "select",
                        required: true,
                        options: [
                            { value: "GET", label: "GET" },
                            { value: "POST", label: "POST" },
                            { value: "PUT", label: "PUT" },
                            { value: "DELETE", label: "DELETE" },
                            { value: "PATCH", label: "PATCH" },
                        ],
                    },
                    {
                        key: "url",
                        label: "URL",
                        type: "text",
                        required: true,
                        placeholder: "https://api.exemplo.com/endpoint",
                    },
                    {
                        key: "headers",
                        label: "Headers (JSON)",
                        type: "json",
                        placeholder: '{"Content-Type": "application/json"}',
                    },
                    {
                        key: "timeout",
                        label: "Timeout (ms)",
                        type: "number",
                        placeholder: "30000",
                    },
                ];

            case "send_email":
                return [
                    ...baseFields,
                    {
                        key: "from",
                        label: "Remetente",
                        type: "text",
                        required: true,
                        placeholder: "noreply@empresa.com",
                    },
                    {
                        key: "provider",
                        label: "Provedor",
                        type: "select",
                        options: [
                            { value: "smtp", label: "SMTP" },
                            { value: "sendgrid", label: "SendGrid" },
                            { value: "mailgun", label: "Mailgun" },
                            { value: "ses", label: "Amazon SES" },
                        ],
                    },
                ];

            case "database_save":
                return [
                    ...baseFields,
                    {
                        key: "table",
                        label: "Tabela",
                        type: "text",
                        required: true,
                        placeholder: "nome_da_tabela",
                    },
                    {
                        key: "operation",
                        label: "Operação",
                        type: "select",
                        options: [
                            { value: "insert", label: "Inserir" },
                            { value: "update", label: "Atualizar" },
                            { value: "upsert", label: "Inserir ou Atualizar" },
                        ],
                    },
                ];

            case "condition":
                return [
                    ...baseFields,
                    {
                        key: "condition",
                        label: "Condição",
                        type: "textarea",
                        required: true,
                        placeholder: "input.value > 0",
                        description: 'Use "input" para referenciar os dados de entrada',
                    },
                    {
                        key: "operator",
                        label: "Tipo de Operador",
                        type: "select",
                        options: [
                            { value: "javascript", label: "JavaScript" },
                            { value: "simple", label: "Comparação Simples" },
                        ],
                    },
                ];

            case "delay":
                return [
                    ...baseFields,
                    {
                        key: "duration",
                        label: "Duração",
                        type: "number",
                        required: true,
                        placeholder: "5000",
                    },
                    {
                        key: "unit",
                        label: "Unidade",
                        type: "select",
                        options: [
                            { value: "milliseconds", label: "Milissegundos" },
                            { value: "seconds", label: "Segundos" },
                            { value: "minutes", label: "Minutos" },
                            { value: "hours", label: "Horas" },
                        ],
                    },
                ];

            default:
                return baseFields;
        }
    };

    const handleFieldChange = (key: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [key]: value }));
    };

    const handleJsonFieldChange = (key: string, value: string) => {
        try {
            const parsed = JSON.parse(value || "{}");
            setFormData((prev: any) => ({ ...prev, [key]: parsed }));
            setJsonError("");
        } catch (error) {
            setJsonError("JSON inválido");
        }
    };

    const handleSave = () => {
        onUpdateNode(selectedNode.id, formData);
    };

    const renderField = (field: FormField) => {
        const value = formData[field.key] || "";

        switch (field.type) {
            case "text":
                return (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={field.required}
                    />
                );

            case "number":
                return (
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => handleFieldChange(field.key, Number(e.target.value))}
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={field.required}
                    />
                );

            case "boolean":
                return (
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => handleFieldChange(field.key, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Ativo</span>
                    </label>
                );

            case "select":
                return (
                    <select
                        value={value}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={field.required}
                    >
                        <option value="">Selecione...</option>
                        {field.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );

            case "textarea":
                return (
                    <textarea
                        value={value}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required={field.required}
                    />
                );

            case "json":
                return (
                    <div>
                        <textarea
                            value={typeof value === "object" ? JSON.stringify(value, null, 2) : value}
                            onChange={(e) => handleJsonFieldChange(field.key, e.target.value)}
                            placeholder={field.placeholder}
                            rows={4}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                                jsonError ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                            }`}
                        />
                        {jsonError && <p className="text-red-500 text-xs mt-1">{jsonError}</p>}
                    </div>
                );

            default:
                return null;
        }
    };

    const formFields = getFormFields(selectedNode.data?.nodeType || "unknown");

    return (
        <div className="w-80 bg-white border-l border-gray-200 shadow-lg h-full overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                    <MaterialIcon icon="settings" className="text-gray-600" size={20} />
                    <h2 className="text-lg font-semibold text-gray-900">Propriedades</h2>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                    <MaterialIcon icon="close" size={20} />
                </button>
            </div>

            {/* Node Info */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
                <p className="text-sm font-medium text-gray-900">{selectedNode.data?.name || selectedNode.id}</p>
                <p className="text-xs text-gray-500 mt-1">Tipo: {selectedNode.data?.nodeType || "Desconhecido"}</p>
            </div>

            {/* Form Fields */}
            <div className="p-4 space-y-4">
                {formFields.map((field) => (
                    <div key={field.key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {renderField(field)}
                        {field.description && <p className="text-xs text-gray-500 mt-1">{field.description}</p>}
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-50 border-t border-gray-200 space-y-2">
                <button
                    onClick={handleSave}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    disabled={!!jsonError}
                >
                    Salvar Alterações
                </button>

                <div className="flex space-x-2">
                    <button
                        onClick={() => onDuplicateNode(selectedNode.id)}
                        className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-2 px-3 rounded-md hover:bg-gray-200 transition-colors"
                    >
                        <MaterialIcon icon="content_copy" size={16} />
                        <span className="text-sm">Duplicar</span>
                    </button>

                    <button
                        onClick={() => onDeleteNode(selectedNode.id)}
                        className="flex-1 flex items-center justify-center space-x-2 bg-red-100 text-red-700 py-2 px-3 rounded-md hover:bg-red-200 transition-colors"
                    >
                        <MaterialIcon icon="delete" size={16} />
                        <span className="text-sm">Excluir</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NodeInspector;
