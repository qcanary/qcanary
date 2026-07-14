import Link from "next/link";
import type { Metadata } from "next";
import { Mail, MessageSquare, Github, Globe } from "lucide-react";
import { BrandMark } from "@/components/Brand";
import MarketingNav from "@/components/MarketingNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qcanary.dev";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the Qcanary team. Support, feedback, partnerships — we'd love to hear from you.",
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
  openGraph: {
    url: `${siteUrl}/contact`,
  },
};

const contactMethods = [
  {
    icon: MessageSquare,
    title: "GitHub Discussions",
    desc: "Ask questions, share feedback, or report bugs in our GitHub Discussions.",
    action: "Join the conversation",
    href: "https://github.com/qcanary/qcanary/discussions",
  },
  {
    icon: Mail,
    title: "Email",
    desc: "For private inquiries, partnerships, or security reports. We aim to respond within 24 hours.",
    action: "Send email",
    href: "mailto:hello@qcanary.dev",
  },
  {
    icon: Github,
    title: "GitHub Issues",
    desc: "Found a bug? Open an issue on our GitHub repository with reproduction steps.",
    action: "Open an issue",
    href: "https://github.com/qcanary/qcanary/issues",
  },
  {
    icon: Globe,
    title: "Documentation",
    desc: "Check our docs for setup guides, API references, and troubleshooting tips.",
    action: "View docs",
    href: "/docs",
  },
];

export default function ContactPage() {
  return (
    <main id="main-content" className="min-h-screen bg-bg text-text-primary">
      <MarketingNav />

      <section className="border-b border-border">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center md:py-28">
          <Badge variant="outline" className="mb-6 border-accent/40 text-accent animate-fade-in-up">Contact</Badge>
          <h1 className="animate-fade-in-up-delay-1 text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
            Get in touch
          </h1>
          <p className="animate-fade-in-up-delay-2 mx-auto mt-4 max-w-xl text-lg text-text-muted">
            Have a question, feedback, or want to partner with us? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <section className="border-y border-border bg-gradient-to-b from-surface/20 to-bg">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="grid gap-5 md:grid-cols-2">
            {contactMethods.map((method) => (
              <a
                key={method.title}
                href={method.href}
                target={method.href.startsWith("http") ? "_blank" : undefined}
                rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="card-hover group flex items-start gap-4 rounded-xl border border-border bg-surface/40 p-6 transition-all hover:border-accent/30"
              >
                <div className="icon-glow flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <method.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-text-primary group-hover:text-accent transition-colors">{method.title}</h3>
                  <p className="mt-1 text-sm text-text-muted">{method.desc}</p>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent">
                    {method.action}
                    <svg className="h-3 w-3 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-bg">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center md:py-20">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Prefer self-serve?</h2>
          <p className="mt-3 text-text-muted">Our docs cover setup, API reference, and common questions.</p>
          <div className="mt-6 flex justify-center gap-4">
            <Link href="/docs"><Button variant="secondary" size="lg">Browse Docs</Button></Link>
            <Link href="/sign-up"><Button size="lg">Start Free</Button></Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-surface/20">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-text-muted md:flex-row">
          <div className="flex items-center gap-3">
            <BrandMark size="sm" />
            <p>Qcanary - BullMQ monitoring for production teams.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="hover:text-text-primary">Home</Link>
            <span className="text-border">|</span>
            <Link href="/about" className="hover:text-text-primary">About</Link>
            <span className="text-border">|</span>
            <Link href="/docs" className="hover:text-text-primary">Docs</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
