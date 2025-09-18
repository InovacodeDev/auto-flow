# PIX Integration - Mercado Pago

## Overview

A integração PIX com Mercado Pago permite processar pagamentos instantâneos diretamente dos workflows do AutoFlow. Suporta geração de QR Code, cobrança e confirmação automática de pagamentos.

## Configuração

### Pré-requisitos

1. **Conta Mercado Pago**: Conta vendedor ativa
2. **Aplicação**: App criado no painel de desenvolvedores
3. **Chave PIX**: Chave PIX cadastrada na conta

### Variáveis de Ambiente

```bash
# PIX - Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-xxxxxxxx
MERCADO_PAGO_USER_ID=123456789
MERCADO_PAGO_WEBHOOK_SECRET=sua_webhook_secret
```

### Setup Detalhado

#### 1. Criar Aplicação Mercado Pago

1. Acesse [developers.mercadopago.com](https://developers.mercadopago.com)
2. Faça login com sua conta Mercado Pago
3. Vá para "Suas aplicações" → "Criar aplicação"
4. Preencha dados da aplicação
5. Configure URLs de redirect e webhook

#### 2. Obter Credenciais

1. Na aplicação criada, acesse "Credenciais"
2. Copie o Access Token (modo Produção)
3. Anote o User ID da conta
4. Configure webhook secret para segurança

#### 3. Configurar Webhook

1. Em "Webhooks" na aplicação
2. Configure URL: `https://seu-dominio.com/api/integrations/pix/webhook`
3. Selecione eventos: `payments`
4. Defina webhook secret

#### 4. Ativar PIX

1. No app Mercado Pago, vá para "Perfil" → "Dados da empresa"
2. Configure chave PIX (CPF, CNPJ, email ou telefone)
3. Aguarde aprovação (até 24h)

## Funcionalidades

### Ações Disponíveis

#### Create PIX Payment

```typescript
{
  type: "create_pix_payment",
  payload: {
    amount: 100.50,
    description: "Pagamento da compra #123",
    externalReference: "order-123"
  }
}
```

**Response:**

```json
{
    "success": true,
    "data": {
        "paymentId": "12345678901",
        "status": "pending",
        "qrCode": "00020126580014br.gov.bcb.pix...",
        "qrCodeBase64": "iVBORw0KGgoAAAANSUhEUgAA...",
        "ticketUrl": "https://mercadopago.com/mlb/payments/ticket/..."
    }
}
```

#### Check Payment Status

```typescript
{
  type: "check_payment_status",
  payload: {
    paymentId: "12345678901"
  }
}
```

**Response:**

```json
{
    "success": true,
    "data": {
        "paymentId": "12345678901",
        "status": "approved",
        "statusDetail": "accredited",
        "amount": 100.5,
        "dateCreated": "2024-01-15T10:30:00Z",
        "dateApproved": "2024-01-15T10:32:15Z"
    }
}
```

#### Refund Payment

```typescript
{
  type: "refund_payment",
  payload: {
    paymentId: "12345678901"
  }
}
```

### Status de Pagamentos

| Status       | Descrição                  |
| ------------ | -------------------------- |
| `pending`    | Aguardando pagamento       |
| `approved`   | Pagamento aprovado         |
| `in_process` | Pagamento sendo processado |
| `rejected`   | Pagamento rejeitado        |
| `cancelled`  | Pagamento cancelado        |
| `refunded`   | Pagamento estornado        |

## Uso nos Workflows

### Trigger: Criar Cobrança PIX

```json
{
    "name": "Gerar Cobrança PIX",
    "triggers": [
        {
            "type": "webhook",
            "config": {
                "source": "ecommerce",
                "event": "order_created"
            }
        }
    ],
    "actions": [
        {
            "type": "create_payment",
            "config": {
                "integration": "pix_mercado_pago",
                "action": "create_pix_payment"
            },
            "data": {
                "amount": "{{trigger.order.total}}",
                "description": "Pedido #{{trigger.order.id}}",
                "externalReference": "{{trigger.order.id}}"
            }
        },
        {
            "type": "send_message",
            "config": {
                "integration": "whatsapp_business",
                "action": "send_text_message"
            },
            "data": {
                "to": "{{trigger.order.customer.phone}}",
                "message": "🏦 *PIX Gerado!*\n\nValor: R$ {{trigger.order.total}}\nCódigo PIX: {{previous.data.qrCode}}\n\nPague pelo app do seu banco!"
            }
        }
    ]
}
```

### Trigger: Pagamento Confirmado

```json
{
    "name": "Confirmar Pagamento PIX",
    "triggers": [
        {
            "type": "webhook",
            "config": {
                "source": "pix_mercado_pago",
                "event": "payment_approved"
            }
        }
    ],
    "actions": [
        {
            "type": "update_order",
            "config": {
                "integration": "erp",
                "action": "update_order_status"
            },
            "data": {
                "orderId": "{{trigger.payment.externalReference}}",
                "status": "paid",
                "paymentMethod": "pix",
                "paymentId": "{{trigger.payment.id}}"
            }
        },
        {
            "type": "send_message",
            "config": {
                "integration": "whatsapp_business",
                "action": "send_template_message"
            },
            "data": {
                "to": "{{trigger.payment.customer.phone}}",
                "templateName": "payment_confirmed",
                "parameters": ["{{trigger.payment.externalReference}}", "{{trigger.payment.amount}}"]
            }
        }
    ]
}
```

### Cobrança com Lembrete

```json
{
    "name": "Cobrança com Lembrete",
    "triggers": [
        {
            "type": "schedule",
            "config": {
                "cron": "0 9 * * *"
            }
        }
    ],
    "actions": [
        {
            "type": "check_pending_orders",
            "config": {
                "integration": "erp",
                "filter": "status=pending AND created_at < 1day"
            }
        },
        {
            "type": "loop",
            "items": "{{previous.data.orders}}",
            "actions": [
                {
                    "type": "create_payment",
                    "config": {
                        "integration": "pix_mercado_pago",
                        "action": "create_pix_payment"
                    },
                    "data": {
                        "amount": "{{item.total}}",
                        "description": "Lembrete - Pedido #{{item.id}}",
                        "externalReference": "reminder-{{item.id}}"
                    }
                },
                {
                    "type": "send_message",
                    "config": {
                        "integration": "whatsapp_business",
                        "action": "send_text_message"
                    },
                    "data": {
                        "to": "{{item.customer.phone}}",
                        "message": "🔔 *Lembrete de Pagamento*\n\nPedido: #{{item.id}}\nValor: R$ {{item.total}}\n\nPague agora pelo PIX: {{previous.data.qrCode}}"
                    }
                }
            ]
        }
    ]
}
```

## Webhook Events

O Mercado Pago enviará notificações para os seguintes eventos:

### Payment Created

```json
{
    "id": 12345,
    "live_mode": true,
    "type": "payment",
    "date_created": "2024-01-15T10:30:00Z",
    "application_id": 123456789,
    "user_id": 987654321,
    "version": 1,
    "api_version": "v1",
    "action": "payment.created",
    "data": {
        "id": "12345678901"
    }
}
```

### Payment Updated

```json
{
    "id": 12346,
    "live_mode": true,
    "type": "payment",
    "date_created": "2024-01-15T10:32:15Z",
    "application_id": 123456789,
    "user_id": 987654321,
    "version": 1,
    "api_version": "v1",
    "action": "payment.updated",
    "data": {
        "id": "12345678901"
    }
}
```

## Troubleshooting

### Erro: Access Token Inválido

- **Sintoma**: 401 Unauthorized
- **Solução**: Verificar se access token está correto e não expirou

### Erro: PIX não habilitado

- **Sintoma**: PIX payment method not available
- **Solução**: Verificar se chave PIX foi aprovada na conta Mercado Pago

### Webhook não recebe notificações

- **Sintoma**: Pagamentos não são processados automaticamente
- **Verificações**:
    1. URL webhook está acessível
    2. Webhook está configurado para eventos "payments"
    3. SSL válido
    4. Resposta HTTP 200 no endpoint

### QR Code não é gerado

- **Sintoma**: qrCode vem vazio na resposta
- **Verificações**:
    1. Valor mínimo R$ 0,01
    2. Chave PIX válida e ativa
    3. Conta Mercado Pago em boas condições

### Pagamento não é aprovado

- **Possíveis causas**:
    - Chave PIX incorreta
    - Problemas no banco do pagador
    - Valor incorreto
    - Conta bloqueada

## Limitações

- **Valor mínimo**: R$ 0,01
- **Valor máximo**: R$ 1.000.000,00 (dependendo da conta)
- **Disponibilidade**: 24h por dia, todos os dias
- **Tempo de processamento**: Até 10 segundos
- **Validade do QR Code**: 24 horas por padrão
- **Rate Limits**: 500 requests/minuto por access token

## Custos

- **PIX recebimento**: Gratuito para pessoas físicas
- **PIX empresarial**: Taxa por transação (consultar Mercado Pago)
- **Estornos**: Gratuitos
- **API calls**: Gratuitas

## Links Úteis

- [Mercado Pago Developers](https://developers.mercadopago.com)
- [PIX Documentation](https://developers.mercadopago.com/docs/payments/pix)
- [Webhook Guide](https://developers.mercadopago.com/docs/webhooks)
- [Testing Cards](https://developers.mercadopago.com/docs/testing)
