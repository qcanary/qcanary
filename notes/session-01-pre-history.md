---
tags: [session, seo, metadata]
aliases: [Session 1, Docs Duplicate Row Fix]
created: 2026-07-13
---

# Session 1 — Docs "Projects" Row Duplicate Fix (Pre-history)

> This session was completed before the detailed note-taking practice began. Key accomplishment recorded here for completeness.

## Problem
The `/docs` page's "Plans & limits" table had the "Projects" row appearing **twice** (duplicate `<tr>` element).

## Fix
- Removed one of the two identical `Projects` `<tr>` elements from `apps/web/app/(marketing)/docs/page.tsx`
- Source confirmed: exactly 1 row containing "Projects" in the table

## Verification
- Curl-based check showed 2 rows due to Vercel edge cache
- Browser-based check (Playwright) confirmed 1 row in actual DOM
- All 8 feature rows now unique: Projects, Queues per project, Event history, Events/day, Slack alerts, Email alerts, Webhook alerts, Team members

## Files Changed
- `apps/web/app/(marketing)/docs/page.tsx`

## Commit
- `a3bb08b` — Fix duplicate Projects row in /docs pricing table and add server-side project ownership check to [projectId] route
