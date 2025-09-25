# Templates e Setup — Resumo consolidado

Este arquivo reúne instruções rápidas para usar templates prontos e as etapas essenciais de setup (integrações e IA) para iniciar um projeto AutoFlow.

Templates (uso rápido)

- Acesse a biblioteca de templates no Workflow Builder > Templates.
- Preview e aplicar: selecione, visualize e clique em "Aplicar" para carregar no canvas.
- Principais templates: Boas-vindas WhatsApp, Cobrança PIX, ERP Notifications, Onboarding Cliente, Inventory Management, LGPD Compliance.

Como criar/compartilhar templates

1. Criar workflow no canvas e salvar.
2. Exportar como template (`Export > Save as Template`) ou `Save as template` no toolbar.
3. Versionar templates e publicar no catálogo interno.

Setup essencial (resumo)

- Credenciais: adicionar tokens/keys no Dashboard > Integrações.
- Webhooks: configurar URL pública e verify token/secret.
- IA: configurar `OPENAI_API_KEY` no backend (ver `apps/backend/.env`). O backend inclui dependência `openai` (v5.x) — as chamadas e exemplos de function-calling esperam a API/SDK compatível com essa versão.
- Testes: use endpoints `GET /api/.../health` e "Testar Conexão" no painel.

Ver detalhes

- Templates completos e exemplos: `docs/consolidated/templates-and-setup.md` (exemplos e links para cópias arquivadas em `docs/archive/workflow-templates-full.md`).
- Guia de integração passo-a-passo: `docs/consolidated/integrations-summary.md` (linka para cópias arquivadas em `docs/archive/`).
