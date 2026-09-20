"use client";

import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/format";
import type { UploadTask } from "@/hooks/use-uploader";
import { cn } from "@/lib/utils";

/** In-flight uploads, with real per-file progress and a cancel affordance. */
export function UploadList({
  tasks,
  onCancel,
  onDismiss,
  className,
}: {
  tasks: UploadTask[];
  onCancel: (localId: string) => void;
  onDismiss: (localId: string) => void;
  className?: string;
}) {
  const active = tasks.filter((task) => task.status !== "done");
  if (active.length === 0) return null;

  return (
    <ul className={cn("space-y-2", className)} aria-label="Uploads in progress">
      {active.map((task) => {
        const percent =
          task.size > 0 ? Math.min(100, Math.round((task.sent / task.size) * 100)) : 0;
        const failed = task.status === "error";

        return (
          <li
            key={task.localId}
            className={cn(
              "rounded-sm border bg-surface px-3 py-2.5",
              failed ? "border-danger/30 bg-danger-soft" : "border-line"
            )}
          >
            <div className="flex items-center gap-3">
              {failed && (
                <AlertTriangle aria-hidden className="size-4 shrink-0 text-danger" />
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-ink">{task.name}</p>
                <p className="mt-0.5 font-mono text-[11px] text-mute" data-numeric>
                  {failed
                    ? task.error
                    : task.status === "cancelled"
                      ? "Cancelled"
                      : task.status === "queued"
                        ? `Queued · ${formatBytes(task.size)}`
                        : `${formatBytes(task.sent)} of ${formatBytes(task.size)} · ${percent}%`}
                </p>
              </div>

              <Button
                variant="subtle"
                size="xs"
                icon
                onClick={() =>
                  task.status === "uploading" || task.status === "queued"
                    ? onCancel(task.localId)
                    : onDismiss(task.localId)
                }
                aria-label={
                  task.status === "uploading" ? `Cancel upload of ${task.name}` : "Dismiss"
                }
              >
                <X aria-hidden />
              </Button>
            </div>

            {!failed && task.status !== "cancelled" && (
              <div
                className="mt-2 h-1 overflow-hidden rounded-full bg-sunken"
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Uploading ${task.name}`}
              >
                <div
                  className={cn(
                    "h-full rounded-full transition-[width] duration-300 ease-out",
                    task.status === "queued" ? "bg-line-strong" : "sweeping"
                  )}
                  style={{ width: `${task.status === "queued" ? 100 : percent}%` }}
                />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
