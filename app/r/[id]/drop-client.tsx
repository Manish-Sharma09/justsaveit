"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Copy,
  Download,
  Flame,
  Radio,
  Settings2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { ShareStub } from "@/components/share-stub";
import { DropZone } from "@/components/drop-zone";
import { FileList, downloadAll } from "@/components/file-list";
import { FilePreview } from "@/components/file-preview";
import { UploadList } from "@/components/upload-list";
import { DragVeil, useWindowDragging } from "@/components/drag-veil";
import { MobileShareBar } from "@/components/mobile-share-bar";
import { ArtEmptyFiles } from "@/components/step-art";
import { DropSettings } from "./drop-settings";
import { useUploader } from "@/hooks/use-uploader";
import { useRealtime } from "@/hooks/use-realtime";
import { useRecents } from "@/hooks/use-recents";
import { useCopy } from "@/hooks/use-copy";
import { formatBytes, legacyTimestamp, pluralise } from "@/lib/format";
import { RelativeTime } from "@/components/relative-time";
import type { DropFile, DropSummary } from "@/lib/drop-types";
import { cn } from "@/lib/utils";

type SaveState = "idle" | "saving" | "saved" | "error";

export function DropClient({
  initial,
  url,
  justCreated,
  burnsAt,
  limits,
}: {
  initial: DropSummary;
  url: string;
  justCreated: boolean;
  burnsAt: string | null;
  limits: { maxFileBytes: number; maxDropBytes: number; maxFiles: number };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { remember } = useRecents();
  const { copy } = useCopy();

  const [drop, setDrop] = React.useState(initial);
  const [content, setContent] = React.useState(initial.content);
  const [saveState, setSaveState] = React.useState<SaveState>("idle");
  const [preview, setPreview] = React.useState<DropFile | null>(null);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  // Tracks what the server last acknowledged, so we never save a no-op.
  const savedContent = React.useRef(initial.content);
  // Set when an update arrives over the socket, so echoing it back is skipped.
  const fromRemote = React.useRef(false);

  React.useEffect(() => {
    remember({ id: drop.id, createdHere: justCreated, hasPassword: drop.hasPassword });
    // Only on mount: re-running would rewrite history on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------------------------------------------ realtime -- */

  const applyRemote = React.useCallback((incoming: string) => {
    setContent((current) => {
      if (incoming === current) return current;
      fromRemote.current = true;
      savedContent.current = incoming;
      return incoming;
    });
  }, []);

  const { status: realtimeStatus, broadcast } = useRealtime({
    dropId: drop.id,
    enabled: true,
    onRemoteContent: applyRemote,
  });

  /* -------------------------------------------------------------- saving -- */

  React.useEffect(() => {
    if (content === savedContent.current) return;

    // Remote edits are already the server's truth; don't bounce them back.
    if (fromRemote.current) {
      fromRemote.current = false;
      return;
    }

    setSaveState("saving");
    broadcast(content);

    const timer = setTimeout(async () => {
      try {
        const response = await fetch("/api/updateroom", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            room_id: drop.id,
            content,
            last_modified: legacyTimestamp(),
          }),
        });

        if (!response.ok) throw new Error(String(response.status));

        savedContent.current = content;
        setSaveState("saved");
        setDrop((current) => ({ ...current, updatedAt: legacyTimestamp() }));
      } catch {
        setSaveState("error");
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [content, drop.id, broadcast]);

  /* ------------------------------------------------------------- uploads -- */

  const handleUploaded = React.useCallback(
    (file: DropFile) => {
      setDrop((current) => ({
        ...current,
        files: [...current.files.filter((f) => f.id !== file.id), file],
        totalBytes: current.totalBytes + file.size,
      }));
      toast(`"${file.name}" uploaded`);
    },
    [toast]
  );

  const { tasks, upload, cancel, dismiss } = useUploader(drop.id, handleUploaded);

  const remaining = limits.maxDropBytes - drop.totalBytes;
  const atCapacity = remaining <= 0 || drop.files.length >= limits.maxFiles;
  const dragging = useWindowDragging(!atCapacity);

  const addFiles = React.useCallback(
    (files: File[]) => {
      const slots = limits.maxFiles - drop.files.length;
      if (slots <= 0) {
        toast(`A drop can hold ${limits.maxFiles} files.`, { tone: "error" });
        return;
      }

      const accepted: File[] = [];
      let budget = remaining;

      for (const file of files.slice(0, slots)) {
        if (file.size > limits.maxFileBytes) {
          toast(`"${file.name}" is over ${formatBytes(limits.maxFileBytes)}.`, {
            tone: "error",
          });
        } else if (file.size > budget) {
          toast(`"${file.name}" would not fit — ${formatBytes(budget)} left.`, {
            tone: "error",
          });
        } else {
          accepted.push(file);
          budget -= file.size;
        }
      }

      if (accepted.length > 0) void upload(accepted);
    },
    [drop.files.length, limits, remaining, toast, upload]
  );

  /* -------------------------------------------------- paste-to-upload --- */

  React.useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      // Let the textarea handle text pastes normally.
      if (document.activeElement === textareaRef.current) return;

      const files = Array.from(event.clipboardData?.files ?? []);
      if (files.length > 0) {
        event.preventDefault();
        addFiles(files);
        toast(`Pasted ${pluralise(files.length, "file")}`);
      }
    };

    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [addFiles, toast]);

  /* --------------------------------------------------- keyboard shortcuts */

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const meta = event.metaKey || event.ctrlKey;
      if (!meta) return;

      // Cmd/Ctrl+Shift+C — copy the share link from anywhere on the page.
      if (event.shiftKey && event.key.toLowerCase() === "c") {
        event.preventDefault();
        void copy(url).then((ok) =>
          toast(ok ? "Link copied" : "Could not copy", { tone: ok ? "success" : "error" })
        );
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [copy, toast, url]);

  /* ------------------------------------------------------------- actions -- */

  const deleteFile = async (file: DropFile) => {
    const response = await fetch(`/api/files/${file.id}`, { method: "DELETE" });
    if (!response.ok) {
      toast("Could not remove that file.", { tone: "error" });
      return;
    }
    setDrop((current) => ({
      ...current,
      files: current.files.filter((f) => f.id !== file.id),
      totalBytes: current.totalBytes - file.size,
    }));
    toast(`"${file.name}" removed`);
  };

  const deleteDrop = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/drops/${encodeURIComponent(drop.id)}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error();
      toast("Drop deleted");
      router.push("/");
    } catch {
      toast("Could not delete the drop.", { tone: "error" });
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  const copyText = async () => {
    const ok = await copy(content);
    toast(ok ? "Text copied" : "Could not copy the text", {
      tone: ok ? "success" : "error",
    });
  };

  /* ---------------------------------------------------------------- view -- */

  return (
    <div className="shell space-y-6 py-8 pb-24 sm:py-10 lg:pb-10">
      <DragVeil
        active={dragging}
        hint={`${pluralise(limits.maxFiles - drop.files.length, "slot")} left · up to ${formatBytes(remaining)}`}
      />

      {justCreated && (
        <div className="flex items-center gap-3 rounded-sm border border-accent/25 bg-accent-soft px-4 py-3 animate-rise">
          <span className="relative flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-white">
            <Check aria-hidden className="size-3.5" />
            <span className="absolute inset-0 rounded-full bg-accent/40 motion-safe:animate-ping-soft" />
          </span>
          <p className="text-sm font-medium text-accent-deep">
            Your drop is ready. Send the link below.
          </p>
        </div>
      )}

      {burnsAt && (
        <div className="flex items-start gap-2.5 rounded-sm border border-warn/30 bg-warn-soft px-4 py-3">
          <Flame aria-hidden className="mt-0.5 size-4 shrink-0 text-warn-deep" />
          <div>
            <p className="text-sm font-medium text-warn-deep">
              This drop self-destructs <RelativeTime value={burnsAt} />
            </p>
            <p className="mt-0.5 text-xs text-warn-deep/80">
              It was set to burn after reading. Download anything you need now.
            </p>
          </div>
        </div>
      )}

      <div className="animate-rise">
        <ShareStub
          dropId={drop.id}
          url={url}
          fileCount={drop.files.length}
          totalBytes={drop.totalBytes}
          expiresAt={drop.expiresAt}
          hasPassword={drop.hasPassword}
          burnAfterRead={drop.burnAfterRead}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* -------------------------------------------------------- text -- */}
        <section
          aria-labelledby="note-heading"
          // A flex column so the editor grows to whatever height the files
          // column forces on the row, instead of leaving the card half empty.
          className="flex flex-col overflow-hidden rounded-lg border border-line bg-surface"
        >
          <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
            <h2 id="note-heading" className="eyebrow">
              Note
            </h2>

            <div className="flex items-center gap-2">
              <SaveIndicator state={saveState} realtime={realtimeStatus === "live"} />
              <Button
                variant="subtle"
                size="xs"
                onClick={copyText}
                disabled={content.length === 0}
              >
                <Copy aria-hidden />
                Copy
              </Button>
            </div>
          </header>

          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Write or paste anything here. It saves as you type."
            rows={6}
            aria-label="Drop note"
            className="min-h-44 flex-1 resize-y rounded-none border-0 px-4 py-3.5 hover:border-0 focus-visible:ring-0 sm:min-h-60"
          />

          <footer className="flex items-center justify-between gap-3 border-t border-line px-4 py-2">
            <p className="font-mono text-[11px] text-mute" data-numeric>
              {content.length.toLocaleString()} characters
            </p>
            {drop.updatedAt && (
              <RelativeTime
                value={drop.updatedAt}
                prefix="Updated"
                className="font-mono text-[11px] text-mute"
              />
            )}
          </footer>
        </section>

        {/* ------------------------------------------------------- files -- */}
        <section aria-labelledby="files-heading" className="space-y-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="files-heading" className="eyebrow">
              Files
            </h2>
            {drop.files.length > 0 && (
              <Button variant="subtle" size="xs" onClick={() => downloadAll(drop.files)}>
                <Download aria-hidden />
                Download all
              </Button>
            )}
          </div>

          <DropZone
            onFiles={addFiles}
            maxFileBytes={limits.maxFileBytes}
            compact={drop.files.length > 0}
            disabled={atCapacity}
          />

          <UploadList tasks={tasks} onCancel={cancel} onDismiss={dismiss} />

          {drop.files.length > 0 ? (
            <>
              <FileList files={drop.files} onPreview={setPreview} onDelete={deleteFile} />
              <p className="font-mono text-[11px] text-mute" data-numeric>
                {pluralise(drop.files.length, "file")} · {formatBytes(drop.totalBytes)} of{" "}
                {formatBytes(limits.maxDropBytes)}
              </p>
            </>
          ) : (
            tasks.length === 0 && (
              <div className="flex flex-col items-center gap-3 rounded-md border border-line bg-surface px-5 py-7 text-center">
                <ArtEmptyFiles className="h-14 w-auto opacity-90" />
                <div>
                  <p className="text-[13px] font-medium text-ink">Nothing attached yet</p>
                  <p className="mt-1 text-xs leading-relaxed text-mute">
                    Drag files anywhere on this page, or paste an image straight
                    from your clipboard.
                  </p>
                </div>
              </div>
            )
          )}
        </section>
      </div>

      {/* ------------------------------------------------------- footer -- */}
      <div className="flex flex-wrap items-center gap-2 border-t border-line pt-5">
        <Button variant="ghost" size="sm" onClick={() => setSettingsOpen(true)}>
          <Settings2 aria-hidden />
          Settings
        </Button>

        <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
          <Trash2 aria-hidden />
          Delete drop
        </Button>

        <p className="ml-auto font-mono text-[11px] text-mute" data-numeric>
          {drop.viewCount > 0 && `${pluralise(drop.viewCount, "view")} `}
          <span className="hidden sm:inline">
            {drop.viewCount > 0 && "· "}
            <kbd className="rounded-xs border border-line bg-canvas px-1 py-0.5">⌘⇧C</kbd>{" "}
            copies the link
          </span>
        </p>
      </div>

      <MobileShareBar url={url} dropId={drop.id} />

      <FilePreview file={preview} open={!!preview} onClose={() => setPreview(null)} />

      <DropSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        drop={drop}
        onUpdated={(next) => setDrop(next)}
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={deleteDrop}
        loading={deleting}
        title="Delete this drop?"
        description={`"${drop.id}", its note and ${pluralise(drop.files.length, "file")} will be permanently removed. The link will stop working for everyone.`}
        confirmLabel="Delete forever"
      />
    </div>
  );
}

/** Save status, doubling as the realtime indicator. */
function SaveIndicator({ state, realtime }: { state: SaveState; realtime: boolean }) {
  const label =
    state === "saving"
      ? "Saving…"
      : state === "error"
        ? "Not saved"
        : state === "saved"
          ? "Saved"
          : realtime
            ? "Live"
            : "";

  if (!label) return null;

  return (
    <span
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-[11px]",
        state === "error" ? "text-danger" : "text-mute"
      )}
    >
      {realtime && state === "idle" ? (
        <Radio aria-hidden className="size-3 text-accent" />
      ) : (
        <span
          aria-hidden
          className={cn(
            "size-1.5 rounded-full",
            state === "saving" && "animate-pulse bg-warn",
            state === "saved" && "bg-accent",
            state === "error" && "bg-danger"
          )}
        />
      )}
      {label}
    </span>
  );
}
