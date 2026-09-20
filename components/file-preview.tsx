"use client";

import * as React from "react";
import { Download, ExternalLink } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { FileIcon } from "@/components/file-icon";
import { formatBytes } from "@/lib/format";
import { KIND_LABEL } from "@/lib/filetypes";
import type { DropFile } from "@/lib/drop-types";

/**
 * Inline preview for the types browsers can render natively: images, video,
 * audio and PDF. Everything else gets an honest "no preview" panel with a
 * download action rather than a broken embed.
 */
export function FilePreview({
  file,
  open,
  onClose,
}: {
  file: DropFile | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!file) return null;

  const src = `/api/files/${file.id}`;
  const downloadHref = `${src}?download=1`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={file.name}
      description={`${KIND_LABEL[file.kind]} · ${formatBytes(file.size)}`}
      size="full"
      footer={
        <>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center gap-2 rounded-sm px-3 text-[13px] font-medium text-body transition-colors hover:bg-sunken hover:text-ink [&_svg]:size-4"
          >
            <ExternalLink aria-hidden />
            Open in new tab
          </a>
          <a
            href={downloadHref}
            download={file.name}
            className="inline-flex h-8 items-center gap-2 rounded-sm bg-ink px-3 text-[13px] font-medium text-on-ink transition-colors hover:bg-ink/88 [&_svg]:size-4"
          >
            <Download aria-hidden />
            Download
          </a>
        </>
      }
    >
      <div className="flex min-h-50 items-center justify-center rounded-md border border-line bg-canvas p-2">
        {file.kind === "image" && (
          // eslint-disable-next-line @next/next/no-img-element -- streamed from our own API, dimensions unknown
          <img
            src={src}
            alt={file.name}
            className="max-h-[60dvh] w-auto max-w-full rounded-xs object-contain"
          />
        )}

        {file.kind === "video" && (
          <video
            src={src}
            controls
            preload="metadata"
            className="max-h-[60dvh] w-full rounded-xs bg-black"
          >
            Your browser cannot play this video.
          </video>
        )}

        {file.kind === "audio" && (
          <div className="w-full px-2 py-6">
            <audio src={src} controls preload="metadata" className="w-full">
              Your browser cannot play this audio.
            </audio>
          </div>
        )}

        {file.kind === "pdf" && (
          <object
            data={src}
            type="application/pdf"
            className="h-[60dvh] w-full rounded-xs"
            aria-label={file.name}
          >
            <p className="p-6 text-center text-sm text-body">
              This browser cannot display the PDF inline.{" "}
              <a href={downloadHref} className="text-accent underline">
                Download it instead
              </a>
              .
            </p>
          </object>
        )}

        {!["image", "video", "audio", "pdf"].includes(file.kind) && (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <span className="flex size-12 items-center justify-center rounded-full border border-line bg-surface text-mute">
              <FileIcon kind={file.kind} className="size-5" />
            </span>
            <p className="text-sm font-medium text-ink">No preview for this type</p>
            <p className="max-w-xs text-sm text-mute">
              {KIND_LABEL[file.kind]} files download rather than open in the browser.
            </p>
          </div>
        )}
      </div>
    </Dialog>
  );
}
