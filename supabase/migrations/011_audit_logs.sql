CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_team ON audit_logs(team_id, created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(team_id, action, created_at DESC);

COMMENT ON TABLE audit_logs IS 'Audit trail for all team actions — required for SOC 2 compliance';
