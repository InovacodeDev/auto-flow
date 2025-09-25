# AutoFlow - API Authentication

## Overview

Sistema de autenticação multi-tenant robusto com suporte a JWT, RBAC (Role-Based Access Control) e isolamento completo de dados entre organizações.

## Core Functionality

- **Multi-tenant Authentication**: Isolamento completo entre organizações
- **JWT with Refresh**: Tokens seguros com rotação automática
- **Role-Based Access Control**: Permissões granulares por funcionalidade
- **API Rate Limiting**: Proteção contra abuso e DDoS
- **Audit Logging**: Rastreamento completo de ações para compliance

## Technical Implementation

### Authentication Endpoints

#### POST `/register`

Registro de nova organização e usuário administrador.

**Request Body:**

```typescript
interface RegisterRequest {
  organization: {
    name: string; // Nome da empresa
    industry: string; // Segmento de atuação
    size: "micro" | "pequena" | "media"; // Porte da empresa
    country: "BR"; // País (inicialmente só Brasil)
  };
  user: {
    name: string; // Nome completo
    email: string; // Email (único globalmente)
    password: string; // Senha (min 8 chars, requirements)
    phone?: string; // Telefone opcional
  };
  acceptedTerms: boolean; // Aceite dos termos de uso
  acceptedPrivacy: boolean; // Aceite da política de privacidade (LGPD)
}
```

**Response:**

```typescript
interface RegisterResponse {
  organization: {
    id: string;
    name: string;
    plan: "free" | "starter" | "professional" | "enterprise";
    createdAt: Date;
  };
  user: {
    id: string;
    name: string;
    email: string;
    role: "owner";
  };
  tokens: {
    accessToken: string; // JWT válido por 15 minutos
    refreshToken: string; // JWT válido por 30 dias
    expiresIn: number; // Timestamp de expiração
  };
}
```

#### POST `/login`

Autenticação de usuário existente.

**Request Body:**

```typescript
interface LoginRequest {
  email: string;
  password: string;
  organizationId?: string; // Opcional se usuário pertence a múltiplas orgs
}
```

**Response:**

```typescript
interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    organizationId: string;
  };
  organization: {
    id: string;
    name: string;
    plan: SubscriptionPlan;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  permissions: Permission[];
}
```

#### POST `/auth/refresh`

Renovação de token de acesso.

**Request Body:**

```typescript
interface RefreshRequest {
  refreshToken: string;
}
```

#### POST `/auth/logout`

Invalidação de tokens (logout).

**Headers:**

- `Authorization: Bearer <accessToken>`

### Role-Based Access Control (RBAC)

#### User Roles

```typescript
type UserRole =
  | "owner" // Dono da organização (acesso total)
  | "admin" // Administrador (quase total, exceto billing)
  | "manager" // Gerente (criar/editar workflows, ver analytics)
  | "operator" // Operador (executar workflows, view-only analytics)
  | "viewer"; // Visualizador (apenas leitura)

interface Permission {
  resource: string; // 'workflows', 'integrations', 'analytics', 'users'
  action: string; // 'create', 'read', 'update', 'delete', 'execute'
  scope: "own" | "team" | "organization";
}
```

#### Permission Matrix

```typescript
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  owner: [{ resource: "*", action: "*", scope: "organization" }],
  admin: [
    { resource: "workflows", action: "*", scope: "organization" },
    { resource: "integrations", action: "*", scope: "organization" },
    { resource: "analytics", action: "read", scope: "organization" },
    { resource: "users", action: "*", scope: "organization" },
    // Exceto billing e organization settings
  ],
  manager: [
    { resource: "workflows", action: "create|read|update", scope: "team" },
    { resource: "integrations", action: "read", scope: "organization" },
    { resource: "analytics", action: "read", scope: "team" },
  ],
  operator: [
    { resource: "workflows", action: "execute|read", scope: "team" },
    { resource: "analytics", action: "read", scope: "own" },
  ],
  viewer: [
    { resource: "workflows", action: "read", scope: "team" },
    { resource: "analytics", action: "read", scope: "team" },
  ],
};
```

### JWT Token Structure

```typescript
interface JWTPayload {
  // Standard claims
  sub: string; // User ID
  iss: "autoflow-api"; // Issuer
  aud: "autoflow-app"; // Audience
  exp: number; // Expiration timestamp
  iat: number; // Issued at timestamp
  jti: string; // JWT ID (for revocation)

  // Custom claims
  organizationId: string; // Organization ID for multi-tenancy
  role: UserRole; // User role
  permissions: Permission[]; // Cached permissions
  plan: SubscriptionPlan; // Organization plan (for feature gating)

  // Security
  tokenType: "access" | "refresh";
  sessionId: string; // Session identifier
}
```

### Middleware Implementation

```typescript
// Authentication middleware
export const authenticateJWT = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(request.headers.authorization);

    if (!token) {
      return reply.code(401).send({ error: "Missing authentication token" });
    }

    // Verify and decode JWT
    const payload = await verifyJWT(token);

    // Check if token is revoked
    const isRevoked = await checkTokenRevocation(payload.jti);
    if (isRevoked) {
      return reply.code(401).send({ error: "Token has been revoked" });
    }

    // Attach user context to request
    request.user = {
      id: payload.sub,
      organizationId: payload.organizationId,
      role: payload.role,
      permissions: payload.permissions,
      sessionId: payload.sessionId,
    };
  } catch (error) {
    return reply.code(401).send({ error: "Invalid authentication token" });
  }
};

// Authorization middleware
export const authorize =
  (requiredPermission: Permission) =>
  async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userPermissions = request.user.permissions;

    const hasPermission = checkPermission(userPermissions, requiredPermission);

    if (!hasPermission) {
      return reply.code(403).send({
        error: "Insufficient permissions",
        required: requiredPermission,
      });
    }
  };
```

### Multi-tenant Data Isolation

```typescript
// Database query helper for tenant isolation
class TenantQueryBuilder {
  constructor(private organizationId: string) {}

  // Automatically add organization filter to all queries
  forOrganization<T extends { organizationId: string }>(
    query: QueryBuilder<T>,
  ): QueryBuilder<T> {
    return query.where("organizationId", this.organizationId);
  }

  // Example usage in route handlers
  async getWorkflows(): Promise<Workflow[]> {
    return db
      .select()
      .from(workflows)
      .where(eq(workflows.organizationId, this.organizationId));
  }
}

// Route handler with tenant isolation
export const getWorkflowsHandler = async (
  request: FastifyRequest & { user: AuthenticatedUser },
  reply: FastifyReply,
) => {
  const tenantQuery = new TenantQueryBuilder(request.user.organizationId);
  const workflows = await tenantQuery.getWorkflows();

  return reply.send({ workflows });
};
```

## Dependencies

- **@fastify/jwt**: JWT handling
- **bcrypt**: Password hashing
- **zod**: Input validation
- **drizzle-orm**: Database operations
- **redis**: Token revocation and session management

## Testing Strategy

- **Authentication Tests**: Login, register, refresh flows
- **Authorization Tests**: Permission checking for all roles
- **Security Tests**: Token manipulation, injection attacks
- **Multi-tenancy Tests**: Data isolation verification
- **Rate Limiting Tests**: API abuse protection

## Future Considerations

- **Single Sign-On (SSO)**: SAML, OAuth2 providers
- **Multi-Factor Authentication**: SMS, TOTP, Hardware keys
- **Session Management**: Advanced session controls
- **OAuth API**: Allow third-party integrations
- **Advanced Audit**: Detailed compliance logging

---

**Status**: 🚧 Sprint 1-2 (Foundation) - Em implementação
**Priority**: Alta - Bloqueador para todas as outras funcionalidades
