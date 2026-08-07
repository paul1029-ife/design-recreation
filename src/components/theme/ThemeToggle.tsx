"use client";

import { useSyncExternalStore } from "react";
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
      {OPTIONS.map(({ value, label, Icon }) => {
        const selected = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={label}
            onClick={(event) =>
              // Origin is the button the user actually pressed, so the reveal
              // reads as radiating from their click rather than from an
              // arbitrary point.
              revealWithCircularClip(centreOf(event.currentTarget), () =>
                setTheme(value),
              )
            }
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
