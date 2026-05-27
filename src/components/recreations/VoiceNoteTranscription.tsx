import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Play, Pause } from "lucide-react";

// ─── Shared spring / easing constants (aligned with repo conventions) ──────────
const layoutSpring = {
  type: "spring" as const,
  stiffness: 320,
  damping: 28,
  mass: 1,
};

const softSpring = {
  type: "spring" as const,
  stiffness: 220,
  damping: 24,
  mass: 1,
};

const blurTransition = { duration: 0.22, ease: "easeOut" as const };

// ─── Waveform bar heights (mimic real audio shape) ────────────────────────────
const BAR_HEIGHTS = [
  3, 5, 9, 14, 20, 26, 18, 10, 22, 30, 24, 14, 8, 18, 28, 34, 26, 16, 10, 20,
  30, 22, 12, 6, 16, 24, 18, 10, 4, 8, 14, 20, 26, 18, 8, 4,
];

const TOTAL_DURATION = 4; // seconds
const TRANSCRIPT =
  "Hey! Just brewed a fresh cup of coffee. Would you like to have some? I'm sure you'd love it ☕";

const WORDS = TRANSCRIPT.split(" ");

// ─── Transcribe icon — clean speech-bubble with inner transcript lines ────────
function TranscribeIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 21 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 3.5C2 2.67 2.67 2 3.5 2h14C18.33 2 19 2.67 19 3.5v10c0 .83-.67 1.5-1.5 1.5H7.5L4 19v-4H3.5C2.67 15 2 14.33 2 13.5V3.5Z"
        fill="rgba(26,26,26,0.09)"
        stroke="rgba(26,26,26,0.55)"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <line
        x1="5.5"
        y1="6.5"
        x2="15.5"
        y2="6.5"
        stroke="rgba(26,26,26,0.75)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <line
        x1="5.5"
        y1="9"
        x2="13"
        y2="9"
        stroke="rgba(26,26,26,0.75)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <line
        x1="5.5"
        y1="11.5"
        x2="11"
        y2="11.5"
        stroke="rgba(26,26,26,0.75)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─── Individual waveform bar — fixed height, only colour sweeps ───────────────
function WaveBar({
  height,
  index,
  progress,
  totalBars,
}: {
  height: number;
  index: number;
  progress: number;
  totalBars: number;
}) {
  const isPlayed = index / totalBars < progress;
  const barColor = isPlayed ? "#1a1a1a" : "#c8c8d0";

  return (
    <motion.div
      className="rounded-full flex-shrink-0"
      style={{ width: 3, height, willChange: "background-color" }}
      animate={{ backgroundColor: barColor }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    />
  );
}

// ─── Transcription bubble — bubbly rounded shape with organic curved tail ──────
function TranscriptionBubble({ visibleCount }: { visibleCount: number }) {
  return (
    <motion.div
      key="bubble"
      initial={{ opacity: 0, scale: 0.86, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 6 }}
      transition={{ ...softSpring, opacity: blurTransition }}
      className="absolute bottom-full left-0 mb-4 w-[300px]"
      style={{ transformOrigin: "bottom left" }}
    >
      <div className="relative bg-[#ececf0] rounded-[28px] rounded-bl-[8px] px-5 py-4 shadow-[0_6px_32px_rgba(0,0,0,0.10)]">
        {/*
          Organic curved tail — a smooth bezier teardrop replacing the
          hard CSS-border triangle, so the bubble feels genuinely bubbly.
        */}
        <svg
          className="absolute -bottom-[13px] left-[10px]"
          width="24"
          height="14"
          viewBox="0 0 24 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/*
            Path anatomy:
            - Starts at top-left (0 0) — flush with bubble bottom-left corner
            - Cubic curve sweeps down to the tail tip at (9 13)
            - Second cubic curves back up-right to top-right (24 0)
            This gives a teardrop/comma shape that feels organic.
          */}
          <path d="M0 0 C2 5 5 11 9 13 C11 9 16 4 24 0 Z" fill="#ececf0" />
        </svg>

        <p
          className="text-[15px] leading-[1.6] text-[#1a1a1a] select-none"
          style={{ fontFamily: "Inter, Some-Sans, sans-serif" }}
        >
          {WORDS.map((word, i) => (
            <motion.span
              key={i}
              // Ghost state: nearly invisible + slightly blurry so the bubble
              // height is stable. Revealed state: sharp + fully opaque.
              // The blur→sharp transition is what creates the sweep "ink filling
              // in" feel rather than a monotone opacity fade.
              animate={{
                opacity: i < visibleCount ? 1 : 0.07,
                filter: i < visibleCount ? "blur(0px)" : "blur(3px)",
              }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block mr-[0.28em]"
            >
              {word}
            </motion.span>
          ))}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function VoiceNoteTranscription() {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_DURATION);
  const [visibleWordCount, setVisibleWordCount] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Playback ticker ──────────────────────────────────────────────────────
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          const next = p + 1 / (TOTAL_DURATION * 20);
          if (next >= 1) {
            setIsPlaying(false);
            setTimeLeft(0);
            clearInterval(intervalRef.current!);
            return 1;
          }
          setTimeLeft(Math.ceil(TOTAL_DURATION * (1 - next)));
          return next;
        });
      }, 50);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);

  // ── Word-by-word colour reveal ───────────────────────────────────────────
  useEffect(() => {
    if (isTranscribing && visibleWordCount < WORDS.length) {
      const msPerWord = (TOTAL_DURATION * 1000) / WORDS.length;
      wordTimerRef.current = setInterval(() => {
        setVisibleWordCount((c) => {
          const next = c + 1;
          if (next >= WORDS.length) clearInterval(wordTimerRef.current!);
          return next;
        });
      }, msPerWord * 0.92);
    }
    return () => {
      if (wordTimerRef.current) clearInterval(wordTimerRef.current);
    };
  }, [isTranscribing]);

  // ── Trigger — toggle open/close ──────────────────────────────────────────
  const handleTranscribe = () => {
    if (isTranscribing) {
      // Close: stop playback and hide bubble
      setIsTranscribing(false);
      setIsPlaying(false);
      setProgress(0);
      setTimeLeft(TOTAL_DURATION);
      setVisibleWordCount(0);
    } else {
      // Open: start playback and begin word reveal
      setIsTranscribing(true);
      setIsPlaying(true);
      setProgress(0);
      setTimeLeft(TOTAL_DURATION);
      setVisibleWordCount(0);
    }
  };

  const handlePlayPause = () => {
    if (progress >= 1) {
      setProgress(0);
      setTimeLeft(TOTAL_DURATION);
      setIsPlaying(true);
      if (isTranscribing) setVisibleWordCount(0);
    } else {
      setIsPlaying((p) => !p);
    }
  };

  const showBubble = isTranscribing;

  return (
    <div
      className="flex items-center justify-center min-h-[260px] w-full px-4 pt-8"
      style={{ fontFamily: "Inter, Some-Sans, sans-serif" }}
    >
      {/* 
        The relative wrapper is the anchor for the absolute bubble.
        The player row itself never moves — bubble grows upward outside flow.
      */}
      <div className="relative flex items-center gap-2.5">
        {/* ── Transcription bubble — floats above, zero layout impact ──────── */}
        <AnimatePresence>
          {showBubble && (
            <TranscriptionBubble visibleCount={visibleWordCount} />
          )}
        </AnimatePresence>

        {/* ── Transcribe button — neutral colour always, icon never changes ── */}
        <motion.button
          onClick={handleTranscribe}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.93 }}
          className="w-[52px] h-[52px] rounded-full bg-[#ececf0] shadow-[0_2px_10px_rgba(0,0,0,0.08)] flex items-center justify-center flex-shrink-0 cursor-pointer"
          style={{ willChange: "transform" }}
          aria-label={
            isTranscribing ? "Close transcription" : "Transcribe voice note"
          }
        >
          <TranscribeIcon />
        </motion.button>

        {/* ── Voice note player pill ────────────────────────────────────────── */}
        <motion.div
          layout
          transition={layoutSpring}
          className="flex items-center gap-2.5 bg-[#ececf0] rounded-full px-3.5 py-3 shadow-[0_2px_14px_rgba(0,0,0,0.07)]"
          style={{ willChange: "transform" }}
        >
          {/* Play / Pause toggle */}
          <motion.button
            onClick={handlePlayPause}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.88 }}
            className="w-7 h-7 flex items-center justify-center flex-shrink-0 cursor-pointer"
            aria-label={isPlaying ? "Pause" : "Play"}
            style={{ willChange: "transform" }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isPlaying ? (
                <motion.span
                  key="pause"
                  initial={{ scale: 0.5, opacity: 0, filter: "blur(6px)" }}
                  animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                  exit={{ scale: 0.5, opacity: 0, filter: "blur(6px)" }}
                  transition={{
                    ...softSpring,
                    filter: blurTransition,
                    opacity: blurTransition,
                  }}
                >
                  <Pause
                    className="w-5 h-5 text-[#1a1a1a]"
                    strokeWidth={2.5}
                    fill="#1a1a1a"
                  />
                </motion.span>
              ) : (
                <motion.span
                  key="play"
                  initial={{ scale: 0.5, opacity: 0, filter: "blur(6px)" }}
                  animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                  exit={{ scale: 0.5, opacity: 0, filter: "blur(6px)" }}
                  transition={{
                    ...softSpring,
                    filter: blurTransition,
                    opacity: blurTransition,
                  }}
                >
                  <Play
                    className="w-5 h-5 text-[#1a1a1a]"
                    strokeWidth={2.5}
                    fill="#1a1a1a"
                  />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Waveform bars — fixed heights, only color sweeps */}
          <div className="flex items-center gap-[3px]" style={{ height: 38 }}>
            {BAR_HEIGHTS.map((h, i) => (
              <WaveBar
                key={i}
                index={i}
                height={h}
                progress={progress}
                totalBars={BAR_HEIGHTS.length}
              />
            ))}
          </div>

          {/* Duration countdown */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={timeLeft}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="text-[13.5px] font-semibold text-[#6b6b7a] select-none flex-shrink-0 w-6 text-center"
            >
              {timeLeft}s
            </motion.span>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
