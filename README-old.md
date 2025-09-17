# AutoFlow - SaaS de Automação para PMEs Brasileiras

**🚀 Plataforma de automação inteligente que democratiza a automação para pequenas e médias empresas brasileiras através de IA conversacional e constructor visual drag-and-drop.**

## 📋 Visão Geral

O AutoFlow resolve uma dor crítica do mercado brasileiro: 95% das PMEs ainda operam processos manuais por falta de soluções acessíveis. Nossa plataforma combina:

- **🤖 IA Conversacional**: Crie automações falando em português natural
- **🔄 Constructor Visual**: Interface drag-and-drop inspirada no N8N
- **🇧🇷 Integrações Nativas**: 100+ ferramentas brasileiras out-of-the-box
- **📊 ROI Transparente**: Métricas claras de economia de tempo e ganhos

## 🏗️ Arquitetura

### Stack Tecnológico

- **Backend**: TypeScript + Node.js + Fastify + Drizzle ORM + PostgreSQL
- **Frontend**: React 18 + TypeScript + Vite + TanStack Router + Tailwind CSS
- **Monorepo**: Turborepo
- **Testing**: Jest (backend) + Vitest (frontend)
- **Design**: Material Expressive + ReactFlow

### Estrutura do Projeto

```
autoflow-monorepo/
├── apps/
│   ├── backend/           # API Fastify
│   │   ├── src/
│   │   │   ├── core/      # Engine de automação
│   │   │   ├── ai/        # IA conversacional
│   │   │   ├── integrations/ # APIs WhatsApp, ERPs
│   │   │   ├── workflows/ # Lógica de execução
│   │   │   ├── analytics/ # Métricas e ROI
│   │   │   └── auth/      # Autenticação multi-tenant
│   │   └── tests/
│   └── frontend/          # React SPA
│       ├── src/
│       │   ├── components/
│       │   │   ├── workflow/    # Constructor drag-and-drop
│       │   │   ├── dashboard/   # Analytics
│       │   │   └── ai-chat/     # Interface IA
│       │   ├── pages/
│       │   ├── hooks/
│       │   ├── services/
│       │   └── stores/
│       └── tests/
├── packages/
│   ├── types/            # Shared TypeScript types
│   ├── ui/               # Shared React components
│   └── config/           # Shared configuration
└── docs/                 # Documentação completa
```

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- npm ou yarn

### Instalação

1. **Clone e instale dependências**

```bash
git clone https://github.com/autoflow/monorepo.git
cd autoflow-monorepo
npm install
```

2. **Configure ambiente**

```bash
cp .env.example .env
# Edite .env com suas configurações
```

3. **Configure banco de dados**

```bash
# Criar banco PostgreSQL
createdb autoflow

# Executar migrações
cd apps/backend
npm run db:migrate
```

4. **Inicie os serviços**

```bash
# Terminal 1: Backend
cd apps/backend
npm run dev

# Terminal 2: Frontend
cd apps/frontend
npm run dev

# Terminal 3: Redis (se local)
redis-server
```

5. **Acesse a aplicação**

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Docs API: http://localhost:3001/docs

## 📊 Cronograma de Desenvolvimento

### ✅ Sprint 1-2: Foundation (4 semanas) - **EM ANDAMENTO**

- [x] Setup Turborepo + arquitetura base
- [x] Estrutura backend Fastify + frontend React
- [x] Sistema de tipos compartilhados
- [ ] Autenticação multi-tenant
- [ ] Database schema inicial
- [ ] Dashboard base com métricas mock

### 🔄 Sprint 3-4: Core Features (4 semanas)

- [ ] Engine de execução de workflows
- [ ] Constructor visual drag-and-drop
- [ ] Sistema de triggers e actions
- [ ] Queue system para execução
- [ ] Testes de integração

### 🎯 Sprint 5-6: IA & Integrations (4 semanas)

- [ ] IA conversacional (OpenAI GPT-4)
- [ ] WhatsApp Business API
- [ ] Integrações PIX (Mercado Pago)
- [ ] ERPs brasileiros (Omie, ContaAzul)
- [ ] Sistema de webhooks

### 📈 Sprint 7-8: Analytics & Polish (4 semanas)

- [ ] Dashboard de métricas tempo real
- [ ] Cálculo automático de ROI
- [ ] Relatórios de performance
- [ ] Onboarding interativo
- [ ] Templates pré-configurados

## 🧪 Testes

```bash
# Executar todos os testes
npm run test

# Backend
cd apps/backend
npm run test

# Frontend
cd apps/frontend
npm run test

# Coverage
npm run test:coverage
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia frontend + backend
npm run build        # Build completo
npm run lint         # Linting
npm run type-check   # Verificação de tipos

# Banco de dados
npm run db:generate  # Gerar schemas Drizzle
npm run db:migrate   # Executar migrações
npm run db:studio    # Drizzle Studio

# Limpeza
npm run clean        # Limpar builds
```

## 🌟 Funcionalidades Principais

### IA Conversacional

```
"Quero automatizar o atendimento do WhatsApp. Quando receber mensagem,
salvar lead no CRM e enviar email de boas-vindas"

→ AutoFlow gera workflow completo automaticamente
```

### Constructor Visual

- Drag-and-drop intuitivo
- Templates pré-configurados
- Preview em tempo real
- Versionamento automático

### Integrações Nativas

- **WhatsApp Business**: Envio/recebimento automático
- **PIX**: Processamento de pagamentos
- **CRMs**: RD Station, Pipedrive, HubSpot
- **ERPs**: Omie, ContaAzul, Bling
- **E-commerce**: VTEX, Shopify, WooCommerce

### ROI Transparente

```
📊 Relatório Mensal
├── ⏰ Tempo economizado: 32h
├── 💰 Economia de custos: R$ 1.600
├── 📈 Receita gerada: R$ 4.200
└── 🎯 ROI total: 362%
```

## 📚 Documentação

- [API Reference](./docs/api/)
- [Guia de Desenvolvimento](./docs/development/)
- [Arquitetura do Sistema](./docs/architecture/)
- [Guia de Contribuição](./CONTRIBUTING.md)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🚀 Roadmap 2024

- **Q1**: MVP com IA + WhatsApp + CRM básico
- **Q2**: Marketplace de integrações + Templates
- **Q3**: Mobile app + API pública
- **Q4**: AI Co-pilot + Análise preditiva

---

**Feito com ❤️ para democratizar automação no Brasil**

🌐 [autoflow.com.br](https://autoflow.com.br) • 📧 contato@autoflow.com.br • 🐦 [@AutoFlowBR](https://twitter.com/AutoFlowBR)
