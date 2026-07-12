"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const terminalAnimations = [
  "animate-fade-in-up",
  "animate-fade-in-up-delay-1",
  "animate-fade-in-up-delay-2",
  "animate-fade-in-up-delay-3",
  "animate-fade-in-up-delay-4",
];

export function HeroSection() {
  const [mousePos, setMousePos] = React.useState({ x: 50, y: 50 });
  const heroRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <section ref={heroRef} className="relative overflow-hidden border-b border-border">
      {/* Mouse-following glow */}
      <div
        className="pointer-events-none absolute inset-0 transition-[background] duration-700 ease-out"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, rgba(34,197,94,0.08), transparent 50%)`,
        }}
      />
      {/* Static ambient glows */}
      <div aria-hidden="true" className="pointer-events-none absolute left-[-200px] top-[-300px] h-[700px] w-[900px] animate-pulse-glow rounded-full bg-[radial-gradient(circle,_rgba(34,197,94,0.12)_0%,_rgba(34,197,94,0.04)_40%,_rgba(10,10,10,0)_70%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute right-[-100px] top-[-100px] h-[400px] w-[400px] animate-pulse rounded-full bg-[radial-gradient(circle,_rgba(34,197,94,0.06)_0%,_rgba(10,10,10,0)_60%)]" style={{ animationDelay: '2s' }} />
      
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-12 px-6 pb-24 pt-24 md:flex-row md:items-start md:pt-28">
        {/* Left: Text content */}
        <div className="flex-1 md:pt-8">
          <div className="mb-6 flex items-center gap-2">
            <Badge variant="outline" className="border-accent/40 text-accent animate-fade-in-up">
              ✦ Zero-Trust BullMQ Monitoring
            </Badge>
            <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent animate-fade-in-up-delay-1">
              Free tier available
            </span>
          </div>
          <h1 className="animate-fade-in-up-delay-1 text-4xl font-semibold tracking-tight md:text-5xl lg:text-6xl">
            Monitor BullMQ{" "}
            <span className="text-gradient">Without&nbsp;Exposing&nbsp;Redis.</span>
          </h1>
          <p className="animate-fade-in-up-delay-2 mt-5 text-base leading-relaxed text-text-muted md:text-lg lg:text-xl">
            The lightweight agent runs inside your worker process streaming job metadata over HTTPS.
            <span className="mt-2 block">Your Redis stays private. No firewall changes. No credentials shared.</span>
          </p>
          <div className="animate-fade-in-up-delay-3 mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/sign-up">
              <Button size="lg" className="group relative gap-2 overflow-hidden">
                <span className="relative z-10">Start Monitoring Free</span>
                <svg className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="secondary" size="lg" className="group gap-2">
                <span>View Docs</span>
                <kbd className="hidden rounded-md border border-border bg-code-bg px-1.5 py-0.5 font-mono text-[10px] text-text-muted transition-colors group-hover:border-accent/30 sm:inline-flex">⌘K</kbd>
              </Button>
            </Link>
          </div>
          {/* Trust bar */}
          <div className="animate-fade-in-up-delay-4 mt-10 flex flex-wrap items-center gap-6 text-xs text-text-muted">
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              MIT-licensed open source
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>
              No Redis credentials needed
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Setup in 3 lines · 10 minutes
            </span>
          </div>
          {/* Social proof bar */}
          <div className="animate-fade-in-up-delay-5 mt-6 flex items-center gap-4 rounded-lg border border-border bg-surface/30 px-4 py-2.5">
            <div className="flex -space-x-2">
              {["R","E","M","J"].map((initial, i) => (
                <div key={i} className="h-6 w-6 rounded-full border border-border bg-gradient-to-br from-accent/30 to-blue-500/30 flex items-center justify-center text-[8px] font-medium text-text-primary">
                  {initial}
                </div>
              ))}
            </div>
            <span className="text-xs text-text-muted">
              Loved by engineering teams at <span className="font-medium text-text-primary">Laylo</span>,{" "}
              <span className="font-medium text-text-primary">TidyHQ</span>,{" "}
              <span className="font-medium text-text-primary">Sync Labs</span> + more
            </span>
          </div>
        </div>

        {/* Right: Terminal code block */}
        <div className="w-full max-w-xl flex-1 md:max-w-none">
          <div className="animate-scale-in overflow-hidden rounded-xl border border-border bg-[#0C0C0C] shadow-lg shadow-accent/5" translate="no">
            {/* Terminal header */}
            <div className="flex items-center gap-1.5 border-b border-border bg-[#111] px-4 py-2.5">
              <div className="h-3 w-3 rounded-full bg-red-500/70" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
              <div className="h-3 w-3 rounded-full bg-green-500/70" />
              <span className="ml-3 text-xs text-text-muted">bash — npm install @qcanary/agent</span>
            </div>
            {/* Terminal body */}
            <div className="space-y-1.5 bg-[#0C0C0C] px-5 py-4 font-mono text-sm leading-relaxed">
              {/* Line 1: npm install */}
              <div className={terminalAnimations[0]}>
                <span className="text-accent">$</span>
                <span className="ml-2 text-text-primary">npm install @qcanary/agent</span>
              </div>
              {/* Line 2: import */}
              <div className={terminalAnimations[1]}>
                <span className="text-zinc-500">import</span>
                <span className="ml-2 text-accent">{'{ QueueMonitor }'}</span>
                <span className="ml-2 text-zinc-500">from</span>
                <span className="ml-2 text-yellow-400">&quot;@qcanary/agent&quot;</span>
              </div>
              {/* Line 3: new QueueMonitor */}
              <div className={terminalAnimations[2]}>
                <span className="text-zinc-500">new</span>
                <span className="ml-2 text-accent">QueueMonitor</span>
                <span>{'('}</span>
                <span className="ml-4 text-blue-400">apiKey</span>
                <span className="text-text-muted">:</span>
                <span className="ml-2 text-yellow-400">&quot;qca_live_...&quot;</span>
                <span className="ml-1 text-text-muted">,</span>
              </div>
              {/* Line 4: queues */}
              <div className={terminalAnimations[3]}>
                <span className="ml-8 text-text-muted">queues:</span>
                <span className="ml-2 text-text-muted">[emailQueue]</span>
                <span className="ml-1 text-text-muted">,</span>
              </div>
              {/* Line 5: closing */}
              <div className={terminalAnimations[4]}>
                <span className="text-text-muted">{'});'}</span>
              </div>
              {/* Success line */}
              <div className="animate-fade-in-up-delay-5 pt-1 text-text-muted">
                <span className="text-green-400">✓</span>
                <span className="ml-2">Agent connected — streaming events to QCanary</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
