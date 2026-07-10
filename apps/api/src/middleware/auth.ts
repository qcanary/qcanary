import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import type { ApiKeyRow, Database } from '../types/database';

export interface AuthenticatedRequest extends Request {
  apiKeyId?: string;
  projectId?: string;
}

function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

function unauthorized(res: Response): Response {
  return res.status(401).json({
    success: false,
    error: {
      code: 'UNAUTHORIZED',
      message: 'Invalid API key',
    },
  });
}

export async function validateApiKey(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const apiKeysTable = 'api_keys' as const satisfies keyof Database['public']['Tables'];
    const rawApiKey = req.get('x-api-key');

    if (!rawApiKey) {
      unauthorized(res);
      return;
    }

    const keyHash = hashApiKey(rawApiKey.trim());

    const { data, error } = await supabase
      .from(apiKeysTable)
      .select('id, project_id, revoked_at')
      .eq('key_hash', keyHash)
      .maybeSingle();

    const apiKeyRow = data as Pick<ApiKeyRow, 'id' | 'project_id' | 'revoked_at'> | null;

    if (error || !apiKeyRow || apiKeyRow.revoked_at) {
      unauthorized(res);
      return;
    }

    req.apiKeyId = apiKeyRow.id;
    req.projectId = apiKeyRow.project_id;

    // Fire-and-forget update of last_used_at — non-blocking, never fails the request
    void supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() } as never)
      .eq('id', apiKeyRow.id)
      .then(({ error: updateError }) => {
        if (updateError) {
          logger.error({ err: updateError, keyId: apiKeyRow.id }, 'Failed to update last_used_at');
        }
      });

    next();
  } catch {
    unauthorized(res);
  }
}
