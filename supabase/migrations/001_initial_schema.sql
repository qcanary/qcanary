-- ============================================================
-- Qcanary — Initial Schema Migration
-- Run this in Supabase SQL Editor or via supabase db push
-- ============================================================

-- ── Enable required extensions ──────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLES
-- ============================================================

-- ── teams ───────────────────────────────────────────────────
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  clerk_org_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  plan_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE teams IS 'Customer organizations — one team per billing account';

-- ── projects ────────────────────────────────────────────────
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  environment TEXT NOT NULL DEFAULT 'production',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_team ON projects(team_id);

COMMENT ON TABLE projects IS 'Monitored projects — each has its own set of API keys and queues';

-- ── api_keys ────────────────────────────────────────────────
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  key_hash TEXT UNIQUE NOT NULL,
  key_prefix TEXT NOT NULL,
  label TEXT,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

CREATE INDEX idx_api_keys_project ON api_keys(project_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash) WHERE revoked_at IS NULL;

COMMENT ON TABLE api_keys IS 'Hashed API keys for agent authentication — plaintext never stored';

-- ── job_events ──────────────────────────────────────────────
CREATE TABLE job_events (
  id BIGSERIAL PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  queue_name TEXT NOT NULL,
  job_id TEXT NOT NULL,
  job_name TEXT,
  event_type TEXT NOT NULL,
  status TEXT NOT NULL,
  duration_ms INTEGER,
  attempts INTEGER,
  error_message TEXT,
  error_stack TEXT,
  environment TEXT,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_job_events_project_queue
  ON job_events(project_id, queue_name, timestamp DESC);

CREATE INDEX idx_job_events_status
  ON job_events(project_id, status, timestamp DESC);

CREATE INDEX idx_job_events_job_lookup
  ON job_events(project_id, queue_name, job_id);

COMMENT ON TABLE job_events IS 'Raw job lifecycle events forwarded by the agent';

-- ── queue_metrics_hourly ────────────────────────────────────
CREATE TABLE queue_metrics_hourly (
  id BIGSERIAL PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  queue_name TEXT NOT NULL,
  hour TIMESTAMPTZ NOT NULL,
  completed_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  stalled_count INTEGER NOT NULL DEFAULT 0,
  avg_duration_ms INTEGER,
  p95_duration_ms INTEGER,
  total_jobs INTEGER NOT NULL DEFAULT 0,
  UNIQUE(project_id, queue_name, hour)
);

CREATE INDEX idx_queue_metrics_lookup
  ON queue_metrics_hourly(project_id, queue_name, hour DESC);

COMMENT ON TABLE queue_metrics_hourly IS 'Pre-aggregated hourly metrics for dashboard charts';

-- ── alert_rules ─────────────────────────────────────────────
CREATE TABLE alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  queue_name TEXT,
  name TEXT NOT NULL,
  condition_type TEXT NOT NULL,
  threshold_value NUMERIC NOT NULL,
  window_minutes INTEGER NOT NULL DEFAULT 5,
  channel TEXT NOT NULL,
  destination TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_triggered_at TIMESTAMPTZ,
  cooldown_minutes INTEGER NOT NULL DEFAULT 15,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Validate condition_type values
ALTER TABLE alert_rules ADD CONSTRAINT chk_condition_type
  CHECK (condition_type IN ('failure_rate', 'no_activity', 'queue_depth', 'job_duration'));

-- Validate channel values
ALTER TABLE alert_rules ADD CONSTRAINT chk_channel
  CHECK (channel IN ('slack', 'email'));

CREATE INDEX idx_alert_rules_project ON alert_rules(project_id);

COMMENT ON TABLE alert_rules IS 'User-configured alert rules evaluated after each ingest';

-- ── alert_history ───────────────────────────────────────────
CREATE TABLE alert_history (
  id BIGSERIAL PRIMARY KEY,
  rule_id UUID NOT NULL REFERENCES alert_rules(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  details JSONB
);

CREATE INDEX idx_alert_history_project ON alert_history(project_id, triggered_at DESC);
CREATE INDEX idx_alert_history_rule ON alert_history(rule_id, triggered_at DESC);

COMMENT ON TABLE alert_history IS 'Log of every alert trigger — kept regardless of delivery success';

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- ── Upsert hourly metrics (called from ingest endpoint) ─────
CREATE OR REPLACE FUNCTION upsert_queue_metrics_hourly(
  p_project_id UUID,
  p_queue_name TEXT,
  p_hour TIMESTAMPTZ,
  p_completed INTEGER DEFAULT 0,
  p_failed INTEGER DEFAULT 0,
  p_stalled INTEGER DEFAULT 0,
  p_duration_ms INTEGER DEFAULT NULL,
  p_total INTEGER DEFAULT 0
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO queue_metrics_hourly (
    project_id, queue_name, hour,
    completed_count, failed_count, stalled_count,
    avg_duration_ms, total_jobs
  ) VALUES (
    p_project_id, p_queue_name, p_hour,
    p_completed, p_failed, p_stalled,
    p_duration_ms, p_total
  )
  ON CONFLICT (project_id, queue_name, hour)
  DO UPDATE SET
    completed_count = queue_metrics_hourly.completed_count + EXCLUDED.completed_count,
    failed_count    = queue_metrics_hourly.failed_count    + EXCLUDED.failed_count,
    stalled_count   = queue_metrics_hourly.stalled_count   + EXCLUDED.stalled_count,
    total_jobs      = queue_metrics_hourly.total_jobs       + EXCLUDED.total_jobs,
    -- Running weighted average for duration
    avg_duration_ms = CASE
      WHEN EXCLUDED.avg_duration_ms IS NOT NULL AND queue_metrics_hourly.avg_duration_ms IS NOT NULL
        THEN (
          (queue_metrics_hourly.avg_duration_ms * queue_metrics_hourly.total_jobs
           + EXCLUDED.avg_duration_ms * EXCLUDED.total_jobs)
          / NULLIF(queue_metrics_hourly.total_jobs + EXCLUDED.total_jobs, 0)
        )::INTEGER
      WHEN EXCLUDED.avg_duration_ms IS NOT NULL
        THEN EXCLUDED.avg_duration_ms
      ELSE queue_metrics_hourly.avg_duration_ms
    END;
END;
$$;

COMMENT ON FUNCTION upsert_queue_metrics_hourly IS 'Atomically increment hourly counters — called after each ingest batch';

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_metrics_hourly ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_history ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────
-- SERVICE ROLE BYPASS
-- The Express API uses the service_role key which bypasses RLS.
-- These policies protect against direct client access via the
-- anon key (e.g., Supabase Realtime subscriptions from the
-- Next.js frontend).
-- ────────────────────────────────────────────────────────────

-- ── teams policies ──────────────────────────────────────────
-- Users can only read their own team (matched via Clerk org_id in JWT)
CREATE POLICY "teams_select_own" ON teams
  FOR SELECT
  USING (
    clerk_org_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'org_id')
  );

-- Only service role can insert/update/delete teams
CREATE POLICY "teams_service_role_all" ON teams
  FOR ALL
  USING (
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role'
  );

-- ── projects policies ───────────────────────────────────────
-- Users can read projects belonging to their team
CREATE POLICY "projects_select_own_team" ON projects
  FOR SELECT
  USING (
    team_id IN (
      SELECT id FROM teams
      WHERE clerk_org_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'org_id')
    )
  );

-- Service role can do everything
CREATE POLICY "projects_service_role_all" ON projects
  FOR ALL
  USING (
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role'
  );

-- ── api_keys policies ───────────────────────────────────────
-- Users can read API keys for their team's projects (never see the hash)
CREATE POLICY "api_keys_select_own_team" ON api_keys
  FOR SELECT
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN teams t ON t.id = p.team_id
      WHERE t.clerk_org_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'org_id')
    )
  );

CREATE POLICY "api_keys_service_role_all" ON api_keys
  FOR ALL
  USING (
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role'
  );

-- ── job_events policies ────────────────────────────────────
-- Users can read job events for their team's projects
CREATE POLICY "job_events_select_own_team" ON job_events
  FOR SELECT
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN teams t ON t.id = p.team_id
      WHERE t.clerk_org_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'org_id')
    )
  );

CREATE POLICY "job_events_service_role_all" ON job_events
  FOR ALL
  USING (
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role'
  );

-- ── queue_metrics_hourly policies ──────────────────────────
CREATE POLICY "queue_metrics_select_own_team" ON queue_metrics_hourly
  FOR SELECT
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN teams t ON t.id = p.team_id
      WHERE t.clerk_org_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'org_id')
    )
  );

CREATE POLICY "queue_metrics_service_role_all" ON queue_metrics_hourly
  FOR ALL
  USING (
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role'
  );

-- ── alert_rules policies ───────────────────────────────────
CREATE POLICY "alert_rules_select_own_team" ON alert_rules
  FOR SELECT
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN teams t ON t.id = p.team_id
      WHERE t.clerk_org_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'org_id')
    )
  );

CREATE POLICY "alert_rules_service_role_all" ON alert_rules
  FOR ALL
  USING (
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role'
  );

-- ── alert_history policies ─────────────────────────────────
CREATE POLICY "alert_history_select_own_team" ON alert_history
  FOR SELECT
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN teams t ON t.id = p.team_id
      WHERE t.clerk_org_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'org_id')
    )
  );

CREATE POLICY "alert_history_service_role_all" ON alert_history
  FOR ALL
  USING (
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role'
  );

-- ============================================================
-- REALTIME (for live dashboard updates)
-- ============================================================

-- Enable realtime on job_events and queue_metrics_hourly
-- so the Next.js dashboard can subscribe to changes
ALTER PUBLICATION supabase_realtime ADD TABLE job_events;
ALTER PUBLICATION supabase_realtime ADD TABLE queue_metrics_hourly;
