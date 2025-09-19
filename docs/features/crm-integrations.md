# CRM Integrations - AutoFlow

## Visão Geral

O módulo CRM Integrations do AutoFlow oferece conectividade unificada com os principais CRMs do mercado brasileiro, automatizando todo o funil de vendas desde a captura de leads até o fechamento de negócios e pós-venda.

## CRMs Suportados

### 🎯 RD Station

- **Marketing Automation**: Líder no mercado brasileiro
- **Funcionalidades**: Gestão de leads, automação de email, scoring
- **Especialidade**: Inbound marketing e nutrição de leads
- **Integração**: API v2 com suporte completo a webhooks

### 💼 Pipedrive

- **Sales CRM**: Focado em pipeline de vendas
- **Funcionalidades**: Gestão de oportunidades, atividades, relatórios
- **Especialidade**: Vendas B2B e gestão de pipeline
- **Integração**: API REST v1 com sincronização bidirecional

### 🚀 HubSpot

- **Plataforma Completa**: CRM + Marketing + Vendas + Atendimento
- **Funcionalidades**: Gestão 360° do cliente, automações avançadas
- **Especialidade**: Growth hacking e customer success
- **Integração**: API v3 com OAuth 2.0 e webhooks

## Funcionalidades Core

### 1. Gestão Unificada de Contatos

- **Criação Automática**: Novos contatos criados em tempo real
- **Sincronização Bidirecional**: Dados sempre atualizados entre sistemas
- **Deduplicação Inteligente**: Evita contatos duplicados
- **Enriquecimento de Dados**: Complementa informações automaticamente
- **Segmentação Avançada**: Tags e campos customizados

### 2. Automação de Oportunidades

- **Pipeline Automático**: Criação de deals baseada em gatilhos
- **Estágios Dinâmicos**: Movimentação automática entre etapas
- **Scoring Inteligente**: Qualificação automática de leads
- **Previsão de Fechamento**: IA para predição de vendas
- **ROI Tracking**: Acompanhamento de retorno sobre investimento

### 3. Atividades Automatizadas

- **Registro Automático**: Todas as interações registradas
- **Lembretes Inteligentes**: Alertas baseados em comportamento
- **Follow-up Automático**: Sequências de acompanhamento
- **Relatórios de Atividade**: Métricas de produtividade
- **Integração WhatsApp**: Conversas registradas automaticamente

### 4. Webhooks em Tempo Real

- **Sincronização Instantânea**: Atualizações em tempo real
- **Eventos Customizados**: Triggers para workflows específicos
- **Validação de Segurança**: Verificação de assinatura de webhooks
- **Retry Logic**: Reprocessamento automático de falhas
- **Logs Detalhados**: Auditoria completa de eventos

## Implementação Técnica

### Serviço Principal: CRMIntegrationService

```typescript
// Localização: /apps/backend/src/integrations/crm/CRMIntegrationService.ts

// Interface unificada para todos os CRMs:
- createContact(): Criar contatos
- findContactByEmail(): Buscar por email
- createDeal(): Criar oportunidades
- updateDealStatus(): Atualizar status
- createActivity(): Registrar atividades
- processWebhook(): Processar eventos
- syncWithCRM(): Sincronização completa
```

### API Routes: CRM Endpoints

```typescript
// Localização: /apps/backend/src/routes/crm.ts

// Endpoints por plataforma:
POST /api/crm/configure/:platform - Configurar integração
POST /api/crm/:platform/contacts - Criar contato
GET /api/crm/:platform/contacts/email/:email - Buscar contato
POST /api/crm/:platform/deals - Criar oportunidade
PATCH /api/crm/:platform/deals/:id/status - Atualizar status
POST /api/crm/:platform/activities - Criar atividade
POST /api/crm/:platform/webhook - Processar webhook
POST /api/crm/:platform/sync - Sincronizar dados
GET /api/crm/health - Health check
```

### Configuração Multi-Plataforma

```javascript
// Exemplo: Configuração RD Station
await fetch("/api/crm/configure/rdstation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        apiKey: "SEU_TOKEN_RD_STATION",
        apiUrl: "https://api.rd.services",
        webhookSecret: "webhook_secret_key",
        customMappings: {
            telefone: "mobile_phone",
            empresa: "company",
        },
    }),
});
```

## Casos de Uso PME

### 1. E-commerce com Automação Completa

```javascript
// Fluxo: Visita → Lead → Oportunidade → Venda → Pós-venda

// 1. Captura de lead no site
const lead = await crmService.createContact({
    name: "João Silva",
    email: "joao@email.com",
    phone: "+5511999999999",
    company: "Empresa ABC",
    tags: ["website", "interesse-produto-x"],
});

// 2. Criação automática de oportunidade
const deal = await crmService.createDeal({
    title: "Produto X - João Silva",
    value: 299.9,
    contactId: lead.id,
    stage: "Qualificação",
});

// 3. Cobrança PIX automática
const pix = await pixService.createPIXPayment({
    amount: 299.9,
    description: "Produto X - Pedido #123",
    payerEmail: lead.email,
    externalReference: deal.id,
});

// 4. Envio via WhatsApp
await whatsappService.sendTemplate({
    to: lead.phone,
    template: "cobranca_produto",
    variables: {
        nome: lead.name,
        produto: "Produto X",
        valor: "R$ 299,90",
        qrcode: pix.qrCode,
        link: pix.paymentLink,
    },
});

// 5. Webhook PIX atualiza CRM automaticamente
// Quando pagamento confirmado:
await crmService.updateDealStatus(deal.id, "won");
await crmService.createActivity({
    type: "note",
    subject: "Pagamento Confirmado via PIX",
    description: `Pagamento de R$ 299,90 confirmado via PIX`,
    dealId: deal.id,
});
```

### 2. Consultoria B2B

```javascript
// Fluxo: Reunião → Proposta → Negociação → Fechamento

// 1. Após reunião, criar oportunidade
const deal = await crmService.createDeal({
    title: "Consultoria Digital - Empresa XYZ",
    value: 5000.0,
    contactId: clienteId,
    stage: "Proposta",
    expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
});

// 2. Enviar proposta via WhatsApp
await whatsappService.sendDocument({
    to: cliente.phone,
    document: propostaURL,
    filename: "Proposta_Consultoria_XYZ.pdf",
    caption: `Olá ${cliente.name}! Segue nossa proposta de consultoria digital.`,
});

// 3. Registro automático da atividade
await crmService.createActivity({
    type: "whatsapp",
    subject: "Proposta enviada via WhatsApp",
    description: "Proposta de consultoria digital enviada",
    dealId: deal.id,
    contactId: cliente.id,
});

// 4. Follow-up automático em 3 dias
setTimeout(
    async () => {
        await whatsappService.sendTextMessage({
            to: cliente.phone,
            message: `Olá ${cliente.name}! Já teve tempo de analisar nossa proposta? Estou disponível para esclarecer dúvidas.`,
        });

        await crmService.createActivity({
            type: "whatsapp",
            subject: "Follow-up proposta",
            dealId: deal.id,
        });
    },
    3 * 24 * 60 * 60 * 1000
);
```

### 3. SaaS com Trial Automático

```javascript
// Fluxo: Cadastro → Trial → Cobrança → Renovação

// 1. Usuário se cadastra para trial
const contact = await crmService.createContact({
    name: user.name,
    email: user.email,
    company: user.company,
    tags: ["trial", "saas", user.plan],
});

// 2. Trial de 14 dias
const deal = await crmService.createDeal({
    title: `${user.plan} Trial - ${user.company}`,
    value: planos[user.plan].valor,
    contactId: contact.id,
    stage: "Trial Ativo",
});

// 3. Lembrete via WhatsApp no 12º dia
setTimeout(
    async () => {
        await whatsappService.sendTemplate({
            to: user.phone,
            template: "trial_expirando",
            variables: {
                nome: user.name,
                dias_restantes: "2",
                plano: user.plan,
                valor: planos[user.plan].valorFormatado,
            },
        });
    },
    12 * 24 * 60 * 60 * 1000
);

// 4. Cobrança automática no 14º dia
setTimeout(
    async () => {
        const pix = await pixService.createPIXPayment({
            amount: planos[user.plan].valor,
            description: `${user.plan} - ${user.company}`,
            payerEmail: user.email,
            externalReference: deal.id,
        });

        await whatsappService.sendTemplate({
            to: user.phone,
            template: "cobranca_renovacao",
            variables: {
                nome: user.name,
                plano: user.plan,
                qrcode: pix.qrCode,
            },
        });

        await crmService.updateDealStatus(deal.id, "open", "Aguardando Pagamento");
    },
    14 * 24 * 60 * 60 * 1000
);
```

## Fluxos de Automação Avançados

### Automação 1: Lead Scoring Inteligente

```javascript
// Sistema de pontuação automática baseado em ações
const leadScoringRules = {
    visitou_pricing: 10,
    baixou_ebook: 15,
    assistiu_demo: 25,
    abriu_email: 5,
    clicou_email: 10,
    empresa_grande: 20,
    cargo_decisor: 15,
};

async function processarLeadScoring(contactId, action) {
    const score = leadScoringRules[action] || 0;

    // Atualizar score no CRM
    await crmService.updateContact(contactId, {
        customFields: {
            lead_score: currentScore + score,
        },
    });

    // Se score alto, criar oportunidade automaticamente
    if (currentScore + score >= 50) {
        await crmService.createDeal({
            title: "Lead Qualificado - Score Alto",
            value: 1000, // Valor médio
            contactId,
            stage: "Qualificado",
        });

        // Notificar vendedor via WhatsApp
        await whatsappService.sendTextMessage({
            to: vendedor.phone,
            message: `🔥 Lead qualificado! ${contact.name} atingiu score ${currentScore + score}. Vale a pena ligar!`,
        });
    }
}
```

### Automação 2: Sequência de Nutrição

```javascript
// Nutrição automática de leads via WhatsApp
const sequenciaNutricao = [
    {
        dias: 0,
        template: "boas_vindas",
        message: "Obrigado pelo interesse! Aqui está seu ebook.",
    },
    {
        dias: 3,
        template: "dica_implementacao",
        message: "3 dicas para implementar o que aprendeu no ebook",
    },
    {
        dias: 7,
        template: "case_sucesso",
        message: "Case de sucesso: como a empresa X aumentou vendas em 300%",
    },
    {
        dias: 14,
        template: "convite_demo",
        message: "Que tal uma demo personalizada? Vou te mostrar na prática!",
    },
];

async function iniciarSequenciaNutricao(contactId) {
    for (const step of sequenciaNutricao) {
        setTimeout(
            async () => {
                await whatsappService.sendTemplate({
                    to: contact.phone,
                    template: step.template,
                });

                await crmService.createActivity({
                    type: "whatsapp",
                    subject: `Nutrição: ${step.template}`,
                    contactId,
                    description: step.message,
                });
            },
            step.dias * 24 * 60 * 60 * 1000
        );
    }
}
```

### Automação 3: Gestão de Inadimplência

```javascript
// Processo automático para lidar com pagamentos em atraso
async function processarInadimplencia(dealId) {
    const deal = await crmService.getDeal(dealId);
    const contact = await crmService.getContact(deal.contactId);

    // Sequência de cobrança
    const sequenciaCobranca = [
        { dias: 1, tom: "amigável", desconto: 0 },
        { dias: 3, tom: "lembrança", desconto: 5 },
        { dias: 7, tom: "urgente", desconto: 10 },
        { dias: 15, tom: "final", desconto: 15 },
    ];

    for (const cobranca of sequenciaCobranca) {
        setTimeout(
            async () => {
                const novoValor = deal.value * (1 - cobranca.desconto / 100);

                // Criar nova cobrança PIX com desconto
                const pix = await pixService.createPIXPayment({
                    amount: novoValor,
                    description: `${deal.title} - Desconto ${cobranca.desconto}%`,
                    payerEmail: contact.email,
                    externalReference: deal.id,
                });

                // Enviar cobrança via WhatsApp
                await whatsappService.sendTemplate({
                    to: contact.phone,
                    template: `cobranca_${cobranca.tom}`,
                    variables: {
                        nome: contact.name,
                        valor_original: formatCurrency(deal.value),
                        valor_desconto: formatCurrency(novoValor),
                        desconto: cobranca.desconto,
                        qrcode: pix.qrCode,
                    },
                });

                // Registrar atividade
                await crmService.createActivity({
                    type: "whatsapp",
                    subject: `Cobrança ${cobranca.tom} - Desconto ${cobranca.desconto}%`,
                    dealId,
                    description: `Cobrança enviada com desconto de ${cobranca.desconto}%`,
                });
            },
            cobranca.dias * 24 * 60 * 60 * 1000
        );
    }
}
```

## Benefícios para PMEs

### Operacionais

- **Centralização Total**: Todos os dados de clientes em um só lugar
- **Automação Inteligente**: Reduz trabalho manual em 80%
- **Sincronização Real-Time**: Dados sempre atualizados
- **Workflows Customizados**: Processos únicos para cada negócio
- **Relatórios Automáticos**: Métricas de performance em tempo real

### Comerciais

- **Aumento de Conversão**: Lead scoring e nutrição automatizada
- **Ciclo de Vendas Reduzido**: Automação acelera processos
- **Upsell/Cross-sell**: Identificação automática de oportunidades
- **Retenção de Clientes**: Follow-up automático pós-venda
- **Previsibilidade**: Forecasting baseado em dados históricos

### Financeiros

- **Redução de Inadimplência**: Cobrança automática via PIX
- **Cash Flow Previsível**: Recorrência e agendamentos automáticos
- **Eliminação de Atritos**: Pagamentos instantâneos via WhatsApp
- **Conciliação Automática**: Integração PIX + CRM + contabilidade
- **ROI Mensurável**: Tracking completo desde lead até receita

## Configuração e Setup

### Variáveis de Ambiente

```env
# RD Station
RDSTATION_CLIENT_ID=seu_client_id
RDSTATION_CLIENT_SECRET=seu_client_secret
RDSTATION_API_URL=https://api.rd.services

# Pipedrive
PIPEDRIVE_API_TOKEN=seu_api_token
PIPEDRIVE_API_URL=https://sua_empresa.pipedrive.com/api/v1

# HubSpot
HUBSPOT_CLIENT_ID=seu_client_id
HUBSPOT_CLIENT_SECRET=seu_client_secret
HUBSPOT_API_URL=https://api.hubapi.com
```

### Webhooks Configuration

```javascript
// URLs para configurar nos CRMs:
const webhookUrls = {
    rdstation: "https://api.autoflow.com.br/api/crm/rdstation/webhook",
    pipedrive: "https://api.autoflow.com.br/api/crm/pipedrive/webhook",
    hubspot: "https://api.autoflow.com.br/api/crm/hubspot/webhook",
};

// Eventos monitorados:
const monitoredEvents = [
    "contact.created",
    "contact.updated",
    "deal.created",
    "deal.updated",
    "deal.status_changed",
    "activity.created",
];
```

## Próximos Desenvolvimentos

### Phase 1: Integrações Avançadas

- **Zapier Integration**: Conectar com 3000+ apps
- **API Gateway**: Interface unificada para todos os CRMs
- **Custom Fields Mapping**: Mapeamento visual de campos

### Phase 2: IA e Analytics

- **Predictive Analytics**: Previsão de fechamento de deals
- **Sentiment Analysis**: Análise de sentimento em conversas
- **Churn Prediction**: Identificação precoce de possível churn

### Phase 3: Omnichannel

- **Email Integration**: Sincronizar emails automaticamente
- **Social Media**: Integrar Instagram, Facebook, LinkedIn
- **Voice Integration**: Gravar e transcrever ligações

## Vantagem Competitiva

O módulo CRM Integrations do AutoFlow oferece vantagens únicas:

1. **Integração Nativa Brasileira**: Focado nos CRMs mais usados no Brasil
2. **PIX + WhatsApp + CRM**: Trio poderoso para vendas brasileiras
3. **Automação Completa**: Do lead ao pós-venda automatizado
4. **Setup Simplificado**: Configuração em minutos, não semanas
5. **Escalabilidade Inteligente**: Cresce com o negócio sem perder eficiência

Esta solução posiciona o AutoFlow como a plataforma definitiva para automação comercial de PMEs brasileiras, integrando as ferramentas que elas já usam com a potência da automação moderna.
