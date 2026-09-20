"use client";

import * as React from "react";
import { AlertTriangle, Check, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Toasts.
 *
 * A ~120 line implementation instead of a dependency: the product only needs
 * transient confirmations, and this way the markup follows the design system
 * exactly and ships no extra JavaScript.
 *
 * Messages are announced politely to screen readers via a live region.
 */

type ToastTone = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
  action?: { label: string; onClick: () => void };
}

interface ToastContextValue {
  toast: (
    message: string,
    options?: { tone?: ToastTone; action?: Toast["action"]; duration?: number }
  ) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = React.useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside <ToastProvider>");
  return context;
}

const ICONS: Record<ToastTone, React.ComponentType<{ className?: string }>> = {
  success: Check,
  error: AlertTriangle,
  info: Info,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const nextId = React.useRef(0);
  const timers = React.useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = React.useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = React.useCallback<ToastContextValue["toast"]>(
    (message, options = {}) => {
      const id = nextId.current++;
      const tone = options.tone ?? "success";
      setToasts((current) => [
        // Three at a time keeps the stack from covering the page.
        ...current.slice(-2),
        { id, message, tone, action: options.action },
      ]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), options.duration ?? (tone === "error" ? 6000 : 3500))
      );
    },
    [dismiss]
  );

  React.useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const value = React.useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        // Bottom-centre on phones, bottom-right from `sm` up.
        className="pointer-events-none fixed inset-x-0 bottom-0 z-90 flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:items-end"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <div role="status" aria-live="polite" className="sr-only">
          {toasts.map((t) => (
            <span key={t.id}>{t.message}</span>
          ))}
        </div>

        {toasts.map((t) => {
          const Icon = ICONS[t.tone];
          return (
            <div
              key={t.id}
              className={cn(
                "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-md border bg-surface px-3.5 py-3 shadow-float animate-rise",
                t.tone === "error" ? "border-danger/30" : "border-line"
              )}
            >
              <Icon
                aria-hidden
                className={cn(
                  "mt-0.5 size-4 shrink-0",
                  t.tone === "success" && "text-accent",
                  t.tone === "error" && "text-danger",
                  t.tone === "info" && "text-mute"
                )}
              />
              <p className="flex-1 text-sm leading-snug text-ink">{t.message}</p>

              {t.action && (
                <button
                  type="button"
                  onClick={() => {
                    t.action!.onClick();
                    dismiss(t.id);
                  }}
                  className="shrink-0 rounded-xs text-sm font-medium text-accent hover:underline"
                >
                  {t.action.label}
                </button>
              )}

              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="-my-1 -mr-1 shrink-0 rounded-xs p-1 text-faint transition-colors hover:bg-sunken hover:text-ink"
              >
                <X aria-hidden className="size-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
