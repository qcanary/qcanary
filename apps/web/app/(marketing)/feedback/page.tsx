"use client";

import * as React from "react";
import {
  Crown,
  MessageSquare,
  Heart,
  CheckCircle2,
  Shield,
} from "lucide-react";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export default function FeedbackPage() {
  const [formState, setFormState] = React.useState<{
    status: "idle" | "submitting" | "success" | "error";
    message: string;
  }>({ status: "idle", message: "" });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState({ status: "submitting", message: "" });

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      company: (form.elements.namedItem("company") as HTMLInputElement).value,
      queueCount: Number((form.elements.namedItem("queueCount") as HTMLInputElement).value),
      useCase: (form.elements.namedItem("useCase") as HTMLTextAreaElement).value,
      currentSolution: (form.elements.namedItem("currentSolution") as HTMLSelectElement).value,
      reason: (form.elements.namedItem("reason") as HTMLTextAreaElement).value,
      agreesToFeedback: (form.elements.namedItem("agreesToFeedback") as HTMLInputElement).checked,
    };

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.qcanary.dev";
      const res = await fetch(`${apiBase}/v1/feedback/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        const errorMsg = result?.error?.message || "Something went wrong. Please try again.";
        setFormState({ status: "error", message: errorMsg });
        return;
      }

      setFormState({ status: "success", message: result?.message || "Application received!" });
      form.reset();
    } catch {
      setFormState({ status: "error", message: "Network error. Please check your connection and try again." });
    }
  }

  return (
    <main id="main-content" className="min-h-screen bg-bg text-text-primary">
      <MarketingNav showCompare={false} showBlog={false} />

      {/* â”€â”€ Section A: Hero â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="relative overflow-hidden border-b border-border">

        <div className="mx-auto max-w-4xl px-6 py-20 text-center md:py-28">
          <Badge variant="outline" className="mb-6 border-amber-500/40 text-amber-400 animate-fade-in-up">
            Limited spots â€” 20 teams max
          </Badge>
          <h1 className="animate-fade-in-up-delay-1 text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
            Use QCanary Pro for free.{" "}
            <span className="text-highlight">Tell us what sucks.</span>
          </h1>
          <p className="animate-fade-in-up-delay-2 mx-auto mt-4 max-w-2xl text-base leading-relaxed text-text-muted md:text-lg">
            We&rsquo;re a small team building the queue monitoring tool we wish existed.
            We need honest feedback from real BullMQ users. In exchange, you get 3 months of
            Pro â€” no credit card, no strings, no sales calls.
          </p>
          <div className="animate-fade-in-up-delay-3 mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a href="#apply">
              <Button size="lg" className="gap-2">
                Get Free Pro Access
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
              </Button>
            </a>
            <a href="mailto:founder@qcanary.dev" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-accent transition-colors">
              Or just email us &rarr;
            </a>
          </div>
        </div>
      </section>

      {/* â”€â”€ Section B: What's Included â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="border-y border-border bg-gradient-to-b from-surface/20 to-bg">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
          <h2 className="mb-10 text-center text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">What you get</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {/* Card 1 */}
            <div className="card-hover group rounded-xl border border-border bg-surface/40 p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <Crown className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary">3 Months of Pro</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                Unlimited projects, unlimited queues, 90-day history, Slack + Email +
                Webhook alerts, unlimited team members. Everything.
              </p>
            </div>

            {/* Card 2 */}
            <div className="card-hover group rounded-xl border border-border bg-surface/40 p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary">Direct Access to the Founder</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                No support tickets. No chatbots. You&rsquo;ll have my email and Calendly.
                Found a bug? I&rsquo;ll fix it. Confused by something? I&rsquo;ll explain it.
              </p>
            </div>

            {/* Card 3 */}
            <div className="card-hover group rounded-xl border border-border bg-surface/40 p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Heart className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary">15 Minutes of Your Time</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                After 2 weeks of use, we&rsquo;ll ask for a 15-minute call or async feedback.
                Tell us what works, what doesn&rsquo;t, and what you&rsquo;d pay for. That&rsquo;s it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* â”€â”€ Section C: Who This Is For â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="border-y border-border bg-bg">
        <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
          <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">Who this is for</h2>

          <div className="mx-auto max-w-lg space-y-3">
            {[
              "You use BullMQ in production (or plan to soon)",
              "You care about not exposing Redis credentials",
              "You&rsquo;re willing to give honest, specific feedback",
              "You&rsquo;re okay with a tool that might have rough edges",
            ].map((text) => (
              <div key={text} className="flex items-start gap-3 rounded-lg border border-accent/20 bg-accent/5 px-4 py-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                <span className="text-sm text-text-primary" dangerouslySetInnerHTML={{ __html: text }} />
              </div>
            ))}
          </div>

          {/* Honesty block */}
          <div className="mx-auto mt-6 max-w-lg rounded-lg border border-border bg-surface/20 px-5 py-4 text-center">
            <p className="text-xs leading-relaxed text-text-muted">
              <strong>Not for:</strong> Teams who need 99.99% SLA guarantees, teams who can&rsquo;t tolerate
              occasional bugs, or teams who want a 50-person support team. We&rsquo;re small.
              We&rsquo;re fast. We&rsquo;re not enterprise-y.
            </p>
          </div>
        </div>
      </section>

      {/* â”€â”€ Section D: The Form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section id="apply" className="border-y border-border bg-gradient-to-b from-surface/20 to-bg">
        <div className="mx-auto max-w-2xl px-6 py-16 md:py-20">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">Apply for free Pro access</h2>
            <p className="mt-3 text-text-muted">
              20 spots. First come, first served. We&rsquo;ll review applications within 24 hours.
            </p>
          </div>

          {formState.status === "success" ? (
            <div className="rounded-xl border border-accent/20 bg-gradient-to-br from-accent/5 to-surface/20 p-8 text-center">
              <Crown className="mx-auto mb-4 h-10 w-10 text-accent" />
              <h3 className="text-lg font-semibold text-text-primary">Application received!</h3>
              <p className="mt-2 text-sm text-text-muted">
                Thanks for applying. Check your email within 24 hours â€” we&rsquo;ll send setup
                instructions if you&rsquo;re a good fit.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required placeholder="Your full name" />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required placeholder="you@company.com" />
              </div>

              {/* Company */}
              <div className="space-y-1.5">
                <Label htmlFor="company">Company / Project name</Label>
                <Input id="company" name="company" required placeholder="Acme Corp or side-project" />
              </div>

              {/* Queue count */}
              <div className="space-y-1.5">
                <Label htmlFor="queueCount">How many BullMQ queues do you run?</Label>
                <Input id="queueCount" name="queueCount" type="number" min="1" required placeholder="e.g. 5" />
              </div>

              {/* Use case */}
              <div className="space-y-1.5">
                <Label htmlFor="useCase">What do you use BullMQ for?</Label>
                <textarea
                  id="useCase"
                  name="useCase"
                  required
                  rows={3}
                  placeholder="Email processing, image generation, webhook delivery..."
                  className="flex w-full rounded-xl border border-border bg-code-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                />
              </div>

              {/* Current solution */}
              <div className="space-y-1.5">
                <Label htmlFor="currentSolution">Current monitoring solution</Label>
                <Select id="currentSolution" name="currentSolution" required placeholder="Select one...">
                  <option value="none">None</option>
                  <option value="bull-board">Bull Board</option>
                  <option value="custom-scripts">Custom scripts</option>
                  <option value="datadog">Datadog</option>
                  <option value="other">Other</option>
                </Select>
              </div>

              {/* Reason (optional) */}
              <div className="space-y-1.5">
                <Label htmlFor="reason">Why do you want to try QCanary? <span className="text-text-muted">(optional)</span></Label>
                <textarea
                  id="reason"
                  name="reason"
                  rows={3}
                  placeholder="Tell us what caught your attention..."
                  className="flex w-full rounded-xl border border-border bg-code-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                />
              </div>

              {/* Agreement checkbox */}
              <div className="flex items-start gap-3 rounded-lg border border-accent/20 bg-accent/5 px-4 py-3">
                <input
                  id="agreesToFeedback"
                  name="agreesToFeedback"
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 shrink-0 rounded border-border bg-code-bg text-accent focus:ring-accent/70"
                />
                <Label htmlFor="agreesToFeedback" className="text-sm text-text-primary">
                  Yes, I agree to share honest feedback after 2 weeks of use
                </Label>
              </div>

              {/* Error message */}
              {formState.status === "error" && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                  {formState.message}
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="w-full gap-2"
                disabled={formState.status === "submitting"}
              >
                {formState.status === "submitting" ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Apply for Free Pro Access"
                )}
              </Button>

              <p className="text-center text-xs text-text-muted">
                We review every application personally. If you&rsquo;re a good fit,
                you&rsquo;ll get an email with setup instructions within 24 hours.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* â”€â”€ Section E: Honesty Footer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="border-y border-border bg-bg">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center md:py-20">
          <Shield className="mx-auto mb-4 h-8 w-8 text-accent/60" />
          <p className="text-base leading-relaxed text-text-muted md:text-lg">
            This isn&rsquo;t a growth hack. We genuinely need your feedback to make this product
            worth paying for. If you hate it, tell us why. If you love it, tell us why.
            Either way, you keep the 3 months free.
          </p>
          <p className="mt-4 text-sm text-text-muted">
            &mdash; the founder, QCanary
          </p>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
