# PIX Integration - AutoFlow

## Visão Geral

O módulo PIX do AutoFlow oferece integração completa com o sistema de pagamentos instantâneos brasileiro via Mercado Pago, permitindo automação total de cobranças, recebimentos e conciliação financeira para PMEs.

## Funcionalidades Core

### 1. Cobrança PIX Instantânea

- **Criação de QR Codes**: Geração automática de QR codes PIX para pagamentos
- **Links de Pagamento**: URLs diretas para facilitar o pagamento
- **Validação de Documentos**: Validação automática de CPF/CNPJ brasileiros
- **Expiração Configurável**: Definição de prazo para expiração do PIX
- **Formatação de Valores**: Exibição em reais (R$) formatado

### 2. Processamento de Webhooks

- **Notificações em Tempo Real**: Recebimento instantâneo de confirmações de pagamento
- **Conciliação Automática**: Identificação e processamento de pagamentos aprovados
- **Disparos de Workflow**: Ativação automática de processos após confirmação de pagamento
- **Integração WhatsApp**: Envio automático de confirmações via WhatsApp

### 3. Pagamentos Recorrentes

- **Frequências Múltiplas**: Suporte a pagamentos mensais, semanais e diários
- **Gestão de Ciclos**: Controle automático de datas de vencimento
- **Limites Flexíveis**: Definição de valores máximos por cobrança
- **Aprovação Prévia**: Sistema de pre-approval para débitos automáticos

### 4. Consulta e Monitoramento

- **Status em Tempo Real**: Consulta instantânea do status de pagamentos
- **Histórico Completo**: Registro detalhado de todas as transações
- **Dashboard Analítico**: Métricas de conversão e performance
- **Alertas Inteligentes**: Notificações de pagamentos em atraso ou cancelados

## Implementação Técnica

### Serviço Principal: PIXService

```typescript
// Localização: /apps/backend/src/integrations/pix/PIXService.ts

// Funcionalidades principais:
- createPIXPayment(): Criar cobrança PIX
- getPaymentStatus(): Consultar status
- processWebhook(): Processar notificações
- createRecurringPayment(): Pagamentos recorrentes
- validateBrazilianDocument(): Validar CPF/CNPJ
- formatCurrency(): Formatação monetária brasileira
```

### API Routes: PIX Endpoints

```typescript
// Localização: /apps/backend/src/routes/pix.ts

// Endpoints disponíveis:
POST /api/pix/payment - Criar cobrança PIX
GET /api/pix/payment/:id - Consultar pagamento
POST /api/pix/webhook - Webhook Mercado Pago
POST /api/pix/recurring - Pagamento recorrente
GET /api/pix/health - Health check
```

### Integração com Mercado Pago

- **API v1.0**: Utilização da API oficial mais recente
- **Sandbox e Produção**: Suporte completo aos dois ambientes
- **Autenticação Segura**: Access tokens criptografados
- **Rate Limiting**: Controle de taxa de requisições
- **Idempotência**: Prevenção de cobranças duplicadas

## Casos de Uso PME

### 1. E-commerce Brasileiro

```javascript
// Exemplo: Loja online automatizada
const cobranca = await pixService.createPIXPayment({
    amount: 149.9,
    description: "Produto XYZ - Loja ABC",
    payerEmail: "cliente@email.com",
    payerDocument: "12345678901",
    externalReference: "PEDIDO_001",
});

// QR Code gerado automaticamente
// Link de pagamento pronto para envio
// Webhook processa confirmação em tempo real
```

### 2. Prestação de Serviços

```javascript
// Exemplo: Consultoria com pagamento recorrente
const recorrente = await pixService.createRecurringPayment({
    amount: 500.0,
    description: "Consultoria Mensal - Janeiro 2024",
    frequency: "monthly",
    startDate: new Date("2024-01-01"),
    payerEmail: "cliente@empresa.com",
});

// Débito automático mensal configurado
// Notificações automáticas via WhatsApp
```

### 3. Marketplace Local

```javascript
// Exemplo: Marketplace com múltiplos vendedores
async function processarVendaMarketplace(venda) {
    // 1. Criar cobrança PIX
    const pagamento = await pixService.createPIXPayment({
        amount: venda.valor,
        description: `${venda.produto} - ${venda.vendedor}`,
        externalReference: venda.id,
    });

    // 2. Enviar link via WhatsApp
    await whatsappService.sendTemplate({
        to: venda.comprador.telefone,
        template: "cobranca_pix",
        variables: {
            valor: pixService.formatCurrency(venda.valor),
            qrcode: pagamento.qrCode,
            link: pagamento.paymentLink,
        },
    });

    // 3. Webhook automatiza:
    // - Confirmação para comprador
    // - Notificação para vendedor
    // - Atualização de estoque
    // - Disparo de logística
}
```

## Fluxos de Automação

### Fluxo 1: Cobrança Simples

1. **Cliente solicita produto/serviço**
2. **Sistema gera cobrança PIX automaticamente**
3. **QR Code enviado via WhatsApp/Email**
4. **Cliente paga via PIX (instantâneo)**
5. **Webhook confirma pagamento em tempo real**
6. **Workflows automáticos disparados**:
    - Confirmação para cliente
    - Nota fiscal automática
    - Ativação de serviço/produto
    - Atualização CRM/ERP

### Fluxo 2: Cobrança Recorrente

1. **Cliente autoriza débito recorrente**
2. **Sistema agenda cobranças futuras**
3. **Cobrança automática na data definida**
4. **Notificação prévia via WhatsApp**
5. **Processamento automático do pagamento**
6. **Renovação automática de serviços**

### Fluxo 3: Gestão de Inadimplência

1. **Cobrança não paga no prazo**
2. **Sistema detecta automaticamente**
3. **Sequência de lembranças via WhatsApp**:
    - Dia do vencimento
    - 3 dias após vencimento
    - 7 dias após vencimento
4. **Ofertas de desconto automáticas**
5. **Renegociação facilitada**

## Configuração e Setup

### Variáveis de Ambiente

```env
# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-xxx
MERCADO_PAGO_PUBLIC_KEY=APP_USR-xxx
MERCADO_PAGO_WEBHOOK_SECRET=xxx

# URLs
BACKEND_URL=https://api.autoflow.com.br
FRONTEND_URL=https://app.autoflow.com.br
```

### Configuração de Webhook

1. **URL do Webhook**: `https://api.autoflow.com.br/api/pix/webhook`
2. **Eventos Monitorados**: `payment.created`, `payment.updated`
3. **Autenticação**: Via secret token
4. **Retry Policy**: Até 3 tentativas com backoff exponencial

## Benefícios para PMEs

### Financeiros

- **Recebimento Instantâneo**: Dinheiro na conta em segundos
- **Redução de Inadimplência**: Automação de cobranças
- **Eliminação de Taxas**: PIX sem taxas para recebimento
- **Fluxo de Caixa Previsível**: Recorrências automatizadas

### Operacionais

- **Conciliação Automática**: Sem trabalho manual
- **Integração Total**: CRM/ERP/WhatsApp conectados
- **Escalabilidade**: Processa milhares de transações
- **Compliance**: Validação automática de documentos

### Experiência do Cliente

- **Pagamento Instantâneo**: Sem demoras ou burocracias
- **Múltiplos Canais**: QR Code, link, WhatsApp
- **Confirmação Imediata**: Notificação instantânea
- **Histórico Transparente**: Acesso a todas as transações

## Próximos Desenvolvimentos

### Phase 1: Expansão PIX

- **PIX Parcelado**: Suporte a parcelamento PIX
- **PIX Agendado**: Agendamento de pagamentos futuros
- **PIX Saque**: Funcionalidades de saque e troco

### Phase 2: Integrações Avançadas

- **Bancos Diretos**: Integração direta com APIs bancárias
- **Open Banking**: Conectividade via Open Banking Brasil
- **PagBank**: Integração complementar com PagBank

### Phase 3: Analytics e IA

- **Previsão de Pagamentos**: ML para prever comportamento
- **Detecção de Fraude**: Algoritmos de segurança avançados
- **Otimização de Conversão**: A/B testing automático

## Vantagem Competitiva

O módulo PIX do AutoFlow representa um diferencial significativo no mercado brasileiro:

1. **PIX-First**: Desenvolvido especificamente para o mercado brasileiro
2. **Integração Nativa**: WhatsApp + PIX + IA em uma plataforma
3. **Automação Total**: Desde cobrança até conciliação
4. **PME-Focused**: Funcionalidades pensadas para pequenas e médias empresas
5. **Escalabilidade Inteligente**: Cresce junto com o negócio

Este módulo posiciona o AutoFlow como a solução definitiva para automação financeira de PMEs brasileiras, aproveitando as particularidades e oportunidades do mercado nacional.
