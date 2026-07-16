"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  /** Shows error styling */
  error?: boolean;
  /** Shows success styling */
  success?: boolean;
  /** Icon to render on the left side inside the input */
  leftIcon?: React.ReactNode;
  /** Icon to render on the right side inside the input */
  rightIcon?: React.ReactNode;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, success, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="relative">
        {leftIcon && (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            // Base
            "flex h-10 w-full rounded-xl border bg-code-bg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/60",
            "transition-all duration-200",
            // Focus
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
            // Disabled
            "disabled:cursor-not-allowed disabled:opacity-50",
            // Left icon padding
            leftIcon && "pl-10",
            // Right icon padding
            rightIcon && "pr-10",
            // Variants
            error
              ? "border-danger/50 focus-visible:ring-danger/50"
              : success
              ? "border-success/50 focus-visible:ring-success/50"
              : "border-border focus-visible:border-accent/50 focus-visible:ring-accent/70",
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
