<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# AutoFlow - SaaS de Automação para PMEs Brasileiras

## Diretrizes de Desenvolvimento

### Stack Tecnológico

- **Backend**: TypeScript + Node.js + Fastify + Drizzle ORM + PostgreSQL
- **Frontend**: React 18 + TypeScript + Vite + TanStack Router + Tailwind CSS
- **Monorepo**: Turborepo
- **Testing**: Jest (backend) + Vitest (frontend)
- **Design**: Material Expressive + ReactFlow para drag-and-drop

### Arquitetura

- Multi-tenant SaaS
- Workflow engine para automações
- IA conversacional para criação de automações
- Integrações com APIs brasileiras (WhatsApp Business, PIX, ERPs)
- Constructor visual drag-and-drop

### Convenções

- TypeScript strict mode obrigatório
- Naming: camelCase para workflows, PascalCase para componentes
- Documentação obrigatória para toda nova feature
- Testes de cobertura mínima 80%
- IA-first: toda funcionalidade acessível via IA conversacional

### Estrutura de Pastas

```
apps/
├── backend/           # Fastify API
└── frontend/          # React SPA
packages/
├── types/            # Shared TypeScript types
├── ui/               # Shared React components
└── config/           # Shared configuration
```

- [x] Verify that the copilot-instructions.md file in the .github directory is created.

- [x] Clarify Project Requirements
- [x] Scaffold the Project
- [x] Customize the Project
- [x] Install Required Extensions
- [x] Compile the Project
- [x] Create and Run Task
- [x] Launch the Project
- [x] Ensure Documentation is Complete
