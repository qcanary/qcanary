# @qcanary/agent

Lightweight BullMQ monitoring for [Qcanary](https://qcanary.dev). Listens to native `QueueEvents`, batches metadata, and POSTs it to the Qcanary API—**your Redis credentials never leave your infrastructure**.

## Requirements

- Node.js **18+**
- **bullmq** & **ioredis** (peer dependencies—install them in your app)

## Installation

```bash
npm install @qcanary/agent bullmq ioredis
```

```bash
yarn add @qcanary/agent bullmq ioredis
```

```bash
pnpm add @qcanary/agent bullmq ioredis
```

## Quick start

1. Create a project and API key in the Qcanary dashboard.
2. Set `QCANARY_API_KEY` in your environment.
3. Instantiate `QueueMonitor` with your BullMQ `Queue` instances, then call `start()` once during app bootstrap.

```typescript
import { QueueMonitor } from '@qcanary/agent';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL!);

const emailQueue = new Queue('email', { connection });
const reportQueue = new Queue('reports', { connection });

const monitor = new QueueMonitor({
  apiKey: process.env.QCANARY_API_KEY!,
  queues: [emailQueue, reportQueue],
});

await monitor.start();

// On graceful shutdown:
// await monitor.stop();
```

### Typical placement

- **API server:** after queues are created, `await monitor.start()` during startup.
- **Worker process:** if workers and queues share the same process, pass the same `Queue` instances you use for `queue.add()`.

If `QueueEvents` cannot infer Redis settings from your queues, pass **`connection`** (see [Configuration](#configuration)).

## Configuration

All options on `QueueMonitor` constructor (`QueueMonitorOptions`):

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | — | **Required.** Project API key from Qcanary. |
| `queues` | `Queue[]` | — | **Required.** Non-empty array of BullMQ `Queue` instances to monitor. |
| `apiBaseUrl` | `string` | `'https://api.qcanary.dev'` | Qcanary API origin (no path). Use this for self-hosted or staging APIs. |
| `includePayload` | `boolean` | `false` | When `true`, job `data` may be attached to events as `payload`. **Off by default**—payloads can contain secrets. |
| `flushInterval` | `number` | `5000` | Milliseconds between automatic batch flushes. |
| `maxBufferSize` | `number` | `100` | Flush immediately when the buffer reaches this many events. |
| `maxRetries` | `number` | `3` | HTTP retry attempts per batch with exponential backoff; after that, events are dropped quietly. |
| `environment` | `string` | `'production'` | Tag attached to every event (e.g. `staging`, `production`). |
| `connection` | `ConnectionOptions` | — | Redis options for internal `QueueEvents` instances. Provide if auto-detection from queues fails. |
| `onError` | `(error: Error) => void` | no-op | Hook for logging non-fatal agent errors. The agent **never throws** from listeners or transport after `start()` succeeds. |

### Example with options

```typescript
const monitor = new QueueMonitor({
  apiKey: process.env.QCANARY_API_KEY!,
  queues: [emailQueue],
  includePayload: false,
  flushInterval: 5000,
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'staging',
  apiBaseUrl: process.env.QCANARY_API_URL ?? 'https://api.qcanary.dev',
  connection: { host: '127.0.0.1', port: 6379 },
  onError: (err) => console.error('[qcanary]', err.message),
});

await monitor.start();
```

## Public API

### `QueueMonitor`

- **`constructor(options: QueueMonitorOptions)`** — Validates `apiKey` and `queues`.
- **`start(): Promise<void>`** — Starts the flush timer and attaches `QueueEvents` listeners. Idempotent if already started.
- **`stop(): Promise<void>`** — Stops listeners and flushes remaining buffered events. Idempotent.

### Re-exported types

`JobEvent`, `QueueMonitorOptions`, `IngestPayload`, `ApiResponse`, `EventStatus`, `EventListener`, `EventListenerOptions` are exported from the package entry for advanced/testing use cases.

## Events captured

Each row is one normalized event sent to Qcanary (`eventType` / `status` align with BullMQ naming).

| BullMQ event | Status | Fields captured |
|--------------|--------|------------------|
| `completed` | `completed` | Queue name, job id, job name (when available), duration (ms) |
| `failed` | `failed` | Queue name, job id, job name, error message, stack, attempts |
| `stalled` | `stalled` | Queue name, job id, job name |
| `delayed` | `delayed` | Queue name, job id, job name, delay (ms) |
| `active` | `active` | Queue name, job id, job name |
| `waiting` | `waiting` | Queue name, job name (job id may be unset until assigned) |
| `drained` | `drained` | Queue name only (`jobId` empty) |

Timestamps are ISO-8601 strings. `environment` is repeated on every event.

## Behavior guarantees

1. **Host app safety** — Listener and HTTP failures are contained; optional `onError` for visibility.
2. **No payload by default** — Job data is excluded unless `includePayload: true`.
3. **Non-blocking** — Enrichment uses async BullMQ APIs; handlers do not block the event loop.
4. **Batching** — Events flush every `flushInterval` ms **or** when `maxBufferSize` is reached.
5. **Retries** — Failed uploads retry up to `maxRetries` with exponential backoff, then the batch is dropped (no crash).

## Lifecycle & shutdown

Call **`await monitor.stop()`** on graceful shutdown so buffered events flush and `QueueEvents` close cleanly. If the process exits abruptly, a small number of buffered events may not be sent.

## FAQ

### Does Qcanary need my Redis URL?

No. The agent uses BullMQ in **your** process and only sends HTTP batches to Qcanary.

### Will this slow down my workers?

Overhead is minimal: listeners enqueue small objects; network I/O is batched and retried in the background.

### Can I monitor queues in another service?

Each running Node process needs its own `QueueMonitor` with `Queue` instances (or shared Redis connection) for those queues. Install the agent wherever BullMQ runs.

### What if my API key is wrong?

Ingest requests fail after retries; events for that batch are dropped. Check `onError` logs and dashboard key settings.

### TypeScript strict mode?

The package is authored in **strict** TypeScript with no `any` in public types.

### License

MIT (same as the `license` field in this package’s `package.json`).

## Links

- **Dashboard / signup:** [qcanary.dev](https://qcanary.dev)
- **Issues:** Use your organization’s support channel until the public repo is linked from npm.
