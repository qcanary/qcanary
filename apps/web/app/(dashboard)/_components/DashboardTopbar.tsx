"use client";

import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import * as React from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/components/PostHogProvider";

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
  return (
    <div className="border-b border-border bg-bg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
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
                "bg-surface border border-border !text-[#FAFAFA] hover:bg-surface/80",
              organizationPreviewTextContainer: "!text-[#FAFAFA]",
              organizationPreviewMainIdentifier: "!text-[#FAFAFA]",
              organizationPreviewSecondaryIdentifier: "!text-[#71717A]",
              organizationSwitcherPopoverCard: "bg-surface border border-border",
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
              userButtonTrigger: "hover:bg-surface/80",
              userButtonPopoverCard: "bg-surface border border-border",
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
  );
}

