-- ============================================================
-- Qcanary — Migration 003: Add webhook to channel constraint
-- ============================================================
-- The application supports alert delivery via webhook, but the
-- original migration (001) only allowed 'slack' and 'email'.
-- This migration replaces the constraint to include 'webhook'.
-- ============================================================

-- Drop the old constraint that only allows slack/email
ALTER TABLE alert_rules DROP CONSTRAINT IF EXISTS chk_channel;

-- Re-add with 'webhook' included
ALTER TABLE alert_rules ADD CONSTRAINT chk_channel
  CHECK (channel IN ('slack', 'email', 'webhook'));

COMMENT ON COLUMN alert_rules.channel IS 'Delivery channel: slack, email, or webhook';
