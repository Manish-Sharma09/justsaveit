"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Toggle built on a real checkbox so it is focusable, form-associated and
 * announced correctly without any ARIA bookkeeping.
 */
export function Switch({
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "type">) {
  return (
    <span className="relative inline-flex shrink-0">
      <input
        type="checkbox"
        role="switch"
        className={cn("peer size-0 appearance-none opacity-0", className)}
        {...props}
      />
      <span
        aria-hidden
        className={cn(
          "pointer-events-none block h-5 w-9 rounded-full border border-line-strong bg-sunken",
          "transition-colors duration-200",
          "peer-checked:border-ink peer-checked:bg-ink",
          // The knob is a descendant of this sibling, so the peer variant has
          // to reach into it rather than target it directly.
          "peer-checked:[&>span]:translate-x-4 peer-checked:[&>span]:bg-on-ink",
          "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent",
          "peer-disabled:opacity-45"
        )}
      >
        <span
          className={cn(
            // The knob must read against the track in both themes: `surface` is
            // darker than `sunken` in dark mode, so it would vanish when off.
            "mt-[2px] ml-[2px] block size-3.5 rounded-full bg-mute shadow-whisper",
            "transition-[transform,background-color] duration-200 ease-[var(--ease-spring)]"
          )}
        />
      </span>
    </span>
  );
}
