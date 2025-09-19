# Integrações Brasileiras - AutoFlow

## Visão Geral

O AutoFlow oferece integrações nativas com as principais APIs e serviços do mercado brasileiro, permitindo que PMEs automatizem seus processos de forma completa e eficiente.

## Integrações Implementadas

### 📱 WhatsApp Business API

#### Funcionalidades

- Envio e recebimento de mensagens
- Templates de mensagens aprovados
- Suporte a mídia (imagens, documentos, áudio)
- Webhooks para mensagens recebidas
- Autenticação OAuth completa

#### Configuração

```typescript
const whatsappConfig: WhatsAppConfig = {
    apiKey: process.env.WHATSAPP_API_KEY,
    phoneNumberId: "123456789",
    businessAccountId: "business_account_id",
    webhookVerifyToken: "verify_token",
};
```

#### Casos de Uso

- **Atendimento automatizado**: Resposta automática para dúvidas frequentes
- **Notificações**: Alertas de pedidos, pagamentos, entregas
- **Marketing**: Campanhas promocionais e newsletters
- **Suporte**: Tickets de suporte e follow-up

#### API Endpoints

- `POST /api/integrations/whatsapp/send-message`
- `POST /api/integrations/whatsapp/webhook`
- `GET /api/integrations/whatsapp/templates`

### 💰 PIX Integration (Mercado Pago)

#### Funcionalidades

- Geração de PIX dinâmico e estático
- QR Codes para pagamento
- Webhooks de confirmação
- Reconciliação automática
- Suporte a diferentes bancos

#### Configuração

```typescript
const pixConfig: PIXConfig = {
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
    userId: "mercado_pago_user_id",
    webhookUrl: "https://app.autoflow.com.br/webhooks/pix",
};
```

#### Casos de Uso

- **Cobrança automática**: Geração de PIX para clientes em atraso
- **E-commerce**: Checkout com PIX instantâneo
- **Assinaturas**: Cobranças recorrentes
- **Marketplace**: Split de pagamentos

#### API Endpoints

- `POST /api/integrations/pix/create-payment`
- `GET /api/integrations/pix/payment-status/:id`
- `POST /api/integrations/pix/webhook`

### 🏢 ERP Integrations

#### Bling ERP

**Funcionalidades:**

- Sincronização de produtos e estoque
- Gestão de pedidos e clientes
- Emissão de notas fiscais
- Relatórios financeiros

**Configuração:**

```typescript
const blingConfig: ERPConfig = {
    apiKey: process.env.BLING_API_KEY,
    baseUrl: "https://www.bling.com.br/Api/v3",
};
```

#### Omie ERP

**Funcionalidades:**

- Gestão completa de clientes
- Controle de vendas e estoque
- Integração contábil
- CRM básico

**Configuração:**

```typescript
const omieConfig: ERPConfig = {
    apiKey: process.env.OMIE_API_KEY,
    appSecret: process.env.OMIE_APP_SECRET,
};
```

### 📊 CRM Integrations

#### RD Station

**Funcionalidades:**

- Gestão de leads e contatos
- Automação de marketing
- Score de leads
- Campanhas de email

**Configuração:**

```typescript
const rdConfig: CRMConfig = {
    apiKey: process.env.RD_STATION_ACCESS_TOKEN,
    clientId: process.env.RD_STATION_CLIENT_ID,
};
```

**Casos de Uso:**

- **Lead scoring**: Pontuação automática de leads
- **Nutrição**: Sequências de email automatizadas
- **Segmentação**: Criação de listas segmentadas
- **Conversão**: Tracking de conversões

#### Pipedrive

**Funcionalidades:**

- Gestão de pipeline de vendas
- Atividades e follow-ups
- Relatórios de vendas
- Automação de processos

**Configuração:**

```typescript
const pipedriveConfig: CRMConfig = {
    apiKey: process.env.PIPEDRIVE_API_KEY,
    baseUrl: "https://api.pipedrive.com/v1",
};
```

#### HubSpot

**Funcionalidades:**

- CRM completo gratuito
- Marketing automation
- Sales automation
- Customer service

**Configuração:**

```typescript
const hubspotConfig: CRMConfig = {
    apiKey: process.env.HUBSPOT_ACCESS_TOKEN,
    baseUrl: "https://api.hubapi.com",
};
```

## Arquitetura de Integrações

### Base Integration Class

```typescript
abstract class Integration {
    protected apiKey: string;
    protected baseUrl: string;
    protected organizationId: string;

    abstract authenticate(): Promise<boolean>;
    abstract validateConfig(): Promise<ValidationResult>;
    abstract execute(action: IntegrationAction): Promise<ActionResult>;

    // Métodos comuns
    protected async makeRequest(endpoint: string, method: string, data?: any): Promise<any>;
    protected async logActivity(action: string, success: boolean, metadata?: any): Promise<void>;
    protected validateRequiredFields(config: any, fields: string[]): ValidationResult;
}
```

### Integration Manager

```typescript
class IntegrationManager {
    private integrations: Map<string, Integration> = new Map();

    async loadIntegration(type: string, config: any, organizationId: string): Promise<Integration>;
    async executeAction(integrationType: string, action: IntegrationAction): Promise<ActionResult>;
    async validateIntegration(type: string, config: any): Promise<ValidationResult>;
    async getAvailableActions(type: string): Promise<string[]>;
}
```

## Workflow Actions por Integração

### WhatsApp Actions

- `whatsapp_send_text`: Enviar mensagem de texto
- `whatsapp_send_template`: Enviar template aprovado
- `whatsapp_send_media`: Enviar imagem/documento
- `whatsapp_mark_read`: Marcar como lida

### PIX Actions

- `pix_create_payment`: Gerar cobrança PIX
- `pix_check_status`: Verificar status de pagamento
- `pix_refund`: Estornar pagamento

### CRM Actions

- `crm_create_contact`: Criar/atualizar contato
- `crm_create_deal`: Criar oportunidade
- `crm_add_note`: Adicionar anotação
- `crm_send_email`: Enviar email via CRM

### ERP Actions

- `erp_create_order`: Criar pedido
- `erp_update_stock`: Atualizar estoque
- `erp_create_invoice`: Emitir nota fiscal
- `erp_sync_customer`: Sincronizar cliente

## Webhooks e Triggers

### Configuração de Webhooks

```typescript
// Webhook universal para todas as integrações
app.post("/api/webhooks/:integration/:organizationId", async (req, res) => {
    const { integration, organizationId } = req.params;
    const payload = req.body;

    const integrationInstance = await loadIntegration(integration, organizationId);
    const events = await integrationInstance.processWebhook(payload);

    // Disparar workflows baseados nos eventos
    for (const event of events) {
        await workflowEngine.triggerByWebhook(event, organizationId);
    }

    res.status(200).send("OK");
});
```

### Event Types por Integração

- **WhatsApp**: `message_received`, `message_delivered`, `message_read`
- **PIX**: `payment_approved`, `payment_rejected`, `payment_pending`
- **CRM**: `contact_created`, `deal_updated`, `email_opened`
- **ERP**: `order_created`, `stock_updated`, `invoice_generated`

## Segurança e Compliance

### Proteção de Credentials

- Todas as chaves API são criptografadas no banco
- Rotação automática de tokens quando possível
- Logs de auditoria para todas as operações
- Isolamento por organização (multi-tenant)

### Compliance LGPD

- Consentimento explícito para integrações
- Direito ao esquecimento implementado
- Logs de processamento de dados
- Anonimização de dados sensíveis

### Rate Limiting

```typescript
// Configuração de rate limits por integração
const rateLimits = {
    whatsapp: { requests: 1000, window: "1h" },
    pix: { requests: 10000, window: "1h" },
    crm: { requests: 5000, window: "1h" },
    erp: { requests: 2000, window: "1h" },
};
```

## Monitoramento e Analytics

### Métricas Coletadas

- **Uptime**: Disponibilidade de cada integração
- **Performance**: Tempo de resposta das APIs
- **Usage**: Volume de requisições por integração
- **Errors**: Taxa de erro e tipos de falha

### Dashboard de Integrações

- Status em tempo real de todas as integrações
- Alertas para falhas ou degradação
- Relatórios de uso e performance
- Comparativo de eficiência por integração

## Troubleshooting

### Problemas Comuns

**1. Falha de Autenticação**

```bash
# Verificar configuração
curl -H "Authorization: Bearer $API_KEY" https://api.endpoint.com/test

# Logs de debug
docker logs autoflow-backend | grep "Integration.*auth"
```

**2. Rate Limit Excedido**

- Implementar retry com backoff exponencial
- Usar cache para reduzir requisições
- Otimizar batch operations

**3. Webhook não recebido**

- Verificar URL pública acessível
- Validar certificado SSL
- Checar logs de firewall/proxy

### Ferramentas de Debug

```typescript
// Health check para todas as integrações
app.get("/api/integrations/health", async (req, res) => {
    const health = {};

    for (const [name, integration] of integrations) {
        health[name] = {
            status: (await integration.testConnection()) ? "healthy" : "unhealthy",
            lastCheck: new Date().toISOString(),
        };
    }

    res.json(health);
});
```

## Roadmap de Novas Integrações

### Próximas Integrações (Q4 2024)

- [ ] **Contábil**: ContaAzul, Sage
- [ ] **E-commerce**: VTEX, Shopify Brasil, Tray
- [ ] **Pagamentos**: PagBank, Stone, Cielo
- [ ] **Comunicação**: Telegram, SMS (Zenvia)

### Integrações Futuras (2025)

- [ ] **Logística**: Correios, Jadlog, Total Express
- [ ] **Banking**: Open Banking (Pix Connect)
- [ ] **Social**: Instagram Business, Facebook Pages
- [ ] **Marketplace**: Mercado Livre, Amazon, Magalu

---

**Nota**: Todas as integrações seguem o padrão de arquitetura baseado na classe `Integration` e são testadas automaticamente para garantir compatibilidade e funcionamento correto.
