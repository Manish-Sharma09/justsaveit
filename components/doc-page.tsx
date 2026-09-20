import * as React from "react";
import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/utils";

/**
 * Shell for the standing pages — About, Contact, Privacy, Terms.
 *
 * These are read, not scanned, so they get a single reading measure rather
 * than the marketing grid, and the page's own type scale rather than a prose
 * plugin: one place to change how every policy page sets.
 */
export function DocPage({
  title,
  lead,
  updated,
  children,
}: {
  title: string;
  lead?: React.ReactNode;
  /** Rendered as "Last updated" — policy pages only. */
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <main id="main" className="flex-1">
      <header className="border-b border-line bg-surface">
        <div className="shell py-12 sm:py-16">
          <div className="mx-auto max-w-2xl">
            <Reveal>
              <h1 className="text-title text-balance sm:text-display">{title}</h1>
              {lead && (
                <p className="mt-4 text-[17px] leading-relaxed text-pretty text-body">{lead}</p>
              )}
              {updated && (
                <p className="mt-5 font-mono text-xs text-mute" data-numeric>
                  Last updated — {updated}
                </p>
              )}
            </Reveal>
          </div>
        </div>
      </header>

      <div className="shell py-12 sm:py-14">
        <div className="mx-auto max-w-2xl space-y-10 text-[15px] leading-relaxed text-body">
          {children}
        </div>
      </div>
    </main>
  );
}

/** A numbered or plain section with its own heading. */
export function DocSection({
  title,
  number,
  children,
}: {
  title: string;
  /** Terms clauses are referred to by number, so they carry one. */
  number?: number;
  children: React.ReactNode;
}) {
  return (
    <Reveal
      as="section"
      className="scroll-mt-24 space-y-3"
    >
      <h2 className="text-heading text-ink">
        {number !== undefined && (
          <span className="mr-2 font-mono text-mute" data-numeric>
            {number}.
          </span>
        )}
        {title}
      </h2>
      {children}
    </Reveal>
  );
}

/** Bulleted list set with the em-dash marker used elsewhere on the site. */
export function DocList({ items, className }: { items: React.ReactNode[]; className?: string }) {
  return (
    <ul className={cn("space-y-1.5", className)}>
      {items.map((item, index) => (
        <li
          key={index}
          className="relative pl-4 before:absolute before:left-0 before:text-mute before:content-['—']"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Pulled-out statement for the things a reader must not miss. */
export function DocCallout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-line bg-surface p-4 sm:p-5">
      <p className="text-[13px] font-medium text-ink">{title}</p>
      <div className="mt-2 text-[14px] leading-relaxed">{children}</div>
    </div>
  );
}
