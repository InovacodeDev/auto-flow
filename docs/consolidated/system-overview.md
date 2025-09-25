# AutoFlow — Visão geral consolidada

Resumo objetivo da plataforma AutoFlow, seus pilares, arquitetura e stacks principais. Esta versão consolidada agrupa conteúdo distributido em vários arquivos de arquitetura e backlog.

O que é

- SaaS de automação para PMEs brasileiras com foco em IA conversacional e constructor visual (no-code).
- Principais capacidades: Engine de workflows, IA para geração/ajuste de automações, integrações locais (WhatsApp, PIX, ERPs, CRMs) e analytics de ROI.

Pilares

- Simplicidade para PMEs: templates e IA para reduzir barreira técnica.
- Multi-tenant: isolamento total entre organizações.
- Extensibilidade: plugins de integração e templates versionáveis.

Arquitetura (resumo)

- Frontend: React 19 + TypeScript, TanStack Router, Tailwind + Material Expressive, ReactFlow para canvas.
- Backend: Node.js + TypeScript, Fastify, Drizzle ORM, PostgreSQL, Redis (fila/locks), Workers para execução.
- IA: integração com OpenAI GPT (chat + function-calling) para geração/otimização de workflows.

Fluxo de dados (alto nível)

1. Usuário cria/edita workflow no canvas (frontend).
2. Workflow salvo em PostgreSQL (Drizzle).
3. Gatilhos (webhook/schedule/whatsapp) enfileiram execuções (Redis/Bull/BullMQ).
4. Workers processam ações (integrações externas) e registram execução/logs.
5. Analytics agregam métricas de ROI e performance.

Principais decisões técnicas

- TypeScript em todo o stack (strict mode).
- pnpm + Turborepo para monorepo.
- JWT com refresh + RBAC para autenticação e autorização.

Developer tooling notes

- Node / pnpm: the repository root declares Node >=22 and `pnpm@10` as the package manager (see `package.json` -> `packageManager`). Use pnpm@10+ for workspace scripts and installs.
- Lint: the workspace currently depends on ESLint ^9.x. ESLint v9 uses the new flat config lookup and will warn or fail if a top-level `eslint.config.*` is not present. If you run `pnpm -w lint` you may need to add a minimal `eslint.config.cjs` at the repo root or adapt per-package lint commands to avoid the workspace lint error.

Onde ler mais

- Integrações detalhadas: `docs/consolidated/integrations-summary.md` (links para cópias arquivadas por provedor em `docs/archive/`).
- Engine, execução e templates: `docs/consolidated/workflow-engine-summary.md` (documentação técnica completa arquivada em `docs/archive/`).

Status: documento condensado — use como referência rápida antes de abrir os detalhes específicos.
