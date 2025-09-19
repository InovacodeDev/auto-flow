# Dashboard Unificado de Integrações

## Overview

O Dashboard Unificado centraliza o monitoramento e gerenciamento de todas as integrações brasileiras do AutoFlow, proporcionando uma visão consolidada do ecossistema de automação.

## Funcionalidades Principais

### 1. **Monitoramento em Tempo Real**

- Status de conectividade de todas as integrações
- Métricas de performance consolidadas
- Alertas automáticos para falhas e problemas
- Histórico detalhado de operações

### 2. **Integrações Suportadas**

#### WhatsApp Business API

- **Meta Business API**: Mensagens, templates, webhooks
- **Métricas**: Taxa de entrega, mensagens enviadas, respostas recebidas
- **Status**: Conectado, token válido, webhook funcionando

#### PIX (Pagamentos)

- **Mercado Pago**: Transações PIX, QR codes, webhooks
- **PagBank**: Cobrança PIX, conciliação automática
- **Métricas**: Volume transacional, taxa de conversão, valor médio

#### CRM

- **RD Station**: Leads, oportunidades, campanhas
- **Pipedrive**: Pipeline de vendas, atividades, negócios
- **HubSpot**: Contatos, deals, marketing automation
- **Métricas**: Leads convertidos, vendas fechadas, ROI

#### ERP

- **Omie**: Produtos, clientes, notas fiscais, financeiro
- **ContaAzul**: Gestão financeira, conciliação bancária
- **Bling**: E-commerce, estoque, pedidos
- **Métricas**: Faturamento, produtos cadastrados, clientes ativos

### 3. **Métricas Consolidadas**

#### KPIs Principais

- **Total de Integrações**: 9 plataformas disponíveis
- **Integrações Ativas**: Status conectado e funcionando
- **Operações Mensais**: Volume total de transações/operações
- **Taxa de Sucesso**: Percentual de operações bem-sucedidas
- **Receita Estimada**: Valor gerado pelas automações

#### Métricas por Integração

- **Volume de Operações**: Contagem mensal por plataforma
- **Performance**: Tempo de resposta e disponibilidade
- **Erros**: Falhas, reconexões, problemas de API
- **Uso**: Frequência e padrões de utilização

### 4. **Sistema de Alertas**

#### Tipos de Alerta

- 🔴 **Erro**: Integração desconectada ou falhando
- 🟡 **Aviso**: Configuração pendente ou performance degradada
- 🟢 **Info**: Sincronização concluída ou nova funcionalidade

#### Notifications

- Dashboard em tempo real
- Logs detalhados de cada operação
- Histórico de problemas e resoluções

## Interface do Dashboard

### 1. **Visão Geral (Overview)**

```
┌─ Cards de Métricas ─────────────────────────────────┐
│ Total: 9   Ativas: 6   Operações: 2.8k   Sucesso: 96.8% │
└─────────────────────────────────────────────────────┘

┌─ Status das Integrações ───────────────────────────┐
│ ✅ WhatsApp Meta        📱 1.2k ops    98.5%      │
│ ✅ PIX Mercado Pago     💳 340 ops     99.2%      │
│ ❌ PIX PagBank          💳 0 ops       -          │
│ ✅ RD Station           👥 520 ops     97.8%      │
│ ⚠️  Pipedrive           👥 180 ops     85.2%      │
│ ✅ HubSpot              👥 690 ops     96.5%      │
│ ✅ Omie ERP             📊 420 ops     94.8%      │
│ 🔄 ContaAzul            📊 0 ops       -          │
│ ❌ Bling                📊 0 ops       -          │
└─────────────────────────────────────────────────────┘
```

### 2. **Abas por Categoria**

#### WhatsApp

- Configuração da API Meta Business
- Status do webhook e token
- Mensagens enviadas/recebidas
- Templates aprovados/rejeitados
- Logs de entrega e falhas

#### PIX

- Configuração Mercado Pago/PagBank
- Transações processadas
- QR codes gerados
- Conciliação bancária
- Webhooks de pagamento

#### CRM

- Status das APIs (RD Station, Pipedrive, HubSpot)
- Leads sincronizados
- Oportunidades criadas
- Campanhas ativas
- ROI por plataforma

#### ERP

- Configuração Omie/ContaAzul/Bling
- Produtos sincronizados
- Clientes cadastrados
- Notas fiscais emitidas
- Movimentação financeira

### 3. **Configuração e Gerenciamento**

#### Para cada integração:

- **Configurar**: Credenciais, URLs, tokens
- **Testar Conexão**: Verificação de conectividade
- **Ver Logs**: Histórico detalhado de operações
- **Sincronizar**: Forçar sincronização manual
- **Desconectar**: Remover integração

## APIs do Dashboard Unificado

### Base URL

```
/api/integrations-unified
```

### Endpoints Principais

#### 1. Status de Saúde

```http
GET /health
```

Retorna status de todas as integrações.

#### 2. Estatísticas Consolidadas

```http
GET /stats
```

Métricas gerais do sistema.

#### 3. Histórico de Operações

```http
GET /operations?type=whatsapp&status=success&limit=100
```

Histórico filtrado de operações.

#### 4. Sincronização Geral

```http
POST /sync
```

Sincroniza todas as integrações ativas.

#### 5. Overview Completo

```http
GET /overview
```

Visão geral com resumo e alertas.

## Automações Disponíveis

### 1. **Fluxo Completo de Vendas**

```
CRM Lead → WhatsApp → PIX → ERP Invoice → Fiscal
```

1. **Lead capturado** no CRM (RD Station/Pipedrive/HubSpot)
2. **Mensagem automática** via WhatsApp Business
3. **Cobrança PIX** gerada (Mercado Pago/PagBank)
4. **Fatura emitida** no ERP (Omie/ContaAzul/Bling)
5. **Nota fiscal** automática com compliance brasileiro

### 2. **Gestão de Estoque Integrada**

```
E-commerce → ERP → WhatsApp → PIX
```

1. **Pedido no e-commerce** (integração Bling)
2. **Baixa automática de estoque** no ERP
3. **Confirmação via WhatsApp** para o cliente
4. **Cobrança PIX** para pagamento

### 3. **Conciliação Financeira**

```
PIX → ERP → Contabilidade
```

1. **PIX recebido** (webhook)
2. **Lançamento automático** no ERP
3. **Conciliação bancária** automatizada
4. **Relatórios fiscais** atualizados

## Configuração das Integrações

### 1. WhatsApp Business API (Meta)

```json
{
    "accessToken": "TOKEN_PERMANENTE",
    "phoneNumberId": "ID_NUMERO_WHATSAPP",
    "businessAccountId": "ID_CONTA_BUSINESS",
    "webhookVerifyToken": "TOKEN_VERIFICACAO",
    "webhookSecret": "SECRET_WEBHOOK"
}
```

### 2. PIX Mercado Pago

```json
{
    "accessToken": "ACCESS_TOKEN_MP",
    "publicKey": "PUBLIC_KEY_MP",
    "clientId": "CLIENT_ID",
    "clientSecret": "CLIENT_SECRET",
    "environment": "production", // ou "sandbox"
    "webhookSecret": "SECRET_WEBHOOK"
}
```

### 3. CRM RD Station

```json
{
    "clientId": "CLIENT_ID_RD",
    "clientSecret": "CLIENT_SECRET_RD",
    "refreshToken": "REFRESH_TOKEN",
    "baseUrl": "https://api.rd.services",
    "webhookUrl": "https://autoflow.com/api/crm/rdstation/webhook"
}
```

### 4. ERP Omie

```json
{
    "apiKey": "API_KEY_OMIE",
    "apiSecret": "API_SECRET_OMIE",
    "apiUrl": "https://app.omie.com.br/api/v1/",
    "companyId": "ID_EMPRESA",
    "webhookSecret": "SECRET_WEBHOOK",
    "taxConfiguration": {
        "defaultCfop": "5102",
        "icmsRate": 18,
        "ipiRate": 0,
        "pisRate": 1.65,
        "cofinsRate": 7.6
    }
}
```

## Monitoramento e Alertas

### 1. **Health Checks Automáticos**

- Verificação a cada 5 minutos
- Teste de conectividade das APIs
- Validação de tokens e credenciais
- Monitoramento de webhooks

### 2. **Métricas de Performance**

- Tempo de resposta das APIs
- Taxa de sucesso/falha
- Volume de operações
- Disponibilidade do serviço

### 3. **Alertas Proativos**

- Token expirando em 7 dias
- Taxa de erro acima de 5%
- Webhook não funcionando
- Limite de API próximo do máximo

### 4. **Logs Detalhados**

- Timestamp de cada operação
- Request/Response completos
- Stack trace de erros
- Contexto da operação

## Benefícios do Dashboard Unificado

### 1. **Visibilidade Total**

- Status consolidado de todas as integrações
- Métricas em tempo real
- Histórico completo de operações
- Alertas proativos

### 2. **Facilidade de Gestão**

- Configuração centralizada
- Testes de conectividade
- Sincronização manual
- Troubleshooting simplificado

### 3. **Otimização de Performance**

- Identificação de gargalos
- Monitoramento de SLA
- Análise de padrões de uso
- Otimização baseada em dados

### 4. **Compliance e Auditoria**

- Logs completos para auditoria
- Rastreabilidade de operações
- Compliance fiscal automático
- Relatórios de conformidade

## Roadmap Futuro

### Fase 1 - Atual ✅

- Dashboard básico com métricas
- Monitoramento de saúde
- Configuração manual das integrações
- Alertas básicos

### Fase 2 - Próximas Funcionalidades

- 🔄 **Configuração assistida** com wizards
- 📊 **Analytics avançados** com gráficos
- 🤖 **Auto-recuperação** de falhas
- 📱 **App mobile** para monitoramento

### Fase 3 - Inteligência Artificial

- 🧠 **IA preditiva** para falhas
- 🎯 **Otimização automática** de performance
- 📈 **Insights** de negócio automatizados
- 🔮 **Previsão** de demanda e capacidade

### Fase 4 - Expansão

- 🌐 **Integrações internacionais**
- 🏢 **Multi-tenancy** para agências
- 🔗 **API marketplace** para parceiros
- 🎨 **Dashboard customizável** por cliente
