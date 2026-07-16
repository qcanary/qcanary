/**
 * Tests for plan limits configuration — getPlanLimits, PLAN_LIMITS structure,
 * legacy plan normalization, and event grace-band classification.
 */

import { describe, it, expect } from 'vitest';

describe('Plan limits configuration', () => {
  it('should define correct limits for free plan', async () => {
    const { PLAN_LIMITS } = await import('../middleware/planLimits');
    const free = PLAN_LIMITS.free;

    expect(free.maxProjects).toBe(1);
    expect(free.maxQueuesPerProject).toBe(1);
    expect(free.maxEventsPerDay).toBe(5_000);
    expect(free.historyDays).toBe(1);
    expect(free.maxAlertRules).toBe(1);
    expect(free.allowWebhook).toBe(false);
  });

  it('should define correct limits for solo plan', async () => {
    const { PLAN_LIMITS } = await import('../middleware/planLimits');
    const solo = PLAN_LIMITS.solo;

    expect(solo.maxProjects).toBe(1);
    expect(solo.maxQueuesPerProject).toBe(5);
    expect(solo.maxEventsPerDay).toBe(25_000);
    expect(solo.historyDays).toBe(14);
    expect(solo.maxAlertRules).toBe(2);
    expect(solo.allowWebhook).toBe(false);
  });

  it('should define correct limits for team plan', async () => {
    const { PLAN_LIMITS } = await import('../middleware/planLimits');
    const team = PLAN_LIMITS.team;

    expect(team.maxProjects).toBe(3);
    expect(team.maxQueuesPerProject).toBe(10);
    expect(team.maxEventsPerDay).toBe(100_000);
    expect(team.historyDays).toBe(30);
    expect(team.maxAlertRules).toBeNull();
    expect(team.allowWebhook).toBe(true);
  });

  it('should define unlimited projects/events for business plan with 90-day history', async () => {
    const { PLAN_LIMITS } = await import('../middleware/planLimits');
    const business = PLAN_LIMITS.business;

    expect(business.maxProjects).toBeNull();
    expect(business.maxQueuesPerProject).toBeNull();
    expect(business.maxEventsPerDay).toBeNull();
    expect(business.historyDays).toBe(90);
    expect(business.maxAlertRules).toBeNull();
    expect(business.allowWebhook).toBe(true);
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

  it('normalizePlan should map legacy starter→team and pro→business', async () => {
    const { normalizePlan, getPlanLimits, PLAN_LIMITS } = await import('../middleware/planLimits');

    expect(normalizePlan('starter')).toBe('team');
    expect(normalizePlan('pro')).toBe('business');
    expect(getPlanLimits('starter')).toEqual(PLAN_LIMITS.team);
    expect(getPlanLimits('pro')).toEqual(PLAN_LIMITS.business);
  });

  it('getPlanLimits should return solo/team/business for canonical names', async () => {
    const { getPlanLimits, PLAN_LIMITS } = await import('../middleware/planLimits');

    expect(getPlanLimits('solo')).toEqual(PLAN_LIMITS.solo);
    expect(getPlanLimits('team')).toEqual(PLAN_LIMITS.team);
    expect(getPlanLimits('business')).toEqual(PLAN_LIMITS.business);
  });

  it('classifyEventUsage should apply 20% grace before hard cap', async () => {
    const { classifyEventUsage, getEventHardCap, EVENT_LIMIT_GRACE_RATIO } =
      await import('../middleware/planLimits');

    const limit = 5_000;
    expect(EVENT_LIMIT_GRACE_RATIO).toBe(1.2);
    expect(getEventHardCap(limit)).toBe(6_000);

    expect(classifyEventUsage(5_000, limit)).toBe('ok');
    expect(classifyEventUsage(5_001, limit)).toBe('grace');
    expect(classifyEventUsage(6_000, limit)).toBe('grace');
    expect(classifyEventUsage(6_001, limit)).toBe('hard_capped');
    expect(classifyEventUsage(100, null)).toBe('ok');
  });
});

describe('Plan limits — behavioral tests', () => {
  it('classifyEventUsage returns ok when under limit', async () => {
    const { classifyEventUsage } = await import('../middleware/planLimits');
    expect(classifyEventUsage(4999, 5000)).toBe('ok');
    expect(classifyEventUsage(0, 5000)).toBe('ok');
  });

  it('classifyEventUsage returns ok at exact limit', async () => {
    const { classifyEventUsage } = await import('../middleware/planLimits');
    expect(classifyEventUsage(5000, 5000)).toBe('ok');
  });

  it('classifyEventUsage returns grace within 20% overage', async () => {
    const { classifyEventUsage } = await import('../middleware/planLimits');
    expect(classifyEventUsage(5500, 5000)).toBe('grace');
    expect(classifyEventUsage(6000, 5000)).toBe('grace');
  });

  it('classifyEventUsage returns hard_capped above 20% overage', async () => {
    const { classifyEventUsage } = await import('../middleware/planLimits');
    expect(classifyEventUsage(6001, 5000)).toBe('hard_capped');
    expect(classifyEventUsage(10000, 5000)).toBe('hard_capped');
  });

  it('classifyEventUsage returns ok for unlimited plans (null limit)', async () => {
    const { classifyEventUsage } = await import('../middleware/planLimits');
    expect(classifyEventUsage(999999, null)).toBe('ok');
  });

  it('getPlanLimits returns free for any unknown plan name', async () => {
    const { getPlanLimits, PLAN_LIMITS } = await import('../middleware/planLimits');
    expect(getPlanLimits('nonexistent')).toEqual(PLAN_LIMITS.free);
    expect(getPlanLimits('')).toEqual(PLAN_LIMITS.free);
    expect(getPlanLimits('FREE')).toEqual(PLAN_LIMITS.free);
  });

  it('normalizePlan maps all legacy names correctly', async () => {
    const { normalizePlan } = await import('../middleware/planLimits');
    expect(normalizePlan('starter')).toBe('team');
    expect(normalizePlan('pro')).toBe('business');
    expect(normalizePlan('free')).toBe('free');
    expect(normalizePlan('solo')).toBe('solo');
    expect(normalizePlan('team')).toBe('team');
    expect(normalizePlan('business')).toBe('business');
  });
});
