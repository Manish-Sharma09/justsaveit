/**
 * Line-art vignettes for the "how it works" tiles.
 *
 * Deliberately drawn rather than picked from an icon set: three small scenes
 * carry the sequence far better than three generic glyphs, and ink-on-canvas
 * vector art is exactly what DESIGN.md asks illustrations to be. Each reacts
 * to hover on the enclosing `.group`.
 */

const frame = "overflow-visible";

/** 1 — things falling into the drop target. */
export function ArtDropIn({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 72" aria-hidden className={`${frame} ${className}`} fill="none">
      {/* the target */}
      <rect
        x="26" y="34" width="68" height="32" rx="7"
        className="fill-surface stroke-ink transition-colors" strokeWidth="1.6"
        strokeDasharray="4 4"
      />
      {/* falling items — each drifts on its own clock */}
      <g className="transition-transform duration-500 ease-[var(--ease-out-quint)] group-hover:-translate-y-1">
        <rect
          x="36" y="8" width="18" height="22" rx="3"
          className="fill-surface stroke-line-strong" strokeWidth="1.5"
          transform="rotate(-12 45 19)"
        />
        <rect
          x="58" y="4" width="18" height="22" rx="3"
          className="fill-surface stroke-ink" strokeWidth="1.5"
          transform="rotate(6 67 15)"
        />
        <rect x="62" y="10" width="10" height="7" rx="1.5" className="fill-violet/70" transform="rotate(6 67 13)" />
        <rect
          x="80" y="12" width="14" height="18" rx="3"
          className="fill-surface stroke-line-strong" strokeWidth="1.5"
          transform="rotate(14 87 21)"
        />
      </g>
      {/* motion ticks */}
      <path
        d="M30 22v6M96 18v6"
        className="stroke-line-strong" strokeWidth="1.5" strokeLinecap="round"
      />
    </svg>
  );
}

/** 2 — the stub tearing off, code exposed. */
export function ArtGetCode({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 72" aria-hidden className={`${frame} ${className}`} fill="none">
      <rect
        x="18" y="12" width="84" height="48" rx="7"
        className="fill-surface stroke-ink" strokeWidth="1.6"
      />
      {/* perforation */}
      <path
        d="M18 38h84"
        className="stroke-line-strong" strokeWidth="1.3" strokeDasharray="3 4"
      />
      {/* the code, which brightens on hover */}
      <text
        x="60" y="31"
        textAnchor="middle"
        className="fill-ink font-mono text-[14px] font-semibold"
        style={{ letterSpacing: "0.06em" }}
      >
        a7k2wq
      </text>
      <path
        d="M32 48h24M66 48h22"
        className="stroke-mute" strokeWidth="2.5" strokeLinecap="round"
      />
      {/* the torn corner lifts on hover */}
      <path
        d="M102 38v15a7 7 0 0 1-7 7H80"
        className="stroke-accent transition-transform duration-500 ease-[var(--ease-out-quint)] group-hover:translate-x-1 group-hover:-translate-y-0.5"
        strokeWidth="1.8" strokeLinecap="round"
      />
    </svg>
  );
}

/** 3 — the link going out to several places at once. */
export function ArtSendOn({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 72" aria-hidden className={`${frame} ${className}`} fill="none">
      {/* source */}
      <rect
        x="10" y="26" width="30" height="22" rx="5"
        className="fill-surface stroke-ink" strokeWidth="1.6"
      />
      <path
        d="M18 37h14"
        className="stroke-accent" strokeWidth="2" strokeLinecap="round"
      />
      {/* fan-out paths */}
      <g className="stroke-line-strong" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 4">
        <path d="M44 33c16-12 26-14 38-14" />
        <path d="M44 37h38" />
        <path d="M44 41c16 12 26 14 38 14" />
      </g>
      {/* recipients — they spread apart slightly on hover */}
      <g className="transition-transform duration-500 ease-[var(--ease-out-quint)] group-hover:translate-x-1">
        <circle cx="92" cy="19" r="9" className="fill-surface stroke-ink" strokeWidth="1.6" />
        <circle cx="92" cy="19" r="3" className="fill-cyan" />
        <circle cx="92" cy="37" r="9" className="fill-surface stroke-ink" strokeWidth="1.6" />
        <circle cx="92" cy="37" r="3" className="fill-accent" />
        <circle cx="92" cy="55" r="9" className="fill-surface stroke-ink" strokeWidth="1.6" />
        <circle cx="92" cy="55" r="3" className="fill-magenta" />
      </g>
    </svg>
  );
}

/** Empty-file-list vignette: an open, waiting tray. */
export function ArtEmptyFiles({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 64" aria-hidden className={className} fill="none">
      <path
        d="M14 26V14a5 5 0 0 1 5-5h16l5 7h23a5 5 0 0 1 5 5v5"
        className="stroke-line-strong" strokeWidth="1.6" strokeLinecap="round"
      />
      <path
        d="M8 28h80l-7 24a5 5 0 0 1-5 4H20a5 5 0 0 1-5-4Z"
        className="fill-surface stroke-ink" strokeWidth="1.6" strokeLinejoin="round"
      />
      <path
        d="M48 36v12M42 42h12"
        className="stroke-mute" strokeWidth="2" strokeLinecap="round"
      />
    </svg>
  );
}
