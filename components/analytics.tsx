"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { publicConfig } from "@/lib/config";

/**
 * Google Analytics 4.
 *
 * Renders nothing unless NEXT_PUBLIC_GA_ID is set AND this is a production
 * build, so `npm run dev` never reports localhost sessions into the property.
 * The measurement id is not a secret — it ships in the page source either way
 * — but keeping it in an env var means analytics can be switched off for an
 * environment without a code change.
 *
 * ---------------------------------------------------------------------------
 * REDACTION — the reason this is not just the copy-paste snippet.
 *
 * A drop lives at /r/<id> and that URL *is* its credential: anyone holding it
 * can open the drop. GA4 reports the address three separate ways — `dp` (path),
 * `dl` (full location) and `dt` (title, which here contains the id) — and
 * setting `page_path` alone redacts only the first. Verified against live
 * collect requests: with page_path set and nothing else, `dl` still carried
 * https://justsaveit.online/r/<real id>. All three are overridden below, and
 * the referrer too, so a drop link cannot reach Google through any of them.
 *
 * If you change this, re-check it against a real request rather than reasoning
 * about it — the parameters are not obvious from the config keys.
 * ---------------------------------------------------------------------------
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const DROP_PREFIX = "/r/";
const REDACTED_PATH = "/r/(redacted)";
const REDACTED_TITLE = "Drop · Just Save It";

const isDropPath = (path: string) => path.startsWith(DROP_PREFIX);

export function GoogleAnalytics() {
  const id = publicConfig.gaMeasurementId;
  const pathname = usePathname();

  // The inline script below already reports the first page view, so the effect
  // must not report it a second time. It exists for client-side navigations,
  // which Next performs without a document load — notably create-a-drop, which
  // routes straight to /r/<id> and is the commonest way a drop page is seen.
  const firstRun = useRef(true);

  useEffect(() => {
    if (!id) return;
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (typeof window.gtag !== "function") return;

    const drop = isDropPath(pathname);
    window.gtag("event", "page_view", {
      page_path: drop ? REDACTED_PATH : pathname + window.location.search,
      page_location: drop
        ? window.location.origin + REDACTED_PATH
        : window.location.href,
      page_title: drop ? REDACTED_TITLE : document.title,
    });
  }, [pathname, id]);

  if (!id || process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      {/*
        `afterInteractive` rather than `beforeInteractive`: Google's snippet
        says "immediately after <head>", but that is advice for plain HTML.
        Loading a third-party script before hydration delays the point at which
        the page becomes usable, and gtag queues into dataLayer regardless of
        when the library lands, so deferring costs nothing.
      */}
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          (function () {
            var drop = location.pathname.indexOf('${DROP_PREFIX}') === 0;
            var cfg = {
              page_path: drop ? '${REDACTED_PATH}' : location.pathname + location.search,
              page_location: drop ? location.origin + '${REDACTED_PATH}' : location.href,
              page_title: drop ? '${REDACTED_TITLE}' : document.title
            };
            // A drop opened in one tab and followed to another page would
            // otherwise hand Google the drop link as the referrer.
            if (document.referrer.indexOf('${DROP_PREFIX}') !== -1) {
              cfg.page_referrer = location.origin + '${REDACTED_PATH}';
            }
            gtag('config', '${id}', cfg);
          })();
        `}
      </Script>
    </>
  );
}
