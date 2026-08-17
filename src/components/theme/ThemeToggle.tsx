"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";

import { cn } from "@/lib/cn";
import { centreOf, revealWithCircularClip } from "@/lib/view-transition";

/**
 * True once hydrated, false during SSR and the first client render.
 *
 * The usual `useState(false)` + `useEffect(() => setMounted(true))` does the
 * same job but calls setState synchronously in an effect, which cascades an
 * extra render. useSyncExternalStore expresses "server snapshot differs from
 * client snapshot" directly, with no subscription and no second render.
 */
const noop = () => () => {};
function useHydrated(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

const OPTIONS = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "system", label: "System", Icon: Monitor },
  { value: "dark", label: "Dark", Icon: Moon },
] as const;

/**
 * Three-state theme control: light, system, dark.
 *
 * Built as a radiogroup rather than a cycling button so the current value is
 * announced and directly selectable — a cycling toggle forces screen-reader
 * users to guess how many presses reach the state they want.
 *
 * Renders a same-sized placeholder until mounted. The resolved theme is only
 * known on the client, and rendering the wrong icon first then swapping it is
 * a visible flash.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const hydrated = useHydrated();
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = useCallback(
    (value: string, origin: HTMLElement) => {
      // Origin is the control that actually changed the value, so the reveal
      // radiates from it whether it was clicked or arrowed onto.
      revealWithCircularClip(centreOf(origin), () => setTheme(value));
    },
    [setTheme],
  );

  /**
   * APG radiogroup: arrows move selection *and* focus, wrapping at both ends.
   * The group is one tab stop — Tab enters and leaves, it does not walk the
   * three options.
   */
  const handleKeyDown = useCallback(
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

      const last = OPTIONS.length - 1;
      const next =
        event.key === "ArrowRight" || event.key === "ArrowDown"
          ? (index + 1) % OPTIONS.length
          : event.key === "ArrowLeft" || event.key === "ArrowUp"
            ? (index - 1 + OPTIONS.length) % OPTIONS.length
            : event.key === "Home"
              ? 0
              : last;

      const node = buttonRefs.current[next];
      node?.focus();
      if (node) select(OPTIONS[next].value, node);
    },
    [select],
  );

  if (!hydrated) {
    return (
      <div
        className={cn(
          "h-8 w-[6.5rem] rounded-full border border-border bg-surface",
          className,
        )}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-border bg-surface p-0.5",
        className,
      )}
    >
      {OPTIONS.map(({ value, label, Icon }, index) => {
        const selected = theme === value;
        return (
          <button
            key={value}
            ref={(node) => {
              buttonRefs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={label}
            /*
             * Roving tabindex: the group is a single tab stop. Falls back to
             * the first option when `theme` is a value not in this list, so the
             * group can never end up with no tab stop at all.
             */
            tabIndex={
              selected ||
              (index === 0 && !OPTIONS.some((o) => o.value === theme))
                ? 0
                : -1
            }
            onClick={(event) => select(value, event.currentTarget)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              "focus-ring grid size-7 cursor-pointer place-items-center rounded-full",
              "transition-colors duration-100",
              selected
                ? "bg-surface-active text-content"
                : "text-content-subtle hover:text-content",
            )}
          >
            <Icon className="size-3.5" strokeWidth={2} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
