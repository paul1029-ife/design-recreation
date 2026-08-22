"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Search, X } from "lucide-react";

import { cn } from "@/lib/cn";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export interface Command {
  id: string;
  label: string;
  icon: React.ReactNode;
  /** Rendered as `<kbd>` chips, e.g. `["⌘", "S"]`. */
  shortcut?: readonly string[];
  onSelect?: () => void;
}

export interface CommandPaletteProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "onSelect"
> {
  commands: readonly Command[];
  /** Resting placeholder. @default "Search for anything" */
  collapsedLabel?: string;
  /** Placeholder once open. @default "Search commands…" */
  placeholder?: string;
  /** Heading above the results. @default "Suggestions" */
  groupLabel?: string;
  /** Bind ⌘K / Ctrl+K on the document. @default true */
  hotkey?: boolean;
}

/* -------------------------------------------------------------------------- */
/* Motion — kept verbatim from the original                                    */
/* -------------------------------------------------------------------------- */

const RADIUS = 30;
/** The dismiss button waits for the container to finish widening. */
const CLOSE_DELAY = 0.19;
const ITEM = { duration: 0.15 } as const;

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * A search field that becomes a command list.
 *
 * A command palette that arrives as a modal over the page throws away the one
 * piece of context people had — where the search box was. Growing the field
 * itself into the panel keeps the origin, so the list reads as the field
 * having more to say rather than as a new surface.
 */
export function CommandPalette({
  commands,
  collapsedLabel = "Search for anything",
  placeholder = "Search commands…",
  groupLabel = "Suggestions",
  hotkey = true,
  className,
  ...rest
}: CommandPaletteProps) {
  const reduce = useReducedMotion();
  const uid = useId();
  const listId = `${uid}-list`;

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const interacted = useRef(false);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  // Derived, not synchronised. Mirroring this into state via an effect costs a
  // render per keystroke and shows a stale list for one frame.
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(q));
  }, [commands, query]);

  // Clamped rather than reset in an effect: filtering can shorten the list
  // under a highlight that has already moved past the new end.
  const active = Math.min(activeIndex, Math.max(0, results.length - 1));

  /*
   * `AnimatePresence mode="wait"` holds the incoming element back until the
   * outgoing one has finished exiting, so at the moment `open` flips the
   * element we want to focus does not exist yet. Focusing from an effect keyed
   * on `open` therefore focuses `null` and drops focus to the body. These
   * flags let the ref callbacks below claim focus as each element mounts.
   */
  const focusTriggerOnMount = useRef(false);
  const focusFieldOnMount = useRef(false);

  const close = useCallback(() => {
    interacted.current = true;
    focusTriggerOnMount.current = true;
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);

  const openPalette = useCallback(() => {
    interacted.current = true;
    focusFieldOnMount.current = true;
    setOpen(true);
  }, []);

  const run = useCallback(
    (command: Command) => {
      command.onSelect?.();
      close();
    },
    [close],
  );

  useEffect(() => {
    if (!hotkey) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openPalette();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [hotkey, openPalette]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, close]);

  /**
   * APG combobox: the field keeps focus throughout and the highlight moves via
   * `aria-activedescendant`. Moving real DOM focus into the list instead would
   * take it off the input, and you have to keep typing.
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setActiveIndex((i) =>
            results.length ? (i + 1) % results.length : 0,
          );
          return;
        case "ArrowUp":
          event.preventDefault();
          setActiveIndex((i) =>
            results.length ? (i - 1 + results.length) % results.length : 0,
          );
          return;
        case "Home":
          event.preventDefault();
          setActiveIndex(0);
          return;
        case "End":
          event.preventDefault();
          setActiveIndex(Math.max(0, results.length - 1));
          return;
        case "Enter": {
          event.preventDefault();
          const command = results[active];
          if (command) run(command);
          return;
        }
        case "Escape":
          event.preventDefault();
          close();
          return;
        default:
          return;
      }
    },
    [active, close, results, run],
  );

  return (
    <div
      ref={rootRef}
      className={cn("flex w-full min-w-0 justify-center", className)}
      {...rest}
    >
      <AnimatePresence mode="wait">
        {!open ? (
          <motion.div
            key="collapsed"
            layoutId={`${uid}-shell`}
            style={{ borderRadius: RADIUS }}
            className="w-full max-w-[350px] bg-surface"
          >
            <button
              ref={(node) => {
                triggerRef.current = node;
                // Focus as it mounts, which is the first moment it exists.
                if (node && focusTriggerOnMount.current) {
                  focusTriggerOnMount.current = false;
                  node.focus();
                }
              }}
              type="button"
              onClick={openPalette}
              aria-label={collapsedLabel}
              aria-keyshortcuts="Meta+K Control+K"
              className={cn(
                "focus-ring flex w-full cursor-text items-center gap-2 px-4 py-3",
                "rounded-[30px] border border-border bg-surface shadow-resting",
                "transition-shadow duration-200 hover:shadow-floating",
              )}
            >
              <motion.span
                layoutId={`${uid}-field`}
                className="inline-flex items-center gap-2"
              >
                <Search
                  className="size-4 shrink-0 text-content-subtle"
                  aria-hidden="true"
                />
                <span className="truncate text-sm text-content-subtle">
                  {collapsedLabel}
                </span>
              </motion.span>
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            layoutId={`${uid}-shell`}
            style={{ borderRadius: RADIUS }}
            className="w-full max-w-[640px] overflow-hidden bg-surface shadow-overlay"
          >
            <motion.div
              layout
              className="mx-3 flex items-center gap-3 border-b border-border px-4 py-3"
            >
              <motion.span layoutId={`${uid}-field`} className="inline-flex">
                <Search
                  className="size-4 shrink-0 text-content-subtle"
                  aria-hidden="true"
                />
              </motion.span>

              <input
                ref={(node) => {
                  inputRef.current = node;
                  if (node && focusFieldOnMount.current) {
                    focusFieldOnMount.current = false;
                    node.focus();
                  }
                }}
                type="text"
                role="combobox"
                aria-expanded
                aria-controls={listId}
                aria-label={placeholder}
                aria-autocomplete="list"
                aria-activedescendant={
                  results[active]
                    ? `${uid}-opt-${results[active].id}`
                    : undefined
                }
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="min-w-0 flex-1 bg-transparent text-sm text-content placeholder-content-subtle outline-none"
              />

              {/*
                The original rendered this button with no children and no
                label — an invisible, unnameable control sitting in the tab
                order. It has a glyph and a name now.
              */}
              <motion.button
                type="button"
                onClick={close}
                aria-label="Close command palette"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={
                  reduce ? { duration: 0.01 } : { delay: CLOSE_DELAY }
                }
                className="focus-ring shrink-0 rounded p-1 text-content-subtle transition-colors hover:bg-surface-subtle hover:text-content"
              >
                <X className="size-4" aria-hidden="true" />
              </motion.button>
            </motion.div>

            <div className="relative max-h-96 overflow-y-auto">
              <div className="px-3 py-2">
                <motion.div
                  layout="position"
                  id={`${uid}-group`}
                  className="px-3 py-1.5 text-xs font-medium tracking-wider text-content-subtle uppercase"
                >
                  {groupLabel}
                </motion.div>

                <div
                  role="listbox"
                  id={listId}
                  aria-labelledby={`${uid}-group`}
                >
                  <AnimatePresence mode="popLayout">
                    {results.length === 0 ? (
                      <motion.p
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="px-3 py-8 text-center text-sm text-content-subtle"
                      >
                        No commands found
                      </motion.p>
                    ) : (
                      <motion.div
                        layout="preserve-aspect"
                        className="min-h-10 space-y-0.5"
                      >
                        {results.map((command, index) => (
                          <motion.button
                            key={command.id}
                            id={`${uid}-opt-${command.id}`}
                            type="button"
                            role="option"
                            aria-selected={index === active}
                            tabIndex={-1}
                            onClick={() => run(command)}
                            onPointerMove={() => setActiveIndex(index)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={reduce ? { duration: 0.01 } : ITEM}
                            className={cn(
                              "flex w-full cursor-pointer items-center justify-between gap-3",
                              "rounded-md px-3 py-2 transition-colors duration-200",
                              index === active && "bg-surface-subtle",
                            )}
                          >
                            <span className="flex flex-1 items-center gap-3">
                              <span
                                aria-hidden="true"
                                className="shrink-0 text-content-subtle [&>svg]:size-4"
                              >
                                {command.icon}
                              </span>
                              <span className="text-sm font-medium text-content">
                                {command.label}
                              </span>
                            </span>

                            {command.shortcut?.length ? (
                              <span className="flex shrink-0 items-center gap-1">
                                {command.shortcut.map((key) => (
                                  <kbd
                                    key={key}
                                    className={cn(
                                      "inline-flex size-4 items-center justify-center rounded",
                                      "border border-border bg-surface-subtle text-xs",
                                      "font-medium text-content-muted",
                                    )}
                                  >
                                    {key}
                                  </kbd>
                                ))}
                              </span>
                            ) : null}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/*
                Sticky, not absolute. Absolutely positioned against the
                scrolling box it would scroll away with the content it is
                meant to be fading.
              */}
              <div
                aria-hidden="true"
                className="pointer-events-none sticky bottom-0 h-8 bg-gradient-to-t from-surface to-transparent"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CommandPalette;
