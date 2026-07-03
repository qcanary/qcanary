# How to Monitor BullMQ Queues Without Exposing Redis Credentials

> **TL;DR:** Every BullMQ queue dashboard that asks for your `REDIS_URL` creates a security boundary you have to defend. BullMQ's built-in `QueueEvents` emitter already fires lifecycle events inside your own Node.js process — you can collect those events over HTTPS without ever sharing a Redis credential. This article walks through the architecture, the security trade-offs, and the one-liner agent pattern that keeps Redis behind your firewall.

---

## The Default Monitoring Pattern (and Why It Hurts)

When you deploy BullMQ in production, you eventually want visibility into your queues. The default pattern for most monitoring tools looks like this:

```typescript
// Typical third-party monitoring setup
import { Monitor } from "queue-monitoring-service";

const monitor = new Monitor({
  redis: {
    host: process.env.REDIS_HOST,     // ← shared with a third party
    port: 6379,                        // ← port that must be opened
    password: process.env.REDIS_PASSWORD,
  },
  queues: ["transcode", "notifications", "webhooks"],
});

monitor.start();
```

This pattern has three problems:

1. **You're sending your Redis URL to a third-party service.** That URL is the equivalent of a database connection string — it includes host, port, and password. The vendor stores it, and a breach on their side becomes a breach of your queue infrastructure.
2. **You need to open port 6379 (or your Redis port) to the vendor's IP range.** If you run Redis inside a VPC, this means either exposing Redis to the internet with IP allowlists (which have been bypassed before) or setting up VPC peering for a monitoring tool.
3. **Redis has no row-level security.** Once someone has your Redis URL, they have access to everything: job payloads, worker metadata, queue state, and any other data stored in that Redis instance. There is no "read-only monitoring user" pattern that BullMQ supports out of the box.

### The Compliance Angle

If your team operates under SOC 2, ISO 27001, or even an internal zero-trust policy, sharing a `REDIS_URL` with a vendor triggers a vendor risk assessment. The assessment asks:

- Where is the credential stored? (Encrypted at rest? In memory? Logs?)
- Who at the vendor has access to it? (Support engineers? SREs? Everyone?)
- Can the credential be rotated without downtime? (Often no — the monitoring tool stores it in its own config.)

These are solvable problems, but they add friction to what should be a five-minute setup.

---

## BullMQ QueueEvents: The Built-In Alternative

BullMQ has a feature that most monitoring tools ignore: `QueueEvents`. This is a dedicated event emitter that lives in your Worker process and dispatches lifecycle callbacks for every job transition.

```typescript
import { Worker, QueueEvents } from "bullmq";

const connection = {
  host: process.env.REDIS_HOST,
  port: 6379,
  password: process.env.REDIS_PASSWORD,
};

const worker = new Worker("transcode", async (job) => {
  // ... your job handler
}, { connection });

// This runs inside YOUR process
const events = new QueueEvents("transcode", { connection });

events.on("completed", ({ jobId, returnvalue }) => {
  // jobId: the job that finished
  // returnvalue: the job's return value
  // This event fires inside your own Node.js process
});

events.on("failed", ({ jobId, failedReason }) => {
  // jobId: the job that failed
  // failedReason: the error message or stack trace
});

events.on("stalled", ({ jobId }) => {
  // jobId: the job that stalled
});
```

The key insight: **the `QueueEvents` listener runs in your process, on your machine, connected to your Redis.** It has access to events because it lives on the same network as Redis. No credential sharing needed to emit events to an external system.

The question is: how do you get those events to a monitoring dashboard without sending your Redis URL?

---

## The Agent Pattern: Collect Locally, Ship Over HTTPS

Instead of giving a monitoring tool your Redis URL, you run a small agent inside your application process. The agent:

1. Attaches to `QueueEvents` as a local subscriber
2. Buffers events into batches (to avoid flooding HTTP connections)
3. Ships the batched metadata to a remote API over standard HTTPS

Here is the implementation pattern:

```typescript
import { QueueEvents } from "bullmq";
import { QueueMonitor } from "@qcanary/agent";

const monitor = new QueueMonitor({
  apiKey: process.env.QCANARY_API_KEY,     // only QCanary API key, no Redis URL
  queues: [
    {
      name: "transcode",
      connection: {                         // ← your Redis connection stays local
        host: process.env.REDIS_HOST,
        port: 6379,
        password: process.env.REDIS_PASSWORD,
      },
    },
  ],
});

monitor.start();
```

The `connection` object is never serialized, never sent over the network, and never leaves your process. It is used only to instantiate the local `QueueEvents` subscriber. The agent then streams only:

- `jobId` — the job identifier
- `queueName` — which queue the job belongs to
- `eventType` — completed, failed, stalled, active, waiting, delayed, drained
- `status` — the job's current status
- `durationMs` — execution duration for completed jobs
- `errorMessage` and `errorStack` — for failed jobs
- `attempts` — the number of retry attempts
- `timestamp` — when the event occurred

**No job payload. No Redis keys. No connection string. No credentials.**

### What the Agent Does Internally

The agent uses an event buffer pattern to avoid dropping events under load:

```typescript
// Simplified buffer logic
class EventBuffer {
  private buffer: JobEvent[] = [];
  private flushInterval: NodeJS.Timeout;
  private maxSize = 100;

  constructor(private apiKey: string, private apiUrl: string) {
    this.flushInterval = setInterval(() => this.flush(), 5_000);
  }

  push(event: JobEvent): void {
    this.buffer.push(event);
    if (this.buffer.length >= this.maxSize) {
      this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;
    const batch = this.buffer.splice(0, this.maxSize);
    await fetch(`${this.apiUrl}/v1/ingest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
      },
      body: JSON.stringify({ events: batch }),
    });
  }
}
```

The buffer flushes every 5 seconds or when it reaches 100 events, whichever comes first. This keeps HTTP overhead low while ensuring events are sent promptly.

---

## Comparing the Two Approaches

| Aspect | Sharing Redis URL | Agent (QueueEvents) |
|--------|-------------------|---------------------|
| **Credential exposure** | Redis URL stored by vendor | None — Redis stays local |
| **Network changes** | Open port 6379 or VPC peering | None — outbound HTTPS only |
| **Compliance impact** | Vendor risk assessment required | None — no shared infrastructure |
| **Data sent** | Direct Redis access (everything) | Only lifecycle metadata (job ID, status, duration, error) |
| **Payload visibility** | Vendor can read all job data | Only metadata — payloads never leave your process |
| **Setup time** | 10 minutes + network config | 5 minutes, no network config |
| **Failure mode** | Vendor outage = no monitoring | Agent buffers events, re-sends when API recovers |

---

## When Sharing Redis Still Makes Sense

The agent pattern is not always the right call. Here are cases where direct Redis access is reasonable:

- **You are running Redis on localhost in a single-process development environment.** Credential sharing doesn't matter because there are no network boundaries.
- **You need to inspect job payloads in the monitoring dashboard.** If your debugging workflow depends on seeing the full job data in the UI, the agent cannot help — it intentionally excludes payloads.
- **You already have a VPC peering setup with the vendor.** If the network boundary is already established and assessed, sharing Redis adds no additional attack surface.

For everyone else — production deployments with VPCs, compliance requirements, or zero-trust policies — the agent pattern eliminates an entire class of security risk with no meaningful operational cost.

---

## Production Considerations

### Memory Usage

`QueueEvents` listeners hold a reference to the Redis connection. Each queue you monitor adds one Redis connection from your Worker process. For high-throughput systems with dozens of queues, connection pooling becomes relevant — BullMQ v2+ supports shared connections via `new IORedis()` passed to multiple queue instances.

### Event Volume

At scale, job lifecycle events can generate significant volume. A system processing 10,000 jobs per second generates 30,000–50,000 lifecycle events per second (each job goes through multiple states). The agent pattern handles this via buffering — events are accumulated in memory and flushed in batches. Monitor the buffer flush latency as a health metric.

### Backpressure

If the remote API is down, the agent buffer fills up. The implementation should either drop old events (preferred — monitoring data is time-sensitive) or apply backpressure to the `QueueEvents` listener. Dropping is safer: a monitoring tool that slows down your job processing defeats the purpose.

```typescript
// Buffer overflow strategy: drop oldest events
push(event: JobEvent): void {
  if (this.buffer.length >= this.maxSize) {
    this.buffer.shift(); // drop oldest
  }
  this.buffer.push(event);
}
```

---

## Summary

- BullMQ's `QueueEvents` emitter fires lifecycle events inside your own process.
- You can subscribe to these events and ship metadata over HTTPS without sharing your Redis URL.
- The agent pattern eliminates credential exposure, network config changes, and compliance surface.
- For production deployments with security boundaries, this is strictly superior to sharing Redis credentials.

---

*QCanary is a monitoring platform built on this exact agent pattern. It provides real-time dashboards, Slack/email/webhook alerts, and job history — all without ever seeing your Redis URL. [Start free at qcanary.dev](https://qcanary.dev).*
