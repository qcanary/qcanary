-- ============================================================
-- Qcanary — Seed Data for Local Development
-- Run AFTER the migration has been applied
-- ============================================================

-- Enable pgcrypto extension for digest() function used in API key hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── Test Team ───────────────────────────────────────────────
-- Fixed UUID so we can reference it in other seeds
INSERT INTO teams (id, name, clerk_org_id, plan)
VALUES (
  'a1b2c3d4-0000-4000-8000-000000000001',
  'Qcanary Dev Team',
  'org_test_dev_12345',
  'pro'
)
ON CONFLICT (clerk_org_id) DO NOTHING;

-- ── Test Project ────────────────────────────────────────────
INSERT INTO projects (id, team_id, name, environment)
VALUES (
  'b2c3d4e5-0000-4000-8000-000000000001',
  'a1b2c3d4-0000-4000-8000-000000000001',
  'My Test App',
  'production'
)
ON CONFLICT (id) DO NOTHING;

-- ── Test API Key ────────────────────────────────────────────
-- Plaintext key: qc_test_sk_1234567890abcdef1234567890abcdef
-- SHA-256 hash of the above (pre-computed):
--   echo -n "qc_test_sk_1234567890abcdef1234567890abcdef" | sha256sum
--   => 6d7820b08476bea5c0f6c49e3826c44f4d48c0e5a6a3c3d0a58c6c8e0b4f2a1d
--
-- For local development, we use the pgcrypto digest function
-- to hash at insert time so the hash is always consistent.
INSERT INTO api_keys (id, project_id, key_hash, key_prefix, label)
VALUES (
  'c3d4e5f6-0000-4000-8000-000000000001',
  'b2c3d4e5-0000-4000-8000-000000000001',
  encode(digest('qc_test_sk_1234567890abcdef1234567890abcdef', 'sha256'), 'hex'),
  'qc_test_sk_',
  'Development key'
)
ON CONFLICT (id) DO NOTHING;

-- ── Sample Job Events ───────────────────────────────────────
-- A mix of completed and failed events across two queues
INSERT INTO job_events (project_id, queue_name, job_id, job_name, event_type, status, duration_ms, attempts, timestamp)
VALUES
  -- email-queue: 8 completed, 2 failed
  ('b2c3d4e5-0000-4000-8000-000000000001', 'email-queue', 'job-001', 'sendWelcomeEmail', 'completed', 'completed', 1245, 1, NOW() - INTERVAL '2 hours'),
  ('b2c3d4e5-0000-4000-8000-000000000001', 'email-queue', 'job-002', 'sendWelcomeEmail', 'completed', 'completed', 980, 1, NOW() - INTERVAL '1 hour 55 minutes'),
  ('b2c3d4e5-0000-4000-8000-000000000001', 'email-queue', 'job-003', 'sendPasswordReset', 'completed', 'completed', 1100, 1, NOW() - INTERVAL '1 hour 50 minutes'),
  ('b2c3d4e5-0000-4000-8000-000000000001', 'email-queue', 'job-004', 'sendWelcomeEmail', 'completed', 'completed', 1340, 1, NOW() - INTERVAL '1 hour 40 minutes'),
  ('b2c3d4e5-0000-4000-8000-000000000001', 'email-queue', 'job-005', 'sendInvoice', 'failed', 'failed', 5002, 3, NOW() - INTERVAL '1 hour 30 minutes'),
  ('b2c3d4e5-0000-4000-8000-000000000001', 'email-queue', 'job-006', 'sendWelcomeEmail', 'completed', 'completed', 1050, 1, NOW() - INTERVAL '1 hour 20 minutes'),
  ('b2c3d4e5-0000-4000-8000-000000000001', 'email-queue', 'job-007', 'sendPasswordReset', 'completed', 'completed', 920, 1, NOW() - INTERVAL '1 hour 10 minutes'),
  ('b2c3d4e5-0000-4000-8000-000000000001', 'email-queue', 'job-008', 'sendInvoice', 'failed', 'failed', 5001, 3, NOW() - INTERVAL '1 hour'),
  ('b2c3d4e5-0000-4000-8000-000000000001', 'email-queue', 'job-009', 'sendWelcomeEmail', 'completed', 'completed', 1190, 1, NOW() - INTERVAL '50 minutes'),
  ('b2c3d4e5-0000-4000-8000-000000000001', 'email-queue', 'job-010', 'sendPasswordReset', 'completed', 'completed', 870, 1, NOW() - INTERVAL '40 minutes'),

  -- pdf-generation: 5 completed, 1 failed
  ('b2c3d4e5-0000-4000-8000-000000000001', 'pdf-generation', 'job-101', 'generateReport', 'completed', 'completed', 3200, 1, NOW() - INTERVAL '3 hours'),
  ('b2c3d4e5-0000-4000-8000-000000000001', 'pdf-generation', 'job-102', 'generateReport', 'completed', 'completed', 2800, 1, NOW() - INTERVAL '2 hours 30 minutes'),
  ('b2c3d4e5-0000-4000-8000-000000000001', 'pdf-generation', 'job-103', 'generateInvoicePDF', 'failed', 'failed', 10000, 3, NOW() - INTERVAL '2 hours'),
  ('b2c3d4e5-0000-4000-8000-000000000001', 'pdf-generation', 'job-104', 'generateReport', 'completed', 'completed', 2950, 1, NOW() - INTERVAL '1 hour 30 minutes'),
  ('b2c3d4e5-0000-4000-8000-000000000001', 'pdf-generation', 'job-105', 'generateReport', 'completed', 'completed', 3100, 1, NOW() - INTERVAL '1 hour'),
  ('b2c3d4e5-0000-4000-8000-000000000001', 'pdf-generation', 'job-106', 'generateInvoicePDF', 'completed', 'completed', 4200, 1, NOW() - INTERVAL '30 minutes');

-- Add error details to the failed jobs
UPDATE job_events
SET error_message = 'SMTP connection timeout: Could not connect to smtp.sendgrid.net:587',
    error_stack = E'Error: SMTP connection timeout\n    at SMTPConnection.connect (node_modules/nodemailer/lib/smtp-connection/index.js:209:26)\n    at SMTPTransport._connect (node_modules/nodemailer/lib/smtp-transport/index.js:125:18)\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)\n    at EmailService.send (src/services/email.ts:42:5)\n    at Object.process (src/workers/email.worker.ts:18:3)'
WHERE queue_name = 'email-queue' AND status = 'failed';

UPDATE job_events
SET error_message = 'Puppeteer: Navigation timeout of 30000ms exceeded',
    error_stack = E'TimeoutError: Navigation timeout of 30000ms exceeded\n    at FrameManager.navigateFrame (node_modules/puppeteer-core/lib/cjs/puppeteer/common/FrameManager.js:124:21)\n    at Frame.goto (node_modules/puppeteer-core/lib/cjs/puppeteer/common/Frame.js:261:16)\n    at PDFGenerator.render (src/services/pdf.ts:67:5)\n    at Object.process (src/workers/pdf.worker.ts:23:3)'
WHERE queue_name = 'pdf-generation' AND status = 'failed';

-- ── Sample Hourly Metrics ───────────────────────────────────
INSERT INTO queue_metrics_hourly (project_id, queue_name, hour, completed_count, failed_count, stalled_count, avg_duration_ms, total_jobs)
VALUES
  ('b2c3d4e5-0000-4000-8000-000000000001', 'email-queue', date_trunc('hour', NOW() - INTERVAL '2 hours'), 4, 1, 0, 1166, 5),
  ('b2c3d4e5-0000-4000-8000-000000000001', 'email-queue', date_trunc('hour', NOW() - INTERVAL '1 hour'), 4, 1, 0, 1008, 5),
  ('b2c3d4e5-0000-4000-8000-000000000001', 'pdf-generation', date_trunc('hour', NOW() - INTERVAL '3 hours'), 2, 0, 0, 3000, 2),
  ('b2c3d4e5-0000-4000-8000-000000000001', 'pdf-generation', date_trunc('hour', NOW() - INTERVAL '2 hours'), 1, 1, 0, 6400, 2),
  ('b2c3d4e5-0000-4000-8000-000000000001', 'pdf-generation', date_trunc('hour', NOW() - INTERVAL '1 hour'), 2, 0, 0, 3025, 2),
  ('b2c3d4e5-0000-4000-8000-000000000001', 'pdf-generation', date_trunc('hour', NOW()), 1, 0, 0, 4200, 1);

-- ── Sample Alert Rule ───────────────────────────────────────
INSERT INTO alert_rules (id, project_id, queue_name, name, condition_type, threshold_value, window_minutes, channel, destination, is_active, cooldown_minutes)
VALUES (
  'd4e5f6a7-0000-4000-8000-000000000001',
  'b2c3d4e5-0000-4000-8000-000000000001',
  'email-queue',
  'High failure rate on email-queue',
  'failure_rate',
  25,
  5,
  'slack',
  'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
  TRUE,
  15
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- VERIFICATION QUERIES
-- Run these after seeding to confirm data is correct
-- ============================================================
-- SELECT count(*) AS team_count FROM teams;                    -- expect 1
-- SELECT count(*) AS project_count FROM projects;              -- expect 1
-- SELECT count(*) AS key_count FROM api_keys;                  -- expect 1
-- SELECT count(*) AS event_count FROM job_events;              -- expect 16
-- SELECT count(*) AS metric_count FROM queue_metrics_hourly;   -- expect 6
-- SELECT count(*) AS rule_count FROM alert_rules;              -- expect 1
