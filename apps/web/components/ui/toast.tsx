"use client";

import * as React from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────

type ToastType = "success" | "error" | "info" | "warning";

type Toast = {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // ms, 0 = persistent
};

type ToastAction =
  | { type: "ADD_TOAST"; toast: Toast }
  | { type: "DISMISS_TOAST"; id: string }
  | { type: "CLEAR_ALL" };

type ToastState = {
  toasts: Toast[];
};

// ── Icons ────────────────────────────────────────────

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-success" />,
  error: <AlertCircle className="h-5 w-5 text-danger" />,
  info: <Info className="h-5 w-5 text-info" />,
  warning: <AlertTriangle className="h-5 w-5 text-warning" />,
};

const borderColors: Record<ToastType, string> = {
  success: "border-l-[var(--color-success)]",
  error: "border-l-[var(--color-danger)]",
  info: "border-l-[var(--color-info)]",
  warning: "border-l-[var(--color-warning)]",
};

// ── Reducer ──────────────────────────────────────────

function toastReducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case "ADD_TOAST":
      return { ...state, toasts: [...state.toasts, action.toast] };
    case "DISMISS_TOAST":
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };
    case "CLEAR_ALL":
      return { ...state, toasts: [] };
    default:
      return state;
  }
}

// ── Context ──────────────────────────────────────────

type ToastContextType = {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
  dismissToast: (id: string) => void;
  success: (title: string, message?: string) => string;
  error: (title: string, message?: string) => string;
  info: (title: string, message?: string) => string;
  warning: (title: string, message?: string) => string;
};

const ToastContext = React.createContext<ToastContextType | null>(null);

let toastCounter = 0;
function generateId() {
  toastCounter++;
  return `toast-${Date.now()}-${toastCounter}`;
}

// ── Provider ─────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(toastReducer, { toasts: [] });

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = generateId();
    dispatch({ type: "ADD_TOAST", toast: { ...toast, id } });

    // Auto-dismiss (skip if duration is 0)
    if (toast.duration !== 0) {
      const ms = toast.duration ?? 4000;
      setTimeout(() => dispatch({ type: "DISMISS_TOAST", id }), ms);
    }

    return id;
  }, []);

  const dismissToast = React.useCallback((id: string) => {
    dispatch({ type: "DISMISS_TOAST", id });
  }, []);

  const contextValue = React.useMemo(
    () => ({
      toasts: state.toasts,
      addToast,
      dismissToast,
      success: (title: string, message?: string) =>
        addToast({ type: "success", title, message }),
      error: (title: string, message?: string) =>
        addToast({ type: "error", title, message }),
      info: (title: string, message?: string) =>
        addToast({ type: "info", title, message }),
      warning: (title: string, message?: string) =>
        addToast({ type: "warning", title, message }),
    }),
    [state.toasts, addToast, dismissToast]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={state.toasts} dismissToast={dismissToast} />
    </ToastContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

// ── Animation Variants ───────────────────────────────

const toastVariants: Variants = {
  initial: { opacity: 0, x: 24, scale: 0.95 },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: "spring", damping: 20, stiffness: 300 },
  },
  exit: {
    opacity: 0,
    x: 24,
    scale: 0.95,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

// ── Container ────────────────────────────────────────

function ToastContainer({
  toasts,
  dismissToast,
}: {
  toasts: Toast[];
  dismissToast: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={cn(
              "pointer-events-auto rounded-xl border border-border bg-surface p-4 shadow-lg shadow-black/10",
              "border-l-4",
              borderColors[toast.type]
            )}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <span className="mt-0.5 shrink-0">{icons[toast.type]}</span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">{toast.title}</p>
                {toast.message && (
                  <p className="mt-0.5 text-xs text-text-muted">{toast.message}</p>
                )}
              </div>

              {/* Close */}
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="shrink-0 rounded-lg p-1 text-text-muted hover:text-text-primary hover:bg-surface/80 transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Progress bar for auto-dismiss toasts */}
            {toast.duration !== 0 && (
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: (toast.duration ?? 4000) / 1000, ease: "linear" }}
                className="mt-2 h-0.5 rounded-full bg-accent/30"
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
