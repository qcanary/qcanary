CREATE TABLE IF NOT EXISTS feedback_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  queue_count INTEGER NOT NULL,
  use_case TEXT NOT NULL,
  current_solution TEXT NOT NULL,
  reason TEXT,
  agrees_to_feedback BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for looking up by status
CREATE INDEX IF NOT EXISTS idx_feedback_applications_status ON feedback_applications(status);

-- Index for looking up by email
CREATE INDEX IF NOT EXISTS idx_feedback_applications_email ON feedback_applications(email);
