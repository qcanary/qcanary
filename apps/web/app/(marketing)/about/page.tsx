import Link from "next/link";
import type { Metadata } from "next";
import { Shield, Github, Package, Code2 } from "lucide-react";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About — Qcanary",
  description:
    "Qcanary helps engineering teams monitor BullMQ queues without sharing Redis credentials. Open-source agent, managed dashboard, zero-trust by design.",
};

const values = [
  {
    icon: Shield,
    title: "Zero-Trust by Default",
    desc: "We built Qcanary because every other monitoring tool asked for Redis credentials. Our agent never needs them — period.",
  },
  {
    icon: Package,
    title: "Open Source First",
    desc: "The @qcanary/agent package is MIT-licensed and available on GitHub and npm. Built in the open for the BullMQ community.",
  },
  {
    icon: Code2,
    title: "Developer Experience",
    desc: "3-line setup, no firewall changes, no VPC peering. We remove friction so you can focus on your workers, not your monitoring tooling.",
  },
];

export default function AboutPage() {
  return (
    <main id="main-content" className="min-h-screen bg-bg text-text-primary">
      <MarketingNav />

      <section className="border-b border-border">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center md:py-28">
          <Badge variant="outline" className="mb-6 border-accent/40 text-accent animate-fade-in-up">About</Badge>
          <h1 className="animate-fade-in-up-delay-1 text-4xl font-semibold tracking-tight md:text-5xl">
            Monitoring BullMQ queues,{" "}
            <span className="text-gradient">without the risk.</span>
          </h1>
          <p className="animate-fade-in-up-delay-2 mx-auto mt-4 max-w-2xl text-lg text-text-muted">
            Qcanary was built to solve a simple problem: every queue monitoring tool asked for Redis credentials.
            We believed there had to be a better way — so we built one.
          </p>
        </div>
      </section>

      <section className="border-y border-border bg-gradient-to-b from-surface/20 to-bg">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Our Principles</h2>
            <p className="mt-3 text-text-muted">
              Three ideas guided every decision in building Qcanary.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {values.map((v) => (
              <div key={v.title} className="card-hover group rounded-xl border border-border bg-surface/40 p-6">
                <div className="icon-glow mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <v.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-text-primary">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-bg">
        <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl text-center">The Problem We Saw</h2>
          <p className="mt-6 text-sm leading-relaxed text-text-muted">
            Every BullMQ monitoring tool on the market works the same way: give us your Redis URL, and we&apos;ll show you your queues.
            This means handing over full database access — including all job data, all queue state, and any other keys in your Redis instance.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-text-muted">
            For small projects, maybe that&apos;s acceptable. But for teams running production queues — especially those with SOC 2 or compliance requirements — sharing Redis credentials with a third party is a non-starter.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-text-muted">
            Qcanary solves this by using a lightweight agent that attaches to BullMQ&apos;s QueueEvents API inside your own worker process.
            It streams only metadata (job IDs, statuses, durations, error messages) over HTTPS — no Redis credentials, no firewall changes, no VPC peering.
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-border bg-gradient-to-b from-bg via-accent/[0.02] to-bg">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-6 py-20 text-center md:py-24">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Built for the BullMQ community</h2>
          <p className="mt-3 max-w-lg text-text-muted">Open source agent. Managed dashboard. No Redis credentials required.</p>
          <div className="mt-8 flex gap-4">
            <Link href="/sign-up"><Button size="lg">Start Free</Button></Link>
            <Link href="https://github.com/qcanary"><Button variant="secondary" size="lg" className="gap-2">
              <Github className="h-4 w-4" /> GitHub
            </Button></Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
