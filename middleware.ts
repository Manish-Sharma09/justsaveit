import { NextResponse, type NextRequest } from "next/server";

/**
 * Upgrades plain HTTP requests to HTTPS.
 *
 * Cloudflare's zone-level "Always Use HTTPS" does this at the edge for free,
 * without waking the Worker, and is the better place for it. This exists
 * because that setting is off and flipping it needs dashboard access — if it
 * is ever turned on, the edge redirects first and this code simply stops
 * being reached. Leaving both on costs nothing and is not a conflict.
 *
 * The scheme has to be read from a header: the Worker is the TLS endpoint, so
 * `request.url` is reconstructed and its protocol is not evidence of what the
 * client actually used.
 *
 * Note the asymmetry in `isPlainHttp` — it returns true only when a header
 * positively says "http", and false whenever it cannot tell. Guessing wrong in
 * that direction costs one un-upgraded request; guessing wrong in the other
 * direction would redirect HTTPS to HTTPS forever and take the site down. The
 * default is also what makes `next dev` and `wrangler dev` work untouched,
 * since neither sends these headers.
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

export function middleware(request: NextRequest) {
  if (!isPlainHttp(request)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.protocol = "https:";
  // nextUrl carries the request's port; :80 would survive the scheme change
  // and produce https://host:80.
  url.port = "";

  // 301, matching what the edge toggle sends. Browsers cache it against the
  // http:// URL, so a repeat visitor stops making the insecure request at all.
  return NextResponse.redirect(url, 301);
}

export const config = {
  // Static assets are served by Cloudflare's asset layer ahead of the Worker,
  // so they never reach this file; excluding them keeps the matcher honest
  // about what it actually covers.
  matcher: ["/((?!_next/static|_next/image).*)"],
};
