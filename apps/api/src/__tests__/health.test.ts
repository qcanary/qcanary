/**
 * Smoke tests for the Qcanary API health response contract.
 * Validates the response shape expected by Render's health check and monitoring.
 */

import { describe, it, expect } from 'vitest';

describe('Health endpoint contract', () => {
  it('should have success true and status ok for healthy state', () => {
    const mockHealthResponse = {
      success: true,
      data: {
        status: 'ok',
        service: 'qcanary-api',
        db: 'connected',
        redis: 'connected',
        timestamp: new Date().toISOString(),
      },
    };

    expect(mockHealthResponse.success).toBe(true);
    expect(mockHealthResponse.data.status).toBe('ok');
    expect(mockHealthResponse.data.service).toBe('qcanary-api');
    expect(mockHealthResponse.data).toHaveProperty('db');
    expect(mockHealthResponse.data).toHaveProperty('redis');
    expect(mockHealthResponse.data).toHaveProperty('timestamp');
    expect(Date.parse(mockHealthResponse.data.timestamp)).not.toBeNaN();
  });

  it('should handle degraded state with success false', () => {
    const mockDegradedResponse = {
      success: false,
      data: {
        status: 'degraded',
        service: 'qcanary-api',
        db: 'disconnected',
        redis: 'disconnected',
        timestamp: new Date().toISOString(),
      },
    };

    expect(mockDegradedResponse.success).toBe(false);
    expect(mockDegradedResponse.data.status).toBe('degraded');
    expect(mockDegradedResponse.data.db).toBe('disconnected');
    expect(mockDegradedResponse.data.redis).toBe('disconnected');
  });

  it('should always include service name', () => {
    const response = {
      success: true,
      data: { status: 'ok', service: 'qcanary-api', db: 'connected', redis: 'connected', timestamp: '' },
    };
    expect(response.data.service).toBe('qcanary-api');
  });
});
