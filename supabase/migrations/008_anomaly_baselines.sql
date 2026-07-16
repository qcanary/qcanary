-- ── anomaly_baselines ─────────────────────────────────────────
-- Stores pre-computed statistical baselines per queue per hour
-- Used by the rule-based anomaly detection engine to compare current
-- metrics against historical norms.
--
-- Baselines are calculated hourly (at :15 past) for the same hour over
-- the last 7 days. E.g., 2pm baselines are computed from the last 7
-- days of 2pm data, giving 7 samples per metric.
--
-- Minimum sample size: 3 days of data before baselines are considered valid.
-- Below that threshold, the anomaly system reports "Building baseline..."
-- ================================================================

CREATE TABLE anomaly_baselines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  queue_name TEXT NOT NULL,
  hour INTEGER NOT NULL CHECK (hour >= 0 AND hour <= 23),
  metric_name TEXT NOT NULL CHECK (metric_name IN (
    'throughput', 'failure_rate', 'queue_depth', 'avg_duration', 'retry_rate'
  )),
  mean_value DECIMAL NOT NULL,
  median_value DECIMAL NOT NULL,
  max_value DECIMAL NOT NULL,
  min_value DECIMAL NOT NULL,
  sample_size INTEGER NOT NULL DEFAULT 0,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, queue_name, hour, metric_name)
);

CREATE INDEX idx_anomaly_baselines_project_queue
  ON anomaly_baselines(project_id, queue_name);
CREATE INDEX idx_anomaly_baselines_calculated_at
  ON anomaly_baselines(calculated_at DESC);

COMMENT ON TABLE anomaly_baselines
  IS 'Pre-computed statistical baselines for rule-based anomaly detection — refreshed hourly';
COMMENT ON COLUMN anomaly_baselines.metric_name
  IS 'One of: throughput, failure_rate, queue_depth, avg_duration, retry_rate';
COMMENT ON COLUMN anomaly_baselines.sample_size
  IS 'Number of data points used to compute the baseline (minimum 3 for validity)';
