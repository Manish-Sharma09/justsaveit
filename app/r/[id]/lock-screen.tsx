"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";

/** Password gate shown in place of a protected drop's contents. */
export function LockScreen({ dropId }: { dropId: string }) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    // Autofocus on pointer devices only: on a phone it shoves the keyboard up
    // over the page before the reader has seen what they are unlocking.
    if (window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus();
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!password) {
      setError("Enter the password.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/drops/${encodeURIComponent(dropId)}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        // The unlock cookie is set; re-render the route server-side.
        router.refresh();
        return;
      }

      const body = await response.json().catch(() => ({}));
      setError(body.error ?? "That password is not right.");
      setPassword("");
      // After a failed attempt the field is the only place to go, so refocus
      // it regardless of device.
      inputRef.current?.focus();
    } catch {
      setError("Could not reach the server. Check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm animate-rise">
      <div className="rounded-lg border border-line bg-surface p-6 shadow-whisper sm:p-7">
        <span className="flex size-11 items-center justify-center rounded-full border border-line bg-canvas text-ink">
          <Lock aria-hidden className="size-[18px]" />
        </span>

        <h1 className="mt-4 text-heading">This drop is protected</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-body">
          Enter the password you were given to open{" "}
          <span className="font-mono text-ink">{dropId}</span>.
        </p>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <Field label="Password" htmlFor="unlock-password" error={error}>
            <Input
              ref={inputRef}
              id="unlock-password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (error) setError(null);
              }}
              autoComplete="current-password"
              aria-invalid={!!error}
              placeholder="••••••••"
            />
          </Field>

          <Button type="submit" variant="solid" size="md" block loading={submitting}>
            <KeyRound aria-hidden />
            Unlock
          </Button>
        </form>
      </div>

      <p className="mt-4 text-center text-xs leading-relaxed text-mute">
        Repeated wrong guesses are rate limited. If you do not have the password,
        ask whoever sent you the link.
      </p>
    </div>
  );
}
