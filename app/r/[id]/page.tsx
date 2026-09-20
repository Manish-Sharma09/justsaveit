import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { LockScreen } from "./lock-screen";
import { DropClient } from "./drop-client";
import { getDropAccess, getDropSummary, recordView, triggerBurn } from "@/lib/drops";
import { hasUnlockCookie } from "@/lib/guard";
import { normaliseDropId } from "@/lib/ids";
import { env } from "@/lib/env";
import { publicConfig } from "@/lib/config";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string }>;
};

/** Drops are private by definition — keep them out of search indexes. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = normaliseDropId((await params).id);
  return {
    title: id,
    robots: { index: false, follow: false },
  };
}

/** Builds the absolute share URL from the incoming request. */
async function shareUrl(id: string): Promise<string> {
  if (publicConfig.siteUrl) {
    return `${publicConfig.siteUrl.replace(/\/$/, "")}/r/${id}`;
  }
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const protocol =
    headerList.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}/r/${id}`;
}

export default async function DropPage({ params, searchParams }: Props) {
  const id = normaliseDropId((await params).id);
  const { new: isNew } = await searchParams;

  // Only the access facts are loaded first — never the content or the password
  // hash — so nothing protected is in scope while the drop is still locked.
  const access = await getDropAccess(id);
  if (!access) notFound();

  const url = await shareUrl(id);

  // ---------------------------------------------------------------- locked --
  if (!(await hasUnlockCookie(id, access.hasPassword))) {
    return (
      <div className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main id="main" className="flex flex-1 items-center justify-center px-4 py-12">
          <LockScreen dropId={id} />
        </main>
        <SiteFooter />
      </div>
    );
  }

  // ------------------------------------------------------------------ open --
  const justCreated = isNew === "1";

  // A burn-after-read drop starts its clock the first time somebody other than
  // the creator opens it. The creator arrives with ?new=1 straight after
  // creating, so their own visit does not consume it.
  let burnsAt: string | null = null;
  if (access.burnAfterRead && !justCreated) {
    burnsAt = access.burnTriggered
      ? (access.expiresAt?.toISOString() ?? null)
      : (await triggerBurn(id)).toISOString();
  }

  if (!justCreated) {
    // Best-effort: a failed counter must never break the page.
    await recordView(id).catch(() => {});
  }

  const summary = await getDropSummary(id);
  if (!summary) notFound();

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main id="main" className="flex-1">
        <DropClient
          initial={summary}
          url={url}
          justCreated={justCreated}
          burnsAt={burnsAt}
          limits={{
            maxFileBytes: env.maxFileBytes,
            maxDropBytes: env.maxDropBytes,
            maxFiles: env.maxFilesPerDrop,
          }}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
