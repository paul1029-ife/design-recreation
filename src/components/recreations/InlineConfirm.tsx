import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import { IconCalendar01 } from "../icons/IconCalendar01";

type Stage = "idle" | "pending" | "confirmed";

const layoutSpring = {
  type: "spring" as const,
  stiffness: 280,
  damping: 30,
  mass: 1,
};

const stageVariants = {
  initial: { opacity: 0, filter: "blur(5px)" },
  animate: { opacity: 1, filter: "blur(0px)" },
  exit: { opacity: 0, filter: "blur(5px)" },
};

const stageTransition = {
  layout: layoutSpring,
  opacity: { duration: 0.2, ease: "easeOut" as const },
  filter: { duration: 0.25, ease: "easeOut" as const },
};



export default function InlineConfirm() {
  const [stage, setStage] = useState<Stage>("idle");

  useEffect(() => {
    if (stage !== "pending") return;
    const id = setTimeout(() => setStage("confirmed"), 3000);
    return () => clearTimeout(id);
  }, [stage]);

  useEffect(() => {
    if (stage !== "confirmed") return;
    const id = setTimeout(() => setStage("idle"), 2000);
    return () => clearTimeout(id);
  }, [stage]);

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <motion.div
        layout
        transition={layoutSpring}
        className="flex items-center gap-1.5 bg-white rounded-full h-13 px-3 shadow-[0_4px_24px_rgba(0,0,0,0.07)]"
        style={{ willChange: "transform", minWidth: 280 }}
      >
        <div className="bg-[#efefef] rounded-full p-1">
          <IconCalendar01 width={29} height={29} color="#111" />
        </div>

        <span className="text-black font-regular text-base flex-1 select-none">
          Calendar
        </span>

        <AnimatePresence mode="wait" initial={false}>
          {stage === "idle" && (
            <motion.button
              key="idle"
              layoutId="action"
              variants={stageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={stageTransition}
              onClick={() => setStage("pending")}
              className="bg-[#efefef] rounded-full px-4 h-7.5 text-[#111] font-medium text-sm whitespace-nowrap flex-shrink-0 cursor-pointer"
            >
              Sync Events
            </motion.button>
          )}

          {stage === "pending" && (
            <motion.div
              key="pending"
              layoutId="action"
              variants={stageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={stageTransition} className="flex items-center justify-center bg-[#efefef] rounded-full px-2 h-7.5 text-[#111] font-medium text-sm whitespace-nowrap flex-shrink-0 cursor-pointer"
            >
              <motion.div
                className="rounded-full bg-[#111] overflow-hidden relative flex-shrink-0"
                style={{ width: 90, height: 7 }}
              >
                <motion.span
                  className="absolute top-1/2 -translate-y-1/2 w-8 h-[7px] bg-white rounded-full"
                  style={{ left: 0 }}
                  animate={{ x: [-3, 63] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            </motion.div>
          )}

          {stage === "confirmed" && (
            <motion.div
              key="confirmed"
              layoutId="action"
              layout="preserve-aspect"
              variants={stageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={stageTransition}
              className="w-8.5 h-8.5 rounded-full bg-[#efefef] flex items-center justify-center flex-shrink-0 overflow-hidden relative"
            >
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.18, type: "spring", stiffness: 340, damping: 26 }}
              >
                <Check className="w-6 h-6 p-1 text-white bg-black rounded-full" strokeWidth={2.2} />
              </motion.div>
              <motion.div
                initial={{ x: "-130%" }}
                animate={{ x: "230%" }}
                transition={{ delay: 0.55, duration: 0.55, ease: "easeInOut" }}
                className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
