/**
 * Tests for plan limits configuration — getPlanLimits, PLAN_LIMITS structure.
 */

import { describe, it, expect } from 'vitest';

describe('Plan limits configuration', () => {
  it('should define correct limits for free plan', async () => {
    const { PLAN_LIMITS } = await import('../middleware/planLimits');
    const free = PLAN_LIMITS.free;

    expect(free.maxProjects).toBe(1);
    expect(free.maxQueuesPerProject).toBe(1);
    expect(free.maxEventsPerDay).toBe(1_000);
    expect(free.historyDays).toBe(1);
  });

  it('should define correct limits for starter plan', async () => {
    const { PLAN_LIMITS } = await import('../middleware/planLimits');
    const starter = PLAN_LIMITS.starter;

    expect(starter.maxProjects).toBe(3);
    expect(starter.maxQueuesPerProject).toBe(10);
    expect(starter.maxEventsPerDay).toBe(100_000);
    expect(starter.historyDays).toBe(30);
  });

  it('should define unlimited (null) limits for pro plan', async () => {
    const { PLAN_LIMITS } = await import('../middleware/planLimits');
    const pro = PLAN_LIMITS.pro;

    expect(pro.maxProjects).toBeNull();
    expect(pro.maxQueuesPerProject).toBeNull();
    expect(pro.maxEventsPerDay).toBeNull();
    expect(pro.historyDays).toBe(90);
  });

  it('getPlanLimits should return free for unknown plan', async () => {
    const { getPlanLimits, PLAN_LIMITS } = await import('../middleware/planLimits');
    const result = getPlanLimits('enterprise');

    expect(result).toEqual(PLAN_LIMITS.free);
  });

  it('getPlanLimits should return free for null plan', async () => {
    const { getPlanLimits, PLAN_LIMITS } = await import('../middleware/planLimits');
    const result = getPlanLimits(null);

    expect(result).toEqual(PLAN_LIMITS.free);
  });

  it('getPlanLimits should return starter for starter plan', async () => {
    const { getPlanLimits, PLAN_LIMITS } = await import('../middleware/planLimits');
    const result = getPlanLimits('starter');

    expect(result).toEqual(PLAN_LIMITS.starter);
  });

  it('getPlanLimits should return pro for pro plan', async () => {
    const { getPlanLimits, PLAN_LIMITS } = await import('../middleware/planLimits');
    const result = getPlanLimits('pro');

    expect(result).toEqual(PLAN_LIMITS.pro);
  });
});
