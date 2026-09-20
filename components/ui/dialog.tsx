"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

/**
 * Modal built on the native <dialog> element.
 *
 * `showModal()` gives focus trapping, inertness of the page behind, Escape to
 * close and the top layer for free — all things a hand-rolled modal usually
 * gets wrong, and all without a dependency.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "full";
  className?: string;
}) {
  const ref = React.useRef<HTMLDialogElement>(null);
  const titleId = React.useId();
  const descriptionId = React.useId();

  React.useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  // Escape and the backdrop both route through the same close handler.
  React.useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    const handleCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };
    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClick={(event) => {
        // Clicks land on the dialog itself only when they hit the backdrop.
        if (event.target === ref.current) onClose();
      }}
      className={cn(
        "m-auto w-[calc(100%-2rem)] bg-transparent p-0 text-ink backdrop:bg-ink/35",
        "backdrop:backdrop-blur-[2px] open:animate-rise",
        size === "sm" && "max-w-sm",
        size === "md" && "max-w-lg",
        size === "lg" && "max-w-2xl",
        size === "full" && "max-w-5xl",
        className
      )}
    >
      {open && (
        <div className="flex max-h-[85dvh] flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-lift">
          <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
            <div className="min-w-0">
              <h2
                id={titleId}
                className="text-heading truncate"
              >
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className="mt-1 text-sm text-body">
                  {description}
                </p>
              )}
            </div>
            <Button
              variant="subtle"
              size="sm"
              icon
              onClick={onClose}
              aria-label="Close dialog"
              className="-mr-1.5 -mt-0.5"
            >
              <X aria-hidden />
            </Button>
          </header>

          {children && (
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
              {children}
            </div>
          )}

          {footer && (
            <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-canvas px-5 py-3.5">
              {footer}
            </footer>
          )}
        </div>
      )}
    </dialog>
  );
}

/** Confirmation prompt for destructive actions. */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Delete",
  loading = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="solid"
            size="sm"
            onClick={onConfirm}
            loading={loading}
            className="bg-danger text-white hover:bg-danger-deep"
          >
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}
