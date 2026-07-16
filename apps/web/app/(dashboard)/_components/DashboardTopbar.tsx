"use client";

import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, ChevronRight, Search } from "lucide-react";
import { motion } from "framer-motion";
import { trackEvent } from "@/components/PostHogProvider";
import { useUpgradeModal } from "@/components/dashboard/UpgradeModalContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

// Map of path segments to human-readable labels
const breadcrumbLabels: Record<string, string> = {
  alerts: "Alerts",
  queues: "Queues",
  settings: "Settings",
  onboarding: "Onboarding",
  "enterprise-leads": "Enterprise Leads",
  testimonials: "Testimonials",
};

function formatSegment(segment: string): string {
  if (breadcrumbLabels[segment]) return breadcrumbLabels[segment];
  // Check if it looks like a UUID (project IDs)
  if (/^[a-f0-9]{8}-[a-f0-9]{4}/i.test(segment) || segment.length > 20) {
    return segment.slice(0, 8) + "…";
  }
  // Title-case the segment
  return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
}

function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
      {segments.map((segment, i) => {
        const href = "/" + segments.slice(0, i + 1).join("/");
        const label = formatSegment(segment);
        const isLast = i === segments.length - 1;

        return (
          <React.Fragment key={href}>
            {i > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-text-muted/50" aria-hidden="true" />
            )}
            {isLast ? (
              <span className="font-medium text-text-primary truncate max-w-[200px]">
                {label}
              </span>
            ) : (
              <Link
                href={href}
                className="text-text-muted hover:text-text-primary transition-colors truncate max-w-[200px]"
              >
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export function DashboardTopbar() {
  const pathname = usePathname();
  const trackedRef = React.useRef<string | null>(null);
  // Track page views for funnel analysis
  React.useEffect(() => {
    if (trackedRef.current !== pathname) {
      trackedRef.current = pathname;
      trackEvent("page_viewed", { path: pathname });
    }
  }, [pathname]);

  const { open: openUpgrade } = useUpgradeModal();
  // TODO: Replace with actual plan check from TeamProjectProvider
  const isFreeUser = true;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        {/* Left: breadcrumbs + upgrade */}
        <div className="flex items-center gap-3 min-w-0">
          {isFreeUser && (
            <Button size="sm" onClick={openUpgrade} className="gap-1.5 shrink-0">
              <Zap className="h-3.5 w-3.5" />
              Upgrade
            </Button>
          )}
          <Breadcrumbs />
        </div>

        {/* Right: search, theme toggle, org switcher, user */}
        <div className="flex items-center gap-2">
          {/* Search button — placeholder for future cmd+k palette */}
          <div className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-text-muted cursor-default"
            title="Search (Ctrl+K)"
          >
            <Search className="h-4 w-4" />
          </div>

          {/* Cmd+K hint */}
          <kbd className="hidden lg:inline-flex items-center gap-1 rounded-lg border border-border bg-code-bg px-2 py-1 font-mono text-[10px] text-text-muted">
            <span className="text-xs">⌘</span>K
          </kbd>

          {/* Theme toggle */}
          <ThemeToggle />

          <OrganizationSwitcher
            afterCreateOrganizationUrl="/onboarding"
            afterSelectOrganizationUrl="/onboarding"
            appearance={{
              variables: {
                colorPrimary: "#22C55E",
                colorBackground: "#111111",
                colorText: "#FAFAFA",
                colorTextSecondary: "#71717A",
                colorInputBackground: "#0F0F0F",
                colorInputText: "#FAFAFA",
                borderRadius: "0.5rem",
              },
              elements: {
                rootBox: "text-text-primary",
                organizationSwitcherTrigger:
                  "bg-surface border border-border !text-[#FAFAFA] hover:bg-surface/80 rounded-xl",
                organizationPreviewTextContainer: "!text-[#FAFAFA]",
                organizationPreviewMainIdentifier: "!text-[#FAFAFA]",
                organizationPreviewSecondaryIdentifier: "!text-[#71717A]",
                organizationSwitcherPopoverCard: "bg-surface border border-border rounded-xl",
                organizationSwitcherPopoverActions: "bg-surface",
                organizationSwitcherPopoverActionButton:
                  "!text-[#FAFAFA] hover:bg-surface/80",
                organizationSwitcherPopoverActionButtonText: "!text-[#FAFAFA]",
                organizationSwitcherPopoverActionButtonIcon: "!text-[#71717A]",
                organizationSwitcherPopoverFooter: "bg-surface border-t border-border",
              },
            }}
          />

          <UserButton
            appearance={{
              variables: {
                colorPrimary: "#22C55E",
                colorBackground: "#111111",
                colorText: "#FAFAFA",
                colorTextSecondary: "#71717A",
              },
              elements: {
                userButtonTrigger: "hover:opacity-80 transition-opacity",
                userButtonPopoverCard: "bg-surface border border-border rounded-xl",
                userButtonPopoverMain: "bg-surface",
                userPreviewMainIdentifier: "text-text-primary",
                userPreviewSecondaryIdentifier: "text-text-muted",
                userButtonPopoverActionButton: "text-text-primary hover:bg-surface/80",
                userButtonPopoverActionButtonText: "text-text-primary",
              },
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
