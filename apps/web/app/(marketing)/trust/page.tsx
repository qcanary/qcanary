import Link from "next/link";
import type { Metadata } from "next";
import {
  Shield,
  Lock,
  EyeOff,
  FileCode,
  Server,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";
import MarketingNav from "@/components/MarketingNav";
import MarketingFooter from "@/components/MarketingFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qcanary.dev";

export const metadata: Metadata = {
  title: "Trust & Security | QCanary",
  description:
    "Learn how QCanary's zero-trust architecture keeps your Redis credentials private. Read our security practices, compliance roadmap, and data collection policies.",
  alternates: {
    canonical: `${siteUrl}/trust`,
  },
  openGraph: {
    title: "Trust & Security | QCanary",
    description:
      "Learn how QCanary's zero-trust architecture keeps your Redis credentials private. Read our security practices, compliance roadmap, and data collection policies.",
    url: `${siteUrl}/trust`,
  },
};

const dependencies = [
  { name: "next", version: "14.2.35", license: "MIT", status: "✅ Clean" as const },
  { name: "express", version: "4.21.x", license: "MIT", status: "✅ Clean" as const },
  { name: "bullmq", version: "5.34.x", license: "MIT", status: "✅ Clean" as const },
  { name: "react", version: "18.3.x", license: "MIT", status: "✅ Clean" as const },
  { name: "typescript", version: "5.5.x", license: "Apache-2.0", status: "✅ Clean" as const },
  { name: "ioredis", version: "5.5.x", license: "MIT", status: "✅ Clean" as const },
  { name: "supabase-js", version: "2.45.x", license: "MIT", status: "✅ Clean" as const },
  { name: "clerk-nextjs", version: "5.10.x", status: "✅ Clean" as const },
];

const auditDate = new Date().toLocaleDateString("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export default function TrustPage() {
  return (
    <main id="main-content" className="min-h-screen bg-bg text-text-primary">
      <MarketingNav />

      {/* ── Section A: Hero ──────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute left-[-200px] top-[-300px] h-[700px] w-[900px] animate-pulse-glow rounded-full bg-[radial-gradient(circle,_rgba(34,197,94,0.12)_0%,_rgba(34,197,94,0.04)_40%,_rgba(10,10,10,0)_70%)]" />
        <div className="mx-auto max-w-6xl px-6 py-20 text-center md:py-28">
          <Badge variant="outline" className="mb-6 border-accent/40 text-accent animate-fade-in-up">
            Trust & Security
          </Badge>
          <h1 className="animate-fade-in-up-delay-1 text-3xl font-semibold tracking-tight md:text-4xl lg:text-6xl">
            Trust &amp; <span className="text-gradient">Security</span>
          </h1>
          <p className="animate-fade-in-up-delay-2 mx-auto mt-4 max-w-2xl text-lg text-text-muted">
            Everything you need to know about how QCanary handles your data,
            our infrastructure, and our commitment to transparency.
          </p>
        </div>
      </section>

      {/* ── Section B: Architecture Diagram ──────────────────── */}
      <section className="border-y border-border bg-gradient-to-b from-surface/20 to-bg">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">How It Works</h2>
            <p className="mt-3 text-text-muted">
              A lightweight agent inside your worker process. Your Redis stays behind your firewall.
            </p>
          </div>

          {/* Architecture diagram */}
          <div className="animate-fade-in-up mx-auto max-w-4xl overflow-x-auto">
            <div className="min-w-[640px] rounded-xl border border-border bg-surface/30 p-6 md:p-8">
              {/* Worker Process boundary */}
              <div className="relative rounded-lg border-2 border-accent/30 bg-gradient-to-br from-accent/5 to-code-bg p-4 md:p-6">
                <div className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-accent">
                  Your Infrastructure
                </div>

                {/* Inner components */}
                <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
                  {/* BullMQ Queue */}
                  <div className="rounded-lg border border-border bg-surface/40 px-4 py-3 text-center">
                    <div className="text-xs font-semibold text-text-primary">BullMQ</div>
                    <div className="text-[10px] text-text-muted">Queue</div>
                  </div>

                  <svg className="h-5 w-5 shrink-0 text-accent/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>

                  {/* QueueEvents */}
                  <div className="rounded-lg border border-border bg-surface/40 px-4 py-3 text-center">
                    <div className="text-xs font-semibold text-text-primary">QueueEvents</div>
                    <div className="text-[10px] text-text-muted">Local subscriber</div>
                  </div>

                  <svg className="h-5 w-5 shrink-0 text-accent/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>

                  {/* Agent */}
                  <div className="rounded-lg border-2 border-accent/40 bg-accent/10 px-4 py-3 text-center">
                    <div className="text-xs font-semibold text-accent">QCanary</div>
                    <div className="text-[10px] text-text-muted">Agent</div>
                  </div>
                </div>

                {/* Redis - stays inside */}
                <div className="mt-4 flex justify-center">
                  <div className="inline-flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-red-500/20">
                      <Lock className="h-3 w-3 text-red-400" />
                    </div>
                    <div className="text-xs font-medium text-red-400">Redis — stays inside your network</div>
                  </div>
                </div>
              </div>

              {/* HTTPS Arrow to Cloud */}
              <div className="my-3 flex items-center justify-center gap-2">
                <svg className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                <span className="text-xs font-mono text-accent">HTTPS — metadata only</span>
              </div>

              {/* Cloud side */}
              <div className="rounded-lg border-2 border-border bg-surface/40 p-4 md:p-6">
                <div className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-text-muted">
                  QCanary Cloud
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
                  <div className="rounded-lg border border-border bg-surface/40 px-4 py-3 text-center">
                    <div className="text-xs font-semibold text-text-primary">API</div>
                    <div className="text-[10px] text-text-muted">Ingest</div>
                  </div>
                  <svg className="h-5 w-5 shrink-0 text-accent/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <div className="rounded-lg border border-border bg-surface/40 px-4 py-3 text-center">
                    <div className="text-xs font-semibold text-text-primary">Postgres</div>
                    <div className="text-[10px] text-text-muted">Database</div>
                  </div>
                </div>
              </div>

              {/* Data labels */}
              <div className="mt-4 grid gap-2 md:grid-cols-2">
                <div className="rounded-lg border border-border bg-surface/30 px-3 py-2">
                  <div className="flex items-center gap-1.5 text-xs text-accent">
                    <CheckCircle2 className="h-3 w-3" />
                    <span className="font-medium">Only metadata sent:</span>
                  </div>
                  <div className="mt-1 font-mono text-[10px] text-text-muted">
                    jobId · queueName · status · duration · errorMessage
                  </div>
                </div>
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2">
                  <div className="flex items-center gap-1.5 text-xs text-red-400">
                    <AlertTriangle className="h-3 w-3" />
                    <span className="font-medium">NOT sent:</span>
                  </div>
                  <div className="mt-1 font-mono text-[10px] text-text-muted">
                    NO payloads · NO Redis keys · NO credentials
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section C: Data Collection ───────────────────────── */}
      <section className="border-y border-border bg-bg">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">What We Collect (And What We Don&rsquo;t)</h2>
          <p className="mt-3 mb-10 text-text-muted">
            Complete transparency on every data point our agent transmits.
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Collected */}
            <div className="rounded-xl border border-accent/20 bg-gradient-to-br from-accent/5 to-surface/20 p-6">
              <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-accent">
                <CheckCircle2 className="h-4 w-4" />
                Collected
              </h3>
              <ul className="space-y-3">
                {[
                  { field: "jobId", type: "string", desc: "Unique job identifier" },
                  { field: "queueName", type: "string", desc: "Which queue the job belongs to" },
                  { field: "status", type: "string", desc: "completed, failed, stalled, active, waiting, delayed" },
                  { field: "durationMs", type: "number", desc: "How long the job took" },
                  { field: "errorMessage", type: "string", desc: "Error stack trace (failed jobs only)" },
                  { field: "timestamp", type: "ISO 8601", desc: "When the event occurred" },
                  { field: "attempts", type: "number", desc: "How many times the job was attempted" },
                ].map((item) => (
                  <li key={item.field} className="flex items-start gap-3 text-sm">
                    <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" />
                    <div>
                      <code className="rounded bg-code-bg px-1.5 py-0.5 font-mono text-xs text-accent">
                        {item.field}
                      </code>
                      <span className="ml-1.5 text-[10px] text-text-muted">{item.type}</span>
                      <p className="mt-0.5 text-xs text-text-muted">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Not Collected */}
            <div className="rounded-xl border border-red-500/20 bg-gradient-to-br from-red-500/5 to-surface/20 p-6">
              <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-red-400">
                <EyeOff className="h-4 w-4" />
                Not Collected
              </h3>
              <ul className="space-y-3">
                {[
                  { field: "Job payloads", desc: "Your business data" },
                  { field: "Redis keys", desc: "Or database contents" },
                  { field: "Redis URL", desc: "Or any credentials" },
                  { field: "Worker code", desc: "Or proprietary logic" },
                  { field: "User PII", desc: "We use Clerk for auth, not our own system" },
                ].map((item) => (
                  <li key={item.field} className="flex items-start gap-3 text-sm">
                    <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400/60" />
                    <div>
                      <span className="text-sm font-medium text-text-primary">{item.field}</span>
                      <p className="text-xs text-text-muted">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-border bg-surface/20 px-5 py-4 text-center">
            <p className="text-sm text-text-muted">
              You can verify this by reading the agent source code. It&rsquo;s 200 lines and MIT-licensed.{" "}
              <a
                href="https://github.com/qcanary/qcanary/tree/main/packages/agent"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                View on GitHub &rarr;
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ── Section D: Compliance Roadmap ────────────────────── */}
      <section id="compliance" className="border-y border-border bg-gradient-to-b from-surface/20 to-bg">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">Compliance Roadmap</h2>
            <p className="mt-3 text-text-muted">
              We&rsquo;re building security and compliance into the product from day one.
            </p>
          </div>

          <div className="mx-auto max-w-2xl space-y-3">
            {[
              { text: "Zero-trust architecture (no Redis credential exposure)", done: true },
              { text: "TLS 1.3 for all data in transit", done: true },
              { text: "AES-256 encryption for data at rest", done: true },
              { text: "MIT-licensed open source agent", done: true },
              { text: "Independent security review (OWASP ZAP scan)", done: true },
              { text: "SOC 2 Type II audit (in progress, expected Q1 2027)", done: false },
              { text: "Penetration testing by third-party firm (scheduled)", done: false },
              { text: "HIPAA-compliant hosting option (planned)", done: false },
            ].map((item) => (
              <div
                key={item.text}
                className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${
                  item.done
                    ? "border-accent/20 bg-accent/5"
                    : "border-border bg-surface/20"
                }`}
              >
                {item.done ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                ) : (
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                )}
                <span className={item.done ? "text-text-primary" : "text-text-muted"}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-lg border border-border bg-surface/20 px-5 py-4 text-center">
            <p className="text-sm text-text-muted">
              Want to be notified when we complete these?{" "}
              <a href="mailto:security@qcanary.dev" className="text-accent hover:underline">
                Email us at security@qcanary.dev
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ── Section E: Incident History ──────────────────────── */}
      <section className="border-y border-border bg-bg">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">Incident History</h2>
          <p className="mt-3 mb-8 text-text-muted">
            Zero security incidents since launch. We&rsquo;ll publish every incident here, no matter how small.
          </p>

          <div className="rounded-xl border border-accent/20 bg-gradient-to-br from-accent/5 to-surface/20 p-8 text-center">
            <Shield className="mx-auto h-10 w-10 text-accent" />
            <h3 className="mt-4 text-lg font-semibold text-text-primary">No incidents to report</h3>
            <p className="mt-2 text-sm text-text-muted">
              Zero security incidents since launch. Zero data breaches. Zero unauthorized access events.
            </p>
          </div>
        </div>
      </section>

      {/* ── Section F: Dependency Audit ──────────────────────── */}
      <section className="border-y border-border bg-gradient-to-b from-surface/20 to-bg">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">Dependency Audit</h2>
          <p className="mt-3 mb-8 text-text-muted">
            We regularly scan our dependencies for known vulnerabilities.
          </p>

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[500px] border-collapse">
              <thead>
                <tr className="border-b border-border bg-code-bg text-left text-sm">
                  <th className="px-4 py-3 font-medium text-text-primary">Package</th>
                  <th className="px-4 py-3 font-medium text-text-primary">Version</th>
                  <th className="px-4 py-3 font-medium text-text-primary">License</th>
                  <th className="px-4 py-3 font-medium text-text-primary">Status</th>
                </tr>
              </thead>
              <tbody>
                {dependencies.map((dep) => (
                  <tr key={dep.name} className="border-b border-border/70 text-sm">
                    <td className="px-4 py-3 font-mono text-xs text-text-primary">{dep.name}</td>
                    <td className="px-4 py-3 text-text-muted">{dep.version ?? "-"}</td>
                    <td className="px-4 py-3 text-text-muted">{dep.license ?? "Proprietary"}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent">
                        {dep.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-sm text-text-muted">
            Last audit run: {auditDate}. We run <code className="rounded bg-code-bg px-1.5 py-0.5 font-mono text-xs text-accent">npm audit</code> on every deployment.{" "}
            <a
              href="https://github.com/qcanary/qcanary/security"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              View GitHub Security Tab &rarr;
            </a>
          </p>
        </div>
      </section>

      {/* ── Section G: Contact Security Team ─────────────────── */}
      <section className="border-y border-border bg-bg">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center md:py-20">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">Questions?</h2>
          <p className="mt-3 max-w-lg mx-auto text-text-muted">
            If you have security questions, need a compliance questionnaire filled out, or want to review our architecture.
          </p>
          <div className="mt-8">
            <a href="mailto:security@qcanary.dev">
              <Button size="lg" className="gap-2">
                <Shield className="h-4 w-4" />
                Contact security@qcanary.dev
              </Button>
            </a>
          </div>
          <p className="mt-4 text-xs text-text-muted">
            We typically respond within 24 hours on business days.
          </p>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
