# 🚀 AutoFlow - SaaS de Automação para PMEs Brasileiras

> **Democratizando automação empresarial através de IA conversacional**

AutoFlow é uma plataforma de automação inteligente projetada especificamente para pequenas e médias empresas brasileiras. Com IA conversacional e interface visual drag-and-drop, transformamos processos manuais em automações eficientes.

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
```bash
# 1. Clonar repositório
git clone https://github.com/your-username/autoflow.git
cd autoflow

# 2. Setup automático
pnpm run setup

# 3. Configurar variáveis de ambiente
cp apps/backend/.env.example apps/backend/.env
# Edite as configurações necessárias

# 4. Iniciar desenvolvimento
pnpm dev
```

### URLs de Desenvolvimento
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Docs**: http://localhost:3001/docs

## 📁 Estrutura do Projeto

```
autoflow/
├── apps/
│   ├── backend/              # Fastify API
│   │   ├── src/
│   │   │   ├── core/         # Engine de automação
│   │   │   ├── ai/           # IA conversacional
│   │   │   ├── integrations/ # WhatsApp, ERPs, etc
│   │   │   ├── workflows/    # Lógica de execução
│   │   │   └── auth/         # Autenticação multi-tenant
│   │   └── migrations/       # Database migrations
│   └── frontend/             # React SPA
│       ├── src/
│       │   ├── components/   # Componentes reutilizáveis
│       │   │   ├── workflow/ # Constructor drag-and-drop
│       │   │   ├── dashboard/# Analytics e métricas
│       │   │   └── ai-chat/  # Interface IA conversacional
│       │   ├── pages/        # Páginas da aplicação
│       │   └── stores/       # Estado global
├── packages/
│   ├── types/                # TypeScript types compartilhados
│   ├── ui/                   # Componentes UI compartilhados
│   └── config/               # Configurações compartilhadas
└── docs/                     # Documentação completa
    ├── features/             # Documentação de features
    ├── api/                  # Documentação da API
    └── architecture/         # Decisões arquiteturais
```

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
```

## 🎯 Roadmap de Desenvolvimento

### ✅ Sprint 1-2: Foundation (4 semanas)
- [x] Setup Turborepo + Fastify + Drizzle
- [x] Setup React + TanStack Router + Tailwind
- [x] Database schema inicial
- [x] Documentação arquitetural

### 🚧 Sprint 3-4: Core Features (4 semanas)
- [ ] Workflow Engine completo
- [ ] Constructor Visual drag-and-drop
- [ ] Sistema de autenticação
- [ ] API CRUD para workflows

### 📋 Sprint 5-6: IA & Integrations (4 semanas)
- [ ] IA Conversacional (GPT-4)
- [ ] WhatsApp Business API
- [ ] Integração PIX
- [ ] ERPs brasileiros (Omie, ContaAzul)

### 🔮 Sprint 7-8: Analytics & Polish (4 semanas)
- [ ] Dashboard de métricas
- [ ] Cálculo de ROI automático
- [ ] Templates pré-configurados
- [ ] Onboarding interativo

## 🏗 Arquitetura

### Engine de Automação
```typescript
interface AutoFlowWorkflow {
  id: string;
  name: string;
  triggers: WorkflowTrigger[];    // WhatsApp, webhook, schedule
  actions: WorkflowAction[];      // Send message, save data, API call
  conditions: WorkflowCondition[]; // If/else, loops
  metadata: {
    aiGenerated: boolean;
    language: 'pt-BR';
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

*"Democratizando automação empresarial, uma PME por vez."*