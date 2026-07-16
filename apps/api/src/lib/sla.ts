import { supabase } from './supabase';
import { logger } from './logger';

export interface SlaMetrics {
  projectId: string;
  period: string; // '24h' | '7d' | '30d'
  totalEvents: number;
  failedEvents: number;
  uptime: number; // percentage
  mttr: number | null; // mean time to recovery in minutes
  mtbf: number | null; // mean time between failures in minutes
  slaTarget: number; // target uptime (e.g., 99.9)
  slaMet: boolean;
}

interface SlaEventRow {
  status: string;
  timestamp: string;
}

export async function calculateSlaMetrics(
  projectId: string,
  period: '24h' | '7d' | '30d' = '24h'
): Promise<SlaMetrics> {
  try {
    const periodMs = {
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    }[period];

    const startDate = new Date(Date.now() - periodMs).toISOString();

    const { data: rawEvents, error } = await supabase
      .from('job_events')
      .select('status, timestamp')
      .eq('project_id', projectId)
      .gte('timestamp', startDate)
      .order('timestamp', { ascending: true });

    if (error || !rawEvents || rawEvents.length === 0) {
      return {
        projectId,
        period,
        totalEvents: 0,
        failedEvents: 0,
        uptime: 100,
        mttr: null,
        mtbf: null,
        slaTarget: 99.9,
        slaMet: true,
      };
    }

    const events = rawEvents as SlaEventRow[];
    const totalEvents = events.length;
    const failedEvents = events.filter((e) => e.status === 'failed').length;
    const uptime = totalEvents > 0 ? ((totalEvents - failedEvents) / totalEvents) * 100 : 100;

    // Calculate MTTR and MTBF
    let mttr: number | null = null;
    let mtbf: number | null = null;

    const failures = events.filter((e) => e.status === 'failed');
    if (failures.length > 0) {
      // MTBF: average time between failures
      const timestamps = failures.map((e) => new Date(e.timestamp).getTime());
      if (timestamps.length > 1) {
        const gaps = [];
        for (let i = 1; i < timestamps.length; i++) {
          gaps.push((timestamps[i] - timestamps[i - 1]) / (1000 * 60));
        }
        mtbf = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
      }

      // MTTR: average time from failure to next success
      const successAfterFailure: number[] = [];
      for (let i = 0; i < events.length - 1; i++) {
        if (events[i].status === 'failed' && events[i + 1].status === 'completed') {
          const recoveryTime = (new Date(events[i + 1].timestamp).getTime() - new Date(events[i].timestamp).getTime()) / (1000 * 60);
          successAfterFailure.push(recoveryTime);
        }
      }
      if (successAfterFailure.length > 0) {
        mttr = Math.round(successAfterFailure.reduce((a, b) => a + b, 0) / successAfterFailure.length);
      }
    }

    return {
      projectId,
      period,
      totalEvents,
      failedEvents,
      uptime: Math.round(uptime * 100) / 100,
      mttr,
      mtbf,
      slaTarget: 99.9,
      slaMet: uptime >= 99.9,
    };
  } catch (err) {
    logger.error({ err, projectId }, 'Failed to calculate SLA metrics');
    return {
      projectId,
      period,
      totalEvents: 0,
      failedEvents: 0,
      uptime: 0,
      mttr: null,
      mtbf: null,
      slaTarget: 99.9,
      slaMet: false,
    };
  }
}
