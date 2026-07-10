"use client";

import * as React from "react";
import Link from "next/link";
import { X } from "lucide-react";

type UsageResponse = {
  success: true;
  data: {
    plan: "free" | "starter" | "pro";
    usage: {
      projectsUsed: number;
      projectsLimit: number | null;
      eventsUsedToday: number;
      eventsLimit: number | null;
    };
  };
};

type ApiError = { success: false; error: { code: string; message: string } };

type NudgeReasons = {
  isNearLimit: boolean;
  isAtLimit: boolean;
  message: string;
};

function evaluateUsage(usage: UsageResponse["data"]["usage"]): NudgeReasons | null {
  const triggers: NudgeReasons[] = [];

  if (usage.projectsLimit !== null) {
    const projectPercent = (usage.projectsUsed / usage.projectsLimit) * 100;
    if (projectPercent >= 100) {
      triggers.push({
        isNearLimit: false,
        isAtLimit: true,
        message: `Project limit reached (${usage.projectsUsed}/${usage.projectsLimit}). Upgrade to create more projects.`,
      });
    } else if (projectPercent > 80) {
      triggers.push({
        isNearLimit: true,
        isAtLimit: false,
        message: `You've used ${usage.projectsUsed} of ${usage.projectsLimit} projects (${Math.round(projectPercent)}%).`,
      });
    }
  }

  if (usage.eventsLimit !== null) {
    const eventPercent = (usage.eventsUsedToday / usage.eventsLimit) * 100;
    if (eventPercent >= 100) {
      triggers.push({
        isNearLimit: false,
        isAtLimit: true,
        message: `Daily event limit reached (${usage.eventsUsedToday.toLocaleString()}/${usage.eventsLimit.toLocaleString()}). Events are being rejected until the limit resets.`,
      });
    } else if (eventPercent > 80) {
      triggers.push({
        isNearLimit: true,
        isAtLimit: false,
        message: `You've used ${Math.round(eventPercent)}% of your daily event budget (${usage.eventsUsedToday.toLocaleString()}/${usage.eventsLimit.toLocaleString()}).`,
      });
    }
  }

  if (triggers.length === 0) return null;

  // Prioritize limit-reached over near-limit
  const atLimit = triggers.find((t) => t.isAtLimit);
  if (atLimit) return atLimit;

  return triggers[0];
}

export function UsageNudge() {
  const [nudge, setNudge] = React.useState<NudgeReasons | null>(null);
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    async function fetchUsage() {
      try {
        const res = await fetch("/api/v1/usage", { cache: "no-store" });
        const json = (await res.json()) as UsageResponse | ApiError;
        if (!json.success) return;

        if (!cancelled) {
          setNudge(evaluateUsage(json.data.usage));
        }
      } catch {
        // Silent — nudge is non-critical
      }
    }

    void fetchUsage();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!nudge || dismissed) return null;

  return (
    <div
      className="mx-auto max-w-6xl px-6 pt-4"
      role="alert"
    >
      <div
        className={`flex items-center justify-between gap-4 rounded-md border px-4 py-3 text-sm ${
          nudge.isAtLimit
            ? "border-red-500/30 bg-red-500/10 text-red-200"
            : "border-yellow-500/30 bg-yellow-500/10 text-yellow-200"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className={nudge.isAtLimit ? "text-red-300" : "text-yellow-300"}>
            {nudge.isAtLimit ? "⚠ Limit reached" : "⚡ Near limit"}
          </span>
          <span className="opacity-90">{nudge.message}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/settings"
            className={`text-xs font-medium underline-offset-2 hover:underline ${
              nudge.isAtLimit ? "text-red-200" : "text-yellow-200"
            }`}
          >
            Upgrade plan
          </Link>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className={`rounded p-1 transition-colors hover:bg-black/20 ${
              nudge.isAtLimit ? "text-red-300" : "text-yellow-300"
            }`}
            aria-label="Dismiss usage warning"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
