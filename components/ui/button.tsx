import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Button.
 *
 * DESIGN.md calls for two shapes by context: full pills for the marketing
 * CTAs, and a tight 6px square for nav and in-app chrome. Both live here as
 * variants so the distinction stays deliberate rather than accidental.
 */
const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 select-none items-center justify-center gap-2",
    "whitespace-nowrap font-medium",
    "transition-[background-color,color,border-color,box-shadow,transform,opacity]",
    "duration-150 ease-out active:scale-[0.985]",
    "disabled:pointer-events-none disabled:opacity-45",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        /** Marketing CTA — ink pill. */
        primary:
          "group rounded-full bg-ink text-on-ink shadow-whisper hover:-translate-y-px hover:bg-ink/88 hover:shadow-float",
        /** Marketing secondary — outlined pill. */
        secondary:
          "rounded-full border border-line bg-surface text-ink hover:border-line-strong hover:bg-sunken",
        /** App chrome — 6px ink square. */
        solid: "rounded-sm bg-ink text-on-ink hover:bg-ink/88",
        /** App chrome — 6px outlined square. */
        ghost:
          "rounded-sm border border-line bg-surface text-ink hover:border-line-strong hover:bg-sunken",
        /** App chrome — borderless. */
        subtle: "rounded-sm text-body hover:bg-sunken hover:text-ink",
        /** Destructive. */
        danger:
          "rounded-sm border border-line bg-surface text-danger hover:border-danger/40 hover:bg-danger-soft",
        /** Inline text action. */
        link: "rounded-xs text-accent underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-7 px-2 text-xs [&_svg]:size-3.5",
        sm: "h-8 px-3 text-[13px] [&_svg]:size-4",
        md: "h-10 px-4 text-sm [&_svg]:size-4",
        lg: "h-12 px-6 text-base [&_svg]:size-[18px]",
      },
      block: { true: "w-full", false: "" },
      icon: { true: "aspect-square px-0", false: "" },
    },
    defaultVariants: { variant: "ghost", size: "md", block: false, icon: false },
  }
);

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  /** Shows a spinner and blocks interaction without changing the layout. */
  loading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  block,
  icon,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      data-slot="button"
      className={cn(buttonVariants({ variant, size, block, icon }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <span
          aria-hidden
          className="absolute inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
        />
      )}
      <span
        className={cn(
          "inline-flex items-center gap-2",
          loading && "invisible"
        )}
      >
        {children}
      </span>
    </button>
  );
}

export { buttonVariants };
