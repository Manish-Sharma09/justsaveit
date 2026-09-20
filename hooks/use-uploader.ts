"use client";

import { useCallback, useRef, useState } from "react";
import { uploadFile, UploadError } from "@/lib/upload-client";
import { detectKind } from "@/lib/filetypes";
import type { DropFile } from "@/lib/drop-types";

/**
 * Upload queue with live progress, for use inside an open drop.
 *
 * The chunking and retry rules live in lib/upload-client; this hook only owns
 * the queue, the React state and cancellation.
 */

export type UploadStatus = "queued" | "uploading" | "done" | "error" | "cancelled";

export interface UploadTask {
  localId: string;
  name: string;
  size: number;
  mime: string;
  sent: number;
  status: UploadStatus;
  error?: string;
  fileId?: string;
}

/** Two at a time is noticeably faster than one without saturating the uplink. */
const CONCURRENCY = 2;

let counter = 0;

export function useUploader(dropId: string, onComplete: (file: DropFile) => void) {
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const cancelled = useRef(new Set<string>());

  const patch = useCallback((localId: string, changes: Partial<UploadTask>) => {
    setTasks((current) =>
      current.map((task) => (task.localId === localId ? { ...task, ...changes } : task))
    );
  }, []);

  const runOne = useCallback(
    async (file: File, localId: string) => {
      if (cancelled.current.has(localId)) return;
      patch(localId, { status: "uploading", sent: 0 });

      try {
        const fileId = await uploadFile(dropId, file, {
          onProgress: (sent) => patch(localId, { sent }),
          isCancelled: () => cancelled.current.has(localId),
        });

        patch(localId, { status: "done", sent: file.size, fileId });

        onComplete({
          id: fileId,
          name: file.name,
          mime: file.type || "application/octet-stream",
          size: file.size,
          kind: detectKind(file.type, file.name),
          complete: true,
          createdAt: new Date().toISOString(),
        });
      } catch (error) {
        if (cancelled.current.has(localId)) {
          patch(localId, { status: "cancelled" });
          return;
        }
        patch(localId, {
          status: "error",
          error:
            error instanceof UploadError || error instanceof Error
              ? error.message
              : "Upload failed.",
        });
      }
    },
    [dropId, onComplete, patch]
  );

  const upload = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      const queued = files.map((file) => ({ localId: `u${counter++}`, file }));

      setTasks((current) => [
        ...current,
        ...queued.map(({ localId, file }) => ({
          localId,
          name: file.name,
          size: file.size,
          mime: file.type || "application/octet-stream",
          sent: 0,
          status: "queued" as const,
        })),
      ]);

      const queue = [...queued];
      await Promise.all(
        Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
          for (let next = queue.shift(); next; next = queue.shift()) {
            await runOne(next.file, next.localId);
          }
        })
      );
    },
    [runOne]
  );

  const cancel = useCallback((localId: string) => {
    cancelled.current.add(localId);
  }, []);

  const dismiss = useCallback((localId: string) => {
    cancelled.current.add(localId);
    setTasks((current) => current.filter((task) => task.localId !== localId));
  }, []);

  const clearFinished = useCallback(() => {
    setTasks((current) => current.filter((task) => task.status !== "done"));
  }, []);

  return { tasks, upload, cancel, dismiss, clearFinished };
}
