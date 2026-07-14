CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  linkedin_url TEXT,
  testimonial TEXT NOT NULL,
  recommendation TEXT NOT NULL CHECK (recommendation IN ('definitely', 'probably', 'maybe', 'no')),
  can_display BOOLEAN NOT NULL DEFAULT false,
  can_use_logo BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  edited_quote TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_testimonials_status ON testimonials(status);
CREATE INDEX idx_testimonials_created_at ON testimonials(created_at DESC);
