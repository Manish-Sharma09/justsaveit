"use client";

import * as React from "react";

/**
 * The last resort: an error thrown by the root layout itself.
 *
 * This file replaces the whole document, so it has to supply its own `<html>`
 * and `<body>`. Everything here is deliberately self-contained — no imported
 * components, no Tailwind classes, no webfont, just one inline stylesheet with
 * the design tokens hardcoded.
 *
 * That looks like duplication, and it is. But the only way to reach this
 * screen is for the layout that loads the stylesheet and the fonts to have
 * failed, so anything this page depends on is a thing that might already be
 * broken. A plain page that always renders beats a styled one that sometimes
 * does not.
 */
const CSS = `
  :root {
    --canvas: #fafafa; --surface: #ffffff; --ink: #171717;
    --body: #4d4d4d; --faint: #a1a1a1; --line: #e7e7e7; --danger: #ee0000;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --canvas: #0a0a0a; --surface: #141414; --ink: #ededed;
      --body: #b4b4b4; --faint: #6e6e6e; --line: #262626; --danger: #ff5c5c;
    }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100dvh;
    display: grid;
    place-items: center;
    padding: 24px;
    background: var(--canvas);
    color: var(--ink);
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .card { width: 100%; max-width: 27rem; text-align: center; }
  .mark {
    width: 48px; height: 48px; margin: 0 auto;
    display: grid; place-items: center;
    border: 1px solid var(--line); border-radius: 999px;
    background: var(--surface); color: var(--danger);
    font-size: 22px; line-height: 1;
  }
  .code {
    margin: 20px 0 0;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--faint);
  }
  h1 {
    margin: 8px 0 0;
    font-size: 2rem; line-height: 1.12; letter-spacing: -0.04em; font-weight: 600;
  }
  p { margin: 12px auto 0; max-width: 22rem; font-size: 15px; line-height: 1.6; color: var(--body); }
  .actions { margin-top: 28px; display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
  button, a.btn {
    display: inline-flex; align-items: center; height: 40px; padding: 0 16px;
    border-radius: 6px; border: 1px solid var(--line);
    font: inherit; font-size: 14px; font-weight: 500;
    cursor: pointer; text-decoration: none;
    background: var(--surface); color: var(--ink);
  }
  button.primary { background: var(--ink); color: var(--canvas); border-color: var(--ink); }
  .ref {
    margin-top: 24px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 11px; color: var(--faint);
  }
`;

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />

        <div className="card">
          <div className="mark" aria-hidden>
            !
          </div>

          <p className="code">Error 500</p>
          <h1>This site is having a moment</h1>
          <p>
            Something failed before the page could load. Reloading usually
            clears it. If it does not, the service is probably down and the
            fault is ours.
          </p>

          <div className="actions">
            <button type="button" className="primary" onClick={reset}>
              Try again
            </button>
            {/* A plain anchor, not next/link, on purpose: a client-side
                navigation goes through the router, and the router is inside
                the tree that just failed. A full document load is the escape
                hatch. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a className="btn" href="/">
              Go to the home page
            </a>
          </div>

          {error.digest && <p className="ref">Reference {error.digest}</p>}
        </div>
      </body>
    </html>
  );
}
