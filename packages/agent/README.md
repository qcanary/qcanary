# @qcanary/agent

[![npm version](https://img.shields.io/npm/v/@qcanary/agent)](https://www.npmjs.com/package/@qcanary/agent)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![BullMQ](https://img.shields.io/badge/BullMQ-2.x-important)](https://github.com/taskforcesh/bullmq)

**Monitor BullMQ queues without exposing Redis credentials.** A lightweight agent that attaches to BullMQ's `QueueEvents` inside your worker process and streams job metadata over HTTPS. No Redis URL sharing, no firewall changes, no VPC peering.

**Dashboard → [qcanary.dev](https://qcanary.dev)**
**Docs → [qcanary.dev/docs](https://qcanary.dev/docs)**

---

## Why QCanary?

### The Problem

Every hosted queue monitoring tool asks for your `REDIS_URL`:

```typescript
// Typical monitoring setup — shares your Redis credentials with a third party
const monitor = new Monitor({
  redis: {
    host: "your-redis.internal",   // ← now stored by a vendor
    port: 6379,                      // ← must be opened to the vendor's IP
    password: process.env.REDIS_PASSWORD,
  },
});
```

This means:
- Your production Redis credentials are stored by another company
- You need to open port 6379 or set up VPC peering
- Redis has no read-only mode — once someone has the URL, they have full access
- Compliance (SOC 2, zero-trust) requires a vendor risk assessment

### The QCanary Approach

QCanary uses an **agent-based model** that keeps Redis private:

```
Your Worker Process
├── BullMQ Worker (your job handler)
├── QueueEvents subscriber (local Redis connection)
└── @qcanary/agent
    ├── Buffers lifecycle events
    ├── Ships metadata over HTTPS
    └── Your REDIS_URL never leaves the process
```

| Capability | Direct Redis Monitoring | QCanary Agent |
|-----------|------------------------|---------------|
| **Redis credentials shared** | ✅ Yes — stored by vendor | ❌ Never leaves your process |
| **Firewall changes required** | ✅ Open port 6379 or VPC peering | ❌ Outbound HTTPS only |
| **Compliance impact** | Vendor risk assessment | None — no shared infra |
| **Job payloads sent** | ✅ Full payloads | ❌ Metadata only (status, duration, errors) |
| **Setup time** | 10 min + network config | 5 min, no network config |

---

## Quick Start

### 1. Install

```bash
npm install @qcanary/agent
```

`bullmq` and `ioredis` are peer dependencies — most BullMQ apps already have them.

### 2. Get an API key

Create a project at [qcanary.dev](https://qcanary.dev) to get your `qca_live_` API key.

### 3. Attach to your queues

```ts
import { Queue } from "bullmq";
import { QueueMonitor } from "@qcanary/agent";

const emailQueue = new Queue("email", {
  connection: { host: "127.0.0.1", port: 6379 },
});

const monitor = new QueueMonitor({
  apiKey: process.env.QCANARY_KEY!,
  queues: [emailQueue],
});

await monitor.start();

// Graceful shutdown
process.on("SIGTERM", () => {
  void monitor.stop().finally(() => process.exit(0));
});
```

That's it. Events start streaming to your dashboard. No Redis URL is sent, stored, or shared.

---

## Configuration

```ts
new QueueMonitor({
  apiKey: string,           // Required. Your qca_live_ key
  queues: Queue[],          // Required. BullMQ Queue instances

  // Optional
  apiBaseUrl: string,       // Default: https://api.qcanary.dev
  includePayload: boolean,  // Default: false — keep disabled unless you need it
  flushInterval: number,    // Default: 5000 (ms between batch uploads)
  maxBufferSize: number,    // Default: 100 (events before forced flush)
  maxRetries: number,       // Default: 3 (retries before dropping batch)
  environment: string,      // Default: "production"
  connection: ConnectionOptions, // Redis connection for QueueEvents listeners
  onError: (error: Error) => void, // Non-fatal agent errors for your logger
});
```

### Full example

```ts
const monitor = new QueueMonitor({
  apiKey: process.env.QCANARY_KEY!,
  queues: [emailQueue, reportQueue],
  environment: process.env.NODE_ENV ?? "production",
  flushInterval: 3000,
  maxBufferSize: 250,
  onError: (error) => {
    console.error("[qcanary]", error.message);
  },
});

await monitor.start();
```

---

## Events Captured

| BullMQ Event | Status Stored | Data Collected |
|-------------|---------------|----------------|
| `completed` | completed | queue, job id, job name, duration |
| `failed` | failed | queue, job id, job name, attempts, error message, stack |
| `stalled` | stalled | queue, job id, job name |
| `delayed` | delayed | queue, job id, job name, delay |
| `active` | active | queue, job id, job name |
| `waiting` | waiting | queue, job id, job name |
| `drained` | drained | queue name |

**No job payloads are sent** unless you explicitly enable `includePayload: true`.

---

## Runtime Behavior

- **`start()`** is idempotent — safe to call multiple times
- **`stop()`** closes listeners and flushes buffered events
- **Network failures** retry with exponential backoff (up to `maxRetries`)
- **Buffer overflow** drops oldest events first — monitoring should never slow down your workers
- **Agent errors** are isolated from your job handler — a failing monitor can't crash your worker

---

## When to Use QCanary

✅ **You run BullMQ in production** and need visibility into queue health
✅ **Redis lives inside a VPC** and you can't or won't open it to third parties
✅ **Compliance matters** — SOC 2, ISO 27001, or zero-trust policies
✅ **You want alerting** (Slack, email, webhook) without building it yourself
✅ **You need job history** — what happened to queues while you were asleep

Not a good fit if you need full job payload inspection in the dashboard — QCanary intentionally sends metadata only.

---

## Documentation

- **Setup guide**: [qcanary.dev/docs](https://qcanary.dev/docs)
- **Dashboard**: [qcanary.dev](https://qcanary.dev)
- **Pricing**: Free tier includes 1 project, 3 queues, 10K events/day, 3-day history

---

## License

MIT
