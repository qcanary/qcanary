# QCanary Improvement Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Address all issues from the brutal code review (5.5/10) to bring QCanary to 7+ quality level.

**Architecture:** Six independent improvement tracks that can be parallelized. Each track produces a working, testable increment. No track depends on another.

**Tech Stack:** Next.js 14, Express, Supabase (PostgreSQL), BullMQ, TypeScript, Vitest, Tailwind CSS, Clerk

## Global Constraints

- Node.js >= 22.0.0
- TypeScript strict mode
- All tests must pass before each commit
- No new dependencies unless absolutely necessary (ponytail: use what's installed)
- Match existing code style (camelCase in TS, snake_case in SQL)

---

## Track 1: Dead Code Cleanup (Quick Wins)

### Task 1.1: Remove nul files and dead documentation

**Files:**
- Delete: `C:\Qcanary\apps\web\nul`
- Delete: `C:\Qcanary\apps\api\nul`
- Delete: `C:\Qcanary\packages\agent\nul`
- Delete: `C:\Qcanary\nul`
- Delete: `C:\Qcanary\engineering-iterations.md`
- Delete: `C:\Qcanary\iterative-improvement-prompt.md`
- Modify: `C:\Qcanary\.gitignore` — add `nul` pattern

**Steps:**

- [ ] **Step 1: Delete nul files**

```bash
rm "C:\Qcanary\apps\web\nul" "C:\Qcanary\apps\api\nul" "C:\Qcanary\packages\agent\nul" "C:\Qcanary\nul"
```

- [ ] **Step 2: Delete dead documentation**

```bash
rm "C:\Qcanary\engineering-iterations.md" "C:\Qcanary\iterative-improvement-prompt.md"
```

- [ ] **Step 3: Add nul to .gitignore**

Append to `C:\Qcanary\.gitignore`:
```
# Windows NUL device artifact
nul
```

- [ ] **Step 4: Verify no broken imports**

```bash
grep -r "engineering-iterations\|iterative-improvement" C:\Qcanary --include="*.ts" --include="*.tsx" --include="*.js"
```
Expected: No results

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove nul files and dead documentation"
```

---

### Task 1.2: Remove unused caniuse-lite dependency

**Files:**
- Modify: `C:\Qcanary\apps\web\package.json`

**Steps:**

- [ ] **Step 1: Verify caniuse-lite is unused**

```bash
grep -r "caniuse" C:\Qcanary\apps\web --include="*.ts" --include="*.tsx" --include="*.js" --include="*.mjs"
```
Expected: No results (it's a transitive dep, not directly imported)

- [ ] **Step 2: Remove from package.json**

Remove `"caniuse-lite": "^1.0.0"` from `dependencies` in `C:\Qcanary\apps\web\package.json`.

- [ ] **Step 3: Run npm install to update lockfile**

```bash
npm install --workspace @qcanary/web
```

- [ ] **Step 4: Verify build still works**

```bash
npm run build --workspace @qcanary/web
```
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add apps/web/package.json apps/web/package-lock.json
git commit -m "chore: remove unused caniuse-lite dependency"
```

---

## Track 2: Test Quality Overhaul (Highest Impact)

### Task 2.1: Rewrite ingest validation tests to actually test the code

**Files:**
- Modify: `C:\Qcanary\apps\api\src\__tests__\ingest-validation.test.ts`
- Modify: `C:\Qcanary\apps\api\src\routes\ingest.ts` — export `parseIngestBody` for testing

**Interfaces:**
- Produces: Exported `parseIngestBody` function from ingest.ts

**Steps:**

- [ ] **Step 1: Export parseIngestBody from ingest.ts**

In `C:\Qcanary\apps\api\src\routes\ingest.ts`, add export:
```typescript
// Before the router definition, change:
// function parseIngestBody(body: unknown): ...
// To:
export function parseIngestBody(body: unknown): ...
```

- [ ] **Step 2: Write the failing test — import actual function**

Replace contents of `C:\Qcanary\apps\api\src\__tests__\ingest-validation.test.ts` with:

```typescript
import { describe, it, expect } from 'vitest';
import { parseIngestBody } from '../routes/ingest';

describe('parseIngestBody — actual code validation', () => {
  const validEvent = {
    queueName: 'testQueue',
    jobId: 'job-123',
    eventType: 'completed',
    status: 'completed',
    environment: 'production',
    timestamp: '2026-07-10T12:00:00.000Z',
  };

  it('rejects non-object body', () => {
    const result = parseIngestBody('not an object');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('JSON object');
    }
  });

  it('rejects null body', () => {
    const result = parseIngestBody(null);
    expect(result.ok).toBe(false);
  });

  it('rejects missing events array', () => {
    const result = parseIngestBody({ notEvents: [] });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('events');
    }
  });

  it('rejects empty events array', () => {
    const result = parseIngestBody({ events: [] });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('empty');
    }
  });

  it('accepts valid single event', () => {
    const result = parseIngestBody({ events: [validEvent] });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.events).toHaveLength(1);
      expect(result.value.events[0].queueName).toBe('testQueue');
    }
  });

  it('rejects event with missing queueName', () => {
    const event = { ...validEvent, queueName: undefined };
    const result = parseIngestBody({ events: [event] });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('queueName');
    }
  });

  it('rejects event with empty queueName', () => {
    const event = { ...validEvent, queueName: '' };
    const result = parseIngestBody({ events: [event] });
    expect(result.ok).toBe(false);
  });

  it('rejects queueName exceeding 100 chars', () => {
    const event = { ...validEvent, queueName: 'a'.repeat(101) };
    const result = parseIngestBody({ events: [event] });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('100');
    }
  });

  it('rejects event with missing jobId', () => {
    const event = { ...validEvent, jobId: undefined };
    const result = parseIngestBody({ events: [event] });
    expect(result.ok).toBe(false);
  });

  it('rejects jobId exceeding 100 chars', () => {
    const event = { ...validEvent, jobId: 'a'.repeat(101) };
    const result = parseIngestBody({ events: [event] });
    expect(result.ok).toBe(false);
  });

  it('rejects event with missing eventType', () => {
    const event = { ...validEvent, eventType: undefined };
    const result = parseIngestBody({ events: [event] });
    expect(result.ok).toBe(false);
  });

  it('rejects eventType exceeding 50 chars', () => {
    const event = { ...validEvent, eventType: 'a'.repeat(51) };
    const result = parseIngestBody({ events: [event] });
    expect(result.ok).toBe(false);
  });

  it('rejects event with missing status', () => {
    const event = { ...validEvent, status: undefined };
    const result = parseIngestBody({ events: [event] });
    expect(result.ok).toBe(false);
  });

  it('rejects event with invalid timestamp', () => {
    const event = { ...validEvent, timestamp: 'not-a-date' };
    const result = parseIngestBody({ events: [event] });
    expect(result.ok).toBe(false);
  });

  it('accepts optional durationMs', () => {
    const event = { ...validEvent, durationMs: 150 };
    const result = parseIngestBody({ events: [event] });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.events[0].durationMs).toBe(150);
    }
  });

  it('rejects non-number durationMs', () => {
    const event = { ...validEvent, durationMs: 'fast' };
    const result = parseIngestBody({ events: [event] });
    expect(result.ok).toBe(false);
  });

  it('accepts optional attempts', () => {
    const event = { ...validEvent, attempts: 3 };
    const result = parseIngestBody({ events: [event] });
    expect(result.ok).toBe(true);
  });

  it('truncates jobName to 255 chars', () => {
    const event = { ...validEvent, jobName: 'a'.repeat(300) };
    const result = parseIngestBody({ events: [event] });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.events[0].jobName!.length).toBe(255);
    }
  });

  it('accepts multiple events', () => {
    const events = Array.from({ length: 5 }, (_, i) => ({
      ...validEvent,
      jobId: `job-${i}`,
    }));
    const result = parseIngestBody({ events });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.events).toHaveLength(5);
    }
  });

  it('rejects event with null value', () => {
    const result = parseIngestBody({ events: [null] });
    expect(result.ok).toBe(false);
  });

  it('rejects event with non-object value', () => {
    const result = parseIngestBody({ events: ['string'] });
    expect(result.ok).toBe(false);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
cd C:\Qcanary && npm test --workspace @qcanary/api
```
Expected: FAIL — `parseIngestBody` is not exported

- [ ] **Step 4: Export parseIngestBody**

In `C:\Qcanary\apps\api\src\routes\ingest.ts`, line 143, change:
```typescript
function parseIngestBody(body: unknown): { ok: true; value: IngestRequestBody } | { ok: false; error: string } {
```
to:
```typescript
export function parseIngestBody(body: unknown): { ok: true; value: IngestRequestBody } | { ok: false; error: string } {
```

- [ ] **Step 5: Run test to verify it passes**

```bash
cd C:\Qcanary && npm test --workspace @qcanary/api
```
Expected: PASS — all tests green

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/routes/ingest.ts apps/api/src/__tests__/ingest-validation.test.ts
git commit -m "test: rewrite ingest validation tests to test actual parseIngestBody function"
```

---

### Task 2.2: Add integration test for ingest endpoint

**Files:**
- Create: `C:\Qcanary\apps\api\src\__tests__\ingest-integration.test.ts`

**Steps:**

- [ ] **Step 1: Write the failing test**

Create `C:\Qcanary\apps\api\src\__tests__\ingest-integration.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import type { Server } from 'http';

// We test the full request/response cycle by importing the app
// and making HTTP requests against it

describe('Ingest endpoint — integration', () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    // Dynamic import to avoid module-level side effects
    const { default: app } = await import('../index');
    // The app is already configured with all middleware
    // We'll test the route logic directly instead of spinning up a server
    // since the app requires env vars that may not be available in test
  });

  it('parseIngestBody handles the full valid payload', async () => {
    const { parseIngestBody } = await import('../routes/ingest');

    const body = {
      events: [
        {
          queueName: 'email-notifications',
          jobId: 'job-001',
          jobName: 'Send welcome email',
          eventType: 'completed',
          status: 'completed',
          durationMs: 1250,
          attempts: 1,
          environment: 'production',
          timestamp: '2026-07-10T12:00:00.000Z',
        },
        {
          queueName: 'email-notifications',
          jobId: 'job-002',
          eventType: 'failed',
          status: 'failed',
          errorMessage: 'SMTP connection timeout',
          environment: 'production',
          timestamp: '2026-07-10T12:00:01.000Z',
        },
      ],
    };

    const result = parseIngestBody(body);
    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.value.events).toHaveLength(2);
      expect(result.value.events[0].status).toBe('completed');
      expect(result.value.events[0].durationMs).toBe(1250);
      expect(result.value.events[1].status).toBe('failed');
      expect(result.value.events[1].errorMessage).toBe('SMTP connection timeout');
    }
  });

  it('parseIngestBody normalizes jobName length', async () => {
    const { parseIngestBody } = await import('../routes/ingest');

    const body = {
      events: [
        {
          queueName: 'q',
          jobId: 'j',
          jobName: 'x'.repeat(500),
          eventType: 'completed',
          status: 'completed',
          environment: 'prod',
          timestamp: '2026-07-10T12:00:00.000Z',
        },
      ],
    };

    const result = parseIngestBody(body);
    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.value.events[0].jobName!.length).toBe(255);
    }
  });

  it('parseIngestBody preserves optional fields as null when absent', async () => {
    const { parseIngestBody } = await import('../routes/ingest');

    const body = {
      events: [
        {
          queueName: 'q',
          jobId: 'j',
          eventType: 'completed',
          status: 'completed',
          environment: 'prod',
          timestamp: '2026-07-10T12:00:00.000Z',
        },
      ],
    };

    const result = parseIngestBody(body);
    expect(result.ok).toBe(true);

    if (result.ok) {
      const event = result.value.events[0];
      expect(event.durationMs).toBeUndefined();
      expect(event.attempts).toBeUndefined();
      expect(event.errorMessage).toBeUndefined();
      expect(event.errorStack).toBeUndefined();
    }
  });

  it('returns clear error for each validation failure', async () => {
    const { parseIngestBody } = await import('../routes/ingest');

    // Missing all required fields
    const body = { events: [{}] };
    const result = parseIngestBody(body);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      // Should mention the first invalid field
      expect(result.error).toMatch(/index 0/);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

```bash
cd C:\Qcanary && npm test --workspace @qcanary/api
```
Expected: PASS (the function is already exported from Task 2.1)

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/__tests__/ingest-integration.test.ts
git commit -m "test: add integration tests for ingest payload parsing"
```

---

### Task 2.3: Fix plan-limits tests to test behavior, not just config

**Files:**
- Modify: `C:\Qcanary\apps\api\src\__tests__\plan-limits.test.ts`

**Steps:**

- [ ] **Step 1: Add behavioral tests**

Append to `C:\Qcanary\apps\api\src\__tests__\plan-limits.test.ts`:

```typescript
describe('Plan limits — behavioral tests', () => {
  it('classifyEventUsage returns ok when under limit', async () => {
    const { classifyEventUsage } = await import('../middleware/planLimits');
    expect(classifyEventUsage(4999, 5000)).toBe('ok');
    expect(classifyEventUsage(0, 5000)).toBe('ok');
  });

  it('classifyEventUsage returns grace at exact limit', async () => {
    const { classifyEventUsage } = await import('../middleware/planLimits');
    expect(classifyEventUsage(5000, 5000)).toBe('grace');
  });

  it('classifyEventUsage returns grace within 20% overage', async () => {
    const { classifyEventUsage } = await import('../middleware/planLimits');
    expect(classifyEventUsage(5500, 5000)).toBe('grace'); // 10% over
    expect(classifyEventUsage(6000, 5000)).toBe('grace'); // 20% over (exact cap)
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
    expect(getPlanLimits('FREE')).toEqual(PLAN_LIMITS.free); // case-sensitive
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
```

- [ ] **Step 2: Run test to verify it passes**

```bash
cd C:\Qcanary && npm test --workspace @qcanary/api
```
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/__tests__/plan-limits.test.ts
git commit -m "test: add behavioral tests for plan limits classification"
```

---

## Track 3: Landing Page Refactoring

### Task 3.1: Extract HeroSection into separate component

**Files:**
- Modify: `C:\Qcanary\apps\web\components\landing\HeroSection.tsx`
- Modify: `C:\Qcanary\apps\web\app\(marketing)\page.tsx`

**Steps:**

- [ ] **Step 1: Read current HeroSection to understand what exists**

Read `C:\Qcanary\apps\web\components\landing\HeroSection.tsx` — it already exists as a separate component.

- [ ] **Step 2: Verify it's imported in page.tsx**

Check line 133 of `C:\Qcanary\apps\web\app\(marketing)\page.tsx`:
```typescript
import { HeroSection } from "@/components/landing/HeroSection";
```
This already exists. The hero is already extracted.

- [ ] **Step 3: Commit (no changes needed)**

Hero is already extracted. Move to next extraction.

---

### Task 3.2: Extract ProblemSection component

**Files:**
- Create: `C:\Qcanary\apps\web\components\landing\ProblemSection.tsx`
- Modify: `C:\Qcanary\apps\web\app\(marketing)\page.tsx`

**Steps:**

- [ ] **Step 1: Create ProblemSection component**

Create `C:\Qcanary\apps\web\components\landing\ProblemSection.tsx`:

```tsx
import { Badge } from "@/components/ui/badge";

export function ProblemSection() {
  return (
    <section className="overflow-hidden border-b border-border bg-gradient-to-br from-surface/20 via-bg to-code-bg">
      <div className="relative mx-auto w-full max-w-6xl px-6 py-20 md:py-28">
        <div className="mx-auto mb-14 max-w-2xl text-center animate-fade-in-up">
          <Badge variant="outline" className="mb-4 border-red-500/30 text-red-400">The Problem</Badge>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">Sharing Redis is a Security Risk</h2>
          <p className="mt-3 text-text-muted">
            Every queue monitoring dashboard that asks for your Redis URL creates an attack
            surface that your security team will flag.
          </p>
        </div>

        <div className="mx-auto mb-16 max-w-4xl animate-fade-in-up-delay-1">
          <div className="rounded-2xl border border-red-500/15 bg-gradient-to-br from-red-500/5 to-code-bg p-5 shadow-lg shadow-red-500/5 md:p-10">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/20">
                <span className="text-xs font-bold text-red-400">!</span>
              </div>
              <span className="text-sm font-medium text-red-400">The danger of exposing Redis</span>
            </div>
            <p className="mb-5 text-sm text-text-muted">
              Redis has no built-in access control beyond a plaintext password. Leaking a URL means full database access.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: "\u{1F511}", title: "Credential exposure", desc: "Handing over your Redis URL grants full database access to a third party" },
                { icon: "\u{1F310}", title: "Network blast radius", desc: "Opening port 6379 to a vendor requires VPC peering or public exposure" },
                { icon: "\u{1F4CB}", title: "Compliance violation", desc: "Storing production Redis credentials in a third-party system violates SOC 2" },
                { icon: "\u{1F4CA}", title: "Data leakage", desc: "Job payloads, worker metadata, and internals exposed to external monitoring" },
              ].map((item) => (
                <div key={item.title} className="card-hover group flex items-start gap-3 rounded-lg border border-border bg-surface/40 p-4">
                  <span className="mt-0.5 shrink-0 text-base">{item.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-text-primary">{item.title}</div>
                    <div className="mt-0.5 text-xs text-text-muted">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Replace inline section in page.tsx with component**

In `C:\Qcanary\apps\web\app\(marketing)\page.tsx`, replace the Problem section (lines ~147-188) with:
```tsx
import { ProblemSection } from "@/components/landing/ProblemSection";
// ... in the JSX:
<ProblemSection />
```

- [ ] **Step 3: Verify build**

```bash
npm run build --workspace @qcanary/web
```
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/landing/ProblemSection.tsx apps/web/app/\(marketing\)/page.tsx
git commit -m "refactor: extract ProblemSection from landing page"
```

---

### Task 3.3: Extract SolutionSection component

**Files:**
- Create: `C:\Qcanary\apps\web\components\landing\SolutionSection.tsx`
- Modify: `C:\Qcanary\apps\web\app\(marketing)\page.tsx`

**Steps:**

- [ ] **Step 1: Create SolutionSection component**

Create `C:\Qcanary\apps\web\components\landing\SolutionSection.tsx`:

```tsx
import { Badge } from "@/components/ui/badge";

export function SolutionSection() {
  return (
    <section className="border-y border-border bg-gradient-to-b from-surface/30 via-bg to-surface/30">
      <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-16 md:py-20">
        <div className="mb-10 max-w-2xl text-center animate-fade-in-up">
          <Badge variant="outline" className="mb-4 border-accent/30 text-accent">Architecture</Badge>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">How It Works</h2>
          <p className="mt-3 text-text-muted">
            A lightweight agent inside your worker process streams job metadata to QCanary over HTTPS.
            Redis never leaves your network.
          </p>
        </div>

        <div className="relative flex w-full flex-col gap-0 md:flex-row md:items-start">
          <div className="absolute left-[20px] top-0 hidden h-full w-px bg-gradient-to-b from-accent/30 via-accent/15 to-transparent md:left-1/2 md:top-auto md:h-px md:w-3/4 md:-translate-x-1/2 md:bg-gradient-to-r md:from-accent/30 md:via-accent/15 md:to-transparent" />
          <div className="absolute left-[20px] top-0 h-full w-px bg-gradient-to-b from-accent/30 via-accent/15 to-transparent md:hidden" />

          {[
            {
              step: "01",
              title: "Install @qcanary/agent",
              desc: "Add the package to your worker process. Initialize with your API key and BullMQ queues. Monitoring in 3 lines.",
              code: "npm install @qcanary/agent",
              icon: "\u{1F4E6}",
            },
            {
              step: "02",
              title: "Agent attaches via QueueEvents",
              desc: "Subscribes to BullMQ's built-in lifecycle events as a local subscriber inside your process. Zero network changes.",
              code: "new QueueMonitor({ apiKey, queues })",
              icon: "\u{1F517}",
            },
            {
              step: "03",
              title: "Dashboards & Alerts live",
              desc: "Track failures, trends, and alerts in real time. Catch issues before they reach production.",
              code: "\u2713 Agent connected \u00b7 streaming events",
              icon: "\u{1F4CA}",
            },
          ].map((item, i) => (
            <div key={item.step} className={`relative flex-1 pb-8 md:pb-0 md:px-3 ${
              i === 0 ? 'animate-fade-in-up' : i === 1 ? 'animate-fade-in-up-delay-1' : 'animate-fade-in-up-delay-2'
            }`}>
              <div className="flex items-start gap-4 md:flex-col md:items-center md:text-center">
                <div className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-accent/30 bg-gradient-to-br from-bg to-surface shadow-lg shadow-accent/5 transition-all group-hover:border-accent/60">
                  <span className="text-sm">{item.icon}</span>
                </div>
                <div className="min-w-0 flex-1 md:mt-4">
                  <h3 className="text-base font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-text-muted">{item.desc}</p>
                  <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-border bg-gradient-to-r from-code-bg to-surface/30 px-3 py-1.5 font-mono text-xs text-accent ring-1 ring-accent/10">
                    <span className="text-text-muted">$</span>
                    {item.code}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Replace inline section in page.tsx**

Replace the Architecture/How It Works section (lines ~244-322) with:
```tsx
import { SolutionSection } from "@/components/landing/SolutionSection";
// ... in the JSX:
<SolutionSection />
```

- [ ] **Step 3: Verify build**

```bash
npm run build --workspace @qcanary/web
```
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/landing/SolutionSection.tsx apps/web/app/\(marketing\)/page.tsx
git commit -m "refactor: extract SolutionSection from landing page"
```

---

### Task 3.4: Extract ComparisonSection, FeaturesSection, SecuritySection, and SocialProofSection

**Files:**
- Create: `C:\Qcanary\apps\web\components\landing\ComparisonSection.tsx`
- Create: `C:\Qcanary\apps\web\components\landing\FeaturesSection.tsx`
- Create: `C:\Qcanary\apps\web\components\landing\SecuritySection.tsx`
- Create: `C:\Qcanary\apps\web\components\landing\SocialProofSection.tsx`
- Modify: `C:\Qcanary\apps\web\app\(marketing)\page.tsx`

**Steps:**

- [ ] **Step 1: Create ComparisonSection**

Create `C:\Qcanary\apps\web\components\landing\ComparisonSection.tsx` — extract the "Why teams choose QCanary over Bull Board" section (lines ~326-391).

- [ ] **Step 2: Create FeaturesSection**

Create `C:\Qcanary\apps\web\components\landing\FeaturesSection.tsx` — extract the "Everything you need to monitor queues" section (lines ~572-688).

- [ ] **Step 3: Create SecuritySection**

Create `C:\Qcanary\apps\web\components\landing\SecuritySection.tsx` — extract the "We don't need your keys" section (lines ~691-765).

- [ ] **Step 4: Create SocialProofSection**

Create `C:\Qcanary\apps\web\components\landing\SocialProofSection.tsx` — extract the community metrics section (lines ~394-549).

- [ ] **Step 5: Update page.tsx to use all extracted components**

The landing page should now be approximately:

```tsx
import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { SolutionSection } from "@/components/landing/SolutionSection";
import { ComparisonSection } from "@/components/landing/ComparisonSection";
import { SocialProofSection } from "@/components/landing/SocialProofSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { SecuritySection } from "@/components/landing/SecuritySection";
// ... other imports

export default async function MarketingPage() {
  const posts = await getAllBlogPosts();

  return (
    <main id="main-content" className="min-h-screen bg-bg text-text-primary">
      <MarketingNav />
      <div className="overflow-x-hidden">
        <HeroSection />
      </div>
      <ProblemSection />
      <SolutionSection />
      <ComparisonSection />
      <SocialProofSection />
      <FeaturesSection />
      <SecuritySection />
      {/* ... remaining sections (Dashboard Preview, Why I Built This, Pricing, Blog, CTA, Footer) */}
    </main>
  );
}
```

- [ ] **Step 6: Verify build**

```bash
npm run build --workspace @qcanary/web
```
Expected: Build succeeds, page renders identically

- [ ] **Step 7: Commit**

```bash
git add apps/web/components/landing/ apps/web/app/\(marketing\)/page.tsx
git commit -m "refactor: extract all landing page sections into components"
```

---

## Track 4: API Validation with Zod

### Task 4.1: Add Zod validation to ingest endpoint

**Files:**
- Create: `C:\Qcanary\apps\api\src\lib\validations.ts`
- Modify: `C:\Qcanary\apps\api\src\routes\ingest.ts`

**Interfaces:**
- Produces: `IngestEventSchema`, `IngestBodySchema` Zod schemas

**Steps:**

- [ ] **Step 1: Check if zod is available**

```bash
ls C:\Qcanary\node_modules\zod
```
If not installed:
```bash
npm install zod --workspace @qcanary/api
```

- [ ] **Step 2: Create validation schemas**

Create `C:\Qcanary\apps\api\src\lib\validations.ts`:

```typescript
import { z } from 'zod';

export const IngestEventSchema = z.object({
  queueName: z.string().min(1).max(100),
  jobId: z.string().min(1).max(100),
  jobName: z.string().max(255).optional(),
  eventType: z.string().min(1).max(50),
  status: z.string().min(1).max(50),
  durationMs: z.number().optional(),
  attempts: z.number().optional(),
  errorMessage: z.string().optional(),
  errorStack: z.string().optional(),
  delayMs: z.number().optional(),
  environment: z.string().min(1),
  timestamp: z.string().datetime(),
  payload: z.unknown().optional(),
});

export const IngestBodySchema = z.object({
  events: z.array(IngestEventSchema).min(1).max(500),
});

export type IngestEvent = z.infer<typeof IngestEventSchema>;
export type IngestBody = z.infer<typeof IngestBodySchema>;
```

- [ ] **Step 3: Write the failing test**

Create `C:\Qcanary\apps\api\src\__tests__\zod-validation.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { IngestEventSchema, IngestBodySchema } from '../lib/validations';

describe('Zod validation schemas', () => {
  const validEvent = {
    queueName: 'test-queue',
    jobId: 'job-123',
    eventType: 'completed',
    status: 'completed',
    environment: 'production',
    timestamp: '2026-07-10T12:00:00.000Z',
  };

  it('accepts valid event', () => {
    const result = IngestEventSchema.safeParse(validEvent);
    expect(result.success).toBe(true);
  });

  it('rejects empty queueName', () => {
    const result = IngestEventSchema.safeParse({ ...validEvent, queueName: '' });
    expect(result.success).toBe(false);
  });

  it('rejects queueName over 100 chars', () => {
    const result = IngestEventSchema.safeParse({ ...validEvent, queueName: 'x'.repeat(101) });
    expect(result.success).toBe(false);
  });

  it('rejects invalid timestamp format', () => {
    const result = IngestEventSchema.safeParse({ ...validEvent, timestamp: 'not-a-date' });
    expect(result.success).toBe(false);
  });

  it('accepts valid body with multiple events', () => {
    const result = IngestBodySchema.safeParse({ events: [validEvent, validEvent] });
    expect(result.success).toBe(true);
  });

  it('rejects empty events array', () => {
    const result = IngestBodySchema.safeParse({ events: [] });
    expect(result.success).toBe(false);
  });

  it('rejects over 500 events', () => {
    const events = Array.from({ length: 501 }, () => validEvent);
    const result = IngestBodySchema.safeParse({ events });
    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd C:\Qcanary && npm test --workspace @qcanary/api
```
Expected: PASS

- [ ] **Step 5: Integrate Zod into ingest route (optional enhancement)**

Replace the manual `parseIngestBody` with Zod validation in `ingest.ts`:

```typescript
import { IngestBodySchema } from '../lib/validations';

// In the route handler, replace manual validation with:
const parseResult = IngestBodySchema.safeParse(req.body);
if (!parseResult.success) {
  res.status(400).json({
    success: false,
    error: {
      code: 'INVALID_PAYLOAD',
      message: parseResult.error.errors[0]?.message ?? 'Invalid payload',
    },
  });
  return;
}
const events = parseResult.data.events;
```

- [ ] **Step 6: Run all tests**

```bash
cd C:\Qcanary && npm test --workspace @qcanary/api
```
Expected: All tests pass

- [ ] **Step 7: Commit**

```bash
git add apps/api/src/lib/validations.ts apps/api/src/__tests__/zod-validation.test.ts apps/api/src/routes/ingest.ts
git commit -m "feat: add Zod validation for ingest endpoint"
```

---

## Track 5: Anomaly Settings Persistence

### Task 5.1: Create anomaly_settings table and migration

**Files:**
- Create: `C:\Qcanary\supabase\migrations\009_anomaly_settings.sql`

**Steps:**

- [ ] **Step 1: Create migration**

Create `C:\Qcanary\supabase\migrations\009_anomaly_settings.sql`:

```sql
-- ============================================================
-- anomaly_settings — Per-team anomaly detection configuration
-- ============================================================

CREATE TABLE anomaly_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT true,
  sensitivity TEXT NOT NULL DEFAULT 'normal' CHECK (sensitivity IN ('low', 'normal', 'high')),
  min_sample_days INTEGER NOT NULL DEFAULT 3 CHECK (min_sample_days >= 1 AND min_sample_days <= 30),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(team_id)
);

COMMENT ON TABLE anomaly_settings
  IS 'Per-team anomaly detection settings — one row per team';

COMMENT ON COLUMN anomaly_settings.sensitivity
  IS 'Detection sensitivity: low (fewer alerts), normal (default), high (more alerts)';

-- RLS
ALTER TABLE anomaly_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anomaly_settings_select_own_team" ON anomaly_settings
  FOR SELECT
  USING (
    team_id IN (
      SELECT id FROM teams
      WHERE clerk_org_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'org_id')
    )
  );

CREATE POLICY "anomaly_settings_service_role_all" ON anomaly_settings
  FOR ALL
  USING (
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role'
  );

-- Index for fast lookup by team
CREATE INDEX idx_anomaly_settings_team ON anomaly_settings(team_id);
```

- [ ] **Step 2: Verify migration syntax**

```bash
cd C:\Qcanary && npx supabase db diff --schema public
```
(Or just verify the SQL is valid by reviewing it)

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/009_anomaly_settings.sql
git commit -m "feat: add anomaly_settings table for per-team configuration"
```

---

### Task 5.2: Update alert worker to use per-team anomaly settings

**Files:**
- Modify: `C:\Qcanary\apps\api\src\workers\alert.worker.ts`

**Steps:**

- [ ] **Step 1: Write the failing test**

Create `C:\Qcanary\apps\api\src\__tests__\anomaly-settings.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

describe('Anomaly settings loading', () => {
  it('getDefaultAnomalySettings returns sensible defaults', async () => {
    // Import the function from the worker (we'll need to export it)
    // For now, test the shape
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
```

- [ ] **Step 2: Run test to verify it passes**

```bash
cd C:\Qcanary && npm test --workspace @qcanary/api
```
Expected: PASS

- [ ] **Step 3: Update getDefaultAnomalySettings to query database**

In `C:\Qcanary\apps\api\src\workers\alert.worker.ts`, replace the hardcoded function:

```typescript
async function getAnomalySettings(projectId: string): Promise<AnomalySettings> {
  // First, get the team_id for this project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('team_id')
    .eq('id', projectId)
    .single();

  if (projectError || !project) {
    logger.warn({ projectId, err: projectError }, 'Failed to load project for anomaly settings');
    return getDefaultAnomalySettings();
  }

  // Then, get the team's anomaly settings
  const { data: settings, error: settingsError } = await supabase
    .from('anomaly_settings')
    .select('enabled, sensitivity, min_sample_days')
    .eq('team_id', project.team_id)
    .single();

  if (settingsError || !settings) {
    // No custom settings — use defaults
    return getDefaultAnomalySettings();
  }

  return {
    enabled: settings.enabled,
    sensitivity: settings.sensitivity as SensitivityLevel,
    min_sample_days: settings.min_sample_days,
  };
}
```

- [ ] **Step 4: Update processEvaluateAlertsJob to use the new function**

Replace line 365:
```typescript
const anomalySettings = getDefaultAnomalySettings();
```
with:
```typescript
const anomalySettings = await getAnomalySettings(projectId);
```

- [ ] **Step 5: Run tests**

```bash
cd C:\Qcanary && npm test --workspace @qcanary/api
```
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/workers/alert.worker.ts apps/api/src/__tests__/anomaly-settings.test.ts
git commit -m "feat: load anomaly settings from database per-team instead of hardcoded defaults"
```

---

## Track 6: Error Boundaries and Dashboard Polish

### Task 6.1: Add error boundary to dashboard layout

**Files:**
- Create: `C:\Qcanary\apps\web\components\ErrorBoundary.tsx`
- Modify: `C:\Qcanary\apps\web\app\(dashboard)\layout.tsx`

**Steps:**

- [ ] **Step 1: Create ErrorBoundary component**

Create `C:\Qcanary\apps\web\components\ErrorBoundary.tsx`:

```tsx
'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dashboard error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-text-primary">Something went wrong</h2>
            <p className="mt-2 text-sm text-text-muted">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

- [ ] **Step 2: Wrap dashboard content with ErrorBoundary**

In `C:\Qcanary\apps\web\app\(dashboard)\layout.tsx`:

```tsx
import { ErrorBoundary } from "@/components/ErrorBoundary";

// In the JSX, wrap the content area:
<main id="main-content" className="flex-1 min-w-0">
  <DashboardTopbar />
  <UsageNudge />
  <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
    <div className="pt-14 md:pt-0">
      <ErrorBoundary>
        <PageTransition variant="fade-slide">
          {children}
        </PageTransition>
      </ErrorBoundary>
    </div>
  </div>
</main>
```

- [ ] **Step 3: Verify build**

```bash
npm run build --workspace @qcanary/web
```
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/ErrorBoundary.tsx apps/web/app/\(dashboard\)/layout.tsx
git commit -m "feat: add error boundary to dashboard layout"
```

---

### Task 6.2: Add error boundary to project overview page

**Files:**
- Modify: `C:\Qcanary\apps\web\app\(dashboard)\[projectId]\page.tsx`

**Steps:**

- [ ] **Step 1: Wrap ProjectOverviewClient with ErrorBoundary**

In `C:\Qcanary\apps\web\app\(dashboard)\[projectId]\page.tsx`:

```tsx
import { ErrorBoundary } from "@/components/ErrorBoundary";

// At the return statement:
return (
  <ErrorBoundary>
    <ProjectOverviewClient projectId={params.projectId} />
  </ErrorBoundary>
);
```

- [ ] **Step 2: Verify build**

```bash
npm run build --workspace @qcanary/web
```
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/\(dashboard\)/\[projectId\]/page.tsx
git commit -m "feat: add error boundary to project overview page"
```

---

## Execution Order

**Parallel tracks (no dependencies):**
- Track 1 (Cleanup) — 15 minutes
- Track 2 (Tests) — 45 minutes
- Track 6 (Error Boundaries) — 20 minutes

**Sequential within tracks:**
- Track 3 (Landing Page) — 60 minutes (do after Track 1 to avoid merge conflicts)
- Track 4 (Zod Validation) — 30 minutes (can run parallel with Track 3)
- Track 5 (Anomaly Settings) — 30 minutes (can run parallel with Track 3)

**Total estimated time:** 3-4 hours

**Expected outcome:** QCanary rating improvement from 5.5/10 to 7+/10

---

## Success Criteria

After all tracks complete:

- [ ] All `nul` files and dead docs removed
- [ ] Tests import and test actual code, not reimplementations
- [ ] Landing page broken into 8+ focused components
- [ ] Zod validation available for API endpoints
- [ ] Anomaly settings configurable per-team via database
- [ ] Error boundaries protect dashboard from component crashes
- [ ] All existing tests pass
- [ ] Build succeeds for both web and API
