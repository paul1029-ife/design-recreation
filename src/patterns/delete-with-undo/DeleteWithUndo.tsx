"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Undo2 } from "lucide-react";

import { cn } from "@/lib/cn";
import { spring, staggerStep } from "@/lib/motion";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export type DeleteWithUndoStatus = "idle" | "undoable" | "deleted";

export interface DeleteWithUndoProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "onError"> {
  /** Text of the destructive trigger. */
  label: string;
  /** Text of the undo control while the window is open. @default "Undo" */
  undoLabel?: string;
  /** Text shown once the window elapses. @default "Deleted" */
  deletedLabel?: string;
  /**
   * How long the user has to change their mind, ms. Drives both the countdown
   * and the commit — they cannot drift apart. @default 10000
   */
  undoWindowMs?: number;
  /** Called once the window elapses and the deletion is real. */
  onDelete: () => void;
  /** Called if the user takes it back. */
  onUndo?: () => void;
  onStatusChange?: (status: DeleteWithUndoStatus) => void;
  disabled?: boolean;
}

/* -------------------------------------------------------------------------- */
/* Motion                                                                      */
/* -------------------------------------------------------------------------- */

const characterVariants = {
  hidden: { opacity: 0, y: 5 },
  visible: { opacity: 1, y: 0 },
} as const;

/**
 * Variants for the control itself.
 *
 * These have to exist as named variants, not inline objects: the parent's
 * `animate="visible"` is what propagates down to the per-character spans and
 * drives the stagger. Without a matching `variants` prop here the name
 * resolved to nothing, so the control mounted at `hidden` and stayed there —
 * invisible after any transition.
 */
const controlVariants = {
  hidden: { opacity: 0, scale: 0.7 },
  visible: { opacity: 1, scale: 1 },
} as const;

const reducedControlVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
} as const;

/**
 * Per-character reveal.
 *
 * The spans are aria-hidden and the real string sits on the parent's
 * aria-label — otherwise a screen reader spells the label out one letter at a
 * time, which is how most staggered-text implementations quietly break.
 */
function StaggeredText({ text, reduce }: { text: string; reduce: boolean }) {
  const characters = [...text];
  const step = staggerStep(characters.length);

  if (reduce) return <span>{text}</span>;

  return (
    <span aria-hidden="true" className="flex will-change-transform">
      {characters.map((character, index) => (
        <motion.span
          key={`${character}-${index}`}
          variants={characterVariants}
          transition={{ ...spring.gentle, delay: index * step }}
        >
          {character === " " ? " " : character}
        </motion.span>
      ))}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Destructive action with an undo window instead of a confirmation dialog.
 *
 * "Are you sure?" is answered reflexively — people click through it and then
 * lose the thing anyway. Deferring the commit and offering a way back for a
 * few seconds is strictly better: it costs nothing when the action was
 * intended and it is fully recoverable when it was not.
 */
export function DeleteWithUndo({
  label,
  undoLabel = "Undo",
  deletedLabel = "Deleted",
  undoWindowMs = 10_000,
  onDelete,
  onUndo,
  onStatusChange,
  disabled = false,
  className,
  ...rest
}: DeleteWithUndoProps) {
  const reduce = useReducedMotion() ?? false;
  const uid = useId();
  const sharedLayoutId = `${uid}-control`;

  const [status, setStatusRaw] = useState<DeleteWithUndoStatus>("idle");
  const [remaining, setRemaining] = useState(Math.ceil(undoWindowMs / 1000));
  const deadlineRef = useRef<number>(0);

  const setStatus = useCallback(
    (next: DeleteWithUndoStatus) => {
      setStatusRaw(next);
      onStatusChange?.(next);
    },
    [onStatusChange],
  );

  const start = useCallback(() => {
    if (disabled) return;
    deadlineRef.current = Date.now() + undoWindowMs;
    setRemaining(Math.ceil(undoWindowMs / 1000));
    setStatus("undoable");
  }, [disabled, undoWindowMs, setStatus]);

  const undo = useCallback(() => {
    setStatus("idle");
    onUndo?.();
  }, [setStatus, onUndo]);

  /*
   * One effect owns the whole window. The countdown is derived from a deadline
   * rather than decremented, so a throttled tab cannot make the displayed
   * number disagree with when the commit actually fires.
   */
  useEffect(() => {
    if (status !== "undoable") return;

    const id = window.setInterval(() => {
      const msLeft = deadlineRef.current - Date.now();
      if (msLeft <= 0) {
        window.clearInterval(id);
        setRemaining(0);
        setStatus("deleted");
        onDelete();
        return;
      }
      setRemaining(Math.ceil(msLeft / 1000));
    }, 250);

    return () => window.clearInterval(id);
  }, [status, setStatus, onDelete]);

  const transition = reduce ? { duration: 0.01 } : spring.gentle;

  return (
    <div className={cn("flex items-center justify-center", className)} {...rest}>
      <AnimatePresence mode="popLayout" initial={false}>
        {status === "idle" && (
          <motion.button
            key="trigger"
            type="button"
            layout
            layoutId={sharedLayoutId}
            onClick={start}
            disabled={disabled}
            aria-label={label}
            variants={reduce ? reducedControlVariants : controlVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={transition}
            style={{ borderRadius: 9999 }}
            className={cn(
              "focus-ring flex h-[50px] cursor-pointer items-center overflow-hidden",
              "bg-danger px-5 font-semibold text-danger-content",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            <StaggeredText text={label} reduce={reduce} />
          </motion.button>
        )}

        {status === "undoable" && (
          <motion.div
            key="undo"
            layout
            layoutId={sharedLayoutId}
            variants={reduce ? reducedControlVariants : controlVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={transition}
            style={{ borderRadius: 9999 }}
            className="flex h-[50px] items-center gap-3 overflow-hidden bg-danger/10 px-2.5"
          >
            {/*
              A real button. This was a <div onClick> — the undo was
              unreachable by keyboard, which makes the whole safety net
              decorative for anyone not using a mouse.
            */}
            <button
              type="button"
              onClick={undo}
              aria-label={`${undoLabel}. ${remaining} ${remaining === 1 ? "second" : "seconds"} remaining.`}
              className={cn(
                "focus-ring flex cursor-pointer items-center gap-3 rounded-full",
                "text-danger",
              )}
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-danger text-danger-content">
                <Undo2 className="size-4" strokeWidth={2.4} aria-hidden="true" />
              </span>
              <span className="font-semibold">
                <StaggeredText text={undoLabel} reduce={reduce} />
              </span>
            </button>

            <span
              aria-hidden="true"
              data-tabular
              className={cn(
                "relative grid h-7 w-9 shrink-0 place-items-center rounded-full",
                "bg-danger text-sm font-semibold text-danger-content",
              )}
              style={{ transform: "translateZ(0)" }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={remaining}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: -7 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: 7 }}
                  transition={reduce ? { duration: 0.01 } : { duration: 0.2 }}
                  className="absolute"
                >
                  {remaining}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.div>
        )}

        {status === "deleted" && (
          <motion.p
            key="deleted"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition}
            className="font-semibold text-content-muted"
          >
            {deletedLabel}
          </motion.p>
        )}
      </AnimatePresence>

      {/*
        The countdown itself is not announced — a number changing every second
        would talk over everything else. The window opening and closing is what
        matters, so only those two transitions are spoken.
      */}
      <span role="status" aria-live="polite" className="sr-only">
        {status === "undoable"
          ? `${label} scheduled. ${undoLabel} available for ${Math.ceil(undoWindowMs / 1000)} seconds.`
          : status === "deleted"
            ? deletedLabel
            : ""}
      </span>
    </div>
  );
}

export default DeleteWithUndo;
