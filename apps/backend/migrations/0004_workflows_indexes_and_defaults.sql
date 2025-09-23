-- 0004_workflows_indexes_and_defaults.sql
-- Add indexes and ensure defaults for workflows-related tables

BEGIN;

-- Ensure canvas_data default (if column exists and default is not set)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workflows' AND column_name='canvas_data') THEN
        ALTER TABLE workflows ALTER COLUMN canvas_data SET DEFAULT '{}'::jsonb;
    END IF;
END$$;

-- Index for organization lookups
CREATE INDEX IF NOT EXISTS idx_workflows_organization_id ON workflows (organization_id);

-- Indexes for nodes and edges to speed up visual queries
CREATE INDEX IF NOT EXISTS idx_workflow_nodes_workflow_id ON workflow_nodes (workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_edges_workflow_id ON workflow_edges (workflow_id);

COMMIT;
