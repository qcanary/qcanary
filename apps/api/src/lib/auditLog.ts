import { supabase } from './supabase';
import { logger } from './logger';

export type AuditAction = 'project.created' | 'project.deleted' | 'alert_rule.created' | 'alert_rule.updated' | 'alert_rule.deleted' | 'api_key.created' | 'api_key.revoked' | 'team.member_added' | 'team.member_removed' | 'settings.updated';

export interface AuditLogEntry {
  team_id: string;
  user_id: string;
  action: AuditAction;
  resource_type: string;
  resource_id: string;
  details: Record<string, unknown>;
  ip_address?: string;
}

export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    const { error } = await supabase.from('audit_logs' as never).insert({
      team_id: entry.team_id,
      user_id: entry.user_id,
      action: entry.action,
      resource_type: entry.resource_type,
      resource_id: entry.resource_id,
      details: entry.details,
      ip_address: entry.ip_address ?? null,
    } as never);

    if (error) {
      logger.error({ err: error }, 'Failed to write audit log');
    }
  } catch (err) {
    logger.error({ err }, 'Failed to write audit log');
  }
}

export async function queryAuditLogs(
  teamId: string,
  options: {
    limit?: number;
    offset?: number;
    action?: string;
    resourceType?: string;
    startDate?: string;
    endDate?: string;
  } = {}
): Promise<{ logs: Array<Record<string, unknown>>; total: number }> {
  try {
    let query = supabase
      .from('audit_logs' as never)
      .select('*', { count: 'exact' })
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    if (options.action) query = query.eq('action', options.action);
    if (options.resourceType) query = query.eq('resource_type', options.resourceType);
    if (options.startDate) query = query.gte('created_at', options.startDate);
    if (options.endDate) query = query.lte('created_at', options.endDate);

    const limit = Math.min(options.limit ?? 50, 200);
    const offset = options.offset ?? 0;

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) throw error;

    return { logs: (data ?? []) as Array<Record<string, unknown>>, total: count ?? 0 };
  } catch (err) {
    logger.error({ err, teamId }, 'Failed to query audit logs');
    return { logs: [], total: 0 };
  }
}
