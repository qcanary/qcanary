# Show HN: QCanary – Monitor BullMQ Queues Without Sharing Redis Credentials

We built an agent-based monitoring tool for BullMQ that never asks for your `REDIS_URL`. Thought I'd share the architecture and ask for feedback on a specific design choice around event listener memory management.

## The Problem

Every queue monitoring dashboard we evaluated asks for a Redis URL. That means:

- Your Redis credentials are stored by a third party
- You need to open port 6379 or set up VPC peering
- A compliance review for a monitoring tool

For teams running BullMQ in production VPCs, this is friction that slows adoption of basic observability.

## The Approach: QueueEvents Subscription

BullMQ has a built-in `QueueEvents` class that emits lifecycle events (`completed`, `failed`, `stalled`, `active`, `waiting`, `delayed`, `drained`) inside your own Node.js process. Instead of connecting to Redis remotely, we run a tiny agent inside the Worker process that subscribes to these events locally:

```
Worker Process
├── BullMQ Worker (your job handler)
├── QueueEvents subscriber
└── @qcanary/agent
    ├── Event buffer (100 events / 5s flush)
    ├── HTTPS transport → API
    └── Retry with exponential backoff
```

The agent buffers events and ships only metadata (job ID, queue name, status, duration, error message, timestamp) over HTTPS. Redis stays behind your firewall. Credentials never leave the process.

## The Design Question: Event Listener Backpressure

Here's where I'd appreciate feedback. Our agent attaches one `QueueEvents` listener per queue. Each listener holds a Redis connection from the Worker's connection pool. At scale — say, 50 queues with 10,000 jobs/second — this creates two concerns:

1. **Listener saturation**: If the HTTPS transport falls behind (API latency spike, network partition), events accumulate in the Node.js microtask queue. The `QueueEvents` emitter runs in the same event loop as your job handler. Could a backed-up listener delay job acknowledgments?

2. **Connection multiplexing**: BullMQ v2 supports shared connections (`new IORedis()` passed to both Worker and QueueEvents), but each `QueueEvents` instance still opens its own Redis subscriber connection internally. Has anyone benchmarked the overhead of 50+ subscriber connections on a single Redis instance?

Current mitigation: the agent drops the oldest buffered events when the buffer exceeds capacity (preferring fresh data over completeness), but this doesn't address the event loop concern.

Would love to hear from teams running BullMQ at high throughput — how do you handle QueueEvents listener backpressure in production?

## Stack

- Agent: TypeScript, BullMQ v2, ioredis
- API: Express + Supabase (Postgres) + Upstash Redis
- Frontend: Next.js 14 App Router
- Deployment: Render (API) + Vercel (frontend)

Agent is MIT-licensed: https://github.com/qcanary/qcanary (in the apps/agent directory)

Happy to answer any questions or dive deeper into any part of the architecture.
