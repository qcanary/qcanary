# Reddit r/node Post

---

## Title

How do you handle queue monitoring in production VPCs without exposing Redis?

## Post

I run BullMQ in production and I've been going back and forth on the monitoring setup.

Bull Board works great on localhost, but once you put it behind a VPC, you run into the same set of problems:

- The dashboard needs Redis access, which means either running it inside the VPC (bastion/VPN access for every engineer) or exposing Redis to the dashboard's network
- There's no built-in auth, so you need to wrap it with middleware
- No alerting — you still need a separate pipeline for Slack notifications on queue failures

The alternative is hosted monitoring, but almost every vendor asks for a REDIS_URL. That's a non-starter when your security team has a zero-trust policy or you're going through SOC 2.

I've been experimenting with an approach where a small agent attaches to BullMQ's QueueEvents emitter inside the Worker process and ships job metadata over HTTPS — no Redis credentials ever leave the process. It means giving up payload visibility in the dashboard (the agent only sends status, duration, and error messages), but it eliminates the credential sharing problem entirely.

**How is your team handling this?**

- Are you running Bull Board in production with auth middleware?
- Using a hosted service that connects directly to Redis?
- Something else entirely?

Curious what patterns are working for other teams running BullMQ in production. The Redis access question seems like a common pain point but I don't see many discussions about the security trade-offs.

---

*Note: I built a tool (QCanary) that implements the agent approach I described above, but I'm genuinely interested in how others solve this — the Bull Board + Prometheus setup is also valid and I'd like to hear about it.*
