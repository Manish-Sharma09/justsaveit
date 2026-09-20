/**
 * Client-safe configuration. `NEXT_PUBLIC_*` variables are inlined at build
 * time, so this module is importable from both server and client components.
 */
export const publicConfig = {
  /** Socket.IO endpoint for live sync. Empty string disables realtime. */
  realtimeUrl: process.env.NEXT_PUBLIC_REALTIME_URL ?? "",
  /** Canonical origin, used when building share URLs on the server. */
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "",
} as const;

export const APP_NAME = "Just Save It";
export const APP_TAGLINE = "A drop box for anything. No account, no fuss.";
