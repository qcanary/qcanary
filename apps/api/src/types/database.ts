/**
 * Qcanary Database Types
 *
 * Manually authored to match the Supabase schema in
 * supabase/migrations/001_initial_schema.sql
 *
 * These types are consumed by the Supabase client to provide
 * end-to-end type safety on all database operations.
 */

// ── Database root type ─────────────────────────────────────
export interface Database {
  public: {
    Tables: {
      teams:      { Row: TeamRow;         Insert: TeamInsert;         Update: TeamUpdate;         Relationships: [] };
      projects:   { Row: ProjectRow;       Insert: ProjectInsert;      Update: ProjectUpdate;      Relationships: [] };
      api_keys:   { Row: ApiKeyRow;        Insert: ApiKeyInsert;       Update: ApiKeyUpdate;        Relationships: [] };
      job_events: { Row: JobEventRow;      Insert: JobEventInsert;     Update: JobEventUpdate;      Relationships: [] };
      queue_metrics_hourly: { Row: QueueMetricsHourlyRow; Insert: QueueMetricsHourlyInsert; Update: QueueMetricsHourlyUpdate; Relationships: [] };
      alert_rules:         { Row: AlertRuleRow;    Insert: AlertRuleInsert;    Update: AlertRuleUpdate;         Relationships: [] };
      alert_history:       { Row: AlertHistoryRow;  Insert: AlertHistoryInsert;  Update: AlertHistoryUpdate;       Relationships: [] };
      feedback_applications: { Row: FeedbackApplicationRow; Insert: FeedbackApplicationInsert; Update: FeedbackApplicationUpdate; Relationships: [] };
      testimonials:    { Row: TestimonialRow;    Insert: TestimonialInsert;    Update: TestimonialUpdate;    Relationships: [] };
      enterprise_inquiries: { Row: EnterpriseInquiryRow; Insert: EnterpriseInquiryInsert; Update: EnterpriseInquiryUpdate; Relationships: [] };
    };
    Views: Record<string, never>;
    Functions: {
      upsert_queue_metrics_hourly: {
        Args: {
          p_project_id: string;
          p_queue_name: string;
          p_hour: string;
          p_completed?: number;
          p_failed?: number;
          p_stalled?: number;
          p_duration_ms?: number | null;
          p_total?: number;
        };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
  };
}

// ── Plan type ──────────────────────────────────────────────
export type Plan = 'free' | 'starter' | 'pro';

// ── Condition type for alerts ──────────────────────────────
export type ConditionType = 'failure_rate' | 'no_activity' | 'queue_depth' | 'job_duration';

// ── Alert channel ──────────────────────────────────────────
export type AlertChannel = 'slack' | 'email' | 'webhook';

// ── Job event type (from BullMQ) ───────────────────────────
export type JobEventType =
  | 'completed'
  | 'failed'
  | 'active'
  | 'delayed'
  | 'waiting'
  | 'stalled'
  | 'progress';

// ── Job status ─────────────────────────────────────────────
export type JobStatus =
  | 'completed'
  | 'failed'
  | 'active'
  | 'delayed'
  | 'waiting'
  | 'stalled';

// ============================================================
// TABLE ROW TYPES (what you get back from SELECT)
// ============================================================

export interface TeamRow {
  id: string;
  name: string;
  clerk_org_id: string | null;
  stripe_customer_id: string | null;
  plan: string;
  plan_expires_at: string | null;
  dodo_subscription_id: string | null;
  created_at: string;
}

export interface ProjectRow {
  id: string;
  team_id: string;
  name: string;
  environment: string;
  created_at: string;
}

export interface ApiKeyRow {
  id: string;
  project_id: string;
  key_hash: string;
  key_prefix: string;
  label: string | null;
  last_used_at: string | null;
  created_at: string;
  revoked_at: string | null;
}

export interface JobEventRow {
  id: number;
  project_id: string;
  queue_name: string;
  job_id: string;
  job_name: string | null;
  event_type: string;
  status: string;
  duration_ms: number | null;
  attempts: number | null;
  error_message: string | null;
  error_stack: string | null;
  environment: string | null;
  timestamp: string;
  created_at: string;
}

export interface QueueMetricsHourlyRow {
  id: number;
  project_id: string;
  queue_name: string;
  hour: string;
  completed_count: number;
  failed_count: number;
  stalled_count: number;
  avg_duration_ms: number | null;
  p95_duration_ms: number | null;
  total_jobs: number;
}

export interface AlertRuleRow {
  id: string;
  project_id: string;
  queue_name: string | null;
  name: string;
  condition_type: string;
  threshold_value: number;
  window_minutes: number;
  channel: string;
  destination: string;
  is_active: boolean;
  last_triggered_at: string | null;
  cooldown_minutes: number;
  created_at: string;
}

export interface AlertHistoryRow {
  id: number;
  rule_id: string;
  project_id: string;
  triggered_at: string;
  resolved_at: string | null;
  details: Record<string, unknown> | null;
}

// ============================================================
// TABLE INSERT TYPES (what you pass to INSERT)
// ============================================================

export interface TeamInsert {
  id?: string;
  name: string;
  clerk_org_id?: string | null;
  stripe_customer_id?: string | null;
  plan?: string;
  plan_expires_at?: string | null;
  dodo_subscription_id?: string | null;
  created_at?: string;
}

export interface ProjectInsert {
  id?: string;
  team_id: string;
  name: string;
  environment?: string;
  created_at?: string;
}

export interface ApiKeyInsert {
  id?: string;
  project_id: string;
  key_hash: string;
  key_prefix: string;
  label?: string | null;
  last_used_at?: string | null;
  created_at?: string;
  revoked_at?: string | null;
}

export interface JobEventInsert {
  id?: number;
  project_id: string;
  queue_name: string;
  job_id: string;
  job_name?: string | null;
  event_type: string;
  status: string;
  duration_ms?: number | null;
  attempts?: number | null;
  error_message?: string | null;
  error_stack?: string | null;
  environment?: string | null;
  timestamp: string;
  created_at?: string;
}

export interface QueueMetricsHourlyInsert {
  id?: number;
  project_id: string;
  queue_name: string;
  hour: string;
  completed_count?: number;
  failed_count?: number;
  stalled_count?: number;
  avg_duration_ms?: number | null;
  p95_duration_ms?: number | null;
  total_jobs?: number;
}

export interface AlertRuleInsert {
  id?: string;
  project_id: string;
  queue_name?: string | null;
  name: string;
  condition_type: string;
  threshold_value: number;
  window_minutes?: number;
  channel: string;
  destination: string;
  is_active?: boolean;
  last_triggered_at?: string | null;
  cooldown_minutes?: number;
  created_at?: string;
}

export interface AlertHistoryInsert {
  id?: number;
  rule_id: string;
  project_id: string;
  triggered_at?: string;
  resolved_at?: string | null;
  details?: Record<string, unknown> | null;
}

// ============================================================
// TABLE UPDATE TYPES (what you pass to UPDATE)
// ============================================================

export interface TeamUpdate {
  id?: string;
  name?: string;
  clerk_org_id?: string | null;
  stripe_customer_id?: string | null;
  plan?: string;
  plan_expires_at?: string | null;
  dodo_subscription_id?: string | null;
  created_at?: string;
}

export interface ProjectUpdate {
  id?: string;
  team_id?: string;
  name?: string;
  environment?: string;
  created_at?: string;
}

export interface ApiKeyUpdate {
  id?: string;
  project_id?: string;
  key_hash?: string;
  key_prefix?: string;
  label?: string | null;
  last_used_at?: string | null;
  created_at?: string;
  revoked_at?: string | null;
}

export interface JobEventUpdate {
  id?: number;
  project_id?: string;
  queue_name?: string;
  job_id?: string;
  job_name?: string | null;
  event_type?: string;
  status?: string;
  duration_ms?: number | null;
  attempts?: number | null;
  error_message?: string | null;
  error_stack?: string | null;
  environment?: string | null;
  timestamp?: string;
  created_at?: string;
}

export interface QueueMetricsHourlyUpdate {
  id?: number;
  project_id?: string;
  queue_name?: string;
  hour?: string;
  completed_count?: number;
  failed_count?: number;
  stalled_count?: number;
  avg_duration_ms?: number | null;
  p95_duration_ms?: number | null;
  total_jobs?: number;
}

export interface AlertRuleUpdate {
  id?: string;
  project_id?: string;
  queue_name?: string | null;
  name?: string;
  condition_type?: string;
  threshold_value?: number;
  window_minutes?: number;
  channel?: string;
  destination?: string;
  is_active?: boolean;
  last_triggered_at?: string | null;
  cooldown_minutes?: number;
  created_at?: string;
}

export interface AlertHistoryUpdate {
  id?: number;
  rule_id?: string;
  project_id?: string;
  triggered_at?: string;
  resolved_at?: string | null;
  details?: Record<string, unknown> | null;
}

// ============================================================
// FEEDBACK APPLICATION TYPES
// ============================================================

export interface FeedbackApplicationRow {
  id: string;
  name: string;
  email: string;
  company: string;
  queue_count: number;
  use_case: string;
  current_solution: string;
  reason: string | null;
  agrees_to_feedback: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface FeedbackApplicationInsert {
  id?: string;
  name: string;
  email: string;
  company: string;
  queue_count: number;
  use_case: string;
  current_solution: string;
  reason?: string | null;
  agrees_to_feedback?: boolean;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FeedbackApplicationUpdate {
  id?: string;
  name?: string;
  email?: string;
  company?: string;
  queue_count?: number;
  use_case?: string;
  current_solution?: string;
  reason?: string | null;
  agrees_to_feedback?: boolean;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================================
// TESTIMONIAL TYPES
// ============================================================

export interface TestimonialRow {
  id: string;
  name: string;
  title: string;
  company: string;
  linkedin_url: string | null;
  testimonial: string;
  recommendation: 'definitely' | 'probably' | 'maybe' | 'no';
  can_display: boolean;
  can_use_logo: boolean;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  edited_quote: string | null;
  created_at: string;
  updated_at: string;
}

export interface TestimonialInsert {
  id?: string;
  name: string;
  title: string;
  company: string;
  linkedin_url?: string | null;
  testimonial: string;
  recommendation: 'definitely' | 'probably' | 'maybe' | 'no';
  can_display?: boolean;
  can_use_logo?: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string | null;
  edited_quote?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface TestimonialUpdate {
  id?: string;
  name?: string;
  title?: string;
  company?: string;
  linkedin_url?: string | null;
  testimonial?: string;
  recommendation?: 'definitely' | 'probably' | 'maybe' | 'no';
  can_display?: boolean;
  can_use_logo?: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string | null;
  edited_quote?: string | null;
  created_at?: string;
  updated_at?: string;
}

// ============================================================
// ENTERPRISE INQUIRY TYPES
// ============================================================

export interface EnterpriseInquiryRow {
  id: string;
  name: string;
  email: string;
  company: string;
  team_size: string;
  industry: string;
  current_setup: string;
  reason: string | null;
  deployment: string | null;
  timeline: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface EnterpriseInquiryInsert {
  id?: string;
  name: string;
  email: string;
  company: string;
  team_size: string;
  industry: string;
  current_setup: string;
  reason?: string | null;
  deployment?: string | null;
  timeline?: string | null;
  status?: string;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface EnterpriseInquiryUpdate {
  id?: string;
  name?: string;
  email?: string;
  company?: string;
  team_size?: string;
  industry?: string;
  current_setup?: string;
  reason?: string | null;
  deployment?: string | null;
  timeline?: string | null;
  status?: string;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

// ============================================================
// CONVENIENCE TYPES (used across the API codebase)
// ============================================================

/** A team with its projects pre-loaded */
export interface TeamWithProjects extends TeamRow {
  projects: ProjectRow[];
}

/** An API key row without the hash — safe to return to clients */
export type ApiKeySafe = Omit<ApiKeyRow, 'key_hash'>;

/** Queue summary derived from job_events (used in queue list endpoint) */
export interface QueueSummary {
  queue_name: string;
  total_jobs: number;
  completed: number;
  failed: number;
  active: number;
  failure_rate: number;
  avg_duration_ms: number | null;
  last_event_at: string | null;
}

/** Alert details stored in alert_history.details JSONB column */
export interface AlertDetails {
  rule_name: string;
  condition_type: ConditionType;
  threshold_value: number;
  actual_value: number;
  queue_name: string | null;
  window_minutes: number;
  channel: AlertChannel;
  destination: string;
  delivery_success: boolean;
  delivery_error?: string;
}
