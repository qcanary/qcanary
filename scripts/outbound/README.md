# Outbound Outreach — BullMQ User Acquisition

## Goal

Find 50+ engineers using BullMQ in production and personally invite them to try qcanary.dev.

## Strategy

1. **GitHub code search** — Find repos actively using BullMQ
2. **Personalized DM** — Reach out with a 2-sentence value prop and no hard sell
3. **Track** — Log who you contacted to avoid duplicate outreach

---

## Method 1: GitHub Code Search (Quickest)

Search GitHub for BullMQ usage:

```
https://github.com/search?q=bullmq+OR+%22BullMQ%22+OR+Queue+Scheduler+language%3Ajavascript+language%3Atypescript&type=code&s=indexed&o=desc
```

Filter by:
- Recently indexed (shows active projects)
- Repos with 10+ stars (serious projects)
- Not forks

For each repo, look at:
- `README.md` — find the maintainer's email/twitter
- Recent commits — find active contributors
- `package.json` — check if bullmq is a dependency

### DM Template (GitHub)

```
Hey {name},

I noticed {repo} uses BullMQ. We just built qcanary.dev — it monitors BullMQ
queues without needing Redis credentials. Totally free to start.

Would love your feedback: https://qcanary.dev
```

### DM Template (Twitter/X)

```
Hey {name}, saw your work on {repo} with BullMQ. We built qcanary.dev
to monitor BullMQ queues (no Redis creds needed). Would love to hear
what you think!
```

### DM Template (LinkedIn)

```
Hi {name},

I came across {repo} and noticed you're using BullMQ for queue processing.

We recently built qcanary.dev — a monitoring dashboard for BullMQ that works
without Redis credentials. It's free to get started, and I'd love to hear
your thoughts if you try it out.

Best,
[Your name]
```

---

## Method 2: npm Registry (Data-Driven)

Query the npm registry for packages that depend on BullMQ:

```bash
# Get weekly download count
curl -s https://api.npmjs.org/downloads/point/last-week/bullmq

# Search for packages mentioning BullMQ
curl -s "https://registry.npmjs.org/-/v1/search?text=bullmq&size=250"
```

Then cross-reference with GitHub to find maintainers.

---

## Method 3: Reddit & Discord

- **Reddit r/node**: Search for "BullMQ" and dm users asking queue questions
- **BullMQ Discord**: Join the BullMQ discord and help answer questions — build reputation, then mention qcanary naturally

---

## Tracking Spreadsheet

Track outreach in a simple CSV (`tracking.csv`):

```csv
date,platform,username,repo,contacted,replied,signed_up
2026-07-10,GitHub,octocat,something-using-bullmq,yes,no,no
```

---

## Success Metrics

- 50 DMs sent → 15 replies → 5 signups → 1 paying customer (G1 gate)
