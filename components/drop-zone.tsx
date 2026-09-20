"use client";

import * as React from "react";
import { Paperclip, Upload, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/format";

/**
 * Drag-and-drop target.
 *
 * Uses the native HTML5 drag events and the File API — no upload library. The
 * whole window is a drop target (people aim at the page, not at a rectangle),
 * while the visible panel doubles as a button and a file input label so the
 * control is reachable by keyboard and by screen reader.
 */
export function DropZone({
  onFiles,
  disabled = false,
  maxFileBytes,
  compact = false,
  variant = "panel",
  className,
}: {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
  maxFileBytes: number;
  compact?: boolean;
  /**
   * `panel` — the whole rectangle is the button; the tight form used inside
   * an existing drop.
   * `hero` — the rectangle is a well with an explicit "Browse files" button
   * inside it. A button cannot nest inside a button, so the well itself is a
   * plain surface here: pointing at it still opens the picker, and keyboard
   * and screen-reader users get the real control in the middle.
   */
  variant?: "panel" | "hero";
  className?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);
  // Drag events fire for every child element, so nesting is counted.
  const depth = React.useRef(0);

  React.useEffect(() => {
    if (disabled) return;

    const onEnter = (event: DragEvent) => {
      if (!event.dataTransfer?.types?.includes("Files")) return;
      depth.current += 1;
      setDragging(true);
    };
    const onLeave = () => {
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) setDragging(false);
    };
    const onOver = (event: DragEvent) => {
      if (event.dataTransfer?.types?.includes("Files")) event.preventDefault();
    };
    const onDrop = (event: DragEvent) => {
      depth.current = 0;
      setDragging(false);
      if (!event.dataTransfer?.files?.length) return;
      event.preventDefault();
      onFiles(Array.from(event.dataTransfer.files));
    };

    window.addEventListener("dragenter", onEnter);
    window.addEventListener("dragleave", onLeave);
    window.addEventListener("dragover", onOver);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragenter", onEnter);
      window.removeEventListener("dragleave", onLeave);
      window.removeEventListener("dragover", onOver);
      window.removeEventListener("drop", onDrop);
    };
  }, [disabled, onFiles]);

  const pick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length > 0) onFiles(files);
    // Reset so picking the same file twice still fires a change event.
    event.target.value = "";
  };

  const fileInput = (
    <input
        ref={inputRef}
        type="file"
        multiple
        onChange={pick}
        disabled={disabled}
        // The visible button below is the real control and is fully labelled,
        // so the input itself is kept out of the tab order and the a11y tree.
        tabIndex={-1}
        aria-hidden
        className="sr-only"
        id="drop-zone-input"
      />
  );

  if (variant === "hero") {
    return (
      <div className={className}>
        {fileInput}

        <div
          onClick={() => !disabled && inputRef.current?.click()}
          className={cn(
            "relative flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-center",
            "transition-[border-color,background-color] duration-200",
            compact ? "px-4 py-6" : "px-6 py-8 sm:py-10",
            dragging
              ? "border-accent bg-accent-soft"
              : "border-line-strong bg-canvas hover:border-line-strong/80",
            disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          )}
        >
          <span
            aria-hidden
            className={cn(
              "mb-2 flex size-12 items-center justify-center rounded-full border transition-colors",
              dragging
                ? "border-accent bg-surface text-accent"
                : "border-line bg-surface text-mute shadow-whisper"
            )}
          >
            {dragging ? (
              <Upload className="size-5" />
            ) : (
              <UploadCloud className="size-5" />
            )}
          </span>

          <p className="text-sm font-medium text-ink">
            {dragging ? "Drop to add them" : "Choose a file or drag & drop it here."}
          </p>
          <p id="drop-zone-hint" className="font-mono text-xs text-mute" data-numeric>
            Max size: {formatBytes(maxFileBytes)} per file
          </p>

          <button
            type="button"
            onClick={(event) => {
              // The well already handles the click; stop it bubbling so the
              // picker is not opened twice.
              event.stopPropagation();
              inputRef.current?.click();
            }}
            disabled={disabled}
            aria-describedby="drop-zone-hint"
            className={cn(
              "mt-3 inline-flex h-9 items-center rounded-full border border-line bg-surface px-4",
              "text-[13px] font-medium text-ink shadow-whisper transition-colors",
              "hover:border-line-strong hover:bg-sunken disabled:pointer-events-none disabled:opacity-45"
            )}
          >
            Browse files
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {fileInput}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        aria-describedby="drop-zone-hint"
        className={cn(
          "group relative flex w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-md border border-dashed text-center",
          "transition-[border-color,background-color] duration-200",
          compact ? "px-4 py-6" : "px-6 py-10 sm:py-14",
          dragging
            ? "border-accent bg-accent-soft"
            : "border-line-strong bg-canvas hover:border-ink hover:bg-sunken",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        {!dragging && <span aria-hidden className="dot-grid absolute inset-0" />}
        <span
          className={cn(
            "relative flex size-10 items-center justify-center rounded-full border transition-colors",
            dragging
              ? "border-accent bg-surface text-accent"
              : "border-line bg-surface text-mute group-hover:text-ink"
          )}
        >
          {dragging ? (
            <Upload aria-hidden className="size-[18px]" />
          ) : (
            <Paperclip aria-hidden className="size-[18px]" />
          )}
        </span>

        <span className="relative text-sm font-medium text-ink">
          {dragging ? "Drop to upload" : "Drag files here, or browse"}
        </span>

        {!compact && (
          <span id="drop-zone-hint" className="relative font-mono text-xs text-mute" data-numeric>
            Images, video, PDFs, documents — up to {formatBytes(maxFileBytes)} each
          </span>
        )}
      </button>
    </div>
  );
}
