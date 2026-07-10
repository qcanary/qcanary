/**
 * Tests for alert rule validation and SSRF guard.
 *
 * Tests the actual `validateDestination` function from alertDelivery
 * which provides SSRF protection for user-configured webhooks.
 */

import { describe, it, expect } from 'vitest';

describe('Destination validation (SSRF guard)', () => {
  it('should reject invalid URLs', async () => {
    const { validateDestination } = await import('../lib/alertDelivery');
    const result = validateDestination('not-a-url');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('Invalid URL');
    }
  });

  it('should accept valid Slack webhook URLs', async () => {
    const { validateDestination } = await import('../lib/alertDelivery');
    const result = validateDestination('https://hooks.slack.com/services/T00/B00/xxx');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.hostname).toBe('hooks.slack.com');
    }
  });

  it('should accept valid public HTTPS URLs for webhooks', async () => {
    const { validateDestination } = await import('../lib/alertDelivery');
    const result = validateDestination('https://example.com/hooks/qcanary');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.hostname).toBe('example.com');
    }
  });

  it('should reject internal/private IP addresses', async () => {
    const { validateDestination } = await import('../lib/alertDelivery');
    const result = validateDestination('http://192.168.1.1/webhook');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('private IP');
    }
  });

  it('should reject localhost URLs', async () => {
    const { validateDestination } = await import('../lib/alertDelivery');
    const result = validateDestination('https://localhost:3000/webhook');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('private');
    }
  });

  it('should reject 127.0.0.1 loopback', async () => {
    const { validateDestination } = await import('../lib/alertDelivery');
    const result = validateDestination('http://127.0.0.1:8080/hook');
    expect(result.ok).toBe(false);
  });

  it('should reject non-http protocols', async () => {
    const { validateDestination } = await import('../lib/alertDelivery');
    const result = validateDestination('ftp://files.example.com/webhook');
    expect(result.ok).toBe(false);
  });
});

describe('alert message formatting', () => {
  it('should build test alert message', async () => {
    const { buildTestMessage } = await import('../lib/alertDelivery');
    const message = buildTestMessage({
      name: 'Test Rule',
      channel: 'slack',
      condition_type: 'failure_rate',
      threshold_value: 50,
      queue_name: null,
    } as never);

    expect(message).toContain('Qcanary test alert');
    expect(message).toContain('Test Rule');
  });

  it('should escape HTML in user-provided text', async () => {
    const { escapeHtml } = await import('../lib/alertDelivery');
    const result = escapeHtml('<script>alert("xss")</script>');
    expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });

  it('should handle plain text without modification', async () => {
    const { escapeHtml } = await import('../lib/alertDelivery');
    expect(escapeHtml('Hello, world!')).toBe('Hello, world!');
  });
});
