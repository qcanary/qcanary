---
title: "How to Monitor BullMQ in Production Without Exposing Redis"
description: "A practical guide to monitoring BullMQ queues with an agent-based approach that keeps Redis credentials inside your infrastructure."
date: "2026-07-03"
slug: "how-to-monitor-bullmq-in-production"
tags: node, bullmq, redis, monitoring
---

BullMQ is a great default for Node.js background jobs. It is fast, Redis-backed, and flexible enough for emails, reports, webhooks, imports, notifications, billing syncs, and retry-heavy workflows.

But once BullMQ is in production, one question shows up quickly:

**How do you monitor queues without giving another service direct access to Redis?**

Many queue dashboards ask for your Redis URL. That works, but it can be a rough security tradeoff:

- Redis usually lives inside a private network.
- Redis credentials are sensitive production secrets.
- A queue monitor rarely needs broad datastore access.
- Opening firewall paths for monitoring creates more infrastructure surface area.

This post walks through an agent-based approach that uses BullMQ `QueueEvents` instead.

## The Problem With Direct Redis Monitoring

A traditional hosted queue monitor connects directly to Redis and inspects queue state. That is convenient for building dashboards, but uncomfortable for production systems.

Depending on your Redis permissions and deployment model, a Redis connection may expose much more than queue metrics. It can provide visibility into keys, job state, retry metadata, delayed jobs, and sometimes payload data.

Even when a vendor is trustworthy, the credential becomes another secret to audit, rotate, and protect.

For many teams, the better model is:

> Keep Redis private. Send only the monitoring events you actually need.

## The Agent-Based Model

QCanary uses a lightweight Node.js agent that runs inside the service that already owns your BullMQ queues.

The agent attaches to BullMQ `QueueEvents`, listens for lifecycle events, and streams lightweight metadata to the QCanary API over HTTPS.

QCanary does **not** connect to Redis from its servers.

QCanary does **not** receive your Redis URL.

The agent sends metadata like:

- Queue name
- Job id
- Job status
- Timestamps
- Duration
- Attempts
- Error message and stack for failed jobs

That is enough to build real-time dashboards, job history, and alert rules without exposing the backing Redis datastore.

## Quick Start

Install the agent:

```bash
npm install @qcanary/agent
```

Create a queue and attach the monitor:

```ts
import { Queue } from "bullmq";
import { QueueMonitor } from "@qcanary/agent";

const emailQueue = new Queue("email", {
  connection: { host: "127.0.0.1", port: 6379 },
});

const monitor = new QueueMonitor({
  apiKey: process.env.QCANARY_KEY,
  queues: [emailQueue],
});

await monitor.start();
```

The agent runs asynchronously. If the monitoring API is temporarily unavailable, your workers should continue processing jobs.

## How BullMQ QueueEvents Helps

BullMQ emits lifecycle events as jobs move through a queue. `QueueEvents` is the BullMQ primitive for subscribing to those changes.

Common events include:

- `completed`
- `failed`
- `active`
- `waiting`
- `stalled`
- `delayed`

Instead of polling Redis from a hosted service, an agent can subscribe from inside your runtime and translate these lifecycle events into monitoring records.

That has a few advantages:

- No inbound network access to Redis
- No Redis credential sharing
- No need to inspect arbitrary Redis keys
- Monitoring data can be buffered and sent over outbound HTTPS

## Alerting on Failed Jobs

A good first alert is failure rate.

For example:

```txt
Queue: email
Condition: failure rate
Threshold: above 5%
Window: 10 minutes
Destination: Slack
```

One failed job may be noise. A sustained 5% failure rate over 10 minutes usually means something changed: a provider outage, expired credentials, bad deploy, malformed input, or a slow dependency.

Other useful alerts:

- **No activity**: catch queues that silently stopped receiving work.
- **Queue depth**: catch growing backlogs before users feel the delay.
- **Job duration**: catch slow jobs and external dependency regressions.

## What to Monitor First

Start with high-impact queues:

- Email delivery
- Billing webhooks
- User notifications
- Scheduled reports
- Data imports and exports
- Third-party sync jobs

Keep thresholds conservative at first. After a week of history, tune them based on normal production behavior.

## Final Thought

Queue monitoring should not require handing over Redis credentials.

If your app already observes BullMQ events, you can stream the metadata you need while keeping Redis private. That gives you production visibility without expanding your infrastructure attack surface.

QCanary is one implementation of that model: real-time dashboards, alert rules, and job history for BullMQ with no Redis credential sharing.

Docs: https://qcanary.dev/docs
