# WhatsApp Business API Integration

## Overview

A integração com WhatsApp Business API permite envio e recebimento de mensagens WhatsApp diretamente dos workflows do AutoFlow. Suporta mensagens de texto, templates e mídias.

## Configuração

### Pré-requisitos

1. **Conta WhatsApp Business**: Conta comercial aprovada
2. **Meta Developers Account**: Conta de desenvolvedor na Meta
3. **Aplicação Facebook**: App configurado com WhatsApp Business API
4. **Número de Telefone**: Número comercial verificado

### Variáveis de Ambiente

```bash
# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxx
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_WEBHOOK_VERIFY_TOKEN=sua_token_verificacao
```

### Setup Detalhado

#### 1. Criar Aplicação Facebook

1. Acesse [developers.facebook.com](https://developers.facebook.com)
2. Crie nova aplicação → "Business"
3. Adicione produto "WhatsApp Business API"

#### 2. Configurar Número de Telefone

1. No painel da aplicação, vá para WhatsApp → Getting Started
2. Adicione número de telefone comercial
3. Verifique o número via SMS/chamada
4. Copie o Phone Number ID

#### 3. Gerar Token de Acesso

1. Em WhatsApp → Getting Started
2. Gere um token temporário (24h) ou configure token permanente
3. Para token permanente:
    - Crie System User em Business Manager
    - Atribua permissões necessárias
    - Gere token permanente

#### 4. Configurar Webhook

1. Em WhatsApp → Configuration
2. Configure webhook URL: `https://seu-dominio.com/api/integrations/whatsapp/webhook`
3. Defina Verify Token: mesmo valor da variável `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
4. Inscreva-se nos eventos: `messages`

## Funcionalidades

### Ações Disponíveis

#### Send Text Message

```typescript
{
  type: "send_text_message",
  payload: {
    to: "+5511999999999",
    message: "Olá! Como posso ajudar?"
  }
}
```

#### Send Template Message

```typescript
{
  type: "send_template_message",
  payload: {
    to: "+5511999999999",
    templateName: "welcome_message",
    parameters: ["João", "AutoFlow"]
  }
}
```

#### Send Media Message

```typescript
{
  type: "send_media_message",
  payload: {
    to: "+5511999999999",
    type: "image",
    mediaUrl: "https://example.com/image.jpg",
    caption: "Imagem anexada"
  }
}
```

### Templates WhatsApp

Templates devem ser aprovados pela Meta antes do uso:

#### Template de Boas-vindas

```
Nome: welcome_message
Categoria: MARKETING
Idioma: pt_BR

Conteúdo:
Olá {{1}}! 👋

Bem-vindo(a) ao {{2}}! Estamos aqui para ajudar você.

Se precisar de algo, é só chamar!
```

#### Template de Cobrança

```
Nome: payment_reminder
Categoria: ACCOUNT_UPDATE
Idioma: pt_BR

Conteúdo:
Olá {{1}}!

Seu pagamento de R$ {{2}} está em aberto.
Vencimento: {{3}}

Para quitar: {{4}}
```

## Uso nos Workflows

### Trigger: Mensagem Recebida

```json
{
    "type": "webhook",
    "config": {
        "webhook_url": "/api/integrations/whatsapp/webhook",
        "events": ["message_received"]
    }
}
```

### Action: Resposta Automática

```json
{
    "type": "send_message",
    "config": {
        "integration": "whatsapp_business",
        "action": "send_text_message"
    },
    "data": {
        "to": "{{trigger.message.from}}",
        "message": "Obrigado pela mensagem! Em breve responderemos."
    }
}
```

### Exemplo de Workflow Completo

```json
{
    "name": "Atendimento Automático WhatsApp",
    "triggers": [
        {
            "type": "webhook",
            "config": {
                "source": "whatsapp",
                "event": "message_received"
            }
        }
    ],
    "actions": [
        {
            "type": "conditional",
            "condition": "trigger.message.body.includes('oi') || trigger.message.body.includes('olá')",
            "true_actions": [
                {
                    "type": "send_message",
                    "config": {
                        "integration": "whatsapp_business",
                        "action": "send_template_message"
                    },
                    "data": {
                        "to": "{{trigger.message.from}}",
                        "templateName": "welcome_message",
                        "parameters": ["Cliente", "AutoFlow"]
                    }
                }
            ],
            "false_actions": [
                {
                    "type": "send_message",
                    "config": {
                        "integration": "whatsapp_business",
                        "action": "send_text_message"
                    },
                    "data": {
                        "to": "{{trigger.message.from}}",
                        "message": "Desculpe, não entendi. Digite 'oi' para começar."
                    }
                }
            ]
        }
    ]
}
```

## Troubleshooting

### Erro: Token Inválido

- **Sintoma**: 401 Unauthorized
- **Solução**: Verificar se token não expirou, gerar novo token permanente

### Erro: Phone Number não encontrado

- **Sintoma**: Phone number not found
- **Solução**: Verificar se Phone Number ID está correto e número foi verificado

### Erro: Template não aprovado

- **Sintoma**: Template status is not approved
- **Solução**: Aguardar aprovação da Meta ou usar template já aprovado

### Erro: Webhook não recebe mensagens

- **Sintoma**: Webhook não é chamado quando mensagens são recebidas
- **Verificações**:
    1. URL do webhook está acessível publicamente
    2. Verify token confere com configuração
    3. Webhook está inscrito no evento "messages"
    4. Certificado SSL válido

### Limite de Rate Limiting

- **Sintoma**: Rate limit exceeded
- **Solução**: Implementar retry com backoff exponencial

## Limitações

- **Templates**: Precisam aprovação da Meta (24-48h)
- **Rate Limits**: 1000 mensagens/minuto por número
- **Mensagens promocionais**: Apenas com templates aprovados
- **Janela de 24h**: Mensagens de atendimento só dentro de 24h após último contato do cliente
- **Mídias**: Tamanho máximo 64MB por arquivo

## Links Úteis

- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp)
- [Template Guidelines](https://developers.facebook.com/docs/whatsapp/message-templates/guidelines)
- [Rate Limits](https://developers.facebook.com/docs/whatsapp/overview/rate-limits)
- [Webhook Setup](https://developers.facebook.com/docs/whatsapp/webhooks)
