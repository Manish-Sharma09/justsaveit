import { NextResponse, type NextRequest } from "next/server";

/**
 * Two things that must happen before a page is rendered: force HTTPS, and keep
 * the workers.dev preview host out of search results.
 *
 * Both have a cheaper counterpart Cloudflare can apply without waking the
 * Worker — "Always Use HTTPS" at the zone level, and public/_headers for the
 * noindex — and neither of those can cover HTML here, because every page in
 * this app is rendered by the Worker rather than served from the asset layer.
 * That gap is what this file exists to fill, so change it and public/_headers
 * together.
 */

/* -------------------------------------------------------------- https -- */

/**
 * The Worker terminates TLS, so `request.url` is reconstructed and its
 * protocol says nothing about what the client used. The scheme has to come
 * from a header.
 *
 * Note the asymmetry: true only when a header positively says "http", false
 * whenever it cannot tell. Guessing wrong that way costs one un-upgraded
 * request; guessing wrong the other way would redirect HTTPS to itself forever
 * and take the site down. It is also what lets `next dev` and `wrangler dev`
 * work untouched, since neither sends these headers.
 */
function isPlainHttp(request: NextRequest): boolean {
  // Added by Cloudflare on requests it proxies: {"scheme":"https"}.
  const visitor = request.headers.get("cf-visitor");
  if (visitor) {
    try {
      const { scheme } = JSON.parse(visitor) as { scheme?: unknown };
      if (typeof scheme === "string") return scheme.toLowerCase() === "http";
    } catch {
      // Malformed — fall through to the next signal rather than assume.
    }
  }

  // Standard proxy header, and the fallback if CF-Visitor ever goes away.
  // Takes the first entry: proxy chains append rather than replace.
  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded) return forwarded.split(",")[0]!.trim().toLowerCase() === "http";

  return false;
}

/**
 * workers.dev serves byte-identical content to the custom domain, and two
 * hosts indexing the same pages split the ranking signal between them.
 *
 * Matched positively on the preview suffix rather than as "any host that is
 * not justsaveit.online". The inverted test reads as stricter but fails
 * dangerously: one bad NEXT_PUBLIC_SITE_URL and it would put noindex on
 * production and quietly drop the site out of Google. This cannot touch the
 * custom domain whatever host it is handed.
 *
 * The suffix also covers the versioned preview URLs wrangler hands out
 * (<version>-justsaveit.<subdomain>.workers.dev), which the single hardcoded
 * hostname in public/_headers would miss.
 */
const PREVIEW_HOST = /\.workers\.dev$/i;

export function middleware(request: NextRequest) {
  if (isPlainHttp(request)) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    // nextUrl carries the request's port; :80 would survive the scheme change
    // and produce https://host:80.
    url.port = "";
    // 301, matching what the zone-level redirect sends. Browsers cache it
    // against the http:// URL, so a repeat visitor stops making the insecure
    // request at all.
    return NextResponse.redirect(url, 301);
  }

  const response = NextResponse.next();

  if (PREVIEW_HOST.test(request.headers.get("host") ?? "")) {
    response.headers.set("X-Robots-Tag", "noindex");
  }

  return response;
}

export const config = {
  // Static assets are served by Cloudflare's asset layer ahead of the Worker,
  // so they never reach this file; excluding them keeps the matcher honest
  // about what it actually covers. public/_headers is what applies to those.
  matcher: ["/((?!_next/static|_next/image).*)"],
};
