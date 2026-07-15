"use client";

import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import * as React from "react";
import { usePathname } from "next/navigation";
import { Zap } from "lucide-react";
import { trackEvent } from "@/components/PostHogProvider";
import { useUpgradeModal } from "@/components/dashboard/UpgradeModalContext";
import { Button } from "@/components/ui/button";

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
    <div className="border-b border-border bg-bg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          {isFreeUser && (
            <Button size="sm" onClick={openUpgrade} className="gap-1.5">
              <Zap className="h-3.5 w-3.5" />
              Upgrade
            </Button>
          )}
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
        </div>
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
