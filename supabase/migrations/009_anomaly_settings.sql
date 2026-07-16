-- Per-team anomaly detection configuration

CREATE TABLE anomaly_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT true,
  sensitivity TEXT NOT NULL DEFAULT 'normal' CHECK (sensitivity IN ('low', 'normal', 'high')),
  min_sample_days INTEGER NOT NULL DEFAULT 3 CHECK (min_sample_days >= 1 AND min_sample_days <= 30),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(team_id)
);

COMMENT ON TABLE anomaly_settings
  IS 'Per-team anomaly detection settings - one row per team';

ALTER TABLE anomaly_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anomaly_settings_select_own_team" ON anomaly_settings
  FOR SELECT
  USING (
    team_id IN (
      SELECT id FROM teams
      WHERE clerk_org_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'org_id')
    )
  );

CREATE POLICY "anomaly_settings_service_role_all" ON anomaly_settings
  FOR ALL
  USING (
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role'
  );

CREATE INDEX idx_anomaly_settings_team ON anomaly_settings(team_id);
