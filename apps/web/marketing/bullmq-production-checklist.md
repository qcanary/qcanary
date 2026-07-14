---
title: "BullMQ in Production: A Checklist You Actually Need"
description: "A practical checklist for running BullMQ in production — monitoring, alerting, retry strategies, and the 10 things most teams get wrong."
date: "2026-07-09"
slug: "bullmq-production-checklist"
tags: ["bullmq", "production", "monitoring", "tutorial"]
author: "QCanary Engineering"
readingTime: 8
---

# BullMQ in Production: A Checklist You Actually Need

> **TL;DR:** Everyone has a BullMQ production checklist. Most of them miss the things that actually break. Here's the checklist I wish I had before my first production deployment — with specific monitoring, alerting, and retry strategies for each item.

---

## The Checklist

I deployed BullMQ to production without a proper checklist. Here's what broke — in order of severity — and the checklist I use now.

---

### [ ] 1. Monitor Queue Depth (Not Just Failures)

Most teams monitor job failures and call it done. But queue depth tells you something different: **are your workers keeping up with the load?**

A growing queue depth means your producers are faster than your consumers. This can happen even when no jobs are failing — your workers are just overwhelmed.

```typescript
// What most teams monitor:
worker.on("failed", (job, err) => {
  alert(`Job failed: ${err.message}`);
});

// What you should ALSO monitor:
const queue = new Queue("transcode");
const counts = await queue.getJobCounts();
if (counts.waiting > 1000) {
  alert(`Queue depth critical: ${counts.waiting} jobs waiting`);
}
```

**What happens if you skip this:** Workers silently fall behind. By the time you notice, you have 50,000 queued jobs and a 3-hour backlog. Users have already noticed slow response times.

**How to implement:** Set a threshold on `getJobCounts().waiting` or `getJobCounts().delayed`. Alert when it exceeds 2x your normal peak.

---

### [ ] 2. Set Up Stalled Job Detection

Stalled jobs are jobs that a worker picked up but never completed or failed. BullMQ has a built-in `stalledInterval` that checks for these, but you need to monitor when it happens.

```typescript
events.on("stalled", ({ jobId }) => {
  logger.warn({ jobId }, "Job stalled");
  // If stalling is frequent, something is wrong with your worker
});
```

**What happens if you skip this:** Stalled jobs accumulate in the "active" state. They never retry (unless you configure `maxStalledCount`). They just sit there, consuming mental energy every time someone checks the dashboard.

**How to implement:** Log all stalled events. Alert if more than 5 jobs stall per hour. Increase `maxStalledCount` carefully — retrying a stuck job often makes the problem worse.

---

### [ ] 3. Alert on Worker Inactivity

A worker that stops processing is worse than a worker that fails — because you might not notice.

BullMQ's `QueueEvents` emits a `waiting` event when jobs enter the queue. If no worker picks them up within a reasonable window, something is wrong.

```typescript
// Check if workers are alive
const workers = await queue.getWorkers();
if (workers.length === 0) {
  alert("No workers connected to queue!");
}
```

**What happens if you skip this:** Your deployment pipeline restarts all workers, but the new workers crash on startup due to a config change. You find out four hours later when a customer asks why their jobs aren't processing.

**How to implement:** Run a health check every 5 minutes that verifies at least one worker is connected to each critical queue. Alert immediately if zero workers are found.

---

### [ ] 4. Track Job Duration Trends

A job that normally takes 200ms but suddenly takes 2 seconds is a leading indicator of trouble. Maybe your database is slowing down, or an external API is throttling you.

```typescript
// Track p95 duration per queue
events.on("completed", ({ jobId, returnvalue }) => {
  // Send duration to metrics system
  metrics.histogram("bullmq.job.duration", durationMs, {
    queue: queueName,
  });
});
```

**What happens if you skip this:** Your jobs gradually slow down over weeks. You deploy a "harmless" change that doubles processing time. Nobody notices until the queue depth starts growing three days later.

**How to implement:** Track p50, p95, and p99 job durations per queue. Alert on p95 increasing by more than 50% over a 24-hour period.

---

### [ ] 5. Have a Retry Strategy (Not Just "Retry 3 Times")

Default retry in BullMQ is fine for transient failures. But blind retries make things worse for certain failure modes:

- **Rate limited by an API:** Retrying in 1 second guarantees another rate limit error.
- **Database connection pool exhausted:** Retrying immediately adds more load.
- **Invalid input data:** Retrying 10 times won't make the data valid.

```typescript
const worker = new Worker("transcode", async (job) => {
  return processJob(job.data);
}, {
  connection,
  settings: {
    backoffStrategy: (attemptsMade) => {
      // Exponential backoff: 1s, 5s, 15s, 30s, 60s...
      return Math.min(1000 * Math.pow(attemptsMade, 1.5), 60_000);
    },
  },
});
```

**What happens if you skip this:** A downstream API outage causes all your workers to retry simultaneously every few seconds — amplifying the load on the failing service and your own Redis instance.

**How to implement:** Use exponential backoff. Set a max retry limit (3–5 is usually enough). For non-transient failures (invalid data, auth errors), move to a dead letter queue instead of retrying.

---

### [ ] 6. Monitor Redis Memory Usage

BullMQ stores job data in Redis. If Redis runs out of memory, jobs start getting evicted, workers crash, and you lose queue state.

```typescript
const info = await redis.info("memory");
const usedMemory = parseInt(info.match(/used_memory:(\d+)/)?.[1] ?? "0", 10);
const maxMemory = parseInt(info.match(/maxmemory:(\d+)/)?.[1] ?? "0", 10);

if (maxMemory > 0 && usedMemory / maxMemory > 0.8) {
  alert("Redis memory usage above 80%");
}
```

**What happens if you skip this:** Redis hits its `maxmemory` limit, starts evicting keys, and your queue metadata disappears. Jobs that were "completed" now show as "not found." Alerting breaks because the alert state was stored in Redis.

**How to implement:** Monitor `used_memory / maxmemory` ratio. Set an alert at 80%. Configure `maxmemory-policy` to `noeviction` so BullMQ doesn't lose data silently — instead, writes will fail loudly.

---

### [ ] 7. Log Job Failures with Stack Traces

A job failed. Why? If you only log the error message, you'll spend 30 minutes reproducing the issue to find the stack trace.

```typescript
worker.on("failed", (job, err) => {
  logger.error({
    jobId: job?.id,
    queue: job?.queueName,
    data: job?.data,         // job input data
    stack: err?.stack,       // full stack trace
    attempts: job?.attemptsMade,
  }, "Job failed");
});
```

**What happens if you skip this:** A production incident. Thirty minutes of "can you add more logging?" Deploy. Wait. Check logs. Repeat.

**How to implement:** Always log the full stack trace, job input data, and attempt count. Store these in a centralized logging system (or use a monitoring tool that captures them automatically).

---

### [ ] 8. Have a Dead Letter Queue

Some jobs will never succeed — invalid data, processing logic errors, or business rule violations. These jobs should not be retried forever. They should go to a dead letter queue (DLQ) for manual inspection.

```typescript
worker.on("failed", async (job, err) => {
  if (job.attemptsMade >= (job.opts?.attempts ?? 3)) {
    // Move to dead letter queue
    const dlq = new Queue("transcode-dlq", { connection });
    await dlq.add(job.name, {
      originalData: job.data,
      error: err.message,
      attempts: job.attemptsMade,
    });
  }
});
```

**What happens if you skip this:** Failed jobs accumulate in the "failed" set forever. Your "failed jobs count" metric becomes meaningless because it includes both "retried and succeeded" and "permanently failed" jobs.

**How to implement:** After the last retry attempt, move the job to a DLQ. Alert on DLQ depth. Review DLQ contents weekly.

---

### [ ] 9. Test Your Alerts (Send a Test Event)

The worst time to discover your alerting doesn't work is during an actual incident.

**What happens if you skip this:** A critical queue stalls at 2 AM. The Slack webhook URL has been rotated. The email SMTP config expired. You find out at 9 AM when someone asks "did anyone check the queues last night?"

**How to implement:** Use QCanary's "Send Test Event" feature (available on all plans) to send a simulated job event and verify that Slack/email/webhook alerts fire correctly. Do this after every deployment that touches your monitoring configuration.

---

### [ ] 10. Don't Share Your Redis URL with Third Parties

This is the most important item on the list, and it's the one most teams get wrong. Every monitoring tool that asks for your Redis URL creates an unnecessary security boundary.

Use the agent-based monitoring pattern instead: a lightweight agent inside your worker process subscribes to BullMQ's QueueEvents and streams metadata over HTTPS. No Redis URL sharing. No firewall changes. No compliance reviews.

```typescript
// Production monitoring without credential exposure
import { QueueMonitor } from "@qcanary/agent";

new QueueMonitor({
  apiKey: process.env.QCANARY_API_KEY,
  queues: ["transcode", "notifications", "webhooks"],
}).start();
```

---

## Summary

- Queue depth tells you if workers are keeping up. Failures tell you if jobs are breaking. Monitor both.
- Stalled job detection catches workers that silently stop processing.
- Worker inactivity alerts catch deployment failures before customers do.
- Job duration trends are a leading indicator of system degradation.
- Exponential backoff reduces cascading failures during downstream outages.
- Redis memory monitoring prevents silent data loss.
- Full stack traces reduce incident investigation time.
- Dead letter queues isolate unsalvageable jobs from transient failures.
- Test your alerts before you need them.
- Never share your Redis URL with monitoring tools.

---

*QCanary monitors BullMQ queues with real-time dashboards, Slack/email/webhook alerts, and job history — all without ever connecting to your Redis instance. [Start free at qcanary.dev](https://qcanary.dev).*
