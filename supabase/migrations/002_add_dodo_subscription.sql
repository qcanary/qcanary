-- ============================================================
-- Qcanary — Migration 002: Add Dodo subscription ID to teams
-- ============================================================

-- Add dodo_subscription_id column for Dodo Payments (replaces stripe_customer_id)
ALTER TABLE teams
  ADD COLUMN IF NOT EXISTS dodo_subscription_id TEXT;

COMMENT ON COLUMN teams.dodo_subscription_id IS 'Dodo Payments subscription ID for billing management';

-- Mark stripe_customer_id as deprecated (kept for backward compatibility)
COMMENT ON COLUMN teams.stripe_customer_id IS 'Deprecated: use dodo_subscription_id instead';
