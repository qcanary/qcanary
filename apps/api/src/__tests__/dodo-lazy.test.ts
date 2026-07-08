/**
 * Test that the dodo.ts lazy initialization pattern works correctly.
 * Verifies that the module can be safely imported without module-scope throws,
 * and that getDodo() throws when DODO_SECRET_KEY is not set.
 *
 * Note: Due to Node.js module caching, subsequent imports return the cached
 * module. Tests that need a fresh module state must use vi.resetModules()
 * and re-import the module fresh for each scenario.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Store original env so we can restore it
const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  vi.resetModules();
});

describe('Dodo lazy initialization pattern', () => {
  it('should export getDodo and verifyDodoWebhook functions', async () => {
    const mod = await import('../lib/dodo');
    expect(typeof mod.getDodo).toBe('function');
    expect(typeof mod.verifyDodoWebhook).toBe('function');
  });

  it('should handle missing DODO_SECRET_KEY gracefully at import time', async () => {
    // The key insight: importing dodo.ts should NOT throw at module scope
    // (the old code threw at module scope). The new code defers errors to
    // getDodo() call time. We verify by checking the import itself succeeds.
    delete process.env.DODO_SECRET_KEY;
    delete process.env.APP_URL;
    await expect(import('../lib/dodo')).resolves.toBeDefined();
  });

  it('should throw when getDodo is called without DODO_SECRET_KEY', async () => {
    // This verifies the lazy init throws at call time, not import time.
    // We clear env vars and import fresh, then calling getDodo() should throw.
    delete process.env.DODO_SECRET_KEY;
    delete process.env.APP_URL;

    const mod = await import('../lib/dodo');
    expect(() => mod.getDodo()).toThrow('DODO_SECRET_KEY is not set');
  });

  it('should return a DodoPayments instance when DODO_SECRET_KEY is set', async () => {
    // Set required env vars to test the success path
    process.env.DODO_SECRET_KEY = 'sk_test_abc123';
    process.env.APP_URL = 'http://localhost:3000';

    const mod = await import('../lib/dodo');
    const client = mod.getDodo();
    expect(client).toBeDefined();
    expect(typeof client.checkoutSessions?.create).toBe('function');
  });
});
