import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * Served at /robots.txt, generated rather than kept as a static file so the
 * sitemap URL follows NEXT_PUBLIC_SITE_URL instead of being hardcoded in two
 * places. A file at public/robots.txt would shadow this one — don't add one.
 *
 * `/r/` is disallowed for a stronger reason than crawl budget: fetching a
 * drop page has side effects. It increments the view count, and on a
 * burn-after-read drop it starts the ten-minute self-destruct clock. A
 * well-behaved crawler that obeys this file cannot destroy somebody's drop by
 * looking at it.
 *
 * The trade-off is that Google cannot then read the `noindex` those pages
 * already carry, so a drop URL linked from a public page could still appear
 * as a bare URL in results. That is the better failure: a crawler that can
 * see a link but not fetch it beats one that fetches and burns.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/r/", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
