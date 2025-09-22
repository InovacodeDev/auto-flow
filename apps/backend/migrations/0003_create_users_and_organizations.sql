-- 0003_create_users_and_organizations.sql
-- Migração esqueleto para criar as tabelas users, organizations e users_to_organizations
-- OBS: Este arquivo é um esqueleto inicial; ajuste conforme as necessidades do projeto antes de rodar em produção.

BEGIN;

-- Organizations
CREATE TABLE IF NOT EXISTS organizations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    slug varchar(100) NOT NULL UNIQUE,
    domain varchar(255),
    plan varchar(50) NOT NULL DEFAULT 'free',
    settings jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Users
CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES organizations(id),
    email varchar(255) NOT NULL UNIQUE,
    name varchar(255) NOT NULL,
    password_hash varchar(255) NOT NULL,
    role varchar(50) NOT NULL DEFAULT 'user',
    avatar varchar(500),
    is_active boolean NOT NULL DEFAULT true,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Junction table (if additional user<->organization relations are needed)
CREATE TABLE IF NOT EXISTS users_to_organizations (
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role varchar(50) DEFAULT 'member',
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (user_id, organization_id)
);

COMMIT;
