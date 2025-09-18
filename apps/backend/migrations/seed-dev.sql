-- AutoFlow Development Seed Data
-- This file contains test data for development environment

-- Disable RLS temporarily for seeding
SET session_replication_role = replica;

-- Seed Organizations
INSERT INTO organizations (id, name, slug, industry, size, country, plan, settings, created_at, updated_at) VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'TechStart Ltda', 'techstart', 'Tecnologia', 'pequena', 'BR', 'professional', '{"theme": "dark", "notifications": true}', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440001', 'Comércio Digital ME', 'comercio-digital', 'Varejo', 'micro', 'BR', 'basic', '{"theme": "light", "notifications": true}', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440002', 'Serviços Pro', 'servicos-pro', 'Serviços', 'media', 'BR', 'enterprise', '{"theme": "auto", "notifications": false}', NOW(), NOW());

-- Seed Users
-- Password for all test users: "AutoFlow123!"
-- Hash generated with bcrypt, rounds: 12
INSERT INTO users (id, organization_id, email, name, password_hash, phone, role, status, created_at, updated_at) VALUES
    -- TechStart Ltda users
    ('660e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'admin@techstart.com', 'João Silva', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewKKqBojN8oP2O2i', '+5511999887766', 'admin', 'active', NOW(), NOW()),
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'maria@techstart.com', 'Maria Santos', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewKKqBojN8oP2O2i', '+5511999887767', 'manager', 'active', NOW(), NOW()),
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'pedro@techstart.com', 'Pedro Costa', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewKKqBojN8oP2O2i', '+5511999887768', 'user', 'active', NOW(), NOW()),
    
    -- Comércio Digital ME users
    ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'owner@comerciodigital.com', 'Ana Oliveira', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewKKqBojN8oP2O2i', '+5511888776655', 'admin', 'active', NOW(), NOW()),
    ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'vendas@comerciodigital.com', 'Carlos Pereira', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewKKqBojN8oP2O2i', '+5511888776656', 'user', 'active', NOW(), NOW()),
    
    -- Serviços Pro users
    ('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'ceo@servicospro.com', 'Roberto Lima', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewKKqBojN8oP2O2i', '+5511777665544', 'admin', 'active', NOW(), NOW()),
    ('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'ops@servicospro.com', 'Fernanda Rocha', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewKKqBojN8oP2O2i', '+5511777665545', 'manager', 'active', NOW(), NOW());

-- Seed Integrations
INSERT INTO integrations (id, organization_id, type, name, config, status, created_at, updated_at) VALUES
    -- TechStart Ltda integrations
    ('770e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'whatsapp_business', 'WhatsApp Principal', '{"phone": "+5511999887766", "webhook_url": "https://autoflow.com/webhook/whatsapp"}', 'active', NOW(), NOW()),
    ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'email', 'Email Corporativo', '{"smtp_host": "smtp.gmail.com", "smtp_port": 587, "from_email": "noreply@techstart.com"}', 'active', NOW(), NOW()),
    
    -- Comércio Digital ME integrations
    ('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'whatsapp_business', 'WhatsApp Vendas', '{"phone": "+5511888776655", "webhook_url": "https://autoflow.com/webhook/whatsapp"}', 'active', NOW(), NOW()),
    ('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'mercado_pago', 'Pagamentos ML', '{"access_token": "TEST-1234567890", "webhook_url": "https://autoflow.com/webhook/mercadopago"}', 'active', NOW(), NOW()),
    
    -- Serviços Pro integrations
    ('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'whatsapp_business', 'WhatsApp Atendimento', '{"phone": "+5511777665544", "webhook_url": "https://autoflow.com/webhook/whatsapp"}', 'active', NOW(), NOW()),
    ('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'google_calendar', 'Agenda Online', '{"calendar_id": "primary", "webhook_url": "https://autoflow.com/webhook/calendar"}', 'active', NOW(), NOW());

-- Seed Workflows
INSERT INTO workflows (id, organization_id, created_by, name, description, status, trigger_type, trigger_config, definition, executions_count, created_at, updated_at) VALUES
    -- TechStart Ltda workflows
    ('880e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 'Boas-vindas novos clientes', 'Envio automático de mensagem de boas-vindas via WhatsApp para novos clientes', 'active', 'webhook', '{"event": "new_customer", "source": "crm"}', '{"nodes": [{"id": "trigger", "type": "webhook"}, {"id": "whatsapp", "type": "whatsapp_send"}], "edges": [{"from": "trigger", "to": "whatsapp"}]}', 45, NOW(), NOW()),
    ('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', 'Follow-up vendas', 'Acompanhamento automático de leads após 3 dias sem resposta', 'active', 'schedule', '{"interval": "daily", "time": "09:00"}', '{"nodes": [{"id": "trigger", "type": "schedule"}, {"id": "check_leads", "type": "condition"}, {"id": "send_followup", "type": "whatsapp_send"}], "edges": [{"from": "trigger", "to": "check_leads"}, {"from": "check_leads", "to": "send_followup"}]}', 23, NOW(), NOW()),
    
    -- Comércio Digital ME workflows
    ('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003', 'Confirmação de pedido', 'Envio automático de confirmação de pedido via WhatsApp', 'active', 'webhook', '{"event": "order_created", "source": "ecommerce"}', '{"nodes": [{"id": "trigger", "type": "webhook"}, {"id": "format_message", "type": "template"}, {"id": "send_whatsapp", "type": "whatsapp_send"}], "edges": [{"from": "trigger", "to": "format_message"}, {"from": "format_message", "to": "send_whatsapp"}]}', 127, NOW(), NOW()),
    ('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003', 'Notificação pagamento aprovado', 'Notifica cliente quando pagamento é aprovado no Mercado Pago', 'active', 'webhook', '{"event": "payment_approved", "source": "mercado_pago"}', '{"nodes": [{"id": "trigger", "type": "webhook"}, {"id": "update_order", "type": "database_update"}, {"id": "notify_customer", "type": "whatsapp_send"}], "edges": [{"from": "trigger", "to": "update_order"}, {"from": "update_order", "to": "notify_customer"}]}', 89, NOW(), NOW()),
    
    -- Serviços Pro workflows
    ('880e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440005', 'Lembretes de consulta', 'Envia lembrete 24h antes da consulta agendada', 'active', 'schedule', '{"interval": "daily", "time": "10:00"}', '{"nodes": [{"id": "trigger", "type": "schedule"}, {"id": "check_appointments", "type": "google_calendar_check"}, {"id": "send_reminder", "type": "whatsapp_send"}], "edges": [{"from": "trigger", "to": "check_appointments"}, {"from": "check_appointments", "to": "send_reminder"}]}', 156, NOW(), NOW()),
    ('880e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440006', 'Pesquisa de satisfação', 'Envia pesquisa de satisfação 1 dia após atendimento', 'draft', 'webhook', '{"event": "service_completed", "source": "crm"}', '{"nodes": [{"id": "trigger", "type": "webhook"}, {"id": "delay", "type": "delay"}, {"id": "send_survey", "type": "whatsapp_send"}], "edges": [{"from": "trigger", "to": "delay"}, {"from": "delay", "to": "send_survey"}]}', 0, NOW(), NOW());

-- Seed Workflow Executions (recent executions for testing)
INSERT INTO workflow_executions (id, workflow_id, organization_id, status, trigger_data, execution_log, started_at, completed_at) VALUES
    ('990e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'completed', '{"customer_id": "12345", "customer_name": "Cliente Teste", "customer_phone": "+5511987654321"}', '[{"step": "trigger", "timestamp": "2024-01-01T10:00:00Z", "status": "success"}, {"step": "whatsapp_send", "timestamp": "2024-01-01T10:00:02Z", "status": "success", "message_id": "wamid.123"}]', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
    ('990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'completed', '{"order_id": "ORD-67890", "customer_phone": "+5511876543210", "total": "R$ 150,00"}', '[{"step": "trigger", "timestamp": "2024-01-01T14:30:00Z", "status": "success"}, {"step": "format_message", "timestamp": "2024-01-01T14:30:01Z", "status": "success"}, {"step": "send_whatsapp", "timestamp": "2024-01-01T14:30:03Z", "status": "success", "message_id": "wamid.456"}]', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes'),
    ('990e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'failed', '{"appointment_id": "APT-111", "customer_phone": "+5511765432109"}', '[{"step": "trigger", "timestamp": "2024-01-01T09:00:00Z", "status": "success"}, {"step": "check_appointments", "timestamp": "2024-01-01T09:00:01Z", "status": "success"}, {"step": "send_reminder", "timestamp": "2024-01-01T09:00:03Z", "status": "error", "error": "WhatsApp API rate limit exceeded"}]', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour');

-- Seed Audit Logs
INSERT INTO audit_logs (id, organization_id, user_id, action, resource_type, resource_id, details, ip_address, user_agent, created_at) VALUES
    ('aa0e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000', 'workflow.created', 'workflow', '880e8400-e29b-41d4-a716-446655440000', '{"workflow_name": "Boas-vindas novos clientes", "trigger_type": "webhook"}', '192.168.1.100', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', NOW() - INTERVAL '7 days'),
    ('aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003', 'integration.connected', 'integration', '770e8400-e29b-41d4-a716-446655440002', '{"integration_type": "whatsapp_business", "integration_name": "WhatsApp Vendas"}', '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', NOW() - INTERVAL '5 days'),
    ('aa0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440005', 'user.login', 'user', '660e8400-e29b-41d4-a716-446655440005', '{"login_method": "email_password", "success": true}', '192.168.1.102', 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)', NOW() - INTERVAL '1 hour'),
    ('aa0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440001', 'workflow.executed', 'workflow', '880e8400-e29b-41d4-a716-446655440001', '{"execution_id": "990e8400-e29b-41d4-a716-446655440000", "status": "completed", "duration_ms": 2150}', '192.168.1.100', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', NOW() - INTERVAL '2 hours');

-- Re-enable RLS
SET session_replication_role = DEFAULT;

-- Display seed summary
SELECT 
    'Organizations' as entity, COUNT(*) as count 
FROM organizations
UNION ALL
SELECT 
    'Users' as entity, COUNT(*) as count 
FROM users
UNION ALL
SELECT 
    'Workflows' as entity, COUNT(*) as count 
FROM workflows
UNION ALL
SELECT 
    'Integrations' as entity, COUNT(*) as count 
FROM integrations
UNION ALL
SELECT 
    'Workflow Executions' as entity, COUNT(*) as count 
FROM workflow_executions
UNION ALL
SELECT 
    'Audit Logs' as entity, COUNT(*) as count 
FROM audit_logs;