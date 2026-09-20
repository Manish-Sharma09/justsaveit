"use client";

import * as React from "react";
import { Check, Download, Eye, Link2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileIcon } from "@/components/file-icon";
import { ConfirmDialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useCopy } from "@/hooks/use-copy";
import { formatBytes } from "@/lib/format";
import { extensionOf, isPreviewable, KIND_LABEL } from "@/lib/filetypes";
import type { DropFile } from "@/lib/drop-types";
import { cn } from "@/lib/utils";

/** Thumbnail: the real image for image files, a typed glyph for everything else. */
function Thumb({ file }: { file: DropFile }) {
  const [failed, setFailed] = React.useState(false);

  if (file.kind === "image" && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- streamed from our own API
      <img
        src={`/api/files/${file.id}`}
        alt=""
        width={44}
        height={44}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className="size-full rounded-xs object-cover"
      />
    );
  }

  return (
    <span className="flex size-full flex-col items-center justify-center gap-0.5 rounded-xs bg-sunken text-mute">
      <FileIcon kind={file.kind} className="size-4" />
      <span className="font-mono text-[9px] font-medium tracking-[0.06em]">
        {extensionOf(file.name)}
      </span>
    </span>
  );
}

export function FileList({
  files,
  onPreview,
  onDelete,
  readOnly = false,
  className,
}: {
  files: DropFile[];
  onPreview: (file: DropFile) => void;
  onDelete?: (file: DropFile) => Promise<void>;
  readOnly?: boolean;
  className?: string;
}) {
  const { toast } = useToast();
  const { copy } = useCopy();
  const [pendingDelete, setPendingDelete] = React.useState<DropFile | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const copyDirectLink = async (file: DropFile) => {
    const url = `${window.location.origin}/api/files/${file.id}`;
    const ok = await copy(url);
    if (ok) {
      setCopiedId(file.id);
      setTimeout(() => setCopiedId((id) => (id === file.id ? null : id)), 2000);
    }
    toast(ok ? "Direct link copied" : "Could not copy the link", {
      tone: ok ? "success" : "error",
    });
  };

  const confirmDelete = async () => {
    if (!pendingDelete || !onDelete) return;
    setDeleting(true);
    try {
      await onDelete(pendingDelete);
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  if (files.length === 0) return null;

  return (
    <>
      <ul className={cn("divide-y divide-line rounded-md border border-line bg-surface", className)}>
        {files.map((file) => {
          const previewable = isPreviewable(file.kind);
          return (
            <li
              key={file.id}
              className="group flex animate-pop items-center gap-3 p-2.5 transition-colors first:rounded-t-md last:rounded-b-md hover:bg-canvas sm:gap-3.5 sm:p-3"
            >
              <div className="size-10 shrink-0 overflow-hidden rounded-xs border border-line transition-transform duration-200 group-hover:scale-[1.04] sm:size-11">
                <Thumb file={file} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink" title={file.name}>
                  {file.name}
                </p>
                <p className="mt-0.5 font-mono text-xs text-mute" data-numeric>
                  {KIND_LABEL[file.kind]} · {formatBytes(file.size)}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-0.5">
                {previewable && (
                  <Button
                    variant="subtle"
                    size="sm"
                    icon
                    onClick={() => onPreview(file)}
                    aria-label={`Preview ${file.name}`}
                    title="Preview"
                  >
                    <Eye aria-hidden />
                  </Button>
                )}

                <Button
                  variant="subtle"
                  size="sm"
                  icon
                  onClick={() => copyDirectLink(file)}
                  aria-label={`Copy direct link to ${file.name}`}
                  title="Copy direct link"
                >
                  {copiedId === file.id ? (
                    <Check aria-hidden className="text-accent" />
                  ) : (
                    <Link2 aria-hidden />
                  )}
                </Button>

                <a
                  href={`/api/files/${file.id}?download=1`}
                  download={file.name}
                  aria-label={`Download ${file.name}`}
                  title="Download"
                  className="inline-flex size-8 items-center justify-center rounded-sm text-body transition-colors hover:bg-sunken hover:text-ink [&_svg]:size-4"
                >
                  <Download aria-hidden />
                </a>

                {!readOnly && onDelete && (
                  <Button
                    variant="subtle"
                    size="sm"
                    icon
                    onClick={() => setPendingDelete(file)}
                    aria-label={`Remove ${file.name}`}
                    title="Remove"
                    className="hover:bg-danger-soft hover:text-danger"
                  >
                    <Trash2 aria-hidden />
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Remove this file?"
        description={`"${pendingDelete?.name}" will be deleted from this drop for everyone. This cannot be undone.`}
        confirmLabel="Remove file"
      />
    </>
  );
}

/**
 * Sequential downloads. Zipping would need a bundling library and would hold
 * the whole archive in memory, so the browser's own download queue is used
 * instead — each file is requested in turn with a small gap so popup blockers
 * and download managers keep up.
 */
export function downloadAll(files: DropFile[]) {
  files.forEach((file, index) => {
    setTimeout(() => {
      const anchor = document.createElement("a");
      anchor.href = `/api/files/${file.id}?download=1`;
      anchor.download = file.name;
      anchor.rel = "noopener";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    }, index * 350);
  });
}
