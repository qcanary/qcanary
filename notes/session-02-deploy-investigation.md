---
tags: [session, deploy, auth, sitemap, seo]
aliases: [Session 2, Deploy Investigation, Auth Fixes, Sitemap Fix]
created: 2026-07-13
---

# Session 2 — Deploy Investigation, Auth Fixes & Sitemap

## Deploy Pipeline Investigation
**Issue:** Pushed commit showing fix on `origin/main` but live site not updating.

**Investigation:** Checked DNS, response headers, Vercel deployment config, build pipeline:

```
nslookup qcanary.dev       → Cloudflare
curl headers               → Server: cloudflare, X-Vercel-Id: bom1::...
X-Vercel-Cache: HIT        → Vercel edge serving stale
```

**Findings:**
- Two caching layers: Cloudflare CDN + Vercel Edge Cache
- No Vercel CLI installed, no `VERCEL_TOKEN` env var
- No deploy hook URL in codebase
- `render.yaml` builds Docker for API, but Next.js app is deployed via Vercel
- Force-push triggered new Vercel deploy

**Resolution:** Commit and push to `origin/main`. Vercel auto-deploys. New deployment invalidates edge cache.

**Skills discovered in environment:**
- `deploy-to-vercel` skill has no-auth fallback scripts (`deploy.sh`) for preview deploys
- 24 total skills: auth (4), deploy (2), UI/design (5), performance (3), database (3), SEO (1), testing (1), TypeScript (1), onboarding (1), ponytail (5)

## Server-Side Project Ownership Check
**Issue:** `[projectId]` dashboard route rendered chrome (sidebar, topbar) for any projectId, even non-existent ones. Auth check only checked `userId` existence — didn't verify user actually owns the project.

**Fix:**
- Added server-side `fetch(API_BASE_URL/v1/projects)` with auth token before rendering
- If `projectId` not in user's projects list → `redirect("/sign-in")`
- Catch block also redirects on API failure (was silently falling through)

**Files changed:**
- `apps/web/app/(dashboard)/[projectId]/page.tsx`

## Sitemap Fix
**Issue:** Sitemap missing 5 routes (`/pricing`, `/features`, `/compare`, `/about`, `/contact`) and incorrectly included auth routes (`/sign-in`, `/sign-up`).

**Fix:** Added 5 missing routes, removed 2 auth routes.

**Files changed:**
- `apps/web/app/sitemap.ts`

## Commits
- `a3bb08b` — Fix duplicate Projects row + server-side project ownership check
- `49a00d5` — Fix sitemap: add missing routes, remove auth routes
- `9cac9a8` — Fix catch block: redirect to sign-in on API failure
