"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const springEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: springEase,
    },
  },
};

const terminalLineVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      delay: 0.6 + i * 0.15,
      ease: springEase,
    },
  }),
};

export function HeroSection() {
  const heroRef = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  return (
    <motion.section
      ref={heroRef}
      style={{ opacity: heroOpacity, y: heroY }}
      className="relative overflow-hidden border-b border-border"
    >
      {/* Clean subtle accent tint */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-accent/[0.02]" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto flex w-full max-w-6xl flex-col items-center gap-12 px-6 pb-24 pt-24 md:flex-row md:items-start md:pt-28"
      >
        {/* Left: Text content */}
        <div className="flex-1 md:pt-8">
          <motion.div variants={itemVariants} className="mb-6 flex items-center gap-2">
            <Badge variant="outline" className="border-accent/40 text-accent">
              ✦ Zero-Trust BullMQ Monitoring
            </Badge>
            <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
              Free tier available
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-[clamp(1.75rem,5vw,3.75rem)] font-semibold tracking-tight md:text-5xl lg:text-6xl"
          >
            Monitor BullMQ{" "}
            <span className="text-highlight">Without&nbsp;Exposing&nbsp;Redis.</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-5 text-sm leading-relaxed text-text-muted md:text-base lg:text-xl"
          >
            The lightweight agent runs inside your worker process streaming job metadata over HTTPS.
            <span className="mt-2 block">Your Redis stays private. No firewall changes. Alert-ready in minutes.</span>
          </motion.p>

          <motion.div variants={itemVariants} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/sign-up">
              <Button size="lg" className="group relative gap-2 overflow-hidden hover:scale-[1.02] active:scale-[0.97]">
                <span className="relative z-10">Start Monitoring Free</span>
                <svg className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Button>
            </Link>
            <Link href="/docs">
              <Button variant="secondary" size="lg" className="group gap-2 hover:scale-[1.02] active:scale-[0.97]">
                <span>View Docs</span>
                <kbd className="hidden rounded-md border border-border bg-code-bg px-1.5 py-0.5 font-mono text-[10px] text-text-muted transition-colors group-hover:border-accent/30 sm:inline-flex">⌘K</kbd>
              </Button>
            </Link>
          </motion.div>

          {/* Trust bar */}
          <motion.div variants={itemVariants} className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-text-muted">
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              MIT-licensed open source
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              Slack & email alerts included
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Setup in 3 lines · 10 minutes
            </span>
          </motion.div>

          {/* Social proof bar */}
          <motion.div variants={itemVariants} className="mt-6 flex items-center gap-2 rounded-lg border border-border bg-surface/30 px-4 py-2.5">
            <span className="text-xs text-text-muted">
              Built for teams where security isn&rsquo;t optional.
            </span>
          </motion.div>
        </div>

        {/* Right: Terminal code block */}
        <motion.div
          variants={itemVariants}
          className="w-full max-w-xl flex-1 md:max-w-none"
        >
          <motion.div
            whileHover={{ scale: 1.01, transition: { duration: 0.3 } }}
            className="animate-scale-in overflow-hidden rounded-xl border border-border bg-[#0C0C0C] shadow-lg shadow-accent/5 overflow-x-auto"
            translate="no"
          >
            {/* Terminal header */}
            <div className="flex items-center gap-1.5 border-b border-border bg-[#111] px-4 py-2.5">
              <div className="h-3 w-3 rounded-full bg-red-500/70" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
              <div className="h-3 w-3 rounded-full bg-green-500/70" />
              <span className="ml-3 text-xs text-text-muted">bash — npm install @qcanary/agent</span>
            </div>

            {/* Terminal body */}
            <div className="space-y-1.5 bg-[#0C0C0C] px-5 py-4 font-mono text-sm leading-relaxed">
              {[
                { text: <><span className="text-accent">$</span><span className="ml-2 text-text-primary">npm install @qcanary/agent</span></> },
                { text: <><span className="text-zinc-500">import</span><span className="ml-2 text-accent">{'{ QueueMonitor }'}</span><span className="ml-2 text-zinc-500">from</span><span className="ml-2 text-yellow-400">&quot;@qcanary/agent&quot;</span></> },
                { text: <><span className="text-zinc-500">const</span><span className="ml-2 text-accent">monitor</span><span className="ml-1 text-zinc-500">=</span><span className="ml-2 text-zinc-500">new</span><span className="ml-2 text-accent">QueueMonitor</span><span>{'('}</span><span className="ml-4 text-blue-400">apiKey</span><span className="text-text-muted">:</span><span className="ml-2 text-yellow-400">&quot;qca_live_...&quot;</span></> },
                { text: <><span className="ml-20 text-text-muted">queues</span><span className="text-text-muted">:</span><span className="ml-2 text-text-muted">[emailQueue]</span></> },
                { text: <><span className="text-text-muted">{'});'}</span></> },
              ].map((line, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={terminalLineVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {line.text}
                </motion.div>
              ))}

              {/* Success line */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.5 }}
                className="pt-1 text-text-muted"
              >
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="text-green-400"
                >
                  ✓
                </motion.span>
                <span className="ml-2">Agent connected — streaming events to QCanary</span>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
