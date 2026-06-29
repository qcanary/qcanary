# Show HN: QCanary - Monitor BullMQ queues without sharing Redis credentials

Hi HN,

I built QCanary, a hosted monitoring dashboard for BullMQ queues that does not require you to share Redis credentials with the service.

The idea came from a recurring problem I saw with production queue monitoring: the easiest way to build a queue dashboard is to ask for the Redis URL and inspect queue state directly. That works technically, but it is a bad fit for many production teams. Redis often lives inside a private network, and the connection string may provide much broader access than a monitoring tool really needs. Sharing it with another vendor creates a new secret to audit, rotate, and defend.

QCanary uses an agent-based model instead.

You install `@qcanary/agent` in the Node.js process that already creates your BullMQ queues. The agent attaches to BullMQ `QueueEvents`, listens for lifecycle events such as `completed`, `failed`, `active`, `waiting`, `stalled`, and `delayed`, and sends lightweight metadata to QCanary over HTTPS.

The hosted service never connects to Redis. It never receives your Redis URL. It only receives event metadata: queue name, job id, status, timestamps, duration, attempts, and error details for failed jobs.

That gives you:

- Real-time queue dashboards
- Job history and failure details
- Slack, email, and webhook alert rules
- Auto-resolution when alert conditions recover
- Plan usage tracking and retention limits

The first version is focused on BullMQ because it has a clean event model and a lot of Node.js teams already rely on it for critical background work.

I would appreciate feedback on:

- Whether the agent-based model feels like the right security tradeoff
- Which BullMQ metrics would be most useful beyond lifecycle events
- How you would want alert thresholds to work for high-volume queues
- Any concerns about running a monitoring agent inside worker processes

Docs: https://qcanary.dev/docs

Thanks for taking a look.
