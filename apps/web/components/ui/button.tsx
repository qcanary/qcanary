"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-bg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-accent text-bg hover:bg-accent-hover active:scale-[0.97] shadow-sm",
        secondary:
          "bg-surface text-text-primary hover:bg-surface/80 border border-border active:scale-[0.97]",
        ghost:
          "hover:bg-surface/70 text-text-primary active:scale-[0.97]",
        destructive:
          "bg-danger text-white hover:bg-danger/90 active:scale-[0.97]",
        outline:
          "border border-border bg-transparent text-text-primary hover:bg-surface/50 hover:border-accent/30 active:scale-[0.97]",
        gradient:
          "bg-gradient-to-r from-accent to-emerald-400 text-bg hover:from-accent-hover hover:to-emerald-500 active:scale-[0.97] shadow-sm shadow-accent/20",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-xl px-3 text-xs",
        lg: "h-11 rounded-xl px-8 text-base",
        xl: "h-12 rounded-xl px-10 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Shows a loading spinner and disables the button */
  loading?: boolean;
  /** Icon component to render on the left side */
  leftIcon?: React.ReactNode;
  /** Icon component to render on the right side */
  rightIcon?: React.ReactNode;
}

/** Loading spinner — small animated circle */
function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-4 w-4 animate-spin", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      type,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type ?? "button"}
        className={cn(buttonVariants({ variant, size }), "group", className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Spinner />
            {children && <span>{children}</span>}
          </>
        ) : (
          <>
            {leftIcon && (
              <span className="inline-flex shrink-0 transition-transform duration-200 group-hover:scale-110">
                {leftIcon}
              </span>
            )}
            {children}
            {rightIcon && (
              <span className="inline-flex shrink-0 transition-transform duration-200 group-hover:translate-x-0.5">
                {rightIcon}
              </span>
            )}
          </>
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
