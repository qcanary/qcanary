import type { NextFunction, Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import { supabase } from '../lib/supabase';
import { insertRow } from '../lib/typedSupabase';
import { errorResponse } from '../lib/responseUtils';

export interface DashboardAuthedRequest extends Request {
  clerkUserId?: string;
  clerkOrgId?: string;
  teamId?: string;
}

async function getOrCreateTeamIdForOrg(orgId: string): Promise<string | null> {
  const { data: existing, error: existingError } = await supabase
    .from('teams')
    .select('id')
    .eq('clerk_org_id', orgId)
    .maybeSingle();

  if (existingError) {
    return null;
  }

  const existingRow = existing as { id: string } | null;
  if (existingRow?.id) {
    return existingRow.id;
  }

  const fallbackName = `Clerk org ${orgId.slice(0, 8)}`;
  const { data: created, error: createError } = await insertRow('teams', {
    name: fallbackName,
    clerk_org_id: orgId,
  })
    .select('id')
    .single();

  if (createError || !created) {
    return null;
  }

  return (created as { id: string }).id;
}

export async function requireDashboardAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const auth = getAuth(req);

    if (!auth.userId) {
      errorResponse(res, 401, 'UNAUTHORIZED', 'Missing or invalid Clerk session');
      return;
    }

    if (!auth.orgId) {
      errorResponse(res, 400, 'ORG_REQUIRED', 'Select an organization to access the dashboard');
      return;
    }

    const teamId = await getOrCreateTeamIdForOrg(auth.orgId);
    if (!teamId) {
      errorResponse(res, 500, 'TEAM_RESOLUTION_FAILED', 'Failed to resolve team for organization');
      return;
    }

    const scopedReq = req as DashboardAuthedRequest;
    scopedReq.clerkUserId = auth.userId;
    scopedReq.clerkOrgId = auth.orgId;
    scopedReq.teamId = teamId;

    next();
  } catch {
    errorResponse(res, 401, 'UNAUTHORIZED', 'Unauthorized');
  }
}
