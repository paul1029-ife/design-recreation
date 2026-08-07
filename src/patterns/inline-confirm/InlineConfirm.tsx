"use client";

import { useCallback, useEffect, useId, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type HTMLMotionProps,
} from "motion/react";
import { Check } from "lucide-react";

import { cn } from "@/lib/cn";
import { blurTransition, spring } from "@/lib/motion";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export type InlineConfirmStatus = "idle" | "pending" | "confirmed";

/*
 * Extends Motion's div props rather than React's: the root IS a motion.div,
 * and Motion redefines onDrag/onAnimationStart with different signatures, so
 * the plain DOM types are not assignable to it.
 */
export interface InlineConfirmProps extends HTMLMotionProps<"div"> {
  /** Text naming the thing being acted on. */
  label: string;
  /**
   * Called when the user commits. Return a promise and the pending stage
   * tracks it; return void and it resolves immediately. A rejection returns
   * the control to idle so the action can be retried.
   */
  onConfirm: () => void | Promise<void>;
  /** Text of the trigger. @default "Confirm" */
  actionLabel?: string;
  /** Leading icon, rendered in a 30px slot. */
  icon?: React.ReactNode;
  /** Controlled status. Omit to let the component manage its own. */
  status?: InlineConfirmStatus;
  onStatusChange?: (status: InlineConfirmStatus) => void;
  /** How long the confirmed stage is held before returning to idle, ms. @default 2000 */
  confirmedHoldMs?: number;
  disabled?: boolean;
  /** Announced while the action is in flight. @default `${actionLabel}…` */
  pendingAnnouncement?: string;
  /** Announced once it completes. @default "Done" */
  confirmedAnnouncement?: string;
}

/* -------------------------------------------------------------------------- */
/* Motion — hoisted so they are not reallocated every render                   */
/* -------------------------------------------------------------------------- */

const stageVariants = {
  initial: { opacity: 0, filter: "blur(5px)" },
  animate: { opacity: 1, filter: "blur(0px)" },
  exit: { opacity: 0, filter: "blur(5px)" },
} as const;

const reducedStageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
} as const;

const stageTransition = {
  layout: spring.smooth,
  opacity: blurTransition,
  filter: blurTransition,
} as const;

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Confirmation that resolves in place.
 *
 * A modal confirmation breaks flow, steals focus, and trains people to dismiss
 * without reading — at which point it has stopped confirming anything. This
 * keeps the whole exchange inside the control the user just pressed: the
 * trigger becomes the progress indicator, then the result, then the trigger
 * again. Focus never moves, so a keyboard user is never relocated.
 */
export function InlineConfirm({
  label,
  onConfirm,
  actionLabel = "Confirm",
  icon,
  status: controlledStatus,
  onStatusChange,
  confirmedHoldMs = 2000,
  disabled = false,
  pendingAnnouncement,
  confirmedAnnouncement = "Done",
  className,
  ...rest
}: InlineConfirmProps) {
  const reduce = useReducedMotion();
  // layoutId must be unique per document, not per component: two instances on
  // one page would otherwise claim the same id and animate into each other.
  const uid = useId();
  const actionLayoutId = `${uid}-action`;
  const statusId = `${uid}-status`;

  const [uncontrolled, setUncontrolled] = useState<InlineConfirmStatus>("idle");
  const isControlled = controlledStatus !== undefined;
  const status = isControlled ? controlledStatus : uncontrolled;

  const setStatus = useCallback(
    (next: InlineConfirmStatus) => {
      if (!isControlled) setUncontrolled(next);
      onStatusChange?.(next);
    },
    [isControlled, onStatusChange],
  );

  const handleConfirm = useCallback(async () => {
    if (disabled || status !== "idle") return;
    setStatus("pending");
    try {
      await onConfirm();
      setStatus("confirmed");
    } catch {
      // Returning to idle rather than surfacing an error stage keeps this
      // pattern's scope honest: it confirms, it does not report failures.
      setStatus("idle");
    }
  }, [disabled, status, onConfirm, setStatus]);

  // Auto-return from confirmed. Cleanup is required — React 19 Strict Mode
  // double-invokes effects, and a leaked timer fires against an unmounted tree.
  useEffect(() => {
    if (status !== "confirmed" || isControlled) return;
    const id = window.setTimeout(() => setStatus("idle"), confirmedHoldMs);
    return () => window.clearTimeout(id);
  }, [status, isControlled, confirmedHoldMs, setStatus]);

  const variants = reduce ? reducedStageVariants : stageVariants;
  const transition = reduce ? { duration: 0.01 } : stageTransition;

  return (
    <motion.div
      layout
      transition={reduce ? { duration: 0.01 } : spring.smooth}
      className={cn(
        "flex min-w-[280px] items-center gap-1.5 rounded-full",
        "bg-surface px-3 py-2 shadow-floating",
        className,
      )}
      style={{ willChange: "transform" }}
      {...rest}
    >
      {icon ? (
        <span
          aria-hidden="true"
          className="grid size-[30px] shrink-0 place-items-center rounded-full bg-surface-subtle text-content"
        >
          {icon}
        </span>
      ) : null}

      <span className="flex-1 truncate text-base text-content select-none">
        {label}
      </span>

      <AnimatePresence mode="wait" initial={false}>
        {status === "idle" && (
          <motion.button
            key="idle"
            type="button"
            layoutId={actionLayoutId}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
            onClick={handleConfirm}
            disabled={disabled}
            aria-describedby={statusId}
            className={cn(
              "focus-ring relative shrink-0 cursor-pointer rounded-full",
              "bg-surface-subtle px-4 py-1.5 text-sm whitespace-nowrap text-content",
              "hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50",
              // 44px hit area without growing the pill visually
              "before:absolute before:-inset-2 before:content-['']",
            )}
          >
            {actionLabel}
          </motion.button>
        )}

        {status === "pending" && (
          <motion.div
            key="pending"
            aria-hidden="true"
            layoutId={actionLayoutId}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
            className="flex shrink-0 items-center justify-center rounded-full bg-surface-subtle px-2 py-1.5"
          >
            <div className="relative h-[7px] w-[90px] overflow-hidden rounded-full bg-accent">
              <motion.span
                className="absolute top-1/2 left-0 h-[7px] w-8 -translate-y-1/2 rounded-full bg-surface"
                animate={reduce ? { opacity: [1, 0.4, 1] } : { x: [-3, 62] }}
                transition={{
                  duration: reduce ? 1.2 : 0.6,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                }}
                style={{ willChange: "transform" }}
              />
            </div>
          </motion.div>
        )}

        {status === "confirmed" && (
          <motion.div
            key="confirmed"
            aria-hidden="true"
            layoutId={actionLayoutId}
            layout="preserve-aspect"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
            className="grid size-[34px] shrink-0 place-items-center rounded-full bg-surface-subtle"
          >
            <motion.span
              initial={reduce ? { opacity: 0 } : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={
                reduce ? { duration: 0.01 } : { delay: 0.18, ...spring.bouncy }
              }
              className="grid place-items-center rounded-full bg-accent p-1"
            >
              <Check
                className="size-4 text-accent-content"
                strokeWidth={2.4}
                aria-hidden="true"
              />
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/*
        The three stages above are aria-hidden: visually they replace one
        another, but to a screen reader they are one control whose state
        changed. The live region carries that change. It must be mounted
        before its text changes or nothing is announced.
      */}
      <span id={statusId} role="status" aria-live="polite" className="sr-only">
        {status === "pending"
          ? (pendingAnnouncement ?? `${actionLabel}…`)
          : status === "confirmed"
            ? confirmedAnnouncement
            : ""}
      </span>
    </motion.div>
  );
}

export default InlineConfirm;
