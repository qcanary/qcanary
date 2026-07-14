---
tags: [deploy, infrastructure]
aliases: [Deploy Pipeline, Vercel Deploy]
created: 2026-07-13
---

# Deploy Pipeline Architecture

## Architecture
```
User → Cloudflare (CDN) → Vercel (Next.js Origin)
```

## Services
| Service | Role | Evidence |
|---|---|---|
| **Cloudflare** | CDN, DNS, caching | `Server: cloudflare`, `Cf-Cache-Status` headers |
| **Vercel** | Origin server, Next.js hosting | `X-Vercel-Id: bom1::...` headers |
| **GitHub** | Source of truth | `origin → https://github.com/qcanary/qcanary.git` |

## Deploy Flow
1. Push to `main` branch on GitHub
2. Vercel detects push and triggers build from Dockerfile
3. Build output deployed to Vercel edge
4. Cloudflare CDN eventually picks up new content (cache TTL-dependent)

## Stale Content Investigation
**Issue:** Pushed commits not showing live after 60+ seconds.

**Root cause:** Vercel edge cache (`X-Vercel-Cache: HIT`) serving previous deployment. Multiple `?verify=` cache-busting params don't bypass Vercel edge — they only bypass browser cache.

**Resolution:** Deploy must complete first. After deployment, Vercel edge cache is automatically invalidated. Commits pushed to `origin/main` → Vercel auto-deploys → cache invalidation.

## Known Constraints
- No `VERCEL_TOKEN` or Vercel deploy hook URL available in this environment
- No `.vercel/project.json` (project not linked locally)
- `robots.txt` is Cloudflare-managed — the app's `robots.ts` is overridden by Cloudflare rules
