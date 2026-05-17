import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bell, Plus } from "lucide-react";
import { IconCalendar01 } from "../icons/IconCalendar01";


const spring = {
  type: "spring" as const,
  stiffness: 406,
  damping: 22,
  mass: 1,
};

const blurTransition = { duration: 0.22, ease: "easeOut" as const };

const pillVariants = (xOffset: number) => ({
  hidden: { x: xOffset, opacity: 0, filter: "blur(12px)" },
  show: { x: 0, opacity: 1, filter: "blur(0px)" },
});

export default function SplitActions() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-[170px] w-74">
      <AnimatePresence mode="popLayout">
        {!expanded ? (
          <motion.button
            key="add"
            initial={{ scale: 0.5, opacity: 0, filter: "blur(12px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            exit={{ scale: 0.5, opacity: 0, filter: "blur(12px)" }}
            transition={{
              ...spring,
              filter: blurTransition,
              opacity: blurTransition,
            }}
            onClick={() => setExpanded(true)}
            className="w-[45px] h-[45px] rounded-full bg-[#111] flex items-center justify-center cursor-pointer"
            style={{ willChange: "transform" }}
          >
            <Plus className="w-[23px] h-[23px] text-white" strokeWidth={2.5} />
          </motion.button>
        ) : (
          <motion.div
            key="actions"
            className="flex items-center gap-3"
            initial="hidden"
            animate="show"
            exit="hidden"
          >
            <motion.button
              variants={pillVariants(56)}
              transition={{ ...spring, filter: blurTransition, opacity: blurTransition }}
              style={{ willChange: "transform" }}
              onClick={() => setExpanded(false)}
              className="flex items-center gap-2 bg-[#eeeef2] rounded-full px-4 py-2.5 cursor-pointer"
            >
              <div className="w-[23px] h-[23px] rounded-[8px] bg-[#111] flex items-center justify-center flex-shrink-0">
                <IconCalendar01 />
              </div>
              <span className="text-[#111] font-semibold text-[15px] pr-0.5 select-none">
                Schedule
              </span>
            </motion.button>

            <motion.button
              variants={pillVariants(-56)}
              transition={{ ...spring, filter: blurTransition, opacity: blurTransition }}
              style={{ willChange: "transform" }}
              onClick={() => setExpanded(false)}
              className="flex items-center gap-2 bg-[#eeeef2] rounded-full px-4 py-2.5 cursor-pointer"
            >
              <Bell
                className="w-[18px] h-[18px] text-[#111] flex-shrink-0"
                strokeWidth={2}
                fill="#111"
              />
              <span className="text-[#111] font-semibold text-[15px] pr-0.5 select-none">
                Remind
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
