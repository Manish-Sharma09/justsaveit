"use client";

import * as React from "react";
import { formatAbsolute, formatRelative } from "@/lib/format";

/**
 * Hydration-safe relative timestamp.
 *
 * "2 minutes ago" is derived from `Date.now()`, so rendering it during SSR and
 * again on the client yields two different strings and React reports a
 * mismatch. The server renders the absolute time; the relative form is swapped
 * in after mount and refreshed every minute, so a page left open does not go
 * on claiming "just now".
 */
export function RelativeTime({
  value,
  prefix,
  className,
}: {
  value: string | number | Date | null | undefined;
  prefix?: string;
  className?: string;
}) {
  // `null` until mounted — that is what distinguishes server from client.
  const [now, setNow] = React.useState<number | null>(null);

  React.useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const absolute = formatAbsolute(date);

  return (
    <time dateTime={date.toISOString()} title={absolute} className={className}>
      {prefix ? `${prefix} ` : ""}
      {now === null ? absolute : formatRelative(date)}
    </time>
  );
}
