/** Shared, locale-stable formatting helpers (server and client safe). */

const UNITS = ["B", "KB", "MB", "GB", "TB"] as const;

/** Narrow no-break space: keeps "25 MB" from wrapping across lines. */
const NBSP = "\u00A0";

export function formatBytes(bytes: number, decimals = 1): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    UNITS.length - 1
  );
  const value = bytes / 1024 ** exponent;
  // Whole numbers read better without a trailing ".0"
  const rounded = value >= 100 || exponent === 0 ? Math.round(value) : value;
  return `${rounded.toFixed(exponent === 0 ? 0 : decimals).replace(/\.0$/, "")}${NBSP}${UNITS[exponent]}`;
}

const RELATIVE = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const DIVISIONS: Array<{ amount: number; unit: Intl.RelativeTimeFormatUnit }> = [
  { amount: 60, unit: "second" },
  { amount: 60, unit: "minute" },
  { amount: 24, unit: "hour" },
  { amount: 7, unit: "day" },
  { amount: 4.34524, unit: "week" },
  { amount: 12, unit: "month" },
  { amount: Number.POSITIVE_INFINITY, unit: "year" },
];

/** "3 minutes ago" / "in 2 days". Returns "just now" inside a 10s window. */
export function formatRelative(input: Date | string | number): string {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return "";

  let duration = (date.getTime() - Date.now()) / 1000;
  if (Math.abs(duration) < 10) return "just now";

  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return RELATIVE.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }
  return "";
}

/** Absolute timestamp for tooltips and the `datetime` attribute. */
export function formatAbsolute(input: Date | string | number): string {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function toIsoOrNull(input: Date | string | null | undefined): string | null {
  if (!input) return null;
  const date = input instanceof Date ? input : new Date(input);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/**
 * The legacy timestamp format this project has always written to Mongo:
 * local time rendered as "YYYY-MM-DD HH:MM:SS".
 */
export function legacyTimestamp(now = new Date()): string {
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 19).replace("T", " ");
}

export function pluralise(count: number, singular: string, plural?: string): string {
  return `${count}${NBSP}${count === 1 ? singular : (plural ?? `${singular}s`)}`;
}

/**
 * "2026-09-20" → "20 September 2026". The locale is pinned rather than taken
 * from the environment so the server and the client always agree.
 */
export function formatLongDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}
