import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Label + control + hint/error, wired together for assistive technology.
 * `Field` owns the ids so callers cannot forget `aria-describedby`.
 */
export function Field({
  label,
  hint,
  error,
  htmlFor,
  optional,
  className,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  error?: string | null;
  htmlFor: string;
  optional?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const hintId = `${htmlFor}-hint`;
  const errorId = `${htmlFor}-error`;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={htmlFor}
          className="text-[13px] font-medium tracking-[-0.01em] text-ink"
        >
          {label}
        </label>
        {optional && <span className="text-xs text-faint">Optional</span>}
      </div>

      {children}

      {error ? (
        <p id={errorId} role="alert" className="text-xs leading-snug text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs leading-snug text-mute">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Ids a control should reference, given the same inputs passed to `Field`. */
export function describedBy(htmlFor: string, hint?: unknown, error?: unknown) {
  if (error) return `${htmlFor}-error`;
  if (hint) return `${htmlFor}-hint`;
  return undefined;
}
