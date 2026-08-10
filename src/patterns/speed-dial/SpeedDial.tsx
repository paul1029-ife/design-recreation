"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Plus } from "lucide-react";

import { cn } from "@/lib/cn";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export interface SpeedDialAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onSelect: () => void;
}

export interface SpeedDialProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "onSelect"> {
  /** Three to six. Beyond that the stack is taller than a thumb can reach. */
  actions: readonly SpeedDialAction[];
  /** Accessible name for the trigger. @default "Actions" */
  triggerLabel?: string;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/* -------------------------------------------------------------------------- */
/* Motion — geometry and timing kept verbatim from the original                */
/* -------------------------------------------------------------------------- */

/**
 * Each card is pushed further left and tilted further as it gets further from
 * the trigger, so the stack reads as having unfolded out of the button rather
 * than as a list that appeared above it. `distance` is measured from the
 * trigger, so the nearest card barely moves and animates first.
 */
const X_PER_STEP = -32;
const X_BASE = -4;
const ROTATE_PER_STEP = -4;
const ROTATE_BASE = -4;
const STAGGER = 0.03;
const DURATION = 0.2;

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * A corner-anchored button that fans its actions out above itself.
 *
 * A floating action button is reachable one-handed but says nothing about what
 * it does; a menu answers that but arrives as a detached panel. Fanning the
 * cards out of the button keeps the origin visible, and staying anchored to
 * the corner keeps every option inside the thumb arc — which a centred menu
 * does not.
 */
export function SpeedDial({
  actions,
  triggerLabel = "Actions",
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  className,
  ...rest
}: SpeedDialProps) {
  const reduce = useReducedMotion();
  const uid = useId();
  const menuId = `${uid}-menu`;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const interacted = useRef(false);

  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolled;
  const [activeIndex, setActiveIndex] = useState(actions.length - 1);

  const setOpen = useCallback(
    (next: boolean) => {
      interacted.current = true;
      // Focus the card nearest the trigger — it is the one that unfolds first
      // and the one a thumb reaches without stretching. Set here rather than
      // in the effect below, because opening is an event.
      if (next) setActiveIndex(actions.length - 1);
      if (!isControlled) setUncontrolled(next);
      onOpenChange?.(next);
    },
    [actions.length, isControlled, onOpenChange],
  );

  /*
   * The trigger stays mounted here, unlike the other disclosure patterns, so
   * focus is not destroyed — but it still has to move, or opening a menu
   * leaves a keyboard user with nothing to act on.
   */
  useEffect(() => {
    if (!interacted.current) return;
    if (open) itemRefs.current[actions.length - 1]?.focus();
    else triggerRef.current?.focus();
  }, [open, actions.length]);

  const focusItem = useCallback((index: number) => {
    setActiveIndex(index);
    itemRefs.current[index]?.focus();
  }, []);

  /** Arrows follow the visual column: up moves toward the top of the stack. */
  const handleItemKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      const count = actions.length;
      switch (event.key) {
        case "Escape":
          event.preventDefault();
          setOpen(false);
          return;
        case "ArrowUp":
          event.preventDefault();
          focusItem((index - 1 + count) % count);
          return;
        case "ArrowDown":
          event.preventDefault();
          focusItem((index + 1) % count);
          return;
        case "Home":
          event.preventDefault();
          focusItem(0);
          return;
        case "End":
          event.preventDefault();
          focusItem(count - 1);
          return;
        default:
          return;
      }
    },
    [actions.length, focusItem, setOpen],
  );

  if (actions.length === 0) return null;

  return (
    <div
      className={cn("relative flex justify-center", className)}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) setOpen(false);
      }}
      {...rest}
    >
      <div
        id={menuId}
        role="menu"
        aria-label={triggerLabel}
        className="absolute bottom-[calc(100%+16px)] flex flex-col items-center gap-2.5"
      >
        <AnimatePresence>
          {open &&
            actions.map((action, index) => {
              // Distance from the trigger: the last card sits closest to it.
              const distance = actions.length - 1 - index;
              const x = distance * X_PER_STEP + X_BASE;
              const rotate = distance * ROTATE_PER_STEP + ROTATE_BASE;

              return (
                <motion.button
                  key={action.id}
                  ref={(node) => {
                    itemRefs.current[index] = node;
                  }}
                  type="button"
                  role="menuitem"
                  tabIndex={index === activeIndex ? 0 : -1}
                  onClick={() => {
                    action.onSelect();
                    setOpen(false);
                  }}
                  onKeyDown={(event) => handleItemKeyDown(event, index)}
                  initial={
                    reduce
                      ? { opacity: 0 }
                      : { opacity: 0, y: 20, x: 0, rotate: 0 }
                  }
                  animate={
                    reduce
                      ? { opacity: 1 }
                      : { opacity: 1, y: 0, x, rotate }
                  }
                  exit={
                    reduce
                      ? { opacity: 0 }
                      : { opacity: 0, y: 20, x: 0, rotate: 0 }
                  }
                  transition={
                    reduce
                      ? { duration: 0.01 }
                      : { duration: DURATION, delay: distance * STAGGER }
                  }
                  className={cn(
                    "focus-ring flex cursor-pointer items-center gap-3",
                    "rounded-2xl bg-surface px-4 py-2.5 shadow-resting",
                    "font-semibold whitespace-nowrap text-content-muted",
                    "hover:text-content",
                  )}
                >
                  <span aria-hidden="true" className="[&>svg]:size-5">
                    {action.icon}
                  </span>
                  {action.label}
                </motion.button>
              );
            })}
        </AnimatePresence>
      </div>

      <motion.button
        ref={triggerRef}
        type="button"
        aria-label={triggerLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen(!open)}
        // Grows rather than shrinks on press. Unusual, and kept: it reads as
        // the button swelling to release the stack.
        whileTap={reduce ? undefined : { scale: 1.05 }}
        animate={{ rotate: open && !reduce ? 45 : 0 }}
        className={cn(
          "focus-ring relative z-10 grid size-12 place-items-center",
          "rounded-full bg-surface text-content-muted shadow-resting",
        )}
      >
        <Plus className="size-6" aria-hidden="true" />
      </motion.button>
    </div>
  );
}

export default SpeedDial;
