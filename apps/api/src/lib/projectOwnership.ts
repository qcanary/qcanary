import { supabase } from './supabase';

/**
 * Verify that a project belongs to the specified team.
 * Returns ownership verification result.
 */
export async function ensureProjectOwnership(
  projectId: string,
  teamId: string
): Promise<{ ok: true } | { ok: false; statusCode: number; code: string; message: string }> {
  const { data, error } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('team_id', teamId)
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      statusCode: 500,
      code: 'PROJECT_FETCH_FAILED',
      message: 'Failed to validate project',
    };
  }

  if (!data) {
    return {
      ok: false,
      statusCode: 404,
      code: 'PROJECT_NOT_FOUND',
      message: 'Project not found',
    };
  }

  return { ok: true };
}
