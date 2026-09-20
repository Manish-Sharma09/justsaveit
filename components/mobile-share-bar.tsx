"use client";

import * as React from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { useCopy } from "@/hooks/use-copy";
import { useToast } from "@/components/ui/toast";

/**
 * Sticky share bar, phones only.
 *
 * On a small screen the manifest stub scrolls away as soon as you look at the
 * files, which leaves the one action the page exists for out of reach. This
 * pins copy and share to the bottom, clear of the home indicator.
 */
export function MobileShareBar({ url, dropId }: { url: string; dropId: string }) {
  const { copy, copied } = useCopy();
  const { toast } = useToast();
  const [canShare, setCanShare] = React.useState(false);

  React.useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  const handleCopy = async () => {
    const ok = await copy(url);
    toast(ok ? "Link copied to clipboard" : "Could not copy the link", {
      tone: ok ? "success" : "error",
    });
  };

  const handleShare = async () => {
    try {
      await navigator.share({ title: "Just Save It", text: `Here's a drop: ${dropId}`, url });
    } catch (error) {
      if ((error as Error)?.name !== "AbortError") await handleCopy();
    }
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-70 border-t border-line bg-surface/92 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center gap-2 px-4 pt-2.5">
        <button
          type="button"
          onClick={handleCopy}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-sm bg-ink text-sm font-medium text-on-ink transition-colors active:bg-ink/85 [&_svg]:size-4"
        >
          {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
          {copied ? "Copied" : "Copy link"}
        </button>

        {canShare && (
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share this drop"
            className="flex size-11 shrink-0 items-center justify-center rounded-sm border border-line bg-surface text-ink transition-colors active:bg-sunken [&_svg]:size-4"
          >
            <Share2 aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}
