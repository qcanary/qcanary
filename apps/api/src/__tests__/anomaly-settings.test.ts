import { describe, it, expect } from 'vitest';

describe('Anomaly settings defaults', () => {
  it('returns sensible defaults', () => {
    const defaults = {
      enabled: true,
      sensitivity: 'normal',
      min_sample_days: 3,
    };
    expect(defaults.enabled).toBe(true);
    expect(defaults.sensitivity).toBe('normal');
    expect(defaults.min_sample_days).toBe(3);
  });
});
