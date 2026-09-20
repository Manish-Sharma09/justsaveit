/**
 * Browser-side chunked upload.
 *
 * Shared by the composer (fire-and-forget, before navigating to the new drop)
 * and by the `useUploader` hook (live progress inside an open drop), so the
 * retry and chunking rules live in exactly one place.
 */

const MAX_RETRIES = 3;

export interface UploadHandle {
  /** Called after each chunk lands, with bytes confirmed so far. */
  onProgress?: (sentBytes: number, totalBytes: number) => void;
  /** Polled between chunks; returning true aborts and cleans up. */
  isCancelled?: () => boolean;
}

export class UploadError extends Error {
  constructor(
    message: string,
    /** True when retrying could plausibly succeed. */
    readonly retryable: boolean
  ) {
    super(message);
    this.name = "UploadError";
  }
}

/** Uploads one file and resolves with its server-side id. */
export async function uploadFile(
  dropId: string,
  file: File,
  handle: UploadHandle = {}
): Promise<string> {
  const reserve = await fetch(`/api/drops/${encodeURIComponent(dropId)}/files`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: file.name,
      mime: file.type || "application/octet-stream",
      size: file.size,
    }),
  });

  if (!reserve.ok) {
    const body = await reserve.json().catch(() => ({}));
    throw new UploadError(body.error ?? "Upload could not start.", false);
  }

  const { fileId, chunkSize, chunkCount } = (await reserve.json()) as {
    fileId: string;
    chunkSize: number;
    chunkCount: number;
  };

  for (let index = 0; index < chunkCount; index += 1) {
    if (handle.isCancelled?.()) {
      await fetch(`/api/files/${fileId}`, { method: "DELETE" }).catch(() => {});
      throw new UploadError("Cancelled", false);
    }

    const start = index * chunkSize;
    const slice = file.slice(start, Math.min(start + chunkSize, file.size));

    let sent = false;
    for (let attempt = 0; attempt < MAX_RETRIES && !sent; attempt += 1) {
      try {
        const response = await fetch(`/api/files/${fileId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/octet-stream",
            "x-chunk-index": String(index),
          },
          body: slice,
        });

        if (response.ok) {
          sent = true;
        } else if (response.status >= 400 && response.status < 500) {
          // The server has rejected this upload outright; retrying cannot help.
          const body = await response.json().catch(() => ({}));
          throw new UploadError(body.error ?? "Upload rejected.", false);
        }
      } catch (error) {
        if (error instanceof UploadError) throw error;
        // Network failure — fall through to the backoff.
      }

      if (!sent && attempt < MAX_RETRIES - 1) {
        await new Promise((resolve) => setTimeout(resolve, 400 * 2 ** attempt));
      }
    }

    if (!sent) throw new UploadError("Connection lost. Try again.", true);

    handle.onProgress?.(Math.min(start + chunkSize, file.size), file.size);
  }

  return fileId;
}

/**
 * Uploads a list sequentially, reporting which file is in flight. Sequential
 * rather than parallel here because the composer's progress line names one
 * file at a time.
 */
export async function uploadFiles(
  dropId: string,
  files: File[],
  onFileProgress?: (completed: number, total: number, name: string) => void
): Promise<{ uploaded: string[]; failed: Array<{ name: string; reason: string }> }> {
  const uploaded: string[] = [];
  const failed: Array<{ name: string; reason: string }> = [];

  for (const [index, file] of files.entries()) {
    onFileProgress?.(index, files.length, file.name);
    try {
      uploaded.push(await uploadFile(dropId, file));
    } catch (error) {
      failed.push({
        name: file.name,
        reason: error instanceof Error ? error.message : "Upload failed",
      });
    }
  }

  return { uploaded, failed };
}
