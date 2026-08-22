"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "motion/react";
import { Search, X } from "lucide-react";

import { cn } from "@/lib/cn";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export interface SearchFilter {
  id: string;
  label: string;
  icon: React.ReactNode;
  /** Applied to the moving pill while selected, e.g. `"bg-rose-100"`. */
  activeClassName?: string;
  /** Applied to the icon and label while selected, e.g. `"text-rose-600"`. */
  accentClassName?: string;
}

export interface InlineSearchProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "onChange" | "defaultValue"
> {
  /** Two or three. They collapse to nothing while searching, so keep them cheap. */
  filters: readonly SearchFilter[];
  /** Names the filter group, e.g. "Browse". */
  filtersLabel: string;
  defaultFilter?: string;
  filter?: string;
  onFilterChange?: (id: string) => void;

  defaultQuery?: string;
  query?: string;
  onQueryChange?: (query: string) => void;

  placeholder?: string;
  /** Accessible name for the trigger and the field. @default "Search" */
  searchLabel?: string;
  /** Accessible name for the dismiss button. @default "Close search" */
  closeLabel?: string;
  /** Width the field opens to, in px. @default 250 */
  expandedWidth?: number;

  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/* -------------------------------------------------------------------------- */
/* Motion — kept verbatim from the original                                    */
/* -------------------------------------------------------------------------- */

/*
 * 200/19 is damping ratio 0.67. The bar is two pills trading one pool of
 * space, and at this ratio the one that grows arrives slightly before the one
 * that shrinks has finished — which is what makes it read as a handover rather
 * than as two independent resizes.
 */
const elastic = {
  type: "spring" as const,
  stiffness: 200,
  damping: 19,
  mass: 1,
};

/** 300/25 is ratio 0.72. Drives the shared-layout pill between filters. */
const pillSpring = { type: "spring" as const, stiffness: 300, damping: 25 };

const COLLAPSED_WIDTH = 48;
const RADIUS = 28;

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * A bar where search and the browse filters trade the same strip of space.
 *
 * Search needs room to type and the filters are already using it. Putting them
 * side by side makes both cramped; putting search on another screen loses the
 * filters entirely. Handing the space over — filters collapsing to a dismiss
 * button as the field opens — keeps one bar doing both jobs.
 */
export function InlineSearch({
  filters,
  filtersLabel,
  defaultFilter,
  filter: controlledFilter,
  onFilterChange,
  defaultQuery = "",
  query: controlledQuery,
  onQueryChange,
  placeholder = "Search…",
  searchLabel = "Search",
  closeLabel = "Close search",
  expandedWidth = 250,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  className,
  ...rest
}: InlineSearchProps) {
  const reduce = useReducedMotion();
  const uid = useId();
  const fieldId = `${uid}-field`;

  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const filterRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const interacted = useRef(false);

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;

  const [uncontrolledQuery, setUncontrolledQuery] = useState(defaultQuery);
  const query = controlledQuery ?? uncontrolledQuery;

  const [uncontrolledFilter, setUncontrolledFilter] = useState(
    defaultFilter ?? filters[0]?.id,
  );
  const selected = controlledFilter ?? uncontrolledFilter;

  const setQuery = useCallback(
    (next: string) => {
      if (controlledQuery === undefined) setUncontrolledQuery(next);
      onQueryChange?.(next);
    },
    [controlledQuery, onQueryChange],
  );

  const setOpen = useCallback(
    (next: boolean) => {
      interacted.current = true;
      if (controlledOpen === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange],
  );

  const close = useCallback(() => {
    // Clearing on dismiss matches the browser's own search fields: the field
    // going away with a query still in it leaves the results filtered by
    // something the user can no longer see.
    setQuery("");
    setOpen(false);
  }, [setOpen, setQuery]);

  const selectFilter = useCallback(
    (id: string) => {
      if (controlledFilter === undefined) setUncontrolledFilter(id);
      onFilterChange?.(id);
    },
    [controlledFilter, onFilterChange],
  );

  /*
   * The field is what the trigger promised, so focus has to follow it in —
   * and the trigger is what the dismiss button replaced, so focus has to come
   * back out. `interacted` keeps this from stealing focus on mount.
   */
  useEffect(() => {
    if (!interacted.current) return;
    if (open) inputRef.current?.focus();
    else triggerRef.current?.focus();
  }, [open]);

  /** APG radiogroup: arrows move selection and focus together, wrapping. */
  const handleFilterKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      const keys = [
        "ArrowRight",
        "ArrowDown",
        "ArrowLeft",
        "ArrowUp",
        "Home",
        "End",
      ];
      if (!keys.includes(event.key)) return;
      event.preventDefault();

      const last = filters.length - 1;
      const next =
        event.key === "ArrowRight" || event.key === "ArrowDown"
          ? (index + 1) % filters.length
          : event.key === "ArrowLeft" || event.key === "ArrowUp"
            ? (index - 1 + filters.length) % filters.length
            : event.key === "Home"
              ? 0
              : last;

      selectFilter(filters[next].id);
      filterRefs.current[next]?.focus();
    },
    [filters, selectFilter],
  );

  if (filters.length === 0) return null;

  return (
    <LayoutGroup>
      <div
        className={cn(
          // A container query, not a viewport one: this bar is as likely to sit
          // in a narrow column on a wide screen as on a phone, and it is the
          // space it has that decides what fits.
          "@container flex w-full min-w-0 justify-center p-4",
          className,
        )}
        {...rest}
      >
        <div className="flex min-w-0 items-center gap-3">
          {/* Search pill */}
          <motion.div
            role="search"
            initial={false}
            animate={{ width: open ? expandedWidth : COLLAPSED_WIDTH }}
            transition={reduce ? { duration: 0.01 } : elastic}
            className={cn(
              "relative flex h-12 items-center overflow-hidden bg-surface shadow-resting",
              // Closed, this is a circle, and a circle that flex has squeezed
              // by 9px reads as broken rather than as tight. Open, it is a
              // rectangle and can give up width happily — which is what keeps
              // the dismiss button on screen instead of off the edge.
              open ? "min-w-0 shrink" : "shrink-0",
            )}
            style={{ borderRadius: RADIUS }}
          >
            <motion.button
              ref={triggerRef}
              type="button"
              layout="position"
              aria-label={searchLabel}
              aria-expanded={open}
              // Only while the field exists — `aria-controls` pointing at an
              // id that is not in the document is a dangling reference.
              aria-controls={open ? fieldId : undefined}
              onClick={() => setOpen(!open)}
              // Blurs as it shrinks. Unusual, and kept — it is the one bit of
              // this bar that acknowledges the press rather than the result.
              whileTap={
                reduce ? undefined : { scale: 0.9, filter: "blur(0.8px)" }
              }
              transition={reduce ? { duration: 0.01 } : elastic}
              className="focus-ring z-10 mx-auto flex size-12 shrink-0 items-center justify-center"
              style={{ borderRadius: RADIUS }}
            >
              <Search
                className="size-6 text-content-muted"
                strokeWidth={2.5}
                aria-hidden="true"
              />
            </motion.button>

            <AnimatePresence mode="popLayout">
              {open && (
                <motion.input
                  key="field"
                  ref={inputRef}
                  id={fieldId}
                  type="search"
                  aria-label={searchLabel}
                  placeholder={placeholder}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      event.preventDefault();
                      close();
                    }
                  }}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, x: -20 }}
                  animate={reduce ? { opacity: 1 } : { opacity: 1, x: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, x: -20 }}
                  transition={{ duration: reduce ? 0.01 : 0.4 }}
                  // 16px or larger, so iOS Safari does not zoom the page on focus.
                  className={cn(
                    "h-full w-full min-w-0 border-none bg-transparent pr-4 text-base",
                    "text-content placeholder-content-subtle outline-none",
                    "[&::-webkit-search-cancel-button]:hidden",
                  )}
                />
              )}
            </AnimatePresence>
          </motion.div>

          {/* Filters, or the dismiss button that replaced them */}
          <motion.div
            layout
            transition={reduce ? { duration: 0.01 } : elastic}
            className="relative flex h-12 shrink-0 items-center overflow-hidden bg-surface shadow-resting"
            style={{ borderRadius: RADIUS }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {open ? (
                <motion.button
                  key="dismiss"
                  type="button"
                  aria-label={closeLabel}
                  onClick={close}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
                  animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
                  transition={
                    reduce ? { duration: 0.01 } : { ...elastic, delay: 0.1 }
                  }
                  whileTap={reduce ? undefined : { scale: 0.85 }}
                  className="focus-ring flex size-12 items-center justify-center"
                  style={{ borderRadius: RADIUS }}
                >
                  <X
                    className="size-5 text-content-muted"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                </motion.button>
              ) : (
                <motion.div
                  key="filters"
                  role="radiogroup"
                  aria-label={filtersLabel}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={reduce ? { duration: 0.01 } : undefined}
                  className="flex h-full items-center gap-1 px-1.5"
                >
                  {filters.map((entry, index) => {
                    const isSelected = entry.id === selected;
                    return (
                      <button
                        key={entry.id}
                        ref={(node) => {
                          filterRefs.current[index] = node;
                        }}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        // Carried always, so the name survives the narrow tier
                        // below where the visible label is dropped. It matches
                        // the visible text exactly, so voice control still
                        // works when the label is showing.
                        aria-label={entry.label}
                        // Roving tabindex: the group is a single tab stop.
                        tabIndex={isSelected ? 0 : -1}
                        onClick={() => selectFilter(entry.id)}
                        onKeyDown={(event) => handleFilterKeyDown(event, index)}
                        className={cn(
                          // Full height, not `py-2.5`. The visible pill is 40px
                          // tall, which is under the 44px touch minimum — so
                          // the button fills the bar and the pill is inset
                          // instead, leaving the look alone and the target
                          // legal.
                          "focus-ring relative h-full px-3 text-sm font-medium",
                          // The original's roomier padding, kept for the width
                          // it was designed at rather than forced on every one.
                          "@min-[420px]:px-5",
                          "whitespace-nowrap transition-colors",
                          isSelected
                            ? "text-content"
                            : "text-content-subtle hover:text-content-muted",
                        )}
                        style={{ borderRadius: RADIUS }}
                      >
                        {isSelected && (
                          <motion.span
                            layoutId="inline-search-filter"
                            aria-hidden="true"
                            initial={false}
                            transition={
                              reduce ? { duration: 0.01 } : pillSpring
                            }
                            className={cn(
                              "absolute inset-x-0 inset-y-1",
                              entry.activeClassName ?? "bg-surface-subtle",
                            )}
                            style={{ borderRadius: RADIUS }}
                          />
                        )}
                        <span
                          className={cn(
                            "relative z-10 flex items-center justify-center gap-1 font-semibold",
                            isSelected ? entry.accentClassName : undefined,
                          )}
                        >
                          <span aria-hidden="true" className="[&>svg]:size-5">
                            {entry.icon}
                          </span>
                          {/*
                            Dropped rather than truncated when the bar is too
                            narrow for both filters and the search button. A
                            clipped "Favori…" is worse than the icon alone, and
                            the accessible name on the button is unaffected.
                          */}
                          <span className="hidden @min-[300px]:inline">
                            {entry.label}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </LayoutGroup>
  );
}

export default InlineSearch;
