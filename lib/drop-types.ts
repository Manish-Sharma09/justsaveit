import type { FileKind } from "./filetypes";

/**
 * Shapes and constants shared by the server and the browser.
 *
 * Kept apart from lib/drops.ts on purpose: that module imports the MongoDB
 * driver, and a client component importing a value from it would drag the
 * whole driver (and its `net`/`tls` requires) into the browser bundle.
 */

export interface DropFile {
  id: string;
  name: string;
  mime: string;
  size: number;
  kind: FileKind;
  complete: boolean;
  createdAt: string;
}

export interface DropSummary {
  id: string;
  content: string;
  files: DropFile[];
  hasPassword: boolean;
  expiresAt: string | null;
  burnAfterRead: boolean;
  createdAt: string | null;
  updatedAt: string;
  viewCount: number;
  totalBytes: number;
}

export const EXPIRY_OPTIONS = [
  { value: "1h", label: "1 hour", ms: 60 * 60 * 1000 },
  { value: "24h", label: "24 hours", ms: 24 * 60 * 60 * 1000 },
  { value: "7d", label: "7 days", ms: 7 * 24 * 60 * 60 * 1000 },
  { value: "30d", label: "30 days", ms: 30 * 24 * 60 * 60 * 1000 },
  { value: "never", label: "Never", ms: null },
] as const;

export type ExpiryValue = (typeof EXPIRY_OPTIONS)[number]["value"];

export const DEFAULT_EXPIRY: ExpiryValue = "7d";

/** Grace period a burn-after-read drop survives once someone opens it. */
export const BURN_GRACE_MS = 10 * 60 * 1000;

export function expiryToDate(value: string | null | undefined): Date | null {
  const option = EXPIRY_OPTIONS.find((o) => o.value === value);
  if (!option || option.ms === null) return null;
  return new Date(Date.now() + option.ms);
}
