"use client";

import { useCallback, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/cn";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export interface Segment {
  id: string;
  label: string;
  icon: React.ReactNode;
  /** Text colour class applied while selected, e.g. `"text-blue-600"`. */
  accentClassName?: string;
}

export interface ExpandingSegmentsProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "onChange" | "defaultValue"> {
  segments: readonly Segment[];
  /** Names the group for assistive technology, e.g. "Mailbox view". */
  label: string;
  defaultValue?: string;
  value?: string;
  onValueChange?: (id: string) => void;
}

/* -------------------------------------------------------------------------- */
/* Motion                                                                      */
/* -------------------------------------------------------------------------- */

/*
 * Kept verbatim from the original rather than mapped onto a shared token.
 * 300/20 is ratio 0.577 — close to `spring.snappy` in character but ~15%
 * slower, and the difference is audible in a control this small. Consolidating
 * it would be tidier and would not feel the same.
 */
const widthSpring = { type: "spring" as const, stiffness: 300, damping: 20 };

const COLLAPSED_WIDTH = 48;
const EXPANDED_WIDTH = 110;

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * A row of icon buttons where only the selected one names itself.
 *
 * Icon-only rows are compact but unlabelled — people cannot tell what the
 * icons do without hovering each one, and labelling all of them will not fit.
 * Expanding just the selection keeps the row small while always naming the
 * current choice, which is the one people most need to read back.
 */
export function ExpandingSegments({
  segments,
  label,
  defaultValue,
  value: controlledValue,
  onValueChange,
  className,
  ...rest
}: ExpandingSegmentsProps) {
  const reduce = useReducedMotion();
  const uid = useId();
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [uncontrolled, setUncontrolled] = useState(
    defaultValue ?? segments[0]?.id,
  );
  const isControlled = controlledValue !== undefined;
  const selected = isControlled ? controlledValue : uncontrolled;

  const select = useCallback(
    (id: string) => {
      if (!isControlled) setUncontrolled(id);
      onValueChange?.(id);
    },
    [isControlled, onValueChange],
  );

  /**
   * APG radiogroup: arrows move selection *and* focus, wrapping at both ends.
   * The group is one tab stop — Tab enters and leaves, it does not walk the
   * options.
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"];
      if (!keys.includes(event.key)) return;
      event.preventDefault();

      const last = segments.length - 1;
      const next =
        event.key === "ArrowRight" || event.key === "ArrowDown"
          ? (index + 1) % segments.length
          : event.key === "ArrowLeft" || event.key === "ArrowUp"
            ? (index - 1 + segments.length) % segments.length
            : event.key === "Home"
              ? 0
              : last;

      select(segments[next].id);
      buttonRefs.current[next]?.focus();
    },
    [segments, select],
  );

  if (segments.length === 0) return null;

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("flex items-center justify-center gap-2.5", className)}
      {...rest}
    >
      {segments.map((segment, index) => {
        const isSelected = segment.id === selected;
        const accent = isSelected
          ? (segment.accentClassName ?? "text-content")
          : "text-content";

        return (
          <motion.button
            key={segment.id}
            ref={(node) => {
              buttonRefs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={isSelected}
            // Roving tabindex: the group is a single tab stop.
            tabIndex={isSelected ? 0 : -1}
            onClick={() => select(segment.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            initial={false}
            animate={{ width: isSelected ? EXPANDED_WIDTH : COLLAPSED_WIDTH }}
            transition={reduce ? { duration: 0.01 } : widthSpring}
            whileHover={reduce ? undefined : { scale: 1.05 }}
            className={cn(
              "focus-ring relative flex h-12 cursor-pointer items-center",
              "overflow-hidden rounded-full bg-surface will-change-transform",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "absolute left-3 grid size-6 place-items-center [&>svg]:size-8",
                accent,
              )}
            >
              {segment.icon}
            </span>

            <motion.span
              initial={false}
              animate={{
                opacity: isSelected ? 1 : 0,
                x: isSelected ? 0 : -20,
              }}
              transition={reduce ? { duration: 0.01 } : { duration: 0.2 }}
              // ml-11, not ml-10: the icon is 32px inside a 24px box, so it
              // overhangs its container by 4px each side and at 40px the
              // glyph sat on top of the first letter.
              className="relative ml-11 font-semibold whitespace-nowrap"
            >
              <span className={accent}>{segment.label}</span>

              {/*
                Sheen sweep on selection. Decorative, and deliberately kept —
                it is part of this interaction's character, and it only ever
                runs on the item that just became selected, so it reads as
                confirmation rather than ambient decoration.
              */}
              {isSelected && !reduce ? (
                <motion.span
                  key={`${uid}-${segment.id}-sheen`}
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-surface to-transparent opacity-60"
                  initial={{ x: "-100%" }}
                  animate={{ x: "200%" }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  style={{ mixBlendMode: "overlay" }}
                />
              ) : null}
            </motion.span>
          </motion.button>
        );
      })}
    </div>
  );
}

export default ExpandingSegments;
