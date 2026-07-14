---
title: "Why I Rejected 3 Queue Monitoring Tools (And Built My Own)"
description: "I evaluated three queue monitoring tools for our BullMQ setup. All three asked for our Redis URL. I said no to all three — and built what I actually needed."
date: "2026-07-12"
slug: "why-i-rejected-queue-monitoring-tools"
tags: ["bullmq", "monitoring", "security", "founder-story"]
author: "QCanary Engineering"
readingTime: 5
---

# Why I Rejected 3 Queue Monitoring Tools (And Built My Own)

> **TL;DR:** I evaluated three queue monitoring tools for our BullMQ stack. Every single one asked for our Redis URL. I said no to all three and built QCanary — an agent-based monitor that never needs your credentials. This is the story of each rejection and what I learned.

---

## The Setup

We ran BullMQ in production. A handful of queues — email, notifications, image processing, webhooks. Nothing exotic. But we had a security team that actually read the vendor risk assessments we sent them, which meant every monitoring tool we evaluated needed their approval.

I found three options. All three hit the same wall.

---

## Tool 1: The Hosted Dashboard

The first tool looked perfect on paper. Real-time queue monitoring, nice dashboards, team access controls. I signed up, created a project, and got to the setup page.

Step 1: Enter your Redis URL.

I stared at that input field for a minute. This was the industry standard? Hand over your production database connection string and trust that the vendor stores it safely?

I asked their support: "Do you have an agent-based option that doesn't need my Redis URL?"

Response: "We recommend using a read-only Redis user."

The problem: **Redis doesn't have read-only users.** There's no way to create a credential that can read queue state but not job payloads, or read job metadata but not execute FLUSHALL. The "read-only" suggestion is a workaround that doesn't actually work at the Redis protocol level.

Verdict: Rejected. The credential exposure risk wasn't worth the dashboard features.

---

## Tool 2: The Enterprise Observability Platform

The second option was the enterprise-grade platform. The one with SOC 2 reports and a seven-figure funding round. Surely they had this figured out.

They did not have this figured out.

Their integration required:

1. Installing a collector agent in our VPC
2. The agent connecting to Redis directly
3. Sending all queue data to their cloud

The agent connected to Redis the same way our application did — with the same credentials. They claimed it was secure because the agent "ran in our VPC." But the agent still had the credentials, still transmitted data to their cloud, and if their cloud was compromised, so was our Redis access pattern.

The cost was also absurd for what we needed. We had five queues. Their minimum commitment was $750/month and a security review that would take weeks.

Verdict: Rejected. Overpriced and overcomplicated for what should be a simple monitoring setup.

---

## Tool 3: The Open Source Dashboard

The third option was an open-source BullMQ dashboard. Self-hosted. Free. No vendor risk. This should work, right?

Well, it connected directly to Redis. Which meant we had to either:

- **Run it inside our VPC** — requiring a bastion host, VPN, or SSM port forwarding for anyone who wanted to check queues. That's an operational overhead we didn't want.
- **Expose Redis to the dashboard** — which meant either running the dashboard on the same machine as our workers (not feasible) or opening Redis to accept external connections (defeating the purpose of a private VPC).

And even if we solved the networking, the dashboard had no alerting. No Slack notifications when queues stalled. No email alerts on failure spikes. It showed us the queues — we still had to watch them ourselves.

Verdict: Rejected. Great for local development, not suitable for production without significant engineering investment.

---

## What I Actually Needed

After rejecting all three, I wrote down what I actually needed:

1. **No Redis credential sharing** — Non-negotiable. The monitoring tool should never see my Redis URL.
2. **Built-in alerting** — Slack, email, and webhook notifications when queues fail, stall, or slow down.
3. **Team access** — Not a shared URL. Actual authentication with per-user access.
4. **Event history** — Not just current queue state but what happened in the past. What failed at 3 AM while I was sleeping?
5. **Reasonable price** — Not $750/month for five queues.
6. **10-minute setup** — No VPC peering, no bastion hosts, no config file that requires Redis credentials.

---

## What I Built

I built QCanary because the alternative monitoring tools all had the same limitation: they needed Redis access to function. That's an architectural constraint, not a feature.

The agent pattern changes the architecture:

```typescript
import { QueueMonitor } from "@qcanary/agent";

// No Redis URL. No credentials. No network changes.
new QueueMonitor({
  apiKey: process.env.QCANARY_API_KEY,
  queues: ["email", "notifications", "webhooks"],
}).start();
```

The agent attaches to BullMQ's built-in QueueEvents inside your worker process. It streams only metadata — job IDs, status transitions, durations, error messages — over standard HTTPS. Your Redis credentials never leave your environment because they were never requested.

The product includes:
- Real-time dashboards
- Slack, email, and webhook alerts
- Job history with stack traces
- Team access controls
- A free tier that covers small projects

No vendor risk assessment needed. No network config changes. No Redis URL input fields.

---

## What I'd Do Differently

If I were starting over today, I'd:

1. **Ship the agent first, the dashboard second.** The dashboard is what users see, but the agent is what makes the product work. I spent too long on UI polish before confirming the agent pattern was bulletproof.

2. **Launch without a paid tier.** I worried about monetization too early. The free tier should be generous enough that teams can evaluate the product without friction. Monetization can wait until users are asking to pay.

3. **Focus on one queue system.** BullMQ is our core. Supporting Bull in addition would have doubled the surface area without doubling the value. Pick one queue system and do it well.

---

## If You're in the Same Boat

You don't need to accept the "give us your Redis URL or go without monitoring" trade-off. The agent-based pattern exists, it's production-tested, and it's available today.

[Try QCanary for free](https://qcanary.dev). If it works for you, great. If it doesn't, email me — I'll fix what's broken. If you hate the whole thing, tell me why. Either way, I'd rather have your honest feedback than your Redis URL.

---

*QCanary provides zero-trust BullMQ monitoring — real-time dashboards, Slack/email/webhook alerts, and 90-day job history — without ever seeing your Redis credentials. [Start free at qcanary.dev](https://qcanary.dev).*
