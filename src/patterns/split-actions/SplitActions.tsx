"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Plus } from "lucide-react";

import { cn } from "@/lib/cn";
import { blurTransition, spring } from "@/lib/motion";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export interface SplitAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onSelect: () => void;
}

export interface SplitActionsProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "onSelect"
> {
  /** Two or three. Past that the row stops fitting and wants a menu. */
  actions: readonly SplitAction[];
  /** Accessible name for the collapsed trigger. @default "Show actions" */
  triggerLabel?: string;
  /** Icon inside the trigger. @default a plus */
  triggerIcon?: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/* -------------------------------------------------------------------------- */
/* Motion                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Each pill enters from where the trigger was, so the row appears to unpack
 * out of the button rather than materialise around it. Entering from a fixed
 * direction regardless of position would read as scripted.
 */
function pillVariants(offset: number) {
  return {
    hidden: { x: offset, opacity: 0, filter: "blur(12px)" },
    show: { x: 0, opacity: 1, filter: "blur(0px)" },
  };
}

const reducedPillVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
} as const;

/** Symmetric spread: outermost pills travel furthest, the centre one not at all. */
function offsetFor(index: number, count: number): number {
  if (count < 2) return 0;
  return ((count - 1) / 2 - index) * (112 / (count - 1));
}

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * A compact trigger that splits into the actions it stands for.
 *
 * A generic "+" hides what you can actually add, and a dropdown costs a click
 * and covers the content underneath. Splitting the button into its real
 * actions shows them in place, at the cost of only being viable for two or
 * three.
 */
export function SplitActions({
  actions,
  triggerLabel = "Show actions",
  triggerIcon,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  className,
  ...rest
}: SplitActionsProps) {
  const reduce = useReducedMotion();
  const uid = useId();
  const groupId = `${uid}-actions`;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstActionRef = useRef<HTMLButtonElement>(null);
  // Distinguishes a user-driven toggle from the first render, so focus is not
  // stolen on mount when `defaultOpen` is true.
  const interacted = useRef(false);

  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolled;

  const setOpen = useCallback(
    (next: boolean) => {
      interacted.current = true;
      if (!isControlled) setUncontrolled(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  /*
   * The trigger unmounts when the row expands, which destroys focus and drops
   * a keyboard user at the top of the document. Focus has to be handed to the
   * first action on open and back to the trigger on close.
   */
  useEffect(() => {
    if (!interacted.current) return;
    if (open) firstActionRef.current?.focus();
    else triggerRef.current?.focus();
  }, [open]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape" && open) {
        event.stopPropagation();
        setOpen(false);
      }
    },
    [open, setOpen],
  );

  if (actions.length === 0) return null;

  const transition = reduce
    ? { duration: 0.01 }
    : { ...spring.snappy, filter: blurTransition, opacity: blurTransition };

  return (
    <div
      onKeyDown={handleKeyDown}
      className={cn("flex items-center justify-center", className)}
      {...rest}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {!open ? (
          <motion.button
            key="trigger"
            ref={triggerRef}
            type="button"
            aria-label={triggerLabel}
            aria-expanded={false}
            aria-controls={open ? groupId : undefined}
            onClick={() => setOpen(true)}
            initial={
              reduce
                ? { opacity: 0 }
                : { scale: 0.5, opacity: 0, filter: "blur(12px)" }
            }
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            exit={
              reduce
                ? { opacity: 0 }
                : { scale: 0.5, opacity: 0, filter: "blur(12px)" }
            }
            transition={transition}
            style={{ willChange: "transform" }}
            className={cn(
              "focus-ring grid size-11 cursor-pointer place-items-center",
              "rounded-full bg-accent text-accent-content",
            )}
          >
            {triggerIcon ?? <Plus className="size-5" strokeWidth={2.5} />}
          </motion.button>
        ) : (
          <motion.div
            key="actions"
            id={groupId}
            className="flex items-center gap-3"
            initial="hidden"
            animate="show"
            exit="hidden"
          >
            {actions.map((action, index) => (
              <motion.button
                key={action.id}
                ref={index === 0 ? firstActionRef : undefined}
                type="button"
                variants={
                  reduce
                    ? reducedPillVariants
                    : pillVariants(offsetFor(index, actions.length))
                }
                transition={transition}
                style={{ willChange: "transform" }}
                onClick={() => {
                  action.onSelect();
                  setOpen(false);
                }}
                className={cn(
                  "focus-ring flex cursor-pointer items-center gap-2",
                  "rounded-full bg-surface-subtle px-4 py-2.5",
                  "hover:bg-surface-hover",
                )}
              >
                {action.icon ? (
                  <span
                    aria-hidden="true"
                    className="grid size-6 shrink-0 place-items-center rounded-lg bg-accent text-accent-content [&>svg]:size-4"
                  >
                    {action.icon}
                  </span>
                ) : null}
                <span className="text-[15px] font-semibold text-content select-none">
                  {action.label}
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SplitActions;
