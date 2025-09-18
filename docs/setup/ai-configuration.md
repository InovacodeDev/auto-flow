# Configuração da IA Conversacional

## Pré-requisitos

Para utilizar o sistema de IA conversacional, você precisará de:

1. **Chave API OpenAI**: Conta OpenAI com acesso ao GPT-4
2. **Créditos OpenAI**: Saldo suficiente para chamadas de API

## Setup

### 1. Obter Chave API OpenAI

1. Acesse [platform.openai.com](https://platform.openai.com)
2. Crie uma conta ou faça login
3. Vá para API Keys na seção de configurações
4. Clique em "Create new secret key"
5. Copie e guarde a chave com segurança

### 2. Configurar Variável de Ambiente

```bash
# No arquivo apps/backend/.env
OPENAI_API_KEY=sk-proj-your-api-key-here
```

### 3. Verificar Configuração

O sistema verificará automaticamente a configuração ao iniciar. Se a chave API não estiver configurada, a IA estará indisponível mas o resto do sistema funcionará normalmente.

## Custos

### Estimativa de Custos OpenAI (GPT-4)

- **Input**: ~$0.03 por 1K tokens
- **Output**: ~$0.06 por 1K tokens
- **Conversa típica**: 500-1500 tokens (~$0.03-0.15 por interação)
- **Geração de workflow**: 1000-3000 tokens (~$0.06-0.30 por workflow)

### Controle de Custos

- Rate limiting automático por usuário
- Histórico limitado para reduzir contexto
- Timeout em requisições longas
- Logs de uso para monitoramento

## Funcionalidades Disponíveis

### ✅ Implementado

- [x] Chat conversacional em português
- [x] Geração automática de workflows
- [x] Contexto organizacional
- [x] Histórico de conversas
- [x] Sugestões inteligentes
- [x] Interface integrada ao dashboard

### 🔄 Próximas Funcionalidades

- [ ] Otimização de workflows existentes
- [ ] Templates personalizados por setor
- [ ] Integração com documentação da empresa
- [ ] Análise de performance de workflows
- [ ] Suporte a comandos de voz

## Uso

### 1. Acesso ao Chat IA

- Clique no botão flutuante com ícone de estrela no WorkflowBuilder
- O chat abrirá em modal sobreposto
- Digite sua solicitação em linguagem natural

### 2. Exemplos de Comandos

#### Workflows Simples

```
"Quero enviar mensagem de boas-vindas via WhatsApp"
"Criar lembrete para follow-up de vendas"
"Automatizar envio de PIX para cobrança"
```

#### Workflows Complexos

```
"Quando um cliente compra no site, enviar mensagem de confirmação via WhatsApp, aguardar 3 dias e enviar pesquisa de satisfação por email"

"Se cliente não pagar boleto em 5 dias, enviar cobrança via WhatsApp. Se não pagar em mais 3 dias, enviar cobrança via PIX"
```

#### Otimizações

```
"Como posso melhorar meu workflow de vendas?"
"Adicionar condição para enviar apenas em horário comercial"
"Integrar este workflow com meu CRM"
```

### 3. Fluxo de Trabalho

1. **Descrever necessidade** em linguagem natural
2. **IA analisa** e gera workflow automaticamente
3. **Revisar** workflow gerado no canvas
4. **Ajustar** se necessário através do chat
5. **Executar** workflow quando estiver pronto

## Limitações Atuais

- Dependência de conectividade com internet
- Latência das chamadas OpenAI (2-10 segundos)
- Limitado às integrações já implementadas
- Requer configuração de API key
- Custos por uso (pay-per-token)

## Troubleshooting

### IA não responde

- Verificar se OPENAI_API_KEY está configurada
- Verificar conectividade com internet
- Verificar se há saldo na conta OpenAI

### Workflows não são gerados

- Seja mais específico na descrição
- Use terminologia relacionada a automação
- Mencione trigger e ações desejadas

### Respostas genéricas

- Forneça mais contexto sobre seu negócio
- Mencione integrações específicas que deseja usar
- Descreva o problema que quer resolver

---

**💡 Dica**: Seja específico e detalhado nas suas solicitações. Quanto mais contexto você fornecer, melhor será o workflow gerado!
