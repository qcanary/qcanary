/**
 * Tests for rate limit middleware — Retry-After headers, Upstash pipeline,
 * and fail-open behavior.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth';
import type { DashboardAuthedRequest } from '../middleware/dashboardAuth';

// Mock the redis module
vi.mock('../lib/redis', () => ({
  upstashRestConfig: {
    url: 'https://example.upstash.io',
    token: 'test-token',
  },
}));

// Mock the logger
vi.mock('../lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

async function setupRateLimitTests() {
  vi.resetModules();
  const mod = await import('../middleware/rateLimit');
  return mod;
}

describe('Rate limit middleware — Retry-After headers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ingestRateLimit', () => {
    it('should return 401 when apiKeyId is missing', async () => {
      const { ingestRateLimit } = await setupRateLimitTests();

      const req = {} as AuthenticatedRequest;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        setHeader: vi.fn().mockReturnThis(),
      } as unknown as Response;
      const next = vi.fn() as NextFunction;

      await ingestRateLimit(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should set Retry-After header on 429 response when limit exceeded', async () => {
      const { ingestRateLimit } = await setupRateLimitTests();

      // Mock Upstash returning count > INGEST_LIMIT_PER_MINUTE (1000)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { result: 'OK' },           // ZREMRANGEBYSCORE
          { result: 1 },              // ZADD
          { result: 1001 },           // ZCARD — exceeded limit
          { result: 'OK' },           // PEXPIRE
        ],
      });

      const req = { apiKeyId: 'test-key-id' } as AuthenticatedRequest;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        setHeader: vi.fn().mockReturnThis(),
      } as unknown as Response;
      const next = vi.fn() as NextFunction;

      await ingestRateLimit(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith('Retry-After', '60');
      expect(res.status).toHaveBeenCalledWith(429);
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next when under the rate limit', async () => {
      const { ingestRateLimit } = await setupRateLimitTests();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { result: 'OK' },           // ZREMRANGEBYSCORE
          { result: 1 },              // ZADD
          { result: 50 },             // ZCARD — under limit
          { result: 'OK' },           // PEXPIRE
        ],
      });

      const req = { apiKeyId: 'test-key-id' } as AuthenticatedRequest;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        setHeader: vi.fn().mockReturnThis(),
      } as unknown as Response;
      const next = vi.fn() as NextFunction;

      await ingestRateLimit(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalledWith(429);
    });

    it('should fail open (call next) when Upstash is unreachable', async () => {
      const { ingestRateLimit } = await setupRateLimitTests();

      mockFetch.mockRejectedValueOnce(new Error('Upstash unreachable'));

      const req = { apiKeyId: 'test-key-id' } as AuthenticatedRequest;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        setHeader: vi.fn().mockReturnThis(),
      } as unknown as Response;
      const next = vi.fn() as NextFunction;

      await ingestRateLimit(req, res, next);

      expect(next).toHaveBeenCalled();
      // Should NOT set Retry-After or return 429
      expect(res.setHeader).not.toHaveBeenCalledWith('Retry-After', '60');
    });
  });

  describe('dashboardRateLimit', () => {
    it('should set Retry-After header on 429 when limit exceeded', async () => {
      const { dashboardRateLimit } = await setupRateLimitTests();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { result: 'OK' },
          { result: 1 },
          { result: 201 },            // > DASHBOARD_LIMIT_PER_MINUTE (200)
          { result: 'OK' },
        ],
      });

      const req = { teamId: 'test-team' } as DashboardAuthedRequest;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        setHeader: vi.fn().mockReturnThis(),
      } as unknown as Response;
      const next = vi.fn() as NextFunction;

      await dashboardRateLimit(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith('Retry-After', '60');
      expect(res.status).toHaveBeenCalledWith(429);
    });

    it('should call next when teamId is missing (let route handler deal with auth)', async () => {
      const { dashboardRateLimit } = await setupRateLimitTests();

      const req = {} as DashboardAuthedRequest;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        setHeader: vi.fn().mockReturnThis(),
      } as unknown as Response;
      const next = vi.fn() as NextFunction;

      await dashboardRateLimit(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail open on Upstash error', async () => {
      const { dashboardRateLimit } = await setupRateLimitTests();

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const req = { teamId: 'test-team' } as DashboardAuthedRequest;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
        setHeader: vi.fn().mockReturnThis(),
      } as unknown as Response;
      const next = vi.fn() as NextFunction;

      await dashboardRateLimit(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
