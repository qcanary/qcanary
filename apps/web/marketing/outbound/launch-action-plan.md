# QCanary Launch Action Plan

**Goal:** Get first 10–20 signups within 30 days
**Status:** All marketing assets ready — publish dates below are suggested targets

---

## Week 1: Foundation (Days 1–7)

### Day 1: 🚀 Hacker News Launch

**Action:** Post "Show HN: QCanary"

**Copy-paste post is ready at:** `marketing/launch-posts/show-hn.md`

**Tips for a good HN launch:**
- Post between 8–10 AM ET on a weekday (best engagement)
- Be active in the comments for the first 3 hours
- The post includes a specific technical question about QueueEvents backpressure — HN loves debating architecture
- Reply to every comment within the first 6 hours

### Day 2: Reddit Posts

**Action 1:** Post in r/node **(copy-paste ready at `marketing/launch-posts/reddit-node.md`)**
- Best time: 10 AM–2 PM ET on a weekday
- The post is framed as a question, not self-promotion — this is key for Reddit

**Action 2:** Cross-post to r/nestjs *(if relevant — NestJS often uses Bull/BullMQ)*
- Short version: "How do you monitor BullMQ in production without exposing Redis?"

### Day 3: Publish to Dev.to

**Action:** Publish the post from `marketing/launch-posts/dev-to.md`

**Tips:**
- Dev.to is very Node.js friendly
- Include the cover image URL: `https://qcanary.dev/og-bullmq-monitoring.png`
- Add relevant tags: `node`, `bullmq`, `redis`, `monitoring`
- Engage with comments for the first 48 hours

### Day 4: X/Twitter Thread

**Action:** Post a thread using the tweets from `marketing/launch-posts/product-hunt.md`

**Suggested thread structure:**
1. **Tweet 1:** "Every BullMQ monitoring tool asks for your REDIS_URL. We built an alternative that doesn't. 🧵"
2. **Tweet 2 (image):** Screenshot of the 3-line setup code
3. **Tweet 3:** Architecture diagram (agent inside worker → HTTPS → dashboard)
4. **Tweet 4:** Link to qcanary.dev

**Tag accounts to engage:**
- @bullmqjs (official BullMQ account if active)
- @nodejs
- Relevant Node.js/infra accounts

### Day 5: LinkedIn

**Action:** Post a shorter version of the Dev.to article on LinkedIn

**Suggested approach:**
- Frame it as a lesson learned: "I spent 3 years building a BullMQ monitoring tool, and the #1 concern from every engineering team was..."
- Include the agent architecture comparison diagram
- Tag relevant engineering communities

---

## Week 2: Content Marketing (Days 8–14)

### Day 8: SEO Blog Post Published

**Already live on site:** 
- `bull-board-vs-hosted-monitoring`
- `how-to-monitor-bullmq-without-exposing-redis`
- `how-to-monitor-bullmq-in-production`

**Action:** Share each blog post on social media with a 2–3 sentence summary

### Day 10: Comparison Page

**Action:** Write and publish a "QCanary vs Bull Board" comparison

**Goal:** Capture search traffic for "bull board vs hosted monitoring", "BullMQ monitoring alternatives"

### Day 11: NPM Discovery

**Action:**
1. The `@qcanary/agent` README has been rewritten for conversion — verify it looks good on npmjs.com
2. Add `bullmq`, `queue-monitoring`, `redis-monitoring` keywords to package.json
3. Ensure GitHub repo has a good description and topics set

### Day 12–14: Community Engagement

- Monitor HN/Reddit comments from Week 1 launches
- Reply to every question
- Track signup source in PostHog

---

## Week 3: Follow-up & Iteration (Days 15–21)

### Day 15: Post-HN Follow-up

If the HN post got traction (50+ points), post a follow-up comment or blog post addressing the key feedback.

### Day 17: Product Hunt Prep

**Copy-paste ready at:** `marketing/launch-posts/product-hunt.md`

**Product Hunt launch checklist:**
- [ ] Create maker profile on Product Hunt
- [ ] Schedule launch for a Tuesday–Thursday
- [ ] Prepare a 30-second demo GIF or video
- [ ] Notify your network the day before
- [ ] Respond to every comment within the first 24 hours
- [ ] The Product Hunt post includes the tagline, subtitle, and maker comment — all ready

### Day 19: Cold Outreach (Optional)

**Target:** Node.js meetup organizers, open-source maintainers, dev tool reviewers

**Template:**
> Hi [Name],
>
> I built QCanary — an agent-based BullMQ monitoring tool that never asks for Redis credentials. It attaches to QueueEvents inside the worker process and streams metadata over HTTPS.
>
> If you run Node.js queues in production, I'd love your feedback. Free tier available at qcanary.dev.
>
> — [Your name]

---

## Week 4: Measure & Iterate (Days 22–30)

### Metrics to track in PostHog:

| Metric | Target |
|--------|--------|
| Website visitors | 500+/week |
| Signups | 10–20 total |
| Blog traffic | 30% of total |
| Signup-to-dashboard rate | >50% |
| Agent installed | >5 |

### If traction is good (>10 signups):
- Write 2 more blog posts (technical deep-dives)
- Start a "BullMQ monitoring" keyword strategy
- Consider a Product Hunt re-launch or HN "Tell HN" follow-up

### If traction is low (<5 signups):
- Analyze where users drop off in PostHog
- A/B test the landing page CTA
- Reach out directly to Node.js engineers on Twitter/LinkedIn
- Consider a free trial extension or "startup plan" with a discount code

---

## Quick-Reference: All Marketing Assets

| Asset | Location |
|-------|----------|
| HN Launch Post | `marketing/launch-posts/show-hn.md` |
| Reddit r/node Post | `marketing/launch-posts/reddit-node.md` |
| Product Hunt Launch | `marketing/launch-posts/product-hunt.md` |
| Dev.to Article | `marketing/launch-posts/dev-to.md` |
| Blog Post 1 (Live) | `/blog/monitor-bullmq-without-exposing-redis` |
| Blog Post 2 (Live) | `/blog/bull-board-vs-hosted-monitoring` |
| Blog Post 3 (Live) | `/blog/how-to-monitor-bullmq-without-exposing-redis` |
| Blog Post 4 (Live) | `/blog/how-to-monitor-bullmq-in-production` |

---

## Key URL Tracking (PostHog)

Add `?ref=` to links in each launch for source attribution:

- `https://qcanary.dev/?ref=hn`
- `https://qcanary.dev/?ref=reddit`
- `https://qcanary.dev/?ref=devto`
- `https://qcanary.dev/?ref=twitter`
- `https://qcanary.dev/?ref=producthunt`
- `https://qcanary.dev/?ref=linkedin`

---

## Quick Wins Checklist (Can be done in 1 hour)

- [ ] **Post on HN** — submit the Show HN post
- [ ] **Post on Reddit** — r/node and r/nestjs
- [ ] **Post on Dev.to** — publish the pre-written article
- [ ] **Post on X** — the 4-tweet thread
- [ ] **Share on LinkedIn** — short version with architecture diagram
- [ ] **Update npm README** — ✅ already improved
- [ ] **Add JSON-LD structured data** — ✅ already added
- [ ] **Update sitemap with new blog posts** — ✅ already done
- [ ] **Make blog pages indexable by Google** — ✅ already fixed (blog now public)
