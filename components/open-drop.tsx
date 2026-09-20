"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normaliseDropId } from "@/lib/ids";

/**
 * Open an existing drop by its code — the direct descendant of the original
 * "enter room id" field, which is how people already use this app.
 *
 * Pasting a full URL works too, because that is what people actually have on
 * their clipboard.
 */
export function OpenDrop() {
  const router = useRouter();
  const [value, setValue] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [checking, setChecking] = React.useState(false);

  const extractId = (raw: string): string => {
    const trimmed = raw.trim();
    // Accept "https://host/r/abc123", "/r/abc123" or a bare code.
    const match = /(?:^|\/)r\/([^/?#\s]+)/.exec(trimmed);
    return normaliseDropId(match ? match[1] : trimmed);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const id = extractId(value);

    if (!id) {
      setError("Enter a drop code or paste its link.");
      return;
    }

    setError(null);
    setChecking(true);

    try {
      const response = await fetch(`/api/drops/${encodeURIComponent(id)}/exists`);
      const body = await response.json();
      if (!body.exists) {
        setError("No drop with that code. It may have expired.");
        setChecking(false);
        return;
      }
      router.push(`/r/${id}`);
    } catch {
      // If the check itself fails, let the drop page handle it rather than
      // blocking on a transient network error.
      router.push(`/r/${id}`);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            if (error) setError(null);
          }}
          placeholder="Drop code or link"
          aria-label="Drop code or link"
          aria-invalid={!!error}
          autoComplete="off"
          spellCheck={false}
          className="font-mono"
        />
        <Button type="submit" variant="solid" loading={checking} className="group shrink-0">
          Open
          <ArrowRight aria-hidden className="nudge-x" />
        </Button>
      </div>

      {error && (
        <p role="alert" className="flex items-center gap-1.5 text-xs text-danger">
          <SearchX aria-hidden className="size-3.5 shrink-0" />
          {error}
        </p>
      )}
    </form>
  );
}
