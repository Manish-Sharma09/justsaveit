import type { NextConfig } from "next";

/**
 * Response headers applied to every HTML document and API response.
 *
 * Deliberately no Content-Security-Policy. A useful one here needs per-request
 * nonces for Next's inline bootstrap scripts, and a CSP that is wrong is worse
 * than none — it breaks the page for everyone while claiming to protect it.
 * That is its own change, with its own testing.
 */
const securityHeaders = [
  /**
   * Tells the browser never to try this origin over HTTP again, which closes
   * the one insecure request the redirect in middleware.ts cannot: the first
   * one, before any redirect has been seen.
   *
   * READ BEFORE RAISING THIS. A browser that has seen this header honours it
   * for the full max-age and will refuse to load the site over HTTP for a
   * year, with no click-through for the user. That is the point, but it means
   * the domain is committed to working HTTPS for that long.
   *
   * Scoped as narrowly as it can usefully be:
   *   - no `includeSubDomains`, so a future subdomain is unaffected;
   *   - no `preload`, so nothing is baked into browser binaries, which is the
   *     only genuinely irreversible form of this header.
   *
   * To back it out: set max-age=0, deploy, and leave it up. Browsers clear the
   * policy on their next HTTPS visit. Removing the header entirely does NOT
   * clear it — it just stops refreshing, and the old max-age runs its course.
   */
  { key: "Strict-Transport-Security", value: "max-age=31536000" },

  /** Stops the browser second-guessing Content-Type on uploaded files. */
  { key: "X-Content-Type-Options", value: "nosniff" },

  /**
   * A drop's URL is its credential: anyone holding it can open the drop. This
   * keeps the path out of the Referer on any cross-origin navigation, so a
   * link clicked from a drop page leaks the origin and nothing more.
   */
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

  /** Nothing here is meant to be embedded; framing it is only ever clickjacking. */
  { key: "X-Frame-Options", value: "SAMEORIGIN" },

  /**
   * The app generates QR codes, it never scans one, so it has no use for the
   * camera — nor for any of these. Denying them means a future dependency
   * cannot quietly start asking.
   */
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
