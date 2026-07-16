'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useState, createContext, useContext, useCallback } from 'react';
import type { ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const icons = {
    success: <CheckCircle2 className="h-4 w-4 text-accent" />,
    error: <AlertCircle className="h-4 w-4 text-danger" />,
    info: <Info className="h-4 w-4 text-info" />,
  };

  const borderColors = {
    success: 'border-accent/30',
    error: 'border-danger/30',
    info: 'border-info/30',
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9990] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={`flex items-center gap-3 rounded-xl border ${borderColors[t.type]} bg-surface px-4 py-3 shadow-lg shadow-black/10 backdrop-blur-xl min-w-[280px] max-w-[400px]`}
            >
              {icons[t.type]}
              <span className="flex-1 text-sm text-text-primary">{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                className="shrink-0 text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
