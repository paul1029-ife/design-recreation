"use client";

import { useCallback, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/cn";
import { duration, ease, spring } from "@/lib/motion";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export interface AccordionItem {
  /** Stable, unique. Used as the open value and for ARIA wiring. */
  id: string;
  title: string;
  content: React.ReactNode;
  /** Rendered at 20×20 in the leading slot. */
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface AccordionProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "onChange" | "defaultValue"> {
  items: readonly AccordionItem[];
  /** Uncontrolled initial open item. `null` starts fully collapsed. */
  defaultOpenId?: string | null;
  /** Controlled open item. Pass with `onOpenChange`. */
  openId?: string | null;
  onOpenChange?: (id: string | null) => void;
  /** Whether clicking the open item closes it. @default true */
  collapsible?: boolean;
}

/* -------------------------------------------------------------------------- */
/* Geometry                                                                    */
/* -------------------------------------------------------------------------- */

/** Corner radius of a group's outer edges, px. Matches --radius-xl. */
const RADIUS = 19;
/** Gap between separated groups, px. */
const GROUP_GAP = 8;

/**
 * Group membership is derived, never stored.
 *
 * Items are rendered as ONE flat list and never re-parented. Re-parenting them
 * into per-group wrappers would destroy each item's DOM identity exactly when
 * it needs to animate, so the "containers" are drawn instead: an item rounds
 * and borders its top edge when it starts a group and its bottom edge when it
 * ends one. Three wrappers and a flat list are visually identical; only one of
 * them keeps identity stable through the transition.
 *
 * With `active` at index a, groups are [0..a-1] [a] [a+1..n]. The expressions
 * below degenerate correctly at the edges: a === -1 (nothing open) collapses to
 * a single group, and a === 0 or a === n yields exactly two.
 */
function startsGroup(index: number, active: number): boolean {
  return index === 0 || index === active || index === active + 1;
}

function endsGroup(index: number, active: number, count: number): boolean {
  return index === count - 1 || index === active - 1 || index === active;
}

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

export function Accordion({
  items,
  defaultOpenId = null,
  openId: controlledOpenId,
  onOpenChange,
  collapsible = true,
  className,
  ...rest
}: AccordionProps) {
  const baseId = useId();
  const reduce = useReducedMotion();
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const [uncontrolledOpenId, setUncontrolledOpenId] = useState<string | null>(
    defaultOpenId,
  );
  const isControlled = controlledOpenId !== undefined;
  const openIdValue = isControlled ? controlledOpenId : uncontrolledOpenId;

  const setOpenId = useCallback(
    (next: string | null) => {
      if (!isControlled) setUncontrolledOpenId(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const toggle = useCallback(
    (id: string) => {
      if (id === openIdValue) {
        if (collapsible) setOpenId(null);
        return;
      }
      setOpenId(id);
    },
    [openIdValue, collapsible, setOpenId],
  );

  /** APG accordion: arrows move between headers, Home/End jump to the ends. */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      const keys = ["ArrowDown", "ArrowUp", "Home", "End"];
      if (!keys.includes(event.key)) return;
      event.preventDefault();

      const last = items.length - 1;
      const next =
        event.key === "ArrowDown"
          ? (index + 1) % items.length
          : event.key === "ArrowUp"
            ? (index - 1 + items.length) % items.length
            : event.key === "Home"
              ? 0
              : last;

      triggerRefs.current[next]?.focus();
    },
    [items.length],
  );

  if (items.length === 0) return null;

  const active = items.findIndex((item) => item.id === openIdValue);

  /**
   * Bounce is for arrival, not departure.
   *
   * Expanding — groups pushing apart to make room — overshoots and settles,
   * which reads as the blocks having weight. Rejoining into the single
   * container uses the damped spring instead: an overshoot on the way *out*
   * reads as instability rather than energy.
   */
  const isExpanding = active !== -1;
  const positionTransition = reduce
    ? { duration: 0.01 }
    : isExpanding
      ? spring.bouncy
      : spring.smooth;

  return (
    <div className={cn("w-full", className)} {...rest}>
      {/*
        A plain list, not a set of group wrappers. See startsGroup() for why.
        Borders are always present at full width and only their colour changes,
        so separating a group never shifts layout by the border's 1px.
      */}
      <ul className="flex flex-col">
        {items.map((item, index) => {
          const isOpen = item.id === openIdValue;
          const opensGroup = startsGroup(index, active);
          const closesGroup = endsGroup(index, active, items.length);
          const triggerId = `${baseId}-trigger-${item.id}`;
          const panelId = `${baseId}-panel-${item.id}`;

          return (
            <motion.li
              key={item.id}
              // "position" only: the item's *height* is driven by its own
              // content animation below. Letting `layout` animate size too
              // would have the two fight over the same pixels.
              layout="position"
              transition={positionTransition}
              animate={{
                borderTopLeftRadius: opensGroup ? RADIUS : 0,
                borderTopRightRadius: opensGroup ? RADIUS : 0,
                borderBottomLeftRadius: closesGroup ? RADIUS : 0,
                borderBottomRightRadius: closesGroup ? RADIUS : 0,
                marginTop: opensGroup ? (index === 0 ? 0 : GROUP_GAP) : -1,
              }}
              style={{ willChange: "transform" }}
              className={cn(
                "relative border border-x-border",
                "transition-colors duration-200",
                // Inner edges stay transparent so items in a group read as one
                // block; the -1px margin above collapses the doubled border.
                opensGroup ? "border-t-border" : "border-t-transparent",
                closesGroup ? "border-b-border" : "border-b-transparent",
                // The open item tints as a whole block — header and panel
                // together — so the two never read as separate surfaces.
                isOpen ? "bg-surface-subtle" : "bg-surface",
              )}
            >
              <h3 className="m-0">
                <button
                  ref={(node) => {
                    triggerRefs.current[index] = node;
                  }}
                  type="button"
                  id={triggerId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  disabled={item.disabled}
                  onClick={() => toggle(item.id)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  // The focus outline traces the button's own corners, so it
                  // has to match the group edge it sits on — otherwise a
                  // square ring hangs off a rounded container. Inset by the
                  // item's 1px border. Not animated: a focus ring should
                  // arrive immediately, not spring into place.
                  style={{
                    borderTopLeftRadius: opensGroup ? RADIUS - 1 : 0,
                    borderTopRightRadius: opensGroup ? RADIUS - 1 : 0,
                    borderBottomLeftRadius:
                      closesGroup && !isOpen ? RADIUS - 1 : 0,
                    borderBottomRightRadius:
                      closesGroup && !isOpen ? RADIUS - 1 : 0,
                  }}
                  className={cn(
                    "focus-ring group relative flex w-full cursor-pointer",
                    "items-center gap-3 px-4 py-3.5 text-left",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                  )}
                >
                  {/*
                    Hover reads as an inset pill rather than a full-bleed row.
                    A row-wide background would need to match the item's group
                    corners — which change as groups reorganise — and would
                    stop dead at the panel boundary on the open item. An inset
                    layer sidesteps both.
                  */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "pointer-events-none absolute inset-x-1 inset-y-0.5 rounded-xl",
                      "bg-surface-hover opacity-0 transition-opacity duration-150",
                      !isOpen &&
                        !item.disabled &&
                        "group-hover:opacity-100",
                    )}
                  />

                  {item.icon ? (
                    <span
                      aria-hidden="true"
                      className="relative grid size-5 shrink-0 place-items-center text-content-subtle [&>svg]:size-5"
                    >
                      {item.icon}
                    </span>
                  ) : null}

                  <span className="relative flex-1 text-base font-semibold text-content">
                    {item.title}
                  </span>

                  <motion.span
                    aria-hidden="true"
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={
                      reduce
                        ? { duration: 0.01 }
                        : isOpen
                          ? spring.smooth
                          : spring.smooth
                    }
                    className="relative grid size-5 shrink-0 place-items-center text-content-subtle"
                    style={{ willChange: "transform" }}
                  >
                    <ChevronDown className="size-5" strokeWidth={2} />
                  </motion.span>
                </button>
              </h3>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="panel"
                    id={panelId}
                    role="region"
                    aria-labelledby={triggerId}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    // Exit carries its own timing so the bouncy spring below
                    // never runs backwards. Collapsing stays a fast, decisive
                    // tween — a panel that springs shut reads as a glitch.
                    exit={{
                      height: 0,
                      opacity: 0,
                      transition: {
                        height: { duration: duration.fast, ease: ease.in },
                        opacity: { duration: duration.micro, ease: ease.in },
                      },
                    }}
                    // Height is a layout property and normally banned, but a
                    // disclosure has to reveal content of unknown size and no
                    // transform can do that without clipping or distorting it.
                    // The spring overshoots past the content's natural height
                    // and settles back; `overflow-hidden` keeps that as extra
                    // breathing room rather than exposed content.
                    transition={
                      reduce
                        ? { duration: 0.01 }
                        : {
                            height: spring.bouncy,
                            opacity: {
                              duration: duration.standard,
                              ease: ease.out,
                            },
                          }
                    }
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 text-base leading-relaxed text-content-muted">
                      {item.content}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

export default Accordion;
