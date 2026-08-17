"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Pencil } from "lucide-react";

import { cn } from "@/lib/cn";
import { blurTransition, duration, ease, spring } from "@/lib/motion";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export interface EditableLabelProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "onChange" | "defaultValue"
> {
  /** Uncontrolled initial text. */
  defaultValue?: string;
  /** Controlled text. Pass with `onValueChange`. */
  value?: string;
  /** Fires on commit, never on keystroke — this is a rename, not a field. */
  onValueChange?: (value: string) => void;
  /** Shown when the value is empty. @default "Untitled" */
  placeholder?: string;
  /** Names what is being renamed, for assistive technology. @default "Name" */
  fieldLabel?: string;
  /** Rejects a draft before it commits. Return false to keep editing. */
  validate?: (draft: string) => boolean;
  disabled?: boolean;
  /**
   * Resting width in px. Sized for a ~15-character name; widen it for longer
   * ones rather than letting them truncate. @default 220
   */
  restingWidth?: number;
  /** Width while editing, in px. @default 290 */
  editingWidth?: number;
}

/* -------------------------------------------------------------------------- */
/* Motion                                                                      */
/* -------------------------------------------------------------------------- */

const iconVariants = {
  initial: { scale: 0, opacity: 0, filter: "blur(6px)" },
  animate: { scale: 1, opacity: 1, filter: "blur(0px)" },
  exit: { scale: 0, opacity: 0, filter: "blur(6px)" },
} as const;

const reducedIconVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
} as const;

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Rename in place.
 *
 * Renaming usually means leaving for a settings screen or a dialog, which puts
 * the thing being renamed out of sight at exactly the moment you are deciding
 * what to call it. Editing where the name already sits keeps the context — and
 * the surrounding layout — visible throughout.
 */
export function EditableLabel({
  defaultValue = "",
  value: controlledValue,
  onValueChange,
  placeholder = "Untitled",
  fieldLabel = "Name",
  validate,
  disabled = false,
  restingWidth = 220,
  editingWidth = 290,
  className,
  ...rest
}: EditableLabelProps) {
  const reduce = useReducedMotion();
  const uid = useId();
  const inputId = `${uid}-input`;

  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolled;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);

  // Select-all on entry: renaming usually replaces the name rather than
  // appending to it, so the common case should take one keystroke.
  useEffect(() => {
    if (!editing) return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [editing]);

  const startEditing = useCallback(() => {
    if (disabled) return;
    setDraft(value);
    setEditing(true);
  }, [disabled, value]);

  const commit = useCallback(() => {
    const next = draft.trim();
    // An empty rename is a mistake, not an instruction. Keep the old value.
    if (next === "" || validate?.(next) === false) {
      setEditing(false);
      editButtonRef.current?.focus();
      return;
    }
    if (!isControlled) setUncontrolled(next);
    onValueChange?.(next);
    setEditing(false);
    editButtonRef.current?.focus();
  }, [draft, validate, isControlled, onValueChange]);

  const cancel = useCallback(() => {
    setDraft(value);
    setEditing(false);
    editButtonRef.current?.focus();
  }, [value]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        commit();
      }
      if (event.key === "Escape") {
        event.preventDefault();
        cancel();
      }
    },
    [commit, cancel],
  );

  const transition = reduce ? { duration: 0.01 } : spring.snappy;
  const swap = reduce
    ? { duration: 0.01 }
    : { duration: duration.micro, ease: ease.out };

  return (
    <div
      className={cn("flex items-center justify-center", className)}
      {...rest}
    >
      {/*
        An explicit width pair, not `layout`. Sizing the pill to its content
        looked tidier and was wrong: the field has no intrinsic width, so
        entering edit mode collapsed the pill and then grew it a character at a
        time as you typed. The two widths are what give the resize a fixed
        distance to travel, which is the whole gesture.
      */}
      <motion.div
        initial={false}
        animate={{ width: editing ? editingWidth : restingWidth }}
        transition={transition}
        className={cn(
          "flex items-center gap-2 overflow-hidden rounded-full p-2",
          // Background *and* shadow. Only the shadow was transitioned before,
          // so the fill snapped while the ring eased — the two arriving apart
          // is what read as a hard edge at the end of the move.
          "transition-[background-color,box-shadow] duration-200 ease-out",
          editing
            ? "bg-surface shadow-[0_0_0_2.5px_var(--ring)]"
            : "bg-surface-subtle shadow-resting",
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {editing ? (
            <motion.input
              key="input"
              ref={inputRef}
              id={inputId}
              aria-label={fieldLabel}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={commit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={swap}
              className="ml-3 min-w-0 flex-1 bg-transparent text-lg font-semibold text-content outline-none"
            />
          ) : (
            <motion.span
              key="label"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={swap}
              // `min-w-0 truncate`, not just `whitespace-nowrap`. A flex item
              // defaults to `min-width: auto` and will not shrink below its own
              // text, so a long name does not clip itself — it shoves the
              // button out through the side of the pill. Truncating keeps the
              // button inside at any width.
              className={cn(
                "ml-3 min-w-0 flex-1 truncate text-lg font-semibold select-none",
                value ? "text-content" : "text-content-subtle",
              )}
            >
              {value || placeholder}
            </motion.span>
          )}
        </AnimatePresence>

        <AnimatePresence mode="popLayout" initial={false}>
          {editing ? (
            <motion.button
              key="confirm"
              type="button"
              // onMouseDown rather than onClick: the input's onBlur fires
              // first and would commit and unmount this button before the
              // click completed, so the press would land on nothing.
              onMouseDown={(event) => event.preventDefault()}
              onClick={commit}
              aria-label={`Save ${fieldLabel.toLowerCase()}`}
              variants={reduce ? reducedIconVariants : iconVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ ...transition, filter: blurTransition }}
              className="focus-ring grid size-10 shrink-0 cursor-pointer place-items-center rounded-full bg-accent text-accent-content"
            >
              <Check className="size-4" strokeWidth={2.5} aria-hidden="true" />
            </motion.button>
          ) : (
            <motion.button
              key="edit"
              ref={editButtonRef}
              type="button"
              onClick={startEditing}
              disabled={disabled}
              aria-label={`Edit ${fieldLabel.toLowerCase()}`}
              variants={reduce ? reducedIconVariants : iconVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ ...transition, filter: blurTransition }}
              className="focus-ring grid size-10 shrink-0 cursor-pointer place-items-center rounded-full bg-surface text-content-subtle hover:text-content disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Pencil className="size-4" strokeWidth={2} aria-hidden="true" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      <span role="status" aria-live="polite" className="sr-only">
        {editing ? `Editing ${fieldLabel.toLowerCase()}` : ""}
      </span>
    </div>
  );
}

export default EditableLabel;
