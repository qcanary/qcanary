"use client";

import { useState, useCallback, useMemo } from "react";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types & Constants                                                  */
/* ------------------------------------------------------------------ */

const QUEUE_TYPES = [
  {
    value: "email",
    label: "Email delivery (password resets, notifications)",
    multiplier: 50,
  },
  {
    value: "payment",
    label: "Payment processing (webhooks, invoices)",
    multiplier: 500,
  },
  {
    value: "data-pipeline",
    label: "Data pipelines (ETL, imports, exports)",
    multiplier: 200,
  },
  {
    value: "ugc",
    label: "User-generated content (images, videos, moderation)",
    multiplier: 100,
  },
  {
    value: "ecommerce",
    label: "E-commerce (order processing, inventory, shipping)",
    multiplier: 300,
  },
  {
    value: "other",
    label: "Other",
    multiplier: 150,
  },
] as const;

const CRITICALITY_LEVELS = [
  { value: "low", label: "Nice to have — we can recover manually", multiplier: 1 },
  { value: "medium", label: "Important — delays hurt user experience", multiplier: 2 },
  { value: "high", label: "Critical — downtime stops revenue", multiplier: 5 },
  { value: "critical", label: "Life or death — SLA breaches cost contracts", multiplier: 10 },
] as const;

const FREQUENCY_OPTIONS = [
  { value: "rarely", label: "Rarely — once a year", perYear: 1 },
  { value: "occasionally", label: "Occasionally — every few months", perYear: 3 },
  { value: "regularly", label: "Regularly — once a month", perYear: 12 },
  { value: "frequently", label: "Frequently — multiple times a month", perYear: 24 },
] as const;

const DETECTION_HOURS = 4; // avg time to detect without monitoring
const FIX_HOURS = 2; // avg time to fix

/* ------------------------------------------------------------------ */
/*  Calculation                                                        */
/* ------------------------------------------------------------------ */

function calculateIncidentCost(inputs: {
  queueMultiplier: number;
  criticalityMultiplier: number;
  frequencyPerYear: number;
  hourlyRate: number;
}) {
  const { queueMultiplier, criticalityMultiplier, frequencyPerYear, hourlyRate } = inputs;

  const incidentCost = queueMultiplier * criticalityMultiplier;
  const engineeringCost = (DETECTION_HOURS + FIX_HOURS) * hourlyRate;
  const totalPerIncident = incidentCost + engineeringCost;
  const annualCost = totalPerIncident * frequencyPerYear;

  const qcanaryMonthly = 39;
  const qcanaryAnnual = qcanaryMonthly * 12;
  const roi = annualCost > 0 ? ((annualCost - qcanaryAnnual) / qcanaryAnnual) * 100 : 0;

  return {
    perIncident: totalPerIncident,
    annual: annualCost,
    qcanaryAnnual,
    roi,
    breakdown: {
      impact: incidentCost,
      engineering: engineeringCost,
      detectionHours: DETECTION_HOURS,
      fixHours: FIX_HOURS,
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

function formatRoi(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return `${Math.round(n).toLocaleString()}`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function IncidentCostCalculator() {
  const [queueType, setQueueType] = useState("payment");
  const [jobsPerDay, setJobsPerDay] = useState(10000);
  const [criticality, setCriticality] = useState("high");
  const [frequency, setFrequency] = useState("regularly");
  const [hourlyRate, setHourlyRate] = useState(100);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const reset = useCallback(() => {
    setQueueType("payment");
    setJobsPerDay(10000);
    setCriticality("high");
    setFrequency("regularly");
    setHourlyRate(100);
    setShowBreakdown(false);
  }, []);

  const result = useMemo(() => {
    const qt = QUEUE_TYPES.find((q) => q.value === queueType)!;
    const cr = CRITICALITY_LEVELS.find((c) => c.value === criticality)!;
    const fr = FREQUENCY_OPTIONS.find((f) => f.value === frequency)!;
    return calculateIncidentCost({
      queueMultiplier: qt.multiplier,
      criticalityMultiplier: cr.multiplier,
      frequencyPerYear: fr.perYear,
      hourlyRate,
    });
  }, [queueType, criticality, frequency, hourlyRate]);

  const jobsLabel = jobsPerDay >= 1000 ? `${(jobsPerDay / 1000).toFixed(0)}K` : String(jobsPerDay);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-surface/20 via-surface/10 to-code-bg p-6 md:p-10">
      {/* subtle background glow */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-48 w-48 rounded-full bg-accent/[0.04] blur-3xl" />

      <div className="relative">
        {/* Section heading */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            What does a queue stall cost you?
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Most teams don&apos;t know until it happens. Let&apos;s find out before it does.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          {/* ──────── Left column — inputs ──────── */}
          <div className="space-y-6">
            {/* 1. Queue type */}
            <div>
              <Label htmlFor="queue-type">What does your queue handle?</Label>
              <Select
                id="queue-type"
                value={queueType}
                onChange={(e) => setQueueType(e.target.value)}
                className="mt-1.5"
              >
                {QUEUE_TYPES.map((qt) => (
                  <option key={qt.value} value={qt.value}>
                    {qt.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* 2. Jobs per day (range + number) */}
            <div>
              <div className="flex items-baseline justify-between">
                <Label htmlFor="jobs-range">How many jobs per day?</Label>
                <span className="text-sm font-semibold text-accent">{jobsLabel}</span>
              </div>
              <input
                id="jobs-range"
                type="range"
                min={100}
                max={1000000}
                step={100}
                value={jobsPerDay}
                onChange={(e) => setJobsPerDay(Number(e.target.value))}
                className="mt-2 block w-full cursor-pointer accent-accent
                  [&::-webkit-slider-runnable-track]:h-2
                  [&::-webkit-slider-runnable-track]:rounded-full
                  [&::-webkit-slider-runnable-track]:bg-border
                  [&::-webkit-slider-thumb]:mt-[-4px]
                  [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-accent
                  [&::-webkit-slider-thumb]:shadow-md
                  [&::-moz-range-track]:h-2
                  [&::-moz-range-track]:rounded-full
                  [&::-moz-range-track]:bg-border
                  [&::-moz-range-thumb]:h-4
                  [&::-moz-range-thumb]:w-4
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-accent
                  [&::-moz-range-thumb]:border-0"
              />
              <div className="mt-1 flex justify-between text-[10px] text-text-muted">
                <span>100</span>
                <span>1M</span>
              </div>
            </div>

            {/* 3. Criticality */}
            <div>
              <Label htmlFor="criticality">How critical is this queue to your business?</Label>
              <Select
                id="criticality"
                value={criticality}
                onChange={(e) => setCriticality(e.target.value)}
                className="mt-1.5"
              >
                {CRITICALITY_LEVELS.map((cl) => (
                  <option key={cl.value} value={cl.value}>
                    {cl.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* 4. Frequency */}
            <div>
              <Label htmlFor="frequency">How often do you currently have queue issues?</Label>
              <Select
                id="frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="mt-1.5"
              >
                {FREQUENCY_OPTIONS.map((fo) => (
                  <option key={fo.value} value={fo.value}>
                    {fo.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* 5. Hourly rate */}
            <div>
              <Label htmlFor="hourly-rate">What&apos;s your team&apos;s average hourly rate?</Label>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted">
                  $
                </span>
                <Input
                  id="hourly-rate"
                  type="number"
                  min={25}
                  max={500}
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Math.max(25, Math.min(500, Number(e.target.value))))}
                  className="pl-7"
                />
              </div>
              <p className="mt-1 text-[11px] text-text-muted/70">
                Engineer salary &divide; 2080 hours. Default: $100/hr (~$208K salary)
              </p>
            </div>

            <Button variant="ghost" size="sm" onClick={reset} className="text-text-muted text-xs">
              Reset all
            </Button>
          </div>

          {/* ──────── Right column — output ──────── */}
          <div className="flex flex-col justify-center space-y-6">
            {/* If your queue stalls… */}
            <div className="rounded-xl border border-border/60 bg-black/40 p-6 text-center md:p-8">
              <p className="mb-2 text-sm font-medium text-text-muted">If your queue stalls at 2 AM on a Saturday&hellip;</p>

              <div className="text-5xl font-bold text-accent md:text-6xl">
                {formatCurrency(result.perIncident)}
              </div>
              <p className="mt-1 text-sm text-text-muted">
                &hellip;this is what <strong className="text-text-primary">one incident</strong> costs you
              </p>

              {/* Collapsible breakdown */}
              <button
                type="button"
                onClick={() => setShowBreakdown((v) => !v)}
                className="mt-4 inline-flex items-center gap-1 text-xs text-text-muted/60 hover:text-text-muted transition-colors"
              >
                <svg
                  className={cn("h-3 w-3 transition-transform", showBreakdown && "rotate-90")}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {showBreakdown ? "Hide" : "Show"} breakdown
              </button>

              {showBreakdown && (
                <div className="mt-4 space-y-2 border-t border-border/50 pt-4 text-left text-sm transition-all">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Lost revenue / customer impact</span>
                    <span className="font-medium text-text-primary">{formatCurrency(result.breakdown.impact)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">
                      Engineering time ({result.breakdown.detectionHours}h detect + {result.breakdown.fixHours}h fix)
                    </span>
                    <span className="font-medium text-text-primary">{formatCurrency(result.breakdown.engineering)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border/30 pt-2 font-semibold">
                    <span className="text-text-primary">Total per incident</span>
                    <span className="text-accent">{formatCurrency(result.perIncident)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Separator */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border/40" />
              <span className="text-[10px] uppercase tracking-widest text-text-muted/40">vs</span>
              <div className="h-px flex-1 bg-border/40" />
            </div>

            {/* QCanary cost */}
            <div className="rounded-xl border border-border/60 bg-black/40 p-6 text-center md:p-8">
              <p className="mb-2 text-sm font-medium text-text-muted">
                QCanary costs
              </p>

              <div className="text-4xl font-bold text-text-primary md:text-5xl">
                $39
              </div>
              <p className="mt-1 text-sm text-text-muted">
                per month. That&apos;s <span className="text-text-primary font-medium">${result.qcanaryAnnual.toLocaleString()}</span> per year.
              </p>
            </div>

            {/* ROI */}
            <div className="rounded-xl border-2 border-accent/20 bg-accent/[0.03] p-6 text-center md:p-8">
              <p className="mb-1 text-sm font-medium text-text-muted">Your ROI</p>

              <div className="text-4xl font-bold text-accent md:text-5xl">
                {formatRoi(result.roi)}%
              </div>
              <p className="mt-1 text-sm text-text-muted">
                return on investment if QCanary prevents <strong className="text-text-primary">one incident</strong>
              </p>

              {result.annual > 0 && (
                <p className="mt-3 text-xs text-text-muted/60">
                  At your current frequency, queue issues could cost you{" "}
                  <span className="font-semibold text-text-primary">
                    {formatCurrency(result.annual)}
                  </span>{" "}
                  per year.
                </p>
              )}
            </div>

            <p className="text-center text-[10px] text-text-muted/40">
              Based on your inputs. Adjust the sliders above to see how the math changes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
