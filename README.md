# 🚀 AutoFlow - SaaS de Automação para PMEs Brasileiras

> **Democratizando automação empresarial através de IA conversacional**

AutoFlow é uma plataforma de automa### 📈 **Status Atual do Projeto:**

```
✅ Fase 1: Fundação e Estrutura
✅ Fase 2: Sistema de Autenticação
✅ Fase 3: Motor de Workflows
✅ Fase 4: Interface Visual (Drag & Drop)
✅ Fase 5: Sistema de Execução
✅ Fase 6: Integrações Brasileiras ← CONCLUÍDA
✅ Fase 7: Analytics e Monitoramento
✅ Fase 8: IA Conversacional
```

**🎯 Status: BETA AVANÇADO** - Todas as funcionalidades principais implementadas!gente projetada especificamente para pequenas e médias empresas brasileiras. Com IA conversacional e interface visual drag-and-drop, transformamos processos manuais em automações eficientes.

## 🎯 Visão do Produto

### Problema Central

- 76,9% das startups brasileiras focam B2B
- PMEs operam 95% dos processos manualmente
- Falta de integração entre ferramentas
- Tempo perdido com tarefas repetitivas

### Solução AutoFlow

- **🤖 IA Conversacional**: Crie automações em português natural
- **🎨 Constructor Visual**: Interface drag-and-drop inspirada no N8N
- **🇧🇷 Integrações Nativas**: 100+ ferramentas brasileiras out-of-the-box
- **📊 ROI Mensurável**: Métricas claras de economia de tempo e ganhos

## 🛠 Stack Tecnológico

### Backend (Node.js + TypeScript)

- **Framework**: Fastify (alta performance)
- **Database**: PostgreSQL + Drizzle ORM
- **Queue**: Redis + Bull (processamento assíncrono)
- **AI**: OpenAI GPT-4 (IA conversacional)
- **Auth**: JWT + RBAC multi-tenant

### Frontend (React + TypeScript)

- **Framework**: React 18 + Vite
- **Routing**: TanStack Router (type-safe)
- **Styling**: Tailwind CSS + Material Expressive
- **State**: Zustand + TanStack Query
- **Workflow UI**: ReactFlow (drag-and-drop)

### Monorepo & Deploy

- **Monorepo**: Turborepo (caching inteligente)
- **Package Manager**: pnpm (performance)
- **Deploy**: Vercel (frontend) + Railway (backend)
- **CI/CD**: GitHub Actions

## 🚀 Quick Start

### Pré-requisitos

```bash
# Node.js 18+
node --version

# pnpm
npm install -g pnpm

# PostgreSQL
brew install postgresql  # macOS
sudo apt install postgresql  # Linux

# Redis (opcional, para filas)
brew install redis  # macOS
sudo apt install redis  # Linux
```

### Instalação

````bash
## 🚀 Quick Start

```bash
# Clonar repositório
git clone <repo-url>
cd auto-flow

# Instalar dependências
pnpm install

# Setup do banco (PostgreSQL necessário)
cd apps/backend && pnpm run db:setup

# Configurar IA (opcional - para recursos de IA conversacional)
echo "OPENAI_API_KEY=sk-proj-your-key-here" >> apps/backend/.env

# Iniciar desenvolvimento
pnpm dev
````

### 🤖 Configuração da IA Conversacional

Para utilizar os recursos de IA conversacional:

1. **Obtenha uma chave API OpenAI**: [platform.openai.com](https://platform.openai.com)
2. **Configure a variável de ambiente**: `OPENAI_API_KEY` no arquivo `apps/backend/.env`
3. **Verifique o saldo**: Certifique-se de ter créditos suficientes na conta OpenAI

**📄 Documentação completa**: [docs/setup/ai-configuration.md](docs/setup/ai-configuration.md)

```

### URLs de Desenvolvimento

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Docs**: http://localhost:3001/docs

## 📁 Estrutura do Projeto

```

autoflow/
├── apps/
│ ├── backend/ # Fastify API
│ │ ├── src/
│ │ │ ├── core/ # Engine de automação
│ │ │ ├── ai/ # IA conversacional
│ │ │ ├── integrations/ # WhatsApp, ERPs, etc
│ │ │ ├── workflows/ # Lógica de execução
│ │ │ └── auth/ # Autenticação multi-tenant
│ │ └── migrations/ # Database migrations
│ └── frontend/ # React SPA
│ ├── src/
│ │ ├── components/ # Componentes reutilizáveis
│ │ │ ├── workflow/ # Constructor drag-and-drop
│ │ │ ├── dashboard/# Analytics e métricas
│ │ │ └── ai-chat/ # Interface IA conversacional
│ │ ├── pages/ # Páginas da aplicação
│ │ └── stores/ # Estado global
├── packages/
│ ├── types/ # TypeScript types compartilhados
│ ├── ui/ # Componentes UI compartilhados
│ └── config/ # Configurações compartilhadas
└── docs/ # Documentação completa
├── features/ # Documentação de features
├── api/ # Documentação da API
└── architecture/ # Decisões arquiteturais

````

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev                 # Iniciar ambos servidores
pnpm dev:backend         # Apenas backend
pnpm dev:frontend        # Apenas frontend

# Build & Deploy
pnpm build               # Build de produção
pnpm type-check          # Verificar TypeScript
pnpm lint                # Linting
pnpm test                # Testes

# Database
pnpm db:generate         # Gerar migrations
pnpm db:migrate          # Executar migrations
pnpm db:studio           # Drizzle Studio (GUI)

# Utilitários
pnpm clean               # Limpar builds
pnpm setup               # Setup inicial automatizado
````

## 🎯 Status do Projeto

- ✅ **Fase 1**: Documentação e Arquitetura (100%)
- ✅ **Fase 2**: Infraestrutura Base Turborepo (100%)
- ✅ **Fase 3**: Sistema de Autenticação Multi-tenant (100%)
- ✅ **Fase 4**: Workflow Engine Core (100%)
- ✅ **Fase 5**: Interface Visual e Drag-and-Drop (100%)
- ✅ **Fase 7**: Sistema de Execução de Workflows (100%)
- ✅ **Fase 8**: IA Conversacional Assistant (100%)
- ⏳ **Fase 6**: Integrações Brasileiras (0%)

### Fase 8 Concluída ✅ - IA Conversacional

**🤖 Sistema de IA:**

- OpenAI GPT-4 integration para criação de workflows
- Chat conversacional em linguagem natural
- Parser inteligente texto → workflow
- Contexto organizacional e sugestões personalizadas
- Interface de chat integrada ao dashboard

**🔧 Backend:**

- AIService com integração OpenAI completa
- API endpoints para chat, histórico e contexto
- System prompts especializados em automação
- Function calling para geração de workflows

**🎨 Frontend:**

- Componente AIChat responsivo e acessível
- Botão flutuante de acesso rápido
- Histórico de conversas persistente
- Sugestões contextuais em tempo real

### Fase 3 Concluída ✅

**Backend:**

- JWT + multi-tenant authentication
- RBAC com isolamento organizacional
- API completa de autenticação
- PostgreSQL com RLS e migrações
- Seeds de desenvolvimento

**Frontend:**

- Zustand store com persistência
- Hook useAuth personalizado
- Componentes de proteção de rotas
- Formulário de login
- Cliente HTTP com interceptores

> 📖 Veja instruções detalhadas em [FASE-3-AUTH.md](./FASE-3-AUTH.md)

## 🏗 Arquitetura

### Engine de Automação

```typescript
interface AutoFlowWorkflow {
    id: string;
    name: string;
    triggers: WorkflowTrigger[]; // WhatsApp, webhook, schedule
    actions: WorkflowAction[]; // Send message, save data, API call
    conditions: WorkflowCondition[]; // If/else, loops
    metadata: {
        aiGenerated: boolean;
        language: "pt-BR";
        industry: string;
    };
}
```

### Integrações

- **WhatsApp Business API**: Mensagens automáticas
- **PIX**: Pagamentos instantâneos (Mercado Pago, PagBank)
- **CRM**: RD Station, Pipedrive, HubSpot
- **ERP**: Omie, ContaAzul, Bling
- **E-commerce**: VTEX, Shopify, WooCommerce

## 📊 Métricas de Sucesso

### Product-Market Fit

- **NPS Score**: Target 50+
- **MAU**: 500+ usuários em 6 meses
- **Retention**: 80%+ no segundo mês
- **Time to Value**: <15 minutos

### ROI para PMEs

- **Economia**: R$ 2.400/mês por cliente
- **Tempo Poupado**: 8+ horas/semana
- **Eficiência**: 95%+ de automação de processos

## 🤝 Contribuindo

1. **Fork** o repositório
2. **Clone** seu fork
3. **Instale** dependências: `pnpm install`
4. **Crie** uma branch: `git checkout -b feature/nova-feature`
5. **Commit** suas mudanças: `git commit -m 'Add: nova feature'`
6. **Push** para a branch: `git push origin feature/nova-feature`
7. **Abra** um Pull Request

### Diretrizes de Desenvolvimento

- **Documentation First**: Sempre documente antes de implementar
- **TypeScript Strict**: Type safety obrigatório
- **Testing**: Coverage mínimo 80%
- **AI-First**: Toda funcionalidade acessível via IA

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

- **Documentação**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/your-username/autoflow/issues)
- **Discord**: [Comunidade AutoFlow](https://discord.gg/autoflow)
- **Email**: suporte@autoflow.com.br

---

**Construído com ❤️ para PMEs brasileiras por Alex & Team**

_"Democratizando automação empresarial, uma PME por vez."_
