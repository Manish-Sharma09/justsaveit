import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

/**
 * The brand mark: cloud, document, padlock.
 *
 * Served from the 512px master and sized down by next/image, so it stays sharp
 * on high-DPI screens. Explicit dimensions keep it from shifting the header
 * while it loads, and the artwork carries its own colour, so it reads on both
 * the light and the dark canvas without a second asset.
 */
export function Logo({
  className,
  size = 28,
  priority = false,
}: {
  className?: string;
  size?: number;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo-mark-512.png"
      alt=""
      width={size}
      height={size}
      priority={priority}
      className={cn("shrink-0 select-none", className)}
    />
  );
}

/**
 * The site header.
 *
 * Two shapes for two jobs. The default is the flat hairline bar the app pages
 * want. `floating` lifts it into a rounded pill over the hero stage, which is
 * the only place on the site with something coloured behind the header — it
 * stays sticky either way, and the pill is frosted so it keeps working once
 * ordinary content has scrolled beneath it.
 */
export function SiteHeader({ floating = false }: { floating?: boolean } = {}) {
  const brand = (
    <Link
      href="/"
      className="group inline-flex items-center gap-2 rounded-sm"
      aria-label="Just Save It — home"
    >
      <Logo
        size={28}
        priority
        className="transition-transform duration-300 ease-[var(--ease-spring)] group-hover:scale-105"
      />
      <span className="text-[15px] font-semibold tracking-[-0.025em] text-ink">
        Just Save It
      </span>
    </Link>
  );

  if (!floating) {
    return (
      <header className="sticky top-0 z-50 border-b border-line bg-canvas/85 backdrop-blur-md">
        <div className="shell flex h-14 items-center justify-between gap-4">
          {brand}

          <div className="flex items-center gap-2">
            <Link
              href="/#how"
              className="hidden rounded-sm px-2.5 py-1.5 text-sm text-body transition-colors hover:bg-sunken hover:text-ink sm:inline-flex"
            >
              How it works
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>
    );
  }

  return (
    // The top padding clears the sky frame around the hero panel so the pill
    // sits inside the panel rather than straddling its edge. It is one half of
    // a pair: app/page.tsx offsets `main` by this header's full height
    // (padding + h-14) at each of the same three breakpoints. Change one and
    // the other has to move with it.
    <header className="sticky top-0 z-50 pt-6 sm:pt-9 lg:pt-12">
      <div className="shell">
        <div className="glass relative flex h-14 items-center justify-between gap-3 rounded-full py-2 pl-4 pr-2 sm:pl-5 sm:pr-2.5">
          {brand}

          {/* Centred only once there is room for it; below `lg` the pill keeps
              the brand and the actions and drops the navigation, which is a
              duplicate of what the page itself already shows. */}
          <nav
            aria-label="Sections"
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex"
          >
            {[
              { href: "/#how", label: "How it works" },
              { href: "/#plainly", label: "What it does" },
              { href: "/#open", label: "Open a drop" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="rounded-full px-3.5 py-2 text-sm text-body transition-colors hover:bg-sunken hover:text-ink"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a
              href="#composer"
              className="hidden h-9 items-center rounded-full bg-ink px-4 text-[13px] font-medium text-on-ink transition-colors hover:bg-ink/88 sm:inline-flex"
            >
              New drop
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

/** The standing pages. Linked from every page, so none of them is an orphan. */
const FOOTER_LINKS = [
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact us" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="shell flex flex-col gap-6 py-8 sm:gap-4">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <Logo size={22} />
            <p className="text-sm text-body">
              Just Save It — no account, no tracking, no fuss.
            </p>
          </div>

          <nav aria-label="Site information" className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {FOOTER_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="rounded-sm text-sm text-mute transition-colors hover:text-ink"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <p className="eyebrow">Brought to you by a Community Engineer</p>
      </div>
    </footer>
  );
}
