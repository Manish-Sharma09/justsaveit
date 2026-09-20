import * as React from "react";
import { cn } from "@/lib/utils";

/** 6px square field on an elevated surface with a hairline border. */
export function Input({
  className,
  type,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full min-w-0 rounded-sm border border-line bg-surface px-3",
        // 16px on mobile keeps iOS Safari from zooming the viewport on focus.
        "text-base sm:text-sm text-ink",
        "placeholder:text-faint",
        "transition-[border-color,box-shadow] duration-150",
        "hover:border-line-strong",
        "focus-visible:border-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/18",
        "disabled:cursor-not-allowed disabled:bg-sunken disabled:text-mute",
        "aria-invalid:border-danger aria-invalid:ring-3 aria-invalid:ring-danger/15",
        "file:mr-3 file:rounded-xs file:border-0 file:bg-sunken file:px-2 file:py-1 file:text-sm file:font-medium file:text-ink",
        className
      )}
      {...props}
    />
  );
}
