import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-xs border px-1.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] [&_svg]:size-3",
  {
    variants: {
      tone: {
        neutral: "border-line bg-sunken text-mute",
        ink: "border-transparent bg-ink text-on-ink",
        accent: "border-accent/25 bg-accent-soft text-accent-deep",
        warn: "border-warn/25 bg-warn-soft text-warn-deep",
        danger: "border-danger/25 bg-danger-soft text-danger-deep",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
);

export function Badge({
  className,
  tone,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
