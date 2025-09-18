# ERP Integrations - Omie & Bling

## Overview

As integrações com ERPs brasileiros permitem sincronizar clientes, produtos e pedidos diretamente dos workflows do AutoFlow. Suportamos Omie ERP e Bling ERP como principais plataformas.

## Omie ERP Integration

### Configuração

#### Pré-requisitos

1. **Conta Omie ERP**: Plano com acesso à API
2. **Credenciais API**: App Key e App Secret

#### Variáveis de Ambiente

```bash
# Omie ERP
OMIE_APP_KEY=1234567890123
OMIE_APP_SECRET=abc123def456ghi789
```

#### Setup Detalhado

1. **Acessar Configurações da API**
    - Entre no Omie ERP
    - Vá para Configurações → Usuários e Permissões → API
    - Clique em "Gerar Chave de Integração"

2. **Obter Credenciais**
    - Copie o App Key (13 dígitos)
    - Copie o App Secret (string alfanumérica)
    - Configure permissões necessárias

3. **Testar Conexão**
    - Use as credenciais no AutoFlow
    - Execute teste de conexão

### Funcionalidades Omie

#### Create Contact (Cliente)

```typescript
{
  type: "create_contact",
  payload: {
    name: "João Silva",
    email: "joao@email.com",
    phone: "+5511999999999",
    document: "12345678000195"
  }
}
```

#### Create Product (Produto)

```typescript
{
  type: "create_product",
  payload: {
    name: "Produto Exemplo",
    sku: "PROD-001",
    price: 99.90,
    stock: 100
  }
}
```

#### Create Order (Pedido)

```typescript
{
  type: "create_order",
  payload: {
    customerId: "123456",
    items: [
      {
        productId: "789012",
        quantity: 2,
        price: 99.90
      }
    ],
    total: 199.80
  }
}
```

## Bling ERP Integration

### Configuração

#### Pré-requisitos

1. **Conta Bling ERP**: Plano com acesso à API
2. **Token API**: Token de autenticação

#### Variáveis de Ambiente

```bash
# Bling ERP
BLING_API_KEY=abc123def456ghi789jkl012
```

#### Setup Detalhado

1. **Gerar Token API**
    - Entre no Bling ERP
    - Vá para Configurações → API
    - Clique em "Gerar Novo Token"

2. **Configurar Permissões**
    - Marque permissões para: Contatos, Produtos, Pedidos
    - Defina IP de origem (opcional)

3. **Obter API Key**
    - Copie o token gerado
    - Configure no AutoFlow

### Funcionalidades Bling

Similar ao Omie, mas com endpoints diferentes:

#### Create Contact

```typescript
{
  type: "create_contact",
  payload: {
    name: "Maria Santos",
    email: "maria@email.com",
    phone: "+5511888888888",
    document: "98765432000123"
  }
}
```

## Uso nos Workflows

### Sincronizar Cliente do E-commerce para ERP

```json
{
    "name": "Sync Customer to ERP",
    "triggers": [
        {
            "type": "webhook",
            "config": {
                "source": "ecommerce",
                "event": "customer_created"
            }
        }
    ],
    "actions": [
        {
            "type": "create_contact",
            "config": {
                "integration": "omie_erp",
                "action": "create_contact"
            },
            "data": {
                "name": "{{trigger.customer.name}}",
                "email": "{{trigger.customer.email}}",
                "phone": "{{trigger.customer.phone}}",
                "document": "{{trigger.customer.document}}"
            }
        },
        {
            "type": "conditional",
            "condition": "previous.success == true",
            "true_actions": [
                {
                    "type": "update_customer",
                    "config": {
                        "integration": "ecommerce"
                    },
                    "data": {
                        "customerId": "{{trigger.customer.id}}",
                        "erpId": "{{previous.data.contactId}}",
                        "erpSynced": true
                    }
                }
            ]
        }
    ]
}
```

### Criar Pedido no ERP após Pagamento

```json
{
    "name": "Create ERP Order",
    "triggers": [
        {
            "type": "webhook",
            "config": {
                "source": "payment",
                "event": "payment_approved"
            }
        }
    ],
    "actions": [
        {
            "type": "get_order",
            "config": {
                "integration": "ecommerce"
            },
            "data": {
                "orderId": "{{trigger.payment.externalReference}}"
            }
        },
        {
            "type": "create_order",
            "config": {
                "integration": "omie_erp",
                "action": "create_order"
            },
            "data": {
                "customerId": "{{previous.data.customer.erpId}}",
                "items": "{{previous.data.items}}",
                "total": "{{previous.data.total}}"
            }
        },
        {
            "type": "send_message",
            "config": {
                "integration": "whatsapp_business",
                "action": "send_text_message"
            },
            "data": {
                "to": "{{previous[0].data.customer.phone}}",
                "message": "✅ Pedido confirmado!\n\nNº ERP: {{previous.data.orderNumber}}\nValor: R$ {{previous.data.total}}\n\nSeu produto será processado em breve!"
            }
        }
    ]
}
```

### Sincronização Bidirecional de Produtos

```json
{
    "name": "Sync Products ERP → E-commerce",
    "triggers": [
        {
            "type": "schedule",
            "config": {
                "cron": "0 */6 * * *"
            }
        }
    ],
    "actions": [
        {
            "type": "list_products",
            "config": {
                "integration": "omie_erp",
                "filter": "updated_since=6hours"
            }
        },
        {
            "type": "loop",
            "items": "{{previous.data.products}}",
            "actions": [
                {
                    "type": "update_product",
                    "config": {
                        "integration": "ecommerce"
                    },
                    "data": {
                        "sku": "{{item.sku}}",
                        "name": "{{item.name}}",
                        "price": "{{item.price}}",
                        "stock": "{{item.stock}}"
                    }
                }
            ]
        }
    ]
}
```

## Mapeamento de Campos

### Omie → AutoFlow

| Campo Omie          | Campo AutoFlow | Tipo   |
| ------------------- | -------------- | ------ |
| codigo_cliente_omie | contactId      | string |
| razao_social        | name           | string |
| email               | email          | string |
| telefone1_numero    | phone          | string |
| cnpj_cpf            | document       | string |
| codigo_produto      | productId      | string |
| descricao           | name           | string |
| codigo              | sku            | string |
| valor_unitario      | price          | number |

### Bling → AutoFlow

| Campo Bling     | Campo AutoFlow | Tipo   |
| --------------- | -------------- | ------ |
| id              | contactId      | string |
| nome            | name           | string |
| email           | email          | string |
| telefone        | phone          | string |
| numeroDocumento | document       | string |
| id              | productId      | string |
| nome            | name           | string |
| codigo          | sku            | string |
| preco           | price          | number |

## Troubleshooting

### Omie ERP

#### Erro: App Key/Secret inválidos

- **Sintoma**: Forbidden ou Unauthorized
- **Solução**: Verificar credenciais no painel Omie

#### Erro: Cliente já existe

- **Sintoma**: Cliente já cadastrado
- **Solução**: Buscar cliente primeiro, depois atualizar se necessário

#### Erro: Produto sem código

- **Sintoma**: Código do produto é obrigatório
- **Solução**: Sempre informar SKU único para produtos

### Bling ERP

#### Erro: Token inválido

- **Sintoma**: 401 Unauthorized
- **Solução**: Verificar se token não expirou, gerar novo

#### Erro: Limite de requisições

- **Sintoma**: Rate limit exceeded
- **Solução**: Implementar delay entre requisições

#### Erro: Formato de dados

- **Sintoma**: Validation error
- **Solução**: Verificar formato dos campos obrigatórios

### Problemas Gerais

#### Sincronização lenta

- **Causa**: Muitos registros sendo processados
- **Solução**: Implementar paginação e processamento em lotes

#### Dados duplicados

- **Causa**: Falta de verificação de existência
- **Solução**: Sempre buscar antes de criar

#### Falha de conectividade

- **Causa**: Problemas de rede ou API indisponível
- **Solução**: Implementar retry com backoff

## Limitações

### Omie ERP

- **Rate Limits**: 1000 requests/hora por App Key
- **Bulk Operations**: Máximo 50 registros por requisição
- **File Size**: Máximo 5MB para uploads
- **Webhook**: Não disponível na API pública

### Bling ERP

- **Rate Limits**: 500 requests/hora por token
- **Bulk Operations**: Máximo 100 registros por requisição
- **File Size**: Máximo 10MB para uploads
- **Webhook**: Disponível apenas em planos premium

## Custos

### Omie ERP

- **API Access**: Incluído nos planos pagos
- **Requests**: Sem custo adicional dentro dos limites
- **Support**: Suporte técnico incluído

### Bling ERP

- **API Access**: Incluído em todos os planos
- **Requests**: Sem custo adicional
- **Webhooks**: Apenas planos premium

## Links Úteis

### Omie ERP

- [Documentação API](https://developer.omie.com.br)
- [Central de Ajuda](https://ajuda.omie.com.br)
- [Status da API](https://status.omie.com.br)

### Bling ERP

- [Documentação API](https://developer.bling.com.br)
- [Central de Ajuda](https://ajuda.bling.com.br)
- [Postman Collection](https://www.postman.com/bling-api)
