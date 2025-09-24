# Guia de Testes - AutoFlow

Este documento descreve a estratégia de testes implementada no projeto AutoFlow, incluindo testes unitários, de integração e E2E.

## 📋 Visão Geral

O projeto implementa uma estratégia de testes abrangente com três níveis:

1. **Testes Unitários**: Testam componentes e funções individuais
2. **Testes de Integração**: Testam a integração entre diferentes partes do sistema
3. **Testes E2E**: Testam o fluxo completo da aplicação

## 🛠️ Tecnologias Utilizadas

### Frontend

- **Vitest**: Framework de testes principal
- **React Testing Library**: Testes de componentes React
- **Playwright**: Testes E2E
- **Jest DOM**: Matchers customizados para DOM

### Backend

- **Vitest**: Framework de testes principal
- **Fastify Inject**: Testes de integração de API
- **Jest**: Testes unitários (legacy)

## 📁 Estrutura de Testes

```
apps/
├── frontend/
│   ├── src/
│   │   ├── test/
│   │   │   ├── setup.ts              # Configuração global dos testes
│   │   │   └── utils.tsx             # Utilitários de teste
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.test.tsx
│   │   │   │   └── RegisterForm.test.tsx
│   │   │   ├── workflow/
│   │   │   │   └── WorkflowCanvas.test.tsx
│   │   │   ├── integrations/
│   │   │   │   └── IntegrationsDashboard.test.tsx
│   │   │   └── ai/
│   │   │       └── MessageBubble.test.tsx
│   │   ├── hooks/
│   │   │   └── useAuthEnhanced.test.tsx
│   │   └── services/
│   │       └── workflowService.test.ts
│   ├── tests/
│   │   └── e2e/
│   │       ├── setup.ts              # Configuração E2E
│   │       └── auth.e2e.test.ts      # Testes E2E de autenticação
│   ├── vite.config.ts                # Configuração Vitest
│   └── playwright.config.ts          # Configuração Playwright
└── backend/
    ├── tests/
    │   ├── integration/
    │   │   ├── setup.ts              # Configuração integração
    │   │   ├── auth.int.test.ts      # Testes integração auth
    │   │   └── workflows.int.test.ts # Testes integração workflows
    │   └── unit/
    │       └── auth.test.ts          # Testes unitários
    ├── vitest.config.ts              # Configuração Vitest
    └── jest.config.cjs               # Configuração Jest (legacy)
```

## 🚀 Executando Testes

### Frontend

```bash
# Testes unitários
npm run test

# Testes com UI
npm run test:ui

# Testes com cobertura
npm run test:coverage

# Testes E2E
npm run test:e2e

# Testes E2E com UI
npm run test:e2e:ui

# Testes E2E em modo headed
npm run test:e2e:headed

# Todos os testes
npm run test:all
```

### Backend

```bash
# Testes unitários
npm run test

# Testes com UI
npm run test:ui

# Testes com cobertura
npm run test:coverage

# Testes de integração
npm run test:integration

# Todos os testes
npm run test:all
```

## 📝 Tipos de Testes

### 1. Testes Unitários

Testam componentes e funções individuais em isolamento.

**Exemplo - Componente React:**

```typescript
import { render, screen } from "@testing-library/react";
import { LoginForm } from "./LoginForm";

describe("LoginForm", () => {
    it("renders login form correctly", () => {
        render(<LoginForm />);
        expect(screen.getByText("Entrar")).toBeInTheDocument();
    });
});
```

**Exemplo - Hook Personalizado:**

```typescript
import { renderHook } from "@testing-library/react";
import { useAuthEnhanced } from "./useAuthEnhanced";

describe("useAuthEnhanced", () => {
    it("returns user data from store", () => {
        const { result } = renderHook(() => useAuthEnhanced());
        expect(result.current.user).toBeDefined();
    });
});
```

**Exemplo - Serviço:**

```typescript
import { workflowApi } from "./workflowService";

describe("workflowApi", () => {
    it("getWorkflows calls correct endpoint", async () => {
        mockAxios.get.mockResolvedValue({ data: [mockWorkflow] });
        await workflowApi.getWorkflows();
        expect(mockAxios.get).toHaveBeenCalledWith("/workflows");
    });
});
```

### 2. Testes de Integração

Testam a integração entre diferentes partes do sistema.

**Exemplo - API de Autenticação:**

```typescript
import { FastifyInstance } from "fastify";
import { build } from "../../src/index";

describe("Auth Integration Tests", () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = build();
        await app.ready();
    });

    it("should login with valid credentials", async () => {
        const response = await app.inject({
            method: "POST",
            url: "/api/login",
            payload: {
                email: "test@example.com",
                password: "password123",
            },
        });

        expect(response.statusCode).toBe(200);
        const data = JSON.parse(response.body);
        expect(data).toHaveProperty("accessToken");
    });
});
```

### 3. Testes E2E

Testam o fluxo completo da aplicação do ponto de vista do usuário.

**Exemplo - Fluxo de Login:**

```typescript
import { page } from "./setup";

describe("Authentication E2E Tests", () => {
    it("should complete login flow", async () => {
        await page.goto("/login");
        await page.fill('input[placeholder="Email"]', "test@example.com");
        await page.fill('input[placeholder="Senha"]', "password123");
        await page.click('button[type="submit"]');
        await page.waitForURL("/dashboard");
        expect(await page.textContent("h1")).toContain("Dashboard");
    });
});
```

## 🔧 Configuração

### Frontend (Vitest)

```typescript
// vite.config.ts
export default defineConfig({
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: ["./src/test/setup.ts"],
        css: true,
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
        },
    },
});
```

### Backend (Vitest)

```typescript
// vitest.config.ts
export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        setupFiles: ["./tests/integration/setup.ts"],
        testTimeout: 10000,
    },
});
```

### E2E (Playwright)

```typescript
// playwright.config.ts
export default defineConfig({
    testDir: "./tests/e2e",
    use: {
        baseURL: "http://localhost:5173",
        trace: "on-first-retry",
    },
    projects: [
        { name: "chromium", use: { ...devices["Desktop Chrome"] } },
        { name: "firefox", use: { ...devices["Desktop Firefox"] } },
        { name: "webkit", use: { ...devices["Desktop Safari"] } },
    ],
});
```

## 📊 Cobertura de Testes

### Metas de Cobertura

- **Componentes**: 90%+
- **Hooks**: 95%+
- **Serviços**: 90%+
- **Utilitários**: 100%
- **Integração**: 80%+
- **E2E**: Fluxos críticos 100%

### Relatórios

Os relatórios de cobertura são gerados em:

- `coverage/` - Relatório HTML
- `coverage/coverage-final.json` - Dados JSON
- Console - Resumo textual

## 🧪 Mocks e Fixtures

### Mocks Globais

```typescript
// src/test/setup.ts
vi.mock("@tanstack/react-query", () => ({
    useQuery: vi.fn(),
    useMutation: vi.fn(),
    QueryClient: vi.fn(),
    QueryClientProvider: vi.fn(),
}));
```

### Fixtures de Dados

```typescript
// src/test/utils.tsx
export const mockUser = {
    id: "user_1",
    name: "João Silva",
    email: "joao@example.com",
    organizationId: "org_1",
};

export const mockWorkflow = {
    id: "workflow_1",
    name: "Test Workflow",
    nodes: [...],
    edges: [...],
};
```

## 🔍 Debugging

### Testes Unitários

```bash
# Executar teste específico
npm run test -- LoginForm

# Executar com debug
npm run test -- --reporter=verbose

# Executar em modo watch
npm run test:watch
```

### Testes E2E

```bash
# Executar com debug
npm run test:e2e:headed

# Executar teste específico
npm run test:e2e -- auth.e2e.test.ts

# Executar com trace
npm run test:e2e -- --trace on
```

## 📈 CI/CD

### GitHub Actions

```yaml
name: Tests
on: [push, pull_request]
jobs:
    test:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v3
            - uses: actions/setup-node@v3
            - run: npm install
            - run: npm run test:all
            - run: npm run test:e2e
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Testes E2E falhando**: Verificar se o servidor está rodando
2. **Mocks não funcionando**: Verificar se estão no setup.ts
3. **Cobertura baixa**: Verificar se os arquivos estão sendo incluídos
4. **Timeouts**: Aumentar o timeout nos testes

### Logs e Debug

```bash
# Logs detalhados
DEBUG=* npm run test

# Logs E2E
npm run test:e2e -- --reporter=line
```

## 📚 Recursos Adicionais

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

## 🤝 Contribuindo

Ao adicionar novos testes:

1. Siga os padrões estabelecidos
2. Adicione mocks apropriados
3. Mantenha a cobertura alta
4. Documente casos complexos
5. Execute todos os testes antes do commit

---

**Nota**: Este guia é atualizado conforme novas funcionalidades são adicionadas ao projeto.
