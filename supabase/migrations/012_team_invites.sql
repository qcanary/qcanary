CREATE TABLE team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'engineer' CHECK (role IN ('admin', 'engineer', 'viewer')),
  invited_by TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(team_id, email)
);

CREATE INDEX idx_team_invites_token ON team_invites(token) WHERE accepted_at IS NULL;
CREATE INDEX idx_team_invites_team ON team_invites(team_id);

COMMENT ON TABLE team_invites IS 'Team member invitations with role-based access';
