"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Local history of drops this browser has created or opened.
 *
 * Deliberately client-only: it is the closest thing to "my drops" that a
 * product without accounts can offer, and it means the server never has to
 * know which drops belong to whom.
 */
export interface RecentDrop {
  id: string;
  openedAt: number;
  createdHere: boolean;
  hasPassword?: boolean;
  label?: string;
}

const KEY = "jsi-recent-drops";
const LIMIT = 12;

/** Kept for backwards compatibility with the original single-room memory. */
const LEGACY_KEY = "localRoomId";

function read(): RecentDrop[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((d): d is RecentDrop => !!d && typeof d.id === "string")
      .slice(0, LIMIT);
  } catch {
    return [];
  }
}

function write(drops: RecentDrop[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(drops.slice(0, LIMIT)));
  } catch {
    // Private mode or a full quota — history is a convenience, not a feature
    // the app depends on, so failing silently is correct here.
  }
}

export function useRecents() {
  const [recents, setRecents] = useState<RecentDrop[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = read();

    // Migrate the single room id the previous version remembered.
    try {
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy && !stored.some((d) => d.id === legacy)) {
        stored.push({ id: legacy, openedAt: Date.now(), createdHere: false });
      }
    } catch {
      /* ignore */
    }

    setRecents(stored.sort((a, b) => b.openedAt - a.openedAt));
    setLoaded(true);
  }, []);

  const remember = useCallback((drop: Omit<RecentDrop, "openedAt">) => {
    setRecents((current) => {
      const next = [
        { ...drop, openedAt: Date.now() },
        ...current.filter((d) => d.id !== drop.id),
      ].slice(0, LIMIT);
      write(next);
      return next;
    });
    // The old key stays in sync so a rollback would not lose the last room.
    try {
      localStorage.setItem(LEGACY_KEY, drop.id);
    } catch {
      /* ignore */
    }
  }, []);

  const forget = useCallback((id: string) => {
    setRecents((current) => {
      const next = current.filter((d) => d.id !== id);
      write(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setRecents([]);
    write([]);
    try {
      localStorage.removeItem(LEGACY_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return { recents, loaded, remember, forget, clear };
}
