import { Ellipsis, X, Save, Copy, Share, Trash2 } from "lucide-react";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  type Transition,
} from "motion/react";
import { useState } from "react";
import useMeasure from "react-use-measure";

const InlineOverflow = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [ref, bounds] = useMeasure({ offsetSize: false });
  const SPRING_TRANSITION: Transition = {
    type: "spring",

    stiffness: 200,
    damping: 18,
  };

  return (
    <div
      className="flex flex-col items-center justify-center py-2 px-4 gap-8"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      <MotionConfig transition={SPRING_TRANSITION}>
        <motion.div
          animate={{
            width: isOpen ? bounds.width : 210,
          }}
          className="bg-stone-500 rounded-full shadow-lg"
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 14,
          }}
        >
          <div className="flex items-center justify-center overflow-hidden">
            <div
              className=" gap-1.5 flex items-center text-sm font-semibold p-1.5 "
              ref={ref}
            >
              <motion.div
                className="flex items-center justify-center gap-1.5"
                layout="position"
              >
                <motion.div
                  whileTap={{ scale: 0.8 }}
                  className="bg-white rounded-4xl px-3 py-2 flex items-center justify-center gap-1.5 shadow-sm hover:shadow-stone-300 hover:-translate-y-0.5 cursor-pointer transition-all ease-out"
                >
                  <Save className="size-3.5" />
                  Save
                </motion.div>
                <motion.div
                  whileTap={{ scale: 0.8 }}
                  className="bg-white rounded-4xl px-3 py-2 flex items-center justify-center gap-1.5 shadow-sm hover:shadow-stone-300 hover:-translate-y-0.5 cursor-pointer transition-all ease-out"
                >
                  <Copy className="size-3.5" />
                  Copy
                </motion.div>
              </motion.div>

              <AnimatePresence mode="popLayout">
                {isOpen && (
                  <motion.div
                    className="flex items-center gap-1.5 "
                    initial={{
                      opacity: 0,
                      filter: "blur(4px)",
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      x: 0,
                      animationDelay: 10,
                      filter: "blur(0px)",
                    }}
                    exit={{
                      opacity: 0,
                      filter: "blur(4px)",
                      z: -10,
                    }}
                    transition={{
                      duration: 0.15,
                      ease: "easeOut",
                    }}
                  >
                    <motion.div
                      whileTap={{ scale: 0.8 }}
                      className="bg-white rounded-4xl px-3 py-2 flex items-center justify-center gap-1.5 shadow-sm hover:shadow-stone-300 hover:-translate-y-0.5 cursor-pointer transition-all ease-out"
                    >
                      <Share className="size-3.5" />
                      Share
                    </motion.div>
                    <motion.div
                      whileTap={{ scale: 0.8 }}
                      className="bg-white rounded-4xl px-3 py-2 flex items-center justify-center gap-1.5 shadow-sm hover:shadow-stone-300 hover:-translate-y-0.5 cursor-pointer transition-all ease-out"
                    >
                      <Trash2 className="size-3.5" />
                      Delete
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                className="bg-white rounded-4xl size-7 flex items-center justify-center cursor-pointer z-10 shadow-sm"
                onClick={() => setIsOpen(!isOpen)}
                layout="position"
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={isOpen ? "x" : "elipsis"}
                    initial={{
                      opacity: 0,
                      scale: 0.25,
                      filter: "blur(4px)",
                    }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
                    transition={{
                      type: "spring",
                      duration: 0.4,
                      bounce: 0,
                    }}
                  >
                    {!isOpen ? (
                      <Ellipsis className="text-neutral-900 size-4" />
                    ) : (
                      <X className="text-neutral-500 size-4" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </MotionConfig>
    </div>
  );
};

export default InlineOverflow;
