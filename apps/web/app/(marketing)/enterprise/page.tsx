"use client";

import * as React from "react";
import { Shield, Users, Server, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";

const FEATURES = [
  {
    icon: Shield,
    title: "Data Residency",
    body: "GDPR, HIPAA, and SOC 2 require data to stay in specific regions. With self-hosted QCanary, your data never leaves your infrastructure.",
  },
  {
    icon: Users,
    title: "SSO & Access Control",
    body: "SAML 2.0 and OIDC integration with your existing identity provider. Role-based access control. Audit logs. Everything your security team asks for.",
  },
  {
    icon: Server,
    title: "No Vendor Lock-in",
    body: "The agent is MIT-licensed. The dashboard is source-available. If we disappear, your monitoring keeps running. You own the code.",
  },
];

const INCLUDED_ITEMS = [
  "Self-hosted deployment (Docker, Kubernetes, or bare metal)",
  "SAML 2.0 / OIDC single sign-on",
  "Role-based access control (admin, engineer, viewer)",
  "Unlimited projects, queues, and team members",
  "Unlimited event history (your storage, your retention policy)",
  "Custom alert integrations (PagerDuty, OpsGenie, ServiceNow, webhooks)",
  "Dedicated support engineer (Slack channel, 24h response SLA)",
  "SOC 2 Type II report included",
  "Annual penetration testing",
  "Custom feature development (negotiated)",
  "White-glove onboarding (we deploy for you)",
];

const FAQS = [
  {
    q: "How long does self-hosted deployment take?",
    a: "Most teams are up and running in under 2 hours with our Docker Compose template. For Kubernetes or custom environments, we provide white-glove onboarding and typically have you running within a day.",
  },
  {
    q: "Do you offer managed self-hosted (you run it in our VPC)?",
    a: "Yes. We can deploy and manage QCanary in your AWS, Azure, or GCP account. You own the data and infrastructure. We handle updates and monitoring.",
  },
  {
    q: "What happens if we want to switch to cloud later?",
    a: "Your data exports in standard formats. You can migrate from self-hosted to cloud (or back) with zero data loss. We don't trap you.",
  },
  {
    q: "Is the self-hosted version the same as cloud?",
    a: "Feature-for-feature identical. The only difference is where the data lives. Cloud updates roll out automatically. Self-hosted updates are packaged as Docker images you control.",
  },
  {
    q: "What's the pricing?",
    a: "Enterprise is custom-priced based on team size, deployment model (self-hosted vs managed), and SLA needs. Contact us for a quote tailored to your requirements.",
  },
];

type FormStatus = "idle" | "submitting" | "success" | "error";

export default function EnterprisePage() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [teamSize, setTeamSize] = React.useState("");
  const [industry, setIndustry] = React.useState("");
  const [currentSetup, setCurrentSetup] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [deployment, setDeployment] = React.useState("");
  const [timeline, setTimeline] = React.useState("");
  const [status, setStatus] = React.useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = React.useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch(`/api/v1/enterprise/inquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, company, teamSize, industry,
          currentSetup, reason: reason || undefined,
          deployment: deployment || undefined,
          timeline: timeline || undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error?.message || "Submission failed");
      }
      setStatus("success");
    } catch (e) {
      setStatus("error");
      setErrorMsg(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <main id="main-content" className="min-h-screen bg-bg text-text-primary">
        <MarketingNav showCompare={false} showBlog={false} />
        <section className="mx-auto max-w-2xl px-6 py-24 text-center">
          <div className="rounded-2xl border border-accent/20 bg-accent/[0.03] p-10">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
              <CheckCircle className="h-6 w-6 text-accent" />
            </div>
            <h1 className="mt-4 text-2xl font-semibold">Thanks, {name}!</h1>
            <p className="mt-2 text-text-muted">
              We&apos;ve received your inquiry and will get back to you within 24 hours. In the meantime, check out our{" "}
              <a href="/docs" className="text-accent hover:underline">documentation</a>.
            </p>
          </div>
        </section>
        <MarketingFooter />
      </main>
    );
  }

  return (
    <main id="main-content" className="min-h-screen bg-bg text-text-primary">
      <MarketingNav showCompare={false} showBlog={false} />

      {/* â”€â”€ Hero â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-accent/[0.02] via-surface/10 to-code-bg/20">
        <div className="pointer-events-none absolute -right-40 -top-40 h-80 w-80 rounded-full bg-accent/[0.03] blur-3xl" />
        <div className="pointer-events-none absolute -left-40 bottom-0 h-60 w-60 rounded-full bg-accent/[0.02] blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-6 py-20 md:py-28 text-center">
          <span className="inline-flex items-center rounded-full border border-accent/20 bg-accent/[0.05] px-3 py-1 text-xs font-medium text-accent">
            For regulated industries &amp; security teams
          </span>
          <h1 className="mt-6 text-3xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Your infrastructure. <span className="text-accent">Your rules.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-text-muted md:text-lg">
            Deploy QCanary on-premise or in your own VPC. Keep every byte of data under your control.
            Meet compliance requirements without compromising on queue monitoring.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" onClick={() => document.getElementById("inquiry-form")?.scrollIntoView({ behavior: "smooth" })}>
              Talk to Sales <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <a href="/docs">
              <Button variant="secondary" size="lg">
                View self-hosted docs
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* â”€â”€ Book a Demo â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="border-b border-border bg-gradient-to-b from-surface/10 to-bg">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Prefer to talk?</h2>
          <p className="mt-2 text-text-muted">
            Book a 30-minute technical walkthrough. No sales pitch â€” just a demo of the self-hosted deployment.
          </p>
          <div className="mt-6">
            <a href="https://calendly.com/qcanary/enterprise-demo" target="_blank" rel="noopener noreferrer">
              <Button size="lg">Book a Demo <ArrowRight className="ml-1 h-4 w-4" /></Button>
            </a>
          </div>
        </div>
      </section>

      {/* â”€â”€ Why Self-Hosted â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="border-b border-border bg-gradient-to-b from-bg via-surface/[0.02] to-bg">
        <div className="mx-auto max-w-5xl px-6 py-20 md:py-24">
          <h2 className="text-center text-2xl font-semibold tracking-tight md:text-3xl">Why teams choose self-hosted</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {FEATURES.map((feat) => (
              <div key={feat.title} className="group rounded-xl border border-border bg-surface/30 p-6 transition-all hover:border-accent/20 hover:bg-surface/40">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/[0.08] group-hover:bg-accent/[0.12] transition-colors">
                  <feat.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{feat.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">{feat.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€ What's Included â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="border-b border-border bg-gradient-to-b from-surface/10 via-bg to-surface/5">
        <div className="mx-auto max-w-4xl px-6 py-20 md:py-24">
          <h2 className="text-center text-2xl font-semibold tracking-tight md:text-3xl">What&apos;s included</h2>
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {INCLUDED_ITEMS.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-lg border border-border/50 bg-black/20 p-4">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-text-primary">{item}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-text-muted/60 italic">
            Custom SLAs available. Contact us for 99.99% uptime guarantees and dedicated infrastructure.
          </p>
        </div>
      </section>

      {/* â”€â”€ Social Proof â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="border-b border-border bg-gradient-to-b from-bg via-surface/5 to-bg">
        <div className="mx-auto max-w-3xl px-6 py-16 md:py-20 text-center">
          <div className="rounded-2xl border border-border/60 bg-surface/20 p-8 md:p-10">
            <h2 className="text-xl font-semibold md:text-2xl">Trusted by teams with strict requirements</h2>
            <blockquote className="mt-6 text-base leading-relaxed text-text-muted italic md:text-lg">
              &ldquo;We&apos;re currently working with 3 enterprise teams on self-hosted pilots.
              If you&apos;re considering self-hosted QCanary, you&apos;re in good company.&rdquo;
            </blockquote>
            <p className="mt-4 text-sm text-text-muted/60">&mdash; the founder, QCanary</p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-6"
              onClick={() => document.getElementById("inquiry-form")?.scrollIntoView({ behavior: "smooth" })}
            >
              Join the pilot program <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </div>
      </section>

      {/* â”€â”€ The Form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section id="inquiry-form" className="border-b border-border bg-gradient-to-b from-bg via-surface/10 to-bg">
        <div className="mx-auto max-w-2xl px-6 py-20 md:py-24">
          <h2 className="text-center text-2xl font-semibold tracking-tight md:text-3xl">Talk to us about Enterprise</h2>
          <p className="mt-2 text-center text-sm text-text-muted">
            We&apos;ll get back to you within 24 hours. No sales calls unless you want one.
          </p>

          {status === "error" && (
            <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* Name + Email */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="ent-name">Name</Label>
                <Input id="ent-name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="ent-email">Work Email</Label>
                <Input id="ent-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1.5" />
              </div>
            </div>

            {/* Company + Team Size */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="ent-company">Company</Label>
                <Input id="ent-company" value={company} onChange={(e) => setCompany(e.target.value)} required className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="ent-team-size">Team Size</Label>
                <Select id="ent-team-size" value={teamSize} onChange={(e) => setTeamSize(e.target.value)} className="mt-1.5">
                  <option value="" disabled>Select team size</option>
                  <option value="1-10">1-10</option>
                  <option value="11-50">11-50</option>
                  <option value="51-200">51-200</option>
                  <option value="200+">200+</option>
                </Select>
              </div>
            </div>

            {/* Industry */}
            <div>
              <Label htmlFor="ent-industry">Industry</Label>
              <Select id="ent-industry" value={industry} onChange={(e) => setIndustry(e.target.value)} className="mt-1.5" required>
                <option value="" disabled>Select your industry</option>
                <option value="Fintech">Fintech</option>
                <option value="Healthcare">Healthcare</option>
                <option value="E-commerce">E-commerce</option>
                <option value="SaaS">SaaS</option>
                <option value="Government">Government</option>
                <option value="Other">Other</option>
              </Select>
            </div>

            {/* Current Setup */}
            <div>
              <Label htmlFor="ent-setup">Current Queue Setup</Label>
              <textarea
                id="ent-setup"
                value={currentSetup}
                onChange={(e) => setCurrentSetup(e.target.value)}
                required
                placeholder="What job queue system do you use? How many queues? What volume?"
                className="mt-1.5 flex min-h-[80px] w-full rounded-xl border border-border bg-code-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 resize-y"
              />
            </div>

            {/* Optional fields */}
            <details className="rounded-xl border border-border/50 bg-surface/20 p-4">
              <summary className="cursor-pointer text-sm font-medium text-text-muted hover:text-text-primary">
                Additional details (optional)
              </summary>
              <div className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="ent-reason">Why self-hosted?</Label>
                  <textarea
                    id="ent-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="GDPR requirements? Security team mandate? Air-gapped environment?"
                    className="mt-1.5 flex min-h-[80px] w-full rounded-xl border border-border bg-code-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 resize-y"
                  />
                </div>
                <div>
                  <Label htmlFor="ent-deployment">Preferred Deployment</Label>
                  <Select id="ent-deployment" value={deployment} onChange={(e) => setDeployment(e.target.value)} className="mt-1.5">
                    <option value="">Not sure yet</option>
                    <option value="Docker Compose">Docker Compose</option>
                    <option value="Kubernetes">Kubernetes</option>
                    <option value="AWS">AWS</option>
                    <option value="Azure">Azure</option>
                    <option value="GCP">GCP</option>
                    <option value="On-premise">On-premise</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ent-timeline">Timeline</Label>
                  <Select id="ent-timeline" value={timeline} onChange={(e) => setTimeline(e.target.value)} className="mt-1.5">
                    <option value="">Just exploring</option>
                    <option value="ASAP">ASAP</option>
                    <option value="This quarter">This quarter</option>
                    <option value="Next quarter">Next quarter</option>
                  </Select>
                </div>
              </div>
            </details>

            <Button type="submit" size="lg" className="w-full" disabled={status === "submitting"}>
              {status === "submitting" ? "Sending..." : "Send Inquiry"}
            </Button>
            <p className="text-center text-xs text-text-muted/50">
              We read every inquiry personally. If you&apos;re a good fit, we&apos;ll schedule a 30-minute technical
              walkthrough. No pressure.
            </p>
          </form>
        </div>
      </section>

      {/* â”€â”€ FAQ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="border-b border-border bg-gradient-to-b from-surface/5 via-bg to-surface/10">
        <div className="mx-auto max-w-3xl px-6 py-20 md:py-24">
          <h2 className="text-center text-2xl font-semibold tracking-tight md:text-3xl">Frequently Asked Questions</h2>
          <div className="mt-10 space-y-3">
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                className="group cursor-pointer rounded-xl border border-border bg-surface/30 transition-all hover:border-accent/30 open:border-accent/30 open:bg-surface/40"
              >
                <summary className="flex items-center justify-between px-5 py-4 text-sm font-medium text-text-primary [&::-webkit-details-marker]:hidden">
                  <span>{faq.q}</span>
                  <div className="relative ml-4 h-5 w-5 shrink-0">
                    <svg
                      className="absolute inset-0 h-5 w-5 text-text-muted transition-all group-open:rotate-45 group-open:text-accent"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </summary>
                <div className="border-t border-border/50 px-5 py-4 text-sm leading-relaxed text-text-muted">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€ CTA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-surface/5 via-accent/[0.01] to-bg">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center md:py-28">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Ready to keep your monitoring in-house?
          </h2>
          <p className="mt-3 text-text-muted">
            Start with a free cloud trial. Move to self-hosted when you&apos;re ready.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" onClick={() => document.getElementById("inquiry-form")?.scrollIntoView({ behavior: "smooth" })}>
              Talk to Sales <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <a href="/sign-up">
              <Button variant="secondary" size="lg">
                Try cloud free
              </Button>
            </a>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
