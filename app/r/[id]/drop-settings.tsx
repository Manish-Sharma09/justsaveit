"use client";

import * as React from "react";
import { Flame, Lock, Unlock } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Field } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { EXPIRY_OPTIONS, type DropSummary } from "@/lib/drop-types";

/**
 * Settings for an open drop. Anyone who can open the drop can change these —
 * the link is the credential, exactly as it has always been in this app.
 */
export function DropSettings({
  open,
  onClose,
  drop,
  onUpdated,
}: {
  open: boolean;
  onClose: () => void;
  drop: DropSummary;
  onUpdated: (next: DropSummary) => void;
}) {
  const { toast } = useToast();

  const [password, setPassword] = React.useState("");
  const [removePassword, setRemovePassword] = React.useState(false);
  const [expiry, setExpiry] = React.useState<string>("");
  const [burn, setBurn] = React.useState(drop.burnAfterRead);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Re-sync whenever the dialog is reopened so it never shows stale input.
  React.useEffect(() => {
    if (!open) return;
    setPassword("");
    setRemovePassword(false);
    setExpiry("");
    setBurn(drop.burnAfterRead);
    setError(null);
  }, [open, drop.burnAfterRead]);

  const save = async () => {
    setSaving(true);
    setError(null);

    const payload: Record<string, unknown> = { burnAfterRead: burn };
    if (expiry) payload.expiry = expiry;
    if (removePassword) payload.password = "";
    else if (password.trim()) payload.password = password.trim();

    try {
      const response = await fetch(`/api/drops/${encodeURIComponent(drop.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await response.json();

      if (!response.ok) {
        setError(body.error ?? "Could not save these settings.");
        setSaving(false);
        return;
      }

      onUpdated(body as DropSummary);
      toast("Settings saved");
      onClose();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Drop settings"
      description="Changes apply immediately for everyone with the link."
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="solid" size="sm" onClick={save} loading={saving}>
            Save changes
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* ----------------------------------------------------- password -- */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {drop.hasPassword ? (
              <Lock aria-hidden className="size-4 text-accent" />
            ) : (
              <Unlock aria-hidden className="size-4 text-mute" />
            )}
            <p className="text-[13px] font-medium text-ink">
              {drop.hasPassword ? "Password protected" : "No password"}
            </p>
          </div>

          {drop.hasPassword && (
            <label className="flex items-center gap-2.5 rounded-sm border border-line bg-canvas p-3">
              <Switch
                checked={removePassword}
                onChange={(event) => setRemovePassword(event.target.checked)}
              />
              <span className="text-[13px] text-ink">Remove the password</span>
            </label>
          )}

          {!removePassword && (
            <Field
              label={drop.hasPassword ? "Change password" : "Add a password"}
              htmlFor="settings-password"
              optional
              hint="At least 4 characters. Leave blank to keep it as it is."
            >
              <Input
                id="settings-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="••••••••"
              />
            </Field>
          )}
        </div>

        {/* ------------------------------------------------------- expiry -- */}
        <Field
          label="Expiry"
          htmlFor="settings-expiry"
          hint={
            drop.expiresAt
              ? `Currently set to expire. Choosing a new value restarts the clock.`
              : "Currently never expires."
          }
        >
          <Select
            id="settings-expiry"
            value={expiry}
            onChange={(event) => setExpiry(event.target.value)}
          >
            <option value="">Keep as is</option>
            {EXPIRY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label === "Never" ? "Never expire" : `Expire in ${option.label}`}
              </option>
            ))}
          </Select>
        </Field>

        {/* --------------------------------------------------------- burn -- */}
        <label className="flex items-start gap-3 rounded-sm border border-line bg-canvas p-3">
          <Switch checked={burn} onChange={(event) => setBurn(event.target.checked)} />
          <span className="min-w-0">
            <span className="flex items-center gap-1.5 text-[13px] font-medium text-ink">
              <Flame aria-hidden className="size-3.5 text-mute" />
              Burn after read
            </span>
            <span className="mt-0.5 block text-xs leading-snug text-mute">
              Once someone opens this drop, it deletes itself ten minutes later.
            </span>
          </span>
        </label>

        {error && (
          <p role="alert" className="rounded-sm bg-danger-soft px-3 py-2 text-sm text-danger-deep">
            {error}
          </p>
        )}
      </div>
    </Dialog>
  );
}
