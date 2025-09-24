import React from "react";
import {
    XMarkIcon,
    BoltIcon,
    PlayIcon,
    ClockIcon,
    EnvelopeIcon,
    GlobeAltIcon,
    FunnelIcon,
    CalendarIcon,
    CursorArrowRaysIcon,
    BellIcon,
    ChatBubbleLeftRightIcon,
    CloudIcon,
    CurrencyDollarIcon,
    UserIcon,
    ChartBarIcon,
    CogIcon,
    ShieldCheckIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon,
    QuestionMarkCircleIcon,
    ScaleIcon,
    CpuChipIcon,
    DocumentCheckIcon,
    VariableIcon,
    CalculatorIcon,
    LinkIcon,
    QueueListIcon,
    EyeIcon,
    DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";
import { DatabaseIcon } from "lucide-react";

interface NodeDefinition {
    id: string;
    name: string;
    description: string;
    category: "trigger" | "action" | "condition" | "utility";
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    inputs: Array<{ name: string; type: string; required: boolean }>;
    outputs: Array<{ name: string; type: string }>;
    config: Record<string, any>;
}

const NODE_DEFINITIONS: NodeDefinition[] = [
    // TRIGGERS
    {
        id: "manual_trigger",
        name: "Trigger Manual",
        description: "Inicia o workflow manualmente via botão ou API",
        category: "trigger",
        icon: PlayIcon,
        color: "bg-green-500",
        inputs: [],
        outputs: [{ name: "output", type: "any" }],
        config: {
            name: "Manual Trigger",
            description: "Trigger executado manualmente",
        },
    },
    {
        id: "webhook_trigger",
        name: "Webhook",
        description: "Recebe dados via requisição HTTP POST",
        category: "trigger",
        icon: GlobeAltIcon,
        color: "bg-blue-500",
        inputs: [],
        outputs: [{ name: "data", type: "object" }],
        config: {
            name: "Webhook Trigger",
            method: "POST",
            authentication: "none",
        },
    },
    {
        id: "schedule_trigger",
        name: "Agendamento",
        description: "Executa em horários programados (cron)",
        category: "trigger",
        icon: ClockIcon,
        color: "bg-purple-500",
        inputs: [],
        outputs: [{ name: "timestamp", type: "string" }],
        config: {
            name: "Schedule Trigger",
            cron: "0 9 * * 1-5", // 9h todos os dias úteis
            timezone: "America/Sao_Paulo",
        },
    },
    {
        id: "calendar_trigger",
        name: "Calendário",
        description: "Dispara quando eventos do calendário ocorrem",
        category: "trigger",
        icon: CalendarIcon,
        color: "bg-indigo-500",
        inputs: [],
        outputs: [{ name: "event", type: "object" }],
        config: {
            name: "Calendar Trigger",
            event: "created",
            calendar: "primary",
        },
    },
    {
        id: "form_trigger",
        name: "Formulário",
        description: "Dispara quando formulário é submetido",
        category: "trigger",
        icon: CursorArrowRaysIcon,
        color: "bg-orange-500",
        inputs: [],
        outputs: [{ name: "submission", type: "object" }],
        config: {
            name: "Form Trigger",
            formId: "form-123",
        },
    },
    {
        id: "notification_trigger",
        name: "Notificação",
        description: "Dispara quando notificação é recebida",
        category: "trigger",
        icon: BellIcon,
        color: "bg-pink-500",
        inputs: [],
        outputs: [{ name: "notification", type: "object" }],
        config: {
            name: "Notification Trigger",
            type: "push",
        },
    },
    {
        id: "database_trigger",
        name: "Banco de Dados",
        description: "Dispara quando mudanças ocorrem no banco",
        category: "trigger",
        icon: DatabaseIcon,
        color: "bg-teal-500",
        inputs: [],
        outputs: [{ name: "record", type: "object" }],
        config: {
            name: "Database Trigger",
            table: "users",
            operation: "insert",
        },
    },

    // ACTIONS
    {
        id: "http_request",
        name: "Requisição HTTP",
        description: "Faz chamada para API externa",
        category: "action",
        icon: GlobeAltIcon,
        color: "bg-orange-500",
        inputs: [
            { name: "url", type: "string", required: true },
            { name: "data", type: "object", required: false },
        ],
        outputs: [
            { name: "response", type: "object" },
            { name: "status", type: "number" },
        ],
        config: {
            name: "HTTP Request",
            method: "GET",
            url: "",
            headers: {},
            timeout: 30000,
        },
    },
    {
        id: "send_email",
        name: "Enviar Email",
        description: "Envia email através do provedor configurado",
        category: "action",
        icon: EnvelopeIcon,
        color: "bg-red-500",
        inputs: [
            { name: "to", type: "string", required: true },
            { name: "subject", type: "string", required: true },
            { name: "body", type: "string", required: true },
        ],
        outputs: [{ name: "messageId", type: "string" }],
        config: {
            name: "Send Email",
            from: "",
            provider: "smtp",
        },
    },
    {
        id: "database_save",
        name: "Salvar no Banco",
        description: "Armazena dados no banco de dados",
        category: "action",
        icon: DatabaseIcon,
        color: "bg-teal-500",
        inputs: [{ name: "data", type: "object", required: true }],
        outputs: [{ name: "id", type: "string" }],
        config: {
            name: "Database Save",
            table: "",
            operation: "insert",
        },
    },
    {
        id: "whatsapp_send",
        name: "Enviar WhatsApp",
        description: "Envia mensagem via WhatsApp Business API",
        category: "action",
        icon: ChatBubbleLeftRightIcon,
        color: "bg-green-600",
        inputs: [
            { name: "to", type: "string", required: true },
            { name: "message", type: "string", required: true },
        ],
        outputs: [{ name: "messageId", type: "string" }],
        config: {
            name: "WhatsApp Send",
            type: "message",
        },
    },
    {
        id: "cloud_storage",
        name: "Armazenamento",
        description: "Upload/download de arquivos na nuvem",
        category: "action",
        icon: CloudIcon,
        color: "bg-blue-600",
        inputs: [
            { name: "file", type: "object", required: true },
            { name: "path", type: "string", required: true },
        ],
        outputs: [{ name: "url", type: "string" }],
        config: {
            name: "Cloud Storage",
            provider: "aws",
            operation: "upload",
        },
    },
    {
        id: "payment_process",
        name: "Processar Pagamento",
        description: "Processa pagamentos via gateway",
        category: "action",
        icon: CurrencyDollarIcon,
        color: "bg-emerald-500",
        inputs: [
            { name: "amount", type: "number", required: true },
            { name: "customer", type: "object", required: true },
        ],
        outputs: [{ name: "transactionId", type: "string" }],
        config: {
            name: "Payment Process",
            provider: "stripe",
            amount: "0.00",
        },
    },
    {
        id: "user_management",
        name: "Gerenciar Usuário",
        description: "Cria, atualiza ou remove usuários",
        category: "action",
        icon: UserIcon,
        color: "bg-indigo-500",
        inputs: [
            { name: "userData", type: "object", required: true },
            { name: "operation", type: "string", required: true },
        ],
        outputs: [{ name: "user", type: "object" }],
        config: {
            name: "User Management",
            operation: "create",
        },
    },
    {
        id: "analytics_track",
        name: "Rastrear Analytics",
        description: "Envia eventos para sistema de analytics",
        category: "action",
        icon: ChartBarIcon,
        color: "bg-purple-500",
        inputs: [
            { name: "event", type: "string", required: true },
            { name: "properties", type: "object", required: false },
        ],
        outputs: [{ name: "tracked", type: "boolean" }],
        config: {
            name: "Analytics Track",
            event: "custom_event",
        },
    },
    {
        id: "notification_send",
        name: "Enviar Notificação",
        description: "Envia notificações push, SMS ou email",
        category: "action",
        icon: BellIcon,
        color: "bg-pink-500",
        inputs: [
            { name: "user", type: "object", required: true },
            { name: "message", type: "string", required: true },
        ],
        outputs: [{ name: "notificationId", type: "string" }],
        config: {
            name: "Notification Send",
            type: "push",
        },
    },

    // CONDITIONS
    {
        id: "condition_if",
        name: "Condição IF",
        description: "Avalia condição e direciona fluxo",
        category: "condition",
        icon: FunnelIcon,
        color: "bg-yellow-500",
        inputs: [{ name: "input", type: "any", required: true }],
        outputs: [
            { name: "true", type: "any" },
            { name: "false", type: "any" },
        ],
        config: {
            name: "Condition",
            condition: "input.value > 0",
            operator: "javascript",
        },
    },
    {
        id: "switch_case",
        name: "Switch/Case",
        description: "Direciona fluxo baseado em múltiplas condições",
        category: "condition",
        icon: ScaleIcon,
        color: "bg-indigo-500",
        inputs: [{ name: "input", type: "any", required: true }],
        outputs: [
            { name: "case1", type: "any" },
            { name: "case2", type: "any" },
            { name: "default", type: "any" },
        ],
        config: {
            name: "Switch",
            cases: [],
        },
    },
    {
        id: "validation",
        name: "Validação",
        description: "Valida dados e direciona fluxo baseado no resultado",
        category: "condition",
        icon: DocumentCheckIcon,
        color: "bg-green-500",
        inputs: [
            { name: "input", type: "object", required: true },
            { name: "rules", type: "object", required: true },
        ],
        outputs: [
            { name: "valid", type: "object" },
            { name: "invalid", type: "object" },
        ],
        config: {
            name: "Validation",
            rules: [],
        },
    },
    {
        id: "error_handler",
        name: "Tratamento de Erro",
        description: "Captura e trata erros no workflow",
        category: "condition",
        icon: ExclamationTriangleIcon,
        color: "bg-red-500",
        inputs: [
            { name: "input", type: "any", required: true },
            { name: "error", type: "object", required: false },
        ],
        outputs: [
            { name: "success", type: "object" },
            { name: "handled", type: "object" },
        ],
        config: {
            name: "Error Handler",
            type: "catch",
        },
    },
    {
        id: "retry",
        name: "Tentar Novamente",
        description: "Tenta executar ação novamente em caso de falha",
        category: "condition",
        icon: CpuChipIcon,
        color: "bg-purple-500",
        inputs: [
            { name: "input", type: "any", required: true },
            { name: "condition", type: "string", required: false },
        ],
        outputs: [
            { name: "success", type: "object" },
            { name: "failed", type: "object" },
        ],
        config: {
            name: "Retry",
            attempts: 3,
            delay: 1000,
        },
    },
    {
        id: "gate",
        name: "Portão",
        description: "Controla se o fluxo deve continuar",
        category: "condition",
        icon: QuestionMarkCircleIcon,
        color: "bg-gray-500",
        inputs: [
            { name: "input", type: "any", required: true },
            { name: "condition", type: "boolean", required: true },
        ],
        outputs: [{ name: "output", type: "object" }],
        config: {
            name: "Gate",
            condition: "always",
        },
    },

    // UTILITIES
    {
        id: "delay",
        name: "Aguardar",
        description: "Pausa a execução por tempo determinado",
        category: "utility",
        icon: ClockIcon,
        color: "bg-gray-500",
        inputs: [{ name: "input", type: "any", required: false }],
        outputs: [{ name: "output", type: "any" }],
        config: {
            name: "Delay",
            duration: 5000, // 5 segundos em ms
            unit: "milliseconds",
        },
    },
    {
        id: "data_transform_util",
        name: "Transformar Dados",
        description: "Transforma dados de um formato para outro",
        category: "utility",
        icon: ArrowPathIcon,
        color: "bg-blue-500",
        inputs: [
            { name: "input", type: "object", required: true },
            { name: "mapping", type: "object", required: true },
        ],
        outputs: [{ name: "output", type: "object" }],
        config: {
            name: "Data Transform",
            operation: "map",
        },
    },
    {
        id: "clone",
        name: "Clonar",
        description: "Cria múltiplas cópias dos dados",
        category: "utility",
        icon: DocumentDuplicateIcon,
        color: "bg-green-500",
        inputs: [{ name: "input", type: "any", required: true }],
        outputs: [
            { name: "output1", type: "object" },
            { name: "output2", type: "object" },
            { name: "output3", type: "object" },
        ],
        config: {
            name: "Clone",
            copies: 1,
        },
    },
    {
        id: "code_execution",
        name: "Executar Código",
        description: "Executa código JavaScript personalizado",
        category: "utility",
        icon: CpuChipIcon,
        color: "bg-purple-500",
        inputs: [
            { name: "input", type: "object", required: true },
            { name: "code", type: "string", required: true },
        ],
        outputs: [
            { name: "output", type: "any" },
            { name: "error", type: "object" },
        ],
        config: {
            name: "Code Execution",
            language: "javascript",
        },
    },
    {
        id: "variable",
        name: "Variável",
        description: "Armazena e recupera valores de variáveis",
        category: "utility",
        icon: VariableIcon,
        color: "bg-orange-500",
        inputs: [{ name: "input", type: "any", required: true }],
        outputs: [{ name: "output", type: "any" }],
        config: {
            name: "var",
            type: "string",
        },
    },
    {
        id: "calculator",
        name: "Calculadora",
        description: "Executa operações matemáticas",
        category: "utility",
        icon: CalculatorIcon,
        color: "bg-teal-500",
        inputs: [
            { name: "a", type: "number", required: true },
            { name: "b", type: "number", required: true },
            { name: "operation", type: "string", required: true },
        ],
        outputs: [{ name: "result", type: "number" }],
        config: {
            name: "Calculator",
            operation: "add",
        },
    },
    {
        id: "url_builder",
        name: "Construtor de URL",
        description: "Constrói URLs dinamicamente",
        category: "utility",
        icon: LinkIcon,
        color: "bg-cyan-500",
        inputs: [
            { name: "baseUrl", type: "string", required: true },
            { name: "path", type: "string", required: false },
            { name: "params", type: "object", required: false },
        ],
        outputs: [{ name: "url", type: "string" }],
        config: {
            name: "URL Builder",
            baseUrl: "https://api.example.com",
        },
    },
    {
        id: "queue",
        name: "Fila",
        description: "Gerencia filas de processamento",
        category: "utility",
        icon: QueueListIcon,
        color: "bg-indigo-500",
        inputs: [
            { name: "input", type: "any", required: true },
            { name: "queue", type: "string", required: true },
        ],
        outputs: [
            { name: "output", type: "object" },
            { name: "position", type: "number" },
        ],
        config: {
            name: "Queue",
            operation: "enqueue",
            queue: "default",
        },
    },
    {
        id: "aggregator",
        name: "Agregador",
        description: "Agrega dados de múltiplas fontes",
        category: "utility",
        icon: ChartBarIcon,
        color: "bg-pink-500",
        inputs: [
            { name: "input", type: "array", required: true },
            { name: "field", type: "string", required: true },
        ],
        outputs: [
            { name: "result", type: "number" },
            { name: "count", type: "number" },
        ],
        config: {
            name: "Aggregator",
            operation: "sum",
            field: "value",
        },
    },
    {
        id: "logger",
        name: "Logger",
        description: "Registra logs durante a execução",
        category: "utility",
        icon: EyeIcon,
        color: "bg-gray-600",
        inputs: [
            { name: "input", type: "any", required: true },
            { name: "message", type: "string", required: true },
        ],
        outputs: [
            { name: "output", type: "object" },
            { name: "logId", type: "string" },
        ],
        config: {
            name: "Logger",
            level: "info",
        },
    },
    {
        id: "configuration",
        name: "Configuração",
        description: "Gerencia configurações do workflow",
        category: "utility",
        icon: CogIcon,
        color: "bg-slate-500",
        inputs: [{ name: "input", type: "any", required: false }],
        outputs: [{ name: "config", type: "object" }],
        config: {
            name: "Configuration",
        },
    },
    {
        id: "security",
        name: "Segurança",
        description: "Aplica operações de segurança aos dados",
        category: "utility",
        icon: ShieldCheckIcon,
        color: "bg-red-600",
        inputs: [
            { name: "input", type: "any", required: true },
            { name: "key", type: "string", required: true },
        ],
        outputs: [
            { name: "output", type: "object" },
            { name: "status", type: "string" },
        ],
        config: {
            name: "Security",
            action: "encrypt",
        },
    },
];

interface NodeLibraryProps {
    onAddNode: (nodeType: string, nodeConfig: any) => void;
    onClose: () => void;
}

export const NodeLibrary: React.FC<NodeLibraryProps> = ({ onAddNode, onClose }) => {
    const categories = {
        trigger: { name: "Triggers", color: "text-green-700" },
        action: { name: "Ações", color: "text-blue-700" },
        condition: { name: "Condições", color: "text-yellow-700" },
        utility: { name: "Utilidades", color: "text-gray-700" },
    };

    const groupedNodes = NODE_DEFINITIONS.reduce(
        (acc, node) => {
            if (!acc[node.category]) {
                acc[node.category] = [];
            }
            acc[node.category].push(node);
            return acc;
        },
        {} as Record<string, NodeDefinition[]>
    );

    const handleNodeClick = (node: NodeDefinition) => {
        onAddNode(node.category, {
            ...node.config,
            nodeType: node.id,
            inputs: node.inputs,
            outputs: node.outputs,
        });
    };

    return (
        <div className="w-80 bg-white border-r border-gray-200 shadow-lg h-full overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Biblioteca de Nodes</h2>
                <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                    <XMarkIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-6">
                {Object.entries(categories).map(([categoryKey, category]) => {
                    const nodes = groupedNodes[categoryKey] || [];

                    return (
                        <div key={categoryKey}>
                            <h3 className={`text-sm font-medium ${category.color} mb-3`}>
                                {category.name}
                            </h3>

                            <div className="space-y-2">
                                {nodes.map((node) => {
                                    const IconComponent = node.icon;

                                    return (
                                        <button
                                            key={node.id}
                                            onClick={() => handleNodeClick(node)}
                                            className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors group"
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div
                                                    className={`p-2 ${node.color} text-white rounded-lg`}
                                                >
                                                    <IconComponent className="w-4 h-4" />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                                                        {node.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                        {node.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer com dica */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-blue-50 border-t border-blue-200">
                <div className="flex items-start space-x-2">
                    <BoltIcon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-blue-900">Dica</p>
                        <p className="text-xs text-blue-700">
                            Clique em um node para adicioná-lo ao canvas. Conecte-os arrastando das
                            saídas para as entradas.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NodeLibrary;
