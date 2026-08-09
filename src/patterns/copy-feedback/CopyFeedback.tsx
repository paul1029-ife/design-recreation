"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";

import { cn } from "@/lib/cn";
import { duration, ease, spring } from "@/lib/motion";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export interface CopyFeedbackProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "onCopy" | "onError"> {
  /** The text placed on the clipboard, and shown when idle. */
  value: string;
  /** Trigger text. @default "Copy" */
  actionLabel?: string;
  /** Confirmation text. @default "Copied!" */
  confirmLabel?: string;
  /** Shown if the clipboard write is refused. @default "Press ⌘C to copy" */
  errorLabel?: string;
  /** How long the confirmation is held, ms. Drives the fill too. @default 2000 */
  holdMs?: number;
  onCopy?: (value: string) => void;
}

type Status = "idle" | "copied" | "error";

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * A value with a copy control that confirms it worked.
 *
 * Without confirmation people press Copy two or three times, because nothing
 * distinguishes "copied" from "the click missed". The fill doubles as the
 * timer: it shows both that it worked and how long the confirmation will stay,
 * so the control never looks stuck.
 */
export function CopyFeedback({
  value,
  actionLabel = "Copy",
  confirmLabel = "Copied!",
  errorLabel = "Press ⌘C to copy",
  holdMs = 2000,
  onCopy,
  className,
  ...rest
}: CopyFeedbackProps) {
  const reduce = useReducedMotion();
  const [status, setStatus] = useState<Status>("idle");
  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  const copy = useCallback(async () => {
    // The original only flipped a boolean — it showed "Copied!" without ever
    // touching the clipboard. Confirming something that did not happen is
    // worse than no confirmation at all.
    try {
      await navigator.clipboard.writeText(value);
      setStatus("copied");
      onCopy?.(value);
    } catch {
      // Denied by permissions policy or an insecure origin. Say so instead of
      // claiming success, so the user knows to select the text manually.
      setStatus("error");
    }
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setStatus("idle"), holdMs);
  }, [value, holdMs, onCopy]);

  const swapIn = reduce
    ? { duration: 0.01 }
    : { ...spring.snappy, filter: { duration: duration.standard, ease: ease.out } };
  const swapOut = reduce
    ? { duration: 0.01 }
    : { duration: duration.micro, ease: ease.in };

  return (
    <div className={cn("flex items-center justify-center", className)} {...rest}>
      <div className="relative flex h-11 w-[220px] items-center overflow-hidden rounded-full bg-surface-subtle shadow-resting">
        {/*
          The confirmation fill. scaleX from a left origin rather than an
          animated width — width reflows the pill on every frame, a transform
          does not. `linear` is correct here and almost nowhere else: the bar
          represents real elapsed time.
        */}
        <AnimatePresence>
          {status !== "idle" && !reduce ? (
            <motion.div
              key="fill"
              aria-hidden="true"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ opacity: 0, transition: { duration: duration.fast } }}
              transition={{ duration: holdMs / 1000, ease: "linear" }}
              style={{ originX: 0, willChange: "transform" }}
              className={cn(
                "absolute inset-0",
                status === "error" ? "bg-danger/15" : "bg-surface-active",
              )}
            />
          ) : null}
        </AnimatePresence>

        <div className="relative z-10 w-full px-2">
          <AnimatePresence mode="popLayout" initial={false}>
            {status === "idle" ? (
              <motion.div
                key="idle"
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                exit={{
                  opacity: 0,
                  filter: "blur(4px)",
                  scale: 1.15,
                  // Exit carries its own timing; `exit` is not a valid Transition key.
                  transition: swapOut,
                }}
                transition={swapIn}
                className="flex w-full items-center justify-between gap-2"
              >
                <span className="truncate pl-2 font-semibold text-content-subtle">
                  {value}
                </span>
                <button
                  type="button"
                  onClick={copy}
                  className={cn(
                    "focus-ring shrink-0 cursor-pointer rounded-full bg-surface",
                    "px-3.5 py-1.5 text-sm font-semibold text-content shadow-resting",
                    "transition-colors hover:bg-surface-hover",
                  )}
                >
                  {actionLabel}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                aria-hidden="true"
                initial={{ opacity: 0, filter: "blur(4px)", scale: 0.9 }}
                animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                exit={{
                  opacity: 0,
                  filter: "blur(4px)",
                  scale: 1.15,
                  // Exit carries its own timing; `exit` is not a valid Transition key.
                  transition: swapOut,
                }}
                transition={swapIn}
                className="flex w-full items-center justify-center gap-1.5"
              >
                {status === "copied" ? (
                  <Check
                    className="size-4 rounded-full bg-accent p-0.5 text-accent-content"
                    strokeWidth={2}
                  />
                ) : null}
                <span
                  className={cn(
                    "text-sm font-semibold",
                    status === "error" ? "text-danger" : "text-content",
                  )}
                >
                  {status === "copied" ? confirmLabel : errorLabel}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/*
        The result is aria-hidden above and announced here instead. Visually
        the pill's contents are replaced; to a screen reader it is one control
        reporting an outcome, and the trigger keeps focus throughout.
      */}
      <span role="status" aria-live="polite" className="sr-only">
        {status === "copied"
          ? confirmLabel
          : status === "error"
            ? errorLabel
            : ""}
      </span>
    </div>
  );
}

export default CopyFeedback;
