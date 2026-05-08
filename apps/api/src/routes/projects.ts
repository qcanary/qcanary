import crypto from 'node:crypto';
import express from 'express';
import type { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import type { ApiKeyInsert, ProjectInsert } from '../types/database';
import { enforceProjectLimit } from '../middleware/planLimits';
import type { DashboardAuthedRequest } from '../middleware/dashboardAuth';

const router = express.Router();

interface ProjectRecord {
  id: string;
  team_id: string;
  name: string;
  environment: string;
  created_at: string;
}

interface ApiKeyRecord {
  id: string;
  project_id: string;
  key_prefix: string;
  label: string | null;
  last_used_at: string | null;
  created_at: string;
  revoked_at: string | null;
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
  const teamId = typeof (req as DashboardAuthedRequest).teamId === 'string' ? (req as DashboardAuthedRequest).teamId : '';
  if (!teamId) {
    errorResponse(res, 401, 'UNAUTHORIZED', 'Unauthorized');
    return null;
  }
  return teamId;
}

function sanitizeApiKeyRow(row: ApiKeyRecord): {
  id: string;
  projectId: string;
  keyPrefix: string;
  label: string | null;
  lastUsedAt: string | null;
  createdAt: string;
  revokedAt: string | null;
} {
  return {
    id: row.id,
    projectId: row.project_id,
    keyPrefix: row.key_prefix,
    label: row.label,
    lastUsedAt: row.last_used_at,
    createdAt: row.created_at,
    revokedAt: row.revoked_at,
  };
}

function createPlainApiKey(): { plainKey: string; keyPrefix: string; keyHash: string } {
  const random = crypto.randomBytes(24).toString('hex');
  const plainKey = `qca_live_${random}`;
  const keyPrefix = plainKey.slice(0, 12);
  const keyHash = crypto.createHash('sha256').update(plainKey).digest('hex');

  return { plainKey, keyPrefix, keyHash };
}

router.post('/', enforceProjectLimit, async (req: Request, res: Response) => {
  const teamId = requireTeamContext(req as DashboardAuthedRequest, res);

  if (!teamId) {
    return;
  }

  const { name, environment } = req.body as { name?: unknown; environment?: unknown };

  if (typeof name !== 'string' || name.trim().length === 0) {
    errorResponse(res, 400, 'INVALID_PAYLOAD', 'Project name is required');
    return;
  }

  const insertPayload: ProjectInsert = {
    team_id: teamId,
    name: name.trim(),
    environment: typeof environment === 'string' && environment.trim().length > 0 ? environment.trim() : 'production',
  };

  const { data, error } = await supabase
    .from('projects')
    .insert(insertPayload as never)
    .select('id, team_id, name, environment, created_at')
    .single();
  const project = data as ProjectRecord | null;

  if (error || !project) {
    errorResponse(res, 500, 'PROJECT_CREATE_FAILED', 'Failed to create project');
    return;
  }

  res.status(201).json({
    success: true,
    data: {
      project: {
        id: project.id,
        teamId: project.team_id,
        name: project.name,
        environment: project.environment,
        createdAt: project.created_at,
      },
    },
  });
});

router.get('/', async (req: Request, res: Response) => {
  const teamId = requireTeamContext(req as DashboardAuthedRequest, res);

  if (!teamId) {
    return;
  }

  const { data, error } = await supabase
    .from('projects')
    .select('id, team_id, name, environment, created_at')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false });

  const projects = (data ?? []) as ProjectRecord[];

  if (error) {
    errorResponse(res, 500, 'PROJECT_LIST_FAILED', 'Failed to fetch projects');
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      projects: projects.map((project) => ({
        id: project.id,
        teamId: project.team_id,
        name: project.name,
        environment: project.environment,
        createdAt: project.created_at,
      })),
    },
  });
});

router.get('/:id', async (req: Request, res: Response) => {
  const teamId = requireTeamContext(req as DashboardAuthedRequest, res);

  if (!teamId) {
    return;
  }

  const projectId = typeof req.params.id === 'string' ? req.params.id : '';
  if (!projectId) {
    errorResponse(res, 400, 'INVALID_PROJECT_ID', 'Invalid project id');
    return;
  }

  const { data, error } = await supabase
    .from('projects')
    .select('id, team_id, name, environment, created_at')
    .eq('id', projectId)
    .eq('team_id', teamId)
    .maybeSingle();

  const project = data as ProjectRecord | null;

  if (error) {
    errorResponse(res, 500, 'PROJECT_FETCH_FAILED', 'Failed to fetch project');
    return;
  }

  if (!project) {
    errorResponse(res, 404, 'PROJECT_NOT_FOUND', 'Project not found');
    return;
  }

  const { data: keyRows, error: keyError } = await supabase
    .from('api_keys')
    .select('id, project_id, key_prefix, label, last_used_at, created_at, revoked_at')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (keyError) {
    errorResponse(res, 500, 'PROJECT_KEYS_FETCH_FAILED', 'Failed to fetch project API keys');
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      project: {
        id: project.id,
        teamId: project.team_id,
        name: project.name,
        environment: project.environment,
        createdAt: project.created_at,
      },
      apiKeys: ((keyRows ?? []) as ApiKeyRecord[]).map(sanitizeApiKeyRow),
    },
  });
});

router.post('/:id/keys', async (req: Request, res: Response) => {
  const teamId = requireTeamContext(req as DashboardAuthedRequest, res);

  if (!teamId) {
    return;
  }

  const projectId = typeof req.params.id === 'string' ? req.params.id : '';
  if (!projectId) {
    errorResponse(res, 400, 'INVALID_PROJECT_ID', 'Invalid project id');
    return;
  }
  const { label } = req.body as { label?: unknown };

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('team_id', teamId)
    .maybeSingle();

  if (projectError) {
    errorResponse(res, 500, 'PROJECT_FETCH_FAILED', 'Failed to validate project');
    return;
  }

  if (!project) {
    errorResponse(res, 404, 'PROJECT_NOT_FOUND', 'Project not found');
    return;
  }

  const { plainKey, keyPrefix, keyHash } = createPlainApiKey();

  const insertPayload: ApiKeyInsert = {
    project_id: projectId,
    key_hash: keyHash,
    key_prefix: keyPrefix,
    label: typeof label === 'string' && label.trim().length > 0 ? label.trim() : null,
  };

  const { data: apiKeyRow, error } = await supabase
    .from('api_keys')
    .insert(insertPayload as never)
    .select('id, project_id, key_prefix, label, last_used_at, created_at, revoked_at')
    .single();
  const createdKey = apiKeyRow as ApiKeyRecord | null;

  if (error || !createdKey) {
    errorResponse(res, 500, 'API_KEY_CREATE_FAILED', 'Failed to create API key');
    return;
  }

  res.status(201).json({
    success: true,
    data: {
      apiKey: plainKey,
      key: sanitizeApiKeyRow(createdKey),
    },
  });
});

router.delete('/:id/keys/:keyId', async (req: Request, res: Response) => {
  const teamId = requireTeamContext(req as DashboardAuthedRequest, res);

  if (!teamId) {
    return;
  }

  const projectId = typeof req.params.id === 'string' ? req.params.id : '';
  const keyId = typeof req.params.keyId === 'string' ? req.params.keyId : '';
  if (!projectId || !keyId) {
    errorResponse(res, 400, 'INVALID_PATH_PARAMS', 'Invalid project or key id');
    return;
  }

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('team_id', teamId)
    .maybeSingle();

  if (projectError) {
    errorResponse(res, 500, 'PROJECT_FETCH_FAILED', 'Failed to validate project');
    return;
  }

  if (!project) {
    errorResponse(res, 404, 'PROJECT_NOT_FOUND', 'Project not found');
    return;
  }

  const { data: revokedRow, error } = await supabase
    .from('api_keys')
    .update({ revoked_at: new Date().toISOString() } as never)
    .eq('id', keyId)
    .eq('project_id', projectId)
    .is('revoked_at', null)
    .select('id, project_id, key_prefix, label, last_used_at, created_at, revoked_at')
    .maybeSingle();

  if (error) {
    errorResponse(res, 500, 'API_KEY_REVOKE_FAILED', 'Failed to revoke API key');
    return;
  }

  const revokedKey = revokedRow as ApiKeyRecord | null;

  if (!revokedKey) {
    errorResponse(res, 404, 'API_KEY_NOT_FOUND', 'API key not found or already revoked');
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      key: sanitizeApiKeyRow(revokedKey),
    },
  });
});

router.delete('/:id', async (req: Request, res: Response) => {
  const teamId = requireTeamContext(req as DashboardAuthedRequest, res);
  if (!teamId) {
    return;
  }

  const projectId = typeof req.params.id === 'string' ? req.params.id : '';
  if (!projectId) {
    errorResponse(res, 400, 'INVALID_PROJECT_ID', 'Invalid project id');
    return;
  }

  const { data: deletedRow, error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('team_id', teamId)
    .select('id')
    .maybeSingle();

  if (error) {
    errorResponse(res, 500, 'PROJECT_DELETE_FAILED', 'Failed to delete project');
    return;
  }

  const deleted = deletedRow as { id: string } | null;
  if (!deleted) {
    errorResponse(res, 404, 'PROJECT_NOT_FOUND', 'Project not found');
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

export { router as projectsRouter };
