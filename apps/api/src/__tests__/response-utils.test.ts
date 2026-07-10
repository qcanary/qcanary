/**
 * Tests for shared response utilities — errorResponse, requireTeamContext.
 */

import { describe, it, expect, vi } from 'vitest';
import type { Response } from 'express';
import type { DashboardAuthedRequest } from '../middleware/dashboardAuth';

// We import the actual module since it has no side effects or external deps
const mod = await import('../lib/responseUtils');
const { errorResponse, requireTeamContext } = mod;

describe('responseUtils', () => {
  describe('errorResponse', () => {
    it('should send a properly formatted error response', () => {
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response;

      errorResponse(res, 404, 'NOT_FOUND', 'Resource not found');

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Resource not found' },
      });
    });

    it('should handle 400 errors with different messages', () => {
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response;

      errorResponse(res, 400, 'INVALID_PAYLOAD', 'Invalid request body');

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { code: 'INVALID_PAYLOAD', message: 'Invalid request body' },
      });
    });

    it('should handle 500 server errors', () => {
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response;

      errorResponse(res, 500, 'INTERNAL_ERROR', 'Database connection failed');

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Database connection failed' },
      });
    });
  });

  describe('requireTeamContext', () => {
    it('should return teamId when present on request', () => {
      const req = { teamId: 'team-123' } as DashboardAuthedRequest;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response;

      const result = requireTeamContext(req, res);

      expect(result).toBe('team-123');
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return null and send 401 when teamId is missing', () => {
      const req = {} as DashboardAuthedRequest;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response;

      const result = requireTeamContext(req, res);

      expect(result).toBeNull();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Unauthorized' },
      });
    });

    it('should handle empty string teamId as missing', () => {
      const req = { teamId: '' } as DashboardAuthedRequest;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response;

      const result = requireTeamContext(req, res);

      expect(result).toBeNull();
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});
