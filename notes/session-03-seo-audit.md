---
tags: [session, audit, seo, performance, accessibility]
aliases: [Session 3, SEO Audit, Performance Audit, Accessibility Audit]
created: 2026-07-13
---

# Session 3 — Full SEO, Performance & Accessibility Audit

> Pure audit — no code changes made. Findings below.

## Skills Used
- `webapp-testing` — browser-use (headless Chrome) for DOM inspection
- `seo-audit` — methodology for crawlability, meta tags, structured data
- `performance-optimization` — TTFB measurements per route
- `web-design-guidelines` — Vercel Web Interface Guidelines compliance

## Step 1 — Docs "Plans & Limits" Table (Browser Verifcation)
**Tool:** `browser-use` (headless Chrome, not curl)

| Metric | Value |
|---|---|
| Feature rows | 8 |
| "Projects" rows | **1** (confirmed) |
| Console errors | 3 CORS warnings (Clerk prefetch, non-blocking) |

## Step 2 — SEO Audit

### Crawlability
| Route | HTTP | Size | Content-Type |
|---|---|---|---|
| `/` | 200 | 244KB | text/html |
| `/pricing` | 200 | 68KB | text/html |
| `/features` | 200 | 67KB | text/html |
| `/compare` | 200 | 63KB | text/html |
| `/about` | 200 | 44KB | text/html |
| `/contact` | 200 | 40KB | text/html |
| `/docs` | 200 | 80KB | text/html |
| `/blog` | 200 | 26KB | text/html |

All routes return 200 — no soft 404s, no redirect chains.

### Meta Titles & Descriptions
| Route | Title Issue |
|---|---|
| `/pricing` | "Pricing — Qcanary — **Qcanary**" ⚠️ Double brand |
| `/features` | "Features — Qcanary — **Qcanary**" ⚠️ Double brand |
| `/about` | "About — **Qcanary — Qcanary**" ⚠️ Double brand |
| `/contact` | "Contact — **Qcanary — Qcanary**" ⚠️ Double brand |

**Canonical tags:** ALL non-homepage pages canonicalized to `https://qcanary.dev` ⚠️

**Missing canonical:** ALL non-homepage pages (since fixed in Session 4)

**JSON-LD structured data:**
- Homepage: `SoftwareApplication` + `FAQPage` ✅
- Blog posts: `Article` + `BreadcrumbList` ✅
- `/pricing`: Missing `Product` schema (since fixed in Session 5)
- Unused `BlogPosting` in blog listing — removed

**Headings:**
- Homepage `h1` → `h3` skip (no `h2`) ⚠️
- All other routes: clean hierarchy ✅

## Step 3 — Performance

| Route | TTFB | Size |
|---|---|---|
| `/` | 0.112s | 244KB |
| `/pricing` | 0.087s | 68KB |
| `/features` | 0.094s | 67KB |
| `/compare` | 0.089s | 63KB |
| `/about` | 0.082s | 44KB |
| `/contact` | 0.078s | 40KB |
| `/docs` | 0.109s | 80KB |
| `/blog` | 0.071s | 26KB |

All well under 800ms threshold. Full Lighthouse LCP/CLS/INP not measurable from sandbox.

## Step 4 — Accessibility & Design

### WCAG Issues Found
- **Heading hierarchy:** Homepage jumps from `h1` to `h3` (skipping `h2`)
- **Console errors:** 3 CORS warnings from Clerk sign-in prefetch (non-blocking)

### Compliance per Vercel Web Interface Guidelines
- `scroll-margin-top` for anchor targets: Not confirmed
- `safe-area-inset` for notched devices: Not confirmed (likely not needed with 0A0A0A background)
- `color-scheme` meta tag: Not confirmed
- Skip-to-content link: ✅ Present

## Cross-References
- Session 4 fixed the canonical + title bugs found here
- Session 5 fixed the `og:url` bug and added pricing JSON-LD
