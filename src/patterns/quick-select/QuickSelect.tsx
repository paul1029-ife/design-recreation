"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/cn";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export interface QuickSelectOption {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export interface QuickSelectProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "onChange" | "defaultValue"
> {
  /** Two to four. Past that the row is wider than the trigger it hangs off. */
  options: readonly QuickSelectOption[];
  /** Names the control for assistive technology, e.g. "Visibility". */
  label: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (id: string) => void;
}

/* -------------------------------------------------------------------------- */
/* Motion — kept verbatim from the original                                    */
/* -------------------------------------------------------------------------- */

const popover = {
  hidden: { opacity: 0, y: 10, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
} as const;

const reducedPopover = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
} as const;

/** The value swap is faster than the popover: it is a correction, not an entrance. */
const SWAP = { duration: 0.15 } as const;
const POPOVER = { duration: 0.2, ease: "easeOut" } as const;
const CHEVRON = { duration: 0.3, ease: "circOut" } as const;

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * A select for a handful of options that shows them all at once.
 *
 * A native select for two or three choices makes you open a list, read it, and
 * aim at a row — three steps to flip something you already understood. Laying
 * the options out as a row above the trigger makes the whole set visible and
 * every one of them a single tap, while the trigger keeps showing the value.
 */
export function QuickSelect({
  options,
  label,
  defaultValue,
  value: controlledValue,
  onValueChange,
  className,
  ...rest
}: QuickSelectProps) {
  const reduce = useReducedMotion();
  const uid = useId();
  const listId = `${uid}-list`;

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const interacted = useRef(false);

  const [open, setOpen] = useState(false);
  const [uncontrolled, setUncontrolled] = useState(
    defaultValue ?? options[0]?.id,
  );
  const selected = controlledValue ?? uncontrolled;
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.id === selected),
  );
  const [activeIndex, setActiveIndex] = useState(selectedIndex);

  const toggle = useCallback((next: boolean) => {
    interacted.current = true;
    setOpen(next);
  }, []);

  const select = useCallback(
    (id: string) => {
      if (controlledValue === undefined) setUncontrolled(id);
      onValueChange?.(id);
      toggle(false);
    },
    [controlledValue, onValueChange, toggle],
  );

  /*
   * Opening puts focus on the current value, so the first arrow press moves
   * from where you are rather than from the top of the list. Closing returns
   * it to the trigger, which is the element that will still be there.
   */
  useEffect(() => {
    if (!interacted.current) return;
    if (open) optionRefs.current[selectedIndex]?.focus();
    else triggerRef.current?.focus();
    // Only on open/close: re-running when the selection changes would drag
    // focus around while the user is arrowing through the options.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /*
   * The original had no way out but the trigger. Clicking anywhere else left
   * the popover hanging over the page — the one dismissal everybody reaches
   * for first.
   */
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const move = useCallback((index: number) => {
    setActiveIndex(index);
    optionRefs.current[index]?.focus();
  }, []);

  /** APG listbox: arrows move focus, Enter or Space commits, Escape backs out. */
  const handleOptionKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      const count = options.length;
      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          event.preventDefault();
          move((index + 1) % count);
          return;
        case "ArrowLeft":
        case "ArrowUp":
          event.preventDefault();
          move((index - 1 + count) % count);
          return;
        case "Home":
          event.preventDefault();
          move(0);
          return;
        case "End":
          event.preventDefault();
          move(count - 1);
          return;
        case "Escape":
          event.preventDefault();
          toggle(false);
          return;
        default:
          return;
      }
    },
    [move, options.length, toggle],
  );

  if (options.length === 0) return null;

  const current = options[selectedIndex];

  return (
    <div
      className={cn(
        "flex w-full min-w-0 items-center justify-center",
        className,
      )}
      {...rest}
    >
      <div ref={rootRef} className="relative inline-block">
        <AnimatePresence>
          {open && (
            <motion.div
              id={listId}
              role="listbox"
              aria-label={label}
              variants={reduce ? reducedPopover : popover}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={reduce ? { duration: 0.01 } : POPOVER}
              className="absolute bottom-full left-1/2 z-10 mb-3 -translate-x-1/2"
            >
              <div className="relative flex items-center gap-1 rounded-full border border-border bg-surface-subtle p-1.5">
                {options.map((option, index) => {
                  const isSelected = option.id === selected;
                  return (
                    <button
                      key={option.id}
                      ref={(node) => {
                        optionRefs.current[index] = node;
                      }}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      tabIndex={index === activeIndex ? 0 : -1}
                      onClick={() => select(option.id)}
                      onKeyDown={(event) => handleOptionKeyDown(event, index)}
                      className={cn(
                        "focus-ring flex items-center gap-2 bg-surface px-3 py-2",
                        "font-semibold whitespace-nowrap transition-colors duration-200",
                        // Only the ends are rounded, so the row reads as one
                        // control rather than as separate buttons.
                        index === 0 && "rounded-l-full",
                        index === options.length - 1 && "rounded-r-full",
                        isSelected
                          ? "text-content"
                          : "text-content-muted hover:text-content",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "[&>svg]:size-[18px]",
                          isSelected
                            ? "[&>svg]:stroke-[2.5]"
                            : "[&>svg]:stroke-2",
                        )}
                      >
                        {option.icon}
                      </span>
                      {option.label}
                    </button>
                  );
                })}

                <div className="absolute -bottom-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 bg-surface-subtle" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          ref={triggerRef}
          type="button"
          layout
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          // The value is the button's text, so the name has to say what the
          // value is *of* or it announces as just "Public".
          aria-label={`${label}: ${current.label}`}
          onClick={() => toggle(!open)}
          whileTap={reduce ? undefined : { scale: 0.87 }}
          className={cn(
            "focus-ring group relative flex items-center gap-2 rounded-full",
            "bg-surface-subtle px-4 py-3 text-content-muted",
          )}
        >
          {/*
            A floor width, so swapping "Public" for "Private" does not resize
            the trigger and shove the chevron sideways mid-animation.
          */}
          <span className="flex min-w-[80px] items-center justify-center gap-2">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={current.id}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 5 }}
                animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -5 }}
                transition={reduce ? { duration: 0.01 } : SWAP}
                className="flex items-center gap-2"
              >
                <span
                  aria-hidden="true"
                  className="text-content-subtle [&>svg]:size-[18px] [&>svg]:stroke-[2.5]"
                >
                  {current.icon}
                </span>
                <span className="font-semibold text-content">
                  {current.label}
                </span>
              </motion.span>
            </AnimatePresence>
          </span>

          <motion.span
            aria-hidden="true"
            animate={{ rotate: open && !reduce ? 180 : 0 }}
            transition={reduce ? { duration: 0.01 } : CHEVRON}
            className="grid place-items-center"
          >
            <ChevronDown className="size-4 text-content-subtle" />
          </motion.span>
        </motion.button>
      </div>
    </div>
  );
}

export default QuickSelect;
