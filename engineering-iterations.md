# QCanary Engineering — Iterative Fix Plan

Use this prompt to systematically address all code quality, performance, and architectural issues identified in the project audit. Each iteration follows a **build → typecheck → fix → review** cycle.

**Working directory:** `C:\qcanary`
**Typecheck command:** `cd /c/qcanary && npx tsc --noEmit --project apps/api/tsconfig.json && npx tsc --noEmit --project packages/agent/tsconfig.json`
**Review command:** Spawn a code-reviewer-deepseek-flash after each iteration.

Execute iterations **in order**. Skip any iteration whose changes are already in place.

---

## Iteration 1: Lazy-init Dodo Payments client

**Problem:** `src/lib/dodo.ts` throws at module scope when env vars are missing. Importing any file that transitively imports `dodo.ts` crashes the process even if billing isn't used. The `resend.ts` file already has the correct lazy-init pattern — follow it.

**Build:**
1. Read `src/lib/resend.ts` to study the lazy-init pattern (nullable singleton with `| null | undefined` sentinel)
2. Rewrite `src/lib/dodo.ts` to use the same pattern:
   - Remove module-scope `throw` statements
   - Remove module-scope `new DodoPayments(...)` instantiation
   - Create `getDodo(): DodoPayments` function that lazily initializes and caches
   - Create `getOrCreateWebhook(): Webhook` function with same lazy pattern
   - Keep `verifyDodoWebhook()` but make it call the lazy getter internally
3. Update `src/routes/billing.ts`:
   - Change `import { dodo, ... }` to `import { getDodo, ... }`
   - Replace `dodo.checkoutSessions.create(...)` with `getDodo().checkoutSessions.create(...)`
   - Replace `dodo.subscriptions.update(...)` with `getDodo().subscriptions.update(...)`

**Test:** Run typecheck on the API package. Verify no TypeScript errors.
**Fix:** Resolve any type errors from the refactor.
**Review:** Spawn a code-reviewer-deepseek-flash to verify the lazy-init pattern is correct and the re-export works for billing.ts.

---

## Iteration 2: Add time bounds to queue listing endpoint

**Problem:** `GET /v1/projects/:id/queues` (`src/routes/queues.ts`) loads **ALL** `job_events` for a project without any time limit. For projects with millions of events, this loads everything into memory — slow DB query + memory blowup in Node.

**Build:**
1. Read `src/routes/queues.ts` — focus on the `router.get('/:id/queues', ...)` handler
2. Import a helper or use inline logic to add a default time window:
   - Default: last 7 days (`7 * 24 * 60 * 60 * 1000`)
   - Support an optional `?window=` query param (in hours) so callers can override
3. Add `.gte('timestamp', cutoffIso)` to the Supabase query alongside the existing `.eq('project_id', projectId)`
4. Keep the existing response shape unchanged

**Test:** Run typecheck on the API package. Verify no errors.
**Fix:** Adjust if the cutoff ISO string format doesn't match the DB column type.
**Review:** Spawn a code-reviewer-deepseek-flash.

---

## Iteration 3: Fix agent API key prefix constant + docs

**Problem:** `packages/agent/src/utils.ts` has `isValidApiKeyFormat()` checking for `qc_` prefix with doc comment saying `"Keys are expected to start with 'qc_' prefix."`. The API actually creates keys with `qca_live_` prefix (see `src/routes/projects.ts:73`). The check works (because `qca_live_` starts with `qc_`), but the constant and docs are misleading.

**Build:**
1. Read `packages/agent/src/utils.ts` — find the `isValidApiKeyFormat` function
2. Change the prefix constant from `'qc_'` to `'qca_live_'` in the `startsWith` check
3. Update the doc comment to accurately reflect the real prefix
4. Keep the minimum length check (`>= 10`) as-is (valid keys are much longer than 10)

**Test:** Run typecheck on the agent package. Verify no errors.
**Fix:** N/A — straightforward change.
**Review:** Spawn a code-reviewer-deepseek-flash.

---

## Iteration 4: Move PostHog and Google Analytics keys to env vars

**Problem:** `components/PostHogProvider.tsx` hardcodes the PostHog API key. `app/layout.tsx` hardcodes the Google Analytics tracking ID. These should be environment variables for per-environment flexibility.

**Build:**
1. Read `components/PostHogProvider.tsx`:
   - Replace `const POSTHOG_KEY = "phc_..."` with environment variable lookup: `process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "phc_..."`
   - Replace `const POSTHOG_HOST = "https://app.posthog.com"` with `process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com"`
   - Keep the hardcoded values as fallbacks (safe defaults)
2. Read `app/layout.tsx`:
   - Replace the hardcoded `G-K86LMK6NE6` in the Google Analytics `<Script>` src and config with `process.env.NEXT_PUBLIC_GA_ID ?? "G-K86LMK6NE6"`
3. Add the new env var names to `.env.example`:
   - `NEXT_PUBLIC_POSTHOG_KEY=`
   - `NEXT_PUBLIC_POSTHOG_HOST=`
   - `NEXT_PUBLIC_GA_ID=`

**Test:** Run the web app's build: `cd /c/qcanary/apps/web && npx next build 2>&1 | tail -20` (may fail due to missing deps — catch this gracefully).
**Fix:** Ensure TypeScript types for `process.env` accept the new keys.
**Review:** Spawn a code-reviewer-deepseek-flash.

---

## Iteration 5: Fix email templates for email client compatibility

**Problem:** The three email templates (`emails/WelcomeEmail.tsx`, `TipsEmail.tsx`, `UpgradeEmail.tsx`) use `backgroundColor: "#0A0A0A"` (dark theme). Many email clients (Gmail, Outlook, Yahoo) strip custom backgrounds, force light mode, or render dark backgrounds as black boxes. This makes emails unreadable for users with light-mode email clients.

**Build:**
1. Read all three email templates
2. For each template:
   - Change body background to `#FFFFFF` (white) for maximum compatibility
   - Change text colors from `#FAFAFA` to `#1A1A1A` (dark text on white)
   - Change the muted text (`#D4D4D8`) to `#71717A` (still gray, but visible on white)
   - Keep the button (green accent) and code block styles — they work on both backgrounds
   - Keep the heading style as-is (black/dark on white is fine)
3. Add `<Preview>` tags as a dark-mode hint if possible (some clients respect `prefers-color-scheme` media queries in `<style>` blocks — add a simple inline stylesheet for dark mode support)

**Test:** Review the rendered output conceptually. Email templates can't be typechecked in the same way; verify they still parse as valid TSX.
**Fix:** Ensure react-email components still render correctly.
**Review:** Spawn a code-reviewer-deepseek-flash.

---

## Iteration 6: Add IPv6 loopback support to Redis localhost check

**Problem:** `src/lib/redis.ts` only checks for `'localhost'` and `'127.0.0.1'` when deciding whether to disable TLS. The IPv6 loopback address `'::1'` is not handled — if someone connects to `redis://[::1]:6379`, the code would still try TLS and fail.

**Build:**
1. Read `src/lib/redis.ts` — find `isLocalRedis` check
2. Add `upstashConfig.redisHost === '::1'` to the existing check
3. Keep the existing logic otherwise

**Test:** Run typecheck on the API package. Verify no errors.
**Fix:** N/A — trivial change.
**Review:** Spawn a code-reviewer-deepseek-flash.

---

## Iteration 7: Update render.yaml with repo URL and CRON_SECRET

**Problem:** `render.yaml` has a placeholder `YOUR_USERNAME/qcanary` for the GitHub repo URL that will never deploy as-is. Also, the `CRON_SECRET` env var isn't listed in the `render.yaml` env vars but is used by the API for notification endpoints.

**Build:**
1. Read `render.yaml`
2. Replace `https://github.com/YOUR_USERNAME/qcanary` with `https://github.com/qcanary/qcanary`
3. Add `CRON_SECRET` to the API service's `envVars` list (with `sync: false`)
4. Verify the worker service has all needed env vars (it's missing `CRON_SECRET`, `ALLOWED_ORIGINS`, `APP_URL`, `API_BASE_URL`, `CLERK_*`, `DODO_STARTER_PRODUCT_ID`, `DODO_PRO_PRODUCT_ID` — add only the ones the worker actually needs)

**Test:** Validate YAML syntax: not easily testable — just verify the file looks correct.
**Fix:** Ensure indentation is consistent (2-space YAML).
**Review:** Spawn a code-reviewer-deepseek-flash.

---

## Iteration 8: Add Vitest test infrastructure with smoke tests

**Problem:** The project has zero tests. No test framework is installed. Every deployment is a blind push.

**Build:**
1. Install Vitest for the API package: `cd /c/qcanary/apps/api && npm install --save-dev vitest`
2. Create `apps/api/vitest.config.ts` with minimal config (point to `src` directory)
3. Create `apps/api/src/__tests__/health.test.ts`:
   - Import the Express app from `../index`
   - Write a supertest-like smoke test that checks `GET /health` returns 200
   - (If supertest isn't available, use a simple fetch-based test with the server)
4. Create `apps/api/src/__tests__/dodo.test.ts`:
   - Mock `process.env.DODO_SECRET_KEY` being unset
   - Verify `getDodo()` throws the expected error
5. Add a test script to `apps/api/package.json`: `"test": "vitest run"`
6. Add `apps/api/src/__tests__/redis.test.ts`:
   - Test the `isLocalRedis` logic in isolation (extract it or test via module)
   - Verify localhost/127.0.0.1/::1 return non-TLS config
   - Verify `upstash.io` host returns TLS config

**Test:** Run `cd /c/qcanary/apps/api && npx vitest run 2>&1`. Fix any test failures.
**Fix:** The health test may need the server to be started differently — handle gracefully.
**Review:** Spawn a code-reviewer-deepseek-flash.

---

## Iteration 9: Clean up temp log files and add to gitignore

**Problem:** The project has accumulated temporary log files from previous runs:
- `apps/api/tmp-api-4010.err.log`, `tmp-api-4010.out.log`, `tmp-api.err.log`, `tmp-api.out.log`
- `apps/web/tmp-next-dev.err.log`, `tmp-web-3100.*.log`, etc. (9+ files)

These are already matched by `*.log` in `.gitignore`, but they clutter the working directory. There's also no `.gitkeep` patterns for necessary empty directories.

**Build:**
1. List all `tmp-*.log` and `*.err.log` and `*.out.log` files in `apps/api` and `apps/web`
2. Delete them: `rm -f apps/api/tmp-*.log apps/api/*.err.log apps/api/*.out.log apps/web/tmp-*.log`
3. Add a more specific gitignore entry for these patterns:
   - Add `tmp-*` and `*.err.log` and `*.out.log` to the root `.gitignore` under the `# Logs` section
4. Keep `*.log` in gitignore (already there)

**Test:** Run `git status` to verify no untracked log files remain.
**Fix:** N/A — file cleanup.
**Review:** Spawn a code-reviewer-deepseek-flash.

---

## Iteration 10: Add React error boundaries and dashboard loading states

**Problem:** The web frontend (Next.js dashboard pages) likely has no error boundaries or loading states from what was visible. When Supabase queries fail or Redis is down, users may see a blank page or unhandled error screen instead of a graceful fallback.

**Build:**
1. Create `apps/web/components/ui/error-boundary.tsx`:
   - A React error boundary component that catches rendering errors
   - Shows a styled fallback UI with the Qcanary branding (dark theme, green accent)
   - Includes a "Try again" button that resets the error state
2. Create `apps/web/components/ui/loading-skeleton.tsx`:
   - A reusable loading skeleton component with pulse animation
   - Variants: row, card, chart (for the dashboard)
   - Uses the existing CSS animation classes from `globals.css`
3. Read the dashboard layout file(s) — add the ErrorBoundary wrapper
4. Read a few dashboard data-fetching pages — add loading.tsx files or Suspense boundaries

**Test:** Verify the components compile: `npx tsc --noEmit --project apps/web/tsconfig.json 2>&1 | head -30`
**Fix:** Fix any import path or type issues.
**Review:** Spawn a code-reviewer-deepseek-flash.

---

## Non-Goals (Don't Do)

- Do not change the API response shapes — the dashboard frontend depends on them
- Do not remove existing functionality — only add guardrails and fixes
- Do not add heavy dependencies — Vitest is the only new production dep, everything else is dev-only
- Do not change the Redis connection logic beyond what's listed (the TLS fix is already done)
- Do not refactor the database schema — only app-level changes

---

## Verification Checklist (Run After All Iterations)

- [ ] `npx tsc --noEmit --project apps/api/tsconfig.json` passes
- [ ] `npx tsc --noEmit --project packages/agent/tsconfig.json` passes
- [ ] `npx vitest run` passes (at least 3 smoke tests)
- [ ] `git status` shows no leftover log files
- [ ] `render.yaml` has valid repo URL and all required env vars
- [ ] `.env.example` has all new env var names documented
- [ ] All code-reviewer-deepseek-flash reviews addressed
