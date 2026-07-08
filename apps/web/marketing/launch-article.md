---
title: "Introducing QCanary: Monitor BullMQ Without Sharing Redis Credentials"
description: "Introducing QCanary — an agent-based BullMQ monitoring platform that streams queue events over HTTPS. No Redis credentials required."
date: "2026-06-27"
slug: "monitor-bullmq-without-exposing-redis"
---

# How to Monitor BullMQ in Production Without Exposing Redis

BullMQ is a strong default for Node.js teams that need background jobs. It is fast, Redis-backed, familiar to many backend engineers, and flexible enough for email delivery, report generation, webhooks, video processing, data syncs, and recurring workflows.

The hard part usually starts after BullMQ is already in production.

Jobs fail quietly. Retries hide symptoms until the retry budget is exhausted. A queue can stop receiving work and look healthy from the outside. Long-running jobs can block throughput. On-call engineers end up searching logs, checking Redis manually, and trying to reconstruct what happened from scattered application traces.

That is why queue monitoring matters. But the usual approach creates a security problem: many queue dashboards ask for direct Redis access.

## The Problem With Existing Node.js Queue Monitors

A traditional BullMQ monitor connects directly to Redis. That can work for a local admin UI, but it is uncomfortable for a hosted SaaS product.

To make it work, teams often need to share a Redis URL with a vendor, store production credentials outside their infrastructure, open firewall rules, or configure network access from the vendor to a private Redis instance. For small projects this may feel convenient. For production systems, it quickly becomes a security and compliance discussion.

Redis credentials are high-value secrets. They can expose far more than queue metrics. Depending on your deployment and Redis permissions, a connection may allow broad inspection of keys, job payloads, retry state, delayed jobs, and other operational data. Even if a monitoring vendor behaves correctly, the credential itself becomes another thing to audit, rotate, and protect.

There is also a practical operations issue. Many teams intentionally keep Redis private. It may live inside a VPC, behind security groups, or on a managed Redis service that only accepts connections from application workloads. Opening that path for monitoring is exactly the kind of change infrastructure teams prefer to avoid.

Queue observability should not require exposing the queue datastore.

## Introducing QCanary's Agent-Based Approach

QCanary takes a different path. Instead of connecting to your Redis instance from QCanary infrastructure, a lightweight agent runs inside your own Node.js process.

The agent attaches to your existing BullMQ queues and listens for lifecycle events. It streams lightweight job metadata to QCanary over HTTPS: queue name, job id, status, timestamps, duration, attempts, and error details when a job fails. Your Redis URL stays inside your application environment. No Redis credentials leave your infrastructure. No inbound firewall rule is required.

That tradeoff is intentional. Your application already has the right to observe its queues. QCanary uses that trusted position to collect the operational signals you need without turning Redis into an externally accessible dependency.

A typical setup looks like this:

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

From there, events show up in the QCanary dashboard with real-time queue health, job history, failure details, and alert rules.

## How BullMQ QueueEvents Works Under the Hood

BullMQ emits lifecycle events as jobs move through the queue. `QueueEvents` is the BullMQ primitive for listening to those events. It can receive notifications for events like `completed`, `failed`, `active`, `waiting`, `stalled`, and `delayed`.

QCanary's agent uses `QueueEvents` as the observation layer. Instead of polling Redis from a hosted service, it subscribes from inside your runtime and translates BullMQ lifecycle events into monitoring records. Those records are buffered and flushed asynchronously to the QCanary API.

This matters for reliability and safety.

First, the monitoring path is decoupled from your job execution path. If QCanary is temporarily unreachable, your workers should continue processing jobs. The agent can retry and eventually drop monitoring events rather than blocking application work.

Second, QCanary does not need to inspect arbitrary Redis keys. The useful monitoring signal is already present in BullMQ's lifecycle events. For most production monitoring use cases, you need to know which queue changed, which job changed, what status it reached, when it happened, how long it took, and what error occurred. You do not need to hand a third party your Redis credentials to get that view.

Third, the model is easier to explain during security review. The agent sends outbound HTTPS requests. Redis remains private. Credentials remain in your environment. Job payloads are not required for queue health monitoring.

## Setting Up Alerts for Failed Jobs

Dashboards are useful, but alerts are what make monitoring operational.

The first alert most teams should create is a failure-rate alert. For example:

- Queue: `email`
- Condition: failure rate
- Threshold: above 5%
- Window: 10 minutes
- Destination: Slack

This catches a class of problems that single-job alerts can miss. One failed email job may be noise. A 5% failure rate over 10 minutes usually means something changed: an API provider is down, credentials expired, a deploy introduced bad input, or a dependency became slow enough to trip timeouts.

QCanary also supports alerts for no activity, queue depth, and job duration. Those cover different failure modes:

- No activity can detect a queue that silently stopped receiving jobs.
- Queue depth can detect backlogs before users notice delays.
- Job duration can detect slow jobs, stuck dependencies, or performance regressions.

Alerts can route to Slack, email, or webhooks depending on the plan. When a condition recovers, QCanary can auto-resolve the active alert so the incident state reflects the current queue health instead of leaving stale alerts open.

## What You Should Monitor First

If you are adding queue monitoring to an existing BullMQ deployment, start with a small set of high-signal checks.

Monitor failure rate for user-visible queues such as email, billing webhooks, notifications, and exports. Add queue depth alerts for queues where delay matters. Add job-duration alerts for workflows that depend on third-party APIs or expensive processing. Keep thresholds conservative at first, then tune them after you have a week of production history.

The goal is not to alert on every failed job. The goal is to catch meaningful degradation early enough that engineers can respond before customers report missing work.

## Try QCanary Free

QCanary is built for teams that run BullMQ in production and want visibility without exposing Redis. Install the agent, attach it to your queues, and get real-time dashboards and alerts with no Redis credential sharing and no firewall changes.

Start free, send your first events, and add alerts when your team is ready for production-grade queue operations.
