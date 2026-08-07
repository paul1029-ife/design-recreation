"use client";

import { useState } from "react";
import {
  ArrowRight,
  AudioWaveform,
  Mic2,
  Music2,
  Scissors,
  Sparkle,
  Timer,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const ContextualBar = () => {
  const [musicOn, setMusicOn] = useState(true);
  const [inputValue, setInputValue] = useState("");

  return (
    <div className="w-96 py-3 flex items-center justify-center">
      <motion.div
        layout
        transition={{
          type: "spring",
          stiffness: 110,
          damping: 10,
        }}
        className="bg-surface-subtle w-fit px-2 py-1.5 flex items-center gap-1 shadow-md overflow-hidden"
        style={{ borderRadius: 24, willChange: "transform" }}
      >
        <motion.div
          layout="position"
          className="bg-surface rounded-full px-2 py-1 flex items-center gap-2 shadow-sm relative z-10"
        >
          <Music2
            className={`p-1.5 rounded-full size-7 cursor-pointer transition-colors duration-300 ${
              musicOn ? "text-content bg-surface-hover" : "text-content-muted"
            }`}
            onClick={() => setMusicOn(true)}
          />
          <Sparkle
            className={`p-1.5 rounded-full size-7 cursor-pointer transition-colors duration-300 ${
              musicOn ? "text-content-muted" : "text-content bg-surface-hover"
            }`}
            onClick={() => setMusicOn(false)}
          />
        </motion.div>

        <AnimatePresence mode="popLayout" initial={false}>
          {musicOn ? (
            <motion.div
              key="input"
              layout
              initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -20, filter: "blur(4px)" }}
              transition={{
                duration: 0.2,
                ease: "easeOut",
              }}
              className="flex items-center justify-center pl-2 relative"
            >
              <input
                type="text"
                className="text-content-muted w-40 text-lg bg-transparent outline-none placeholder:text-content-subtle"
                placeholder="Refine with AI"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                style={{ caretColor: "#374151" }}
              />
              <motion.button
                layout
                className="bg-surface hover:bg-surface-subtle transition-colors rounded-full p-2 ml-2 shadow-sm"
              >
                <ArrowRight size={20} />
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="icons"
              layout
              initial={{ opacity: 0, x: 20, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: 20, filter: "blur(4px)" }}
              transition={{
                duration: 0.2,
                ease: "easeOut",
              }}
              className="flex gap-4 px-2"
              style={{ willChange: "transform" }}
            >
              <Scissors className="w-4 h-4 text-content" />
              <Timer className="w-4 h-4 text-content" />
              <Mic2 className="w-4 h-4 text-content" />
              <AudioWaveform className="w-4 h-4 text-content" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ContextualBar;
