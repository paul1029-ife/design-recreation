"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "motion/react";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/cn";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export interface NavLink {
  label: string;
  description: string;
  href: string;
}

export interface NavBanner {
  description: string;
  href: string;
}

export interface NavItem {
  label: string;
  links: readonly NavLink[];
  /** Optional full-width call to action below the links. */
  banner?: NavBanner;
}

export interface MegaNavProps extends React.ComponentPropsWithoutRef<"nav"> {
  items: readonly NavItem[];
  /** Names the navigation landmark. @default "Main" */
  label?: string;
}

/* -------------------------------------------------------------------------- */
/* Motion — kept verbatim from the original                                    */
/* -------------------------------------------------------------------------- */

/** The pill that slides between top-level items. */
const pillSpring = { type: "spring" as const, stiffness: 300, damping: 30 };
/** The panel's entrance. Lighter mass, so it arrives ahead of the pill. */
const panelSpring = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
  mass: 0.5,
};
/** The arrow tracking the active item — stiffer, because it must not lag the pill. */
const arrowSpring = { type: "spring" as const, stiffness: 400, damping: 40 };
const SWAP = { duration: 0.2 } as const;

/* -------------------------------------------------------------------------- */
/* Panel                                                                       */
/* -------------------------------------------------------------------------- */

function NavPanel({ item }: { item: NavItem }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {item.links.map((link) => (
        <a
          key={link.label}
          href={link.href}
          className="focus-ring group rounded-lg border border-border p-4 transition-colors hover:bg-surface-subtle"
        >
          <p className="font-semibold text-content">{link.label}</p>
          <p className="text-sm text-content-muted">{link.description}</p>
        </a>
      ))}

      {item.banner && (
        <a
          href={item.banner.href}
          // `group` lives here, on the element the arrow's `group-hover` is
          // relative to. The original put the modifier on the icon with no
          // group anywhere above it, so the nudge never fired.
          className="focus-ring group col-span-2 rounded-lg bg-accent/10 p-4 transition-colors hover:bg-accent/15"
        >
          <span className="flex items-center justify-between gap-4">
            <span className="font-semibold text-content">
              {item.banner.description}
            </span>
            <ArrowRight
              className="size-5 shrink-0 text-content transition-transform group-hover:translate-x-1"
              strokeWidth={2}
              aria-hidden="true"
            />
          </span>
        </a>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * A navigation bar whose sections share one panel.
 *
 * Separate dropdowns make every section feel like a different place, and the
 * panel appearing and disappearing between them hides the fact that they are
 * siblings. Keeping one panel and moving it — with an arrow that stays pointed
 * at whichever item you are on — keeps the relationship between the sections
 * visible while you browse across them.
 */
export function MegaNav({
  items,
  label = "Main",
  className,
  ...rest
}: MegaNavProps) {
  const reduce = useReducedMotion();
  const uid = useId();
  const panelId = `${uid}-panel`;

  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [arrowLeft, setArrowLeft] = useState(0);

  /*
   * Measured in a layout effect, not a passive one. The arrow is positioned
   * from the active item's centre, and measuring after paint means the first
   * open renders it at the previous offset and then jumps.
   */
  useLayoutEffect(() => {
    if (active === null) return;
    const item = itemRefs.current[active];
    const nav = navRef.current;
    if (!item || !nav) return;
    const itemRect = item.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();
    setArrowLeft(itemRect.left + itemRect.width / 2 - navRect.left);
  }, [active]);

  const close = useCallback((restoreFocus = false) => {
    setActive((current) => {
      if (restoreFocus && current !== null) itemRefs.current[current]?.focus();
      return null;
    });
  }, []);

  /* Escape closes from anywhere inside, including from a link in the panel. */
  useEffect(() => {
    if (active === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close(true);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [active, close]);

  /*
   * Hover opens, as in the original, but hover cannot be the only way in.
   * Arrows walk the bar, Enter and Space open, and the panel is reachable by
   * Tab once it is open.
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      switch (event.key) {
        case "ArrowRight":
          event.preventDefault();
          itemRefs.current[(index + 1) % items.length]?.focus();
          return;
        case "ArrowLeft":
          event.preventDefault();
          itemRefs.current[(index - 1 + items.length) % items.length]?.focus();
          return;
        case "ArrowDown":
          event.preventDefault();
          setActive(index);
          return;
        case "Escape":
          event.preventDefault();
          close(true);
          return;
        default:
          return;
      }
    },
    [close, items.length],
  );

  if (items.length === 0) return null;

  return (
    <nav
      ref={navRef}
      aria-label={label}
      className={cn("relative", className)}
      onPointerLeave={() => setActive(null)}
      {...rest}
    >
      <LayoutGroup>
        <ul className="flex items-center gap-2 rounded-full bg-surface p-1.5 shadow-resting">
          {items.map((item, index) => (
            <li key={item.label} className="relative">
              <button
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                type="button"
                aria-expanded={active === index}
                aria-controls={active === index ? panelId : undefined}
                onPointerEnter={() => setActive(index)}
                onClick={() => setActive(active === index ? null : index)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                className={cn(
                  "focus-ring relative cursor-pointer rounded-full px-4 py-2.5",
                  "font-medium whitespace-nowrap transition-colors",
                  active === index ? "text-content" : "text-content-muted",
                )}
              >
                <span className="relative z-10">{item.label}</span>

                {active === index && (
                  <motion.span
                    layoutId={`${uid}-pill`}
                    aria-hidden="true"
                    className="absolute inset-0 z-0 rounded-full bg-surface-subtle"
                    transition={reduce ? { duration: 0.01 } : pillSpring}
                  />
                )}
              </button>
            </li>
          ))}
        </ul>
      </LayoutGroup>

      <AnimatePresence>
        {active !== null && (
          <motion.div
            key="panel"
            id={panelId}
            className="absolute top-full left-0 z-20 mt-3 w-auto"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 15 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 15 }}
            transition={reduce ? { duration: 0.01 } : panelSpring}
          >
            <div className="relative rounded-xl border border-border bg-surface shadow-overlay">
              <motion.div
                aria-hidden="true"
                className="absolute -top-2"
                initial={false}
                animate={{ left: arrowLeft }}
                transition={reduce ? { duration: 0.01 } : arrowSpring}
              >
                <div className="size-4 -translate-x-1/2 rotate-45 border-t border-l border-border bg-surface" />
              </motion.div>

              <div className="relative p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, x: -20 }}
                    animate={reduce ? { opacity: 1 } : { opacity: 1, x: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, x: 20 }}
                    transition={reduce ? { duration: 0.01 } : SWAP}
                  >
                    <NavPanel item={items[active]} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default MegaNav;
