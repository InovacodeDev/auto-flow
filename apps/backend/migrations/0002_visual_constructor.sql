-- Migração para suporte ao Visual Constructor (ReactFlow)

-- Adicionar campos para visual constructor na tabela workflows
ALTER TABLE workflows 
ADD COLUMN canvas_data JSONB DEFAULT '{}',
ALTER COLUMN triggers SET DEFAULT '[]',
ALTER COLUMN actions SET DEFAULT '[]';

-- Criar tabela workflow_nodes para nodes do ReactFlow
CREATE TABLE workflow_nodes (
    id VARCHAR(255) PRIMARY KEY,
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    node_type VARCHAR(100) NOT NULL,
    position JSONB NOT NULL,
    data JSONB NOT NULL,
    style JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Criar tabela workflow_edges para conexões do ReactFlow
CREATE TABLE workflow_edges (
    id VARCHAR(255) PRIMARY KEY,
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    source VARCHAR(255) NOT NULL,
    target VARCHAR(255) NOT NULL,
    source_handle VARCHAR(100),
    target_handle VARCHAR(100),
    type VARCHAR(50) DEFAULT 'default',
    data JSONB DEFAULT '{}',
    style JSONB DEFAULT '{}',
    animated BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Criar índices para performance
CREATE INDEX idx_workflow_nodes_workflow_id ON workflow_nodes(workflow_id);
CREATE INDEX idx_workflow_edges_workflow_id ON workflow_edges(workflow_id);
CREATE INDEX idx_workflow_edges_source ON workflow_edges(source);
CREATE INDEX idx_workflow_edges_target ON workflow_edges(target);

-- Atualizar timestamps automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_workflow_nodes_updated_at 
    BEFORE UPDATE ON workflow_nodes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_edges_updated_at 
    BEFORE UPDATE ON workflow_edges 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();