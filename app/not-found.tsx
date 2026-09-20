import type { Metadata } from "next";
import Link from "next/link";
import { Compass } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { StatusPage } from "@/components/status-page";
import { OpenDrop } from "@/components/open-drop";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

const PLACES = [
  { href: "/", label: "Make a drop" },
  { href: "/#how", label: "How it works" },
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact us" },
];

/**
 * The 404 for the site as a whole: a URL that matches no route at all.
 *
 * A drop that is missing or expired is a different situation with a different
 * explanation, and it has its own boundary at app/r/[id]/not-found.tsx.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <StatusPage
        code="404"
        Icon={Compass}
        title="This page does not exist"
        actions={
          <nav aria-label="Elsewhere on the site" className="flex flex-wrap justify-center gap-2">
            {PLACES.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="inline-flex h-9 items-center rounded-full border border-line bg-surface px-4 text-[13px] font-medium text-ink transition-colors hover:border-line-strong hover:bg-sunken"
              >
                {label}
              </Link>
            ))}
          </nav>
        }
        footnote={
          <div className="rounded-md border border-line bg-surface p-4 text-left">
            <h2 className="eyebrow mb-2.5">Looking for a drop?</h2>
            <OpenDrop />
          </div>
        }
      >
        <p>
          The address may be mistyped, or the page may have moved. Nothing is
          broken — you are just at a link that goes nowhere.
        </p>
      </StatusPage>

      <SiteFooter />
    </div>
  );
}
