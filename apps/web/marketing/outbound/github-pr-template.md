# GitHub PR Template

## Template for suggesting @qcanary/agent in open-source Node.js boilerplates

Use this template when opening PRs to add @qcanary/agent as an optional monitoring dependency in open-source projects that use BullMQ. The tone should focus on adding value to the project, not promoting the service.

---

### PR Title

`feat: add optional BullMQ queue monitoring via @qcanary/agent`

### PR Body

**What this does**

Adds an optional monitoring integration for BullMQ queues in this project. Users who want visibility into queue health can install `@qcanary/agent` and initialize it with their project's existing BullMQ setup.

The integration follows the project's existing patterns for optional dependencies and does not add runtime overhead when the monitor is not configured.

**Why optional**

Queue monitoring is useful for production deployments, but not every user needs it. This implementation:

- Is gated behind an environment variable (`QCANARY_API_KEY`)
- Does not add startup time or memory allocation when disabled
- Uses the project's existing BullMQ connection — no additional Redis connections
- Never sends job payloads, only lifecycle metadata (status, duration, errors)

**Implementation details**

The monitor attaches to BullMQ's `QueueEvents` emitter inside the existing Worker process. It buffers job lifecycle events and sends them over HTTPS. No Redis credentials leave the process — the agent only needs an API key.

```typescript
// Optional: add to your worker setup
if (process.env.QCANARY_API_KEY) {
  const { QueueMonitor } = await import("@qcanary/agent");
  new QueueMonitor({
    apiKey: process.env.QCANARY_API_KEY,
    queues: [{ name: "default", connection }],
  }).start();
}
```

**Testing**

- [ ] Verified that the monitor initialization is a no-op when `QCANARY_API_KEY` is not set
- [ ] Verified that the monitor's buffer does not delay the Worker's event loop when enabled
- [ ] Existing tests pass with and without the monitoring code

**Checklist**

- [ ] I've read the contributing guidelines
- [ ] This change follows the project's existing code style and patterns
- [ ] I've tested with both the monitoring enabled and disabled
- [ ] No additional dependencies are required in `package.json` — the user installs `@qcanary/agent` themselves

---

### Notes for the reviewer

- The agent is MIT-licensed and open-source at https://github.com/qcanary/qcanary
- Adding this integration is entirely optional and does not affect the project's build, bundle size, or runtime behavior when the API key is not configured
- Happy to adjust the implementation to better match the project's conventions
