"use client";

import * as React from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

const OPTIONS: Array<{ value: Theme; label: string; Icon: typeof Sun }> = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
];

/** Three-state theme control. The applied class is set pre-paint in layout.tsx. */
export function ThemeToggle() {
  const [theme, setTheme] = React.useState<Theme>("system");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("jsi-theme") as Theme | null;
      if (stored) setTheme(stored);
    } catch {
      /* ignore */
    }
  }, []);

  const apply = React.useCallback((next: Theme) => {
    setTheme(next);
    try {
      localStorage.setItem("jsi-theme", next);
    } catch {
      /* ignore */
    }
    const dark =
      next === "dark" ||
      (next === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.dataset.theme = next;
  }, []);

  // Follow the OS while "system" is selected.
  React.useEffect(() => {
    if (theme !== "system") return;
    const query = matchMedia("(prefers-color-scheme: dark)");
    const sync = () => document.documentElement.classList.toggle("dark", query.matches);
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, [theme]);

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className="inline-flex items-center gap-0.5 rounded-sm border border-line bg-surface p-0.5"
    >
      {OPTIONS.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={mounted ? theme === value : undefined}
          aria-label={label}
          title={label}
          onClick={() => apply(value)}
          className={cn(
            "inline-flex size-7 items-center justify-center rounded-xs transition-colors",
            mounted && theme === value
              ? "bg-ink text-on-ink"
              : "text-mute hover:bg-sunken hover:text-ink"
          )}
        >
          <Icon aria-hidden className="size-3.5" />
        </button>
      ))}
    </div>
  );
}
