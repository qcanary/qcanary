# Product Hunt Launch Assets

## Tagline

Monitor BullMQ Without Exposing Redis.

## Subtitle

An agent-based monitoring tool for BullMQ that attaches to QueueEvents inside your worker process. No Redis URL sharing. No port 6379 exposure. No VPC changes.

## Maker Comment

I've been running BullMQ in production for the past three years. The one thing that consistently bothered me was every monitoring tool asking for a `REDIS_URL`.

Redis has no row-level security. Once you hand over the URL, the vendor has full access to your queue state, job data, and any other keys in that instance. For teams with SOC 2 requirements or zero-trust policies, this turns a 5-minute setup into a week-long security review.

So I built QCanary differently.

Instead of connecting to Redis remotely, QCanary runs a tiny agent inside your Worker process that subscribes to BullMQ's built-in QueueEvents emitter. The agent streams only job lifecycle metadata (status, duration, errors) over HTTPS. No payloads. No credentials. Just events.

The result is a monitoring dashboard with real-time queue visibility, Slack/email/webhook alerts, and job history — all without ever sharing your Redis URL.

The agent is MIT-licensed on GitHub. I'd love to hear what you think, especially if you've dealt with the Redis sharing problem in your own infrastructure.

https://qcanary.dev

## Launch Tweets

### Tweet 1 (Announcement)

Every BullMQ monitoring tool asks for your REDIS_URL.

That means credential sharing, port exposure, and a compliance review — for a dashboard.

We built an agent-based alternative. It attaches to QueueEvents inside your process. Redis stays behind your firewall.

https://qcanary.dev

### Tweet 2 (Technical)

The architecture is straightforward:

1. @qcanary/agent subscribes to BullMQ QueueEvents in your Worker process
2. It buffers events and ships job metadata (status, duration, errors) over HTTPS
3. Your Redis URL never leaves your VPC

No credential sharing. No firewall changes. Just events.

### Tweet 3 (Community)

Built this because I was tired of explaining to security teams why a monitoring tool needed our Redis URL.

Agent is MIT-licensed. API runs on Postgres + Upstash. Full stack TypeScript.

Would love feedback from the BullMQ community on the approach.
