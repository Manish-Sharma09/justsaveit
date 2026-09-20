"use client";

import * as React from "react";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteFooter, SiteHeader } from "@/components/site-header";
import { StatusPage } from "@/components/status-page";

/**
 * The server-error boundary: anything that throws while rendering a route.
 *
 * The App Router has no `500.tsx` — this file is the 500 page, and it renders
 * inside the root layout, which is why it can carry the site chrome. When the
 * root layout is itself what failed, app/global-error.tsx takes over instead.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <StatusPage
        code="500"
        Icon={AlertTriangle}
        tone="danger"
        title="Something went wrong"
        actions={
          <>
            <Button variant="solid" onClick={reset}>
              <RefreshCcw aria-hidden />
              Try again
            </Button>
            <Button variant="ghost" onClick={() => (window.location.href = "/")}>
              <Home aria-hidden />
              Start over
            </Button>
          </>
        }
        footnote={
          // The digest is the only thread back to the server log for this
          // exact failure, so it is worth showing even though it means
          // nothing to the person reading it.
          error.digest ? (
            <p className="font-mono text-[11px] text-faint" data-numeric>
              Reference {error.digest}
            </p>
          ) : null
        }
      >
        <p>
          This one is on us, not on you. Any drop you had already created is
          safe — it is this page that failed to load, not your content.
        </p>
      </StatusPage>

      <SiteFooter />
    </div>
  );
}
