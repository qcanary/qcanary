CREATE TABLE enterprise_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  team_size TEXT NOT NULL,
  industry TEXT NOT NULL,
  current_setup TEXT NOT NULL,
  reason TEXT,
  deployment TEXT,
  timeline TEXT,
  status TEXT NOT NULL DEFAULT 'new', -- new, contacted, qualified, closed-won, closed-lost
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_enterprise_inquiries_status ON enterprise_inquiries(status);
CREATE INDEX idx_enterprise_inquiries_created_at ON enterprise_inquiries(created_at DESC);
