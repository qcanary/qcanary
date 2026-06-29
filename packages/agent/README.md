# @qcanary/agent

BullMQ monitoring for QCanary. Stream job metadata from your Node.js workers to real-time dashboards and alerts without sharing Redis credentials.

## Why QCanary?

Most hosted queue monitors need direct Redis access. That means sharing a production Redis URL, opening network paths, and adding another secret to your compliance surface.

QCanary uses an agent-based model:

- Runs inside your own Node.js process
- Attaches to BullMQ `QueueEvents`
- Sends lightweight job metadata over HTTPS
- Never sends Redis credentials to QCanary
- Excludes job payloads by default

Use it when BullMQ is important enough that failures, stalled jobs, queue depth, and slow jobs should be visible before customers notice.

## Installation

```bash
npm install @qcanary/agent
```

`bullmq` and `ioredis` are peer dependencies. Most BullMQ apps already have them installed.

## Quick Start

Create a QCanary project, copy your `qca_live_` API key, then attach the monitor to your existing BullMQ queues.

```ts
import { Queue } from "bullmq";
import { QueueMonitor } from "@qcanary/agent";

const emailQueue = new Queue("email", {
  connection: { host: "127.0.0.1", port: 6379 },
});

const reportQueue = new Queue("reports", {
  connection: { host: "127.0.0.1", port: 6379 },
});

const monitor = new QueueMonitor({
  apiKey: process.env.QCANARY_KEY!,
  queues: [emailQueue, reportQueue],
});

await monitor.start();

process.on("SIGTERM", () => {
  void monitor.stop().finally(() => process.exit(0));
});
```

## Configuration API

`QueueMonitor` accepts a single options object:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `apiKey` | `string` | Required | QCanary project API key. Production keys start with `qca_live_`. |
| `queues` | `Queue[]` | Required | BullMQ `Queue` instances to monitor. Must be non-empty. |
| `apiBaseUrl` | `string` | `https://api.qcanary.dev` | Override for self-hosted or staging API deployments. |
| `includePayload` | `boolean` | `false` | Include job payload data. Keep disabled unless you explicitly need it. |
| `flushInterval` | `number` | `5000` | Milliseconds between automatic event batch uploads. |
| `maxBufferSize` | `number` | `100` | Flush immediately when this many events are buffered. |
| `maxRetries` | `number` | `3` | Retry attempts for failed batch uploads before dropping the batch. |
| `environment` | `string` | `production` | Environment tag attached to every event. |
| `connection` | `ConnectionOptions` | Inferred | Redis connection options for internal `QueueEvents` listeners. |
| `onError` | `(error: Error) => void` | noop | Receives non-fatal agent errors for local logging. |

Example with common options:

```ts
const monitor = new QueueMonitor({
  apiKey: process.env.QCANARY_KEY!,
  queues: [emailQueue],
  environment: process.env.NODE_ENV ?? "production",
  flushInterval: 3000,
  maxBufferSize: 250,
  includePayload: false,
  onError: (error) => {
    console.error("[qcanary]", error.message);
  },
});

await monitor.start();
```

## Events Captured

The agent listens to BullMQ lifecycle events and normalizes them before sending to QCanary.

| BullMQ event | Stored status | Typical fields |
| --- | --- | --- |
| `completed` | `completed` | queue name, job id, job name, duration |
| `failed` | `failed` | queue name, job id, job name, attempts, error message, stack |
| `stalled` | `stalled` | queue name, job id, job name |
| `delayed` | `delayed` | queue name, job id, job name, delay |
| `active` | `active` | queue name, job id, job name |
| `waiting` | `waiting` | queue name, job id, job name |
| `drained` | `drained` | queue name |

## Runtime Behavior

- `start()` is idempotent and attaches `QueueEvents` listeners.
- `stop()` closes listeners and flushes buffered events.
- Network failures are retried with exponential backoff.
- Failed uploads are dropped after retries to protect your worker process.
- Listener and transport errors are contained after startup and reported through `onError`.

## Documentation

Full setup guide: https://qcanary.dev/docs

Dashboard: https://qcanary.dev

## License

MIT
