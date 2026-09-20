import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { SITE } from "@/lib/site";

/**
 * Served at /sitemap.xml. A file at public/sitemap.xml would shadow this one
 * — don't add one.
 *
 * Only the public pages are listed. Drops under /r/ are private by
 * definition, already carry `robots: noindex` and are disallowed in
 * robots.txt, so listing them would be both useless and a disclosure.
 *
 * `lastmod` is a hand-maintained date per page rather than `new Date()`.
 * That is deliberate: a sitemap that reports every page as modified on every
 * build is telling the crawler nothing, and Google demotes the signal
 * entirely once it proves unreliable. Bump the date when the page's content
 * actually changes — a deploy is not a change.
 *
 * `changefreq` and `priority` are in the protocol but Google ignores both.
 * They are kept for the crawlers that still read them; there is no point
 * tuning them.
 */
const CONTENT_UPDATED = {
  home: "2026-09-20",
  about: "2026-09-20",
  contact: "2026-09-20",
} as const;

/** Sitemap `lastmod` wants a date, and these are known to be valid ISO dates. */
const at = (iso: string) => new Date(`${iso}T00:00:00Z`);

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: at(CONTENT_UPDATED.home),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: at(CONTENT_UPDATED.about),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: at(CONTENT_UPDATED.contact),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    // The policy pages already publish a "Last updated" date. Reusing it keeps
    // the page and the crawler from disagreeing about when it changed.
    {
      url: `${SITE_URL}/privacy`,
      lastModified: at(SITE.effectiveDate),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: at(SITE.effectiveDate),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
