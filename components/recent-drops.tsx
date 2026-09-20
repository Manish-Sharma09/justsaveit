"use client";

import * as React from "react";
import Link from "next/link";
import { Clock, Lock, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useRecents } from "@/hooks/use-recents";
import { RelativeTime } from "@/components/relative-time";

/**
 * Drops this browser has seen.
 *
 * Stored only in localStorage — it is the nearest thing to a history that a
 * product without accounts can honestly offer, and it means the server never
 * learns which drops belong to whom.
 */
export function RecentDrops() {
  const { recents, loaded, forget, clear } = useRecents();
  const [confirmClear, setConfirmClear] = React.useState(false);

  // Nothing is rendered until localStorage has been read, so the server and
  // the first client paint agree.
  if (!loaded || recents.length === 0) return null;

  return (
    <section aria-labelledby="recents-heading" className="animate-fade">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2 id="recents-heading" className="eyebrow">
          On this device
        </h2>
        <Button variant="subtle" size="xs" onClick={() => setConfirmClear(true)}>
          <Trash2 aria-hidden />
          Clear
        </Button>
      </div>

      <ul className="divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
        {recents.map((drop) => (
          <li key={drop.id} className="group flex items-center gap-2 transition-colors hover:bg-canvas">
            <Link
              href={`/r/${drop.id}`}
              className="flex min-w-0 flex-1 items-center gap-3 rounded-sm px-3 py-2.5"
            >
              <span
                className="min-w-0 flex-1 truncate font-mono text-[13px] font-medium text-ink"
                translate="no"
              >
                {drop.id}
              </span>

              {drop.hasPassword && (
                <Lock aria-hidden className="size-3.5 shrink-0 text-mute" />
              )}

              <span className="hidden shrink-0 items-center gap-1 text-xs text-mute sm:flex">
                <Clock aria-hidden className="size-3" />
                <RelativeTime value={drop.openedAt} />
              </span>
            </Link>

            <Button
              variant="subtle"
              size="xs"
              icon
              onClick={() => forget(drop.id)}
              aria-label={`Forget ${drop.id}`}
              className="mr-2 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            >
              <X aria-hidden />
            </Button>
          </li>
        ))}
      </ul>

      <p className="mt-2 text-xs text-mute">
        Saved in this browser only. Clearing site data removes it.
      </p>

      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => {
          clear();
          setConfirmClear(false);
        }}
        title="Clear this list?"
        description="Only this browser's history is forgotten. The drops themselves stay exactly where they are, and their links keep working."
        confirmLabel="Clear list"
      />
    </section>
  );
}
