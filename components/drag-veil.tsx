"use client";

import * as React from "react";
import { Download } from "lucide-react";

/**
 * Full-window drop target.
 *
 * People aim at the page, not at a rectangle, so dragging files anywhere over
 * the window puts the whole surface into a receiving state. The veil is purely
 * a signal — `DropZone` already listens on the window and owns the actual drop
 * handling, so this component never competes for the event.
 */
export function DragVeil({ active, hint }: { active: boolean; hint?: string }) {
  if (!active) return null;

  return (
    <div className="drag-veil animate-fade" aria-hidden>
      <div className="mx-4 flex flex-col items-center gap-4 rounded-lg border-2 border-dashed border-accent bg-surface/80 px-10 py-12 text-center shadow-float animate-pop">
        <span className="relative flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Download aria-hidden className="size-6" />
          <span className="absolute inset-0 rounded-full bg-accent/25 motion-safe:animate-ping-soft" />
        </span>

        <div>
          <p className="text-heading text-ink">Drop to upload</p>
          <p className="mt-1 text-sm text-body">
            {hint ?? "Release anywhere on this page"}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Tracks whether files are currently being dragged over the window.
 *
 * Drag events fire for every element entered, so nesting has to be counted
 * rather than toggled, and a `drop` or a window blur resets the count outright.
 */
export function useWindowDragging(enabled = true): boolean {
  const [dragging, setDragging] = React.useState(false);
  const depth = React.useRef(0);

  React.useEffect(() => {
    if (!enabled) return;

    const carriesFiles = (event: DragEvent) =>
      !!event.dataTransfer?.types?.includes("Files");

    const onEnter = (event: DragEvent) => {
      if (!carriesFiles(event)) return;
      depth.current += 1;
      setDragging(true);
    };
    const onLeave = () => {
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) setDragging(false);
    };
    const reset = () => {
      depth.current = 0;
      setDragging(false);
    };

    window.addEventListener("dragenter", onEnter);
    window.addEventListener("dragleave", onLeave);
    window.addEventListener("drop", reset);
    window.addEventListener("blur", reset);
    return () => {
      window.removeEventListener("dragenter", onEnter);
      window.removeEventListener("dragleave", onLeave);
      window.removeEventListener("drop", reset);
      window.removeEventListener("blur", reset);
    };
  }, [enabled]);

  return dragging;
}
