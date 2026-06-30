import type { NextFunction, Request, Response } from 'express';
import { upstashRestConfig } from '../lib/redis';
import type { AuthenticatedRequest } from './auth';
import { logger } from '../lib/logger';

const INGEST_LIMIT_PER_MINUTE = 1000;
const WINDOW_MS = 60_000;

interface UpstashPipelineResult {
  result: number | string | null;
}

async function runUpstashPipeline(commands: unknown[][]): Promise<UpstashPipelineResult[]> {
  const response = await fetch(`${upstashRestConfig.url}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${upstashRestConfig.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
  });

  if (!response.ok) {
    throw new Error(`Upstash pipeline failed with status ${response.status}`);
  }

  const data = (await response.json()) as UpstashPipelineResult[];
  return data;
}

export async function ingestRateLimit(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authReq = req as AuthenticatedRequest;
    const apiKeyId = authReq.apiKeyId;

    if (!apiKeyId) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing authenticated API key context',
        },
      });
      return;
    }

    const now = Date.now();
    const windowStart = now - WINDOW_MS;
    const key = `qcanary:ratelimit:ingest:${apiKeyId}`;
    const member = `${now}-${Math.random().toString(16).slice(2)}`;

    const commands: unknown[][] = [
      ['ZREMRANGEBYSCORE', key, '-inf', windowStart],
      ['ZADD', key, now, member],
      ['ZCARD', key],
      ['PEXPIRE', key, WINDOW_MS + 1000],
    ];

    const results = await runUpstashPipeline(commands);
    const requestCount = Number(results[2]?.result ?? 0);

    if (requestCount > INGEST_LIMIT_PER_MINUTE) {
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: 'Rate limit exceeded: max 1000 events/minute per API key',
        },
      });
      return;
    }

    next();
  } catch {
    logger.warn('[rateLimit] Upstash unreachable — failing open. All requests allowed.');
    // Fail open to avoid dropping customer traffic due to transient Upstash issues.
    next();
  }
}
