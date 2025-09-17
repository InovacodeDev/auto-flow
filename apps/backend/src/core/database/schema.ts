import { pgTable, uuid, varchar, text, timestamp, boolean, jsonb, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Organizations table (multi-tenant support)
export const organizations = pgTable("organizations", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 100 }).unique().notNull(),
    domain: varchar("domain", { length: 255 }),
    plan: varchar("plan", { length: 50 }).default("free").notNull(),
    settings: jsonb("settings").default({}),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Users table
export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
        .references(() => organizations.id)
        .notNull(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    role: varchar("role", { length: 50 }).default("user").notNull(), // admin, user, viewer
    avatar: varchar("avatar", { length: 500 }),
    isActive: boolean("is_active").default(true).notNull(),
    lastLoginAt: timestamp("last_login_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Workflows table - Core automation engine
export const workflows = pgTable("workflows", {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
        .references(() => organizations.id)
        .notNull(),
    createdBy: uuid("created_by")
        .references(() => users.id)
        .notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    status: varchar("status", { length: 50 }).default("draft").notNull(), // draft, active, paused, archived
    triggers: jsonb("triggers").notNull(), // Array of WorkflowTrigger
    actions: jsonb("actions").notNull(), // Array of WorkflowAction
    conditions: jsonb("conditions").default([]), // Array of WorkflowCondition
    metadata: jsonb("metadata").default({}), // { aiGenerated, language, industry, etc }
    version: integer("version").default(1).notNull(),
    isTemplate: boolean("is_template").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Workflow executions - Track automation runs
export const workflowExecutions = pgTable("workflow_executions", {
    id: uuid("id").primaryKey().defaultRandom(),
    workflowId: uuid("workflow_id")
        .references(() => workflows.id)
        .notNull(),
    organizationId: uuid("organization_id")
        .references(() => organizations.id)
        .notNull(),
    status: varchar("status", { length: 50 }).notNull(), // running, success, failed, cancelled
    triggerData: jsonb("trigger_data"), // Original trigger payload
    executionData: jsonb("execution_data"), // Step-by-step execution details
    errorMessage: text("error_message"),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
    duration: integer("duration"), // in milliseconds
});

// Integrations - Connected services
export const integrations = pgTable("integrations", {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
        .references(() => organizations.id)
        .notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    type: varchar("type", { length: 100 }).notNull(), // whatsapp, crm, ecommerce, etc
    config: jsonb("config").notNull(), // API keys, endpoints, settings
    isActive: boolean("is_active").default(true).notNull(),
    lastSyncAt: timestamp("last_sync_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// AI conversations - IA Assistant history
export const aiConversations = pgTable("ai_conversations", {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
        .references(() => organizations.id)
        .notNull(),
    userId: uuid("user_id")
        .references(() => users.id)
        .notNull(),
    title: varchar("title", { length: 255 }),
    messages: jsonb("messages").notNull(), // Array of { role, content, timestamp }
    context: jsonb("context").default({}), // Business context, workflow metadata
    status: varchar("status", { length: 50 }).default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Analytics - Metrics and ROI tracking
export const analytics = pgTable("analytics", {
    id: uuid("id").primaryKey().defaultRandom(),
    organizationId: uuid("organization_id")
        .references(() => organizations.id)
        .notNull(),
    workflowId: uuid("workflow_id").references(() => workflows.id),
    metricType: varchar("metric_type", { length: 100 }).notNull(), // execution_count, time_saved, cost_savings, etc
    value: integer("value").notNull(),
    metadata: jsonb("metadata").default({}),
    recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

// Relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
    users: many(users),
    workflows: many(workflows),
    integrations: many(integrations),
    aiConversations: many(aiConversations),
    analytics: many(analytics),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
    organization: one(organizations, {
        fields: [users.organizationId],
        references: [organizations.id],
    }),
    workflows: many(workflows),
    aiConversations: many(aiConversations),
}));

export const workflowsRelations = relations(workflows, ({ one, many }) => ({
    organization: one(organizations, {
        fields: [workflows.organizationId],
        references: [organizations.id],
    }),
    createdBy: one(users, {
        fields: [workflows.createdBy],
        references: [users.id],
    }),
    executions: many(workflowExecutions),
    analytics: many(analytics),
}));

export const workflowExecutionsRelations = relations(workflowExecutions, ({ one }) => ({
    workflow: one(workflows, {
        fields: [workflowExecutions.workflowId],
        references: [workflows.id],
    }),
    organization: one(organizations, {
        fields: [workflowExecutions.organizationId],
        references: [organizations.id],
    }),
}));

export const integrationsRelations = relations(integrations, ({ one }) => ({
    organization: one(organizations, {
        fields: [integrations.organizationId],
        references: [organizations.id],
    }),
}));

export const aiConversationsRelations = relations(aiConversations, ({ one }) => ({
    organization: one(organizations, {
        fields: [aiConversations.organizationId],
        references: [organizations.id],
    }),
    user: one(users, {
        fields: [aiConversations.userId],
        references: [users.id],
    }),
}));

export const analyticsRelations = relations(analytics, ({ one }) => ({
    organization: one(organizations, {
        fields: [analytics.organizationId],
        references: [organizations.id],
    }),
    workflow: one(workflows, {
        fields: [analytics.workflowId],
        references: [workflows.id],
    }),
}));
