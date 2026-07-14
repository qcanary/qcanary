---
tags: [session, seo, metadata, canonical, titles]
aliases: [Session 4, Canonical Fix, Title Brand Fix, Metadata Fix]
created: 2026-07-13
---

# Session 4 — Canonical URLs & Title Brand Duplication Fix

## Root Cause Analysis

**Both bugs shared one root cause** — the root layout's metadata config (`apps/web/app/layout.tsx`).

### Bug 1 — Canonical (ALL pages → root)

```tsx
// layout.tsx
alternates: {
  canonical: siteUrl,  // "https://qcanary.dev" — for EVERY page
},
```

No individual marketing page overrode `alternates.canonical`, so every page inherited the root URL.

**Fix:** Kept `canonical: siteUrl` in root layout (covers homepage), added per-page `alternates: { canonical: \`${siteUrl}/<path>\` }` to all 8 marketing pages.

### Bug 2 — Title Double-Brand (5 pages)

```tsx
// layout.tsx
title: { template: `%s — Qcanary` },
```

Root layout has a template that appends `— Qcanary` to every page title. But 5 pages manually included `— Qcanary` in their own title string, causing double-application.

**Affected pages (Before → After with template):**

| Page | Before (manual) | After template (before fix) | After template (after fix) |
|---|---|---|---|
| `/about` | `"About — Qcanary"` | `"About — Qcanary — Qcanary"` ❌ | `"About — Qcanary"` ✅ |
| `/contact` | `"Contact — Qcanary"` | `"Contact — Qcanary — Qcanary"` ❌ | `"Contact — Qcanary"` ✅ |
| `/features` | `"Features — Qcanary"` | `"Features — Qcanary — Qcanary"` ❌ | `"Features — Qcanary"` ✅ |
| `/pricing` | `"Pricing — Qcanary"` | `"Pricing — Qcanary — Qcanary"` ❌ | `"Pricing — Qcanary"` ✅ |
| `/ph` | `"Product Hunt Launch — Qcanary"` | `"Product Hunt Launch — Qcanary — Qcanary"` ❌ | `"Product Hunt Launch — Qcanary"` ✅ |

**Fix:** Removed `— Qcanary` suffix from the 5 pages' titles. The root layout's template now correctly appends it exactly once.

## Files Changed (9 total)

| File | Change |
|---|---|
| `apps/web/app/layout.tsx` | Kept `canonical: siteUrl` (restored after test removal) |
| `apps/web/app/(marketing)/about/page.tsx` | Title: `"About — Qcanary"` → `"About"`; added `siteUrl` + canonical |
| `apps/web/app/(marketing)/contact/page.tsx` | Title: `"Contact — Qcanary"` → `"Contact"`; added `siteUrl` + canonical |
| `apps/web/app/(marketing)/features/page.tsx` | Title: `"Features — Qcanary"` → `"Features"`; added `siteUrl` + canonical |
| `apps/web/app/(marketing)/pricing/page.tsx` | Title: `"Pricing — Qcanary"` → `"Pricing"`; added `siteUrl` + canonical |
| `apps/web/app/(marketing)/ph/page.tsx` | Title: `"Product Hunt Launch — Qcanary"` → `"Product Hunt Launch"`; added `siteUrl` + canonical |
| `apps/web/app/(marketing)/compare/page.tsx` | Added `siteUrl` + canonical |
| `apps/web/app/(marketing)/docs/page.tsx` | Added canonical (`siteUrl` already existed) |
| `apps/web/app/(marketing)/blog/page.tsx` | Added canonical (`siteUrl` already existed) |

## Live Verification

All 9 routes confirmed live:

| Route | Title (After) | Canonical (After) |
|---|---|---|
| `/` | Monitor BullMQ Without Exposing Redis — Qcanary | `https://qcanary.dev` |
| `/pricing` | Pricing — Qcanary | `https://qcanary.dev/pricing` |
| `/features` | Features — Qcanary | `https://qcanary.dev/features` |
| `/compare` | Qcanary vs Bull-Board — Qcanary | `https://qcanary.dev/compare` |
| `/about` | About — Qcanary | `https://qcanary.dev/about` |
| `/contact` | Contact — Qcanary | `https://qcanary.dev/contact` |
| `/docs` | QCanary Docs — BullMQ Monitoring Agent — Qcanary | `https://qcanary.dev/docs` |
| `/blog` | QCanary Blog — Qcanary | `https://qcanary.dev/blog` |
| `/ph` | Product Hunt Launch — Qcanary | `https://qcanary.dev/ph` |

## Commits
- `4b91697` — Fix canonical URLs and title brand duplication across all marketing pages
- `e4af5c3` — Fix canonical URLs and title brand duplication across all marketing pages
