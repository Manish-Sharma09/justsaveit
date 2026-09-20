/**
 * Operator and legal details for the About, Contact, Privacy and Terms pages.
 *
 * ┌───────────────────────────────────────────────────────────────────────┐
 * │  EVERY VALUE BELOW IS A PLACEHOLDER. Replace all of them before the   │
 * │  site goes live. The legal pages render these strings verbatim, so a  │
 * │  stale value here becomes a false statement on a published policy —   │
 * │  an unrouted abuse@ address in particular leaves takedown requests    │
 * │  bouncing, which is the one thing a file host cannot afford.          │
 * └───────────────────────────────────────────────────────────────────────┘
 */
export const SITE = {
  /** The name the service trades under. */
  operator: "Just Save It",

  /** The registered entity or individual that actually operates it. */
  operatorLegalName: "Just Save It",

  /**
   * Whose courts and law govern the Terms. Defaulted to India because that is
   * where this repository's author is based — confirm it, or change it, with
   * whoever reviews these pages.
   */
  governingLaw: "India",

  /** General enquiries. */
  contactEmail: "hello@justsaveit.online",

  /** Data-protection requests: access, correction, deletion. */
  privacyEmail: "privacy@justsaveit.online",

  /** Abuse, copyright and takedown reports. Route this one first. */
  abuseEmail: "abuse@justsaveit.online",

  /**
   * ISO date the policy pages last changed. Rendered as "Last updated" on
   * those pages and used as their `lastmod` in the sitemap, so bumping this
   * one value keeps the page and the crawler telling the same story.
   */
  effectiveDate: "2026-09-20",

  /** Public source. Remove this and the About page link if it should stay private. */
  repoUrl: "https://github.com/Manish-Sharma09/justsaveit",
} as const;
