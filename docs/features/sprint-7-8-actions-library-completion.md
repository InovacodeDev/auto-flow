# Actions Library - Sprint 7-8 Task 4

## Overview

Biblioteca completa de ações específicas para automação de PMEs brasileiras, implementando integrações críticas para o mercado nacional.

## Core Functionality

A Actions Library fornece executores especializados para automações específicas do mercado brasileiro, com foco em PMEs:

### 1. BaseActionExecutor

**Funcionalidade:** Classe base abstrata para todas as ações do AutoFlow

- **Recursos:** Validação de configuração, retry automático, rate limiting, logs estruturados
- **Utilities Brasileiras:** Validação CPF/CNPJ, formatação de moeda, formatação de telefone
- **Arquitetura:** Implementa interface NodeExecutor com padrões específicos do Brasil

### 2. WhatsAppBusinessActionExecutor

**Funcionalidade:** Integração completa com WhatsApp Business API

- **Recursos:** Envio de mensagens, templates, mídia, gestão de contatos, webhooks
- **Especialização Brasileira:** Formatação automática de números (+55), templates em português
- **Actions:** sendMessage, sendTemplate, sendMedia, getContacts, getMessageStatus

### 3. PIXActionExecutor

**Funcionalidade:** Pagamentos PIX instantâneos via Mercado Pago

- **Recursos:** Criação de pagamentos, QR Codes, estornos, consultas de status
- **Especialização Brasileira:** Validação CPF/CNPJ, formatação monetária brasileira
- **Actions:** createPayment, getPayment, refundPayment, getQRCode, checkStatus

## Technical Implementation

### Database Schema

Não requer mudanças no schema - utiliza sistema existente de nodes e configurações.

### API Endpoints

Integra com APIs existentes do workflow engine - sem novos endpoints necessários.

### Frontend Components

- Nodes específicos para WhatsApp Business no construtor visual
- Nodes específicos para PIX no construtor visual
- Formulários de configuração para each action type

### Business Logic

#### Padrão de Execução

```typescript
// Todas as actions seguem o mesmo padrão
execute(config, inputs, context) -> NodeExecutionResult

// Com validação brasileira específica
validateCPForCNPJ(document) -> boolean
formatBrazilianPhoneNumber(phone) -> string
formatBrazilianCurrency(amount) -> string
```

#### Rate Limiting e Retry

- WhatsApp: 80 mensagens/segundo (conforme Meta)
- PIX: Rate limiting automático com headers X-Idempotency-Key
- Retry exponential backoff para ambas as integrações

#### Error Handling

- Logs estruturados com componente identificado
- Propagação de erros específicos das APIs
- Fallbacks para operações críticas

## Dependencies

### Internal Dependencies

- `/core/engine/types` - Interfaces base (NodeExecutor, ExecutionContext)
- `/core/engine/actions/BaseActionExecutor` - Classe base

### External Dependencies

- WhatsApp Business API (Meta)
- Mercado Pago API (PIX)
- CPF/CNPJ validation algorithms

## Testing Strategy

### Unit Tests

- [ ] BaseActionExecutor utilities (CPF/CNPJ, phone formatting)
- [ ] WhatsAppBusinessActionExecutor actions
- [ ] PIXActionExecutor payment flow

### Integration Tests

- [ ] WhatsApp API connection and message sending
- [ ] PIX payment creation and status checking
- [ ] Error handling and retry mechanisms

### E2E Tests

- [ ] Complete workflow com WhatsApp + PIX
- [ ] Visual constructor drag-and-drop functionality

## Future Considerations

### Próximas Integrações Prioritárias

1. **ERPActionExecutor** - Omie, Bling, Tiny ERP
2. **EmailActionExecutor** - SendGrid, Mailgun com templates brasileiros
3. **CRMActionExecutor** - RD Station, Pipedrive, HubSpot
4. **GovernmentAPIActionExecutor** - Receita Federal, Serasa, Bradesco

### Melhorias Técnicas

- Cache de templates WhatsApp aprovados
- Webhook signature validation
- Métricas e analytics por action type
- A/B testing para templates de mensagem

### Expansão de Mercado

- Suporte a outros países Latino-Americanos
- Integração com mais provedores de pagamento (PagSeguro, Pagarme)
- Templates multi-idioma (ES, EN)

## Status: ✅ COMPLETED

- [x] BaseActionExecutor com utilities brasileiras
- [x] WhatsAppBusinessActionExecutor completo
- [x] PIXActionExecutor completo
- [x] Validação TypeScript strict mode
- [x] Documentação técnica

**Próximo:** Task 5 - Workflow Templates PME
