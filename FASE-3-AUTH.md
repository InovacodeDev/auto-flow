# AutoFlow - Fase 3: Sistema de Autenticação ✅

Sistema de autenticação multi-tenant implementado com JWT, RBAC e isolamento por organização.

## 🚀 Implementações da Fase 3

### Backend

- ✅ **AuthService**: Registro, login, refresh token, validação de senha
- ✅ **AuthMiddleware**: Proteção de rotas, RBAC, isolamento organizacional
- ✅ **Rotas de Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/auth/refresh`, `/api/auth/logout`
- ✅ **Schema de Banco**: Migrações completas com RLS e multi-tenancy
- ✅ **Seeds de Desenvolvimento**: Organizações e usuários de teste

### Frontend

- ✅ **Zustand Store**: Estado global de autenticação com persistência
- ✅ **Hook useAuth**: Interface simplificada para componentes
- ✅ **ProtectedRoute**: Componente para proteção de rotas
- ✅ **LoginForm**: Formulário de login completo
- ✅ **API Client**: Cliente HTTP com interceptores de auth

## 🛠️ Setup da Fase 3

### 1. Configurar Banco de Dados

```bash
# Instalar PostgreSQL (se não tiver)
# macOS: brew install postgresql
# Ubuntu: sudo apt install postgresql

# Executar script de setup
cd apps/backend
./setup-db.sh
```

O script irá:

- Criar banco `autoflow` e usuário `autoflow`
- Executar migrações
- Opcionalmente carregar dados de teste
- Gerar arquivo `.env` com configurações

### 2. Configurar Variáveis de Ambiente

```bash
# Backend (.env já criado pelo setup-db.sh)
DATABASE_URL="postgresql://autoflow:autoflow123@localhost:5432/autoflow"
JWT_SECRET="[gerado automaticamente]"
NODE_ENV=development

# Frontend (.env.local)
VITE_API_URL=http://localhost:3001/api
```

### 3. Instalar Dependências

```bash
# Raiz do projeto
pnpm install
```

### 4. Executar em Desenvolvimento

```bash
# Terminal 1: Backend
cd apps/backend
npm run dev

# Terminal 2: Frontend
cd apps/frontend
npm run dev
```

## 📊 Dados de Teste

Se carregou os dados de seed, você pode testar com:

**Usuários Admin:**

- `admin@techstart.com` (TechStart Ltda)
- `owner@comerciodigital.com` (Comércio Digital ME)
- `ceo@servicospro.com` (Serviços Pro)

**Senha padrão:** `AutoFlow123!`

## 🔐 Funcionalidades de Autenticação

### Endpoints Disponíveis

```
POST /api/auth/register - Registro de nova organização
POST /api/auth/login - Login do usuário
GET /api/auth/me - Perfil do usuário atual
POST /api/auth/refresh - Renovar token
POST /api/auth/logout - Logout
```

### Exemplos de Uso

**Registro:**

```javascript
const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        organization: {
            name: "Minha Empresa",
            industry: "Tecnologia",
            size: "pequena",
            country: "BR",
        },
        user: {
            name: "João Silva",
            email: "joao@empresa.com",
            password: "MinhaSenh@123",
        },
        acceptedTerms: true,
        acceptedPrivacy: true,
    }),
});
```

**Login:**

```javascript
const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        email: "joao@empresa.com",
        password: "MinhaSenh@123",
    }),
});
```

### Hooks React

```tsx
import { useAuth } from "./hooks/useAuth";

function MyComponent() {
    const { user, isAuthenticated, login, logout, isAdmin } = useAuth();

    if (!isAuthenticated) {
        return <LoginForm />;
    }

    return (
        <div>
            <h1>Olá, {user.name}!</h1>
            {isAdmin() && <AdminPanel />}
            <button onClick={logout}>Sair</button>
        </div>
    );
}
```

### Proteção de Rotas

```tsx
<ProtectedRoute requiredRole="admin">
    <AdminDashboard />
</ProtectedRoute>
```

## 🏗️ Arquitetura Multi-Tenant

### Isolamento por Organização

- Cada usuário pertence a uma organização
- Todas as tabelas têm `organization_id`
- RLS (Row Level Security) no PostgreSQL
- Middleware verifica `organizationId` em cada request

### Hierarquia de Roles

- **admin**: Acesso total à organização
- **manager**: Gerenciar workflows e usuários
- **user**: Usar workflows existentes

### Segurança Implementada

- Senhas hasheadas com bcrypt (12 rounds)
- JWT com refresh tokens
- Rate limiting
- Validação de entrada
- Logs de auditoria

## 🚦 Próximas Fases

**Fase 4**: Workflow Engine Core

- Executor de workflows
- Triggers (webhook, schedule, manual)
- Sistema de nodes e edges

**Fase 5**: Interface Visual

- Constructor drag-and-drop
- Templates de workflows
- Preview e debugging

**Fase 6**: Integrações Brasileiras

- WhatsApp Business API
- PIX via bancos
- ERPs populares

## 🐛 Troubleshooting

### Erro de Conexão com Banco

```bash
# Verificar se PostgreSQL está rodando
pg_isready -h localhost -p 5432

# Verificar logs
tail -f /usr/local/var/log/postgres.log
```

### Erro de CORS

Verifique se `CORS_ORIGIN` no backend está configurado para o frontend:

```bash
CORS_ORIGIN=http://localhost:5173
```

### Erro 401 Unauthorized

- Verificar se JWT_SECRET está configurado
- Token pode ter expirado (use refresh)
- Verificar se usuário/organização existem

## 📝 Logs e Debug

```bash
# Backend logs
npm run dev
# Logs são escritos no console com níveis: info, warn, error

# Verificar banco
psql -h localhost -p 5432 -U autoflow -d autoflow
\dt  # listar tabelas
SELECT * FROM users LIMIT 5;
```

Fase 3 concluída com sucesso! ✅
