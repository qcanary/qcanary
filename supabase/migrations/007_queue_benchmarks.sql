-- ── queue_benchmarks ─────────────────────────────────────────
-- Stores pre-computed percentile distributions per queue category
-- Calculated daily via the benchmark cron job.
CREATE TABLE queue_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,       -- 'email', 'payment', 'webhook', etc.
  metric_name TEXT NOT NULL,    -- 'failure_rate', 'avg_duration_ms', etc.
  p10 DECIMAL,
  p25 DECIMAL,
  p50 DECIMAL,
  p75 DECIMAL,
  p90 DECIMAL,
  p95 DECIMAL,
  mean DECIMAL,
  stddev DECIMAL,
  sample_size INTEGER NOT NULL, -- how many queues contributed
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(category, metric_name, calculated_at)
);

CREATE INDEX idx_queue_benchmarks_category
  ON queue_benchmarks(category, calculated_at DESC);

COMMENT ON TABLE queue_benchmarks
  IS 'Anonymized aggregated benchmarks per queue category — recalculated daily';
