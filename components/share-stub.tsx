"use client";

import * as React from "react";
import {
  ArrowUpRight,
  Check,
  Clock,
  Copy,
  Download,
  Flame,
  Link2,
  Lock,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode } from "@/components/qr-code";
import { useCopy } from "@/hooks/use-copy";
import { useToast } from "@/components/ui/toast";
import { formatBytes, pluralise } from "@/lib/format";
import { RelativeTime } from "@/components/relative-time";
import { cn } from "@/lib/utils";

/**
 * The share artefact.
 *
 * This is the product's signature object: the drop is presented as a printed
 * manifest stub — mono code set large, hairline rules, a punched tear-off edge
 * — rather than as another rounded gradient card. It is what people screenshot
 * and what the QR is attached to.
 */
export function ShareStub({
  dropId,
  url,
  fileCount,
  totalBytes,
  expiresAt,
  hasPassword,
  burnAfterRead,
  className,
  compact = false,
}: {
  dropId: string;
  url: string;
  fileCount: number;
  totalBytes: number;
  expiresAt: string | null;
  hasPassword: boolean;
  burnAfterRead: boolean;
  className?: string;
  compact?: boolean;
}) {
  const { copy, copied } = useCopy();
  const { toast } = useToast();
  const [qrDataUrl, setQrDataUrl] = React.useState<string | null>(null);
  const [canShare, setCanShare] = React.useState(false);

  React.useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  const handleCopy = async () => {
    const ok = await copy(url);
    toast(
      ok ? "Link copied to clipboard" : "Could not copy — select the link instead",
      { tone: ok ? "success" : "error" }
    );
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: "Just Save It",
        text: `Here's a drop: ${dropId}`,
        url,
      });
    } catch (error) {
      // An aborted share is a normal user action, not a failure.
      if ((error as Error)?.name !== "AbortError") {
        toast("Sharing was not available. The link is copied instead.", { tone: "info" });
        await copy(url);
      }
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const anchor = document.createElement("a");
    anchor.href = qrDataUrl;
    anchor.download = `justsaveit-${dropId}.png`;
    anchor.click();
    toast("QR code saved");
  };

  return (
    <section
      aria-label="Share this drop"
      className={cn(
        "overflow-hidden rounded-lg border border-line bg-surface shadow-whisper",
        className
      )}
    >
      {/* ---------------------------------------------------- code + QR -- */}
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
        <div className="min-w-0 flex-1">
          <p className="eyebrow">Drop code</p>
          <p
            className="mt-1.5 truncate font-mono text-[clamp(1.75rem,7vw,2.5rem)] font-semibold leading-none tracking-[-0.03em] text-ink"
            data-numeric
            translate="no"
          >
            {dropId}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {hasPassword && (
              <Badge tone="accent">
                <Lock aria-hidden />
                Password
              </Badge>
            )}
            {burnAfterRead && (
              <Badge tone="warn">
                <Flame aria-hidden />
                Burns after read
              </Badge>
            )}
            {expiresAt ? (
              <Badge tone="neutral">
                <Clock aria-hidden />
                <RelativeTime value={expiresAt} prefix="Expires" />
              </Badge>
            ) : (
              <Badge tone="neutral">
                <Clock aria-hidden />
                No expiry
              </Badge>
            )}
          </div>
        </div>

        {!compact && (
          <div className="flex items-center gap-3 sm:flex-col sm:items-end">
            <QrCode
              value={url}
              size={112}
              onReady={setQrDataUrl}
              className="shrink-0 rounded-sm border border-line p-1.5"
            />
            <Button
              variant="subtle"
              size="xs"
              onClick={handleDownloadQr}
              disabled={!qrDataUrl}
            >
              <Download aria-hidden />
              Save QR
            </Button>
          </div>
        )}
      </div>

      {/* ------------------------------------------------- punched rule -- */}
      <div aria-hidden className="relative h-px bg-line">
        <div className="punched absolute inset-x-0 -top-px h-0.5 bg-canvas" />
      </div>

      {/* ------------------------------------------------------- the URL -- */}
      <div className="space-y-3 p-5 sm:p-6">
        <div className="flex items-stretch gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-sm border border-line bg-canvas px-3 py-2.5">
            <Link2 aria-hidden className="size-4 shrink-0 text-faint" />
            <span
              className="truncate font-mono text-[13px] text-body"
              title={url}
              translate="no"
            >
              {url}
            </span>
          </div>
          <Button
            variant="solid"
            onClick={handleCopy}
            aria-label={copied ? "Link copied" : "Copy link"}
            className="shrink-0 px-3.5"
          >
            {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canShare && (
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 aria-hidden />
              Share
            </Button>
          )}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center gap-2 rounded-sm border border-line bg-surface px-3 text-[13px] font-medium text-ink transition-colors hover:border-line-strong hover:bg-sunken [&_svg]:size-4"
          >
            <ArrowUpRight aria-hidden />
            Open
          </a>

          <p className="ml-auto font-mono text-xs text-mute" data-numeric>
            {fileCount > 0
              ? `${pluralise(fileCount, "file")} · ${formatBytes(totalBytes)}`
              : "Text only"}
          </p>
        </div>
      </div>
    </section>
  );
}
