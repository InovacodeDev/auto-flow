// Import legacy nodes for backward compatibility
import { TriggerNode, ActionNode, ConditionNode, UtilityNode } from "./CustomNodes";

// Import new advanced nodes
import {
    ManualTriggerNode,
    WebhookTriggerNode,
    ScheduleTriggerNode,
    CalendarTriggerNode,
    FormTriggerNode,
    NotificationTriggerNode,
    DatabaseTriggerNode,
} from "./nodes/TriggerNodes";

import {
    HttpRequestActionNode,
    EmailActionNode,
    DatabaseActionNode,
    WhatsAppActionNode,
    CloudStorageActionNode,
    PaymentActionNode,
    UserManagementActionNode,
    AnalyticsActionNode,
    SystemActionNode,
    FileDownloadActionNode,
    NotificationActionNode,
    SecurityActionNode,
    DataTransformActionNode,
} from "./nodes/ActionNodes";

import {
    ConditionNode as AdvancedConditionNode,
    SwitchNode,
    ValidationNode,
    ErrorHandlerNode,
    RetryNode,
    GateNode,
} from "./nodes/ConditionNodes";

import {
    DelayNode,
    DataTransformNode,
    CloneNode,
    CodeExecutionNode,
    VariableNode,
    CalculatorNode,
    UrlBuilderNode,
    QueueNode,
    AggregatorNode,
    LoggerNode,
    ConfigurationNode,
    SecurityNode,
} from "./nodes/UtilityNodes";

export const nodeTypes = {
    // Legacy nodes (backward compatibility)
    trigger: TriggerNode,
    action: ActionNode,
    condition: ConditionNode,
    utility: UtilityNode,

    // Advanced Trigger nodes
    manual_trigger: ManualTriggerNode,
    webhook_trigger: WebhookTriggerNode,
    schedule_trigger: ScheduleTriggerNode,
    calendar_trigger: CalendarTriggerNode,
    form_trigger: FormTriggerNode,
    notification_trigger: NotificationTriggerNode,
    database_trigger: DatabaseTriggerNode,

    // Advanced Action nodes
    http_request: HttpRequestActionNode,
    send_email: EmailActionNode,
    database_save: DatabaseActionNode,
    whatsapp_send: WhatsAppActionNode,
    cloud_storage: CloudStorageActionNode,
    payment_process: PaymentActionNode,
    user_management: UserManagementActionNode,
    analytics_track: AnalyticsActionNode,
    system_action: SystemActionNode,
    file_download: FileDownloadActionNode,
    notification_send: NotificationActionNode,
    security_action: SecurityActionNode,
    data_transform: DataTransformActionNode,

    // Advanced Condition nodes
    condition_if: AdvancedConditionNode,
    switch_case: SwitchNode,
    validation: ValidationNode,
    error_handler: ErrorHandlerNode,
    retry: RetryNode,
    gate: GateNode,

    // Advanced Utility nodes
    delay: DelayNode,
    data_transform_util: DataTransformNode,
    clone: CloneNode,
    code_execution: CodeExecutionNode,
    variable: VariableNode,
    calculator: CalculatorNode,
    url_builder: UrlBuilderNode,
    queue: QueueNode,
    aggregator: AggregatorNode,
    logger: LoggerNode,
    configuration: ConfigurationNode,
    security: SecurityNode,
};

export default nodeTypes;
