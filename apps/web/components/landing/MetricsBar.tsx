"use client";
import { useEffect, useRef, useState } from "react";
import { ScrollReveal } from "@/components/ScrollReveal";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !hasAnimated.current) {
        hasAnimated.current = true;
        const duration = 1500; const steps = 60; const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) { setCount(target); clearInterval(timer); }
          else { setCount(Math.floor(current)); }
        }, duration / steps);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export function MetricsBar() {
  return (
    <ScrollReveal>
      <section className="border-y border-border bg-bg">
        <div className="mx-auto w-full max-w-6xl px-6 py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: 10, suffix: "min", label: "Average setup time" },
              { value: 3, suffix: "lines", label: "Code to get started" },
              { value: 0, suffix: "", label: "Redis credentials needed" },
              { value: 24, suffix: "/7", label: "Queue monitoring" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-text-primary md:text-3xl">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="mt-1 text-xs text-text-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
