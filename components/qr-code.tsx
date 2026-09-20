"use client";

import * as React from "react";
import QRCode from "qrcode";

/**
 * QR code rendered locally with the `qrcode` package (MIT). Nothing leaves the
 * browser — in particular the drop URL is never sent to a QR-image service.
 */
export function QrCode({
  value,
  size = 160,
  className,
  onReady,
}: {
  value: string;
  size?: number;
  className?: string;
  onReady?: (dataUrl: string) => void;
}) {
  const [dataUrl, setDataUrl] = React.useState<string | null>(null);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    let active = true;

    // Rendered at 3x and scaled down so it stays crisp on high-DPI screens
    // and is still usable when saved as an image.
    QRCode.toDataURL(value, {
      width: size * 3,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#171717ff", light: "#ffffffff" },
    })
      .then((url) => {
        if (!active) return;
        setDataUrl(url);
        setFailed(false);
        onReady?.(url);
      })
      .catch(() => active && setFailed(true));

    return () => {
      active = false;
    };
  }, [value, size, onReady]);

  if (failed) {
    return (
      <div
        className={className}
        style={{ width: size, height: size }}
        role="img"
        aria-label="QR code unavailable"
      >
        <div className="flex size-full items-center justify-center rounded-sm border border-line bg-sunken p-2 text-center text-xs text-mute">
          QR unavailable
        </div>
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{ width: size, height: size }}
      // Reserve the box before the image resolves so nothing shifts.
      aria-busy={!dataUrl}
    >
      {dataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- data: URL, generated client-side
        <img
          src={dataUrl}
          alt={`QR code linking to ${value}`}
          width={size}
          height={size}
          className="size-full rounded-xs bg-white"
        />
      ) : (
        <div className="size-full animate-pulse rounded-xs bg-sunken" />
      )}
    </div>
  );
}
