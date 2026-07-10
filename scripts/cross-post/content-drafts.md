# Cross-Post Content Drafts

> Target: Share the story of building qcanary.dev — BullMQ monitoring without Redis credentials.
> Post to: Reddit r/node, Hacker News, dev.to

---

## Version A: Technical Deep-Dive (HN + dev.to)

### Title
**How We Built BullMQ Monitoring Without Redis Credentials**

### Body

We run BullMQ in production and wanted basic monitoring — failed job counts, queue depth, alerting on failure rates. Every option we found required connecting directly to Redis, which our security team blocked.

So we built a different approach: a tiny Node.js agent that sits alongside the worker process, hooks into BullMQ lifecycle events, and forwards them to a hosted API via HTTP.

**How it works:**

1. Install `@qcanary/agent` in the same process that creates your BullMQ queues
2. The agent listens to `global:completed`, `global:failed`, `global:stalled`, etc.
3. Events are batched and sent to the API asynchronously (no `await` — fire-and-forget)
4. The API stores them in Postgres, aggregates into hourly metrics via a Supabase RPC, and evaluates alert rules
5. The dashboard shows live queue health via Supabase Realtime subscriptions

**Key decisions:**

- **No Redis credentials needed** — The agent never connects to Redis. It uses BullMQ's built-in event emitter (`QueueEvents`). This was the #1 requirement.
- **Fire-and-forget ingest** — The ingest endpoint returns 200 immediately and processes asynchronously. This keeps the agent lightweight.
- **Supabase Realtime for live updates** — When a new event arrives, Postgres triggers a NOTIFY, and the dashboard updates in real-time via Supabase's websocket proxy.
- **BullMQ for alert evaluation** — Meta, right? We use a separate BullMQ queue to evaluate alert rules and deliver notifications via Slack/email/webhook.

**What we'd do differently:**

- The hourly metric aggregation RPC is fast but creating a materialized view would be cleaner
- Alert evaluation in BullMQ is overkill for most use cases — a simple scheduler loop would suffice
- Should have used tRPC instead of custom fetch wrappers on the frontend

**Tech stack:** TypeScript, Next.js, Express, Supabase (Postgres + Realtime), Redis (BullMQ), Resend (email), Dodo Payments (billing), Clerk (auth), PostHog (analytics)

Would love feedback from others who've tackled queue monitoring. The project is open-core at github.com/qcanary/qcanary and free to use at qcanary.dev.

---

## Version B: Shorter, Problem-Focused (Reddit r/node)

### Title
**Built an open-source BullMQ monitoring dashboard — no Redis credentials required**

### Body

Like many of you, we use BullMQ in production. We wanted basic monitoring (failure rates, queue depth, alerts) but every solution required direct Redis access. Our infrastructure team wasn't having it.

So we built an agent-based approach: a lightweight listener that hooks into BullMQ's `QueueEvents` and forwards events to a hosted dashboard via HTTP. No Redis credentials ever leave the worker process.

**Stack:** TypeScript, Next.js, Express, Supabase, BullMQ (yes, we use BullMQ to evaluate alert rules — meta, I know)

**Features:**
- Live queue health via Supabase Realtime
- Failure rate / no activity / queue depth alerts (Slack, email, webhook)
- 7-day and 30-day metrics with charts
- Free tier to start, paid for alerts and history

It's open-core: github.com/qcanary/qcanary
Free to use: qcanary.dev

Curious what the r/node community thinks about the architecture — especially anyone who's built similar tooling around BullMQ.

---

## Social Posts (Twitter/X, LinkedIn)

### Twitter/X

```
We built qcanary.dev — monitoring for BullMQ queues.
No Redis credentials needed. Just hook into QueueEvents.
Free tier available. Open-core.

Built with: Next.js, Supabase, TypeScript
github.com/qcanary/qcanary
```

### LinkedIn

```
Proud to share qcanary.dev — an open-source monitoring dashboard for BullMQ queues.

The key insight: instead of connecting directly to Redis, our agent hooks into BullMQ's
built-in QueueEvents and forwards data via HTTP. No Redis credentials leave your worker process.

Built with TypeScript, Next.js, Express, Supabase, and BullMQ (meta, I know — we use
BullMQ to evaluate your alert rules).

Free to start, open-core at github.com/qcanary/qcanary.

Would love feedback from the queue-processing community!
```

---

## Posting Schedule

| Platform | Date | Version | Notes |
|----------|------|---------|-------|
| dev.to | Day 1 | A | Full technical deep-dive |
| HN | Day 1 | A | Same as dev.to, or shorter |
| r/node | Day 2 | B | Problem-focused, community vibe |
| Twitter/X | Day 3 | Social | Short link + hook |
| LinkedIn | Day 3 | Social | Professional audience |
