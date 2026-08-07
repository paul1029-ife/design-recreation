"use client";

import { useCallback, useEffect, useId, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";

import { cn } from "@/lib/cn";
import { duration, ease, spring } from "@/lib/motion";
import { PreviewSurface } from "@/components/preview/PreviewSurface";

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Accessible dialog.
 *
 * The previous implementation had none of the six behaviours a dialog owes a
 * keyboard user: no role, no aria-modal, no Escape, no focus trap, no focus
 * restoration, and no scroll lock. Tab walked focus behind the overlay into
 * the page underneath, with no way back.
 */
export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const reduce = useReducedMotion();

  // Remember what had focus so it can be handed back on close.
  useEffect(() => {
    if (open) restoreRef.current = document.activeElement as HTMLElement | null;
  }, [open]);

  // Move focus into the panel once it exists.
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    const first = panel.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel).focus();
  }, [open]);

  // Lock background scroll without the layout jump from a vanishing scrollbar.
  useEffect(() => {
    if (!open) return;
    const { overflow, paddingRight } = document.body.style;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [open]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) {
        event.preventDefault();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      // Wrap at both ends so focus can never leave the dialog.
      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  return (
    <AnimatePresence onExitComplete={() => restoreRef.current?.focus()}>
      {open && (
        <motion.div
          // AnimatePresence tracks children by key. Without one the exit never
          // resolves and the overlay stays mounted after `open` goes false.
          key="modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.01 : duration.fast, ease: ease.out }}
          onKeyDown={handleKeyDown}
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
            transition={reduce ? { duration: 0.01 } : spring.smooth}
            className={cn(
              "relative flex max-h-[85dvh] w-full max-w-2xl flex-col",
              "rounded-2xl border border-border bg-surface p-2 shadow-modal",
              "focus:outline-none",
              className,
            )}
            style={{ willChange: "transform" }}
          >
            {/* No divider rule: the recessed canvas below already separates
                the label from the specimen, so a line is redundant weight. */}
            <header className="flex items-center justify-between gap-4 px-2 py-1.5">
              <h2 id={titleId} className="text-sm text-content-subtle">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="focus-ring grid size-6 shrink-0 cursor-pointer place-items-center rounded-md text-content-subtle transition-colors hover:bg-surface-hover hover:text-content"
              >
                <X className="size-3.5" strokeWidth={2} aria-hidden="true" />
              </button>
            </header>

            <PreviewSurface className="scrollbar-hide flex-1 overflow-y-auto">
              {children}
            </PreviewSurface>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Modal;
