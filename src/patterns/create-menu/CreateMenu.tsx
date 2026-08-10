"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Plus, X } from "lucide-react";

import { cn } from "@/lib/cn";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export interface CreateMenuOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  onSelect: () => void;
}

export interface CreateMenuProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "onSelect"> {
  options: readonly CreateMenuOption[];
  /** Text on the trigger, reused as the menu's heading. @default "Create New" */
  triggerLabel?: string;
  /** Grid width. Drives vertical arrow navigation. @default 3 */
  columns?: number;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/* -------------------------------------------------------------------------- */
/* Motion — values kept verbatim from the original                             */
/* -------------------------------------------------------------------------- */

const itemSpring = { type: "spring" as const, stiffness: 300, damping: 20 };
const STAGGER = 0.04;
/** The plus fades in after the container has finished morphing, not with it. */
const PLUS_DELAY = 0.21;

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: STAGGER } },
} as const;

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1 },
} as const;

const reducedItemVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
} as const;

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * A create button that becomes the things it can create.
 *
 * "New" does not say what you can make, and a dropdown list makes you read six
 * labels in sequence to find out. A grid of labelled icons is scannable in one
 * pass — you recognise the shape rather than reading the list. The trigger
 * morphing into the grid keeps the two connected, so it reads as the same
 * control opening rather than a panel arriving from elsewhere.
 */
export function CreateMenu({
  options,
  triggerLabel = "Create New",
  columns = 3,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  className,
  ...rest
}: CreateMenuProps) {
  const reduce = useReducedMotion();
  const uid = useId();
  // layoutId must be unique per document: two instances sharing "container"
  // would animate into each other.
  const containerId = `${uid}-container`;
  const headingId = `${uid}-heading`;
  const menuId = `${uid}-menu`;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const interacted = useRef(false);

  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolled;
  const [activeIndex, setActiveIndex] = useState(0);

  const setOpen = useCallback(
    (next: boolean) => {
      interacted.current = true;
      // Reset here rather than in the focus effect below. Opening is an event,
      // not a synchronisation, and setState in an effect body cascades a render.
      if (next) setActiveIndex(0);
      if (!isControlled) setUncontrolled(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  /*
   * The trigger unmounts when the menu opens, so focus has to be handed over
   * explicitly or it falls to the document body. Opening focuses the first
   * item — a menu that opens without moving focus leaves keyboard users with
   * nothing to act on.
   */
  useEffect(() => {
    if (!interacted.current) return;
    if (open) itemRefs.current[0]?.focus();
    else triggerRef.current?.focus();
  }, [open]);

  const focusItem = useCallback((index: number) => {
    setActiveIndex(index);
    itemRefs.current[index]?.focus();
  }, []);

  /** Grid navigation: left/right walk the list, up/down move by a row. */
  const handleItemKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      const count = options.length;
      const last = count - 1;

      switch (event.key) {
        case "Escape":
          event.preventDefault();
          setOpen(false);
          return;
        case "ArrowRight":
          event.preventDefault();
          focusItem((index + 1) % count);
          return;
        case "ArrowLeft":
          event.preventDefault();
          focusItem((index - 1 + count) % count);
          return;
        case "ArrowDown":
          event.preventDefault();
          focusItem(index + columns > last ? index % columns : index + columns);
          return;
        case "ArrowUp":
          event.preventDefault();
          focusItem(
            index - columns < 0
              ? Math.min(index + columns * Math.floor(last / columns), last)
              : index - columns,
          );
          return;
        case "Home":
          event.preventDefault();
          focusItem(0);
          return;
        case "End":
          event.preventDefault();
          focusItem(last);
          return;
        default:
          return;
      }
    },
    [options.length, columns, focusItem, setOpen],
  );

  if (options.length === 0) return null;

  return (
    <div className={cn("flex items-center justify-center", className)} {...rest}>
      <AnimatePresence mode="popLayout">
        {!open ? (
          <motion.button
            key="trigger"
            ref={triggerRef}
            type="button"
            layoutId={containerId}
            aria-haspopup="menu"
            aria-expanded={false}
            onClick={() => setOpen(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              willChange: "transform",
              transform: "translateZ(0)",
              borderRadius: 20,
            }}
            className={cn(
              "focus-ring flex cursor-pointer items-center gap-1",
              "border-[3px] border-border bg-surface-subtle px-3 py-2 shadow-resting",
            )}
          >
            <motion.span
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: { delay: reduce ? 0 : PLUS_DELAY },
              }}
            >
              <Plus size={18} />
            </motion.span>
            <motion.span
              layoutId={`${uid}-label`}
              className="text-sm font-semibold"
              style={{ willChange: "transform", transform: "translateZ(0)" }}
            >
              {triggerLabel}
            </motion.span>
          </motion.button>
        ) : (
          <motion.div
            key="menu"
            layoutId={containerId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              willChange: "transform",
              transform: "translateZ(0)",
              borderRadius: 20,
            }}
            className="w-[260px] border-[3px] border-border bg-surface-subtle pt-2 shadow-overlay"
          >
            <div className="flex items-center justify-between px-3">
              <motion.span
                id={headingId}
                layoutId={`${uid}-label`}
                className="text-sm font-semibold"
                style={{ willChange: "transform", transform: "translateZ(0)" }}
              >
                {triggerLabel}
              </motion.span>

              {/*
                A real button. This was an <X onClick> — an SVG with a click
                handler, so the only way out of the menu was a mouse.
              */}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={`Close ${triggerLabel.toLowerCase()}`}
                className="focus-ring grid size-5 cursor-pointer place-items-center rounded-full bg-border-strong text-accent-content"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </div>

            <motion.div
              role="menu"
              id={menuId}
              aria-labelledby={headingId}
              className="mt-2 grid gap-4 rounded-xl bg-surface p-2"
              style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
              initial="hidden"
              animate="show"
              variants={gridVariants}
            >
              {options.map((option, index) => (
                <motion.button
                  key={option.id}
                  ref={(node) => {
                    itemRefs.current[index] = node;
                  }}
                  type="button"
                  role="menuitem"
                  // Roving tabindex: the menu is one tab stop, arrows move within.
                  tabIndex={index === activeIndex ? 0 : -1}
                  onClick={() => {
                    option.onSelect();
                    setOpen(false);
                  }}
                  onKeyDown={(event) => handleItemKeyDown(event, index)}
                  variants={reduce ? reducedItemVariants : itemVariants}
                  transition={reduce ? { duration: 0.01 } : itemSpring}
                  className={cn(
                    "focus-ring flex cursor-pointer flex-col items-center gap-2",
                    "rounded-lg p-2 text-content-muted will-change-transform",
                    "hover:bg-surface-subtle",
                  )}
                >
                  <span aria-hidden="true" className="[&>svg]:size-5">
                    {option.icon}
                  </span>
                  <span className="text-xs">{option.label}</span>
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CreateMenu;
