# Integrações Brasileiras — Resumo consolidado

Objetivo: documento curto e acionável que reúne as integrações principais (WhatsApp, PIX, ERPs, CRMs) com passos de setup, endpoints e cuidados comuns.

Principais integrações

- WhatsApp Business API (Meta): mensagens, templates, webhooks. Para detalhes veja a cópia arquivada: `docs/archive/whatsapp-business-full.md`.
- PIX (Mercado Pago): geração de QR, webhooks de pagamento, conciliação automática.
- ERPs: Omie e Bling com sincronização de clientes, produtos, pedidos e notas fiscais.
- CRMs: RD Station, Pipedrive, HubSpot — leads, deals, webhooks.

Quick setup (passos comuns)

1. Gerar credenciais (API key / token) na plataforma do provedor.
2. Adicionar credenciais em Integrações no AutoFlow (Dashboard > Integrações).
3. Configurar webhooks apontando para `/api/.../webhook` e validar verify token/secret.
4. Testar conexão com "Testar Conexão" no painel.

Boas práticas

- Criptografar segredos em produção (secrets manager).
- Implementar retries e idempotência para chamadas externas.
- Registrar logs estruturados (traceId, organizationId, userId).

Problemas comuns e soluções rápidas

- Token inválido: verificar credenciais e escopo.
- Webhook não chamado: verificar URL pública, SSL e verify token.
- Rate limit: aplicar backoff exponencial e batches.

Links rápidos

- WhatsApp: `docs/archive/whatsapp-business-full.md`
- PIX Mercado Pago: `docs/archive/pix-mercado-pago-full.md`
- ERPs: `docs/archive/erp-integrations-full.md`

Use este arquivo como índice consolidado de integrações antes de abrir as páginas específicas para cada provedor.

Note: the full provider-specific documentation has been archived under `docs/archive/` and the active pages in `docs/features/` have been consolidated to point here. Formatting and link checks were run after consolidation; if you encounter workspace lint errors when running `pnpm -w lint` refer to the developer note in `docs/consolidated/system-overview.md` about ESLint v9.
