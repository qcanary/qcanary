/**
 * /v1/projects/:id/alerts — Alert rules CRUD + test delivery
 * Team scoping: Clerk JWT-derived org -> teams.clerk_org_id
 */

import express from 'express';
import type { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { buildTestMessage, deliverEmail, deliverSlack, deliverWebhook, escapeHtml } from '../lib/alertDelivery';
import type { AlertRuleInsert, AlertRuleRow, AlertRuleUpdate } from '../types/database';
import type { DashboardAuthedRequest } from '../middleware/dashboardAuth';
import { insertRow, updateRows } from '../lib/typedSupabase';

const router = express.Router();

const CONDITION_TYPES = new Set([
  'failure_rate',
  'no_activity',
  'queue_depth',
  'job_duration',
]);

const CHANNELS = new Set(['slack', 'email', 'webhook']);

interface ProjectOwnershipRecord {
  id: string;
}

function errorResponse(
  res: Response,
  statusCode: number,
  code: string,
  message: string
): void {
  res.status(statusCode).json({
    success: false,
    error: { code, message },
  });
}

function requireTeamContext(req: DashboardAuthedRequest, res: Response): string | null {
  const teamId = typeof req.teamId === 'string' ? req.teamId : '';
  if (!teamId) {
    errorResponse(res, 401, 'UNAUTHORIZED', 'Unauthorized');
    return null;
  }
  return teamId;
}

async function ensureProjectOwnership(
  projectId: string,
  teamId: string
): Promise<{ ok: true } | { ok: false; statusCode: number; code: string; message: string }> {
  const { data, error } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('team_id', teamId)
    .maybeSingle();

  const project = data as ProjectOwnershipRecord | null;

  if (error) {
    return {
      ok: false,
      statusCode: 500,
      code: 'PROJECT_FETCH_FAILED',
      message: 'Failed to validate project',
    };
  }

  if (!project) {
    return {
      ok: false,
      statusCode: 404,
      code: 'PROJECT_NOT_FOUND',
      message: 'Project not found',
    };
  }

  return { ok: true };
}

function serializeRule(row: AlertRuleRow) {
  return {
    id: row.id,
    projectId: row.project_id,
    queueName: row.queue_name,
    name: row.name,
    conditionType: row.condition_type,
    thresholdValue: numericThreshold(row.threshold_value),
    windowMinutes: row.window_minutes,
    channel: row.channel,
    destination: row.destination,
    isActive: row.is_active,
    lastTriggeredAt: row.last_triggered_at,
    cooldownMinutes: row.cooldown_minutes,
    createdAt: row.created_at,
  };
}

function numericThreshold(value: string | number): number {
  if (typeof value === 'number') {
    return value;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function parseOptionalString(value: unknown): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function parseCreateBody(
  body: unknown
): { ok: true; value: Omit<AlertRuleInsert, 'project_id'> } | { ok: false; message: string } {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, message: 'Request body must be a JSON object' };
  }

  const b = body as Record<string, unknown>;
  const name = typeof b.name === 'string' ? b.name.trim() : '';
  if (!name) {
    return { ok: false, message: 'name is required' };
  }

  const conditionType = typeof b.conditionType === 'string' ? b.conditionType : '';
  if (!CONDITION_TYPES.has(conditionType)) {
    return {
      ok: false,
      message: 'conditionType must be one of: failure_rate, no_activity, queue_depth, job_duration',
    };
  }

  const channel = typeof b.channel === 'string' ? b.channel : '';
  if (!CHANNELS.has(channel)) {
    return { ok: false, message: 'channel must be one of: slack, email, webhook' };
  }

  const destination = typeof b.destination === 'string' ? b.destination.trim() : '';
  if (!destination) {
    return { ok: false, message: 'destination is required' };
  }

  const thresholdRaw = b.thresholdValue;
  const thresholdValue =
    typeof thresholdRaw === 'number'
      ? thresholdRaw
      : typeof thresholdRaw === 'string'
        ? Number(thresholdRaw)
        : Number.NaN;
  if (!Number.isFinite(thresholdValue)) {
    return { ok: false, message: 'thresholdValue must be a number' };
  }

  let windowMinutes = 5;
  if (b.windowMinutes !== undefined) {
    if (typeof b.windowMinutes !== 'number' || !Number.isInteger(b.windowMinutes) || b.windowMinutes < 1) {
      return { ok: false, message: 'windowMinutes must be a positive integer' };
    }
    windowMinutes = b.windowMinutes;
  }

  let cooldownMinutes = 15;
  if (b.cooldownMinutes !== undefined) {
    if (typeof b.cooldownMinutes !== 'number' || !Number.isInteger(b.cooldownMinutes) || b.cooldownMinutes < 0) {
      return { ok: false, message: 'cooldownMinutes must be a non-negative integer' };
    }
    cooldownMinutes = b.cooldownMinutes;
  }

  let isActive = true;
  if (b.isActive !== undefined) {
    if (typeof b.isActive !== 'boolean') {
      return { ok: false, message: 'isActive must be a boolean' };
    }
    isActive = b.isActive;
  }

  const queueNameRaw = parseOptionalString(b.queueName);
  const queueName = queueNameRaw === undefined ? null : queueNameRaw;

  return {
    ok: true,
    value: {
      name,
      condition_type: conditionType,
      threshold_value: thresholdValue,
      window_minutes: windowMinutes,
      channel,
      destination,
      is_active: isActive,
      cooldown_minutes: cooldownMinutes,
      queue_name: queueName,
    },
  };
}

function parsePatchBody(body: unknown): { ok: true; value: AlertRuleUpdate } | { ok: false; message: string } {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, message: 'Request body must be a JSON object' };
  }

  const b = body as Record<string, unknown>;
  const update: AlertRuleUpdate = {};

  if (b.name !== undefined) {
    if (typeof b.name !== 'string' || b.name.trim().length === 0) {
      return { ok: false, message: 'name must be a non-empty string' };
    }
    update.name = b.name.trim();
  }

  if (b.queueName !== undefined) {
    const q = parseOptionalString(b.queueName);
    if (q === undefined) {
      return { ok: false, message: 'queueName must be a string or null' };
    }
    update.queue_name = q;
  }

  if (b.conditionType !== undefined) {
    if (typeof b.conditionType !== 'string' || !CONDITION_TYPES.has(b.conditionType)) {
      return {
        ok: false,
        message: 'conditionType must be one of: failure_rate, no_activity, queue_depth, job_duration',
      };
    }
    update.condition_type = b.conditionType;
  }

  if (b.thresholdValue !== undefined) {
    const thresholdRaw = b.thresholdValue;
    const thresholdValue =
      typeof thresholdRaw === 'number'
        ? thresholdRaw
        : typeof thresholdRaw === 'string'
          ? Number(thresholdRaw)
          : Number.NaN;
    if (!Number.isFinite(thresholdValue)) {
      return { ok: false, message: 'thresholdValue must be a number' };
    }
    update.threshold_value = thresholdValue;
  }

  if (b.windowMinutes !== undefined) {
    if (typeof b.windowMinutes !== 'number' || !Number.isInteger(b.windowMinutes) || b.windowMinutes < 1) {
      return { ok: false, message: 'windowMinutes must be a positive integer' };
    }
    update.window_minutes = b.windowMinutes;
  }

  if (b.channel !== undefined) {
    if (typeof b.channel !== 'string' || !CHANNELS.has(b.channel)) {
      return { ok: false, message: 'channel must be one of: slack, email, webhook' };
    }
    update.channel = b.channel;
  }

  if (b.destination !== undefined) {
    if (typeof b.destination !== 'string' || b.destination.trim().length === 0) {
      return { ok: false, message: 'destination must be a non-empty string' };
    }
    update.destination = b.destination.trim();
  }

  if (b.isActive !== undefined) {
    if (typeof b.isActive !== 'boolean') {
      return { ok: false, message: 'isActive must be a boolean' };
    }
    update.is_active = b.isActive;
  }

  if (b.cooldownMinutes !== undefined) {
    if (typeof b.cooldownMinutes !== 'number' || !Number.isInteger(b.cooldownMinutes) || b.cooldownMinutes < 0) {
      return { ok: false, message: 'cooldownMinutes must be a non-negative integer' };
    }
    update.cooldown_minutes = b.cooldownMinutes;
  }

  if (Object.keys(update).length === 0) {
    return { ok: false, message: 'No valid fields to update' };
  }

  return { ok: true, value: update };
}

router.post('/:id/alerts/test', async (req: Request, res: Response) => {
  const teamId = requireTeamContext(req as DashboardAuthedRequest, res);
  if (!teamId) {
    return;
  }

  const projectId = typeof req.params.id === 'string' ? req.params.id : '';
  if (!projectId) {
    errorResponse(res, 400, 'INVALID_PROJECT_ID', 'Invalid project id');
    return;
  }

  const projectCheck = await ensureProjectOwnership(projectId, teamId);
  if (!projectCheck.ok) {
    errorResponse(res, projectCheck.statusCode, projectCheck.code, projectCheck.message);
    return;
  }

  const body = req.body as { ruleId?: unknown };
  const ruleId = typeof body.ruleId === 'string' ? body.ruleId.trim() : '';
  if (!ruleId) {
    errorResponse(res, 400, 'INVALID_PAYLOAD', 'ruleId is required');
    return;
  }

  const { data, error } = await supabase
    .from('alert_rules')
    .select(
      'id, project_id, queue_name, name, condition_type, threshold_value, window_minutes, channel, destination, is_active, last_triggered_at, cooldown_minutes, created_at'
    )
    .eq('id', ruleId)
    .eq('project_id', projectId)
    .maybeSingle();

  const rule = data as AlertRuleRow | null;

  if (error) {
    errorResponse(res, 500, 'RULE_FETCH_FAILED', 'Failed to load alert rule');
    return;
  }

  if (!rule) {
    errorResponse(res, 404, 'RULE_NOT_FOUND', 'Alert rule not found');
    return;
  }

  const text = buildTestMessage(rule);
  const subject = `[Qcanary] Test: ${rule.name}`;

  if (rule.channel === 'slack') {
    const result = await deliverSlack(rule.destination, text);
    if (!result.ok) {
      errorResponse(res, 502, 'DELIVERY_FAILED', result.error);
      return;
    }
  } else if (rule.channel === 'webhook') {
    const result = await deliverWebhook(rule.destination, {
      rule_name: rule.name,
      condition_type: rule.condition_type,
      threshold_value: numericThreshold(rule.threshold_value),
      queue_name: rule.queue_name,
      message: 'Qcanary test alert — no alert history entry was created.',
    });
    if (!result.ok) {
      errorResponse(res, 502, 'DELIVERY_FAILED', result.error);
      return;
    }
  } else if (rule.channel === 'email') {
    const result = await deliverEmail(rule.destination, subject, `<pre>${escapeHtml(text)}</pre>`);
    if (!result.ok) {
      errorResponse(res, 502, 'DELIVERY_FAILED', result.error);
      return;
    }
  } else {
    errorResponse(res, 400, 'UNSUPPORTED_CHANNEL', `Channel not supported: ${rule.channel}`);
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      channel: rule.channel,
      delivered: true,
    },
  });
});

router.get('/:id/alerts', async (req: Request, res: Response) => {
  const teamId = requireTeamContext(req as DashboardAuthedRequest, res);
  if (!teamId) {
    return;
  }

  const projectId = typeof req.params.id === 'string' ? req.params.id : '';
  if (!projectId) {
    errorResponse(res, 400, 'INVALID_PROJECT_ID', 'Invalid project id');
    return;
  }

  const projectCheck = await ensureProjectOwnership(projectId, teamId);
  if (!projectCheck.ok) {
    errorResponse(res, projectCheck.statusCode, projectCheck.code, projectCheck.message);
    return;
  }

  const { data, error } = await supabase
    .from('alert_rules')
    .select(
      'id, project_id, queue_name, name, condition_type, threshold_value, window_minutes, channel, destination, is_active, last_triggered_at, cooldown_minutes, created_at'
    )
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    errorResponse(res, 500, 'RULES_LIST_FAILED', 'Failed to list alert rules');
    return;
  }

  const rows = (data ?? []) as AlertRuleRow[];

  res.status(200).json({
    success: true,
    data: {
      rules: rows.map(serializeRule),
    },
  });
});

router.get('/:id/alerts/history', async (req: Request, res: Response) => {
  const teamId = requireTeamContext(req as DashboardAuthedRequest, res);
  if (!teamId) {
    return;
  }

  const projectId = typeof req.params.id === 'string' ? req.params.id : '';
  if (!projectId) {
    errorResponse(res, 400, 'INVALID_PROJECT_ID', 'Invalid project id');
    return;
  }

  const projectCheck = await ensureProjectOwnership(projectId, teamId);
  if (!projectCheck.ok) {
    errorResponse(res, projectCheck.statusCode, projectCheck.code, projectCheck.message);
    return;
  }

  const rawLimit = typeof req.query.limit === 'string' ? Number(req.query.limit) : 20;
  const limit = Number.isInteger(rawLimit) ? Math.min(Math.max(rawLimit, 1), 100) : 20;

  const { data, error } = await supabase
    .from('alert_history')
    .select('id, rule_id, project_id, triggered_at, resolved_at, details')
    .eq('project_id', projectId)
    .order('triggered_at', { ascending: false })
    .limit(limit);

  if (error) {
    errorResponse(res, 500, 'ALERT_HISTORY_LIST_FAILED', 'Failed to list alert history');
    return;
  }

  type AlertHistoryRow = {
    id: number;
    rule_id: string;
    project_id: string;
    triggered_at: string;
    resolved_at: string | null;
    details: Record<string, unknown> | null;
  };

  const rows = (data ?? []) as AlertHistoryRow[];

  res.status(200).json({
    success: true,
    data: {
      history: rows.map((row) => ({
        id: row.id,
        ruleId: row.rule_id,
        projectId: row.project_id,
        triggeredAt: row.triggered_at,
        resolvedAt: row.resolved_at,
        details: row.details ?? {},
      })),
    },
  });
});

router.post('/:id/alerts', async (req: Request, res: Response) => {
  const teamId = requireTeamContext(req as DashboardAuthedRequest, res);
  if (!teamId) {
    return;
  }

  const projectId = typeof req.params.id === 'string' ? req.params.id : '';
  if (!projectId) {
    errorResponse(res, 400, 'INVALID_PROJECT_ID', 'Invalid project id');
    return;
  }

  const projectCheck = await ensureProjectOwnership(projectId, teamId);
  if (!projectCheck.ok) {
    errorResponse(res, projectCheck.statusCode, projectCheck.code, projectCheck.message);
    return;
  }

  const parsed = parseCreateBody(req.body);
  if (!parsed.ok) {
    errorResponse(res, 400, 'INVALID_PAYLOAD', parsed.message);
    return;
  }

  const insertPayload: AlertRuleInsert = {
    ...parsed.value,
    project_id: projectId,
  };

  const { data, error } = await insertRow('alert_rules', insertPayload)
    .select(
      'id, project_id, queue_name, name, condition_type, threshold_value, window_minutes, channel, destination, is_active, last_triggered_at, cooldown_minutes, created_at'
    )
    .single();

  const row = data as AlertRuleRow | null;

  if (error || !row) {
    errorResponse(res, 500, 'RULE_CREATE_FAILED', 'Failed to create alert rule');
    return;
  }

  res.status(201).json({
    success: true,
    data: {
      rule: serializeRule(row),
    },
  });
});

router.get('/:id/alerts/:ruleId', async (req: Request, res: Response) => {
  const teamId = requireTeamContext(req as DashboardAuthedRequest, res);
  if (!teamId) {
    return;
  }

  const projectId = typeof req.params.id === 'string' ? req.params.id : '';
  const ruleId = typeof req.params.ruleId === 'string' ? req.params.ruleId : '';
  if (!projectId || !ruleId) {
    errorResponse(res, 400, 'INVALID_PATH_PARAMS', 'Invalid project id or rule id');
    return;
  }

  const projectCheck = await ensureProjectOwnership(projectId, teamId);
  if (!projectCheck.ok) {
    errorResponse(res, projectCheck.statusCode, projectCheck.code, projectCheck.message);
    return;
  }

  const { data, error } = await supabase
    .from('alert_rules')
    .select(
      'id, project_id, queue_name, name, condition_type, threshold_value, window_minutes, channel, destination, is_active, last_triggered_at, cooldown_minutes, created_at'
    )
    .eq('id', ruleId)
    .eq('project_id', projectId)
    .maybeSingle();

  const row = data as AlertRuleRow | null;

  if (error) {
    errorResponse(res, 500, 'RULE_FETCH_FAILED', 'Failed to fetch alert rule');
    return;
  }

  if (!row) {
    errorResponse(res, 404, 'RULE_NOT_FOUND', 'Alert rule not found');
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      rule: serializeRule(row),
    },
  });
});

router.patch('/:id/alerts/:ruleId', async (req: Request, res: Response) => {
  const teamId = requireTeamContext(req as DashboardAuthedRequest, res);
  if (!teamId) {
    return;
  }

  const projectId = typeof req.params.id === 'string' ? req.params.id : '';
  const ruleId = typeof req.params.ruleId === 'string' ? req.params.ruleId : '';
  if (!projectId || !ruleId) {
    errorResponse(res, 400, 'INVALID_PATH_PARAMS', 'Invalid project id or rule id');
    return;
  }

  const projectCheck = await ensureProjectOwnership(projectId, teamId);
  if (!projectCheck.ok) {
    errorResponse(res, projectCheck.statusCode, projectCheck.code, projectCheck.message);
    return;
  }

  const parsed = parsePatchBody(req.body);
  if (!parsed.ok) {
    errorResponse(res, 400, 'INVALID_PAYLOAD', parsed.message);
    return;
  }

  const { data, error } = await updateRows('alert_rules', parsed.value)
    .eq('id', ruleId)
    .eq('project_id', projectId)
    .select(
      'id, project_id, queue_name, name, condition_type, threshold_value, window_minutes, channel, destination, is_active, last_triggered_at, cooldown_minutes, created_at'
    )
    .maybeSingle();

  const row = data as AlertRuleRow | null;

  if (error) {
    errorResponse(res, 500, 'RULE_UPDATE_FAILED', 'Failed to update alert rule');
    return;
  }

  if (!row) {
    errorResponse(res, 404, 'RULE_NOT_FOUND', 'Alert rule not found');
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      rule: serializeRule(row),
    },
  });
});

router.delete('/:id/alerts/:ruleId', async (req: Request, res: Response) => {
  const teamId = requireTeamContext(req as DashboardAuthedRequest, res);
  if (!teamId) {
    return;
  }

  const projectId = typeof req.params.id === 'string' ? req.params.id : '';
  const ruleId = typeof req.params.ruleId === 'string' ? req.params.ruleId : '';
  if (!projectId || !ruleId) {
    errorResponse(res, 400, 'INVALID_PATH_PARAMS', 'Invalid project id or rule id');
    return;
  }

  const projectCheck = await ensureProjectOwnership(projectId, teamId);
  if (!projectCheck.ok) {
    errorResponse(res, projectCheck.statusCode, projectCheck.code, projectCheck.message);
    return;
  }

  const { data, error } = await supabase
    .from('alert_rules')
    .delete()
    .eq('id', ruleId)
    .eq('project_id', projectId)
    .select('id')
    .maybeSingle();

  const deleted = data as { id: string } | null;

  if (error) {
    errorResponse(res, 500, 'RULE_DELETE_FAILED', 'Failed to delete alert rule');
    return;
  }

  if (!deleted) {
    errorResponse(res, 404, 'RULE_NOT_FOUND', 'Alert rule not found');
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      deleted: true,
      id: deleted.id,
    },
  });
});

export { router as alertsRouter };
