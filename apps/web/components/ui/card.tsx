"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "group rounded-xl border border-border bg-surface text-text-primary shadow-card transition-all duration-200",
        "hover:border-accent/30 hover:shadow-card-hover hover:-translate-y-0.5",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardInteractive = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "group relative cursor-pointer rounded-xl border border-border bg-surface text-text-primary shadow-card transition-all duration-200",
        "hover:border-accent/30 hover:shadow-card-hover hover:-translate-y-1",
        "active:scale-[0.98]",
        className
      )}
      {...props}
    />
  )
);
CardInteractive.displayName = "CardInteractive";

const CardGradient = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "group relative rounded-xl border border-border text-text-primary shadow-card transition-all duration-200",
        "bg-gradient-to-br from-surface via-surface to-accent/[0.08]",
        "hover:border-accent/30 hover:shadow-card-hover hover:-translate-y-0.5",
        className
      )}
      {...props}
    />
  )
);
CardGradient.displayName = "CardGradient";

const CardGlow = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "group relative rounded-xl border border-border text-text-primary shadow-card transition-all duration-300",
        "hover:shadow-glow",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-xl before:opacity-0 before:transition-opacity before:duration-300 before:bg-gradient-to-br before:from-accent/5 before:via-transparent before:to-accent/5",
        "hover:before:opacity-100",
        className
      )}
      {...props}
    />
  )
);
CardGlow.displayName = "CardGlow";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-text-muted", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center border-t border-border/50 p-6 pt-4",
        className
      )}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardInteractive,
  CardGradient,
  CardGlow,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
