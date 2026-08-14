"use client";

import { useCallback, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/cn";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export interface ToolbarMode {
  id: string;
  /** Accessible name for the mode's tab. */
  label: string;
  icon: React.ReactNode;
  /** What the bar shows while this mode is selected. */
  content: React.ReactNode;
}

export interface ContextualToolbarProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "content"
> {
  /** Two or three. The switcher is always visible, so it has to stay small. */
  modes: readonly ToolbarMode[];
  /** Names the mode switcher, e.g. "Editor mode". */
  label: string;
  defaultMode?: string;
  mode?: string;
  onModeChange?: (id: string) => void;
}

/* -------------------------------------------------------------------------- */
/* Motion — kept verbatim from the original                                    */
/* -------------------------------------------------------------------------- */

/*
 * 110/10 is damping ratio 0.48 — the bar overshoots its new width noticeably.
 * That is the whole effect: the container resizing with a bit of give is what
 * makes it read as one object reshaping itself rather than as two different
 * toolbars being swapped in and out.
 */
const resize = { type: "spring" as const, stiffness: 110, damping: 10 };

const swap = { duration: 0.2, ease: "easeOut" as const };

/**
 * Direction is applied through `custom` rather than baked into each mode, so
 * the element on its way out animates with the *current* direction. Read off a
 * frozen prop it would always use the previous one, and reversing would send
 * both panels the same way.
 */
const panelVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: 20 * direction,
    filter: "blur(4px)",
  }),
  center: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: (direction: number) => ({
    opacity: 0,
    x: -20 * direction,
    filter: "blur(4px)",
  }),
};

const reducedVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * A compact bar that reshapes around whichever set of controls is in use.
 *
 * A toolbar serving two jobs — a text prompt and a row of tools, say — either
 * shows everything at once and is too wide to sit over content, or splits into
 * two toolbars and makes you find the right one. Keeping the switcher fixed and
 * resizing the bar around the active set keeps one control surface in one
 * place, at the width that set actually needs.
 */
export function ContextualToolbar({
  modes,
  label,
  defaultMode,
  mode: controlledMode,
  onModeChange,
  className,
  ...rest
}: ContextualToolbarProps) {
  const reduce = useReducedMotion();
  const uid = useId();

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [uncontrolled, setUncontrolled] = useState(defaultMode ?? modes[0]?.id);
  const selected = controlledMode ?? uncontrolled;
  const [direction, setDirection] = useState(1);

  const selectedIndex = Math.max(
    modes.findIndex((entry) => entry.id === selected),
    0,
  );

  const select = useCallback(
    (id: string) => {
      const next = modes.findIndex((entry) => entry.id === id);
      setDirection(next >= selectedIndex ? 1 : -1);
      if (controlledMode === undefined) setUncontrolled(id);
      onModeChange?.(id);
    },
    [controlledMode, modes, onModeChange, selectedIndex],
  );

  /** APG tabs: one tab stop, arrows move and activate, Home/End jump. */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
      if (!keys.includes(event.key)) return;
      event.preventDefault();

      const last = modes.length - 1;
      const next =
        event.key === "ArrowRight"
          ? (selectedIndex + 1) % modes.length
          : event.key === "ArrowLeft"
            ? (selectedIndex - 1 + modes.length) % modes.length
            : event.key === "Home"
              ? 0
              : last;

      select(modes[next].id);
      tabRefs.current[next]?.focus();
    },
    [modes, select, selectedIndex],
  );

  if (modes.length === 0) return null;

  const active = modes[selectedIndex];
  const panelId = `${uid}-panel-${active.id}`;

  return (
    <div
      className={cn("flex w-full min-w-0 justify-center", className)}
      {...rest}
    >
      <motion.div
        layout
        transition={reduce ? { duration: 0.01 } : resize}
        className={cn(
          "flex w-fit max-w-full items-center gap-1 overflow-hidden",
          "bg-surface-subtle px-2 py-1.5 shadow-md",
        )}
        // Inline, not a class: Motion needs to read the radius to correct it
        // during the layout projection, or the corners distort as it resizes.
        style={{ borderRadius: 24 }}
      >
        <motion.div
          layout="position"
          role="tablist"
          aria-label={label}
          aria-orientation="horizontal"
          className={cn(
            "relative z-10 flex shrink-0 items-center gap-2 rounded-full",
            "bg-surface px-2 py-1 shadow-sm",
          )}
        >
          {modes.map((entry, index) => {
            const isSelected = entry.id === selected;
            return (
              <button
                key={entry.id}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                type="button"
                role="tab"
                id={`${uid}-tab-${entry.id}`}
                aria-selected={isSelected}
                aria-controls={`${uid}-panel-${entry.id}`}
                aria-label={entry.label}
                // Roving tabindex: the switcher is a single tab stop.
                tabIndex={isSelected ? 0 : -1}
                onClick={() => select(entry.id)}
                onKeyDown={handleKeyDown}
                className={cn(
                  "focus-ring relative grid size-7 cursor-pointer place-items-center",
                  "rounded-full transition-colors duration-300 [&>svg]:size-4",
                  // The visible control is 28px, which is the design. The hit
                  // area is pushed out to 44px tall and to the midpoint of the
                  // gap horizontally, so a thumb has more to aim at than the
                  // circle without the circles overlapping each other.
                  "before:absolute before:-inset-x-1 before:-inset-y-2 before:content-['']",
                  isSelected
                    ? "bg-surface-hover text-content"
                    : "text-content-muted hover:text-content",
                )}
              >
                <span aria-hidden="true">{entry.icon}</span>
              </button>
            );
          })}
        </motion.div>

        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={active.id}
            layout
            role="tabpanel"
            id={panelId}
            aria-labelledby={`${uid}-tab-${active.id}`}
            custom={direction}
            variants={reduce ? reducedVariants : panelVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={reduce ? { duration: 0.01 } : swap}
            className="flex min-w-0 items-center pl-2"
          >
            {active.content}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default ContextualToolbar;
