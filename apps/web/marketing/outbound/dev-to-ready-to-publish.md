---
title: "How to Monitor BullMQ in Production Without Exposing Redis"
published: false
description: "A practical guide to monitoring BullMQ queues with an agent-based approach that keeps Redis credentials inside your infrastructure. No REDIS_URL sharing required."
tags: node, bullmq, redis, devops
cover_image: https://qcanary.dev/screenshots/dashboard-overview.png
series: false
---

BullMQ is a great default for Node.js background jobs. Fast, Redis-backed, flexible enough for emails, reports, webhooks, imports, notifications, and retry-heavy workflows.

But once BullMQ is in production, a question shows up quickly:

**How do you monitor queues without giving another service direct access to Redis?**

Many queue dashboards ask for your Redis URL. That works — but it comes with security tradeoffs:

- **Credential exposure.** Your production Redis URL gets stored by a third party.
- **Firewall changes.** You open port 6379 or set up VPC peering — for a dashboard.
- **Compliance surface.** SOC 2 and zero-trust policies require a vendor risk assessment.
- **Full data access.** Redis has no row-level security. Once someone has the URL, they have everything.

This post walks through an alternative: using BullMQ's built-in `QueueEvents` emitter to monitor queues without ever sharing a Redis credential.

---

## The Problem With Direct Redis Monitoring

A traditional hosted queue monitor connects directly to Redis and inspects queue state. That's convenient for building dashboards, but uncomfortable for production systems.

Depending on your Redis permissions and deployment model, a Redis connection can expose far more than queue metrics — keys, job state, retry metadata, delayed jobs, and sometimes payload data.

Even when a vendor is trustworthy, the credential becomes another secret to audit, rotate, and protect.

The better model is:

> **Keep Redis private. Send only the monitoring events you actually need.**

---

## How BullMQ QueueEvents Changes the Game

BullMQ emits lifecycle events as jobs move through a queue. `QueueEvents` is the BullMQ primitive for subscribing to those changes inside your own process:

```
completed → failed → active → waiting → stalled → delayed → drained
```

Instead of polling Redis from a hosted service, you can subscribe from inside your runtime and translate these lifecycle events into monitoring records.

This eliminates:
- ✅ Inbound network access to Redis
- ✅ Redis credential sharing with vendors
- ✅ The need to inspect arbitrary Redis keys
- ✅ Firewall changes and VPC peering

Monitoring data is buffered locally and sent over standard outbound HTTPS.

---

## The Agent Pattern in Practice

Here's how it works in a real application:

```bash
npm install @qcanary/agent
```

Then attach it to your existing BullMQ queues:

```ts
import { Queue } from "bullmq";
import { QueueMonitor } from "@qcanary/agent";

const emailQueue = new Queue("email", {
  connection: { host: "127.0.0.1", port: 6379 },
});

const monitor = new QueueMonitor({
  apiKey: process.env.QCANARY_API_KEY,
  queues: [emailQueue],
});

await monitor.start();
```

The agent:
1. Attaches to `QueueEvents` as a local subscriber — **your Redis connection never leaves the process**
2. Buffers events into batches (100 events or 5 seconds, whichever comes first)
3. Ships only lightweight metadata over HTTPS: job ID, queue name, status, duration, error message
4. Retries with exponential backoff on failure
5. Drops oldest events if the buffer fills — monitoring should never slow down your workers

**No job payloads. No Redis keys. No connection strings.** Just events.

---

## Setting Up Your First Alert

Dashboards are useful. Alerts are what make monitoring operational.

A good first alert is failure rate:

```
Queue: email
Condition: failure rate > 5%
Window: 10 minutes
Destination: Slack
```

One failed job may be noise. A sustained 5% failure rate over 10 minutes usually means something changed: a provider outage, expired credentials, a bad deploy, or a slow dependency.

Other useful alerts:
- **No activity** — catch queues that silently stopped receiving work
- **Queue depth** — catch growing backlogs before users feel the delay
- **Job duration** — catch slow jobs and external dependency regressions

---

## Comparing the Approaches

| Aspect | Sharing Redis URL | Agent-Based (QueueEvents) |
|--------|-------------------|--------------------------|
| Credential exposure | Redis URL stored by vendor | None — Redis stays local |
| Network changes | Open port 6379 or VPC peering | None — outbound HTTPS only |
| Compliance impact | Vendor risk assessment required | None — no shared infrastructure |
| Data sent | Direct Redis access (everything) | Only lifecycle metadata |
| Payload visibility | Vendor can read all job data | Only metadata — payloads stay local |
| Setup time | 10 minutes + network config | 5 minutes, no network config |

---

## What to Monitor First

Start with high-impact queues:

- Email delivery
- Billing webhooks
- User notifications
- Scheduled reports
- Data imports and exports
- Third-party sync jobs

Keep thresholds conservative at first. After a week of history, tune them based on normal production behavior.

---

## When Sharing Redis Still Makes Sense

The agent pattern isn't always the right call:

- **Local development** — credential sharing doesn't matter on localhost
- **Full payload inspection needed** — if you need to see job data in the dashboard, the agent can't help (it intentionally excludes payloads)
- **Existing VPC peering** — if the network boundary is already established, sharing Redis adds no new attack surface

For everyone else — production deployments with VPCs, compliance requirements, or zero-trust policies — the agent pattern eliminates an entire class of security risk.

---

## Try It Free

QCanary provides real-time dashboards, Slack/email/webhook alerts, and job history for BullMQ — all without ever seeing your Redis URL.

**Free tier:** 1 project, 3 queues, 10K events/day, 3-day history
**Setup:** Install the agent, attach to your queues, events start flowing

→ [qcanary.dev](https://qcanary.dev/?ref=devto)
→ [Docs](https://qcanary.dev/docs/?ref=devto)

---

*Found this useful? Follow me for more Node.js infrastructure content. Questions? Drop them in the comments.*
