# IA Conversacional — Guia consolidado

Resumo objetivo da funcionalidade IA do AutoFlow. Mantém os pontos essenciais para uso, configuração, custos e melhores práticas.

O que faz

- Permite criar, otimizar e depurar workflows via linguagem natural em Português (pt-BR).
- Gera estruturas de workflow (triggers, actions, conditions) com confidence score e opções de clarificação.

Configuração

- Requer chave OpenAI (OPENAI_API_KEY) no backend.
- Recomenda-se limitar contexto e aplicar rate-limits por organização para controlar custos.

Implementation note: the backend depends on the `openai` SDK (v5.x) and may use function-calling patterns compatible with that version. Monitor token usage and enforce per-organization quotas to avoid unexpected costs.

Fluxo de interação

1. Usuário descreve objetivo no chat.
2. AIProcess (OpenAI) retorna proposta em JSON (function-calling) com confidence e perguntas de clarificação (se necessário).
3. Usuário aceita/ajusta; workflow é instanciado no canvas.

Boas práticas

- Forneça contexto (indústria, integrações disponíveis) para melhores resultados.
- Limite tokens no prompt e preserve histórico mínimo necessário.
- Exponha explicações e alternativas para o usuário revisar antes de criar o workflow.

Controle de custo

- Estimar tokens por interação; habilitar rate-limits e cotas por org.
- Retornar apenas o delta necessário (JSON) em vez de longas explicações para reduzir tokens.

Testes e validação

- Incluir testes de prompt (prompt tests) e mocks do OpenAI para CI.

Onde aprofundar

- Implementação técnica: `apps/backend/src/ai/*`
- Documentos completos: `docs/features/ai-conversational*.md`
