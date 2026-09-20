/**
 * The hero's explanatory graphic: content goes in, a code comes out, the link
 * goes wherever you send it.
 *
 * Ink line-art on the canvas, per DESIGN.md, with the chromatic accents used
 * only as small illustration touches. Pure inline SVG — no image request, it
 * scales crisply, and it inherits the theme through `currentColor` and the
 * colour tokens.
 */
export function FlowGraphic({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 132"
      role="img"
      aria-label="Files and text go in, a short code comes out, and the link is shared."
      className={className}
      fill="none"
    >
      {/* ------------------------------------------------ 1. content in -- */}
      <g className="text-ink [animation-delay:0ms] motion-safe:animate-float">
        {/* back cards of the stack */}
        <rect
          x="26" y="30" width="52" height="66" rx="6"
          className="fill-surface stroke-line-strong" strokeWidth="1.5"
          transform="rotate(-8 52 63)"
        />
        <rect
          x="32" y="28" width="52" height="66" rx="6"
          className="fill-surface stroke-line-strong" strokeWidth="1.5"
          transform="rotate(-3 58 61)"
        />
        {/* front card */}
        <rect
          x="38" y="26" width="52" height="66" rx="6"
          className="fill-surface stroke-ink" strokeWidth="1.6"
        />
        {/* text lines */}
        <path
          d="M48 44h32M48 54h32M48 64h20"
          className="stroke-mute" strokeWidth="2.5" strokeLinecap="round"
        />
        {/* a photo chip, tinted so the "any file type" idea reads at a glance */}
        <rect x="48" y="72" width="14" height="11" rx="2" className="fill-violet/70" />
        <rect x="66" y="72" width="14" height="11" rx="2" className="fill-cyan/70" />
      </g>

      {/* --------------------------------------------- connector 1 ------- */}
      <g>
        <path
          d="M100 60h56"
          className="stroke-line-strong" strokeWidth="1.5"
          strokeLinecap="round" strokeDasharray="3 5"
        />
        <circle
          r="3" cx="102" cy="60"
          className="fill-accent motion-safe:animate-[trace_3.2s_ease-in-out_infinite]"
          style={{ ["--trace-distance" as string]: "52px" }}
        />
      </g>

      {/* -------------------------------------------------- 2. the code -- */}
      <g className="motion-safe:animate-float [animation-delay:700ms]">
        <rect
          x="164" y="38" width="94" height="44" rx="8"
          className="fill-surface stroke-ink" strokeWidth="1.6"
        />
        {/* punched tear-off edge, echoing the share stub */}
        <path
          d="M164 60h94"
          className="stroke-line" strokeWidth="1.2" strokeDasharray="2 3"
        />
        <text
          x="211" y="55"
          textAnchor="middle"
          className="fill-ink font-mono text-[13px] font-semibold"
          style={{ letterSpacing: "0.04em" }}
        >
          a7k2wq
        </text>
        <text
          x="211" y="74"
          textAnchor="middle"
          className="fill-mute font-mono text-[7px]"
          style={{ letterSpacing: "0.14em" }}
        >
          DROP CODE
        </text>
      </g>

      {/* --------------------------------------------- connector 2 ------- */}
      <g>
        <path
          d="M268 60h56"
          className="stroke-line-strong" strokeWidth="1.5"
          strokeLinecap="round" strokeDasharray="3 5"
        />
        <circle
          r="3" cx="270" cy="60"
          className="fill-accent motion-safe:animate-[trace_3.2s_ease-in-out_infinite]"
          style={{ ["--trace-distance" as string]: "52px", animationDelay: "1.1s" }}
        />
      </g>

      {/* ------------------------------------------------- 3. shared out -- */}
      <g className="motion-safe:animate-float [animation-delay:1400ms]">
        <rect
          x="332" y="30" width="58" height="58" rx="8"
          className="fill-surface stroke-ink" strokeWidth="1.6"
        />
        {/* a suggestion of a QR, not a real one */}
        <g className="fill-ink">
          <rect x="342" y="40" width="12" height="12" rx="2" />
          <rect x="368" y="40" width="12" height="12" rx="2" />
          <rect x="342" y="66" width="12" height="12" rx="2" />
          <rect x="360" y="58" width="5" height="5" />
          <rect x="370" y="58" width="5" height="5" />
          <rect x="360" y="68" width="5" height="5" />
          <rect x="370" y="68" width="5" height="5" />
          <rect x="365" y="63" width="5" height="5" />
        </g>
        {/* the "sent" pulse */}
        <circle
          cx="386" cy="34" r="5"
          className="fill-accent"
        />
        <circle
          cx="386" cy="34" r="5"
          className="fill-accent motion-safe:animate-ping-soft"
          style={{ transformOrigin: "386px 34px" }}
        />
      </g>
    </svg>
  );
}
