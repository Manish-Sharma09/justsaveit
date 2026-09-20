import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Shared shell for the states that are not a page: 404, and the error
 * boundaries.
 *
 * They all want the same thing — one mark, one sentence saying what happened,
 * one saying what to do next, and a way out — so the shape lives here and the
 * individual screens supply only the words.
 */
export function StatusPage({
  code,
  Icon,
  tone = "neutral",
  title,
  children,
  actions,
  footnote,
}: {
  /** Shown as the eyebrow. The HTTP status where there is one. */
  code: string;
  Icon: React.ElementType;
  tone?: "neutral" | "danger";
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  /** Small print under the actions — an error reference, say. */
  footnote?: React.ReactNode;
}) {
  return (
    <main id="main" className="flex flex-1 items-center justify-center px-4 py-14 sm:py-20">
      <div className="w-full max-w-md text-center">
        <span
          className={cn(
            "mx-auto flex size-12 items-center justify-center rounded-full border bg-surface",
            tone === "danger" ? "border-danger/30 text-danger" : "border-line text-mute"
          )}
        >
          <Icon aria-hidden className="size-5" />
        </span>

        <p className="eyebrow mt-5" data-numeric>
          Error {code}
        </p>

        <h1 className="mt-2 text-title text-balance">{title}</h1>

        <div className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-pretty text-body">
          {children}
        </div>

        {actions && (
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2">{actions}</div>
        )}

        {footnote && <div className="mt-6">{footnote}</div>}
      </div>
    </main>
  );
}
