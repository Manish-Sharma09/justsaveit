import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex w-full rounded-sm border border-line bg-surface px-3 py-2.5",
        "text-base sm:text-sm leading-relaxed text-ink",
        "placeholder:text-faint",
        "transition-[border-color,box-shadow] duration-150",
        "hover:border-line-strong",
        "focus-visible:border-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/18",
        "disabled:cursor-not-allowed disabled:bg-sunken disabled:text-mute",
        "aria-invalid:border-danger aria-invalid:ring-3 aria-invalid:ring-danger/15",
        className
      )}
      {...props}
    />
  );
}
