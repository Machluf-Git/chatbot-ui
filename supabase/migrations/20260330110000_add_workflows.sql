CREATE TABLE IF NOT EXISTS workflow_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) <= 200),
  description TEXT NOT NULL DEFAULT '' CHECK (char_length(description) <= 2000),
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('manual', 'schedule', 'webhook', 'event')),
  trigger_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  input_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workflow_template_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,
  step_key TEXT NOT NULL CHECK (char_length(step_key) <= 100),
  step_order INTEGER NOT NULL CHECK (step_order >= 0),
  step_type TEXT NOT NULL CHECK (
    step_type IN ('llm', 'tool', 'condition', 'approval', 'delay', 'webhook', 'end')
  ),
  title TEXT NOT NULL CHECK (char_length(title) <= 200),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  input_mapping JSONB NOT NULL DEFAULT '{}'::jsonb,
  output_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
  on_success_step_key TEXT CHECK (char_length(on_success_step_key) <= 100),
  on_failure_step_key TEXT CHECK (char_length(on_failure_step_key) <= 100),
  retry_max INTEGER NOT NULL DEFAULT 0 CHECK (retry_max >= 0),
  retry_backoff_seconds INTEGER NOT NULL DEFAULT 0 CHECK (retry_backoff_seconds >= 0),
  timeout_seconds INTEGER NOT NULL DEFAULT 300 CHECK (timeout_seconds > 0),
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (template_id, step_key),
  UNIQUE (template_id, step_order)
);

CREATE TABLE IF NOT EXISTS workflow_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES workflow_templates(id) ON DELETE SET NULL,
  template_version INTEGER NOT NULL CHECK (template_version > 0),
  template_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (
    status IN ('queued', 'running', 'waiting_approval', 'completed', 'failed', 'cancelled', 'timeout')
  ),
  trigger_source TEXT NOT NULL CHECK (
    trigger_source IN ('manual', 'schedule', 'webhook', 'api', 'system')
  ),
  trigger_ref TEXT CHECK (char_length(trigger_ref) <= 200),
  current_step_key TEXT CHECK (char_length(current_step_key) <= 100),
  input_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  context_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  output_payload JSONB,
  error_code TEXT CHECK (char_length(error_code) <= 100),
  error_message TEXT CHECK (char_length(error_message) <= 4000),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workflow_run_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID NOT NULL REFERENCES workflow_runs(id) ON DELETE CASCADE,
  template_step_id UUID REFERENCES workflow_template_steps(id) ON DELETE SET NULL,
  step_key TEXT NOT NULL CHECK (char_length(step_key) <= 100),
  attempt INTEGER NOT NULL DEFAULT 1 CHECK (attempt > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'running', 'waiting_approval', 'completed', 'failed', 'skipped', 'cancelled', 'timeout')
  ),
  input_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  output_payload JSONB,
  model_used TEXT CHECK (char_length(model_used) <= 200),
  tool_used TEXT CHECK (char_length(tool_used) <= 200),
  tokens_in INTEGER CHECK (tokens_in >= 0),
  tokens_out INTEGER CHECK (tokens_out >= 0),
  cost_usd NUMERIC(12, 6) CHECK (cost_usd >= 0),
  error_code TEXT CHECK (char_length(error_code) <= 100),
  error_message TEXT CHECK (char_length(error_message) <= 4000),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (run_id, step_key, attempt)
);

CREATE TABLE IF NOT EXISTS workflow_approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID NOT NULL REFERENCES workflow_runs(id) ON DELETE CASCADE,
  run_step_id UUID NOT NULL REFERENCES workflow_run_steps(id) ON DELETE CASCADE,
  requested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approver_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approver_group TEXT CHECK (char_length(approver_group) <= 200),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'approved', 'rejected', 'expired', 'cancelled')
  ),
  decision_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  decision_at TIMESTAMPTZ,
  decision_note TEXT CHECK (char_length(decision_note) <= 4000),
  expires_at TIMESTAMPTZ,
  approval_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workflow_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  run_id UUID NOT NULL REFERENCES workflow_runs(id) ON DELETE CASCADE,
  run_step_id UUID REFERENCES workflow_run_steps(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (char_length(event_type) <= 100),
  level TEXT NOT NULL DEFAULT 'info' CHECK (level IN ('debug', 'info', 'warning', 'error')),
  message TEXT NOT NULL CHECK (char_length(message) <= 4000),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  emitted_by_type TEXT NOT NULL CHECK (emitted_by_type IN ('system', 'user', 'agent', 'tool', 'webhook')),
  emitted_by_id TEXT CHECK (char_length(emitted_by_id) <= 200),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_workflow_templates_workspace_id ON workflow_templates (workspace_id);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_status ON workflow_templates (status);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_trigger_type ON workflow_templates (trigger_type);

CREATE INDEX IF NOT EXISTS idx_workflow_template_steps_template_id ON workflow_template_steps (template_id);
CREATE INDEX IF NOT EXISTS idx_workflow_template_steps_step_type ON workflow_template_steps (step_type);

CREATE INDEX IF NOT EXISTS idx_workflow_runs_workspace_id ON workflow_runs (workspace_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_template_id ON workflow_runs (template_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_status ON workflow_runs (status);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_created_at ON workflow_runs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_workflow_run_steps_run_id ON workflow_run_steps (run_id);
CREATE INDEX IF NOT EXISTS idx_workflow_run_steps_template_step_id ON workflow_run_steps (template_step_id);
CREATE INDEX IF NOT EXISTS idx_workflow_run_steps_status ON workflow_run_steps (status);

CREATE INDEX IF NOT EXISTS idx_workflow_approvals_run_id ON workflow_approvals (run_id);
CREATE INDEX IF NOT EXISTS idx_workflow_approvals_run_step_id ON workflow_approvals (run_step_id);
CREATE INDEX IF NOT EXISTS idx_workflow_approvals_status ON workflow_approvals (status);
CREATE INDEX IF NOT EXISTS idx_workflow_approvals_approver_user_id ON workflow_approvals (approver_user_id);

CREATE INDEX IF NOT EXISTS idx_workflow_events_run_id ON workflow_events (run_id);
CREATE INDEX IF NOT EXISTS idx_workflow_events_run_step_id ON workflow_events (run_step_id);
CREATE INDEX IF NOT EXISTS idx_workflow_events_occurred_at ON workflow_events (occurred_at DESC);

DROP TRIGGER IF EXISTS update_workflow_templates_updated_at ON workflow_templates;
CREATE TRIGGER update_workflow_templates_updated_at
BEFORE UPDATE ON workflow_templates
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_workflow_template_steps_updated_at ON workflow_template_steps;
CREATE TRIGGER update_workflow_template_steps_updated_at
BEFORE UPDATE ON workflow_template_steps
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_workflow_runs_updated_at ON workflow_runs;
CREATE TRIGGER update_workflow_runs_updated_at
BEFORE UPDATE ON workflow_runs
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_workflow_run_steps_updated_at ON workflow_run_steps;
CREATE TRIGGER update_workflow_run_steps_updated_at
BEFORE UPDATE ON workflow_run_steps
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_workflow_approvals_updated_at ON workflow_approvals;
CREATE TRIGGER update_workflow_approvals_updated_at
BEFORE UPDATE ON workflow_approvals
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_template_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_run_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to own workflow_templates"
ON workflow_templates
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM workspaces
    WHERE workspaces.id = workflow_templates.workspace_id
      AND workspaces.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM workspaces
    WHERE workspaces.id = workflow_templates.workspace_id
      AND workspaces.user_id = auth.uid()
  )
);

CREATE POLICY "Allow full access to own workflow_template_steps"
ON workflow_template_steps
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM workflow_templates
    JOIN workspaces ON workspaces.id = workflow_templates.workspace_id
    WHERE workflow_templates.id = workflow_template_steps.template_id
      AND workspaces.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM workflow_templates
    JOIN workspaces ON workspaces.id = workflow_templates.workspace_id
    WHERE workflow_templates.id = workflow_template_steps.template_id
      AND workspaces.user_id = auth.uid()
  )
);

CREATE POLICY "Allow full access to own workflow_runs"
ON workflow_runs
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM workspaces
    WHERE workspaces.id = workflow_runs.workspace_id
      AND workspaces.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM workspaces
    WHERE workspaces.id = workflow_runs.workspace_id
      AND workspaces.user_id = auth.uid()
  )
);

CREATE POLICY "Allow full access to own workflow_run_steps"
ON workflow_run_steps
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM workflow_runs
    JOIN workspaces ON workspaces.id = workflow_runs.workspace_id
    WHERE workflow_runs.id = workflow_run_steps.run_id
      AND workspaces.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM workflow_runs
    JOIN workspaces ON workspaces.id = workflow_runs.workspace_id
    WHERE workflow_runs.id = workflow_run_steps.run_id
      AND workspaces.user_id = auth.uid()
  )
);

CREATE POLICY "Allow full access to own workflow_approvals"
ON workflow_approvals
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM workflow_runs
    JOIN workspaces ON workspaces.id = workflow_runs.workspace_id
    WHERE workflow_runs.id = workflow_approvals.run_id
      AND workspaces.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM workflow_runs
    JOIN workspaces ON workspaces.id = workflow_runs.workspace_id
    WHERE workflow_runs.id = workflow_approvals.run_id
      AND workspaces.user_id = auth.uid()
  )
);

CREATE POLICY "Allow read access to own workflow_events"
ON workflow_events
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM workflow_runs
    JOIN workspaces ON workspaces.id = workflow_runs.workspace_id
    WHERE workflow_runs.id = workflow_events.run_id
      AND workspaces.user_id = auth.uid()
  )
);

CREATE POLICY "Allow insert access to own workflow_events"
ON workflow_events
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM workflow_runs
    JOIN workspaces ON workspaces.id = workflow_runs.workspace_id
    WHERE workflow_runs.id = workflow_events.run_id
      AND workspaces.user_id = auth.uid()
  )
);
