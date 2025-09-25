# Engine de Workflows — Resumo consolidado

Visão curta e prática do engine de execução: responsabilidades, formato de workflow, endpoints e monitoramento.

Responsabilidades

- Converter workflows salvos em grafos executáveis.
- Enfileirar execuções (Redis/Bull/BullMQ).
- Executar ações via workers (integrações externas).
- Persistir execução, logs e métricas (Postgres + analytics).

Formato (essencial)

- Workflow: id, name, organizationId, triggers[], actions[], conditions[], settings{timeout,retries,concurrent}, metadata.
- Triggers suportados: webhook, schedule, manual, whatsapp_received, email_received.
- Actions comuns: send_whatsapp, create_pix_payment, api_call, save_to_crm, generate_document.

APIs principais

- POST /api/workflows/:id/execute — iniciar execução manual.
- GET /api/workflows/:id/executions — listar execuções.
- GET /api/workflows/executions/:executionId/logs — logs da execução.

Observabilidade

- Logs estruturados por executionId e nodeId.
- Métricas Prometheus: workflow_executions_total, duration histograms, http_request_duration_seconds.

Boas práticas de confiabilidade

- Idempotência em actions externas.
- Retry com backoff e circuit breakers para integrações instáveis.
- Persistir estados intermediários para replays/debug.

Onde aprofundar

- Documentação técnica do engine (arquivos completos): `docs/archive/workflow-engine-full.md` e `docs/archive/workflow-execution-20250925-full.md`.
