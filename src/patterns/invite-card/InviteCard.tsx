"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  AnimatePresence,
  cubicBezier,
  motion,
  useReducedMotion,
} from "motion/react";
import { Check, Copy, Globe, Send, UserPlus, X } from "lucide-react";

import { cn } from "@/lib/cn";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export interface Invitee {
  /**
   * Stable identity for this invitation, assigned when the address is staged
   * and carried into the list. Not the email — see the note on `layoutId`
   * below for why that distinction is load-bearing.
   */
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface InviteCardProps extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "onChange"
> {
  /** The link being shared. */
  url: string;
  title?: string;
  linkLabel?: string;
  linkDescription?: string;
  placeholder?: string;

  defaultLinkEnabled?: boolean;
  linkEnabled?: boolean;
  onLinkEnabledChange?: (enabled: boolean) => void;

  defaultInvitees?: readonly Invitee[];
  invitees?: readonly Invitee[];
  onInviteesChange?: (invitees: readonly Invitee[]) => void;

  /**
   * Turn an address into a display name and avatar — a directory lookup, say.
   * Defaults to the local part of the address and generated initials.
   */
  resolveInvitee?: (email: string) => { name: string; avatarUrl?: string };
}

/* -------------------------------------------------------------------------- */
/* Motion                                                                      */
/* -------------------------------------------------------------------------- */

/*
 * The section is ~126px tall. The original animated `maxHeight` 0→350 over
 * 260ms on an accelerating curve, so `overflow: hidden` ran out of content to
 * reveal about 60% of the way through: the *visible* reveal was only ~153ms,
 * and it ended while still moving at ~1600px/s. That is an abrupt stop, but at
 * 153ms there is no time to track the box, so it reads as a flick rather than
 * a snap.
 *
 * Animating the real height — which is what stops the card clipping itself
 * once five people are invited — removed the cap, so the same 260ms became
 * fully visible. A 70% longer reveal on a curve that is still speeding up at
 * the end gives the eye enough time to follow the acceleration and expect it
 * to continue, and the stop becomes legible. That is the snap.
 *
 * So: keep the original's tempo, and arrive at rest instead of at speed.
 * ~167ms of visible reveal, ending at ~36px/s rather than ~750.
 *
 * The collapse keeps the original's decelerating curve. Its visible portion
 * was only ~52ms behind the cap, which is close enough to instant that there
 * was nothing to smooth; at 150ms it reads as closing rather than cutting,
 * and it still settles rather than stopping.
 */
const expandEase = cubicBezier(0.16, 0.84, 0.44, 1);
const collapseEase = cubicBezier(0.25, 0.46, 0.45, 0.94);

const EXPAND = { duration: 0.18, ease: expandEase };
const COLLAPSE = { duration: 0.15, ease: collapseEase };
/** The chip→row morph. Short: it is a hand-off, not a journey. */
const MORPH = { duration: 0.17 };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* -------------------------------------------------------------------------- */
/* Avatar                                                                      */
/* -------------------------------------------------------------------------- */

/** Deterministic hue, so the same person is the same colour every render. */
function hueFrom(seed: string): number {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 360;
  }
  return hash;
}

function initialsFrom(name: string): string {
  const parts = name
    .trim()
    .split(/[\s._-]+/)
    .filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function Avatar({
  invitee,
  className,
}: {
  invitee: Invitee;
  className?: string;
}) {
  if (invitee.avatarUrl) {
    return (
      // A plain <img>, not next/image: this is a copy-paste component and it
      // has to work outside Next. Avatars are ~32px and already sized here, so
      // there is nothing for the optimiser to win.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={invitee.avatarUrl}
        alt=""
        className={cn("rounded-full object-cover", className)}
      />
    );
  }
  const hue = hueFrom(invitee.email);
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid place-items-center rounded-full text-[0.6em] font-semibold",
        className,
      )}
      style={{
        backgroundColor: `oklch(0.86 0.07 ${hue})`,
        color: `oklch(0.36 0.09 ${hue})`,
      }}
    >
      {initialsFrom(invitee.name)}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * A share card where a typed address becomes a chip before it becomes an
 * invitation.
 *
 * Sending an invite to the wrong address is not undoable by the sender, and a
 * bare text field gives you nothing to check before you commit. Resolving the
 * address into a named chip inside the field puts the confirmation where the
 * mistake would be made, and the chip then travels into the list so it is
 * obvious where what you typed ended up.
 */
export function InviteCard({
  url,
  title = "Share",
  linkLabel = "Anyone",
  linkDescription = "Everyone with link can access",
  placeholder = "Enter email to share",
  defaultLinkEnabled = false,
  linkEnabled: controlledLink,
  onLinkEnabledChange,
  defaultInvitees = [],
  invitees: controlledInvitees,
  onInviteesChange,
  resolveInvitee,
  className,
  ...rest
}: InviteCardProps) {
  const reduce = useReducedMotion();
  const uid = useId();
  const inviteSectionId = `${uid}-invite`;
  const errorId = `${uid}-error`;

  const [uncontrolledLink, setUncontrolledLink] = useState(defaultLinkEnabled);
  const linkEnabled = controlledLink ?? uncontrolledLink;

  const [uncontrolledInvitees, setUncontrolledInvitees] =
    useState<readonly Invitee[]>(defaultInvitees);
  const invitees = controlledInvitees ?? uncontrolledInvitees;

  const [draft, setDraft] = useState("");
  const [staged, setStaged] = useState<Invitee | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const seq = useRef(0);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The original left this timer running past unmount.
  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );

  const setLinkEnabled = useCallback(
    (next: boolean) => {
      if (controlledLink === undefined) setUncontrolledLink(next);
      onLinkEnabledChange?.(next);
    },
    [controlledLink, onLinkEnabledChange],
  );

  const setInvitees = useCallback(
    (next: readonly Invitee[]) => {
      if (controlledInvitees === undefined) setUncontrolledInvitees(next);
      onInviteesChange?.(next);
    },
    [controlledInvitees, onInviteesChange],
  );

  /** Build an invitee with a fresh identity of its own. */
  const makeInvitee = useCallback(
    (email: string): Invitee => {
      seq.current += 1;
      const resolved = resolveInvitee?.(email);
      return {
        id: `${uid}-${seq.current}`,
        email,
        name: resolved?.name ?? email.split("@")[0].split(".")[0],
        avatarUrl: resolved?.avatarUrl,
      };
    },
    [resolveInvitee, uid],
  );

  /** Validate and tokenise. Returns the chip, or null with `error` set. */
  const stage = useCallback(
    (raw: string): Invitee | null => {
      const email = raw.trim().toLowerCase();
      if (!EMAIL.test(email)) {
        setError("Enter a complete email address.");
        return null;
      }
      if (invitees.some((entry) => entry.email === email)) {
        // Without this the same address can exist twice, and two elements end
        // up claiming one `layoutId` — see the note on the chip below.
        setError("That address has already been invited.");
        return null;
      }
      setError(null);
      const invitee = makeInvitee(email);
      setStaged(invitee);
      setDraft("");
      return invitee;
    },
    [invitees, makeInvitee],
  );

  const commit = useCallback(
    (invitee: Invitee) => {
      setInvitees([...invitees, invitee]);
      setStaged(null);
      setError(null);
    },
    [invitees, setInvitees],
  );

  /*
   * The button commits whatever is pending, staged or not. The original only
   * looked at the staged chip, so typing an address and pressing the button
   * labelled "Invite" did nothing at all — the chip was an undocumented
   * prerequisite rather than a convenience.
   */
  const handleInvite = useCallback(() => {
    if (staged) {
      commit(staged);
      inputRef.current?.focus();
      return;
    }
    if (draft.trim() === "") {
      setError("Enter an email address to invite.");
      inputRef.current?.focus();
      return;
    }
    const invitee = stage(draft);
    if (invitee) commit(invitee);
    inputRef.current?.focus();
  }, [commit, draft, staged, stage]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard?.writeText(url);
    } catch {
      // Insecure origins and denied permissions both land here. The button
      // simply does not confirm, rather than throwing into the console.
      return;
    }
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 1300);
  }, [url]);

  const removeInvitee = useCallback(
    (id: string) => {
      // By id, not by address: filtering on equality removes every copy.
      setInvitees(invitees.filter((entry) => entry.id !== id));
    },
    [invitees, setInvitees],
  );

  return (
    <div
      // `w-full min-w-0` is load-bearing. Without it this wrapper is sized by
      // its own content, so the card's `w-full` resolves against a box that
      // shrinks the moment the invite section unmounts — and the whole card
      // visibly narrows on toggle. The card's width should be a property of
      // the space it is in, never of what is currently inside it.
      className={cn("flex w-full min-w-0 justify-center p-4", className)}
      {...rest}
    >
      <div
        className={cn(
          "flex w-full max-w-sm flex-col gap-2.5 rounded-lg border border-border",
          "bg-surface px-3 py-2.5 shadow-md",
        )}
      >
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-content">{title}</h2>

          <div className="flex items-center justify-between gap-3 rounded-lg bg-surface-subtle p-2 pr-3.5">
            <div className="flex min-w-0 items-center gap-2">
              <span className="rounded-md bg-surface p-1.5 shadow-sm">
                <Globe
                  className="size-7 text-content-muted"
                  aria-hidden="true"
                />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-base leading-4 font-medium text-content">
                  {linkLabel}
                </span>
                {/*
                  Wraps rather than truncating. The card is now sized by the
                  space it is in rather than by its own contents, so in a narrow
                  column this line no longer fits on one row — and half a
                  sentence is worse than two lines of a short one.
                */}
                <span className="text-sm text-balance text-content-subtle">
                  {linkDescription}
                </span>
              </span>
            </div>

            {/*
              A real switch. It was a `button` with `aria-pressed` whose knob
              sat on the left when on and the right when off — so the control
              reported one state and drew the opposite.
            */}
            <button
              type="button"
              role="switch"
              aria-checked={linkEnabled}
              aria-label={linkLabel}
              aria-controls={inviteSectionId}
              onClick={() => setLinkEnabled(!linkEnabled)}
              className={cn(
                "focus-ring relative inline-flex h-5 w-8 shrink-0 items-center",
                // 32x20 visually. The row has no room for a bigger track,
                // so the target grows through a pseudo-element instead.
                "before:absolute before:-inset-3.5 before:content-['']",
                "rounded-full transition-colors",
                // The off track carries the switch's shape against the card, so
                // it is a UI boundary and owes 3:1. `border-strong` gave 1.86:1
                // on a subtle-filled row — visible, but only just.
                linkEnabled ? "bg-accent" : "bg-content-subtle",
              )}
            >
              <span
                className={cn(
                  "inline-block size-4 rounded-full bg-surface transition-transform",
                  linkEnabled ? "translate-x-3.5" : "translate-x-0.5",
                )}
              />
            </button>
          </div>

          <div className="flex w-full items-center justify-between gap-2 rounded-sm bg-surface-subtle p-1 text-sm">
            <p className="truncate text-content-subtle">{url}</p>
            <motion.button
              type="button"
              onClick={handleCopy}
              whileTap={reduce ? undefined : { scale: 0.85 }}
              aria-label={copied ? "Link copied" : "Copy link"}
              className="focus-ring relative flex shrink-0 items-center justify-center rounded-sm before:absolute before:-inset-3.5 before:content-['']"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={copied ? "check" : "copy"}
                  initial={
                    reduce
                      ? { opacity: 0 }
                      : { opacity: 0, scale: 0.6, rotate: copied ? -45 : -15 }
                  }
                  animate={
                    reduce
                      ? { opacity: 1 }
                      : { opacity: 1, scale: 1, rotate: 0 }
                  }
                  exit={
                    reduce
                      ? { opacity: 0 }
                      : { opacity: 0, scale: 0.6, rotate: copied ? 45 : 15 }
                  }
                  transition={{
                    duration: reduce ? 0.01 : copied ? 0.16 : 0.17,
                  }}
                >
                  {copied ? (
                    <Check className="size-4 text-content-muted" />
                  ) : (
                    <Copy className="size-4 text-content-muted" />
                  )}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {linkEnabled && (
            <motion.div
              id={inviteSectionId}
              // `height: auto`, not the original's `maxHeight: 350`. That
              // number clipped the card once five people were invited, and it
              // had to be guessed again for every change to the contents.
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: "auto",
                opacity: 1,
                transition: reduce ? { duration: 0.01 } : EXPAND,
              }}
              exit={{
                height: 0,
                opacity: 0,
                transition: reduce ? { duration: 0.01 } : COLLAPSE,
              }}
              className="flex flex-col overflow-hidden"
            >
              <h3 className="mb-1 text-base font-medium text-content-muted">
                Invite
              </h3>

              <div
                className={cn(
                  "flex items-center gap-2 rounded-lg border bg-surface px-2 py-1",
                  "shadow-sm transition-colors",
                  error ? "border-danger" : "border-border",
                )}
              >
                <UserPlus
                  className="size-5 shrink-0 text-content-subtle"
                  aria-hidden="true"
                />

                <div className="flex min-w-0 flex-1 items-center">
                  <AnimatePresence mode="wait" initial={false}>
                    {staged ? (
                      <motion.span
                        key="chip"
                        /*
                          Keyed on the invitation's own id, not on the address.
                          The original used the email, which meant staging an
                          address already in the list gave two live elements
                          one `layoutId` — and Motion handed the projection to
                          one of them, so the existing row was visibly stolen
                          out of the list and flown into the field.
                        */
                        layoutId={`invitee-${staged.id}`}
                        transition={reduce ? { duration: 0.01 } : MORPH}
                        className={cn(
                          "flex items-center gap-1 rounded-full border border-border",
                          "bg-surface px-2 py-0.5 shadow",
                        )}
                      >
                        <motion.span layoutId={`avatar-${staged.id}`}>
                          <Avatar invitee={staged} className="size-5" />
                        </motion.span>
                        <motion.span
                          layoutId={`name-${staged.id}`}
                          layout="position"
                          transition={
                            reduce ? { duration: 0.01 } : { duration: 0.08 }
                          }
                          className="text-sm leading-[13px] font-medium text-content-muted capitalize"
                        >
                          {staged.name}
                        </motion.span>
                        <button
                          type="button"
                          onClick={() => {
                            setStaged(null);
                            inputRef.current?.focus();
                          }}
                          aria-label={`Remove ${staged.name}`}
                          className="focus-ring relative rounded-full text-content-subtle before:absolute before:-inset-3.5 before:content-[''] hover:text-content-muted"
                        >
                          <X className="size-4" aria-hidden="true" />
                        </button>
                      </motion.span>
                    ) : (
                      <motion.input
                        key="input"
                        ref={inputRef}
                        type="email"
                        value={draft}
                        aria-label="Email to invite"
                        aria-invalid={error ? true : undefined}
                        aria-describedby={error ? errorId : undefined}
                        onChange={(event) => {
                          setDraft(event.target.value);
                          if (error) setError(null);
                        }}
                        onKeyDown={(event) => {
                          if (event.key !== "Enter") return;
                          event.preventDefault();
                          stage(event.currentTarget.value);
                        }}
                        placeholder={placeholder}
                        // 16px, so iOS Safari does not zoom the card on focus.
                        className={cn(
                          "min-w-0 flex-1 bg-transparent text-base text-content-muted",
                          "placeholder-content-subtle outline-none",
                          // The field is the target here, not the row around
                          // it: clicking the row's padding does not focus an
                          // input that is only as tall as its own text.
                          "self-stretch py-2.5",
                        )}
                      />
                    )}
                  </AnimatePresence>
                </div>

                <button
                  type="button"
                  onClick={handleInvite}
                  className={cn(
                    "focus-ring relative left-1 flex shrink-0 items-center gap-0.5",
                    "relative rounded-md bg-accent px-2 py-[3px] text-sm text-accent-content",
                    "before:absolute before:-inset-y-2.5 before:-inset-x-0 before:content-['']",
                  )}
                >
                  <Send className="size-4" aria-hidden="true" />
                  Invite
                </button>
              </div>

              {/*
                Announced, not just coloured. Pressing Enter on a malformed
                address used to do nothing whatsoever.
              */}
              <p
                id={errorId}
                role="status"
                aria-live="polite"
                className={cn(
                  "mt-1 text-xs text-danger",
                  error ? "block" : "sr-only",
                )}
              >
                {error ?? ""}
              </p>

              <ul className="mt-3 flex list-none flex-col gap-2">
                <AnimatePresence initial={false}>
                  {invitees.map((invitee) => (
                    <motion.li
                      key={invitee.id}
                      layoutId={`invitee-${invitee.id}`}
                      exit={
                        reduce
                          ? { opacity: 0 }
                          : {
                              opacity: 0,
                              scale: 0.9,
                              transition: { duration: 0.2 },
                            }
                      }
                      transition={reduce ? { duration: 0.01 } : MORPH}
                      className={cn(
                        "flex items-center justify-between gap-2 rounded-lg",
                        "border border-border p-2 shadow-sm",
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <motion.span layoutId={`avatar-${invitee.id}`}>
                          <Avatar invitee={invitee} className="size-8" />
                        </motion.span>
                        <span className="flex min-w-0 flex-col">
                          <motion.span
                            layoutId={`name-${invitee.id}`}
                            layout="position"
                            className="text-sm leading-[13px] font-medium text-content capitalize"
                          >
                            {invitee.name}
                          </motion.span>
                          <span className="truncate text-xs text-content-subtle">
                            {invitee.email}
                          </span>
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => removeInvitee(invitee.id)}
                        aria-label={`Remove ${invitee.name}`}
                        className="focus-ring relative shrink-0 rounded-sm text-sm text-danger/70 before:absolute before:-inset-3 before:content-[''] hover:text-danger"
                      >
                        Remove
                      </button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default InviteCard;
