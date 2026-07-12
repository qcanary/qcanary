# 🚀 Qcanary.dev — Product Hunt Launch Plan

> **Goal:** #1 Product of the Day → first paying customer
> **Target date:** Pick a **Tuesday, Wednesday, or Thursday** (peak PH days)
> **Prep window:** 14 days

---

## Part 1: The Product Hunt Submission

### Tagline (formula: Action Verb + Outcome + Time/Ease)
```
Monitor BullMQ queues without exposing Redis credentials
```

### Short Description
```md
Qcanary is a zero-trust monitoring dashboard for BullMQ. A lightweight agent
hooks into BullMQ's QueueEvents — no Redis credentials ever leave your worker.
Track failure rates, queue depth, and job latency in real-time. Get alerted
via Slack or email when things go wrong.
```

### Long Description (for the PH page body)
```md
**The problem**

If you run BullMQ in production, you've wanted basic monitoring: failed job
counts, queue depth, alerting. But every monitoring tool requires direct Redis
access — which security teams block. So most teams fly blind.

**How Qcanary is different**

Instead of connecting to Redis, a tiny Node.js agent sits alongside your
worker and hooks into BullMQ's built-in QueueEvents. Events are forwarded
to our API via HTTP. No Redis credentials ever leave your process.

What you get:

• **Live dashboards** — Queue health, failure rates, job latency, all updating
  in real-time via Supabase Realtime
• **Smart alerts** — Failure rate thresholds, no-activity detection, queue
  depth warnings. Delivered to Slack, email, or webhook
• **7 & 30-day metrics** — Spot trends before they become incidents
• **Open-core** — The agent is open-source. Deploy on your infra or use our
  hosted dashboard

**The maker story**

We run BullMQ in production ourselves. Our security team said no to every
Redis-connected monitoring tool. So we built Qcanary — the monitoring
dashboard that security teams actually approve.

**Stack:** TypeScript · Next.js · Express · Supabase · Redis (BullMQ) ·
Resend · Clerk · Dodo Payments · PostHog

**Pricing:**
• **Starter** — Free. 1 project, 7-day history, email alerts
• **Pro** — $9/mo or $92/yr. Unlimited projects, 30-day history, Slack +
  webhook alerts
• **Enterprise** — Custom. Self-hosted, SSO, dedicated support
```

### First Comment (maker comment — posted immediately after submission)

```md
Hey Product Hunt! 👋

I'm [name], and I built Qcanary because I was tired of explaining to
my security team why I needed Redis credentials on yet another dashboard.

BullMQ runs in thousands of production deployments, but most teams have
zero visibility into what's happening with their queues. When a job fails
silently at 3am, you don't know until a customer complains.

The core insight is simple: instead of connecting to Redis (which security
teams hate), we hook into BullMQ's built-in event emitter. A 2KB agent
sits alongside your worker, listens to QueueEvents, and forwards them
via HTTP. No Redis credentials ever leave your process.

It's open-core (the agent is fully open-source), free to start, and
takes about 90 seconds to set up.

I'd love to hear your feedback — especially if you've dealt with queue
monitoring blind spots. Happy to answer any questions about the
architecture!

— [name]
```

### Gallery Images (need 5 assets — create these before launch)

| # | Content | What to show |
|---|---------|-------------|
| 1 | **Dashboard overview** | The main queue dashboard with live metrics |
| 2 | **Alert configuration** | The alert creation UI (Slack/email/webhook) |
| 3 | **Queue detail** | Deep dive into a single queue: failure rates, latency, job history |
| 4 | **Agent setup** | The 3-line code snippet to install @qcanary/agent |
| 5 | **Comparison** | "Before Qcanary" vs "After Qcanary" — blind monitoring vs full visibility |

### Video (optional but recommended — under 90 seconds)

Record a Loom-style walkthrough:
1. Show the problem: a BullMQ worker with no monitoring (0-15s)
2. Install the agent: `npm install @qcanary/agent` and 3 lines of code (15-35s)
3. Watch the dashboard populate with live data (35-60s)
4. Set up an alert rule (60-80s)
5. CTA: "Try it free at qcanary.dev" (80-90s)

---

## Part 2: Pre-Launch Checklist (Days 1-10)

### Day 1-2: Product Readiness

- [ ] **Landing page** is optimized for PH traffic:
  - [ ] Hero section clearly states the value prop (done ✅)
  - [ ] Pricing page has clear CTA and compares Starter vs Pro (check if visible)
  - [ ] Sign-up flow works in < 60 seconds (check if any friction)
  - [ ] Docs page has a "Getting Started" guide with 3-step setup
  - [ ] No broken links or 404s on marketing pages
- [ ] **Open Graph images** are set:
  - [ ] `og-image.png` (1200x630) with product name + tagline
  - [ ] `twitter-card.png` (1200x600) same
- [ ] **Set up PH analytics** (add UTM params to track PH traffic):
  - All links in the PH post should use `?utm_source=producthunt&utm_medium=post&utm_campaign=launch`
  - Create a `/ph` redirect or dedicated landing page

### Day 3-4: Community Warming (CRITICAL)

- [ ] **Create Product Hunt "Coming Soon" page** (pre-launch page to capture emails)
  - Go to producthunt.com/launch and set up "Coming Soon"
  - Add email capture: "Notify me when this launches"
  - Share Coming Soon page on social media to collect pre-launch interest
- [ ] **Warm up your network:**
  - Message 10-20 friends/colleagues: "I'm launching on PH next Tuesday. Would you mind creating a PH account if you don't have one yet, so it's not brand new that day?"
  - Do NOT ask for upvotes — ask them to "support" or "leave feedback"
- [ ] **Join BullMQ communities:**
  - BullMQ Discord — start engaging (help answer questions)
  - Reddit r/node — participate in discussions
  - GitHub discussions on BullMQ repo

### Day 5-7: Asset Creation

- [ ] **Create gallery images** (5 screenshots with captions)
- [ ] **Record video** (90-second Loom)
- [ ] **Write/refine PH copy** (tagline, description, first comment)
- [ ] **Set up the PH hunter** — either:
  - Hunter yourself (you're the maker — perfectly fine)
  - OR find a well-known PH hunter with relevant audience (optional but can help)
- [ ] **Prepare launch day tools:**
  - TweetHunter or similar for scheduling social posts
  - Email draft for your list (Mailchimp/Resend)
  - Slack/Discord notification drafts

### Day 8-10: Final Prep

- [ ] **Submit to Product Hunt** (you can submit up to 7 days before launch date)
  - Submit at producthunt.com/launch
  - Choose launch date (pick a Tuesday or Wednesday)
  - Upload all assets
- [ ] **Build your upvote list:**
  - Create a private list of 20-30 people who will upvote within the first hour
  - These should be real PH users with history, not new accounts
- [ ] **Prepare launch day communication cadence:**
  - Email list: 1 email at launch time
  - Twitter: 3-4 posts throughout the day
  - LinkedIn: 1 post at launch
  - Discord/Slack communities: 1 post (if allowed)
  - Reddit: After you hit front page

---

## Part 3: Launch Day Playbook

### 12:01 AM PST (Midnight) — Launch!

- [ ] **Post goes live** — PH auto-publishes at midnight
- [ ] **Post the maker comment** immediately (your personal story)
- [ ] **Notify your warm list** — DM/text the 20-30 people who agreed to support
  - "It's live! Would love your feedback on the comments if you have a moment"
  - Don't say "upvote" — say "support" or "feedback"

### 6:00 AM PST — First Wave

- [ ] **Email your list** (people who signed up for early access)
  - Subject: "We just launched on Product Hunt 🚀"
  - Body: Link to PH page, ask for feedback
- [ ] **Post on Twitter/X**:
  - "We just launched @qcanary_dev on @ProductHunt! 🎉
    Monitor your BullMQ queues without exposing Redis credentials.
    Would love your support: [link]"
- [ ] **Post on LinkedIn**:
  - Professional version of the same message

### 8:00 AM PST — Community Push

- [ ] **Respond to every comment** within 10 minutes
  - Thank them personally
  - Answer questions thoroughly
  - Ask follow-up questions to keep the thread alive
- [ ] **Post in relevant Slack/Discord communities** (if allowed):
  - Your personal networks
  - Developer communities you're active in
  - DO NOT spam — one post per community

### 12:00 PM PST — Midday Push

- [ ] **Second Twitter post**:
  - Share a screenshot from your gallery with a different angle
  - "The response has been incredible! Still answering questions in the comments. Check it out: [link]"
- [ ] **Check PH leaderboard** — if you're in top 5, mention it
- [ ] **Continue replying to comments** — this is the #1 engagement metric

### 6:00 PM PST — Evening Push

- [ ] **Third Twitter post**:
  - A thread or update on how the launch is going
  - Share a behind-the-scenes fact about building Qcanary
- [ ] **Post on Reddit** (r/SideProject or r/SaaS):
  - Only if you're in top 10 — it adds momentum
  - "We launched on Product Hunt today — here's what we learned building a BullMQ monitoring tool"

### 11:30 PM PST — Final Hour

- [ ] **Last call for support** — DM your close contacts who haven't engaged yet
- [ ] **Thank everyone** who commented with a reply
- [ ] **Take screenshots** of your final position for future marketing

---

## Part 4: Converting PH Traffic to Paying Customers

### The PH Landing Page Strategy

PH visitors are curious explorers, not buyers. Your job is to convert them into:
1. **Signups** (free tier) → convert to paid later
2. **Email subscribers** (if they don't sign up)

**What to have on your landing page for PH traffic:**

1. **A "Product Hunt Special" offer** (creates urgency):
   - "Product Hunt Launch Special: 20% off Pro for life"
   - Use a coupon code like `PH20` or `PHLAUNCH`
   - Show this prominently on the pricing page

2. **Social proof prominently displayed**:
   - GitHub star count
   - "Used by [number] teams"
   - Any testimonials you have

3. **Quick-start with zero friction**:
   - Sign-up should take < 30 seconds
   - No credit card required for Starter plan
   - Demo project or sandbox to explore without setting up

### Track Everything

```md
UTM parameters to use everywhere in your PH post:
?utm_source=producthunt&utm_medium=ph_post&utm_campaign=launch_july2026

Set up PostHog (you already use it!) to track:
- PH traffic → signup conversion rate
- PH traffic → paid conversion rate
- Most visited pages from PH
- Bounce rate from PH visitors
```

### Post-Launch: Close the Loop

- [ ] **Segment all PH signups** in your database
- [ ] **Send a "welcome to Qcanary" onboarding email sequence** (3 emails over 7 days)
- [ ] **Personally reach out** to every PH commenter who signed up — offer a 1:1 demo
- [ ] **Collect testimonials** from happy users — these are gold for future marketing
- [ ] **Post-launch email sequence:**
  - Day 1: "Thanks for the support — here's how to get started"
  - Day 3: "Tips & tricks for BullMQ monitoring"
  - Day 7: "Upgrade to Pro" (with the PH discount still active)

---

## Part 5: Assets Checklist — What to Create

### Required for PH Submission

| Asset | Size | Notes |
|-------|------|-------|
| Logo/Thumbnail | 240×240px | Current brand mark works |
| Gallery Image 1 | 1280×auto | Dashboard overview (with live data) |
| Gallery Image 2 | 1280×auto | Alert configuration UI |
| Gallery Image 3 | 1280×auto | Queue detail view |
| Gallery Image 4 | 1280×auto | Code setup snippet |
| Gallery Image 5 | 1280×auto | Before/after comparison |
| Video | < 90 seconds | Loom-style walkthrough |
| First Comment | < 2000 chars | Personal maker story |

### Required for Landing Page

| Asset | Status |
|-------|--------|
| OG image (1200×630) | Need to check — `public/og-image.png`? |
| Twitter card (1200×600) | Need to check |
| PH-specific landing page (`/ph`) | Not created yet |
| Pricing page with PH offer | Need to check if visible without auth |

### Required for Launch Day

| Asset | Status |
|-------|--------|
| Email list (waitlist) | Need to build |
| Twitter/X account for qcanary | Need to check |
| LinkedIn post draft | Ready (in content-drafts.md) |
| Reddit post draft | Ready (in content-drafts.md) |
| Social proof (testimonials) | Need to collect |

---

## Part 6: The Day-By-Day Action Plan (14 Days)

```
Week 1: Setup & Warming
├─ Day 1  (Tue) — Create PH Coming Soon page, optimize landing page
├─ Day 2  (Wed) — Set up OG images, PH analytics, /ph landing page
├─ Day 3  (Thu) — Warm up network: DM 20 people to create PH accounts
├─ Day 4  (Fri) — Join BullMQ Discord/Reddit, start engaging
├─ Day 5  (Sat) — Create gallery screenshots (5 images)
├─ Day 6  (Sun) — Record 90-second video walkthrough
└─ Day 7  (Mon) — Write/refine all PH copy, maker comment

Week 2: Final Prep & Launch
├─ Day 8  (Tue) — Submit to PH (choose launch date), prepare email
├─ Day 9  (Wed) — Build upvote list (20-30 people), finalize assets
├─ Day 10 (Thu) — Test signup flow, fix any friction
├─ Day 11 (Fri) — Day off (rest before launch)
├─ Day 12 (Sat) — Final checks on all assets
├─ Day 13 (Sun) — Prepare launch day tools
└─ Day 14 (Mon) — ⚡ LAUNCH DAY!
```

---

## Part 7: Success Metrics

| Metric | Good | Great | Amazing |
|--------|------|-------|---------|
| Upvotes | 100+ | 300+ | 600+ (#1 of day) |
| Comments | 20+ | 50+ | 100+ |
| PH visits | 1,000+ | 5,000+ | 10,000+ |
| Signups from PH | 20+ | 100+ | 300+ |
| Paying customers | 1 | 5 | 15+ |
| Email subscribers | 50+ | 200+ | 500+ |

---

> **Bottom line:** Product Hunt is a distribution channel, not a revenue source.
> A great launch gets you 5,000-10,000 visitors and 100-300 signups.
> If your product is solid and has a free tier that converts, 1-5 paying
> customers from a single PH launch is realistic and excellent.
