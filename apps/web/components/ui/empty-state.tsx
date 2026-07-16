"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  /** Icon component to display */
  icon?: React.ReactNode;
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Optional action button label */
  actionLabel?: string;
  /** Optional action onClick */
  actionOnClick?: () => void;
  /** Additional className */
  className?: string;
  /** Compact variant for smaller spaces */
  compact?: boolean;
};

/**
 * EmptyState — displayed when there's no data to show.
 *
 * Variants:
 * - Default: centered card with icon, title, description, action
 * - Compact: smaller padding, smaller text, no border
 */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionOnClick,
  className,
  compact = false,
}: EmptyStateProps) {
  const content = (
    <div
      className={cn(
        "flex flex-col items-center text-center",
        compact ? "gap-2 py-8" : "gap-3 py-12",
        className
      )}
    >
      {/* Icon */}
      {icon && (
        <div className={cn(
          "flex items-center justify-center rounded-full",
          compact ? "h-10 w-10" : "h-14 w-14",
          "bg-accent/[0.06] text-accent"
        )}>
          {icon}
        </div>
      )}

      {/* Title */}
      <h3 className={cn(
        "font-semibold text-text-primary",
        compact ? "text-sm" : "text-base"
      )}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className={cn(
          "max-w-xs text-text-muted",
          compact ? "text-xs" : "text-sm"
        )}>
          {description}
        </p>
      )}

      {/* Action */}
      {actionLabel && (
        <div className={compact ? "mt-1" : "mt-2"}>
          <Button
            size="sm"
            variant="secondary"
            onClick={actionOnClick}
            type="button"
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );

  if (compact) return content;

  return (
    <div className="rounded-xl border border-border bg-surface/30">
      {content}
    </div>
  );
}
