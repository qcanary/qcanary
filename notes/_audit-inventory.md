---
tags: [audit, inventory, todo]
aliases: [Known Issues, Remaining Work, Audit Inventory]
created: 2026-07-13
---

# Audit Inventory — Known Issues & Remaining Work

## Open Issues

| Priority | Issue | First Identified | Notes |
|---|---|---|---|
| High | **/not-found.tsx returns HTTP 200** instead of 404 | Master Session 2 | Content is correct branded 404, but HTTP status is 200. Likely Next.js App Router behavior — may need middleware catch-all. |
| Medium | **`apiBaseUrl()` duplicated** in `[projectId]/page.tsx` and `api/v1/[...path]/route.ts` | Master Session 2 | Should be extracted to shared utility. |
| Low | **Minimal `openGraph` on 4 pages** (features, compare, about, contact) drops inherited OG title/description/image | Session 5 | These pages had no `openGraph` block before, inherited root's rich OG metadata. Now they set minimal `openGraph: { url: ... }`, losing OG title/desc/image. |
| Low | **`robots.txt` entirely Cloudflare-managed** — app's `robots.ts` never reaches crawlers | Master Session 2 | Cloudflare config setting, not a code fix. |
| Low | **`/billing` route** exists in middleware `isPublicRoute` — not verified for correctness or sitemap inclusion | Master Session 2 | Unknown if marketing page or behind-auth billing portal. |

## Fixed Issues

| Fix | Session | Status |
|---|---|---|
| Docs "Projects" row duplicate | Master Session 1 | ✅ Live verified |
| Server-side project ownership check | Master Session 2 | ✅ Live verified |
| Sitemap missing routes (/pricing, /features, /compare, /about, /contact) | Master Session 2 | ✅ Live verified |
| Sitemap included auth routes (/sign-in, /sign-up) — removed | Master Session 2 | ✅ Live verified |
| Catch block on [projectId] silently falling through → redirects to sign-in | Master Session 2 | ✅ Live verified |
| Canonical URLs hardcoded to root → self-referencing per page | Session 4 | ✅ Live verified |
| Title brand double-application on 5 pages | Session 4 | ✅ Live verified |
| `og:url` hardcoded to root → self-referencing per page | Session 5 | ✅ Live verified |
| Product JSON-LD schema added to /pricing | Session 5 | ✅ Live verified |

## Verified Working (No Change Needed)

| Item | Session | Notes |
|---|---|---|
| All 31 CTAs across 7 marketing pages point to `/sign-up` | Master Session 2 | Consistent |
| Duplicate numeric limits in pricing tables | Master Session 2 | 4 occurrences across 2 files, all matching |
| Zero JS console errors on live homepage | Master Session 2 | Confirmed via browser automation |
| Article schema on blog posts | Session 5 | Already had proper `Article` JSON-LD |
| Blog post canonical (self-referencing) | Session 4 | Already correct |
