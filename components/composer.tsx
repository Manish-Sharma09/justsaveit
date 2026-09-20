"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  FileText,
  Flame,
  Files,
  Lock,
  Tag,
  Timer,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DropZone } from "@/components/drop-zone";
import { DragVeil, useWindowDragging } from "@/components/drag-veil";
import { FileIcon } from "@/components/file-icon";
import { useToast } from "@/components/ui/toast";
import { useRecents } from "@/hooks/use-recents";
import { detectKind } from "@/lib/filetypes";
import { formatBytes } from "@/lib/format";
import { DEFAULT_EXPIRY, EXPIRY_OPTIONS } from "@/lib/drop-types";
import { normaliseDropId } from "@/lib/ids";
import { cn } from "@/lib/utils";

interface Staged {
  key: string;
  file: File;
}

type Tab = "files" | "text";

let stagedKey = 0;

/**
 * The create surface.
 *
 * Files are staged in the browser until the drop exists, so nothing is
 * uploaded until the person actually commits — which also means an abandoned
 * composer costs zero storage.
 *
 * Files and text share one drop but not one screen: the two inputs want very
 * different amounts of room, so they sit behind a tab pair and the tabs carry
 * a marker for whatever is waiting in the other one. Both are kept in state
 * here, so switching tabs never discards anything.
 */
export function Composer({ maxFileBytes }: { maxFileBytes: number }) {
  const router = useRouter();
  const { toast } = useToast();
  const { remember } = useRecents();

  const [tab, setTab] = React.useState<Tab>("files");
  const [text, setText] = React.useState("");
  const [staged, setStaged] = React.useState<Staged[]>([]);

  const [customId, setCustomId] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [expiry, setExpiry] = React.useState<string>(DEFAULT_EXPIRY);
  const [burn, setBurn] = React.useState(false);

  const idRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = React.useState(false);
  const [progress, setProgress] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const dragging = useWindowDragging(!submitting);
  const totalBytes = staged.reduce((sum, s) => sum + s.file.size, 0);
  const hasText = text.trim().length > 0;
  const isEmpty = !hasText && staged.length === 0;

  const addFiles = React.useCallback(
    (files: File[]) => {
      const accepted: Staged[] = [];
      const rejected: string[] = [];

      for (const file of files) {
        if (file.size > maxFileBytes) rejected.push(file.name);
        else accepted.push({ key: `s${stagedKey++}`, file });
      }

      if (accepted.length > 0) {
        setStaged((current) => [...current, ...accepted]);
        setErrors((current) => ({ ...current, form: "" }));
        // A drop aimed at the window while the text tab is open should still
        // show what it landed on.
        setTab("files");
      }
      if (rejected.length > 0) {
        toast(
          rejected.length === 1
            ? `"${rejected[0]}" is larger than ${formatBytes(maxFileBytes)}.`
            : `${rejected.length} files are larger than ${formatBytes(maxFileBytes)}.`,
          { tone: "error" }
        );
      }
    },
    [maxFileBytes, toast]
  );

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    // The button stays live rather than going grey: a dead primary control in
    // the middle of the hero says nothing about why, and this does.
    if (isEmpty) {
      setErrors({ form: "Add a file or some text before creating the drop." });
      return;
    }

    setErrors({});
    setSubmitting(true);
    setProgress("Creating drop…");

    try {
      // 1. Create the drop.
      const response = await fetch("/api/drops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: customId.trim() || undefined,
          content: text,
          password: password.trim() || undefined,
          expiry,
          burnAfterRead: burn,
        }),
      });

      const body = await response.json();

      if (!response.ok) {
        setErrors({ [body.field ?? "form"]: body.error ?? "Could not create the drop." });
        // Put the cursor on the field that was rejected rather than making the
        // person hunt for the red text.
        if (body.field) {
          requestAnimationFrame(() => {
            if (body.field === "id") idRef.current?.focus();
            else if (body.field === "password") passwordRef.current?.focus();
          });
        }
        setSubmitting(false);
        setProgress(null);
        return;
      }

      const dropId: string = body.id;

      // 2. Upload staged files, if any, before handing over the link — so the
      //    drop is complete the moment it is shared.
      if (staged.length > 0) {
        const { uploadFiles } = await import("@/lib/upload-client");
        await uploadFiles(dropId, staged.map((s) => s.file), (done, total, name) => {
          setProgress(`Uploading ${done + 1} of ${total} — ${name}`);
        });
      }

      remember({ id: dropId, createdHere: true, hasPassword: !!password.trim() });
      setProgress("Done");
      router.push(`/r/${dropId}?new=1`);
    } catch (error) {
      console.error(error);
      toast("Something went wrong. Please try again.", { tone: "error" });
      setSubmitting(false);
      setProgress(null);
    }
  };

  // Each tab shows what is waiting in it: a count for files, which is a
  // number worth reading, and a bare dot for text, which is not.
  const tabs: Array<{
    value: Tab;
    label: string;
    Icon: typeof Files;
    count?: number;
    dot?: boolean;
  }> = [
    { value: "files", label: "Add files", Icon: Files, count: staged.length },
    { value: "text", label: "Add text", Icon: FileText, dot: hasText },
  ];

  return (
    <form
      onSubmit={submit}
      className="rounded-xl border border-line bg-surface p-3 shadow-lift sm:p-4"
    >
      <DragVeil active={dragging} hint="Add it to this drop" />

      {/* --------------------------------------------------------- tabs -- */}
      <div role="tablist" aria-label="What to put in the drop" className="grid grid-cols-2 gap-2">
        {tabs.map(({ value, label, Icon, count, dot }) => (
          <button
            key={value}
            type="button"
            role="tab"
            id={`composer-tab-${value}`}
            aria-selected={tab === value}
            aria-controls={`composer-panel-${value}`}
            onClick={() => setTab(value)}
            className={cn(
              "inline-flex h-11 items-center justify-center gap-2 rounded-md text-sm font-medium",
              "transition-[background-color,color,box-shadow] duration-150",
              tab === value
                ? "border border-line bg-surface text-ink shadow-whisper"
                : "border border-transparent bg-sunken text-body hover:text-ink"
            )}
          >
            <Icon aria-hidden className="size-4 text-accent" />
            {label}
            {count ? (
              <span
                className="ml-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-ink px-1.5 text-[11px] font-medium text-on-ink"
                data-numeric
              >
                {count}
              </span>
            ) : null}
            {dot && (
              <>
                <span aria-hidden className="ml-0.5 size-1.5 rounded-full bg-ink" />
                {/* The dot is the whole message, so it has to be spelled out
                    for anything that cannot see it. */}
                <span className="sr-only">has content</span>
              </>
            )}
          </button>
        ))}
      </div>

      {/* -------------------------------------------------------- panel -- */}
      <div className="mt-3">
        {tab === "files" ? (
          <div
            role="tabpanel"
            id="composer-panel-files"
            aria-labelledby="composer-tab-files"
            className="space-y-2.5"
          >
            <DropZone
              onFiles={addFiles}
              maxFileBytes={maxFileBytes}
              variant="hero"
              compact={staged.length > 0}
            />

            {staged.length > 0 && (
              <>
                <ul className="space-y-1.5">
                  {staged.map(({ key, file }) => (
                    <li
                      key={key}
                      className="flex animate-pop items-center gap-3 rounded-sm border border-line bg-canvas px-3 py-2"
                    >
                      <FileIcon
                        kind={detectKind(file.type, file.name)}
                        className="size-4 shrink-0"
                      />
                      <span className="min-w-0 flex-1 truncate text-[13px] text-ink">
                        {file.name}
                      </span>
                      <span className="shrink-0 font-mono text-[11px] text-mute" data-numeric>
                        {formatBytes(file.size)}
                      </span>
                      <Button
                        type="button"
                        variant="subtle"
                        size="xs"
                        icon
                        onClick={() => setStaged((c) => c.filter((s) => s.key !== key))}
                        aria-label={`Remove ${file.name}`}
                        disabled={submitting}
                      >
                        <X aria-hidden />
                      </Button>
                    </li>
                  ))}
                </ul>
                <p className="font-mono text-xs text-mute" data-numeric>
                  {staged.length} staged · {formatBytes(totalBytes)}
                </p>
              </>
            )}
          </div>
        ) : (
          <div
            role="tabpanel"
            id="composer-panel-text"
            aria-labelledby="composer-tab-text"
          >
            <label htmlFor="composer-text" className="sr-only">
              Your content
            </label>
            <Textarea
              id="composer-text"
              value={text}
              onChange={(event) => {
                setText(event.target.value);
                if (errors.form) setErrors((current) => ({ ...current, form: "" }));
              }}
              placeholder="Paste text, a link, a note, credentials to hand over…"
              rows={7}
              className="resize-y rounded-lg bg-canvas"
            />
          </div>
        )}
      </div>

      {/* ------------------------------------------------------- naming -- */}
      <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
        <FieldWithIcon
          Icon={Tag}
          htmlFor="composer-id"
          label="Custom name"
          error={errors.id}
        >
          <Input
            ref={idRef}
            id="composer-id"
            value={customId}
            onChange={(event) => setCustomId(normaliseDropId(event.target.value))}
            placeholder="Custom name (optional)"
            autoComplete="off"
            spellCheck={false}
            aria-invalid={!!errors.id}
            aria-describedby={errors.id ? "composer-id-error" : undefined}
            className="h-12 rounded-lg border-transparent bg-sunken pl-11 font-mono hover:border-line-strong"
          />
        </FieldWithIcon>

        <FieldWithIcon
          Icon={Lock}
          htmlFor="composer-password"
          label="Password"
          error={errors.password}
        >
          <Input
            ref={passwordRef}
            id="composer-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password (optional)"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "composer-password-error" : undefined}
            className="h-12 rounded-lg border-transparent bg-sunken pl-11 hover:border-line-strong"
          />
        </FieldWithIcon>
      </div>

      {/* ------------------------------------------------------ lifetime -- */}
      <div className="mt-2.5 flex flex-col gap-3 rounded-lg bg-sunken p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2.5">
          <Timer aria-hidden className="size-4 shrink-0 text-mute" />
          <label htmlFor="composer-expiry" className="shrink-0 text-[13px] font-medium text-ink">
            Deletes itself
          </label>
          <Select
            id="composer-expiry"
            value={expiry}
            onChange={(event) => setExpiry(event.target.value)}
            className="h-9 w-auto min-w-31 border-transparent bg-surface"
          >
            {EXPIRY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex items-center gap-2.5">
          <label
            htmlFor="composer-burn"
            className="flex cursor-pointer items-center gap-1.5 text-[13px] font-medium text-ink"
          >
            <Flame aria-hidden className="size-3.5 text-mute" />
            Burn after read
          </label>
          <Switch
            id="composer-burn"
            checked={burn}
            onChange={(event) => setBurn(event.target.checked)}
          />
        </div>
      </div>

      {/* ------------------------------------------------------- submit -- */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        block
        loading={submitting}
        className="mt-3 group"
      >
        Create drop
        <ArrowRight aria-hidden className="nudge-x" />
      </Button>

      <p
        className="mt-2.5 text-center font-mono text-xs text-mute"
        aria-live="polite"
        data-numeric
      >
        {progress ?? `No account needed · Up to ${formatBytes(maxFileBytes)} per file`}
      </p>

      {errors.form && (
        <p
          role="alert"
          className="mt-2.5 rounded-sm bg-danger-soft px-3 py-2 text-sm text-danger-deep"
        >
          {errors.form}
        </p>
      )}
    </form>
  );
}

/**
 * A field whose label is carried by its placeholder and an inset icon — the
 * compact form the hero card needs. The real label is still in the markup for
 * anything that does not read placeholders.
 */
function FieldWithIcon({
  Icon,
  htmlFor,
  label,
  error,
  children,
}: {
  Icon: typeof Lock;
  htmlFor: string;
  label: string;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="sr-only">
        {label}
      </label>
      <div className="relative">
        <Icon
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-mute"
        />
        {children}
      </div>
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
