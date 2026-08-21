"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Pause, Play } from "lucide-react";

import { cn } from "@/lib/cn";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

export interface VoiceTranscriptProps extends React.ComponentPropsWithoutRef<"div"> {
  /** The words revealed in time with playback. */
  transcript?: string;
  /** Length of the note in seconds. @default 4 */
  durationSeconds?: number;
  /** Bar heights in px. Any length — the sweep is proportional. */
  waveform?: readonly number[];
}

/* -------------------------------------------------------------------------- */
/* Motion — kept verbatim from the original                                    */
/* -------------------------------------------------------------------------- */

const softSpring = {
  type: "spring" as const,
  stiffness: 290,
  damping: 30,
  mass: 1,
};
const layoutSpring = {
  type: "spring" as const,
  stiffness: 320,
  damping: 28,
  mass: 1,
};
const blurTransition = { duration: 0.22, ease: "easeOut" as const };

/** The reveal's ease. A strong out-curve, so each word lands rather than drifts. */
const WORD_EASE = [0.22, 1, 0.36, 1] as const;

const TICK_MS = 50;

const DEFAULT_WAVEFORM = [
  3, 5, 9, 14, 20, 26, 18, 10, 22, 30, 24, 14, 8, 18, 28, 34, 26, 16, 10, 20,
  30, 22, 12, 6, 16, 24, 18, 10, 4, 8, 14, 20, 26, 18, 8, 4,
];

const DEFAULT_TRANSCRIPT =
  "Hey! Just brewed a fresh cup of coffee. Would you like to have some? I'm sure you'd love it ☕";

/* -------------------------------------------------------------------------- */
/* Icon                                                                        */
/* -------------------------------------------------------------------------- */

/** Speech bubble with transcript lines. `currentColor` throughout, so it themes. */
function TranscribeIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 21 21"
      fill="none"
      aria-hidden="true"
      className="text-content"
    >
      <path
        d="M2 3.5C2 2.67 2.67 2 3.5 2h14C18.33 2 19 2.67 19 3.5v10c0 .83-.67 1.5-1.5 1.5H7.5L4 19v-4H3.5C2.67 15 2 14.33 2 13.5V3.5Z"
        fill="currentColor"
        fillOpacity={0.09}
        stroke="currentColor"
        strokeOpacity={0.55}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {[6.5, 9, 11.5].map((y, i) => (
        <line
          key={y}
          x1="5.5"
          y1={y}
          x2={[15.5, 13, 11][i]}
          y2={y}
          stroke="currentColor"
          strokeOpacity={0.75}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * A voice note that reads itself out in text as it plays.
 *
 * A voice note is opaque: you cannot skim it, cannot search it, and cannot tell
 * whether it is worth forty seconds until you have spent them. Sweeping the
 * transcript in time with playback lets you read ahead, skip, or read instead
 * of listening — and makes the note usable somewhere you cannot play audio.
 */
export function VoiceTranscript({
  transcript = DEFAULT_TRANSCRIPT,
  durationSeconds = 4,
  waveform = DEFAULT_WAVEFORM,
  className,
  ...rest
}: VoiceTranscriptProps) {
  const reduce = useReducedMotion();
  const uid = useId();
  const bubbleId = `${uid}-transcript`;

  const words = transcript.split(" ");

  const [showTranscript, setShowTranscript] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  /*
   * One clock. The original ran a second interval for the word reveal, keyed
   * only on whether the transcript was open — so pausing the audio left the
   * words marching on, and the transcript drifted out of sync with the sound
   * it was supposed to be transcribing. Deriving the count from progress makes
   * that desync unrepresentable, and removes an effect with a stale closure
   * over the count it was incrementing.
   */
  const visibleWords = Math.floor(progress * words.length);
  const secondsLeft = Math.max(0, Math.ceil(durationSeconds * (1 - progress)));

  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => {
      setProgress((p) => {
        const next = p + TICK_MS / (durationSeconds * 1000);
        if (next >= 1) {
          setPlaying(false);
          return 1;
        }
        return next;
      });
    }, TICK_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing, durationSeconds]);

  /*
   * Read the current values and set all three, rather than nesting the other
   * two setters inside a `setShowTranscript` updater. An updater has to be a
   * pure function of the previous state: React is free to call it more than
   * once, and the setters smuggled inside it fire on every one of those calls.
   */
  const toggleTranscript = useCallback(() => {
    const next = !showTranscript;
    setShowTranscript(next);
    setProgress(0);
    setPlaying(next);
  }, [showTranscript]);

  const togglePlay = useCallback(() => {
    // Finished notes replay from the top rather than refusing to move.
    if (progress >= 1) setProgress(0);
    setPlaying((p) => !p);
  }, [progress]);

  return (
    <div
      className={cn(
        "flex w-full min-w-0 items-center justify-center px-4 pt-8",
        className,
      )}
      {...rest}
    >
      <div className="relative flex min-w-0 items-center gap-2.5">
        <AnimatePresence>
          {showTranscript && (
            <motion.div
              key="bubble"
              id={bubbleId}
              initial={
                reduce ? { opacity: 0 } : { opacity: 0, scale: 0.86, y: 8 }
              }
              animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 6 }}
              transition={
                reduce
                  ? { duration: 0.01 }
                  : { ...softSpring, opacity: blurTransition }
              }
              className="absolute bottom-full left-0 mb-4 w-[300px] max-w-[calc(100vw-3rem)]"
              style={{ transformOrigin: "bottom left" }}
            >
              <div className="relative rounded-[28px] rounded-bl-[8px] bg-surface-subtle px-5 py-4 shadow-floating">
                {/*
                  A bezier teardrop rather than a bordered triangle, so the tail
                  reads as part of the bubble. `currentColor` keeps it matched
                  to the bubble's fill in both themes — a hardcoded hex here
                  detaches the moment the theme flips.
                */}
                <svg
                  className="absolute -bottom-[13px] left-[10px] text-surface-subtle"
                  width="24"
                  height="14"
                  viewBox="0 0 24 14"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M0 0 C2 5 5 11 9 13 C11 9 16 4 24 0 Z"
                    fill="currentColor"
                  />
                </svg>

                <p className="text-[15px] leading-[1.6] text-content select-none">
                  {words.map((word, i) => (
                    <motion.span
                      key={`${word}-${i}`}
                      /*
                       * Unrevealed words sit at 0.07 opacity rather than being
                       * absent, so the bubble is its final height from the
                       * first word and the tail never moves. The blur burning
                       * off is what makes it read as ink arriving rather than
                       * as a row of opacity fades.
                       */
                      animate={
                        reduce
                          ? { opacity: i < visibleWords ? 1 : 0.25 }
                          : {
                              opacity: i < visibleWords ? 1 : 0.07,
                              filter:
                                i < visibleWords ? "blur(0px)" : "blur(3px)",
                            }
                      }
                      transition={
                        reduce
                          ? { duration: 0.01 }
                          : { duration: 0.28, ease: WORD_EASE }
                      }
                      className="mr-[0.28em] inline-block"
                    >
                      {word}
                    </motion.span>
                  ))}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={toggleTranscript}
          aria-label={showTranscript ? "Hide transcript" : "Show transcript"}
          aria-expanded={showTranscript}
          aria-controls={showTranscript ? bubbleId : undefined}
          whileHover={reduce ? undefined : { scale: 1.06 }}
          whileTap={reduce ? undefined : { scale: 0.93 }}
          className={cn(
            "focus-ring grid size-[52px] shrink-0 cursor-pointer place-items-center",
            "rounded-full bg-surface-subtle shadow-resting",
          )}
        >
          <TranscribeIcon />
        </motion.button>

        <motion.div
          layout
          transition={reduce ? { duration: 0.01 } : layoutSpring}
          className="flex min-w-0 items-center gap-2.5 rounded-full bg-surface-subtle px-3.5 py-3 shadow-resting"
        >
          <motion.button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? "Pause" : "Play"}
            whileHover={reduce ? undefined : { scale: 1.1 }}
            whileTap={reduce ? undefined : { scale: 0.88 }}
            className="focus-ring grid size-7 shrink-0 cursor-pointer place-items-center rounded-full"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={playing ? "pause" : "play"}
                aria-hidden="true"
                initial={
                  reduce
                    ? { opacity: 0 }
                    : { scale: 0.5, opacity: 0, filter: "blur(6px)" }
                }
                animate={
                  reduce
                    ? { opacity: 1 }
                    : { scale: 1, opacity: 1, filter: "blur(0px)" }
                }
                exit={
                  reduce
                    ? { opacity: 0 }
                    : { scale: 0.5, opacity: 0, filter: "blur(6px)" }
                }
                transition={
                  reduce
                    ? { duration: 0.01 }
                    : {
                        ...softSpring,
                        filter: blurTransition,
                        opacity: blurTransition,
                      }
                }
                className="grid place-items-center text-content"
              >
                {playing ? (
                  <Pause className="size-5 fill-current" strokeWidth={2.5} />
                ) : (
                  <Play className="size-5 fill-current" strokeWidth={2.5} />
                )}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          {/*
            Decorative. The progressbar below carries the position, and reading
            out thirty-six bars would be noise rather than information.
          */}
          <div
            aria-hidden="true"
            className="flex items-center gap-[3px]"
            style={{ height: 38 }}
          >
            {waveform.map((height, i) => (
              <span
                key={i}
                style={{ height }}
                className={cn(
                  "w-[3px] shrink-0 rounded-full",
                  "transition-colors duration-[280ms] ease-out",
                  i / waveform.length < progress
                    ? "bg-content"
                    : "bg-border-strong",
                )}
              />
            ))}
          </div>

          <div
            role="progressbar"
            aria-label="Playback position"
            aria-valuemin={0}
            aria-valuemax={durationSeconds}
            aria-valuenow={Math.round(durationSeconds * progress)}
            aria-valuetext={`${secondsLeft} seconds remaining`}
            className="w-6 shrink-0 text-center"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={secondsLeft}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: -5 }}
                animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: 5 }}
                transition={
                  reduce
                    ? { duration: 0.01 }
                    : { duration: 0.18, ease: "easeOut" }
                }
                className="block text-[13.5px] font-semibold tabular-nums text-content-subtle select-none"
              >
                {secondsLeft}s
              </motion.span>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default VoiceTranscript;
