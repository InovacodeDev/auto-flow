# API ERP Integration

## Overview

A API de integração ERP do AutoFlow permite conectar com os principais ERPs do mercado brasileiro:

- **Omie** - ERP líder para PMEs
- **ContaAzul** - Gestão financeira simplificada
- **Bling** - Foco em e-commerce

## Base URL

```
/api/erp
```

## Authentication

Todas as rotas ERP requerem autenticação JWT válida.

## Endpoints

### 1. Configurar Integração

**POST** `/configure/{platform}`

Configura a integração com um ERP específico.

#### Parâmetros

- `platform` (path): `omie` | `contaazul` | `bling`

#### Body

```json
{
    "platform": "omie",
    "apiKey": "sua-api-key",
    "apiSecret": "seu-api-secret",
    "apiUrl": "https://app.omie.com.br/api/v1/",
    "companyId": "123456",
    "webhookSecret": "webhook-secret",
    "taxConfiguration": {
        "defaultCfop": "5102",
        "icmsRate": 18,
        "ipiRate": 0,
        "pisRate": 1.65,
        "cofinsRate": 7.6
    }
}
```

#### Response

```json
{
    "success": true,
    "message": "Integração omie configurada com sucesso",
    "platform": "omie"
}
```

### 2. Produtos

#### Criar Produto

**POST** `/{platform}/products`

```json
{
    "name": "Produto Exemplo",
    "sku": "PROD-001",
    "price": 99.9,
    "cost": 50.0,
    "category": "Eletrônicos",
    "description": "Descrição do produto",
    "stockQuantity": 100,
    "unit": "UN",
    "ncm": "85171100",
    "cfop": "5102",
    "icmsRate": 18
}
```

#### Buscar Produto por SKU

**GET** `/{platform}/products/sku/{sku}`

#### Atualizar Estoque

**PATCH** `/{platform}/products/{productId}/stock`

```json
{
    "operation": "add",
    "quantity": 10
}
```

### 3. Clientes

#### Criar Cliente

**POST** `/{platform}/customers`

```json
{
    "name": "João Silva",
    "email": "joao@email.com",
    "phone": "(11) 99999-9999",
    "document": "123.456.789-00",
    "address": {
        "street": "Rua das Flores",
        "number": "123",
        "neighborhood": "Centro",
        "city": "São Paulo",
        "state": "SP",
        "zipCode": "01234-567"
    },
    "customerType": "individual"
}
```

### 4. Faturas

#### Criar Fatura

**POST** `/{platform}/invoices`

```json
{
    "customerId": "cliente-123",
    "items": [
        {
            "productId": "produto-456",
            "quantity": 2,
            "unitPrice": 99.9
        }
    ],
    "dueDate": "2024-12-31",
    "paymentMethod": "PIX",
    "observations": "Observações da fatura"
}
```

### 5. Conciliação Bancária

**POST** `/{platform}/reconciliation`

```json
{
    "date": "2024-01-15",
    "amount": 199.8,
    "description": "PIX recebido",
    "reference": "PIX-123456"
}
```

### 6. Webhook

**POST** `/{platform}/webhook`

Processa webhooks dos ERPs para sincronização automática.

### 7. Sincronização

**POST** `/{platform}/sync`

Sincroniza dados entre AutoFlow e o ERP.

### 8. Health Check

**GET** `/health`

```json
{
    "status": "ok",
    "service": "ERP Integration Service",
    "timestamp": "2024-01-15T10:30:00Z",
    "platforms": {
        "configured": ["omie", "contaazul"],
        "available": ["omie", "contaazul", "bling"]
    },
    "features": [
        "Gestão completa de produtos",
        "Cadastro unificado de clientes",
        "Faturamento automático",
        "Controle de estoque em tempo real",
        "Conciliação bancária automatizada",
        "Webhooks para eventos fiscais",
        "Sincronização bidirecional",
        "Integração PIX + CRM + WhatsApp",
        "Compliance fiscal brasileiro"
    ]
}
```

## Funcionalidades Específicas por ERP

### Omie

- Gestão completa de produtos e serviços
- Controle de estoque por localização
- Emissão de NFe automática
- Integração com bancos brasileiros
- Relatórios fiscais e contábeis

### ContaAzul

- Foco em gestão financeira
- Conciliação bancária automática
- Controle de fluxo de caixa
- Gestão de contas a pagar/receber
- Integração com bancos digitais

### Bling

- Especializado em e-commerce
- Integração com marketplaces
- Gestão de pedidos multicanal
- Controle de estoque unificado
- Emissão automática de etiquetas

## Compliance Fiscal

A integração ERP garante compliance com a legislação brasileira:

- **Validação CPF/CNPJ**
- **Cálculo automático de impostos** (ICMS, IPI, PIS, COFINS)
- **NCM e CFOP automáticos**
- **Emissão de NFe**
- **SPED fiscal**
- **Integração com Receita Federal**

## Webhooks Suportados

### Eventos Omie

- `produto.incluido`
- `produto.alterado`
- `cliente.incluido`
- `pedido.incluido`
- `nfe.autorizada`

### Eventos ContaAzul

- `product.created`
- `customer.created`
- `sale.created`
- `payment.received`

### Eventos Bling

- `produto`
- `pedido`
- `notafiscal`
- `contato`

## Automações Disponíveis

1. **Cliente → Produto → Fatura → PIX**
    - Lead do CRM vira cliente no ERP
    - Produto criado automaticamente
    - Fatura gerada e enviada por WhatsApp
    - PIX processado e conciliado

2. **Estoque Baixo → Reposição**
    - Webhook de estoque baixo
    - Criação automática de pedido de compra
    - Notificação por WhatsApp

3. **NFe Autorizada → Cliente**
    - Webhook da NFe autorizada
    - Envio automático por WhatsApp
    - Atualização do status no CRM

## Error Handling

```json
{
    "success": false,
    "error": "Descrição do erro",
    "code": "ERP_ERROR_CODE",
    "details": {
        "platform": "omie",
        "operation": "create_product",
        "originalError": "Mensagem original do ERP"
    }
}
```

## Rate Limits

- 100 requests por minuto por ERP
- Webhooks ilimitados
- Sincronização: 1 vez por hora

## Monitoramento

- Health checks automáticos
- Logs detalhados de todas operações
- Métricas de performance
- Alertas de falhas na integração
