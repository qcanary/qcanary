/**
 * Shared response utilities for Express route handlers.
 *
 * Provides standard error response formatting and request context helpers
 * so that every route file doesn't define its own versions.
 */

import type { Response } from 'express';
import type { DashboardAuthedRequest } from '../middleware/dashboardAuth';

/**
 * Send a standardized error JSON response.
 */
/**
 * Send a standardized error JSON response and return the response object
 * so callers can `return errorResponse(res, ...)` to prevent double-send bugs.
 */
export function errorResponse(
  res: Response,
  statusCode: number,
  code: string,
  message: string
): Response {
  return res.status(statusCode).json({
    success: false,
    error: { code, message },
  });
}

/**
 * Safely extract the authenticated team ID from the request.
 * Sends an unauthorized response and returns null if missing.
 */
export function requireTeamContext(req: DashboardAuthedRequest, res: Response): string | null {
  const teamId = typeof req.teamId === 'string' ? req.teamId : '';
  if (!teamId) {
    errorResponse(res, 401, 'UNAUTHORIZED', 'Unauthorized');
    return null;
  }
  return teamId;
}

