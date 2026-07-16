"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-0.5 text-xs font-medium transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-transparent bg-surface text-text-primary",
        outline: "border-border text-text-primary",
        success: "border-transparent bg-success/15 text-success",
        danger: "border-transparent bg-danger/15 text-danger",
        warning: "border-transparent bg-warning/15 text-warning",
        info: "border-transparent bg-info/15 text-info",
        muted: "border-border text-text-muted",
        gradient: "border-transparent bg-gradient-to-r from-accent/20 to-emerald-500/20 text-accent",
        // Solid variants
        "solid-success": "border-transparent bg-success text-white",
        "solid-danger": "border-transparent bg-danger text-white",
        "solid-warning": "border-transparent bg-warning text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /** Shows a pulsing dot indicator */
  dot?: boolean;
  /** Icon to show before the text */
  icon?: React.ReactNode;
  /** Makes the badge interactive (hover effects) */
  interactive?: boolean;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, dot, icon, interactive, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          badgeVariants({ variant }),
          interactive && "cursor-pointer hover:opacity-80 active:scale-95",
          className
        )}
        {...props}
      >
        {/* Pulse dot */}
        {dot && (
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
          </span>
        )}

        {/* Icon */}
        {icon && <span className="inline-flex shrink-0">{icon}</span>}

        {children}
      </div>
    );
  }
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
