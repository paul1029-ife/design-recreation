"use client";

import { useCallback, useId, useRef, useState } from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
} from "motion/react";
import { Ellipsis, X } from "lucide-react";
import useMeasure from "react-use-measure";

import { cn } from "@/lib/cn";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export interface OverflowAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onSelect: () => void;
}

export interface InlineOverflowProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "onSelect"
> {
  /** Always visible. Keep to two or three — this is the row's resting width. */
  primary: readonly OverflowAction[];
  /** Revealed in place by the toggle. */
  overflow: readonly OverflowAction[];
  /** Names the toolbar for assistive technology, e.g. "Document actions". */
  label?: string;
  /** Accessible name for the toggle. @default "More actions" */
  moreLabel?: string;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/* -------------------------------------------------------------------------- */
/* Motion — kept verbatim from the original                                    */
/* -------------------------------------------------------------------------- */

/*
 * 200/14 is damping ratio 0.49 — pronounced overshoot, and deliberately so.
 * The bar overshooting its new width is what sells the row as one elastic
 * object rather than as chips appearing next to each other. It is well outside
 * the house `spring.snappy`, and mapping it onto a token would flatten it.
 */
const widthSpring = { type: "spring" as const, stiffness: 200, damping: 14 };

/** 200/18 is ratio 0.64. Drives the `layout="position"` slide of the chips. */
const positionSpring = { type: "spring" as const, stiffness: 200, damping: 18 };

/* -------------------------------------------------------------------------- */
/* Chip                                                                        */
/* -------------------------------------------------------------------------- */

function ActionChip({
  action,
  reduce,
  tabIndex,
  onFocus,
  onKeyDown,
  buttonRef,
}: {
  action: OverflowAction;
  reduce: boolean | null;
  tabIndex: number;
  onFocus: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  buttonRef: (node: HTMLButtonElement | null) => void;
}) {
  return (
    <motion.button
      ref={buttonRef}
      type="button"
      tabIndex={tabIndex}
      onClick={action.onSelect}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      whileTap={reduce ? undefined : { scale: 0.8 }}
      whileHover={
        reduce
          ? undefined
          : { y: -2, boxShadow: "0 8px 15px rgba(0, 0, 0, 0.1)", rotateZ: -3 }
      }
      // No `transition-all` here. The original carried one, which meant CSS was
      // interpolating toward each frame Motion wrote for `transform` and
      // `box-shadow` — two systems driving one property, which reads as lag on
      // the way in and rubber-banding on the way out.
      className={cn(
        "focus-ring flex cursor-pointer items-center justify-center gap-1.5",
        "rounded-4xl bg-surface px-3 py-2 text-content shadow-sm",
      )}
    >
      <span aria-hidden="true" className="[&>svg]:size-3.5">
        {action.icon}
      </span>
      {action.label}
    </motion.button>
  );
}

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * An action bar that grows to reveal its secondary actions in place.
 *
 * A toolbar with more actions than fit has to hide some, and a dropdown moves
 * them to a different surface with different hit targets and a different way
 * of being dismissed — so the secondary actions become a different class of
 * thing than the primary ones. Widening the bar keeps every action a sibling.
 */
export function InlineOverflow({
  primary,
  overflow,
  label = "Actions",
  moreLabel = "More actions",
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  className,
  ...rest
}: InlineOverflowProps) {
  const reduce = useReducedMotion();
  const uid = useId();
  const overflowId = `${uid}-overflow`;

  const [contentRef, content] = useMeasure({ offsetSize: false });
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolled;

  const actionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const toggleRef = useRef<HTMLButtonElement>(null);

  /*
   * APG toolbar: one tab stop, arrows walk the controls. Stops are the visible
   * actions followed by the toggle, which matches both DOM and visual order.
   */
  const visible = open ? [...primary, ...overflow] : primary;
  const toggleStop = visible.length;
  const [activeStop, setActiveStop] = useState(0);
  // Clamped rather than reset in an effect: closing the bar removes stops, and
  // a stale index would leave the toolbar with no tab stop at all.
  const active = Math.min(activeStop, toggleStop);

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolled(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const focusStop = useCallback(
    (index: number) => {
      setActiveStop(index);
      if (index === toggleStop) toggleRef.current?.focus();
      else actionRefs.current[index]?.focus();
    },
    [toggleStop],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      const stops = toggleStop + 1;
      switch (event.key) {
        case "ArrowRight":
          event.preventDefault();
          focusStop((active + 1) % stops);
          return;
        case "ArrowLeft":
          event.preventDefault();
          focusStop((active - 1 + stops) % stops);
          return;
        case "Home":
          event.preventDefault();
          focusStop(0);
          return;
        case "End":
          event.preventDefault();
          focusStop(stops - 1);
          return;
        case "Escape":
          if (!open) return;
          event.preventDefault();
          setOpen(false);
          // Focused directly rather than by index: the stop the toggle will
          // occupy after this render is not the one it occupies now.
          setActiveStop(primary.length);
          toggleRef.current?.focus();
          return;
        default:
          return;
      }
    },
    [active, focusStop, open, primary.length, setOpen, toggleStop],
  );

  if (primary.length === 0 && overflow.length === 0) return null;

  /*
   * Measured from the content rather than a hardcoded collapsed width, so
   * relabelling an action or passing a different number of them cannot leave
   * the bar clipping itself.
   */
  const width = content.width || "auto";

  return (
    <MotionConfig transition={positionSpring}>
      {/*
        `w-full min-w-0` is load-bearing. Dropped into a flex parent this
        element defaults to `min-width: auto` and refuses to shrink below its
        own content, so on a narrow screen it would push the bar off the edge
        instead of letting `max-w-full` below do its job.
      */}
      <div
        className={cn(
          "flex w-full min-w-0 justify-center px-4 py-2",
          className,
        )}
        {...rest}
      >
        <motion.div
          initial={false}
          animate={{ width }}
          transition={reduce ? { duration: 0.01 } : widthSpring}
          // The animated width is the content's intrinsic width; `max-w-full`
          // is what keeps it inside a 320px screen. Clamping in CSS rather
          // than in the measurement is deliberate — capping the animated value
          // against a measured container would make the container's size an
          // input to the width that determines the container's size.
          className="max-w-full rounded-full bg-[#219ebc] shadow-lg"
        >
          <div
            className={cn(
              "flex items-center justify-center overflow-x-auto rounded-full",
              // Scrollable rather than clipped, so the toggle stays reachable
              // when the expanded row is wider than the screen. Focusing a chip
              // that is off-edge scrolls it into view on its own.
              "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            )}
          >
            {/*
              `w-max` keeps this at its intrinsic width whatever the bar around
              it is doing, which is what makes the measurement above a constant
              rather than a feedback loop.
            */}
            <div
              ref={contentRef}
              role="toolbar"
              aria-label={label}
              aria-orientation="horizontal"
              className="flex w-max items-center gap-1.5 p-1.5 text-sm font-semibold"
            >
              <motion.div
                layout="position"
                className="flex items-center justify-center gap-1.5 will-change-transform"
              >
                {primary.map((action, index) => (
                  <ActionChip
                    key={action.id}
                    action={action}
                    reduce={reduce}
                    tabIndex={index === active ? 0 : -1}
                    onFocus={() => setActiveStop(index)}
                    onKeyDown={handleKeyDown}
                    buttonRef={(node) => {
                      actionRefs.current[index] = node;
                    }}
                  />
                ))}
              </motion.div>

              <AnimatePresence mode="popLayout">
                {open && (
                  <motion.div
                    id={overflowId}
                    className="flex items-center gap-1.5"
                    initial={
                      reduce
                        ? { opacity: 0 }
                        : { opacity: 0, filter: "blur(4px)" }
                    }
                    animate={
                      reduce
                        ? { opacity: 1 }
                        : { opacity: 1, filter: "blur(0px)" }
                    }
                    exit={
                      reduce
                        ? { opacity: 0 }
                        : { opacity: 0, filter: "blur(4px)" }
                    }
                    transition={
                      reduce
                        ? { duration: 0.01 }
                        : { duration: 0.15, ease: "easeOut" }
                    }
                  >
                    {overflow.map((action, index) => {
                      const stop = primary.length + index;
                      return (
                        <ActionChip
                          key={action.id}
                          action={action}
                          reduce={reduce}
                          tabIndex={stop === active ? 0 : -1}
                          onFocus={() => setActiveStop(stop)}
                          onKeyDown={handleKeyDown}
                          buttonRef={(node) => {
                            actionRefs.current[stop] = node;
                          }}
                        />
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                ref={toggleRef}
                type="button"
                layout="position"
                aria-label={moreLabel}
                aria-expanded={open}
                aria-controls={overflowId}
                tabIndex={active === toggleStop ? 0 : -1}
                onClick={() => setOpen(!open)}
                onFocus={() => setActiveStop(toggleStop)}
                onKeyDown={handleKeyDown}
                className={cn(
                  "focus-ring z-10 flex size-7 cursor-pointer items-center",
                  "justify-center rounded-4xl bg-surface shadow-sm",
                )}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={open ? "close" : "more"}
                    aria-hidden="true"
                    initial={
                      reduce
                        ? { opacity: 0 }
                        : { opacity: 0, scale: 0.25, filter: "blur(4px)" }
                    }
                    animate={
                      reduce
                        ? { opacity: 1 }
                        : { opacity: 1, scale: 1, filter: "blur(0px)" }
                    }
                    exit={
                      reduce
                        ? { opacity: 0 }
                        : { opacity: 0, scale: 0.25, filter: "blur(4px)" }
                    }
                    transition={
                      reduce
                        ? { duration: 0.01 }
                        : { type: "spring", duration: 0.4, bounce: 0 }
                    }
                  >
                    {open ? (
                      <X className="size-4 text-content-subtle" />
                    ) : (
                      <Ellipsis className="size-4 text-content" />
                    )}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </MotionConfig>
  );
}

export default InlineOverflow;
