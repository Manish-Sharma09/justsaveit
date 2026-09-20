"use client";

import * as React from "react";

/**
 * Reveals its children as they scroll into view.
 *
 * IntersectionObserver rather than a scroll listener, so nothing runs on the
 * main thread between intersections, and each element is unobserved once shown
 * — the effect plays once and then costs nothing.
 *
 * The hidden start state lives in CSS behind `@media (scripting: enabled)`, so
 * a page without JavaScript renders everything visible.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className,
}: {
  children: React.ReactNode;
  /** Stagger, in milliseconds, for items revealed as a group. */
  delay?: number;
  as?: React.ElementType;
  className?: string;
}) {
  const ref = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Anything already on screen at mount is shown immediately rather than
    // waiting for a scroll that may never come.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        node.dataset.reveal = "shown";
        observer.unobserve(node);
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal="pending"
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}
      className={className}
    >
      {children}
    </Tag>
  );
}
