import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { StatusPage } from "@/components/status-page";
import { OpenDrop } from "@/components/open-drop";

/**
 * The 404 for a drop that is not there.
 *
 * This is the far more common one, and it deserves a different explanation
 * from a mistyped page URL: an expired drop is not a mistake, it is the
 * product working. Saying so plainly is what stops people assuming their
 * files leaked or the site lost them.
 */
export default function DropNotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <StatusPage
        code="404"
        Icon={SearchX}
        title="This drop is not here"
        actions={
          <Link
            href="/"
            className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-surface px-4 text-[13px] font-medium text-ink transition-colors hover:border-line-strong hover:bg-sunken"
          >
            <ArrowLeft aria-hidden className="size-4" />
            Make a new drop
          </Link>
        }
        footnote={
          <div className="rounded-md border border-line bg-surface p-4 text-left">
            <h2 className="eyebrow mb-2.5">Try another code</h2>
            <OpenDrop />
          </div>
        }
      >
        <p>
          The code may be mistyped, or the drop reached its expiry and deleted
          itself. Expired drops are removed for good, along with their files —
          there is no copy to restore.
        </p>
      </StatusPage>

      <SiteFooter />
    </div>
  );
}
