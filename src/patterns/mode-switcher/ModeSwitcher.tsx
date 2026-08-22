"use client";

import { useCallback, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/cn";

gsap.registerPlugin(useGSAP);

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export interface SwitcherMode {
  id: string;
  /** Doubles as the field's placeholder and its accessible name. */
  label: string;
  icon: React.ReactNode;
}

export interface ModeSwitcherProps extends Omit<
  React.ComponentPropsWithoutRef<"form">,
  "onSubmit" | "onChange"
> {
  /** Two or more. The button cycles through them in order. */
  modes: readonly SwitcherMode[];
  defaultMode?: string;
  mode?: string;
  onModeChange?: (id: string) => void;

  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  onSubmit?: (value: string, modeId: string) => void;

  /** Accessible name for the send button. @default "Send" */
  submitLabel?: string;
}

/* -------------------------------------------------------------------------- */
/* Motion — GSAP timings kept verbatim from the original                       */
/* -------------------------------------------------------------------------- */

const ICON_OUT = { duration: 0.2, ease: "power2.in" };
const ICON_IN = { duration: 0.9, ease: "elastic.out(1, 0.7)" };
const CHARS_IN = { duration: 0.5, ease: "elastic.out(1, 0.8)", stagger: 0.02 };

/**
 * Splits the label into per-character spans, hidden and nudged down, ready to
 * be flown in. Done imperatively because React does not own this node's
 * children — the whole element is `aria-hidden`, and the field carries the
 * real accessible name, so nothing here is load-bearing for assistive tech.
 */
function splitChars(
  element: HTMLElement | null,
  text: string,
): HTMLSpanElement[] {
  if (!element) return [];
  element.replaceChildren();
  return text.split("").map((char) => {
    const span = document.createElement("span");
    span.textContent = char === " " ? " " : char;
    span.style.display = "inline-block";
    span.style.opacity = "0";
    span.style.transform = "translateY(7px)";
    element.appendChild(span);
    return span;
  });
}

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * One composer that serves several modes, with the placeholder as the readout.
 *
 * A field that behaves differently depending on a mode set elsewhere is a trap:
 * you type the wrong kind of thing because nothing in the field said which kind
 * it wanted. Retyping the placeholder on every switch puts the answer in the
 * one place the eye is already resting before typing starts.
 */
export function ModeSwitcher({
  modes,
  defaultMode,
  mode: controlledMode,
  onModeChange,
  defaultValue = "",
  value: controlledValue,
  onValueChange,
  onSubmit,
  submitLabel = "Send",
  className,
  ...rest
}: ModeSwitcherProps) {
  const reduce = useReducedMotion();

  const iconRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const busy = useRef(false);

  const [uncontrolledMode, setUncontrolledMode] = useState(
    defaultMode ?? modes[0]?.id,
  );
  const modeId = controlledMode ?? uncontrolledMode;

  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const value = controlledValue ?? uncontrolledValue;

  const index = Math.max(
    0,
    modes.findIndex((m) => m.id === modeId),
  );
  const current = modes[index];

  const setValue = useCallback(
    (next: string) => {
      if (controlledValue === undefined) setUncontrolledValue(next);
      onValueChange?.(next);
    },
    [controlledValue, onValueChange],
  );

  const cycle = useCallback(() => {
    /*
     * Guarded with a ref rather than by disabling the button. Disabling a
     * control the user is mid-press on drops focus to the body in several
     * browsers, and this animation runs for a full second.
     */
    if (busy.current) return;

    const iconEl = iconRef.current;
    const textEl = textRef.current;
    // Checked *before* claiming the lock. The original set the flag first and
    // returned on a null ref, which left the button dead for good.
    if (!iconEl || !textEl) return;

    const next = modes[(index + 1) % modes.length];
    const commit = () => {
      if (controlledMode === undefined) setUncontrolledMode(next.id);
      onModeChange?.(next.id);
    };

    if (reduce) {
      commit();
      splitChars(textEl, next.label).forEach((span) => {
        span.style.opacity = "1";
        span.style.transform = "none";
      });
      return;
    }

    busy.current = true;
    const tl = gsap.timeline({
      onComplete: () => {
        busy.current = false;
      },
    });

    tl.to(iconEl, { opacity: 0, scale: 0.7, filter: "blur(7px)", ...ICON_OUT });
    tl.call(commit);
    // A beat of nothing, so React has committed the new icon before it is
    // flown back in. Without it the outgoing glyph is what reappears.
    tl.to({}, { duration: 0.001 });

    tl.to(
      iconEl,
      { opacity: 1, scale: 1, filter: "blur(0px)", ...ICON_IN },
      "syncPoint",
    );
    tl.call(
      () => {
        gsap.to(splitChars(textEl, next.label), {
          opacity: 1,
          y: 0,
          ...CHARS_IN,
        });
      },
      undefined,
      "syncPoint",
    );
  }, [controlledMode, index, modes, onModeChange, reduce]);

  /* First paint: type the starting label in. */
  useGSAP(() => {
    const chars = splitChars(textRef.current, current?.label ?? "");
    if (!chars.length) return;
    if (reduce) {
      gsap.set(chars, { opacity: 1, y: 0 });
      return;
    }
    gsap.to(chars, { opacity: 1, y: 0, ...CHARS_IN });
    // Empty deps on purpose: every later run is driven by `cycle`.
  }, []);

  /* The placeholder is a real overlay, so it has to get out of the way. */
  useGSAP(() => {
    if (!textRef.current) return;
    gsap.to(textRef.current, {
      opacity: value === "" ? 1 : 0,
      duration: reduce ? 0 : 0.2,
    });
  }, [value, reduce]);

  if (modes.length === 0) return null;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.(value, current.id);
      }}
      className={cn(
        "flex w-full min-w-0 justify-center px-4 sm:px-6",
        className,
      )}
      {...rest}
    >
      <div className="relative flex h-14 w-full max-w-2xl items-center overflow-hidden rounded-full bg-surface-hover shadow-lg">
        <motion.button
          type="button"
          onClick={cycle}
          whileTap={reduce ? undefined : { scale: 0.8 }}
          // Names the current mode, not just the action — otherwise the only
          // readout of which mode you are in is a placeholder that is painted
          // over the field and hidden from assistive tech.
          aria-label={`Mode: ${current.label}. Change mode`}
          className={cn(
            "focus-ring ml-1 flex h-12 w-18 shrink-0 items-center justify-center",
            "rounded-4xl bg-surface",
          )}
        >
          <span ref={iconRef} className="flex items-center justify-center">
            <span
              aria-hidden="true"
              className="text-content-muted [&>svg]:size-6"
            >
              {current.icon}
            </span>
          </span>
          <ChevronsUpDown
            className="size-5 text-content-subtle"
            aria-hidden="true"
          />
        </motion.button>

        {/* `h-full` here as well as on the field: the bar centres its items, so
            without an explicit height this wrapper is only as tall as its text
            and the field's `h-full` resolves to 23px. */}
        <div className="relative flex h-full min-w-0 flex-1 items-center">
          <input
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            aria-label={current.label}
            // `h-full`, not the original's `py-5`: that padding made the field
            // 68px tall inside a 56px bar, so its hit area was clipped by the
            // bar's `overflow-hidden` above and below the text.
            className={cn(
              "h-full w-full min-w-0 bg-transparent px-1 text-lg",
              "text-content caret-content outline-none",
            )}
          />
          {/*
            The visible placeholder. `aria-hidden` because it is split into one
            span per character, which some screen readers spell out letter by
            letter — the field's `aria-label` carries the same words properly.
            Positioned inside the field's own box rather than at a hardcoded
            offset from the bar, so it cannot drift from the text it imitates.
          */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-1 text-lg text-content-subtle"
          >
            <span ref={textRef} />
          </span>
        </div>

        {/*
          Announces the mode change to assistive tech. The button's own label
          updates too, but a name that changes under you is not reliably
          re-announced.
        */}
        <span aria-live="polite" className="sr-only">
          {current.label}
        </span>

        <button
          type="submit"
          aria-label={submitLabel}
          className={cn(
            "focus-ring mr-1 flex size-12 shrink-0 items-center justify-center",
            "rounded-full bg-surface",
          )}
        >
          <ArrowRight className="size-6 text-content" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}

export default ModeSwitcher;
