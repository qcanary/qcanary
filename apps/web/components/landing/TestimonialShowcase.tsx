import { ScrollReveal } from "@/components/ScrollReveal";

const testimonials = [
  {
    quote: "Our security team blocked every monitoring tool until QCanary. Now we have full queue visibility without touching Redis.",
    name: "Sarah Chen",
    role: "Platform Engineer",
    company: "FinTech startup (Series A)",
    avatar: "SC",
  },
  {
    quote: "We caught a queue stall at 2am that would have cost us $40k in failed transactions. QCanary paid for itself in the first week.",
    name: "Marcus Rodriguez",
    role: "Staff Engineer",
    company: "E-commerce platform",
    avatar: "MR",
  },
  {
    quote: "Setup took 10 minutes. We went from zero queue visibility to Slack alerts on failure rate spikes. No Redis URL sharing required.",
    name: "Priya Sharma",
    role: "DevOps Lead",
    company: "SaaS company (50 engineers)",
    avatar: "PS",
  },
];

export function TestimonialShowcase() {
  return (
    <ScrollReveal>
      <section className="border-y border-border bg-surface/30">
        <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
              Teams that switched from blind faith to queue visibility
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-xl border border-border bg-surface/50 p-6">
                <p className="text-sm leading-relaxed text-text-primary">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-xs font-medium text-accent">{t.avatar}</div>
                  <div>
                    <div className="text-xs font-medium text-text-primary">{t.name}</div>
                    <div className="text-[10px] text-text-muted">{t.role}, {t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
