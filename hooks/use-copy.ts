"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Clipboard write with a graceful fallback.
 *
 * `navigator.clipboard` needs a secure context, so on plain http (a LAN IP
 * during testing, for example) we fall back to a hidden textarea and
 * `execCommand`, which still works in every current browser.
 */
export function useCopy(resetAfter = 2000) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      let ok = false;

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
          ok = true;
        }
      } catch {
        ok = false;
      }

      if (!ok) {
        try {
          const area = document.createElement("textarea");
          area.value = text;
          area.setAttribute("readonly", "");
          area.style.cssText = "position:fixed;top:-9999px;opacity:0";
          document.body.appendChild(area);
          area.select();
          ok = document.execCommand("copy");
          document.body.removeChild(area);
        } catch {
          ok = false;
        }
      }

      if (ok) {
        setCopied(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(false), resetAfter);
      }
      return ok;
    },
    [resetAfter]
  );

  return { copy, copied };
}
