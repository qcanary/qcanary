---
tags: [moc, index]
aliases: [Index, Map of Content]
created: 2026-07-13
---

# QCanary — Session Map of Content

## Deploy Pipeline
- [[_deploy-pipeline|Deploy Pipeline Architecture]] — Vercel + Cloudflare, how deploys work, what to check when stale

## Session Notes

### Master Session 1 (Pre-history)
— Docs duplicate "Projects" row fix (not recorded in detail)

### [[session-02-deploy-investigation|Master Session 2 — Deploy Investigation & Auth Fixes]]
- Deploy pipeline investigation (Vercel, Cloudflare caching)
- Server-side project ownership check on `[projectId]` routes
- Sitemap missing routes fix
- Docs duplicate "Projects" row deploy

### [[session-03-seo-audit|SEO & Performance Audit]]
- Full SEO audit (canonicals, titles, meta descriptions, JSON-LD, heading hierarchy)
- Performance audit (TTFB)
- Accessibility / design review
- No code changes — pure findings

### [[session-04-canonical-and-titles|Canonical URLs & Title Brand Fix]]
- Root layout `alternates.canonical` hardcoded to root → ALL pages canonicalized to `/`
- Title template double-applied brand on 5 pages
- Fixed 9 files total

### [[session-05-og-url-and-jsonld|og:url Fix & JSON-LD Addition]]
- Root layout `openGraph.url` hardcoded to root → ALL pages had wrong `og:url`
- Added Product JSON-LD schema to `/pricing`
- Verified `Article` schema already existed on blog posts

## Audit Inventory
- [[_audit-inventory|Known Issues & Remaining Work]] — open items from all sessions
