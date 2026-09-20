import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A native <select> with the system's chrome. Native is deliberate: it gives
 * correct keyboard behaviour and the platform picker on mobile for free.
 */
export function Select({
  className,
  children,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        data-slot="select"
        className={cn(
          "h-10 w-full appearance-none rounded-sm border border-line bg-surface pl-3 pr-9",
          "text-base sm:text-sm text-ink",
          "transition-[border-color,box-shadow] duration-150",
          "hover:border-line-strong",
          "focus-visible:border-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/18",
          "disabled:cursor-not-allowed disabled:bg-sunken disabled:text-mute",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-mute"
      />
    </div>
  );
}
