# LinkedIn DM Template

## Founder-to-Founder Outbound (YC Companies Processing LLM Background Jobs)

Use this template for reaching out to founders of YC companies whose stack includes BullMQ or similar job queues. Keep it short, personal, and specific to their tech stack — do not send this verbatim without personalizing the first paragraph.

---

## Template

**Subject:** Queue monitoring for [Company Name]'s background jobs

Hi [First Name],

I noticed [Company Name] is processing [LLM inference / video transcoding / notification delivery — INSERT SPECIFIC USE CASE] via background jobs. I've been working on a monitoring tool specifically for teams running BullMQ in production, and it might be useful for your setup.

The short version: it monitors BullMQ queues without ever connecting to Redis. An agent attaches to BullMQ's QueueEvents inside your worker process and streams job metadata over HTTPS. No credential sharing, no VPC changes, no payload exposure.

I'd like to offer you a free Pro account (unlimited projects, 90-day history, webhook alerts) — no credit card, no time limit. I'm looking for feedback from teams processing high-volume jobs, and [Company Name] seems like a great fit.

If you're interested, I can send you an invite link. Either way, I'd love to hear about any queue monitoring pain points you're running into.

Best,

[Your Name]
Founder, QCanary
