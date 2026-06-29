# QCanary

## Tagline

BullMQ monitoring without sharing Redis credentials.

## Short Description

QCanary gives Node.js teams real-time BullMQ dashboards, job history, and alerts through a lightweight agent. No Redis exposure, no firewall changes, and a free tier to start monitoring production queues in minutes.

## Maker Comment

Hey Product Hunt,

We built QCanary because background jobs are usually invisible until something breaks.

If you run BullMQ in production, you probably rely on queues for important workflows: emails, reports, webhooks, billing syncs, notifications, imports, exports, and retries. When those jobs fail silently or start backing up, customers notice before the team does.

Most queue monitoring tools solve this by asking for direct Redis access. That creates an uncomfortable tradeoff: get visibility, but share infrastructure credentials and potentially open private network access.

QCanary takes a different approach.

Install `@qcanary/agent` in your Node.js worker, attach it to your BullMQ queues, and the agent streams lightweight job metadata to QCanary using BullMQ `QueueEvents`. Redis credentials stay inside your infrastructure.

What you get:

- Real-time BullMQ dashboards
- Failed job details and history
- Alert rules for failures, no activity, queue depth, and job duration
- Slack, email, and webhook notifications
- Auto-resolution when queues recover
- Usage and plan limits visible in Settings

The free tier is designed so teams can try QCanary on a real project before upgrading. You can create a project, send events, inspect failures, and validate the monitoring model without committing to a paid plan.

We would love feedback from teams running BullMQ, Bee-Queue, Sidekiq-style workflows, or any Redis-backed job system. The big question we are exploring is how much observability teams can get from event metadata without requiring direct access to the backing datastore.

Try it free: https://qcanary.dev

Docs: https://qcanary.dev/docs
