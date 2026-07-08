"use client";

import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { BrandLockup } from "@/components/Brand";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("[ErrorBoundary]", error, errorInfo.componentStack);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div role="alert" className="flex min-h-[400px] flex-col items-center justify-center bg-bg px-6 text-text-primary">
          <div className="flex flex-col items-center gap-4 text-center">
            <BrandLockup size="md" />
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-accent">Something went wrong</h2>
              <p className="max-w-md text-sm text-text-muted">
                An unexpected error occurred. Please try again.
              </p>
              {this.state.error && (
                <details className="mt-2 text-left">
                  <summary className="cursor-pointer text-xs text-text-muted hover:text-text-primary">
                    Error details
                  </summary>
                  <pre className="mt-2 overflow-auto rounded-lg border border-border bg-code-bg p-3 text-xs text-red-400">
                    {this.state.error.message}
                    {this.state.error.stack && `\n\n${this.state.error.stack}`}
                  </pre>
                </details>
              )}
            </div>
            <button
              onClick={this.handleRetry}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black transition-all hover:bg-accent/90 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
