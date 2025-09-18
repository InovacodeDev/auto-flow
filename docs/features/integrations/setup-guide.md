# Brazilian Integrations Setup Guide

## Overview

Este guia fornece instruções completas para configurar todas as integrações brasileiras disponíveis no AutoFlow. Cada integração foi desenvolvida especificamente para atender às necessidades das PMEs brasileiras.

## 📱 WhatsApp Business API

### Documentação Completa

📖 [WhatsApp Business Integration](./whatsapp-business.md)

### Quick Setup

1. **Criar conta Business no Meta Developers**
2. **Obter credenciais**: Access Token + Phone Number ID
3. **Configurar webhook**: URL + Verify Token
4. **Testar conexão** no AutoFlow

**Tempo estimado**: 30-60 minutos  
**Dificuldade**: Média  
**Custo**: Gratuito até 1000 mensagens/mês

---

## 💰 PIX Integration (Mercado Pago)

### Documentação Completa

📖 [PIX Mercado Pago Integration](./pix-mercado-pago.md)

### Quick Setup

1. **Criar conta vendedor Mercado Pago**
2. **Criar aplicação no Developer Portal**
3. **Configurar chave PIX**
4. **Obter Access Token**
5. **Configurar webhook de pagamentos**

**Tempo estimado**: 45-90 minutos  
**Dificuldade**: Média  
**Custo**: Taxa por transação (PIX gratuito PF)

---

## 🏢 ERP Integrations

### Documentação Completa

📖 [ERP Integrations Guide](./erp-integrations.md)

### Omie ERP

**Quick Setup**:

1. **Acessar configurações API no Omie**
2. **Gerar App Key + App Secret**
3. **Configurar permissões**
4. **Testar no AutoFlow**

**Tempo estimado**: 15-30 minutos  
**Dificuldade**: Fácil  
**Custo**: Incluído nos planos Omie

### Bling ERP

**Quick Setup**:

1. **Gerar token API no Bling**
2. **Configurar permissões necessárias**
3. **Testar conexão**

**Tempo estimado**: 10-20 minutos  
**Dificuldade**: Fácil  
**Custo**: Incluído nos planos Bling

---

## 🔧 Configuração no AutoFlow

### 1. Acessar Integrações

- Entre no AutoFlow Dashboard
- Navegue para **Integrações** no menu lateral
- Ou acesse diretamente: `https://autoflow.com/integrations`

### 2. Configurar Credenciais

Para cada integração:

#### WhatsApp Business

```
Access Token: EAAxxxxxxxxxxxxxx
Phone Number ID: 123456789012345
Webhook Verify Token: sua_token_verificacao
```

#### PIX Mercado Pago

```
Access Token: APP_USR-xxxxxxxxx
User ID: 123456789
```

#### Omie ERP

```
App Key: 1234567890123
App Secret: abc123def456ghi789
```

#### Bling ERP

```
API Key: abc123def456ghi789jkl012
```

### 3. Testar Conexões

- Clique em **"Testar Conexão"** para cada integração
- Aguarde confirmação de sucesso
- Verifique status na lista de integrações

---

## 🚀 Workflows Recomendados

### Starter Pack - Workflows Essenciais

#### 1. Boas-vindas WhatsApp

```json
{
    "name": "Boas-vindas Automáticas",
    "trigger": "new_customer",
    "actions": ["create_contact_erp", "send_welcome_whatsapp"]
}
```

#### 2. Cobrança PIX

```json
{
    "name": "Cobrança Automática PIX",
    "trigger": "order_created",
    "actions": ["create_pix_payment", "send_payment_link_whatsapp"]
}
```

#### 3. Confirmação de Pagamento

```json
{
    "name": "Confirmação PIX",
    "trigger": "payment_approved",
    "actions": ["update_order_erp", "send_confirmation_whatsapp"]
}
```

### Templates Prontos

Acesse nossa biblioteca de templates:

- **E-commerce básico**: Pedido → Pagamento → Entrega
- **Serviços**: Lead → Proposta → Contrato
- **Cobrança**: Vencimento → Lembrete → PIX

---

## 📊 Monitoramento e Analytics

### Métricas Importantes

- **Taxa de entrega WhatsApp**: > 95%
- **Tempo de resposta PIX**: < 10 segundos
- **Sincronização ERP**: < 30 segundos
- **Taxa de erro**: < 1%

### Dashboard de Integrações

- Status em tempo real
- Logs de atividade
- Métricas de performance
- Alertas de problemas

---

## 🛠 Troubleshooting Rápido

### WhatsApp não envia mensagens

1. ✅ Verificar token válido
2. ✅ Phone Number aprovado
3. ✅ Template aprovado pela Meta
4. ✅ Cliente dentro da janela de 24h

### PIX não gera QR Code

1. ✅ Chave PIX ativa
2. ✅ Access Token válido
3. ✅ Valor mínimo R$ 0,01
4. ✅ Conta Mercado Pago liberada

### ERP não sincroniza

1. ✅ Credenciais corretas
2. ✅ Permissões API habilitadas
3. ✅ Rate limits respeitados
4. ✅ Campos obrigatórios preenchidos

---

## 📞 Suporte Técnico

### Documentação

- 📖 [WhatsApp Business](./whatsapp-business.md)
- 📖 [PIX Mercado Pago](./pix-mercado-pago.md)
- 📖 [ERP Integrations](./erp-integrations.md)

### Contato

- **Email**: suporte@autoflow.com.br
- **WhatsApp**: +55 11 99999-9999
- **Chat**: Disponível no dashboard
- **Horário**: Segunda a Sexta, 9h às 18h

### Status das APIs

- [WhatsApp Status](https://developers.facebook.com/status)
- [Mercado Pago Status](https://status.mercadopago.com)
- [Omie Status](https://status.omie.com.br)
- [Bling Status](https://status.bling.com.br)

---

## 🔄 Próximas Integrações

### Em Desenvolvimento

- **RD Station**: CRM e Marketing
- **Pipedrive**: Pipeline de vendas
- **VTEX**: E-commerce
- **ContaAzul**: ERP

### Roadmap 2024

- **PagSeguro PIX**: Alternativa ao Mercado Pago
- **Tiny ERP**: Gestão empresarial
- **Shopify**: E-commerce internacional
- **HubSpot**: CRM avançado

---

**💡 Dica Final**: Comece com WhatsApp + PIX para automação básica de vendas. Depois adicione ERP para gestão completa. Em 1 semana você terá um sistema completo funcionando!
