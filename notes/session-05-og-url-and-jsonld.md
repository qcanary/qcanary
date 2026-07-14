---
tags: [session, seo, metadata, opengraph, json-ld, structured-data]
aliases: [Session 5, og:url Fix, JSON-LD, Product Schema]
created: 2026-07-13
---

# Session 5 — og:url Fix & JSON-LD Addition

## Root Cause Analysis

### og:url Bug — Same pattern as canonical

```tsx
// layout.tsx
openGraph: {
    url: siteUrl,  // "https://qcanary.dev" — for EVERY page
    title: siteName,
    description: siteDescription,
    images: [{ url: "/opengraph-image", ... }],
},
```

All non-homepage marketing pages inherited `openGraph.url: siteUrl` from the root layout. Pages that already defined their own `openGraph` block (pricing, docs, blog, ph) omitted `url`. Pages without any `openGraph` block (features, compare, about, contact) inherited the root's full OG object including the wrong URL.

The only page with correct `og:url` was `blog/[slug]`, which explicitly set `url: \`${siteUrl}/blog/${post.slug}\``.

## Fix — og:url

Added `url: \`${siteUrl}/<path>\`` to each marketing page's `openGraph` block:

| Page | Had openGraph before? | Change |
|---|---|---|
| `/pricing` | ✅ (title, desc only) | Added `url: \`${siteUrl}/pricing\`` |
| `/features` | ❌ | Added minimal `openGraph: { url: \`${siteUrl}/features\` }` |
| `/compare` | ❌ | Added minimal `openGraph: { url: \`${siteUrl}/compare\` }` |
| `/about` | ❌ | Added minimal `openGraph: { url: \`${siteUrl}/about\` }` |
| `/contact` | ❌ | Added minimal `openGraph: { url: \`${siteUrl}/contact\` }` |
| `/docs` | ✅ (title, desc only) | Added `url: \`${siteUrl}/docs\`` |
| `/blog` | ✅ (title, desc only) | Added `url: \`${siteUrl}/blog\`` |
| `/ph` | ✅ (title, desc only) | Added `url: \`${siteUrl}/ph\`` |
| `/blog/[slug]` | ✅ (already had url) | No change needed |
| `/` (homepage) | ❌ | Inherits root's `url: siteUrl` — correct |

## JSON-LD Additions

### /pricing — Product Schema
Added `<Script id="json-ld-product">` to the pricing page with a `Product` schema containing 3 `Offer` sub-schemas:

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "QCanary",
  "applicationCategory": "DeveloperApplication",
  "description": "Monitor BullMQ queues without sharing Redis credentials.",
  "offers": [
    {
      "@type": "Offer",
      "name": "Free",
      "price": "0",
      "priceCurrency": "USD",
      "description": "1 project, 1 queue, 24h history, 1K events/day, email alerts (1 rule)."
    },
    {
      "@type": "Offer",
      "name": "Starter",
      "price": "9",
      "priceCurrency": "USD",
      "priceInterval": "Monthly",
      "description": "3 projects, 10 queues, 30-day history, 100K events/day, Slack + Email alerts."
    },
    {
      "@type": "Offer",
      "name": "Pro",
      "price": "24",
      "priceCurrency": "USD",
      "priceInterval": "Monthly",
      "description": "Unlimited projects & queues, 90-day history, unlimited events, Webhook alerts."
    }
  ]
}
```

### /blog/[slug] — Article Schema (already existed)
Confirmed the blog post page already had an `Article` JSON-LD with `headline`, `description`, `datePublished`, `author`, `publisher`, `mainEntityOfPage`. No changes needed.

### Skipped
- `/blog` (listing) — user explicitly said skip
- `/docs` — already has `BreadcrumbList`; user said skip unless clear fit

## Trade-off Note

For 4 pages (features, compare, about, contact) that previously had NO `openGraph` block, setting a minimal `openGraph: { url: ... }` replaces the inherited root `openGraph` entirely. This means they lose:
- `og:title` (falls back to page `<title>`)
- `og:description` (falls back to meta description)
- `og:image` (OG image generation still works via `opengraph-image.tsx`)

The pages that already had `openGraph` blocks (pricing, docs, blog, ph) were unaffected — adding `url` to their existing block is clean.

## Live Verification

| Route | og:url Before | og:url After | Verified |
|---|---|---|---|
| `/` | — | `https://qcanary.dev` | ✅ |
| `/pricing` | ~~`https://qcanary.dev`~~ | `https://qcanary.dev/pricing` | ✅ |
| `/about` | ~~`https://qcanary.dev`~~ | `https://qcanary.dev/about` | ✅ |
| `/docs` | ~~`https://qcanary.dev`~~ | `https://qcanary.dev/docs` | ✅ |
| `/blog` | ~~`https://qcanary.dev`~~ | `https://qcanary.dev/blog` | ✅ |
| `/blog/[slug]` | Already correct | Already correct | ✅ |

JSON-LD: `json-ld-product` ID confirmed on `/pricing`, `json-ld-blog-article` ID confirmed on blog post.

## Files Changed (9 total)
- `apps/web/app/(marketing)/pricing/page.tsx` — Added `Script` import, `openGraph.url`, Product JSON-LD block
- `apps/web/app/(marketing)/features/page.tsx` — Added `openGraph.url`
- `apps/web/app/(marketing)/compare/page.tsx` — Added `openGraph.url`
- `apps/web/app/(marketing)/about/page.tsx` — Added `openGraph.url`
- `apps/web/app/(marketing)/contact/page.tsx` — Added `openGraph.url`
- `apps/web/app/(marketing)/docs/page.tsx` — Added `openGraph.url`
- `apps/web/app/(marketing)/blog/page.tsx` — Added `openGraph.url`
- `apps/web/app/(marketing)/ph/page.tsx` — Added `openGraph.url`

## Commit
- `a8dca68` — Fix og:url on all marketing pages and add Product JSON-LD to /pricing
